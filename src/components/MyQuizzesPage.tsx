import React, { useState } from 'react';
import { Quiz } from '../types/quiz';
import {
  BookOpen,
  Search,
  Calendar,
  Play,
  Trash2,
  Trophy,
  PlusCircle,
  Clock,
  Layers,
  Sparkles,
  Flame,
  CheckCircle2
} from 'lucide-react';

interface MyQuizzesPageProps {
  quizzes: Quiz[];
  onOpenQuiz: (quiz: Quiz) => void;
  onViewResults: (quiz: Quiz) => void;
  onCreateQuiz: () => void;
  onDeleteQuiz: (quizId: string) => void;
}

export const MyQuizzesPage: React.FC<MyQuizzesPageProps> = ({
  quizzes,
  onOpenQuiz,
  onViewResults,
  onCreateQuiz,
  onDeleteQuiz,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'completed' | 'uncompleted'>('all');
  const [quizToDelete, setQuizToDelete] = useState<Quiz | null>(null);

  const filteredQuizzes = quizzes.filter((quiz) => {
    const matchesSearch =
      quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (quiz.summary && quiz.summary.toLowerCase().includes(searchTerm.toLowerCase())) ||
      quiz.questions.some((q) => q.topic.toLowerCase().includes(searchTerm.toLowerCase()));

    const isCompleted = !!quiz.lastAttempt;
    if (filter === 'completed') return matchesSearch && isCompleted;
    if (filter === 'uncompleted') return matchesSearch && !isCompleted;
    return matchesSearch;
  });

  return (
    <div className="pb-28 pt-4 px-4 sm:px-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Quizzes
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review, retake, or manage your generated quizzes ({quizzes.length} total).
          </p>
        </div>

        <button
          onClick={onCreateQuiz}
          className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-xs hover:bg-indigo-700 active:scale-95 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span className="hidden sm:inline">New Quiz</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by quiz title, topic, or keyword..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden transition-all placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {[
            { id: 'all', label: `All (${quizzes.length})` },
            { id: 'completed', label: `Completed (${quizzes.filter(q => q.lastAttempt).length})` },
            { id: 'uncompleted', label: `Not Taken (${quizzes.filter(q => !q.lastAttempt).length})` },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setFilter(id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filter === id
                  ? 'bg-indigo-600 text-white shadow-2xs font-bold'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Quizzes List */}
      {filteredQuizzes.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 border border-dashed border-slate-300 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-800 text-base">
              {searchTerm ? 'No quizzes match your search' : 'No quizzes saved yet'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchTerm
                ? 'Try a different search query or clear the filter to view all quizzes.'
                : 'Paste notes into the quiz generator to turn them into active practice quizzes!'}
            </p>
          </div>
          {searchTerm ? (
            <button
              onClick={() => setSearchTerm('')}
              className="px-4 py-2 text-xs font-bold text-indigo-600 border border-indigo-200 rounded-xl hover:bg-indigo-50"
            >
              Clear search
            </button>
          ) : (
            <button
              onClick={onCreateQuiz}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs hover:bg-indigo-700 active:scale-95 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Your First Quiz</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredQuizzes.map((quiz) => {
            const hasAttempt = !!quiz.lastAttempt;
            const attempt = quiz.lastAttempt;
            const formattedDate = new Date(quiz.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div
                key={quiz.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs hover:border-indigo-300 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                        {quiz.questions.length} Questions
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700">
                        {quiz.difficulty}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-medium text-slate-500">
                        {quiz.questionType}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formattedDate}
                      </span>
                    </div>

                    <h2 className="font-bold text-sm sm:text-base text-slate-900 leading-snug">
                      {quiz.title}
                    </h2>

                    {quiz.summary && (
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {quiz.summary}
                      </p>
                    )}
                  </div>

                  {/* Score badge if completed */}
                  {hasAttempt && (
                    <div className="shrink-0 text-right">
                      <span
                        className={`inline-block px-3 py-1.5 rounded-xl font-extrabold text-xs sm:text-sm ${
                          (attempt?.percentage || 0) >= 80
                            ? 'bg-emerald-100 text-emerald-800'
                            : (attempt?.percentage || 0) >= 50
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {attempt?.percentage}%
                      </span>
                      <span className="block text-[10px] text-slate-400 mt-0.5 font-medium">
                        {attempt?.score}/{attempt?.totalQuestions} Correct
                      </span>
                    </div>
                  )}
                </div>

                {/* Weak Topics Warning in Card */}
                {hasAttempt && attempt?.weakTopics && attempt.weakTopics.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-center gap-2 text-[11px] text-amber-900">
                    <Flame className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="font-semibold">Weak topics:</span>
                    <span className="truncate">{attempt.weakTopics.join(', ')}</span>
                  </div>
                )}

                {/* Card Actions */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => setQuizToDelete(quiz)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-xs flex items-center gap-1"
                    title="Delete Quiz"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Delete</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {hasAttempt && (
                      <button
                        onClick={() => onViewResults(quiz)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 active:scale-95 transition-all"
                      >
                        Review Results
                      </button>
                    )}

                    <button
                      onClick={() => onOpenQuiz(quiz)}
                      className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 hover:bg-indigo-700 active:scale-95 transition-all shadow-2xs"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>{hasAttempt ? 'Retake' : 'Open Quiz'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {quizToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Delete Quiz?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete "{quizToDelete.title}"? This cannot be undone.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setQuizToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteQuiz(quizToDelete.id);
                  setQuizToDelete(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
