export type QuestionType = 'Multiple Choice' | 'True/False' | 'Mixed';
export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

export interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'true-false';
  topic: string;
  difficulty: DifficultyLevel;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  completedAt: string;
  userAnswers: Record<string, string>; // questionId -> selected option text
  score: number;
  totalQuestions: number;
  percentage: number;
  weakTopics: string[];
  timeSpentSeconds: number;
}

export interface Quiz {
  id: string;
  title: string;
  summary?: string;
  difficulty: DifficultyLevel;
  questionType: QuestionType;
  questions: QuizQuestion[];
  createdAt: string;
  originalNotes: string;
  sourceFocusTopics?: string[]; // if created via 'Practice Weak Topics'
  lastAttempt?: QuizAttempt;
  attemptsCount?: number;
}

export interface GenerateQuizPayload {
  notes: string;
  questionCount: number;
  difficulty: DifficultyLevel;
  questionType: QuestionType;
  focusTopics?: string[];
  customTitle?: string;
}

export interface StudyStats {
  quizzesCreated: number;
  quizzesCompleted: number;
  totalQuestionsAnswered: number;
  averageScore: number;
  weakTopicsList: { topic: string; count: number }[];
}

export interface GenerateQuizResponse {
  success: boolean;
  quiz?: {
    title: string;
    summary: string;
    questions: QuizQuestion[];
  };
  error?: string;
}
