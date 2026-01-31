import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: [
        'chrome-extension://*',
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:5000',
        'https://ibani-ai.vercel.app',
        'https://ibani.online',
        'https://www.ibani.online'
    ],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

/**
 * Configuration
 * INFERENCE_URL: The URL of your Hugging Face Space (e.g., https://username-space.hf.space/translate)
 */
const INFERENCE_URL = process.env.INFERENCE_URL;
const MODEL_ID = 'williampepple1/ibani-translator';

/**
 * Fix Ibani Spacing
 * Removes unwanted spaces around special Ibani characters (á, Á, ḅ, Ḅ)
 * that may be introduced by the tokenizer.
 */
function fixIbaniSpacing(text: string): string {
    if (!text) return text;

    // All Ibani letters (including special characters) that can appear in words
    const ibaniLetters = (
        'a-zA-Z' +              // Basic ASCII letters
        'ạẹịọụ' +               // Vowels with dot below (lowercase)
        'ẠẸỊỌỤ' +               // Vowels with dot below (uppercase)
        'áéíóú' +               // Vowels with acute (lowercase)
        'ÁÉÍÓÚ' +               // Vowels with acute (uppercase)
        'àèìòù' +               // Vowels with grave (lowercase)
        'ÀÈÌÒÙ' +               // Vowels with grave (uppercase)
        'ḅ' +                   // B with dot below (lowercase)
        'Ḅ' +                   // B with dot below (uppercase)
        'ńṅ' +                  // N with diacritics (lowercase)
        'ŃṄ'                    // N with diacritics (uppercase)
    );

    // Characters that cause spacing issues
    const specialChars = ['á', 'Á', 'ḅ', 'Ḅ'];

    let result = text;

    for (const char of specialChars) {
        // Escape the character for use in regex
        const escapedChar = char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        // Remove space before the character (when preceded by any Ibani letter)
        const beforeRegex = new RegExp(`([${ibaniLetters}])\\s+${escapedChar}`, 'gu');
        result = result.replace(beforeRegex, `$1${char}`);
        
        // Remove space after the character (when followed by any Ibani letter)
        const afterRegex = new RegExp(`${escapedChar}\\s+([${ibaniLetters}])`, 'gu');
        result = result.replace(afterRegex, `${char}$1`);
    }

    return result;
}

/**
 * Welcome Route
 */
app.get('/', (req: Request, res: Response) => {
    res.json({
        message: "Welcome to the Ibani Translator API 🚀",
        version: "1.0.0",
        description: "A specialized translation service connecting English and the Ibani language.",
        endpoints: {
            translate: {
                path: "/api/translate",
                method: "POST",
                body: "{ \"text\": \"string\" }"
            },
            health: {
                path: "/health",
                method: "GET"
            }
        },
        attribution: "Powered by Hugging Face",
        status: "Online"
    });
});

/**
 * Health Check Route
 */
app.get('/health', (req: Request, res: Response) => {
    res.json({
        status: 'UP',
        model: MODEL_ID,
        using_custom_inference: !!INFERENCE_URL,
        timestamp: new Date().toISOString()
    });
});

/**
 * Translation Route
 * POST /api/translate
 * Body: { text: string }
 */
app.post('/api/translate', async (req: Request, res: Response) => {
    try {
        const { text } = req.body;

        if (!text || typeof text !== 'string') {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Please provide a "text" field in the request body.'
            });
        }

        if (!INFERENCE_URL) {
            return res.status(500).json({
                error: 'Configuration Error',
                message: 'INFERENCE_URL is not set in environment variables.'
            });
        }

        console.log(`Translating: "${text}" using endpoint: ${INFERENCE_URL}`);

        // Call our custom inference server (FastAPI on HF Spaces)
        const response = await axios.post(INFERENCE_URL, {
            text: text
        }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 30000 // 30 second timeout for cold starts
        });

        const translatedText = fixIbaniSpacing(response.data.translated_text);

        res.json({
            original_text: text,
            translated_text: translatedText,
            source_language: 'English',
            target_language: 'Ibani',
            success: true
        });

    } catch (error: any) {
        console.error('Translation Error:', error.response?.data || error.message);
        
        const errorMessage = error.response?.data?.detail || error.message || 'Internal Server Error';

        res.status(500).json({
            error: 'Translation Failed',
            message: errorMessage,
            success: false
        });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`🚀 Ibani Translator Backend is running!`);
    console.log(`📡 Port: ${PORT}`);
    console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
    console.log(`🛠️ Inference URL: ${INFERENCE_URL || 'NOT SET'}`);
    console.log(`=========================================`);
});
