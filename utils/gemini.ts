import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY") {
  console.error("GEMINI_API_KEY is not set in .env.local");
}

const genAI = new GoogleGenAI({ apiKey: apiKey || "" });

export async function analyzeFaceAndRecommend(imageBase64: string) {
  try {
    if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY") {
      throw new Error("GEMINI_API_KEY is not configured. Please check your .env.local file.");
    }

    const model = genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          parts: [
            { text: "Analyze this face image and detect the face shape (oval, round, square, heart, diamond, or oblong). Then recommend 3-5 suitable hairstyles. Return ONLY valid JSON with this exact structure: {\"faceShape\": \"shape name\", \"recommendations\": [{\"name\": \"style name\", \"description\": \"brief description\", \"matchPercentage\": 85}]}" },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: imageBase64,
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
      },
    });

    const response = await model;
    
    if (!response.text) {
      throw new Error("Empty response from Gemini API");
    }

    const result = JSON.parse(response.text);
    
    // Validate response structure
    if (!result.faceShape || !Array.isArray(result.recommendations)) {
      throw new Error("Invalid response format from AI");
    }

    return result;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    // Return mock data when API limit is hit
    if (error?.status === 429 || error?.code === 429) {
      console.log("Using mock data due to API limit");
      return getMockRecommendation();
    }
    
    throw new Error(`AI Analysis failed: ${error?.message || "Unknown error"}`);
  }
}

// Mock data for when API limit is reached
function getMockRecommendation() {
  const faceShapes = ['oval', 'round', 'square', 'heart', 'diamond'];
  const randomShape = faceShapes[Math.floor(Math.random() * faceShapes.length)];
  
  return {
    faceShape: randomShape,
    recommendations: [
      {
        name: "Classic Pompadour",
        description: "A timeless style with volume on top and shorter sides. Perfect for your face shape.",
        matchPercentage: 95,
        imageUrl: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400&h=400&fit=crop&crop=face"
      },
      {
        name: "Textured Crop",
        description: "Modern, low-maintenance cut with textured layers that complement your features.",
        matchPercentage: 88,
        imageUrl: "https://images.unsplash.com/photo-1618077360395-f3068be8e001?w=400&h=400&fit=crop&crop=face"
      },
      {
        name: "Side Part",
        description: "Clean and professional look that balances your face proportions beautifully.",
        matchPercentage: 82,
        imageUrl: "https://images.unsplash.com/photo-1618077360395-f3068be8e001?w=400&h=400&fit=crop&crop=face"
      }
    ]
  };
}
