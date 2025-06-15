import multer from 'multer'; 
import { uploadOnCloudinary } from '../utils/cloudinary.js'; // Importing the upload function from cloudinary utility

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/temp'); // temporary folder
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

export const upload = multer({ storage });
