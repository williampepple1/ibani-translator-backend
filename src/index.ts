import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Configuration
const HUGGING_FACE_ACCESS_TOKEN = process.env.HUGGING_FACE_ACCESS_TOKEN;
const MODEL_ID = 'williampepple1/ibani-translator';

/**
 * Health Check Route
 */
app.get('/health', (req: Request, res: Response) => {
    res.json({
        status: 'UP',
        model: MODEL_ID,
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

        console.log(`Translating: "${text}"`);

        // Hugging Face Inference API call
        const response = await axios.post(
            `https://router.huggingface.co/hf-inference/models/${MODEL_ID}`,
            {
                inputs: text,
                parameters: {
                    wait_for_model: true // If model is loading, wait for it
                }
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${HUGGING_FACE_ACCESS_TOKEN}`
                }
            }
        );

        // Process response
        // Usually returns: [{ translation_text: "..." }]
        const data = response.data;
        
        let translatedText = '';
        if (Array.isArray(data) && data.length > 0) {
            translatedText = data[0].translation_text;
        } else if (data.translation_text) {
            translatedText = data.translation_text;
        } else {
            // Fallback for different response formats
            translatedText = JSON.stringify(data);
        }

        res.json({
            original_text: text,
            translated_text: translatedText,
            source_language: 'English',
            target_language: 'Ibani',
            success: true
        });

    } catch (error: any) {
        console.error('Translation Error:', error.response?.data || error.message);
        
        const statusCode = error.response?.status || 500;
        const errorMessage = error.response?.data?.error || error.message || 'Internal Server Error';

        res.status(statusCode).json({
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
    console.log(`🤖 Model: ${MODEL_ID}`);
    console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
    console.log(`=========================================`);
});
