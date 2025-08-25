#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '.env');

const envContent = `# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/electormart

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Cloudinary Configuration (optional for development)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email Configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
`;

console.log('Setting up environment variables...');

if (fs.existsSync(envPath)) {
  console.log('.env file already exists. Skipping creation.');
} else {
  fs.writeFileSync(envPath, envContent);
  console.log('.env file created successfully!');
  console.log('\nPlease update the .env file with your actual values:');
  console.log('1. Set a strong JWT_SECRET');
  console.log('2. Update MONGODB_URI if using a different database');
  console.log('3. Add Cloudinary credentials if you want cloud image storage');
}

console.log('\nSetup complete! You can now start the server.');
