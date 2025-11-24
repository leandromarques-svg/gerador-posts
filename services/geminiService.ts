
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const MODEL_ID = 'gemini-2.5-flash';

export const findAuthorImage = async (authorName: string): Promise<string | null> => {
    try {
        const prompt = `Find a high-quality, publicly accessible profile image URL for "${authorName}". 
        Prefer professional headshots or portraits.
        Return ONLY the raw URL string. Do not return JSON. Do not return markdown. Just the URL.
        If you find multiple, pick the best one.`;

        const response = await ai.models.generateContent({
            model: MODEL_ID,
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });

        let text = response.text?.trim() || "";
        
        // Remove possíveis aspas ou markdown
        text = text.replace(/['"`]/g, '');
        
        // Validação básica de URL
        if (text.startsWith('http')) {
            return text;
        }
        
        // Tenta extrair do groundingMetadata se o texto direto falhar
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (chunks && chunks.length > 0) {
            // Tenta encontrar algo que pareça uma imagem no chunk (difícil, mas tentamos)
            // Normalmente o grounding retorna links de páginas, não imagens diretas.
            // Vamos confiar no texto gerado pelo modelo primeiro.
        }

        return null;

    } catch (error) {
        console.error("Error finding author image:", error);
        return null;
    }
}
