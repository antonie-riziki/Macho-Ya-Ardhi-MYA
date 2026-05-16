import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export interface ExtractionResult {
  parcel_number: string | null;
  registered_owner: string | null;
  seller_name: string | null;
  id_number: string | null;
  document_type: string | null;
  issue_date: string | null;
  registry: string | null;
  stamp_present: boolean;
  signature_present: boolean;
  suspicious_edits: boolean;
  confidence: number;
}

export async function extractDocumentData(fileBuffer: Buffer, mimeType: string): Promise<ExtractionResult> {
  const base64Data = fileBuffer.toString("base64");

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: [
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        },
        "You are Macho Ya Ardhi, a Kenyan land fraud detection assistant. Analyze the uploaded land transaction document. Extract the following fields: parcel_number, registered_owner, seller_name, id_number, document_type, issue_date, registry, stamp_present, signature_present, suspicious_edits, confidence. Flag visible signs of tampering, inconsistent fonts, altered dates, missing stamps, missing signatures, unclear parcel numbers, or mismatched ownership details. Return ONLY valid JSON. No markdown."
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            parcel_number: { type: Type.STRING, description: "Land parcel number (e.g. KJD/Kaputiei/1234)" },
            registered_owner: { type: Type.STRING },
            seller_name: { type: Type.STRING },
            id_number: { type: Type.STRING },
            document_type: { type: Type.STRING, description: "Title deed, search certificate, transfer form, etc." },
            issue_date: { type: Type.STRING },
            registry: { type: Type.STRING },
            stamp_present: { type: Type.BOOLEAN },
            signature_present: { type: Type.BOOLEAN },
            suspicious_edits: { type: Type.BOOLEAN, description: "True if there are signs of tampering or inconsistent fonts" },
            confidence: { type: Type.NUMBER, description: "Model's confidence in extraction 0-100" }
          }
        }
      }
    });

    if (response.text) {
      const parsedData = JSON.parse(response.text) as ExtractionResult;
      return parsedData;
    }
    
    throw new Error("No text response from Gemini");

  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    // Safe fallback for demo
    return {
      parcel_number: "DEMO/123/ERROR",
      registered_owner: "Unknown Demo User",
      seller_name: "Unknown Demo User",
      id_number: "12345678",
      document_type: "Unknown",
      issue_date: "2020-01-01",
      registry: "Unknown Registry",
      stamp_present: false,
      signature_present: false,
      suspicious_edits: true,
      confidence: 10
    };
  }
}
