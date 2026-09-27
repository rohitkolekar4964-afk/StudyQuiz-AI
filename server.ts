import express, { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Helper to get Gemini Client with required aistudio-build telemetry
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Fallback generator for testing when API key is completely absent
function generateFallbackQuiz(notes: string, count: number, difficulty: string, questionType: string, focusTopics?: string[]) {
  const sampleTopics = focusTopics && focusTopics.length > 0 
    ? focusTopics 
    : ['Core Concepts', 'Key Terminology', 'Process & Function', 'Important Facts', 'Mechanisms'];
  
  // Extract simple sentences from notes
  const sentences = notes
    .split(/[.!?\n]+/)
    .map(s => s.trim())
    .filter(s => s.length > 25);
  
  const baseTitle = sentences[0] ? sentences[0].slice(0, 40) + ' Study Quiz' : 'Study Notes Quiz';
  
  const questions = [];
  for (let i = 0; i < Math.min(count, 10); i++) {
    const isTF = questionType === 'True/False' || (questionType === 'Mixed' && i % 2 === 1);
    const topic = sampleTopics[i % sampleTopics.length] || 'Key Notes';
    const refSentence = sentences[i % sentences.length] || 'Reviewing key concepts from your study notes.';

    if (isTF) {
      const isTrue = i % 2 === 0;
      questions.push({
        id: `q_${i + 1}`,
        type: 'true-false' as const,
        topic,
        difficulty: difficulty as any,
        question: `According to the notes: "${refSentence}"`,
        options: ['True', 'False'],
        correctAnswer: 'True',
        explanation: `This statement is directly verified in your notes: "${refSentence}".`,
      });
    } else {
      questions.push({
        id: `q_${i + 1}`,
        type: 'multiple-choice' as const,
        topic,
        difficulty: difficulty as any,
        question: `Which statement accurately reflects the note: "${refSentence}"?`,
        options: [
          `Correct: ${refSentence}`,
          `Alternative contradictory claim A`,
          `Unrelated detail not mentioned in notes`,
          `Opposite of what the study notes state`,
        ],
        correctAnswer: `Correct: ${refSentence}`,
        explanation: `Directly supported by your notes: "${refSentence}".`,
      });
    }
  }

  return {
    title: baseTitle,
    summary: `Practice quiz covering key concepts from your notes at ${difficulty} level.`,
    questions,
  };
}

// API: Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    hasApiKey: !!process.env.GEMINI_API_KEY,
  });
});

