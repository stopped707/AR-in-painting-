
import { GoogleGenAI, Modality } from "@google/genai";

const fileToGenerativePart = (base64: string, mimeType: string) => {
  return {
    inlineData: {
      data: base64.split(",")[1],
      mimeType,
    },
  };
};

export const generateEditedImage = async (
  originalImage: string,
  originalMimeType: string,
  maskImage: string,
  prompt: string
): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const originalImagePart = fileToGenerativePart(originalImage, originalMimeType);
  const maskImagePart = fileToGenerativePart(maskImage, "image/png");

  const textPart = {
      text: `Using the provided image and mask, edit the image with the following instruction: ${prompt}. The mask indicates the area to be edited.`
  };

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [textPart, originalImagePart, maskImagePart],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }
    
    throw new Error("No image was generated. The model may have refused the request.");

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to generate image. Please check the console for more details.");
  }
};
