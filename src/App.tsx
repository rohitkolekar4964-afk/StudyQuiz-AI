/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Quiz, QuizAttempt, StudyStats } from './types/quiz';
import {
  getStoredQuizzes,
  saveQuiz,
  recordQuizAttempt,
  deleteQuiz,
  getStudyStats,
} from './utils/storage';
import { Navbar } from './components/Navbar';
import { HomePage } from './components/HomePage';
import { CreateQuizPage } from './components/CreateQuizPage';
import { QuizPage } from './components/QuizPage';
import { ResultPage } from './components/ResultPage';
import { MyQuizzesPage } from './components/MyQuizzesPage';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'create' | 'quizzes' | 'quiz' | 'result'>('home');
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [stats, setStats] = useState<StudyStats>({
    quizzesCreated: 0,
    quizzesCompleted: 0,
    totalQuestionsAnswered: 0,
    averageScore: 0,
    weakTopicsList: [],
  });

  // Current session states
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [activeAttempt, setActiveAttempt] = useState<QuizAttempt | null>(null);

  // Prefill state for CreateQuizPage
  const [prefillNotes, setPrefillNotes] = useState<string>('');
  const [prefillFocusTopics, setPrefillFocusTopics] = useState<string[]>([]);

  // Load quizzes and stats on mount
  const refreshData = () => {
    const loadedQuizzes = getStoredQuizzes();
    setQuizzes(loadedQuizzes);
    setStats(getStudyStats());
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Handlers
  const handleNavigate = (tab: 'home' | 'create' | 'quizzes') => {
    if (tab === 'create') {
      setPrefillNotes('');
      setPrefillFocusTopics([]);
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartCreateWithPreset = (notes?: string, focusTopics?: string[]) => {
    setPrefillNotes(notes || '');
    setPrefillFocusTopics(focusTopics || []);
    setActiveTab('create');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuizGenerated = (newQuiz: Quiz) => {
    saveQuiz(newQuiz);
    refreshData();
    setActiveQuiz(newQuiz);
    setActiveAttempt(null);
    setActiveTab('quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setActiveAttempt(null);
    setActiveTab('quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewResults = (quiz: Quiz) => {
    if (!quiz.lastAttempt) return;
    setActiveQuiz(quiz);
    setActiveAttempt(quiz.lastAttempt);
    setActiveTab('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuizSubmit = (attempt: QuizAttempt) => {
    if (!activeQuiz) return;
    const updated = recordQuizAttempt(activeQuiz.id, attempt);
    if (updated) {
      setActiveQuiz(updated);
    }
    setActiveAttempt(attempt);
    refreshData();
    setActiveTab('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePracticeWeakTopics = (weakTopics: string[], originalNotes: string) => {
    setPrefillNotes(originalNotes);
    setPrefillFocusTopics(weakTopics);
    setActiveTab('create');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRetakeQuiz = () => {
    if (!activeQuiz) return;
    setActiveTab('quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteQuiz = (quizId: string) => {
    deleteQuiz(quizId);
    refreshData();
    if (activeQuiz && activeQuiz.id === quizId) {
      setActiveQuiz(null);
      setActiveAttempt(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Show Navbar when not actively in a question screen */}
      {activeTab !== 'quiz' && (
        <Navbar
          activeTab={activeTab === 'result' ? 'home' : activeTab}
          onNavigate={handleNavigate}
          savedQuizzesCount={quizzes.length}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <HomePage
            stats={stats}
            recentQuizzes={quizzes}
            onCreateQuiz={handleStartCreateWithPreset}
            onOpenQuiz={handleOpenQuiz}
            onViewResults={handleViewResults}
            onViewAllQuizzes={() => handleNavigate('quizzes')}
          />
        )}

        {activeTab === 'create' && (
          <CreateQuizPage
            initialNotes={prefillNotes}
            initialFocusTopics={prefillFocusTopics}
            onQuizGenerated={handleQuizGenerated}
            onCancel={() => handleNavigate('home')}
          />
        )}

        {activeTab === 'quiz' && activeQuiz && (
          <QuizPage
            quiz={activeQuiz}
            onSubmit={handleQuizSubmit}
            onExit={() => handleNavigate('home')}
          />
        )}

        {activeTab === 'result' && activeQuiz && activeAttempt && (
          <ResultPage
            quiz={activeQuiz}
            attempt={activeAttempt}
            onPracticeWeakTopics={handlePracticeWeakTopics}
            onRetakeQuiz={handleRetakeQuiz}
            onCreateNewQuiz={() => handleStartCreateWithPreset()}
            onGoHome={() => handleNavigate('home')}
          />
        )}

        {activeTab === 'quizzes' && (
          <MyQuizzesPage
            quizzes={quizzes}
            onOpenQuiz={handleOpenQuiz}
            onViewResults={handleViewResults}
            onCreateQuiz={() => handleStartCreateWithPreset()}
            onDeleteQuiz={handleDeleteQuiz}
          />
        )}
      </main>
    </div>
  );
}
