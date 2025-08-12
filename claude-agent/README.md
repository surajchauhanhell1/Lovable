# Open Lovable UI Agent

🎨 **A specialized Claude Code agent that transforms React apps with premium UI components**

This agent extracts the premium design system from Open Lovable and automatically integrates it into any React project, providing professional 3D effects, smooth animations, and modern styling.

## 🚀 Quick Start

### For Claude Code Users

1. **Tell Claude Code to use this agent:**
   ```
   "Build a beautiful landing page using the Open Lovable design system"
   ```

2. **The agent automatically:**
   - ✅ Reads components from this repository
   - ✅ Installs required dependencies  
   - ✅ Configures Tailwind with custom theme
   - ✅ Builds your UI with premium components

### For Manual Installation

1. **Set environment variable:**
   ```bash
   export OPEN_LOVABLE_REPO_PATH=/path/to/this/open-lovable/repo
   ```

2. **Copy to your Claude agents directory:**
   ```bash
   cp -r claude-agent/ ~/.claude/agents/open-lovable-ui/
   ```

## 🎨 Available Components

- **Button** (6 variants): `default`, `secondary`, `outline`, `destructive`, `code`, `orange`, `ghost`
- **Input** - With inset shadows and orange focus states
- **Form Components** - Label, Checkbox, Textarea, Select
- **Animations** - fade-in-up, gradient-shift, camera-float, lens-rotate

## 📖 Documentation

- **[Agent Definition](open-lovable-ui.md)** - Main agent behavior and knowledge
- **[Components Reference](components-reference.md)** - Complete API documentation
- **[Integration Guide](integration-guide.md)** - Step-by-step setup instructions
- **[Examples](examples/)** - Live demo and code comparisons

## 🔄 Version Tracking

Current version: **1.1.0** (see [version.json](version.json) for changelog)

The agent stays automatically updated by reading components directly from this repository.

## 📄 License

MIT - Free for personal and commercial use