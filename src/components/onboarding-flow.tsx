/**
 * Neurodivergent-Friendly User Onboarding Flow
 * Step-by-step guided introduction to Bons-Ai with sensory considerations
 */

import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Eye, 
  Brain, 
  Lightbulb,
  CheckCircle,
  Circle,
  ArrowRight,
  ArrowLeft,
  Settings,
  Sparkles
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
  duration: number; // in seconds
  interactive?: boolean;
  hasBreak?: boolean;
  visualStyle?: 'minimal' | 'standard' | 'vibrant';
  audioScript?: string;
}

interface OnboardingPreferences {
  visualStyle: 'minimal' | 'standard' | 'vibrant';
  audioEnabled: boolean;
  autoProgress: boolean;
  breakReminders: boolean;
  fontSize: 'small' | 'medium' | 'large';
  animationSpeed: 'slow' | 'normal' | 'fast';
  colorTheme: 'purple' | 'orange' | 'neon' | 'high-contrast';
}

export const OnboardingFlow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [preferences, setPreferences] = useState<OnboardingPreferences>({
    visualStyle: 'standard',
    audioEnabled: false,
    autoProgress: false,
    breakReminders: true,
    fontSize: 'medium',
    animationSpeed: 'normal',
    colorTheme: 'purple'
  });
  const [timeSpent, setTimeSpent] = useState(0);
  const [showBreakReminder, setShowBreakReminder] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: '🌿 Welcome to Bons-Ai',
      description: 'Your neurodivergent-friendly AI development platform',
      duration: 30,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="text-6xl mb-4">🌿</div>
            <h1 className="text-3xl font-bold mb-2">Welcome to Bons-Ai</h1>
            <p className="text-lg text-muted-foreground">
              A multi-studio AI platform designed with neurodivergent minds in mind
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <Brain className="w-8 h-8 text-purple-600 mb-2" />
              <h3 className="font-semibold">Sensory Friendly</h3>
              <p className="text-sm">Customizable themes and reduced overwhelming elements</p>
            </div>
            <div className="p-4 rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <Lightbulb className="w-8 h-8 text-orange-600 mb-2" />
              <h3 className="font-semibold">Clear Structure</h3>
              <p className="text-sm">Step-by-step workflows with visual progress tracking</p>
            </div>
            <div className="p-4 rounded-lg bg-green-100 dark:bg-green-900/30">
              <CheckCircle className="w-8 h-8 text-green-600 mb-2" />
              <h3 className="font-semibold">Executive Function Support</h3>
              <p className="text-sm">Break reminders and task organization built-in</p>
            </div>
          </div>
        </div>
      ),
      audioScript: "Welcome to Bons-Ai, your neurodivergent-friendly AI development platform. We've designed every aspect with your cognitive needs in mind."
    },
    {
      id: 'preferences',
      title: '⚙️ Customize Your Experience',
      description: 'Set up your sensory and cognitive preferences',
      duration: 60,
      interactive: true,
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold mb-4">Customize Your Experience</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Visual Style</label>
                <div className="grid grid-cols-3 gap-2">
                  {['minimal', 'standard', 'vibrant'].map((style) => (
                    <button
                      key={style}
                      onClick={() => setPreferences(prev => ({ ...prev, visualStyle: style as any }))}
                      className={`p-3 rounded-lg border-2 text-sm capitalize ${
                        preferences.visualStyle === style 
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Font Size</label>
                <div className="grid grid-cols-3 gap-2">
                  {['small', 'medium', 'large'].map((size) => (
                    <button
                      key={size}
                      onClick={() => setPreferences(prev => ({ ...prev, fontSize: size as any }))}
                      className={`p-3 rounded-lg border-2 text-sm capitalize ${
                        preferences.fontSize === size 
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Color Theme</label>
                <div className="grid grid-cols-2 gap-2">
                  {['purple', 'orange', 'neon', 'high-contrast'].map((theme) => (
                    <button
                      key={theme}
                      onClick={() => setPreferences(prev => ({ ...prev, colorTheme: theme as any }))}
                      className={`p-3 rounded-lg border-2 text-sm capitalize ${
                        preferences.colorTheme === theme 
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <h4 className="font-medium">Audio Narration</h4>
                  <p className="text-sm text-muted-foreground">Enable spoken instructions</p>
                </div>
                <button
                  onClick={() => setPreferences(prev => ({ ...prev, audioEnabled: !prev.audioEnabled }))}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    preferences.audioEnabled ? 'bg-purple-500' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    preferences.audioEnabled ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <h4 className="font-medium">Break Reminders</h4>
                  <p className="text-sm text-muted-foreground">Gentle reminders to take breaks</p>
                </div>
                <button
                  onClick={() => setPreferences(prev => ({ ...prev, breakReminders: !prev.breakReminders }))}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    preferences.breakReminders ? 'bg-purple-500' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    preferences.breakReminders ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <h4 className="font-medium">Auto Progress</h4>
                  <p className="text-sm text-muted-foreground">Automatically advance through steps</p>
                </div>
                <button
                  onClick={() => setPreferences(prev => ({ ...prev, autoProgress: !prev.autoProgress }))}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    preferences.autoProgress ? 'bg-purple-500' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    preferences.autoProgress ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ),
      audioScript: "Let's customize your experience. Choose the visual style, font size, and features that work best for your brain."
    },
    {
      id: 'studios-overview',
      title: '🏭 Explore the Studios',
      description: 'Discover the 7 specialized AI development environments',
      duration: 90,
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold mb-4">The 7 Studios</h2>
          <p className="text-muted-foreground mb-6">
            Each studio is designed for specific tasks, with its own AI specialists and tools.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'Research', icon: '🔍', desc: 'Web scraping, data analysis, documentation' },
              { name: 'Code', icon: '💻', desc: 'Development, debugging, version control' },
              { name: 'Design', icon: '🎨', desc: 'UI/UX creation, component building' },
              { name: 'Build', icon: '🏗️', desc: 'Full-stack assembly, deployment' },
              { name: 'CUA', icon: '🖱️', desc: 'Computer use agent training' },
              { name: 'MCP', icon: '🔌', desc: 'Server marketplace, integrations' },
              { name: 'Collaborative', icon: '👥', desc: 'Live coding with AI variants' }
            ].map((studio) => (
              <div key={studio.name} className="p-4 rounded-lg border hover:border-purple-300 transition-colors">
                <div className="text-3xl mb-2">{studio.icon}</div>
                <h3 className="font-semibold mb-1">{studio.name} Studio</h3>
                <p className="text-sm text-muted-foreground">{studio.desc}</p>
              </div>
            ))}
          </div>
        </div>
      ),
      audioScript: "Bons-Ai has 7 specialized studios, each with its own AI experts and tools designed for specific development tasks."
    },
    {
      id: 'ai-routing',
      title: '🧠 Smart AI Routing',
      description: 'How Bons-Ai automatically chooses the best AI model for each task',
      duration: 60,
      hasBreak: true,
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold mb-4">Smart AI Routing</h2>
          
          <div className="bg-gradient-to-r from-purple-100 to-orange-100 dark:from-purple-900/30 dark:to-orange-900/30 p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <Sparkles className="w-8 h-8 text-purple-600 mr-2" />
              <h3 className="text-xl font-semibold">Never worry about model selection again</h3>
            </div>
            <p className="text-muted-foreground">
              Bons-Ai automatically routes your requests to the best AI model based on task complexity, 
              current availability, and cost optimization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold">Free Tier (Unlimited)</h4>
              <div className="space-y-2">
                <div className="flex items-center p-2 rounded bg-green-100 dark:bg-green-900/30">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-sm">Gemini 2.0 Flash Lite</span>
                </div>
                <div className="flex items-center p-2 rounded bg-green-100 dark:bg-green-900/30">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-sm">Gemini 1.5 Flash 8B</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Premium Routing</h4>
              <div className="space-y-2">
                <div className="flex items-center p-2 rounded bg-purple-100 dark:bg-purple-900/30">
                  <Circle className="w-4 h-4 text-purple-600 mr-2" />
                  <span className="text-sm">Gemini 2.5 Pro (900k tokens/day)</span>
                </div>
                <div className="flex items-center p-2 rounded bg-orange-100 dark:bg-orange-900/30">
                  <Circle className="w-4 h-4 text-orange-600 mr-2" />
                  <span className="text-sm">Vertex Express (£240 credits)</span>
                </div>
                <div className="flex items-center p-2 rounded bg-blue-100 dark:bg-blue-900/30">
                  <Circle className="w-4 h-4 text-blue-600 mr-2" />
                  <span className="text-sm">OpenRouter (400+ models)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
      audioScript: "Bons-Ai's smart routing system automatically selects the best AI model for each task, starting with free unlimited models and upgrading only when needed."
    },
    {
      id: 'interface-modes',
      title: '💬 Chat vs Work Modes',
      description: 'Learn how to switch between simple chat and advanced work interfaces',
      duration: 45,
      interactive: true,
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold mb-4">Two Interface Modes</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-lg border-2 border-purple-200">
              <h3 className="text-xl font-semibold mb-3 flex items-center">
                💬 Chat Mode
                <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded">Safe Space</span>
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                  Simple, minimal interface
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                  Reduced cognitive load
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                  Quick AI conversations
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                  Instant "Pop" back to safety
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-lg border-2 border-orange-200">
              <h3 className="text-xl font-semibold mb-3 flex items-center">
                🔧 Work Mode
                <span className="ml-2 text-sm bg-orange-100 text-orange-800 px-2 py-1 rounded">Full Power</span>
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-orange-600 mr-2" />
                  3-panel workspace
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-orange-600 mr-2" />
                  Live activity feed
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-orange-600 mr-2" />
                  File management
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-orange-600 mr-2" />
                  Studio switching
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">💡 Pro Tip</h4>
            <p className="text-sm">
              You can instantly switch back to Chat mode from anywhere using the "Pop" button. 
              This creates a safe, familiar space when Work mode feels overwhelming.
            </p>
          </div>
        </div>
      ),
      audioScript: "Bons-Ai has two interface modes: Chat mode for simple conversations and Work mode for full development power. You can instantly switch between them."
    },
    {
      id: 'first-project',
      title: '🚀 Your First Project',
      description: 'Let\'s create something together to test the system',
      duration: 120,
      interactive: true,
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold mb-4">Let's Build Something Together</h2>
          
          <div className="bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Choose Your First Project</h3>
            <p className="text-muted-foreground mb-4">
              Select a project type to test the studios and AI routing system:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="p-4 rounded-lg border-2 border-transparent hover:border-purple-300 bg-white dark:bg-gray-800 transition-colors">
                <div className="text-3xl mb-2">📝</div>
                <h4 className="font-semibold">Research Report</h4>
                <p className="text-sm text-muted-foreground">Research a topic and create a comprehensive report</p>
              </button>
              
              <button className="p-4 rounded-lg border-2 border-transparent hover:border-purple-300 bg-white dark:bg-gray-800 transition-colors">
                <div className="text-3xl mb-2">🎮</div>
                <h4 className="font-semibold">Simple Game</h4>
                <p className="text-sm text-muted-foreground">Build a browser-based game with AI</p>
              </button>
              
              <button className="p-4 rounded-lg border-2 border-transparent hover:border-purple-300 bg-white dark:bg-gray-800 transition-colors">
                <div className="text-3xl mb-2">🌐</div>
                <h4 className="font-semibold">Landing Page</h4>
                <p className="text-sm text-muted-foreground">Design and build a beautiful website</p>
              </button>
            </div>
          </div>
        </div>
      ),
      audioScript: "Now let's build your first project together. Choose between a research report, simple game, or landing page to test the system."
    },
    {
      id: 'completion',
      title: '🎉 You\'re Ready!',
      description: 'Congratulations! You\'ve completed the onboarding',
      duration: 30,
      content: (
        <div className="text-center space-y-6">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold">You're Ready to Create!</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            You've successfully learned how to use Bons-Ai. Remember, you can always return to 
            Chat mode for a break, and your preferences are saved across all sessions.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="p-4 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <Settings className="w-8 h-8 text-purple-600 mb-2 mx-auto" />
              <h3 className="font-semibold">Preferences Saved</h3>
              <p className="text-sm">Your customizations are ready</p>
            </div>
            <div className="p-4 rounded-lg bg-green-100 dark:bg-green-900/30">
              <CheckCircle className="w-8 h-8 text-green-600 mb-2 mx-auto" />
              <h3 className="font-semibold">Studios Available</h3>
              <p className="text-sm">All 7 studios are at your service</p>
            </div>
            <div className="p-4 rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <Sparkles className="w-8 h-8 text-orange-600 mb-2 mx-auto" />
              <h3 className="font-semibold">AI Router Active</h3>
              <p className="text-sm">Smart model selection enabled</p>
            </div>
          </div>

          <div className="pt-6">
            <button 
              onClick={() => setIsComplete(true)}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-orange-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-orange-700 transition-colors"
            >
              Start Creating! ✨
            </button>
          </div>
        </div>
      ),
      audioScript: "Congratulations! You've completed the Bons-Ai onboarding. You're now ready to create amazing projects with AI assistance."
    }
  ];

  // Break reminder logic
  useEffect(() => {
    if (!preferences.breakReminders) return;
    
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
      if (timeSpent > 0 && timeSpent % 600 === 0) { // Every 10 minutes
        setShowBreakReminder(true);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timeSpent, preferences.breakReminders]);

  // Auto-progress logic
  useEffect(() => {
    if (!preferences.autoProgress || !isPlaying) return;
    
    const timer = setTimeout(() => {
      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
      }
    }, steps[currentStep].duration * 1000);

    return () => clearTimeout(timer);
  }, [currentStep, preferences.autoProgress, isPlaying]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
  };

  if (isComplete) {
    return null; // Hide onboarding when complete
  }

  const currentStepData = steps[currentStep];

  return (
    <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${
      preferences.colorTheme === 'high-contrast' ? 'high-contrast' : ''
    }`}>
      <div className={`bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl max-h-[90vh] overflow-hidden ${
        preferences.fontSize === 'large' ? 'text-lg' : 
        preferences.fontSize === 'small' ? 'text-sm' : ''
      }`}>
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-purple-500 to-orange-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{currentStepData.title}</h1>
              <p className="opacity-90">{currentStepData.description}</p>
            </div>
            <div className="flex items-center space-x-2">
              {preferences.audioEnabled && (
                <button
                  onClick={handlePlay}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
              )}
              <div className="text-sm opacity-75">
                {currentStep + 1} / {steps.length}
              </div>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4 bg-white/20 rounded-full h-2">
            <div 
              className="bg-white rounded-full h-2 transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {currentStepData.content}
        </div>

        {/* Navigation */}
        <div className="p-6 border-t bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Previous
          </button>

          <div className="text-sm text-gray-500">
            Estimated time: {currentStepData.duration}s
          </div>

          <button
            onClick={handleNext}
            className="flex items-center px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>

      {/* Break Reminder Modal */}
      {showBreakReminder && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-60">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-xl max-w-md">
            <div className="text-center">
              <div className="text-4xl mb-4">☕</div>
              <h3 className="text-xl font-bold mb-2">Time for a Break!</h3>
              <p className="text-muted-foreground mb-6">
                You've been learning for {Math.floor(timeSpent / 60)} minutes. 
                Taking breaks helps your brain process information better.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowBreakReminder(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Continue Learning
                </button>
                <button
                  onClick={() => {
                    setShowBreakReminder(false);
                    setIsPlaying(false);
                  }}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Take a 5-minute Break
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};