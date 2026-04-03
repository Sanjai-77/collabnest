/**
 * Seed script to populate the skills collection with real-world technologies.
 * Safe to re-run — duplicates are silently skipped.
 *
 * Usage: node seedSkills.js
 */

const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Skill = require('./models/Skill');

const skills = [
  // Frontend
  { name: 'React', category: 'Frontend' },
  { name: 'Vue.js', category: 'Frontend' },
  { name: 'Angular', category: 'Frontend' },
  { name: 'Svelte', category: 'Frontend' },
  { name: 'Next.js', category: 'Frontend' },
  { name: 'HTML/CSS', category: 'Frontend' },
  { name: 'Tailwind CSS', category: 'Frontend' },
  { name: 'Bootstrap', category: 'Frontend' },

  // Backend
  { name: 'Node.js', category: 'Backend' },
  { name: 'Express', category: 'Backend' },
  { name: 'Django', category: 'Backend' },
  { name: 'Flask', category: 'Backend' },
  { name: 'Spring Boot', category: 'Backend' },
  { name: 'FastAPI', category: 'Backend' },
  { name: 'Ruby on Rails', category: 'Backend' },
  { name: 'ASP.NET', category: 'Backend' },

  // Database
  { name: 'MongoDB', category: 'Database' },
  { name: 'PostgreSQL', category: 'Database' },
  { name: 'MySQL', category: 'Database' },
  { name: 'Redis', category: 'Database' },
  { name: 'Firebase', category: 'Database' },
  { name: 'Supabase', category: 'Database' },
  { name: 'SQLite', category: 'Database' },

  // Mobile
  { name: 'Flutter', category: 'Mobile' },
  { name: 'React Native', category: 'Mobile' },
  { name: 'Swift', category: 'Mobile' },
  { name: 'Kotlin', category: 'Mobile' },
  { name: 'Android', category: 'Mobile' },
  { name: 'iOS', category: 'Mobile' },

  // DevOps
  { name: 'Docker', category: 'DevOps' },
  { name: 'Kubernetes', category: 'DevOps' },
  { name: 'AWS', category: 'DevOps' },
  { name: 'GCP', category: 'DevOps' },
  { name: 'Azure', category: 'DevOps' },
  { name: 'CI/CD', category: 'DevOps' },
  { name: 'Terraform', category: 'DevOps' },
  { name: 'Nginx', category: 'DevOps' },

  // AI/ML
  { name: 'Machine Learning', category: 'AI/ML' },
  { name: 'Deep Learning', category: 'AI/ML' },
  { name: 'NLP', category: 'AI/ML' },
  { name: 'Computer Vision', category: 'AI/ML' },
  { name: 'TensorFlow', category: 'AI/ML' },
  { name: 'PyTorch', category: 'AI/ML' },
  { name: 'OpenCV', category: 'AI/ML' },
  { name: 'LLM', category: 'AI/ML' },

  // Languages
  { name: 'Python', category: 'Languages' },
  { name: 'Java', category: 'Languages' },
  { name: 'C++', category: 'Languages' },
  { name: 'TypeScript', category: 'Languages' },
  { name: 'JavaScript', category: 'Languages' },
  { name: 'Go', category: 'Languages' },
  { name: 'Rust', category: 'Languages' },
  { name: 'C#', category: 'Languages' },
  { name: 'PHP', category: 'Languages' },
  { name: 'R', category: 'Languages' },

  // Design
  { name: 'Figma', category: 'Design' },
  { name: 'UI/UX', category: 'Design' },
  { name: 'Adobe XD', category: 'Design' },
  { name: 'Photoshop', category: 'Design' },

  // Data
  { name: 'Data Science', category: 'Data' },
  { name: 'Data Engineering', category: 'Data' },
  { name: 'Apache Spark', category: 'Data' },
  { name: 'Tableau', category: 'Data' },
  { name: 'Power BI', category: 'Data' },
  { name: 'Pandas', category: 'Data' },

  // Other
  { name: 'Git', category: 'Other' },
  { name: 'GraphQL', category: 'Other' },
  { name: 'REST API', category: 'Other' },
  { name: 'WebSockets', category: 'Other' },
  { name: 'Blockchain', category: 'Other' },
  { name: 'Cybersecurity', category: 'Other' },
  { name: 'IoT', category: 'Other' },
  { name: 'AR/VR', category: 'Other' },
];

async function seed() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // insertMany with ordered: false — duplicates are silently skipped
    const result = await Skill.insertMany(skills, { ordered: false });
    console.log(`✅ Seeded ${result.length} skills successfully`);
  } catch (error) {
    // If some are duplicates, Mongo throws a BulkWriteError but still inserts the non-duplicates
    if (error.code === 11000 || error.name === 'BulkWriteError') {
      const inserted = error.insertedDocs?.length || error.result?.nInserted || 0;
      console.log(`✅ Seeded ${inserted} new skills (duplicates were skipped)`);
    } else {
      console.error('Seed error:', error);
    }
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
}

seed();
