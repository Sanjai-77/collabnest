const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const http = require('http');
const { Server } = require('socket.io');
const { execSync } = require('child_process');
const Message = require('./models/Message');
const Project = require('./models/Project');
const { createNotification } = require('./controllers/notificationController');
const { recordActivity } = require('./controllers/activityController');


// Connect to MongoDB
connectDB().then(async () => {
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
});


const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
});

// Export io for use in controllers
module.exports.io = io;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Socket.io
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
app.get('/api/messages/:projectId', async (req, res) => {
  try {
    const messages = await Message.find({ projectId: req.params.projectId })
      .populate('senderId', 'username avatar')
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
