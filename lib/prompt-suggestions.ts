// Smart prompt suggestions based on project context

export interface PromptSuggestion {
  id: string;
  title: string;
  description: string;
  prompt: string;
  icon: string;
  category: 'visual' | 'functionality' | 'content' | 'styling' | 'components';
  tags: string[];
}

export const PROMPT_SUGGESTIONS: PromptSuggestion[] = [
  // Visual Enhancements
  {
    id: 'video-hero-bg',
    title: 'Add Video Background',
    description: 'Add a stunning video background to your hero section',
    prompt: 'Add a looping video background to the hero section. Use a placeholder video URL and make sure the text is still readable with a dark overlay.',
    icon: '🎬',
    category: 'visual',
    tags: ['hero', 'background', 'video', 'visual']
  },
  {
    id: 'gradient-bg',
    title: 'Gradient Background',
    description: 'Apply beautiful gradient backgrounds',
    prompt: 'Add a modern gradient background to the hero section. Use trendy colors that match the site theme.',
    icon: '🌈',
    category: 'visual',
    tags: ['background', 'gradient', 'modern', 'colors']
  },
  {
    id: 'parallax-scroll',
    title: 'Parallax Scrolling',
    description: 'Add smooth parallax effects',
    prompt: 'Implement parallax scrolling effects on background elements and images for a more engaging experience.',
    icon: '📜',
    category: 'visual',
    tags: ['parallax', 'scroll', 'effects', 'animation']
  },
  {
    id: 'glassmorphism',
    title: 'Glassmorphism Effect',
    description: 'Modern glass-like UI elements',
    prompt: 'Apply glassmorphism effects to cards and panels - translucent backgrounds with blur effects and subtle borders.',
    icon: '🔮',
    category: 'styling',
    tags: ['glassmorphism', 'modern', 'blur', 'translucent']
  },

  // Animations & Effects
  {
    id: 'fade-animations',
    title: 'Fade-in Animations',
    description: 'Smooth fade-in effects on scroll',
    prompt: 'Add fade-in animations to elements as they come into view while scrolling. Use Framer Motion for smooth transitions.',
    icon: '✨',
    category: 'visual',
    tags: ['animation', 'fade', 'scroll', 'framer-motion']
  },
  {
    id: 'hover-effects',
    title: 'Interactive Hover Effects',
    description: 'Enhanced button and card hover states',
    prompt: 'Add sophisticated hover effects to buttons, cards, and interactive elements with smooth transitions and micro-animations.',
    icon: '👆',
    category: 'styling',
    tags: ['hover', 'interactive', 'buttons', 'cards']
  },
  {
    id: 'loading-animations',
    title: 'Loading Animations',
    description: 'Beautiful loading states',
    prompt: 'Add skeleton loading animations and smooth loading states for better user experience during content loading.',
    icon: '⏳',
    category: 'functionality',
    tags: ['loading', 'skeleton', 'animations', 'ux']
  },

  // Functionality
  {
    id: 'contact-form',
    title: 'Contact Form',
    description: 'Functional contact form with validation',
    prompt: 'Add a contact form with proper validation, error states, and success messages. Include fields for name, email, and message.',
    icon: '📧',
    category: 'functionality',
    tags: ['form', 'contact', 'validation', 'email']
  },
  {
    id: 'search-functionality',
    title: 'Search Feature',
    description: 'Add search with live results',
    prompt: 'Implement a search functionality with live filtering/results and a clean search interface.',
    icon: '🔍',
    category: 'functionality',
    tags: ['search', 'filter', 'live-results', 'input']
  },
  {
    id: 'dark-mode',
    title: 'Dark Mode Toggle',
    description: 'Switch between light and dark themes',
    prompt: 'Add a dark mode toggle that smoothly transitions between light and dark themes with proper contrast and colors.',
    icon: '🌙',
    category: 'functionality',
    tags: ['dark-mode', 'theme', 'toggle', 'accessibility']
  },

  // Content & Layout
  {
    id: 'testimonials',
    title: 'Testimonials Section',
    description: 'Customer testimonials with avatars',
    prompt: 'Add a testimonials section with customer quotes, names, avatars, and company logos in an attractive layout.',
    icon: '💬',
    category: 'content',
    tags: ['testimonials', 'social-proof', 'avatars', 'quotes']
  },
  {
    id: 'pricing-table',
    title: 'Pricing Table',
    description: 'Professional pricing plans layout',
    prompt: 'Create a pricing table with multiple tiers, feature comparisons, and call-to-action buttons.',
    icon: '💰',
    category: 'content',
    tags: ['pricing', 'plans', 'comparison', 'cta']
  },
  {
    id: 'faq-section',
    title: 'FAQ Accordion',
    description: 'Expandable FAQ section',
    prompt: 'Add an FAQ section with expandable/collapsible questions and answers in an accordion style.',
    icon: '❓',
    category: 'content',
    tags: ['faq', 'accordion', 'expandable', 'questions']
  },
  {
    id: 'stats-counter',
    title: 'Animated Stats',
    description: 'Counting numbers with animations',
    prompt: 'Add an animated statistics section with counting numbers that animate when they come into view.',
    icon: '📊',
    category: 'visual',
    tags: ['stats', 'counter', 'animation', 'numbers']
  },

  // Components
  {
    id: 'image-gallery',
    title: 'Image Gallery',
    description: 'Interactive photo gallery with lightbox',
    prompt: 'Create an image gallery with grid layout, hover effects, and lightbox functionality for viewing larger images.',
    icon: '🖼️',
    category: 'components',
    tags: ['gallery', 'images', 'lightbox', 'grid']
  },
  {
    id: 'carousel-slider',
    title: 'Image Carousel',
    description: 'Swipeable image slider',
    prompt: 'Add an image carousel/slider with navigation arrows, dots indicator, and swipe/touch support.',
    icon: '🎠',
    category: 'components',
    tags: ['carousel', 'slider', 'swipe', 'navigation']
  },
  {
    id: 'navigation-menu',
    title: 'Mobile Navigation',
    description: 'Responsive hamburger menu',
    prompt: 'Enhance the navigation with a mobile-friendly hamburger menu that slides in smoothly on smaller screens.',
    icon: '🍔',
    category: 'components',
    tags: ['navigation', 'mobile', 'hamburger', 'responsive']
  },

  // Advanced Features
  {
    id: 'scroll-progress',
    title: 'Scroll Progress Bar',
    description: 'Visual scroll position indicator',
    prompt: 'Add a scroll progress bar at the top of the page that shows reading progress as users scroll.',
    icon: '📏',
    category: 'functionality',
    tags: ['scroll', 'progress', 'indicator', 'reading']
  },
  {
    id: 'sticky-elements',
    title: 'Sticky Navigation',
    description: 'Header that follows scroll',
    prompt: 'Make the navigation header sticky so it stays visible while scrolling, with a subtle background blur effect.',
    icon: '📌',
    category: 'functionality',
    tags: ['sticky', 'navigation', 'scroll', 'header']
  },
  {
    id: 'social-share',
    title: 'Social Sharing',
    description: 'Share buttons for social media',
    prompt: 'Add social media sharing buttons that allow users to share the page on Twitter, Facebook, LinkedIn, etc.',
    icon: '📱',
    category: 'functionality',
    tags: ['social', 'sharing', 'media', 'buttons']
  }
];

