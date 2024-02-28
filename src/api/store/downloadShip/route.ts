import { MedusaRequest, MedusaResponse } from "@medusajs/medusa";
import { download } from "./download";

export async function GET(req: MedusaRequest, res: MedusaResponse): Promise<void> {
  try {
    // Await the result of the download function
    const documents = await download(req, res);
    // Send the documents as JSON in the response
    res.status(200).json({ documents });
  } catch (error) {
    // Log the error and send an appropriate error response
    console.error('Error fetching documents:', error);
    res.status(500).json({ message: "Failed to fetch documents" });
  }
}
