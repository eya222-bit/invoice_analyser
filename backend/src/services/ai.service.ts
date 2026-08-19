import axios from "axios";
import FormData from "form-data";
import fs from "fs";

const AI_SERVICE_URL =
    process.env.AI_SERVICE_URL || "http://ai-service:8000";

export async function analyzeInvoice(filePath: string) {
    const formData = new FormData();

    formData.append("file", fs.createReadStream(filePath));

    const response = await axios.post(
        `${AI_SERVICE_URL}/analyze/`,
        formData,
        {
            headers: {
                ...formData.getHeaders(),
                "X-API-Key": process.env.AI_API_KEY
            }
        }
    );

    return response.data;
}