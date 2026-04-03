module.exports = [
"[project]/.next-internal/server/app/api/ai-photo-suggestion/route/actions.js [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[project]/app/api/ai-photo-suggestion/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
;
// Simple in-memory rate limiting: 5 requests per hour per IP
const rateLimitMap = new Map();
const RATE_LIMIT = 5;
const WINDOW_MS = 60 * 60 * 1000;
async function POST(req) {
    try {
        // Basic IP-based Rate Limiting
        const ip = req.headers.get('x-forwarded-for') || 'unknown';
        const now = Date.now();
        const limitData = rateLimitMap.get(ip);
        if (limitData) {
            const [count, windowStart] = limitData;
            if (now - windowStart > WINDOW_MS) {
                rateLimitMap.set(ip, [
                    1,
                    now
                ]); // Reset
            } else if (count >= RATE_LIMIT) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: 'Rate limit exceeded. Please try again in an hour.'
                }, {
                    status: 429
                });
            } else {
                rateLimitMap.set(ip, [
                    count + 1,
                    windowStart
                ]);
            }
        } else {
            rateLimitMap.set(ip, [
                1,
                now
            ]);
        }
        const { imageBase64 } = await req.json();
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
        if (!GEMINI_API_KEY) {
            console.error('Missing GEMINI API key');
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Missing Gemini API key in configuration.'
            }, {
                status: 500
            });
        }
        if (!imageBase64) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'No image provided'
            }, {
                status: 400
            });
        }
        console.log('Sending image to Gemini AI... (base64 length:', imageBase64.length, ')');
        const prompt = `You are an expert barber and hairstylist. Analyze this person's photo carefully. Look at their face shape, forehead size, jawline, cheekbones, hair type, and overall features.

Based on your analysis, recommend exactly 4 haircut styles that would look BEST on this person.

For each recommendation, respond in this EXACT JSON format (no markdown, no code fences, just raw JSON):
{
  "faceShape": "detected face shape",
  "analysis": "A brief 1-2 sentence analysis of their features",
  "recommendations": [
    {
      "name": "Haircut Name",
      "description": "Why this haircut suits their face and features (2-3 sentences)",
      "matchPercentage": 95
    }
  ]
}

Rules:
- matchPercentage should range from 75 to 98
- First recommendation should be the best match
- Be specific about WHY each style suits their features
- Use real popular haircut names (Textured Crop, Low Fade, Pompadour, Side Part, etc.)
- Return ONLY valid JSON, no other text`;
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: prompt
                            },
                            {
                                inlineData: {
                                    mimeType: 'image/jpeg',
                                    data: imageBase64
                                }
                            }
                        ]
                    }
                ],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1024
                }
            })
        });
        const responseText = await response.text();
        console.log('Gemini response status:', response.status);
        if (!response.ok) {
            console.error('Gemini API error response:', responseText);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: `Gemini API error (${response.status}): ${responseText.substring(0, 200)}`
            }, {
                status: 500
            });
        }
        let data;
        try {
            data = JSON.parse(responseText);
        } catch  {
            console.error('Failed to parse Gemini response:', responseText.substring(0, 500));
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Invalid response from AI'
            }, {
                status: 500
            });
        }
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
            console.error('No text in Gemini response:', JSON.stringify(data).substring(0, 500));
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'No text response from AI. The image may have been blocked by safety filters.'
            }, {
                status: 500
            });
        }
        console.log('Gemini raw text:', text.substring(0, 300));
        // Clean the response - remove markdown code fences if present
        const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        let parsed;
        try {
            parsed = JSON.parse(cleanedText);
        } catch  {
            console.error('Failed to parse AI output as JSON:', cleanedText.substring(0, 500));
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'AI returned invalid format. Please try again.'
            }, {
                status: 500
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            data: parsed
        });
    } catch (error) {
        console.error('AI Photo Suggestion error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: error.message || 'Failed to analyze photo'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__957152b9._.js.map