// Function to get relevant suggestions based on project context
export function getContextualSuggestions(
  projectContext: {
    hasHero?: boolean;
    hasNavigation?: boolean;
    hasForm?: boolean;
    hasPricing?: boolean;
    hasTestimonials?: boolean;
    hasDarkMode?: boolean;
    fileCount?: number;
    componentTypes?: string[];
  } = {}
): PromptSuggestion[] {
  const suggestions = [...PROMPT_SUGGESTIONS];
  
  // Filter out suggestions that might already be implemented
  return suggestions.filter(suggestion => {
    if (suggestion.id === 'contact-form' && projectContext.hasForm) return false;
    if (suggestion.id === 'pricing-table' && projectContext.hasPricing) return false;
    if (suggestion.id === 'testimonials' && projectContext.hasTestimonials) return false;
    if (suggestion.id === 'dark-mode' && projectContext.hasDarkMode) return false;
    return true;
  });
}

// Get suggestions by category
export function getSuggestionsByCategory(category: PromptSuggestion['category']): PromptSuggestion[] {
  return PROMPT_SUGGESTIONS.filter(s => s.category === category);
}

// Get random suggestions for variety
export function getRandomSuggestions(count: number = 6): PromptSuggestion[] {
  const shuffled = [...PROMPT_SUGGESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}