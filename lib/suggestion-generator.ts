import { AISuggestion, ScrapedWebsite, GeneratedCode } from '../types/suggestions';

export class SuggestionGenerator {
  private static readonly COMMON_SUGGESTIONS: AISuggestion[] = [
    {
      id: 'mega-menu',
      title: 'Add Mega Menu',
      description: 'Create a comprehensive navigation menu with dropdown sections for better site organization',
      category: 'ui',
      difficulty: 'medium',
      prompt: 'Add a mega menu navigation with dropdown sections for better site organization',
      icon: '🍔'
    },
    {
      id: 'hero-video',
      title: 'Add Hero Background Video',
      description: 'Enhance the hero section with a background video for more engaging visual appeal',
      category: 'ui',
      difficulty: 'medium',
      prompt: 'Add a background video to the hero section for more engaging visual appeal',
      icon: '🎥'
    },
    {
      id: 'about-page',
      title: 'Generate About Us Page',
      description: 'Create a professional about us page with company information and team details',
      category: 'content',
      difficulty: 'easy',
      prompt: 'Generate a new about us page with company information and team details',
      icon: '👥'
    },
    {
      id: 'contact-form',
      title: 'Add Contact Form',
      description: 'Implement a functional contact form with validation and submission handling',
      category: 'feature',
      difficulty: 'medium',
      prompt: 'Add a contact form with validation and submission handling',
      icon: '📧'
    },
    {
      id: 'dark-mode',
      title: 'Add Dark Mode Toggle',
      description: 'Implement a dark/light mode toggle for better user experience',
      category: 'ui',
      difficulty: 'medium',
      prompt: 'Add a dark mode toggle with theme switching functionality',
      icon: '🌙'
    },
    {
      id: 'animations',
      title: 'Add Smooth Animations',
      description: 'Enhance the user experience with smooth scroll animations and transitions',
      category: 'ui',
      difficulty: 'easy',
      prompt: 'Add smooth scroll animations and page transitions for better user experience',
      icon: '✨'
    },
    {
      id: 'mobile-menu',
      title: 'Improve Mobile Menu',
      description: 'Enhance the mobile navigation with better animations and touch interactions',
      category: 'ui',
      difficulty: 'easy',
      prompt: 'Improve the mobile navigation menu with better animations and touch interactions',
      icon: '📱'
    },
    {
      id: 'loading-states',
      title: 'Add Loading States',
      description: 'Implement loading spinners and skeleton screens for better perceived performance',
      category: 'performance',
      difficulty: 'easy',
      prompt: 'Add loading spinners and skeleton screens for better perceived performance',
      icon: '⏳'
    },
    {
      id: 'search-functionality',
      title: 'Add Search Functionality',
      description: 'Implement a search bar with filtering and results display',
      category: 'feature',
      difficulty: 'medium',
      prompt: 'Add a search bar with filtering and results display functionality',
      icon: '🔍'
    },
    {
      id: 'testimonials',
      title: 'Add Testimonials Section',
      description: 'Create a testimonials section to showcase customer feedback and build trust',
      category: 'content',
      difficulty: 'easy',
      prompt: 'Add a testimonials section to showcase customer feedback and build trust',
      icon: '💬'
    },
    {
      id: 'newsletter-signup',
      title: 'Add Newsletter Signup',
      description: 'Implement an email newsletter signup form to capture leads',
      category: 'feature',
      difficulty: 'medium',
      prompt: 'Add an email newsletter signup form to capture leads',
      icon: '📰'
    },
    {
      id: 'social-proof',
      title: 'Add Social Proof',
      description: 'Display social media followers, customer counts, or trust badges',
      category: 'content',
      difficulty: 'easy',
      prompt: 'Add social proof elements like follower counts and trust badges',
      icon: '🏆'
    },
    {
      id: 'cookie-consent',
      title: 'Add Cookie Consent',
      description: 'Implement a GDPR-compliant cookie consent banner',
      category: 'accessibility',
      difficulty: 'easy',
      prompt: 'Add a GDPR-compliant cookie consent banner',
      icon: '🍪'
    },
    {
      id: 'back-to-top',
      title: 'Add Back to Top Button',
      description: 'Add a smooth scroll back to top button for better navigation',
      category: 'ui',
      difficulty: 'easy',
      prompt: 'Add a smooth scroll back to top button for better navigation',
      icon: '⬆️'
    },
    {
      id: 'progress-bar',
      title: 'Add Reading Progress Bar',
      description: 'Show reading progress at the top of the page',
      category: 'ui',
      difficulty: 'easy',
      prompt: 'Add a reading progress bar at the top of the page',
      icon: '📊'
    }
  ];

