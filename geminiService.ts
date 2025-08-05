import { GoogleGenAI, Type } from "@google/genai";
import type { AIAnalysisResult } from '../types';

if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            // Remove the "data:mime/type;base64," prefix
            resolve(result.split(',')[1]);
        };
        reader.onerror = error => reject(error);
    });
};

const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        pageCount: { 
            type: Type.INTEGER, 
            description: "Total number of pages in the document. For single images, this should be 1." 
        },
        hasColor: { 
            type: Type.BOOLEAN, 
            description: "Whether the document or image contains any significant color content, excluding black and white." 
        },
        imageQuality: { 
            type: Type.STRING, 
            description: "A brief, one-word assessment of the image quality (e.g., 'High', 'Medium', 'Low', 'Blurry'). For documents, assess overall text clarity." 
        },
        documentType: {
            type: Type.STRING,
            description: "The type of the document based on its content (e.g., 'Invoice', 'Resume', 'Photo', 'Contract', 'Report')."
        },
        documentContentSummary: {
            type: Type.STRING,
            description: "A brief, one-sentence summary of the document's main content."
        },
        fileExtension: {
            type: Type.STRING,
            description: "The file extension of the document, such as 'PDF', 'JPG', 'PNG'. Case-insensitive."
        }
    },
    required: ["pageCount", "hasColor", "imageQuality", "documentType", "documentContentSummary", "fileExtension"]
};

export const analyzeFileWithGemini = async (file: File): Promise<AIAnalysisResult> => {
    if (!process.env.API_KEY) {
        throw new Error("Gemini API key is not configured.");
    }
    
    try {
        const base64Data = await fileToBase64(file);

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: {
                parts: [
                    { text: "Analyze this file for printing. Determine the page count, if it contains color, the overall quality, its document type (e.g., Invoice, Resume, Photo), its file extension (e.g., PDF, JPG), and a one-sentence summary of its content. For single images, page count is 1. Provide the output in the requested JSON format." },
                    {
                        inlineData: {
                            mimeType: file.type,
                            data: base64Data,
                        },
                    },
                ],
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: analysisSchema,
            },
        });

        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);

        return result as AIAnalysisResult;

    } catch (error) {
        console.error("Error analyzing file with Gemini:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to analyze file: ${error.message}`);
        }
        throw new Error("An unknown error occurred during AI analysis.");
    }
};