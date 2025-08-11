import React from 'react';
import { motion } from 'framer-motion';
import { AISuggestion } from '../types/suggestions';

interface AISuggestionsProps {
  suggestions: AISuggestion[];
  onSuggestionClick: (suggestion: AISuggestion) => void;
  onRefresh?: () => void;
  onClose?: () => void;
  visible: boolean;
}

export function AISuggestions({ suggestions, onSuggestionClick, onRefresh, onClose, visible }: AISuggestionsProps) {
  if (!visible || suggestions.length === 0) return null;

  const getCategoryColor = (category: AISuggestion['category']) => {
    switch (category) {
      case 'ui': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'feature': return 'bg-green-100 text-green-800 border-green-200';
      case 'content': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'performance': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'accessibility': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyColor = (difficulty: AISuggestion['difficulty']) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, staggerChildren: 0.1 }}
      className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-blue-900">AI Suggestions</h3>
          <p className="text-sm text-blue-700">Enhance your website with these improvements</p>
        </div>
        
        <div className="flex items-center gap-1">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              title="Generate fresh suggestions"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}
          
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              title="Hide suggestions"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-3">
        {suggestions.map((suggestion, index) => (
          <motion.div
            key={suggestion.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white rounded-lg border border-gray-200 p-3 hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer group"
            onClick={() => onSuggestionClick(suggestion)}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{suggestion.icon}</span>
                <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                  {suggestion.title}
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(suggestion.category)}`}>
                  {suggestion.category}
                </span>
                <div className={`w-2 h-2 rounded-full ${getDifficultyColor(suggestion.difficulty)}`} 
                     title={`${suggestion.difficulty} difficulty`} />
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-3 leading-relaxed">
              {suggestion.description}
            </p>
            
            <div className="flex items-center justify-between">
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium group-hover:underline transition-all">
                Apply this suggestion →
              </button>
              <div className="text-xs text-gray-400">
                Click to implement
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