// API: Generate Quiz from Notes
app.post('/api/generate-quiz', async (req: Request, res: Response) => {
  try {
    const { notes, questionCount = 5, difficulty = 'Medium', questionType = 'Multiple Choice', focusTopics, customTitle } = req.body;

    // Validation
    if (!notes || typeof notes !== 'string' || notes.trim().length < 25) {
      return res.status(400).json({
        success: false,
        error: 'Please paste some study notes (at least 25 characters) to generate a quiz.',
      });
    }

    if (notes.length > 50000) {
      return res.status(400).json({
        success: false,
        error: 'Study notes are too long (over 50,000 characters). Please paste a specific chapter or summary.',
      });
    }

    const count = Math.min(Math.max(parseInt(questionCount, 10) || 5, 3), 25);
    const validDifficulties = ['Easy', 'Medium', 'Hard'];
    const selectedDifficulty = validDifficulties.includes(difficulty) ? difficulty : 'Medium';

    const validTypes = ['Multiple Choice', 'True/False', 'Mixed'];
    const selectedType = validTypes.includes(questionType) ? questionType : 'Multiple Choice';

    const ai = getGeminiClient();

    if (!ai) {
      console.warn('GEMINI_API_KEY not configured. Using generated offline fallback questions.');
      const fallback = generateFallbackQuiz(notes, count, selectedDifficulty, selectedType, focusTopics);
      return res.json({
        success: true,
        quiz: fallback,
        notice: 'Generated using local parser (Configure GEMINI_API_KEY for full AI capability).',
      });
    }

    // Build system instructions and prompt
    let promptInstruction = `You are an expert, encouraging study tutor creating a tailored practice quiz for a student.\n\n` +
      `STRICT RULES:\n` +
      `1. Ground all questions, answers, and explanations SOLELY in the provided study notes. Do NOT introduce external or unmentioned facts.\n` +
      `2. Generate exactly ${count} questions.\n` +
      `3. Target difficulty: ${selectedDifficulty}.\n` +
      `4. Question format requirement: ${selectedType}.\n`;

    if (selectedType === 'Multiple Choice') {
      promptInstruction += `   - Every question must be 'multiple-choice' with EXACTLY 4 options.\n` +
        `   - Exactly 1 option must be the correct answer.\n` +
        `   - The correctAnswer string MUST match one of the items in options word-for-word.\n`;
    } else if (selectedType === 'True/False') {
      promptInstruction += `   - Every question must be 'true-false' with options: ["True", "False"].\n` +
        `   - The correctAnswer must be either "True" or "False".\n`;
    } else {
      promptInstruction += `   - Provide a balanced mix of 'multiple-choice' (with 4 options) and 'true-false' (with ["True", "False"]).\n`;
    }

    promptInstruction += `5. Tag each question with a specific 'topic' (1-4 words) representing the concept (e.g. 'Photosystem II', 'Krebs Cycle', 'Atomic Structure').\n` +
      `6. Write clear, educational explanations for each question that reference the notes so students learn from their mistakes.\n`;

    if (focusTopics && Array.isArray(focusTopics) && focusTopics.length > 0) {
      promptInstruction += `\nSPECIAL ADAPTIVE FOCUS:\n` +
        `The student previously made mistakes on these weak topics: [${focusTopics.join(', ')}].\n` +
        `Prioritize asking questions testing, clarifying, and reinforcing these specific weak topics from the notes!\n`;
    }

    promptInstruction += `\nSTUDENT'S STUDY NOTES:\n"""\n${notes.trim()}\n"""\n`;

    // Try models in order of capability with graceful fallback
    const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
    let textOutput: string | undefined;
    let lastError: any = null;

    const schemaConfig = {
      systemInstruction: 'You are an educational quiz generation assistant that creates accurate quizzes solely based on user notes.',
      temperature: 0.3,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: {
            type: Type.STRING,
            description: 'A concise, student-friendly title for the quiz summarizing the subject of the notes (e.g., "Cellular Respiration & ATP")',
          },
          summary: {
            type: Type.STRING,
            description: 'A 1-sentence encouraging summary of what this quiz covers',
          },
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING, description: 'Question ID like q1, q2, etc.' },
                type: {
                  type: Type.STRING,
                  description: 'Question format: either "multiple-choice" or "true-false"',
                },
                topic: {
                  type: Type.STRING,
                  description: 'The specific subtopic or concept from the notes that this question evaluates',
                },
                difficulty: {
                  type: Type.STRING,
                  description: 'Difficulty level: "Easy", "Medium", or "Hard"',
                },
                question: {
                  type: Type.STRING,
                  description: 'The question or statement text',
                },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'List of choices. 4 options for multiple-choice; ["True", "False"] for true-false',
                },
                correctAnswer: {
                  type: Type.STRING,
                  description: 'The exact string matching one of the options',
                },
                explanation: {
                  type: Type.STRING,
                  description: 'Concise explanation referencing the study notes why this answer is correct',
                },
              },
              required: ['id', 'type', 'topic', 'difficulty', 'question', 'options', 'correctAnswer', 'explanation'],
            },
          },
        },
        required: ['title', 'summary', 'questions'],
      },
    };

    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: promptInstruction,
          config: schemaConfig,
        });
        if (response.text) {
          textOutput = response.text;
          break;
        }
      } catch (err: any) {
        console.warn(`Model ${model} attempt failed:`, err.message || err);
        lastError = err;
        // Continue to next candidate model
      }
    }

    if (!textOutput) {
      console.warn('All Gemini models encountered temporary limits. Generating structured fallback quiz from study notes.');
      const fallback = generateFallbackQuiz(notes, count, selectedDifficulty, selectedType, focusTopics);
      return res.json({
        success: true,
        quiz: fallback,
        notice: 'Generated using notes parser due to temporary AI model high demand.',
      });
    }

    const parsed = JSON.parse(textOutput);

    // Sanitize and ensure valid questions
    if (!parsed.questions || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      throw new Error('AI could not formulate valid questions from the provided notes.');
    }

    // Clean and validate questions
    const sanitizedQuestions = parsed.questions.map((q: any, idx: number) => {
      let options = Array.isArray(q.options) ? q.options.map(String) : [];
      const type = q.type === 'true-false' ? 'true-false' : 'multiple-choice';

      if (type === 'true-false') {
        options = ['True', 'False'];
      } else if (options.length < 2) {
        options = ['Option A', 'Option B', 'Option C', 'Option D'];
      }

      // Ensure correctAnswer is in options
      let correctAnswer = String(q.correctAnswer || '').trim();
      const match = options.find((o: string) => o.toLowerCase().trim() === correctAnswer.toLowerCase());
      if (match) {
        correctAnswer = match;
      } else {
        // Fallback to first option if not found
        correctAnswer = options[0];
      }

      return {
        id: q.id || `q_${idx + 1}`,
        type,
        topic: (q.topic || 'General').trim(),
        difficulty: validDifficulties.includes(q.difficulty) ? q.difficulty : selectedDifficulty,
        question: (q.question || `Question ${idx + 1}`).trim(),
        options,
        correctAnswer,
        explanation: (q.explanation || 'Based on the facts outlined in your study notes.').trim(),
      };
    });

    res.json({
      success: true,
      quiz: {
        title: customTitle || parsed.title || 'Study Quiz',
        summary: parsed.summary || `A ${sanitizedQuestions.length}-question practice quiz based on your study notes.`,
        questions: sanitizedQuestions,
      },
    });
  } catch (err: any) {
    console.error('Quiz Generation Error:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to generate quiz. Please try again or check your study notes.',
    });
  }
});

// Setup Vite or static serving
async function setupApp() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`StudyQuiz AI server running on http://0.0.0.0:${PORT} in ${isProd ? 'production' : 'development'} mode.`);
  });
}

setupApp();
