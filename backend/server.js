const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

const http = require('http');
const socketModule = require('./socket');
const { execSync } = require('child_process');
const Message = require('./models/Message');
const Project = require('./models/Project');
const { createNotification } = require('./controllers/notificationController');
const { recordActivity } = require('./controllers/activityController');


// Connect to MongoDB
connectDB().then(async () => {
  if (process.env.RUN_MIGRATIONS === 'true') {
    try {
      const projects = await Project.find();
      let migratedCount = 0;
      for (const project of projects) {
        if (project.createdBy && !project.members.some(m => m.toString() === project.createdBy.toString())) {
          project.members.push(project.createdBy);
          await project.save();
          migratedCount++;
        }
      }

      if (migratedCount > 0) console.log(`Project members migration: updated ${migratedCount} projects`);
    } catch (err) {
      console.error('Migration error:', err);
    }
  }
});


const app = express();


// 1. TRUST PROXY (Required for Render/Vercel deployments to handle rate limiting correctly)
app.set('trust proxy', 1);


// 2. CORS CONFIGURATION (Must be applied before any routes or other middleware)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://collabnest-obfx.vercel.app'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(`[CORS] Rejected origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
}));


const server = http.createServer(app);

// Initialize Socket.io via module
const io = socketModule.init(server, allowedOrigins);

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" } // Allow images/resources to be loaded cross-origin
}));
app.use(compression());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  message: { message: 'Too many authentication attempts from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply limiter only to authentication routes
app.use('/api/auth', limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Socket.io Events
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join project room for chat
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room: ${roomId}`);
  });

  // Join personal notification room
  socket.on('join_user_room', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${socket.id} joined personal room: user_${userId}`);
  });

  socket.on('send_message', async (data) => {
    try {
      const { projectId, senderId, senderName, message } = data;
      
      // Fetch project first for activity and notifications
      const project = await Project.findById(projectId).populate('members', '_id').populate('createdBy', '_id username');
      if (!project) return;

      const newMessage = await Message.create({ projectId, senderId, senderName, message });
      const populatedMessage = await Message.findById(newMessage._id).populate('senderId', 'username avatar');

      // Emit message to project room
      io.to(projectId).emit('receive_message', populatedMessage);

      // Record activity
      await recordActivity(senderId, projectId, 'message_sent', `Sent a message in project "${project.title}"`);


      // Notify all project members except sender
      const displayName = populatedMessage.senderId?.username || senderName || 'Someone';
      const allMembers = [
        ...(project.members || []).map(m => m._id.toString()),
        project.createdBy?._id?.toString()
      ].filter(Boolean);

      for (const memberId of allMembers) {
        if (memberId !== senderId.toString()) {
          await createNotification(io, {
            userId: memberId,
            type: 'chat_message',
            message: `${displayName} sent a message in project "${project.title}".`,
            projectId,
          });
        }
      }
    } catch (err) {
      console.error('Chat error:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Basic test route
app.get('/', (req, res) => {
  res.json({ message: 'CollabNest API is running...' });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/join-requests', require('./routes/joinRequestRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/activities', require('./routes/activityRoutes'));



// Message History Endpoint
app.get('/api/messages/:projectId', async (req, res, next) => {
  try {
    const messages = await Message.find({ projectId: req.params.projectId })
      .populate('senderId', 'username avatar')
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    next(err);
  }
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${new Date().toISOString()}:`, err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
