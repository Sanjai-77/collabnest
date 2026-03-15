const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const Project = require('./models/Project');
const User = require('./models/User');

const checkDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const chandru = await User.findOne({ email: 'chandru@email.com' });
    if (!chandru) {
      console.log('User chandru@email.com not found');
      process.exit(0);
    }
    console.log(`CHANDRU ID: ${chandru._id}`);

    const ownedProjects = await Project.find({ createdBy: chandru._id });
    console.log(`Owned Projects: ${ownedProjects.length}`);
    ownedProjects.forEach(p => console.log(`- ${p.title} (${p._id})`));

    const memberProjects = await Project.find({ members: chandru._id });
    console.log(`Member Projects: ${memberProjects.length}`);
    memberProjects.forEach(p => console.log(`- ${p.title} (${p._id})`));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkDB();
