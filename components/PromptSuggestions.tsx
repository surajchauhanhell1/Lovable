import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { PromptSuggestion, getRandomSuggestions, getSuggestionsByCategory } from '@/lib/prompt-suggestions';

interface PromptSuggestionsProps {
  onSuggestionClick: (suggestion: PromptSuggestion) => void;
  isVisible: boolean;
  sandboxActive: boolean;
}

const PromptSuggestions: React.FC<PromptSuggestionsProps> = ({
  onSuggestionClick,
  isVisible,
  sandboxActive
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [suggestions, setSuggestions] = useState<PromptSuggestion[]>(() => getRandomSuggestions(6));

  const categories = [
    { id: 'all', name: 'Popular', icon: '⭐' },
    { id: 'visual', name: 'Visual', icon: '🎨' },
    { id: 'functionality', name: 'Features', icon: '⚡' },
    { id: 'components', name: 'Components', icon: '🧩' },
    { id: 'content', name: 'Content', icon: '📝' },
    { id: 'styling', name: 'Styling', icon: '💅' },
  ];

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    if (categoryId === 'all') {
      setSuggestions(getRandomSuggestions(6));
    } else {
      setSuggestions(getSuggestionsByCategory(categoryId as any));
    }
  };

  const refreshSuggestions = () => {
    if (selectedCategory === 'all') {
      setSuggestions(getRandomSuggestions(6));
    }
  };

  if (!isVisible || !sandboxActive) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500 rounded-r-lg mb-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">💡</span>
          <h3 className="font-semibold text-gray-800">Try these ideas</h3>
          {selectedCategory === 'all' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshSuggestions}
              className="ml-auto text-xs"
              title="Refresh suggestions"
            >
              🎲 Shuffle
            </Button>
          )}
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1 mb-3">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.id)}
              className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {category.icon} {category.name}
            </button>
          ))}
        </div>

        {/* Suggestions Grid */}
        <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
          {suggestions.slice(0, 8).map((suggestion) => (
            <motion.button
              key={suggestion.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
              onClick={() => onSuggestionClick(suggestion)}
              className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all text-left group"
            >
              <span className="text-lg flex-shrink-0 group-hover:scale-110 transition-transform">
                {suggestion.icon}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-800 text-sm group-hover:text-blue-600 transition-colors">
                  {suggestion.title}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {suggestion.description}
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {suggestion.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-gray-400 group-hover:text-blue-500 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </motion.button>
          ))}
        </div>

        <div className="mt-3 text-xs text-gray-500 text-center">
          Click any suggestion to apply it to your project ✨
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PromptSuggestions;