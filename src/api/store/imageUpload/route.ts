// Import necessary types from Medusa and other utilities for working with the file system and forms.
import type { MedusaRequest, MedusaResponse } from "@medusajs/medusa";
import formidable from "formidable"; // For parsing form data, including file uploads.
import path from "path"; // Provides utilities for working with file and directory paths.
import fs from "fs/promises"; // File System module with Promise-based API for working with the file system.

// Function to handle file reading from a request with optional saving to a local directory.
const readFile = (req: MedusaRequest, saveLocally?: boolean): Promise<{fields: formidable.Fields; files: formidable.Files}> => {
    const options: formidable.Options = {}; // Formidable options.

    if (saveLocally) {
        // Set the directory where files should be uploaded.
        options.uploadDir = "C://Users//Roshini//Downloads//dhruv//dhruv-webstore//uploads";
        // Define how uploaded files are named.
        options.filename = (name, ext, path, form) => {
            return Date.now().toString() + "_" + path.originalFilename; // Unique filename based on the timestamp.
        };
    }

    // Initialize Formidable with the specified options.
    const form = formidable(options);

    // Parse the incoming form data.
    return new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
            if (err) reject(err); // Reject the promise on error.
            resolve({fields, files}); // Resolve with the parsed fields and files.
        });
    });
};

// Global variable to cache directory contents, demonstrating a basic caching strategy.
let dirsCache = [];

// Main function for handling the POST request.
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    console.log('POST method at imageUpload');
    // Define the media directory where files will be uploaded.
    const mediaDir = "C://Users//Roshini//Downloads//dhruv//dhruv-webstore//uploads";
  
    try {
      // Attempt to read the directory, which will throw an error if it doesn't exist.
      await fs.readdir(mediaDir);
    } catch (error) {
      // If the directory doesn't exist, create it including any necessary parent directories.
      await fs.mkdir(mediaDir, { recursive: true });
    }
  
    try {
      // Read and process the uploaded file.
      const { files } = await readFile(req, true);
  
      // Assuming a file was uploaded with the form key 'myImage'.
      const uploadedFile = files.myImage[0]; // Adjust according to your form structure.
  
      // Get the path of the uploaded file.
      const filePath = uploadedFile.filepath;
      // Check if the file exists, which throws if the file does not exist.
      await fs.stat(filePath);
  
      console.log('filePath', filePath);
      // Generate a publicly accessible URL for the uploaded file.
      const fileUrl = `http://195.35.20.220:9000/uploads/${path.basename(filePath)}`;
  
      console.log('File uploaded successfully:', filePath);
      console.log('fileUrl', fileUrl);
      
      // Prepare and send a JSON response including details about the uploaded file.
      res.json({
        done: "ok",
        file: {
          path: filePath,
          url: fileUrl,
          size: uploadedFile.size,
          type: uploadedFile.mimetype
        },
        dirs: dirsCache // Include the cached directory information in the response.
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      // Send an error response including details of the failure.
      res.status(500).json({
        error: "File upload failed",
        details: error.message,
        dirs: dirsCache // Include cached directory information even in error responses.
      });
    }
  };
