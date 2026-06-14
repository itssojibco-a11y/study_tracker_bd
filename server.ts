import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API route for AI motivational quote
  app.post("/api/motivate", async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
      }
      const ggen = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const { activities, utilizedHours, wastedHours } = req.body;
      
      const prompt = `The user has the following progress today:
Utilized hours: ${utilizedHours}
Wasted hours: ${wastedHours}
Activities logged:
${activities?.map((a: any) => `- ${a.name}: ${a.hours} hours (Target: ${a.targetHours} hours)`).join("\n") || "None"}

Please provide a short, encouraging motivational quote in Bengali (in Bengali script) based on how they did today. If they have done well, praise them. If they have wasted time, encourage them to stay focused. Give ONLY the quote and maybe a short encouraging sentence, no extra text. keep it concise.`;

      const response = await ggen.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      
      return res.json({ quote: response.text });
    } catch (error: any) {
      // Fallback quote for any error to ensure UI doesn't break
      return res.json({ quote: "লক্ষ্যে স্থির থাকো। প্রতিটি মুহূর্তকে কাজে লাগাও!" });
    }
  });

  // API route for Dashboard motivational quote (specific for 2nd time admission)
  app.get("/api/dashboard-quote", async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
      }
      const ggen = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      const prompt = `Provide a powerful, deeply motivating message in Bengali (in Bengali script) specifically tailored for a student taking preparation for university admission for the 2nd time (2nd-timer). Focus on the themes of relentless study, extreme hard work, learning from past failure, and the importance of NEVER giving up. It should inspire them to bounce back stronger and give their 100%. Keep it concise, about 2-3 sentences. Give ONLY the quote/message without any intro or extra text.`;

      const response = await ggen.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      
      return res.json({ quote: response.text });
    } catch (error: any) {
      // Fallback quote for any error to ensure UI doesn't break
      return res.json({ quote: "বারবার হেরে যাওয়ার পরও যে উঠে দাঁড়াতে জানে, চূড়ান্ত বিজয় তারই হয়। নিজের শতভাগ উজাড় করে দাও, জয় তোমার হবেই!" });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
