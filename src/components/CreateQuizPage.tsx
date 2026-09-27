import React, { useState, useEffect } from 'react';
import { DifficultyLevel, QuestionType, Quiz } from '../types/quiz';
import { SAMPLE_NOTES } from '../data/sampleNotes';
import {
  Sparkles,
  Layers,
  BarChart,
  HelpCircle,
  AlertCircle,
  Check,
  RotateCcw,
  Zap,
  BookOpen,
  ArrowLeft,
  X
} from 'lucide-react';

interface CreateQuizPageProps {
  initialNotes?: string;
  initialFocusTopics?: string[];
  onQuizGenerated: (quiz: Quiz) => void;
  onCancel: () => void;
}

const STUDY_TIPS = [
  'Reading your notes thoroughly...',
  'Extracting core definitions and scientific principles...',
  'Formulating targeted multiple-choice options...',
  'Drafting detailed explanations grounded solely in your text...',
  'Checking question balance and difficulty level...',
  'Polishing your quiz for active recall...',
];

export const CreateQuizPage: React.FC<CreateQuizPageProps> = ({
  initialNotes = '',
  initialFocusTopics = [],
  onQuizGenerated,
  onCancel,
}) => {
  const [notes, setNotes] = useState(initialNotes);
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Medium');
  const [questionType, setQuestionType] = useState<QuestionType>('Multiple Choice');
  const [focusTopics, setFocusTopics] = useState<string[]>(initialFocusTopics);

  const [loading, setLoading] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Cycle tips during generation
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % STUDY_TIPS.length);
    }, 2400);
    return () => clearInterval(interval);
  }, [loading]);

  const wordCount = notes.trim() ? notes.trim().split(/\s+/).length : 0;
  const charCount = notes.length;

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!notes.trim() || notes.trim().length < 30) {
      setError('Please paste at least a paragraph of notes (at least 30 characters) so the AI can generate accurate questions.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notes: notes.trim(),
          questionCount,
          difficulty,
          questionType,
          focusTopics: focusTopics.length > 0 ? focusTopics : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate quiz. Please try again.');
      }

      const generatedQuiz: Quiz = {
        id: 'quiz_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        title: data.quiz.title || 'Study Quiz',
        summary: data.quiz.summary || '',
        difficulty,
        questionType,
        questions: data.quiz.questions,
        createdAt: new Date().toISOString(),
        originalNotes: notes.trim(),
        sourceFocusTopics: focusTopics.length > 0 ? focusTopics : undefined,
      };

      onQuizGenerated(generatedQuiz);
    } catch (err: any) {
      console.error('Error generating quiz:', err);
      setError(err.message || 'Something went wrong while connecting to the AI. Please verify your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const removeFocusTopic = (topicToRemove: string) => {
    setFocusTopics(focusTopics.filter((t) => t !== topicToRemove));
  };

  return (
    <div className="pb-28 pt-4 px-4 sm:px-6 max-w-3xl mx-auto space-y-6">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider">
          New Quiz
        </span>
      </div>

      {/* Main Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Create AI Study Quiz
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Paste your study materials below. Gemini will extract key facts and generate a smart quiz.
        </p>
      </div>

      {/* Weak Topics Notification (If in Practice Mode) */}
      {focusTopics.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-600 fill-amber-500" />
              Targeting Your Weak Topics
            </span>
            <button
              onClick={() => setFocusTopics([])}
              className="text-[11px] font-semibold text-amber-700 hover:underline"
            >
              Clear topics
            </button>
          </div>
          <p className="text-xs text-amber-800">
            The AI will prioritize questions reinforcing these concepts:
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {focusTopics.map((topic) => (
              <span
                key={topic}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-xs font-bold text-amber-900 shadow-2xs"
              >
                <span>{topic}</span>
                <button
                  type="button"
                  onClick={() => removeFocusTopic(topic)}
                  className="hover:text-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleGenerate} className="space-y-6">
        {/* Step 1: Study Notes Input */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <label htmlFor="notes-textarea" className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              1. Paste Your Study Notes
            </label>

            {/* Quick Sample Notes Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-slate-400 font-medium">Quick load:</span>
              {SAMPLE_NOTES.map((sample) => (
                <button
                  type="button"
                  key={sample.id}
                  onClick={() => {
                    setNotes(sample.notes);
                    setError(null);
                  }}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-semibold border border-slate-200 transition-colors"
                >
                  {sample.subject}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <textarea
              id="notes-textarea"
              rows={8}
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Paste study notes, textbook summaries, definitions, lecture notes, or bullet points here..."
              className="w-full p-4 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 text-sm text-slate-800 placeholder:text-slate-400 font-normal leading-relaxed resize-y transition-all outline-hidden"
            />

            {notes && (
              <button
                type="button"
                onClick={() => setNotes('')}
                className="absolute top-3 right-3 text-xs font-semibold px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 font-mono">
            <span>{wordCount} words</span>
            <span>{charCount} characters (max 50,000)</span>
          </div>
        </div>

        {/* Step 2: Number of Questions */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs space-y-3">
          <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            2. Number of Questions
          </label>

          <div className="grid grid-cols-4 gap-2.5">
            {[5, 10, 15, 20].map((num) => {
              const isSelected = questionCount === num;
              return (
                <button
                  type="button"
                  key={num}
                  onClick={() => setQuestionCount(num)}
                  className={`py-3 rounded-xl text-center font-bold text-sm transition-all border ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs shadow-indigo-600/30'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="block text-base">{num}</span>
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                    Questions
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 3: Difficulty */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs space-y-3">
          <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <BarChart className="w-4 h-4 text-indigo-600" />
            3. Select Difficulty
          </label>

          <div className="grid grid-cols-3 gap-2.5">
            {[
              { level: 'Easy' as DifficultyLevel, desc: 'Core definitions & direct facts', color: 'emerald' },
              { level: 'Medium' as DifficultyLevel, desc: 'Balanced concepts & applications', color: 'indigo' },
              { level: 'Hard' as DifficultyLevel, desc: 'Deep comprehension & nuances', color: 'rose' },
            ].map(({ level, desc, color }) => {
              const isSelected = difficulty === level;
              return (
                <button
                  type="button"
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`p-3 rounded-xl text-left transition-all border flex flex-col justify-between ${
                    isSelected
                      ? level === 'Easy'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20'
                        : level === 'Medium'
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-950 ring-2 ring-indigo-500/20'
                        : 'bg-rose-50 border-rose-500 text-rose-950 ring-2 ring-rose-500/20'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">{level}</span>
                    {isSelected && <Check className="w-4 h-4 text-current" />}
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                    {desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 4: Question Type */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs space-y-3">
          <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-indigo-600" />
            4. Question Type
          </label>

          <div className="grid grid-cols-3 gap-2.5">
            {[
              { type: 'Multiple Choice' as QuestionType, badge: '4 Options' },
              { type: 'True/False' as QuestionType, badge: 'Binary' },
              { type: 'Mixed' as QuestionType, badge: 'Combined' },
            ].map(({ type, badge }) => {
              const isSelected = questionType === type;
              return (
                <button
                  type="button"
                  key={type}
                  onClick={() => setQuestionType(type)}
                  className={`p-3 rounded-xl text-left transition-all border flex flex-col justify-between ${
                    isSelected
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-950 ring-2 ring-indigo-500/20'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs sm:text-sm">{type}</span>
                    {isSelected && <Check className="w-4 h-4 text-indigo-600" />}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 font-medium">
                    {badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Generation Notice</p>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Generate Button */}
        <button
          type="submit"
          disabled={loading || !notes.trim()}
          className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2.5 shadow-lg transition-all ${
            loading || !notes.trim()
              ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 text-white shadow-indigo-600/25 hover:shadow-indigo-600/40 active:scale-[0.99]'
          }`}
        >
          <Sparkles className="w-5 h-5 text-amber-300" />
          <span>Generate Quiz with AI</span>
        </button>
      </form>

      {/* Loading Modal / Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-5 shadow-2xl border border-slate-100">
            {/* Spinning/pulsing animation */}
            <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-100" />
              <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
              <Sparkles className="w-6 h-6 text-indigo-600 animate-pulse" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-extrabold text-slate-900">
                Generating Your Quiz...
              </h3>
              <p className="text-xs text-slate-500">
                Gemini is analyzing your notes to create {questionCount} questions.
              </p>
            </div>

            {/* Rotating Tip */}
            <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100/80 min-h-[58px] flex items-center justify-center">
              <p className="text-xs font-medium text-indigo-800 transition-opacity duration-300 italic">
                "{STUDY_TIPS[tipIndex]}"
              </p>
            </div>

            <p className="text-[11px] text-slate-400">
              Only facts from your study notes are being used.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
