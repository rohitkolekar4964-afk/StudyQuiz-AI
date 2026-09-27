import { Quiz, QuizAttempt, StudyStats } from '../types/quiz';
import { SAMPLE_NOTES } from '../data/sampleNotes';

const STORAGE_KEY = 'studyquiz_saved_quizzes_v1';

export function getStoredQuizzes(): Quiz[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Seed default demo quiz so the student can immediately test
      return seedDefaultDemoQuiz();
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to read quizzes from localStorage', err);
    return [];
  }
}

export function saveQuiz(quiz: Quiz): void {
  try {
    const existing = getStoredQuizzes();
    const index = existing.findIndex(q => q.id === quiz.id);
    let updated: Quiz[];
    if (index >= 0) {
      updated = [...existing];
      updated[index] = quiz;
    } else {
      updated = [quiz, ...existing];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save quiz to localStorage', err);
  }
}

export function getQuizById(id: string): Quiz | undefined {
  const quizzes = getStoredQuizzes();
  return quizzes.find(q => q.id === id);
}

export function deleteQuiz(id: string): void {
  try {
    const existing = getStoredQuizzes();
    const filtered = existing.filter(q => q.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error('Failed to delete quiz from localStorage', err);
  }
}

export function recordQuizAttempt(quizId: string, attempt: QuizAttempt): Quiz | undefined {
  try {
    const existing = getStoredQuizzes();
    const index = existing.findIndex(q => q.id === quizId);
    if (index === -1) return undefined;

    const quiz = existing[index];
    const updatedQuiz: Quiz = {
      ...quiz,
      lastAttempt: attempt,
      attemptsCount: (quiz.attemptsCount || 0) + 1,
    };

    existing[index] = updatedQuiz;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    return updatedQuiz;
  } catch (err) {
    console.error('Failed to record attempt', err);
    return undefined;
  }
}

export function getStudyStats(): StudyStats {
  const quizzes = getStoredQuizzes();
  const completedAttempts: QuizAttempt[] = [];

  quizzes.forEach(q => {
    if (q.lastAttempt) {
      completedAttempts.push(q.lastAttempt);
    }
  });

  const quizzesCreated = quizzes.length;
  const quizzesCompleted = completedAttempts.length;
  const totalQuestionsAnswered = completedAttempts.reduce((acc, curr) => acc + curr.totalQuestions, 0);

  const averageScore = quizzesCompleted > 0
    ? Math.round(completedAttempts.reduce((acc, curr) => acc + curr.percentage, 0) / quizzesCompleted)
    : 0;

  // Aggregate weak topics count
  const topicCountMap: Record<string, number> = {};
  completedAttempts.forEach(attempt => {
    (attempt.weakTopics || []).forEach(topic => {
      const trimmed = topic.trim();
      if (trimmed) {
        topicCountMap[trimmed] = (topicCountMap[trimmed] || 0) + 1;
      }
    });
  });

  const weakTopicsList = Object.entries(topicCountMap)
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count);

  return {
    quizzesCreated,
    quizzesCompleted,
    totalQuestionsAnswered,
    averageScore,
    weakTopicsList,
  };
}

function seedDefaultDemoQuiz(): Quiz[] {
  const bioNotes = SAMPLE_NOTES[0];
  const demoQuiz: Quiz = {
    id: 'demo-biology-quiz',
    title: 'Photosynthesis & Cellular Respiration',
    summary: 'Master key concepts of light reactions, Calvin cycle, and chloroplast structure.',
    difficulty: 'Medium',
    questionType: 'Mixed',
    createdAt: new Date().toISOString(),
    originalNotes: bioNotes.notes,
    questions: [
      {
        id: 'demo_q1',
        type: 'multiple-choice',
        topic: 'Chloroplast Structure',
        difficulty: 'Medium',
        question: 'In which part of the chloroplast do the light-dependent reactions take place?',
        options: [
          'Thylakoid membrane',
          'Stroma fluid',
          'Outer chloroplast envelope',
          'Mitochondrial matrix',
        ],
        correctAnswer: 'Thylakoid membrane',
        explanation: 'According to the notes, light-dependent reactions occur specifically within the thylakoid membrane, where chlorophyll pigments and photosystems are embedded.',
      },
      {
        id: 'demo_q2',
        type: 'true-false',
        topic: 'Light Reactions',
        difficulty: 'Easy',
        question: 'Photolysis (the splitting of water at Photosystem II) releases oxygen gas (O2) as a byproduct.',
        options: ['True', 'False'],
        correctAnswer: 'True',
        explanation: 'The notes clearly state: "Photolysis (splitting of water) at PSII produces electrons, protons (H+), and releases oxygen gas (O2) as a byproduct."',
      },
      {
        id: 'demo_q3',
        type: 'multiple-choice',
        topic: 'Calvin Cycle',
        difficulty: 'Medium',
        question: 'Which key enzyme catalyzes the attachment of CO2 to RuBP during the carbon fixation phase?',
        options: [
          'RuBisCO',
          'ATP Synthase',
          'DNA Polymerase',
          'Amylase',
        ],
        correctAnswer: 'RuBisCO',
        explanation: 'The notes state: "Phase 1 (Carbon Fixation): The enzyme RuBisCO catalyzes the attachment of CO2 to a 5-carbon sugar called ribulose 1,5-bisphosphate (RuBP)."',
      },
      {
        id: 'demo_q4',
        type: 'true-false',
        topic: 'Cellular Respiration',
        difficulty: 'Medium',
        question: 'Glycolysis requires oxygen to proceed and takes place inside the inner mitochondrial matrix.',
        options: ['True', 'False'],
        correctAnswer: 'False',
        explanation: 'The notes state: "Glycolysis is anaerobic (does not require oxygen) and occurs in the cytoplasm, yielding 2 net ATP."',
      },
      {
        id: 'demo_q5',
        type: 'multiple-choice',
        topic: 'ATP Synthesis',
        difficulty: 'Hard',
        question: 'What directly powers the synthesis of ATP by ATP synthase during the light-dependent reactions?',
        options: [
          'A proton (H+) concentration gradient across the thylakoid membrane',
          'Direct absorption of green wavelengths of light',
          'The breakdown of glucose molecules in the stroma',
          'The oxidation of RuBP in the Calvin cycle',
        ],
        correctAnswer: 'A proton (H+) concentration gradient across the thylakoid membrane',
        explanation: 'The notes state that electrons moving down the electron transport chain pump H+ into the thylakoid lumen, and "ATP synthase utilizes this proton gradient to synthesize ATP from ADP and inorganic phosphate."',
      },
    ],
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([demoQuiz]));
  } catch (e) {
    // Ignore storage errors
  }
  return [demoQuiz];
}