  static generateSuggestions(
    scrapedWebsites: ScrapedWebsite[],
    generatedCode: GeneratedCode,
    maxSuggestions: number = 6
  ): AISuggestion[] {
    const suggestions: AISuggestion[] = [];
    const usedIds = new Set<string>();

    // Analyze scraped content for contextual suggestions
    const contextualSuggestions = this.analyzeScrapedContent(scrapedWebsites);
    
    // Add contextual suggestions first
    for (const suggestion of contextualSuggestions) {
      if (suggestions.length >= maxSuggestions) break;
      if (!usedIds.has(suggestion.id)) {
        suggestions.push(suggestion);
        usedIds.add(suggestion.id);
      }
    }

    // Fill remaining slots with common suggestions
    for (const suggestion of this.COMMON_SUGGESTIONS) {
      if (suggestions.length >= maxSuggestions) break;
      if (!usedIds.has(suggestion.id)) {
        suggestions.push(suggestion);
        usedIds.add(suggestion.id);
      }
    }

    // Shuffle suggestions for variety
    return this.shuffleArray(suggestions);
  }

  private static analyzeScrapedContent(scrapedWebsites: ScrapedWebsite[]): AISuggestion[] {
    const contextualSuggestions: AISuggestion[] = [];
    
    for (const site of scrapedWebsites) {
      const content = site.content;
      if (!content) continue;

      // Check for e-commerce indicators
      if (this.containsEcommerceContent(content)) {
        contextualSuggestions.push({
          id: 'product-gallery',
          title: 'Add Product Gallery',
          description: 'Create an image gallery for showcasing products with zoom and lightbox features',
          category: 'feature',
          difficulty: 'medium',
          prompt: 'Add a product gallery with image zoom and lightbox functionality',
          icon: '🖼️'
        });
        
        contextualSuggestions.push({
          id: 'shopping-cart',
          title: 'Add Shopping Cart',
          description: 'Implement a shopping cart with add/remove items and checkout flow',
          category: 'feature',
          difficulty: 'hard',
          prompt: 'Add a shopping cart with add/remove items and checkout functionality',
          icon: '🛒'
        });
      }

      // Check for blog/content indicators
      if (this.containsBlogContent(content)) {
        contextualSuggestions.push({
          id: 'blog-pagination',
          title: 'Add Blog Pagination',
          description: 'Implement pagination for blog posts with navigation controls',
          category: 'feature',
          difficulty: 'easy',
          prompt: 'Add pagination for blog posts with navigation controls',
          icon: '📄'
        });
        
        contextualSuggestions.push({
          id: 'related-posts',
          title: 'Add Related Posts',
          description: 'Show related blog posts at the bottom of each article',
          category: 'content',
          difficulty: 'medium',
          prompt: 'Add related posts section at the bottom of blog articles',
          icon: '🔗'
        });
      }

      // Check for service business indicators
      if (this.containsServiceContent(content)) {
        contextualSuggestions.push({
          id: 'service-pricing',
          title: 'Add Pricing Tables',
          description: 'Create pricing tables to showcase different service tiers',
          category: 'content',
          difficulty: 'medium',
          prompt: 'Add pricing tables to showcase different service tiers',
          icon: '💰'
        });
        
        contextualSuggestions.push({
          id: 'appointment-booking',
          title: 'Add Booking System',
          description: 'Implement an appointment booking calendar for service scheduling',
          category: 'feature',
          difficulty: 'hard',
          prompt: 'Add an appointment booking calendar for service scheduling',
          icon: '📅'
        });
      }

      // Check for portfolio indicators
      if (this.containsPortfolioContent(content)) {
        contextualSuggestions.push({
          id: 'portfolio-filter',
          title: 'Add Portfolio Filter',
          description: 'Implement filtering and sorting for portfolio projects',
          category: 'feature',
          difficulty: 'medium',
          prompt: 'Add filtering and sorting functionality for portfolio projects',
          icon: '🎯'
        });
        
        contextualSuggestions.push({
          id: 'project-modal',
          title: 'Add Project Modals',
          description: 'Create detailed project modals with image galleries and descriptions',
          category: 'ui',
          difficulty: 'medium',
          prompt: 'Add project modals with image galleries and detailed descriptions',
          icon: '🖼️'
        });
      }
    }

    return contextualSuggestions;
  }

  private static containsEcommerceContent(content: any): boolean {
    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
    const ecommerceKeywords = ['shop', 'buy', 'purchase', 'cart', 'checkout', 'product', 'price', 'sale', 'discount'];
    return ecommerceKeywords.some(keyword => 
      contentStr.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  private static containsBlogContent(content: any): boolean {
    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
    const blogKeywords = ['blog', 'article', 'post', 'news', 'story', 'read', 'publish', 'author'];
    return blogKeywords.some(keyword => 
      contentStr.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  private static containsServiceContent(content: any): boolean {
    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
    const serviceKeywords = ['service', 'consulting', 'consultation', 'appointment', 'booking', 'schedule', 'meeting'];
    return serviceKeywords.some(keyword => 
      contentStr.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  private static containsPortfolioContent(content: any): boolean {
    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
    const portfolioKeywords = ['portfolio', 'project', 'work', 'case study', 'gallery', 'showcase', 'design'];
    return portfolioKeywords.some(keyword => 
      contentStr.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
