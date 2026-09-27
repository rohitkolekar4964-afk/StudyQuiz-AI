import React, { useEffect, useState } from 'react';
import { Quiz, QuizAttempt } from '../types/quiz';
import confetti from 'canvas-confetti';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  PlusCircle,
  Sparkles,
  ArrowRight,
  Filter,
  Flame,
  Clock,
  BookOpen,
  Check,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface ResultPageProps {
  quiz: Quiz;
  attempt: QuizAttempt;
  onPracticeWeakTopics: (weakTopics: string[], originalNotes: string) => void;
  onRetakeQuiz: () => void;
  onCreateNewQuiz: () => void;
  onGoHome: () => void;
}

export const ResultPage: React.FC<ResultPageProps> = ({
  quiz,
  attempt,
  onPracticeWeakTopics,
  onRetakeQuiz,
  onCreateNewQuiz,
  onGoHome,
}) => {
  const [filter, setFilter] = useState<'all' | 'mistakes' | 'correct'>('all');
  const [expandedExplanation, setExpandedExplanation] = useState<Record<string, boolean>>({});

  // Trigger celebration confetti for scores >= 70%
  useEffect(() => {
    if (attempt.percentage >= 70) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Ignore confetti if not supported
      }
    }
  }, [attempt.percentage]);

  const incorrectCount = attempt.totalQuestions - attempt.score;
  const questions = quiz.questions;

  // Aggregate questions by weak topics
  const missedQuestions = questions.filter(
    (q) => !attempt.userAnswers[q.id] || attempt.userAnswers[q.id].trim() !== q.correctAnswer.trim()
  );

  const correctQuestions = questions.filter(
    (q) => attempt.userAnswers[q.id] && attempt.userAnswers[q.id].trim() === q.correctAnswer.trim()
  );

  const filteredQuestions =
    filter === 'mistakes'
      ? missedQuestions
      : filter === 'correct'
      ? correctQuestions
      : questions;

  const toggleExplanation = (id: string) => {
    setExpandedExplanation((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getGradeMessage = (percentage: number) => {
    if (percentage === 100) return { title: 'Perfect Score! 🌟', sub: 'Incredible! You have complete mastery of these notes.' };
    if (percentage >= 80) return { title: 'Excellent Work! 🚀', sub: 'Strong grasp of the subject. A few details to polish.' };
    if (percentage >= 60) return { title: 'Good Effort! 📚', sub: 'You understand the basics, but some topics need revision.' };
    return { title: 'Needs More Review! 💪', sub: "Don't worry! Practice your weak topics to master these concepts." };
  };

  const grade = getGradeMessage(attempt.percentage);

  return (
    <div className="pb-28 pt-4 px-4 sm:px-6 max-w-2xl mx-auto space-y-6">
      {/* Score Summary Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-lg text-center space-y-5 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-500" />

        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-indigo-50 border border-indigo-100 text-indigo-600 mx-auto shadow-inner">
          <Trophy className="w-10 h-10" />
        </div>

        <div className="space-y-1">
          <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            {attempt.percentage}%
          </span>
          <h2 className="text-lg font-bold text-slate-800">{grade.title}</h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">{grade.sub}</p>
        </div>

        {/* Score Counters Row */}
        <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-slate-100">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Score</span>
            <span className="text-lg font-extrabold text-slate-900">
              {attempt.score}/{attempt.totalQuestions}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">Correct</span>
            <span className="text-lg font-extrabold text-emerald-700 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-4 h-4 inline" />
              {attempt.score}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block">Incorrect</span>
            <span className="text-lg font-extrabold text-rose-700 flex items-center justify-center gap-1">
              <XCircle className="w-4 h-4 inline" />
              {incorrectCount}
            </span>
          </div>
        </div>
      </div>

      {/* WEAK TOPICS SECTION (Crucial Core Feature) */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300/80 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-amber-950 text-base">
                Review Weak Topics
              </h3>
              <p className="text-xs text-amber-800">
                Concepts where you made mistakes on this quiz
              </p>
            </div>
          </div>

          <span className="text-xs font-extrabold bg-amber-200 text-amber-900 px-2.5 py-1 rounded-full">
            {attempt.weakTopics.length} Detected
          </span>
        </div>

        {attempt.weakTopics.length > 0 ? (
          <>
            <div className="space-y-2 pt-1">
              <p className="text-xs font-semibold text-amber-900">
                Focus your review on these key areas:
              </p>
              <div className="flex flex-wrap gap-2">
                {attempt.weakTopics.map((topic, i) => (
                  <div
                    key={i}
                    className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-xs font-bold text-amber-950 shadow-xs flex items-center gap-1.5"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>{topic}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Practice Weak Topics Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => onPracticeWeakTopics(attempt.weakTopics, quiz.originalNotes)}
                className="w-full py-3.5 px-4 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-600/25 active:scale-[0.98] transition-all"
              >
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>Practice Weak Topics</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
              <p className="text-[11px] text-center text-amber-700/90 mt-1.5">
                Generates a new custom quiz focused directly on these topics from your notes.
              </p>
            </div>
          </>
        ) : (
          <div className="p-3 bg-white/80 rounded-2xl border border-amber-200 text-center">
            <p className="text-xs font-bold text-emerald-800 flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Outstanding! No weak topics detected in this quiz set.
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onRetakeQuiz}
          className="py-3.5 px-4 rounded-2xl bg-white border border-slate-200 text-slate-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-slate-50 active:scale-95 transition-all shadow-xs"
        >
          <RotateCcw className="w-4 h-4 text-indigo-600" />
          <span>Take Quiz Again</span>
        </button>

        <button
          type="button"
          onClick={onCreateNewQuiz}
          className="py-3.5 px-4 rounded-2xl bg-indigo-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-indigo-700 active:scale-95 transition-all shadow-xs"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Quiz</span>
        </button>
      </div>

      {/* Question-by-Question Detailed Review */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-slate-900 text-base">
            Detailed Review
          </h3>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                filter === 'all' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600'
              }`}
            >
              All ({questions.length})
            </button>
            <button
              onClick={() => setFilter('mistakes')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                filter === 'mistakes' ? 'bg-white text-rose-700 shadow-2xs font-bold' : 'text-slate-600'
              }`}
            >
              Mistakes ({missedQuestions.length})
            </button>
            <button
              onClick={() => setFilter('correct')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                filter === 'correct' ? 'bg-white text-emerald-700 shadow-2xs font-bold' : 'text-slate-600'
              }`}
            >
              Correct ({correctQuestions.length})
            </button>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-3">
          {filteredQuestions.map((q, idx) => {
            const studentAnswer = attempt.userAnswers[q.id];
            const isCorrect = studentAnswer && studentAnswer.trim() === q.correctAnswer.trim();
            const isExpanded = expandedExplanation[q.id] !== false; // default expanded

            return (
              <div
                key={q.id}
                className={`bg-white rounded-2xl p-4 sm:p-5 border shadow-2xs space-y-3 transition-all ${
                  isCorrect ? 'border-emerald-200' : 'border-rose-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`w-6 h-6 rounded-lg text-xs font-extrabold flex items-center justify-center shrink-0 ${
                        isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {questions.findIndex(item => item.id === q.id) + 1}
                    </span>

                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                      {q.topic}
                    </span>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
                      isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {isCorrect ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Correct</span>
                      </>
                    ) : (
                      <>
                        <X className="w-3.5 h-3.5" />
                        <span>Incorrect</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Question Statement */}
                <h4 className="text-sm font-bold text-slate-900 leading-snug">
                  {q.question}
                </h4>

                {/* Answers Comparison */}
                <div className="space-y-1.5 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <span className="text-slate-500">Your Answer:</span>
                    <span
                      className={`font-semibold ${
                        isCorrect ? 'text-emerald-700' : 'text-rose-700 line-through'
                      }`}
                    >
                      {studentAnswer || '(No answer provided)'}
                    </span>
                  </div>

                  {!isCorrect && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                      <span className="text-emerald-800 font-medium">Correct Answer:</span>
                      <span className="font-bold text-emerald-900">{q.correctAnswer}</span>
                    </div>
                  )}
                </div>

                {/* Explanation */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs space-y-1">
                    <span className="font-bold text-indigo-900 block flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                      Explanation from your notes:
                    </span>
                    <p className="text-slate-700 leading-relaxed font-normal">
                      {q.explanation}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Return to Dashboard Footer */}
      <div className="pt-4 text-center">
        <button
          onClick={onGoHome}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 hover:underline"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
};
