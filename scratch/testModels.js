import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

async function listModels() {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
    const data = await res.json();
    console.log("AVAILABLE MODELS:", JSON.stringify(data.models?.map(m => m.name), null, 2));
  } catch (e) {
    console.error("List models error:", e);
  }
}

listModels();
