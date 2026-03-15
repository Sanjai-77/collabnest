const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');

const dumpUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const users = await User.find({}, 'name email _id');
    const fs = require('fs');
    fs.writeFileSync('users_full.json', JSON.stringify(users, null, 2), 'utf8');
    console.log('Done writing users_full.json');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

dumpUsers();
