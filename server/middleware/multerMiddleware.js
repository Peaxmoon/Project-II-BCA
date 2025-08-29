import multer from 'multer'; 
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import fs from 'fs';
import path from 'path';

// Ensure temp directory exists
const tempDir = './public/temp';
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// File filter function
const fileFilter = (req, file, cb) => {
  // Check file type
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error(`Invalid file type: ${file.mimetype}. Allowed types: ${allowedMimeTypes.join(', ')}`), false);
  }
  
  // Check file size (5MB limit)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return cb(new Error(`File too large: ${file.size} bytes. Maximum size: ${maxSize} bytes`), false);
  }
  
  cb(null, true);
};

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp and original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${uniqueSuffix}-${name}${ext}`);
  },
});

// Multer configuration
const multerConfig = {
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 10, // Maximum 10 files
  },
  preservePath: false
};

// Create multer instance
const upload = multer(multerConfig);

// Enhanced upload middleware with error handling
export const uploadMiddleware = (fields = 'images', maxCount = 10) => {
  return (req, res, next) => {
    let uploadHandler;
    if (Array.isArray(fields)) {
      uploadHandler = upload.fields(fields);
    } else {
      uploadHandler = upload.array(fields, maxCount);
    }
    uploadHandler(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        // Multer-specific errors
        let message = 'File upload error';
        let statusCode = 400;
        
        switch (err.code) {
          case 'LIMIT_FILE_SIZE':
            message = `File too large. Maximum size is ${multerConfig.limits.fileSize / (1024 * 1024)}MB`;
            break;
          case 'LIMIT_FILE_COUNT':
            message = `Too many files. Maximum allowed is ${maxCount}`;
            break;
          case 'LIMIT_UNEXPECTED_FILE':
            message = `Unexpected field: ${err.field}`;
            break;
          default:
            message = err.message;
        }
        
        return res.status(statusCode).json({
          message,
          code: 'UPLOAD_ERROR',
          error: err.message,
          details: 'File upload validation failed'
        });
      } else if (err) {
        // Other errors (file type, etc.)
        return res.status(400).json({
          message: 'File validation failed',
          code: 'VALIDATION_ERROR',
          error: err.message,
          details: 'File does not meet requirements'
        });
      }
      
      // Success - continue to next middleware
      next();
    });
  };
};

// Cleanup function to remove temp files after response
export const cleanupTempFiles = (req, res, next) => {
  res.on('finish', () => {
    // Only cleanup if cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      // console.log('Skipping temp file cleanup - cloudinary not configured');
      return;
    }
    
    // Multer's req.files can be an object (fields) or array (array)
    if (Array.isArray(req.files)) {
      req.files.forEach(file => {
        if (file && file.path && fs.existsSync(file.path)) {
          fs.unlink(file.path, err => {
            if (err) console.error('Error deleting temp file:', file.path, err);
          });
        }
      });
    } else if (req.files && typeof req.files === 'object') {
      Object.values(req.files).flat().forEach(file => {
        if (file && file.path && fs.existsSync(file.path)) {
          fs.unlink(file.path, err => {
            if (err) console.error('Error deleting temp file:', file.path, err);
          });
        }
      });
    }
    // Single file (e.g., req.file)
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlink(req.file.path, err => {
        if (err) console.error('Error deleting temp file:', req.file.path, err);
      });
    }
  });
  next();
};

// Export the original upload for backward compatibility
export { upload };

// Export enhanced middleware
export const uploadWithCleanup = (fields = 'images', maxCount = 10) => {
  return [uploadMiddleware(fields, maxCount), cleanupTempFiles];
};
