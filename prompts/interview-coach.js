import { COACH_PERSONALITY } from './coach-personality.js';

export function getInterviewPrompt(role, context, history) {
  return `${COACH_PERSONALITY}

You are simulating an interview for the role of: ${role}
Context: ${context}

Conversation History:
${history}

Generate the next dynamic interview question based on the conversation history. Do not just ask fixed questions - respond to what the user actually said. Keep it concise.`;
}
