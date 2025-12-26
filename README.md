# Ibani Translator Backend

This is a Node.js Express backend for the Ibani Translator, using the Hugging Face model [williampepple1/ibani-translator](https://huggingface.co/williampepple1/ibani-translator).

## Prerequisites

- Node.js (v16 or higher)
- A Hugging Face API Token (Recommended for Inference API)

## Getting Started

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Setup Environment Variables:**
   Create a `.env` file in the root directory and add your Hugging Face Access Token:
   ```env
   PORT=5000
   HUGGING_FACE_ACCESS_TOKEN=your_token_here
   ```

3. **Run the Server:**
   - Development mode: `npm run dev`
   - Production mode: `npm run start`

## API Endpoints

### 1. Health Check
- **URL:** `/health`
- **Method:** `GET`
- **Success Response:** `{"status": "UP", "model": "williampepple1/ibani-translator", ...}`

### 2. Translate
- **URL:** `/api/translate`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "text": "I eat fish"
  }
  ```
- **Success Response:**
  ```json
  {
    "original_text": "I eat fish",
    "translated_text": "A mine í-njí ríerí",
    "source_language": "English",
    "target_language": "Ibani",
    "success": true
  }
  ```

## Local Execution with Transformers.js (Optional)

If you wish to run the model locally on your machine without an API key, you can use `@xenova/transformers`. 
Note: This requires the model to have ONNX weights. If they are not available, the Inference API approach is the most reliable.

## Model Details

- **Base Model**: `Helsinki-NLP/opus-mt-en-mul`
- **Language Pair**: English → Ibani
- **Developer**: William Pepple
