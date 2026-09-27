import React from 'react';
import { Quiz, StudyStats } from '../types/quiz';
import { SAMPLE_NOTES, SampleNote } from '../data/sampleNotes';
import { 
  Sparkles, 
  PlusCircle, 
  ArrowRight, 
  Trophy, 
  CheckCircle2, 
  HelpCircle, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  Layers, 
  Flame, 
  FileText,
  Play
} from 'lucide-react';

interface HomePageProps {
  stats: StudyStats;
  recentQuizzes: Quiz[];
  onCreateQuiz: (presetNotes?: string, focusTopics?: string[]) => void;
  onOpenQuiz: (quiz: Quiz) => void;
  onViewResults: (quiz: Quiz) => void;
  onViewAllQuizzes: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  stats,
  recentQuizzes,
  onCreateQuiz,
  onOpenQuiz,
  onViewResults,
  onViewAllQuizzes,
}) => {
  // Collect top weak topics
  const topWeakTopics = stats.weakTopicsList.slice(0, 4);

  return (
    <div className="pb-24 pt-4 px-4 sm:px-6 max-w-4xl mx-auto space-y-6">
      {/* Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-violet-900 text-white p-6 sm:p-8 shadow-xl shadow-indigo-950/15">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-violet-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI-Powered Active Recall</span>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">StudyQuiz AI</h1>
            <p className="text-base sm:text-lg text-indigo-100 font-medium">
              Turn your notes into a smart quiz.
            </p>
          </div>

          <p className="text-xs sm:text-sm text-indigo-200/90 max-w-lg leading-relaxed">
            Paste your lecture notes, textbook chapters, or summary sheets. Our AI generates tailored questions and identifies your weak topics so you ace your exams.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => onCreateQuiz()}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white text-indigo-900 font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-black/10 hover:bg-indigo-50 active:scale-[0.98] transition-all"
            >
              <PlusCircle className="w-5 h-5 text-indigo-600" />
              <span>Create Quiz</span>
              <ArrowRight className="w-4 h-4 ml-1 text-indigo-500" />
            </button>

            {topWeakTopics.length > 0 && (
              <button
                onClick={() => {
                  const firstQuizWithNotes = recentQuizzes.find(q => q.originalNotes);
                  const notes = firstQuizWithNotes?.originalNotes || SAMPLE_NOTES[0].notes;
                  onCreateQuiz(notes, topWeakTopics.map((t: { topic: string; count: number }) => t.topic));
                }}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-200 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-amber-500/30 active:scale-[0.98] transition-all"
              >
                <AlertTriangle className="w-4 h-4 text-amber-300" />
                <span>Practice Weak Topics ({topWeakTopics.length})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Test with Sample Notes */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <FileText className="w-4 h-4" />
            </div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider">
              Quick Test With Sample Notes
            </h2>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">1-click demo</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {SAMPLE_NOTES.map((sample) => (
            <button
              key={sample.id}
              onClick={() => onCreateQuiz(sample.notes)}
              className="text-left p-3 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 active:scale-[0.98] transition-all group flex flex-col justify-between"
            >
              <div>
                <span className="inline-block text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-1">
                  {sample.subject}
                </span>
                <h3 className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                  {sample.title}
                </h3>
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-normal">
                  {sample.description}
                </p>
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-indigo-600">
                <span>Load & Generate</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Progress & Statistics Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            Your Study Progress
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Card 1: Quizzes Taken */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-medium uppercase tracking-wider">Completed</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-extrabold text-slate-900">{stats.quizzesCompleted}</span>
              <p className="text-[11px] text-slate-500 mt-0.5">out of {stats.quizzesCreated} created</p>
            </div>
          </div>

          {/* Card 2: Questions Answered */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-medium uppercase tracking-wider">Questions</span>
              <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                <HelpCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-extrabold text-slate-900">{stats.totalQuestionsAnswered}</span>
              <p className="text-[11px] text-slate-500 mt-0.5">answered so far</p>
            </div>
          </div>

          {/* Card 3: Average Score */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-medium uppercase tracking-wider">Avg Score</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Trophy className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-extrabold text-emerald-600">{stats.averageScore}%</span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {stats.averageScore >= 80 ? 'Mastery pace' : stats.averageScore > 0 ? 'Improving' : 'Take first quiz'}
              </p>
            </div>
          </div>

          {/* Card 4: Weak Topics */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-medium uppercase tracking-wider">Weak Areas</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-extrabold text-amber-600">{stats.weakTopicsList.length}</span>
              <p className="text-[11px] text-slate-500 mt-0.5">topics to practice</p>
            </div>
          </div>
        </div>
      </div>

      {/* Weak Topics Focus Alert (If student has weak topics) */}
      {topWeakTopics.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
              <Flame className="w-4 h-4 text-amber-600 animate-bounce" />
              <span>Target Weak Topics For Improvement</span>
            </div>
            <span className="text-[11px] font-semibold text-amber-700 bg-amber-200/60 px-2 py-0.5 rounded-full">
              {stats.weakTopicsList.length} detected
            </span>
          </div>

          <p className="text-xs text-amber-800 leading-relaxed">
            You missed questions on these topics in previous quizzes. Practice makes perfect!
          </p>

          <div className="flex flex-wrap gap-2">
            {topWeakTopics.map(({ topic, count }: { topic: string; count: number }) => (
              <span
                key={topic}
                className="px-2.5 py-1 rounded-lg bg-white/80 border border-amber-300/80 text-xs font-semibold text-amber-900 shadow-2xs flex items-center gap-1.5"
              >
                <span>{topic}</span>
                <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-full font-bold">
                  {count} missed
                </span>
              </span>
            ))}
          </div>

          <button
            onClick={() => {
              const quizWithNotes = recentQuizzes.find(q => q.originalNotes);
              const notes = quizWithNotes?.originalNotes || SAMPLE_NOTES[0].notes;
              onCreateQuiz(notes, topWeakTopics.map((t: { topic: string; count: number }) => t.topic));
            }}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs hover:bg-amber-700 active:scale-[0.98] transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Targeted Weak Topics Quiz</span>
          </button>
        </div>
      )}

      {/* "My Quizzes" Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            My Quizzes
          </h2>
          {recentQuizzes.length > 0 && (
            <button
              onClick={onViewAllQuizzes}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>View all ({recentQuizzes.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {recentQuizzes.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-dashed border-slate-300 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">No quizzes generated yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Paste your lecture notes or try one of the sample presets above to generate your first quiz!
              </p>
            </div>
            <button
              onClick={() => onCreateQuiz()}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold inline-flex items-center gap-2 shadow-xs hover:bg-indigo-700 active:scale-95 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Your First Quiz</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {recentQuizzes.slice(0, 4).map((quiz) => {
              const hasAttempt = !!quiz.lastAttempt;
              const formattedDate = new Date(quiz.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              });

              return (
                <div
                  key={quiz.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-indigo-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                        {quiz.questions.length} Questions
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700">
                        {quiz.difficulty}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-medium text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formattedDate}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 truncate">
                      {quiz.title}
                    </h3>

                    {quiz.summary && (
                      <p className="text-xs text-slate-500 line-clamp-1">
                        {quiz.summary}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {hasAttempt && (
                      <div className="text-right mr-1">
                        <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                          (quiz.lastAttempt?.percentage || 0) >= 80
                            ? 'bg-emerald-100 text-emerald-800'
                            : (quiz.lastAttempt?.percentage || 0) >= 50
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {quiz.lastAttempt?.percentage}%
                        </span>
                      </div>
                    )}

                    {hasAttempt ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onViewResults(quiz)}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 active:scale-95 transition-all"
                        >
                          Results
                        </button>
                        <button
                          onClick={() => onOpenQuiz(quiz)}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-indigo-700 active:scale-95 transition-all shadow-xs"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Retake</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => onOpenQuiz(quiz)}
                        className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-indigo-700 active:scale-95 transition-all shadow-xs"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Start Quiz</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
