import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function getPublicIdFromUrl(url) {
  const regex = /\/upload\/(?:v\d+\/)?(.+)\.\w+$/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    // upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // file has been upload successfully
    console.log("File uploaded on cloudinary: ", response.url);
    fs.unlinkSync(localFilePath);
    return response;
  } catch (err) {
    console.log("Failed to upload");
    fs.unlinkSync(localFilePath); // remove the locally saved temporary file as the upload operation gor failed
    return null;
  }
};

const deleteMedia = async (url, resource) => {
  // console.log(url, resource);
  try {
    if (!url) return null;

    const publicId = getPublicIdFromUrl(url); // Remove the file extension
    // console.log(publicId);
    if (!publicId) return null;
    const response = await cloudinary.uploader.destroy(publicId, {
      resource_type: resource,
    });
    console.log("File deleted from cloudinary");
    return response;
  } catch (error) {
    console.log("Failed to delete");
    return null;
  }
};

export { uploadOnCloudinary, deleteMedia };
