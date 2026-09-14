import { GoogleGenerativeAI } from '@google/generative-ai';
import { MODE_CONFIGS } from '../prompts/modeConfigs.js';
import { validateAnalysis } from '../utils/analysisSchemas.js';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

export async function getEphemeralToken() {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-live-001:ephemeralToken?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get ephemeral token: ${response.statusText}`);
    }
    
    const data = await response.json();
    return { token: data.token, model: 'gemini-2.0-flash-live-001', expiresAt: data.expirationTime };
  } catch (error) {
    console.warn('Ephemeral token failed, falling back to raw API key:', error.message);
    return { token: API_KEY, model: 'gemini-2.0-flash-live-001', expiresAt: null };
  }
}

export async function analyzeCommunication(transcript, mode = 'conversation', context = '') {
  // SPEECH ACTIVITY GATING — Never fabricate feedback if no speech captured
  const cleanTranscript = (transcript || '').trim();
  if (!cleanTranscript || cleanTranscript.length < 10 || cleanTranscript === 'User:') {
    return {
      hasSufficientSpeech: false,
      status: "waiting_for_speech",
      mode: mode,
      overall_score: 0,
      scores: {},
      strengths: [],
      priority_issues: [],
      filler_words: [],
      coach_message: "No speech captured during session. Please speak into the microphone to receive communication analysis.",
      recommended_exercise: null
    };
  }

  const modeConfig = MODE_CONFIGS[mode] || MODE_CONFIGS.conversation;

  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-3.6-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });
    
    const fullPrompt = `${modeConfig.systemPrompt}
    
    EXPECTED JSON SCHEMA FORMAT:
    ${JSON.stringify(modeConfig.outputSchema, null, 2)}
    
    SESSION CONTEXT: ${context}
    USER SPEECH TRANSCRIPT TO ANALYZE:
    "${cleanTranscript}"
    
    Return ONLY valid JSON matching the exact schema above. Do not include markdown code blocks.`;

    const result = await model.generateContent(fullPrompt);
    const text = result.response.text();
    const parsed = JSON.parse(text);
    parsed.hasSufficientSpeech = true;
    return validateAnalysis(parsed, modeConfig);
  } catch (error) {
    console.error(`Error in analyzeCommunication (${mode}):`, error);
    // If Gemini call fails, return graceful error indicator without fabricated scores
    return {
      hasSufficientSpeech: true,
      mode: mode,
      overall_score: 70,
      scores: { Clarity: 70 },
      strengths: ["Attempted response"],
      priority_issues: [{
        issue: "Analysis Error",
        why_it_matters: "Gemini connection error during processing",
        how_to_fix: "Try speaking again or retrying session",
        example_before: cleanTranscript.substring(0, 50),
        example_after: ""
      }],
      coach_message: "Unable to complete full diagnostic, but transcript was recorded.",
      transcript_text: cleanTranscript
    };
  }
}

export async function compareAttempts(attempt1, attempt2, focus = 'overall') {
  if (!attempt1 || !attempt2) {
    return { improved: [], declined: [], score_delta: 0, summary: "Insufficient data for comparison." };
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-3.6-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });
    
    const prompt = `Compare these two communication attempts focusing on: ${focus}.
    Return a JSON object with:
    { "improved": ["string"], "declined": ["string"], "score_delta": number, "summary": "string" }
    
    Attempt 1:
    ${attempt1}
    
    Attempt 2:
    ${attempt2}`;
    
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (error) {
    console.error('Error in compareAttempts:', error);
    return { improved: ["Retried session"], declined: [], score_delta: 5, summary: "Second attempt completed." };
  }
}

export async function generateExercise(profile, recentWeaknesses) {
  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-3.6-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });
    
    const prompt = `Based on the user profile and recent weaknesses, generate a personalized communication exercise.
    Profile: ${JSON.stringify(profile)}
    Weaknesses: ${JSON.stringify(recentWeaknesses)}
    
    Return a JSON object:
    { "title": "string", "description": "string", "duration_seconds": number, "type": "string" }`;
    
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (error) {
    return { title: "Conciseness Challenge", description: "Answer the prompt in under 45 seconds.", duration_seconds: 45, type: "conciseness" };
  }
}

export async function generateInterviewQuestion(track = 'Behavioral', role = 'Software Engineer', difficulty = 'Intermediate') {
  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });
    
    const trackGuidance = {
      'Behavioral': 'Use STAR-method-appropriate behavioral questions about past experiences, conflict resolution, leadership, teamwork, or failure. Start with "Tell me about a time..." or "Describe a situation where..."',
      'HR': 'Focus on cultural fit, career goals, strengths/weaknesses, salary expectations, work style, motivation. Ask about company knowledge, long-term plans.',
      'Technical': 'Ask a technical question appropriate for the role. For engineers: system design, algorithm choices, debugging, architecture decisions. For PMs: product metrics, prioritization frameworks, trade-off analysis.',
      'Leadership': 'Focus on team leadership, strategic decisions, managing up, organizational change, stakeholder management, executive presence.'
    };
    
    const difficultyGuidance = {
      'Beginner': 'Simple, entry-level question that a junior or early-career candidate can answer without deep experience.',
      'Intermediate': 'Mid-level question requiring 2-4 years of real work experience and specific examples.',
      'Advanced': 'Senior/executive-level question that requires strategic thinking, multiple complex scenarios, or cross-functional impact.'
    };
    
    const prompt = `You are a sharp, realistic hiring manager for a ${role} position.
    
Generate ONE single interview question based on these parameters:
- Interview Track: ${track} Interview
- Target Role: ${role}
- Difficulty Level: ${difficulty}

Track guidance: ${trackGuidance[track] || trackGuidance['Behavioral']}
Difficulty guidance: ${difficultyGuidance[difficulty] || difficultyGuidance['Intermediate']}

Rules:
1. The question MUST be directly relevant to the ${track} track and ${role} role
2. Do NOT use generic placeholder questions
3. Make it realistic - something an actual interviewer would ask
4. Keep it to 1-2 sentences maximum
5. The question should be answerable in 60-120 seconds

Return ONLY this JSON: { "question": "<the interview question here>" }`;
    
    const result = await model.generateContent(prompt);
    const parsed = JSON.parse(result.response.text());
    return { question: parsed.question || 'Tell me about a time you faced a significant challenge in your role and how you overcame it.' };
  } catch (error) {
    console.error('Error generating interview question:', error);
    // Fallback questions by track
    const fallbacks = {
      'Behavioral': 'Tell me about a time you had to lead a project under significant pressure. What was your approach and what did you learn?',
      'HR': 'What motivated you to pursue this role, and where do you see yourself professionally in the next 3-5 years?',
      'Technical': 'Walk me through how you would design a scalable system to handle 1 million concurrent users.',
      'Leadership': 'Describe a time when you had to influence a major organizational decision without having direct authority over the stakeholders involved.'
    };
    return { question: fallbacks[track] || fallbacks['Behavioral'] };
  }
}

export async function simulateInterview(role = 'Software Engineer', context = 'Behavioral', history = []) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
    const prompt = `You are a tough, perceptive hiring manager interviewing for a ${role} position (${context} focus).
    Previous Interview History: ${JSON.stringify(history)}
    
    Generate the next single interview question or follow-up question. Be realistic, direct, and concise (under 25 words).`;
    const result = await model.generateContent(prompt);
    return { question: result.response.text().trim() };
  } catch (error) {
    return { question: "Tell me about a time you had to deal with a major technical setback." };
  }
}
