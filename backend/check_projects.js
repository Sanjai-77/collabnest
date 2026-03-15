const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const Project = require('./models/Project');
const User = require('./models/User');

const checkDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('--- USERS ---');
    const users = await User.find({}, 'name email');
    for (const u of users) {
      console.log(`User: ${u.name} | Email: ${u.email} | ID: ${u._id}`);
    }

    console.log('\n--- PROJECTS ---');
    const projects = await Project.find()
      .populate('createdBy', 'name')
      .populate('members', 'name');

    for (const p of projects) {
      console.log(`\nProject: ${p.title} | ID: ${p._id}`);
      console.log(`  Creator: ${p.createdBy?.name || 'N/A'} | ID: ${p.createdBy?._id}`);
      console.log(`  Members: ${p.members.map(m => `${m.name} (${m._id})`).join(', ') || 'None'}`);
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkDB();
