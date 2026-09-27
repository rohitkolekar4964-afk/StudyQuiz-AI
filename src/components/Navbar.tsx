import React from 'react';
import { Sparkles, BookOpen, PlusCircle, LayoutDashboard, History } from 'lucide-react';

interface NavbarProps {
  activeTab: 'home' | 'create' | 'quizzes';
  onNavigate: (tab: 'home' | 'create' | 'quizzes') => void;
  savedQuizzesCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onNavigate, savedQuizzesCount }) => {
  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 text-left group focus:outline-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-amber-200 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-slate-900 tracking-tight">StudyQuiz</span>
                <span className="px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-indigo-100 text-indigo-700 rounded-md">AI</span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">Smart notes-to-quiz assistant</p>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden sm:flex items-center gap-1.5">
            <button
              onClick={() => onNavigate('home')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'home'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </button>

            <button
              onClick={() => onNavigate('create')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'create'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              Create Quiz
            </button>

            <button
              onClick={() => onNavigate('quizzes')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 relative ${
                activeTab === 'quizzes'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              My Quizzes
              {savedQuizzesCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-xs font-bold bg-slate-200 text-slate-700 rounded-full">
                  {savedQuizzesCount}
                </span>
              )}
            </button>
          </nav>

          {/* Mobile Right CTA button */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={() => onNavigate('create')}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white shadow-sm flex items-center gap-1.5 active:scale-95 transition-transform"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              New Quiz
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-6 py-2 flex items-center justify-around shadow-lg">
        <button
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-colors ${
            activeTab === 'home' ? 'text-indigo-600 font-bold' : 'text-slate-500 font-medium'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[11px]">Home</span>
        </button>

        <button
          onClick={() => onNavigate('create')}
          className="relative -top-3.5 flex flex-col items-center group focus:outline-hidden"
        >
          <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 group-active:scale-95 transition-transform">
            <PlusCircle className="w-7 h-7" />
          </div>
          <span className="text-[10px] font-bold text-indigo-700 mt-0.5">Create</span>
        </button>

        <button
          onClick={() => onNavigate('quizzes')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-colors relative ${
            activeTab === 'quizzes' ? 'text-indigo-600 font-bold' : 'text-slate-500 font-medium'
          }`}
        >
          <div className="relative">
            <BookOpen className="w-5 h-5" />
            {savedQuizzesCount > 0 && (
              <span className="absolute -top-1 -right-2 w-4 h-4 bg-indigo-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {savedQuizzesCount > 9 ? '9+' : savedQuizzesCount}
              </span>
            )}
          </div>
          <span className="text-[11px]">My Quizzes</span>
        </button>
      </nav>
    </>
  );
};
