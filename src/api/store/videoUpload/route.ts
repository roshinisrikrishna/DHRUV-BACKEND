// Import necessary types and services
import type { MedusaRequest, MedusaResponse } from "@medusajs/medusa"
import { ColorImageRepository } from "../../../repositories/color_image"
import { EntityManager, Like } from "typeorm"
import ColorImageService from "src/services/color_image"
import formidable from "formidable"
import path from "path"
import fs from "fs/promises"

const readFile = (req: MedusaRequest, saveLocally?: boolean): Promise<{fields: formidable.Fields; files: formidable.Files}> => {
    const options: formidable.Options = {};

    if (saveLocally) {
        // Directly use the absolute path for 'uploadDir'
        options.uploadDir = "C://Users//Roshini//Downloads//dhruv//dhruv-webstore//uploads";

        options.filename = (name, ext, path, form) => {
            return Date.now().toString() + "_" + path.originalFilename;
        };
    }

    const form = formidable(options);

    return new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
            if (err) reject(err);
            resolve({fields, files});
        });
    });
};
// Define a global variable to store the dirs
let dirsCache = [];

// export const getServerSideProps: GetServerSideProps = async () => {
//     try {
//       // Use only the absolute path without process.cwd()
//       const mediaDir = "C://Users//Roshini//Downloads//kamyaarts//hugo-boss-admin//uploads";
//       const dirs = await fs.readdir(mediaDir);
//       dirsCache = dirs;
  
//       return { props: { dirs: dirsCache } };
//     } catch (error) {
//       console.error("Error reading directory:", error);
//       return { props: { dirs: [] } };
//     }
//   }

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    console.log('POST method at videoUpload');
    const mediaDir = "C://Users//Roshini//Downloads//dhruv//dhruv-webstore//uploads";
  
    try {
      await fs.readdir(mediaDir);
    } catch (error) {
      await fs.mkdir(mediaDir, { recursive: true });
    }
  
    try {
      const { files } = await readFile(req, true);
  console.log('files', files)
      // Assuming the file is uploaded with the key 'myVideoFile'
      const uploadedFile = files.myVideoFile[0];  // Adjust according to your files structure
  
      // Check if the file exists in the upload directory
      const filePath = uploadedFile.filepath;  // Get the path where the file is stored
      const fileExists = await fs.stat(filePath);  // This will throw if the file does not exist
  
      console.log('filePath', filePath)
      // Generate a URL for the uploaded file
      const fileUrl = `http://195.35.20.220:9000/uploads/${path.basename(filePath)}`;
  
      console.log('File uploaded successfully:', filePath);
      console.log('fileUrl', fileUrl)
      
      // Include the dirs data in the response
      const responseJson = {
        done: "ok",
        file: {
          path: filePath,
          url: fileUrl,
          size: uploadedFile.size,
          type: uploadedFile.mimetype
        },
        dirs: dirsCache // Pass the dirs data to the response
      };
  
      res.json(responseJson);
    } catch (error) {
      console.error('Error uploading file:', error);
  
      // Include the dirs data in the error response
      const errorResponseJson = {
        error: "File upload failed",
        details: error.message,
        dirs: dirsCache // Pass the dirs data to the response even in case of an error
      };
  
      res.status(500).json(errorResponseJson);
    }
  };
  