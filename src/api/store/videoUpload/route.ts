// Imports necessary for handling HTTP requests, interacting with the filesystem, parsing form data including file uploads, and working with file paths.
import type { MedusaRequest, MedusaResponse } from "@medusajs/medusa";
import formidable from "formidable";
import path from "path";
import fs from "fs/promises";
import { MEDUSA_BACKEND_URL } from "../config";

// Defines a function to read and optionally save files from a request.
const readFile = (req: MedusaRequest, saveLocally?: boolean): Promise<{fields: formidable.Fields; files: formidable.Files}> => {
    const options: formidable.Options = {};

    if (saveLocally) {
        // Sets the directory where files should be saved if `saveLocally` is true.
        options.uploadDir = "C://Users//Roshini//Downloads//dhruv//dhruv-webstore//uploads";
        // Customizes how uploaded files are named using the current timestamp and original filename.
        options.filename = (name, ext, path, form) => {
            return Date.now().toString() + "_" + path.originalFilename;
        };
    }

    const form = formidable(options);

    // Parses the form data and resolves with the parsed fields and files.
    return new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
            if (err) reject(err);
            resolve({fields, files});
        });
    });
};

// A global variable to cache directory contents, not directly used in the main POST handler.
let dirsCache = [];

// The POST async function to handle file upload requests.
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    console.log('POST method at videoUpload');
    const mediaDir = "C://Users//Roshini//Downloads//dhruv//dhruv-webstore//uploads";
  
    try {
      // Ensures the media directory exists, creating it if necessary.
      await fs.readdir(mediaDir);
    } catch (error) {
      await fs.mkdir(mediaDir, { recursive: true });
    }
  
    try {
      // Calls `readFile` to process the uploaded file.
      const { files } = await readFile(req, true);
      console.log('files', files);

      // Assumes the file is uploaded with the key 'myVideoFile' and retrieves the uploaded file info.
      const uploadedFile = files.myVideoFile[0];

      // Gets the path of the uploaded file and checks if it exists.
      const filePath = uploadedFile.filepath;
      await fs.stat(filePath);

      console.log('filePath', filePath);
      // Generates a URL for accessing the uploaded file.
      const fileUrl = `${MEDUSA_BACKEND_URL}/uploads/${path.basename(filePath)}`;

      console.log('File uploaded successfully:', filePath);
      console.log('fileUrl', fileUrl);
      
      // Prepares the response with the file details and cached directory information.
      const responseJson = {
        done: "ok",
        file: {
          path: filePath,
          url: fileUrl,
          size: uploadedFile.size,
          type: uploadedFile.mimetype
        },
        dirs: dirsCache
      };

      res.json(responseJson);
    } catch (error) {
      console.error('Error uploading file:', error);

      // Responds with an error message and includes cached directory information.
      const errorResponseJson = {
        error: "File upload failed",
        details: error.message,
        dirs: dirsCache
      };

      res.status(500).json(errorResponseJson);
    }
};
