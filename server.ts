import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize GoogleGenAI SDK
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey,
});

async function startServer() {
  const app = express();
  app.use(express.json());

  const PORT = 3000;

  // Gemini Chat Assistant API
  app.post('/api/gemini/chat', async (req, res) => {
    try {
      const { messages, systemInstruction } = req.body;
      if (!apiKey) {
        return res.status(200).json({ 
          text: "Gemini API key is not configured. (To fix this, add GEMINI_API_KEY in the Secrets panel in AI Studio settings). Here is a standard response helper for your editing flow!" 
        });
      }

      const formattedContents = messages.map((m: any) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: formattedContents,
        config: {
          systemInstruction: systemInstruction || "You are RT Editor's AI Assistant, an expert in video editing, social media pacing, and engaging content design. Suggest quick edit workflows, hook lines, subtitle styles, and thumbnail concepts."
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini Chat Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate AI response" });
    }
  });

  // Gemini Subtitle/Caption Generator API
  app.post('/api/gemini/subtitles', async (req, res) => {
    try {
      const { textInput, style, language } = req.body;
      if (!apiKey) {
        // Mock/simulated generation if key is missing
        const fallbackText = textInput || "Welcome to RT Editor! Get ready to create outstanding content.";
        const words = fallbackText.split(/\s+/);
        const mockedSubtitles = words.map((word: string, index: number) => ({
          id: index + 1,
          text: word,
          start: index * 0.4,
          end: (index + 1) * 0.4,
          style: style || 'karaoke'
        }));
        return res.json({ subtitles: mockedSubtitles });
      }

      const prompt = `Convert the following speech transcript or video idea into high-impact, synced subtitle blocks. 
Style option requested: "${style || 'dynamic'}" (e.g. word-by-word karaoke, bento captions, or elegant lower thirds).
Language: "${language || 'English'}".
Split the transcript into accurate word/phrase blocks with timestamps. Start from 0.0 seconds and space them out by roughly 0.3 - 0.6 seconds per word/phrase.
Format the output strictly as a JSON array of objects, containing 'id' (integer), 'text' (string), 'start' (number in seconds), and 'end' (number in seconds).
Do not return any markdown tags, just return the JSON.

Transcript/Text to process:
"${textInput}"`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json"
        }
      });

      const responseText = response.text || "[]";
      let parsedSubtitles = [];
      try {
        parsedSubtitles = JSON.parse(responseText.trim());
      } catch (e) {
        console.error("Failed to parse AI subtitle response, formatting manually", responseText);
        // Clean markdown backticks just in case
        const cleaned = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
        parsedSubtitles = JSON.parse(cleaned);
      }

      res.json({ subtitles: parsedSubtitles });
    } catch (error: any) {
      console.error("Gemini Subtitle Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate subtitles" });
    }
  });

  // Gemini Thumbnail Designer API
  app.post('/api/gemini/thumbnail', async (req, res) => {
    try {
      const { title, subtitle, theme, style } = req.body;
      if (!apiKey) {
        // Return standard layout if API key missing
        return res.json({
          backgroundColor: '#0a0a0c',
          accentColor: '#fbbf24',
          textColor: '#ffffff',
          title: title || "PREMIUM TRANSFORMATION",
          subtitle: subtitle || "RT Editor Tool",
          emojis: ["🔥", "⚡"],
          layoutType: 'left-split',
          compositionElements: ["glow-radial", "mesh-gradient", "neon-border"]
        });
      }

      const prompt = `Design a high-converting thumbnail composition outline based on:
Title: "${title || 'No Title'}"
Subtitle: "${subtitle || ''}"
Theme/Vibe: "${theme || 'Modern Cyberpunk'}"
Style option: "${style || 'Bold YouTube'}"

Generate color palette codes, emoji recommendations, visual layout types (e.g., 'centered-bold', 'left-split', 'gaming-duotone'), and decorative background elements.
Format the output strictly as a JSON object with these fields:
- 'backgroundColor' (hex code)
- 'accentColor' (hex code)
- 'textColor' (hex code)
- 'title' (string, optimized capitalized)
- 'subtitle' (string, optimized capitalized)
- 'emojis' (array of 2-3 emojis relevant to theme)
- 'layoutType' (string: 'left-split', 'centered-bold', 'split-diagonal', or 'minimal-right')
- 'compositionElements' (array of background descriptors like 'mesh-gradient', 'light-streak', etc.)

Return ONLY valid JSON. No conversational text.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json"
        }
      });

      const design = JSON.parse((response.text || '{}').trim());
      res.json(design);
    } catch (error: any) {
      console.error("Gemini Thumbnail Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate thumbnail design" });
    }
  });

  // Gemini AI Video Editor - Automate Edit Plan API
  app.post('/api/gemini/edit-plan', async (req, res) => {
    try {
      const { footageDescription, editingStyle, musicVibe } = req.body;
      if (!apiKey) {
        return res.json({
          clips: [
            { id: 1, start: 0, end: 3, effect: "Zoom-in transition with cinematic scale", text: "HOOK: Captivating Intro" },
            { id: 2, start: 3, end: 8, effect: "Warm dynamic color filter + smooth slide", text: "Core demonstration phase" },
            { id: 3, start: 8, end: 12, effect: "Whip transition + Neon subtitles", text: "Call to Action / Outro" }
          ],
          audioTrack: "Cinematic synth beat at 120BPM",
          colorGrade: "Premium Moody Dark"
        });
      }

      const prompt = `Create a professional timeline editing plan for:
Footage Description: "${footageDescription || 'b-roll shots'}"
Target Style: "${editingStyle || 'Modern Reel'}"
Music Vibe: "${musicVibe || 'Upbeat Cinematic'}"

Generate:
1. Clip sequence with start/end seconds (up to 4 clips)
2. Transitions and color grades
3. Text overlay suggestions

Format strictly as JSON with this schema:
{
  "clips": [
    { "id": number, "start": number, "end": number, "effect": string, "text": string }
  ],
  "audioTrack": string,
  "colorGrade": string
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json"
        }
      });

      const editPlan = JSON.parse((response.text || '{}').trim());
      res.json(editPlan);
    } catch (error: any) {
      console.error("Gemini Video Edit Plan Error:", error);
      res.status(500).json({ error: error.message || "Failed to create video editing plan" });
    }
  });

  // Vite Integration Middleware
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RT Editor Full-Stack Server running on port ${PORT}`);
  });
}

startServer().catch(console.error);
