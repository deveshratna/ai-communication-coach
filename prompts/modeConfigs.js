export const MODE_CONFIGS = {
  conversation: {
    id: 'conversation',
    title: 'General Communication',
    icon: '🎙️',
    description: 'Speak with clarity, structure, and precision in everyday interactions.',
    focusMetrics: ['Clarity', 'Structure', 'Conciseness', 'Fillers', 'Verbal Confidence'],
    systemPrompt: `You are an AI General Communication Coach. Your goal is to analyze the user's spoken communication for clarity, structure, directness, and verbal confidence.
    
    CRITICAL INSTRUCTIONS:
    1. Ground every point in the actual transcript provided. Quote exact phrases from the transcript as evidence.
    2. Identify AT MOST 3 priority issues. Focus on the highest-leverage improvements.
    3. If filler words (e.g. "um", "ah", "like", "you know") exist in the transcript, list each with exact counts and quotes.
    4. Provide clear Before/After transformations.
    5. Return valid JSON matching the General Communication schema.`,
    outputSchema: {
      mode: "conversation",
      hasSufficientSpeech: true,
      overall_score: 80,
      scores: { clarity: 80, structure: 75, conciseness: 85, delivery: 80, confidence: 80 },
      strengths: ["Clear main point"],
      priority_issues: [
        { issue: "Issue title", why_it_matters: "Why", how_to_fix: "Fix", example_before: "Before quote", example_after: "After quote" }
      ],
      filler_words: [{ word: "um", count: 2, examples: ["quote"] }],
      transcript_evidence: [{ quote: "User quote", observation: "Observation" }],
      coach_message: "Direct encouraging message",
      recommended_exercise: { title: "Exercise title", description: "Instructions", duration_seconds: 60, type: "clarity" }
    }
  },

  storytelling: {
    id: 'storytelling',
    title: 'Storytelling Lab',
    icon: '📖',
    description: 'Master hooks, stakes, tension, emotional variation, and memorable endings.',
    focusMetrics: ['Hook', 'Conflict & Stakes', 'Tension', 'Specificity', 'Emotional Variation', 'Ending'],
    systemPrompt: `You are an AI Storytelling Coach. Evaluate whether the user is telling a compelling story or merely explaining facts.
    
    Analyze the 6 core storytelling dimensions:
    - Hook: Did the opening immediately pull the listener in?
    - Context & Conflict: Were the problem and stakes clear?
    - Tension: Did curiosity or expectation build up?
    - Specificity: Were there vivid details or dialogue rather than generic summaries?
    - Emotional Variation: Did the tone shift effectively?
    - Resolution & Insight: Was the ending memorable and meaningful?
    
    If the response is purely an explanation rather than a story, state clearly: "This is currently an explanation, not yet a story," and provide a hook to transform it into a story.
    
    Ground all observations in quotes from the user transcript.`,
    outputSchema: {
      mode: "storytelling",
      hasSufficientSpeech: true,
      isStoryFormat: true,
      overall_score: 75,
      story_scores: { hook: 70, conflict: 75, tension: 65, specificity: 80, emotion: 70, ending: 65 },
      what_kept_listening: "Specific aspect that engaged the listener",
      where_lost_energy: "Specific section where momentum dropped",
      missing_element: "The single biggest missing narrative element",
      transcript_evidence: [{ section: "Hook", quote: "...", evaluation: "..." }],
      transformative_advice: "Specific direction to rewrite or re-tell",
      coach_message: "Storytelling assessment",
      recommended_exercise: { title: "30-Second Hook Retake", description: "Re-tell the opening with immediate tension", duration_seconds: 30, type: "storytelling" }
    }
  },

  wit: {
    id: 'wit',
    title: 'Wit & Playful Framing',
    icon: '⚡',
    description: 'Train clever comparisons, unexpected framing, timing, and observational humor.',
    focusMetrics: ['Timing', 'Unexpected Framing', 'Clever Comparison', 'Self-Awareness', 'Playful Language'],
    systemPrompt: `You are an AI Wit & Presence Coach. Your goal is to train natural verbal wit, sharp metaphors, clever comparisons, and playful reframing.
    
    Do NOT turn responses into forced jokes. Evaluate:
    - Unexpected framing: Did the user frame an ordinary topic from an unexpected perspective?
    - Clever comparison/analogy: Were there memorable metaphors?
    - Sharpness & Understatement: Was the phrasing concise and impactful?
    
    Provide immediate feedback on what was clever, where the phrasing could be sharper, and give a specific 30-second reframing exercise.`,
    outputSchema: {
      mode: "wit",
      hasSufficientSpeech: true,
      overall_score: 80,
      scores: { timing: 80, framing: 85, comparison: 75, sharpness: 80 },
      wit_moments: [{ quote: "User quote", why_it_worked: "Explanation" }],
      missed_opportunities: [{ quote: "Original phrasing", sharper_alternative: "Sharper alternative" }],
      coach_message: "Assessment of verbal sharpness",
      recommended_exercise: { title: "One-Sentence Comparison", description: "Describe the situation using an unexpected analogy", duration_seconds: 30, type: "wit" }
    }
  },

  interview: {
    id: 'interview',
    title: 'Interview Prep',
    icon: '💼',
    description: 'Ace behavioral, technical, and executive questions with dynamic follow-ups.',
    focusMetrics: ['STAR Structure', 'Ownership', 'Quantified Impact', 'Directness', 'Executive Presence'],
    systemPrompt: `You are an AI Executive Interview Coach. Evaluate interview responses for structure (Situation, Task, Action, Result), personal ownership ("I" vs "We"), quantified impact, and directness.
    
    Analyze:
    - Did the candidate answer the question directly in the first sentence?
    - Did they clearly isolate their specific role and actions?
    - Did they provide measurable outcomes/impact?
    - What dynamic follow-up question should a hiring manager ask next?
    
    Ground all feedback in quotes from the transcript.`,
    outputSchema: {
      mode: "interview",
      hasSufficientSpeech: true,
      overall_score: 80,
      scores: { star_structure: 75, ownership: 80, impact: 70, directness: 85, presence: 80 },
      star_breakdown: { situation: "Present", task: "Present", action: "Needs detail", result: "Missing numbers" },
      strengths: ["Direct opening"],
      priority_issues: [{ issue: "Lack of quantified result", why_it_matters: "Proves real impact", how_to_fix: "Add metrics", example_before: "...", example_after: "..." }],
      dynamic_followup_question: "Follow-up question based on user response",
      coach_message: "Interview coaching summary",
      recommended_exercise: { title: "STAR Result Quantification", description: "Re-state the result with specific numbers or metrics", duration_seconds: 45, type: "interview" }
    }
  },

  public_speaking: {
    id: 'public_speaking',
    title: 'Public Speaking',
    icon: '🎙️',
    description: 'Present to simulated audiences with vocal variation, strong hooks, and audience retention.',
    focusMetrics: ['Opening Hook', 'Vocal Variation', 'Audience Retention', 'Transitions', 'Memorable Closing'],
    systemPrompt: `You are an AI Public Speaking & Keynote Coach. Analyze speeches for presentation flow, audience engagement, transitions, vocal pacing, and memorable takeaways.
    
    Evaluate:
    - Opening Hook: Did it capture immediate audience attention?
    - Key takeaways: Were the core points memorable?
    - Pacing & Pauses: Were deliberate pauses used for emphasis?
    - Audience Connection: Did the speaker address the audience directly?`,
    outputSchema: {
      mode: "public_speaking",
      hasSufficientSpeech: true,
      overall_score: 80,
      scores: { hook: 80, variation: 75, engagement: 85, transitions: 70, closing: 80 },
      audience_reaction_simulation: "Curious and attentive during opening, wanted clearer transition at mid-point",
      best_statement: { quote: "User quote", impact: "High resonance" },
      priority_issues: [{ issue: "Abrupt transition", why_it_matters: "Loses audience context", how_to_fix: "Use a signpost phrase", example_before: "...", example_after: "..." }],
      coach_message: "Keynote presentation feedback",
      recommended_exercise: { title: "Signpost Transition Practice", description: "Practice transitioning smoothly between point 1 and point 2", duration_seconds: 45, type: "public_speaking" }
    }
  },

  technical: {
    id: 'technical',
    title: 'Technical Explanation',
    icon: '🧠',
    description: 'Explain complex concepts simply using analogies and audience adaptation.',
    focusMetrics: ['Accuracy', 'Simplicity', 'Analogy Quality', 'Audience Adaptation', 'Conciseness'],
    systemPrompt: `You are an AI Technical Communication Coach. Evaluate how well the user explains technical concepts to different audiences (e.g. non-technical executives vs senior engineers).
    
    Analyze:
    - Simplicity: Was jargon eliminated or clearly defined?
    - Analogy: Did the speaker use a relatable real-world comparison?
    - Logical Progression: Did the explanation build from fundamental concepts to details?
    - Audience Adaptability: How would an executive understand this vs a technical peer?`,
    outputSchema: {
      mode: "technical",
      hasSufficientSpeech: true,
      overall_score: 80,
      scores: { accuracy: 90, simplicity: 75, analogy: 70, structure: 85, conciseness: 80 },
      jargon_detected: [{ term: "Jargon term", recommendation: "Simpler alternative" }],
      analogy_evaluation: { used: true, quote: "...", strength: "Clear but could be more intuitive" },
      executive_summary_version: "Suggested 1-sentence version for executives",
      coach_message: "Technical explanation evaluation",
      recommended_exercise: { title: "Explain Like I'm 10", description: "Explain the same concept without using technical terms", duration_seconds: 60, type: "technical" }
    }
  },

  impromptu: {
    id: 'impromptu',
    title: 'Impromptu Challenge',
    icon: '⚡',
    description: 'Think on your feet with random topics under tight time pressure.',
    focusMetrics: ['Thinking Speed', 'Structure Under Pressure', 'Fluency', 'Filler Control', 'Strong Ending'],
    systemPrompt: `You are an AI Impromptu Speaking Coach. Evaluate spontaneous responses delivered under time pressure.
    
    Analyze:
    - Immediate Structure: Did the speaker establish a clear stance or framework within 5 seconds?
    - Fluency under pressure: Were there long awkward pauses or frantic rambling?
    - Landing the ending: Did the response finish cleanly or fizzle out?`,
    outputSchema: {
      mode: "impromptu",
      hasSufficientSpeech: true,
      overall_score: 75,
      scores: { speed: 80, structure: 70, fluency: 75, fillers: 70, ending: 65 },
      structure_detected: "Point-Reason-Example-Point (PREP)",
      priority_issues: [{ issue: "Weak conclusion", why_it_matters: "Ending feels unfinished", how_to_fix: "Restate main stance clearly", example_before: "...", example_after: "..." }],
      coach_message: "Impromptu response evaluation",
      recommended_exercise: { title: "PREP Framework Finish", description: "Re-deliver the last 15 seconds concluding with conviction", duration_seconds: 30, type: "impromptu" }
    }
  },

  deep_analysis: {
    id: 'deep_analysis',
    title: 'Deep Multi-Dimensional Analysis',
    icon: '🔍',
    description: 'Comprehensive evaluation across language, delivery, structure, and presence.',
    focusMetrics: ['Clarity', 'Structure', 'Conciseness', 'Delivery', 'Storytelling', 'Vocabulary', 'Presence'],
    systemPrompt: `You are a Senior Communication Architect conducting a deep multi-dimensional analysis of the speech transcript.
    
    Provide comprehensive evaluation across all core dimensions, but restrict action items to the TOP 3 highest-leverage changes. Ground every metric in transcript evidence.`,
    outputSchema: {
      mode: "deep_analysis",
      hasSufficientSpeech: true,
      overall_score: 80,
      scores: { clarity: 85, structure: 75, conciseness: 80, delivery: 75, storytelling: 70, vocabulary: 85, presence: 80 },
      strengths: ["Strong vocabulary", "Clear thesis"],
      priority_issues: [{ issue: "Issue", why_it_matters: "Why", how_to_fix: "Fix", example_before: "...", example_after: "..." }],
      filler_words: [{ word: "like", count: 3 }],
      best_moment: { quote: "...", why_it_worked: "..." },
      weakest_moment: { quote: "...", why_it_failed: "...", better_approach: "..." },
      coach_message: "Deep diagnostic summary",
      recommended_exercise: { title: "Targeted Pause Drill", description: "Eliminate repetitive connectors", duration_seconds: 60, type: "general" }
    }
  },

  daily_training: {
    id: 'daily_training',
    title: 'Daily Training Challenge',
    icon: '🎯',
    description: 'Personalized micro-drill targeting your recurring communication weaknesses.',
    focusMetrics: ['Targeted Weakness', 'Execution Precision', 'Improvement Delta'],
    systemPrompt: `You are an AI Adaptive Communication Coach running a daily personalized micro-training session based on the user's past recurring weaknesses. Evaluate how effectively they addressed the targeted weakness.`,
    outputSchema: {
      mode: "daily_training",
      hasSufficientSpeech: true,
      overall_score: 85,
      scores: { targeted_skill: 85, execution: 80, precision: 90 },
      weakness_addressed: "Filler Word Reduction",
      improvement_noted: "Reduced filler rate from 5% to under 1%",
      coach_message: "Daily drill completed successfully",
      recommended_exercise: { title: "Maintain Momentum", description: "Apply this habit in your next meeting", duration_seconds: 60, type: "daily" }
    }
  }
};
