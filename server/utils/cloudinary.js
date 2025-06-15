import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) throw new Error("No file path provided");
    const result = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    fs.unlinkSync(localFilePath); // delete temp file
    return result;
  } catch (error) {
    if (localFilePath && fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};

export { uploadOnCloudinary };
