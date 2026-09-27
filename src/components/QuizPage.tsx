import React, { useState, useEffect } from 'react';
import { Quiz, QuizAttempt, QuizQuestion } from '../types/quiz';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  X,
  Grid,
  Clock,
  Send,
  RotateCcw
} from 'lucide-react';

interface QuizPageProps {
  quiz: Quiz;
  onSubmit: (attempt: QuizAttempt) => void;
  onExit: () => void;
}

export const QuizPage: React.FC<QuizPageProps> = ({ quiz, onSubmit, onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [showExitModal, setShowExitModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showQuestionGrid, setShowQuestionGrid] = useState(false);
  const [startTime] = useState<number>(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  // Warn before browser unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (Object.keys(userAnswers).length > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [userAnswers]);

  const questions = quiz.questions;
  const currentQuestion: QuizQuestion | undefined = questions[currentIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(userAnswers).length;
  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  const selectedAnswer = currentQuestion ? userAnswers[currentQuestion.id] : undefined;

  const handleSelectOption = (option: string) => {
    if (!currentQuestion) return;
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: option,
    }));
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setShowSubmitModal(true);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleFinalSubmit = () => {
    setShowSubmitModal(false);

    let correctCount = 0;
    const weakTopicsSet = new Set<string>();

    questions.forEach((q) => {
      const studentAns = userAnswers[q.id];
      if (studentAns && studentAns.trim() === q.correctAnswer.trim()) {
        correctCount++;
      } else {
        // Record weak topic
        if (q.topic) {
          weakTopicsSet.add(q.topic.trim());
        }
      }
    });

    const percentage = Math.round((correctCount / totalQuestions) * 100);

    const attempt: QuizAttempt = {
      id: 'attempt_' + Date.now(),
      quizId: quiz.id,
      completedAt: new Date().toISOString(),
      userAnswers,
      score: correctCount,
      totalQuestions,
      percentage,
      weakTopics: Array.from(weakTopicsSet),
      timeSpentSeconds: elapsedSeconds,
    };

    onSubmit(attempt);
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!currentQuestion) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-slate-600">No questions found in this quiz.</p>
        <button
          onClick={onExit}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28 pt-2 px-4 sm:px-6 max-w-2xl mx-auto flex flex-col justify-between">
      {/* Top Header / Status Bar */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowExitModal(true)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Exit Quiz"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title & Topic badge */}
          <div className="text-center flex-1 mx-2">
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 tracking-wide uppercase">
              {currentQuestion.topic || quiz.title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Timer */}
            <div className="flex items-center gap-1 text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatTimer(elapsedSeconds)}</span>
            </div>

            {/* Question Grid Toggle */}
            <button
              onClick={() => setShowQuestionGrid(!showQuestionGrid)}
              className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors text-xs font-bold flex items-center gap-1"
              title="Overview of all questions"
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Question Counter & Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600">
            <span>
              Question <span className="text-indigo-600">{currentIndex + 1}</span> of {totalQuestions}
            </span>
            <span className="text-slate-400 text-[11px]">
              {answeredCount}/{totalQuestions} Answered
            </span>
          </div>

          {/* Visual Progress Bar */}
          <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="my-6 space-y-6 flex-1 flex flex-col justify-center">
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-sm space-y-5">
          {/* Question Metadata */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              {currentQuestion.type === 'true-false' ? 'True / False' : 'Multiple Choice'}
            </span>

            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
              currentQuestion.difficulty === 'Easy'
                ? 'bg-emerald-100 text-emerald-800'
                : currentQuestion.difficulty === 'Hard'
                ? 'bg-rose-100 text-rose-800'
                : 'bg-indigo-100 text-indigo-800'
            }`}>
              {currentQuestion.difficulty}
            </span>
          </div>

          {/* Question Text */}
          <h2 className="text-base sm:text-xl font-bold text-slate-900 leading-snug">
            {currentQuestion.question}
          </h2>

          {/* Answer Options */}
          <div className="space-y-2.5 pt-2">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedAnswer === option;
              const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
              const letter = currentQuestion.type === 'true-false'
                ? (option === 'True' ? 'T' : 'F')
                : (optionLetters[idx] || (idx + 1));

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectOption(option)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center gap-3.5 group active:scale-[0.99] ${
                    isSelected
                      ? 'bg-indigo-50/90 border-indigo-600 text-indigo-950 ring-2 ring-indigo-600/20 shadow-xs'
                      : 'bg-slate-50/70 border-slate-200 text-slate-800 hover:bg-slate-100/80 hover:border-slate-300'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl font-extrabold text-xs flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 group-hover:border-slate-300'
                    }`}
                  >
                    {letter}
                  </div>

                  <span className="text-xs sm:text-sm font-semibold flex-1 leading-relaxed">
                    {option}
                  </span>

                  {isSelected && (
                    <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="sticky bottom-0 bg-white/95 backdrop-blur-md pt-3 pb-4 border-t border-slate-200 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className={`px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all ${
            currentIndex === 0
              ? 'opacity-40 text-slate-400 bg-slate-100 cursor-not-allowed'
              : 'text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Prev</span>
        </button>

        {currentIndex === totalQuestions - 1 ? (
          <button
            type="button"
            onClick={() => setShowSubmitModal(true)}
            className="flex-1 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 hover:from-emerald-700 hover:to-teal-700 active:scale-[0.98] transition-all"
          >
            <span>Submit Quiz</span>
            <Send className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            className="flex-1 py-3.5 px-5 rounded-2xl bg-indigo-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 active:scale-[0.98] transition-all"
          >
            <span>Next Question</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Question Navigation Drawer / Modal */}
      {showQuestionGrid && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Question Navigator</h3>
              <button
                onClick={() => setShowQuestionGrid(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-5 gap-2.5 max-h-60 overflow-y-auto p-1">
              {questions.map((q, idx) => {
                const isAnswered = !!userAnswers[q.id];
                const isCurrent = idx === currentIndex;
                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setShowQuestionGrid(false);
                    }}
                    className={`h-11 rounded-xl font-bold text-xs flex flex-col items-center justify-center transition-all ${
                      isCurrent
                        ? 'ring-2 ring-indigo-600 bg-indigo-600 text-white'
                        : isAnswered
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>{idx + 1}</span>
                    <span className="text-[9px] font-normal">
                      {isAnswered ? 'Done' : 'Empty'}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Answered ({answeredCount})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" /> Left ({totalQuestions - answeredCount})
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Exit Confirmation Modal */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Exit Quiz?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Your current answers for this quiz will be lost if you leave before submitting.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setShowExitModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Keep Playing
              </button>
              <button
                onClick={onExit}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700"
              >
                Yes, Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 mx-auto flex items-center justify-center">
              <Send className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Submit Your Answers?</h3>
              {totalQuestions - answeredCount > 0 ? (
                <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200 mt-2">
                  ⚠️ You still have <strong>{totalQuestions - answeredCount} unanswered</strong> question(s). Unanswered questions will be counted as incorrect.
                </p>
              ) : (
                <p className="text-xs text-slate-500 mt-1">
                  You answered all {totalQuestions} questions! Ready to see your score and weak topics?
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Review First
              </button>
              <button
                onClick={handleFinalSubmit}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700"
              >
                Submit Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
