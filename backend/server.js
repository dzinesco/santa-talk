const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Configuration, OpenAIApi } = require('openai');
const axios = require('axios');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Configure OpenAI
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);

// Test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'Server is running!' });
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        const completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                { 
                    role: "system", 
                    content: "You are Santa Claus talking to a child. Keep responses very short (max 2 sentences) and child-friendly. Speak warmly and gently. Do not say 'Ho ho ho' or sign your messages." 
                },
                { role: "user", content: message }
            ],
            max_tokens: 100,
            temperature: 0.7,
        });

        const santaResponse = completion.data.choices[0].message.content;
        res.json({ message: santaResponse });
    } catch (error) {
        console.error('Error in chat endpoint:', error);
        res.status(500).json({ 
            error: 'Failed to get response',
            details: error.message 
        });
    }
});

// Text-to-Speech endpoint
app.post('/api/tts', async (req, res) => {
    try {
        let { text } = req.body;  // Changed from const to let since we modify it
        console.log('Received TTS request for text:', text);
        
        // Add pauses and slow down speech by adding punctuation
        text = text.replace(/Ho ho ho/gi, 'Ho ho ho,');
        text = text.replace(/!/g, ', !');
        text = text.replace(/\?/g, ', ?');
        text = text.replace(/(,|\.|!|\?)\s+/g, '$1 ');
        
        const ELEVEN_LABS_API_KEY = process.env.ELEVEN_LABS_API_KEY;
        if (!ELEVEN_LABS_API_KEY) {
            throw new Error('ELEVEN_LABS_API_KEY is not set in environment variables');
        }
        
        // Use the original deep male voice that was working
        const SANTA_VOICE_ID = "knrPHWnBmmDHMoiMeP3l"; // Deep male voice from ElevenLabs
        console.log('Making request to ElevenLabs API with text:', text);

        const response = await axios({
            method: 'post',
            url: `https://api.elevenlabs.io/v1/text-to-speech/${SANTA_VOICE_ID}`,
            headers: {
                'Accept': 'audio/mpeg',
                'xi-api-key': ELEVEN_LABS_API_KEY,
                'Content-Type': 'application/json'
            },
            data: {
                text: text,
                model_id: "eleven_monolingual_v1",
                voice_settings: {
                    stability: 0.80,  // Balanced stability for natural speech
                    similarity_boost: 0.45,  // Moderate similarity for gentle but masculine tone
                    style: 0.30,  // Low enough for gentleness but keeping male characteristics
                    speaking_rate: 0.75  // Slower pace for a warmer, more grandfatherly tone
                }
            },
            responseType: 'arraybuffer'
        });

        console.log('Received response from ElevenLabs, sending audio...');
        const audioBuffer = Buffer.from(response.data);
        res.set('Content-Type', 'audio/mpeg');
        res.send(audioBuffer);
    } catch (error) {
        console.error('Error in TTS endpoint:', error);
        if (error.response) {
            console.error('ElevenLabs API response:', {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data ? error.response.data.toString() : null
            });
        }
        res.status(500).json({ 
            error: 'Failed to generate speech',
            details: error.message,
            response: error.response ? {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data ? error.response.data.toString() : null
            } : null
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
