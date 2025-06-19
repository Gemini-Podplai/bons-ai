import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import {
  Brain,
  Code,
  Palette,
  Hammer,
  Computer,
  Package,
  Users,
  DollarSign,
  Zap,
  Activity,
  Send,
  Sparkles,
  ArrowRight,
  Settings,
  X,
  Home
} from 'lucide-react'

// Import studio components
import EnhancedResearchStudio from './studios/enhanced-research-studio'
import EnhancedCodeStudio from './studios/enhanced-code-studio'
import DesignStudio from './studios/design-studio'
import BuildStudio from './studios/build-studio'
import CUAStudio from './studios/cua-studio'
import MCPMarketplaceStudio from './studios/mcp-marketplace-studio'
import CollaborativeStudio from './studios/collaborative-studio'

const studios = [
  { id: 'research', name: 'Research Studio', icon: Brain, color: 'bg-blue-500', component: EnhancedResearchStudio },
  { id: 'code', name: 'Code Studio', icon: Code, color: 'bg-green-500', component: EnhancedCodeStudio },
  { id: 'design', name: 'Design Studio', icon: Palette, color: 'bg-pink-500', component: DesignStudio },
  { id: 'build', name: 'Build Studio', icon: Hammer, color: 'bg-orange-500', component: BuildStudio },
  { id: 'cua', name: 'CUA Studio', icon: Computer, color: 'bg-purple-500', component: CUAStudio },
  { id: 'marketplace', name: 'MCP Marketplace', icon: Package, color: 'bg-cyan-500', component: MCPMarketplaceStudio },
  { id: 'collaborative', name: 'Collaborative Studio', icon: Users, color: 'bg-indigo-500', component: CollaborativeStudio },
]

const aiModels = [
  { name: 'Gemini 2.0 Flash Lite', provider: 'Google', tier: 'Free', quota: 999999, used: 0 },
  { name: 'Gemini 2.5 Pro', provider: 'Google AI 1', tier: 'Free', quota: 300000, used: 45000 },
  { name: 'Gemini 2.5 Pro', provider: 'Google AI 2', tier: 'Free', quota: 300000, used: 23000 },
  { name: 'DeepSeek V3', provider: 'DeepSeek', tier: 'Paid', quota: 1000000, used: 0 },
]

const themes = [
  { id: 'purple', name: 'Calm Purple', color: 'bg-purple-500' },
  { id: 'orange', name: 'Warm Orange', color: 'bg-orange-500' },
  { id: 'neon', name: 'Neon Focus', color: 'bg-green-400' },
]

type Mode = 'chat' | 'work' | 'studios' | 'studio'

export default function BonsAIInterface() {
  const [mode, setMode] = useState<Mode>('chat')
  const [selectedTheme, setSelectedTheme] = useState('purple')
  const [inputValue, setInputValue] = useState('')
  const [activeStudio, setActiveStudio] = useState<string | null>(null)
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Emergency escape - press Escape to return to chat mode
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMode('chat')
        setActiveStudio(null)
        setIsCollapsed(false)
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [])

  const openStudio = (studioId: string) => {
    setActiveStudio(studioId)
    setMode('studio')
  }

  const renderChatMode = () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-6">
      <div className="w-full max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-serif font-light">
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Bons-AI
              </span>
            </h1>
          </div>
          
          <p className="text-muted-foreground">
            Neurodivergent-friendly AI development platform
          </p>

          {/* Theme selector */}
          <div className="flex justify-center gap-2">
            {themes.map((theme) => (
              <Button
                key={theme.id}
                variant={selectedTheme === theme.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTheme(theme.id)}
                className="gentle-glow"
              >
                <div className={`w-3 h-3 rounded-full ${theme.color} mr-2`} />
                {theme.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Input */}
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="What would you like to build today?"
              className="flex-1"
            />
            <Button type="submit">
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMode('work')}
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Work Mode
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMode('studios')}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Studios
            </Button>
          </div>
        </form>

        {/* AI Model Status */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {aiModels.map((model, i) => (
            <div key={i} className="bg-card/50 p-2 rounded border">
              <div className="flex items-center justify-between">
                <span className="font-medium text-xs">{model.name}</span>
                <Badge variant={model.tier === 'Free' ? 'secondary' : 'default'} className="text-xs">
                  {model.tier}
                </Badge>
              </div>
              <Progress
                value={(model.used / model.quota) * 100}
                className="h-1 mt-1"
              />
              <div className="text-xs text-muted-foreground mt-1">
                {((model.used / model.quota) * 100).toFixed(1)}% used
              </div>
            </div>
          ))}
        </div>

        {/* Quick Access to Emergency Escape */}
        <div className="text-center text-xs text-muted-foreground">
          Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Esc</kbd> anytime to return here
        </div>
      </div>
    </div>
  )

  const renderWorkMode = () => (
    <div className="min-h-screen p-4">
      <div className="grid grid-cols-12 gap-4 h-[calc(100vh-2rem)]">
        {/* Timeline Panel */}
        <div className="col-span-3 bg-card/50 backdrop-blur-sm rounded-lg border p-4">
          <h3 className="font-semibold mb-4">Timeline</h3>
          <div className="space-y-3">
            <div className="border-l-2 border-primary pl-3">
              <div className="text-sm font-medium">Step 1</div>
              <div className="text-xs text-muted-foreground">Project initialized</div>
            </div>
            <div className="border-l-2 border-border pl-3">
              <div className="text-sm font-medium">Step 2</div>
              <div className="text-xs text-muted-foreground">AI routing configured</div>
            </div>
            <div className="border-l-2 border-border pl-3 opacity-50">
              <div className="text-sm font-medium">Step 3</div>
              <div className="text-xs text-muted-foreground">Studio integration</div>
            </div>
          </div>
        </div>

        {/* Files Panel */}
        <div className="col-span-4 bg-card/50 backdrop-blur-sm rounded-lg border p-4">
          <h3 className="font-semibold mb-4">Files & Code</h3>
          <div className="space-y-2">
            <div className="bg-muted/50 p-3 rounded text-sm">
              <div className="font-mono">ai-router.ts</div>
              <div className="text-xs text-muted-foreground">Smart AI routing system</div>
            </div>
            <div className="bg-muted/50 p-3 rounded text-sm">
              <div className="font-mono">bons-ai-interface.tsx</div>
              <div className="text-xs text-muted-foreground">Main interface component</div>
            </div>
            <div className="bg-muted/50 p-3 rounded text-sm">
              <div className="font-mono">cost-monitoring.tsx</div>
              <div className="text-xs text-muted-foreground">Cost tracking dashboard</div>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="col-span-5 bg-card/50 backdrop-blur-sm rounded-lg border p-4">
          <h3 className="font-semibold mb-4">Studios</h3>
          <div className="grid grid-cols-2 gap-3">
            {studios.map((studio) => {
              const Icon = studio.icon
              return (
                <Card 
                  key={studio.id} 
                  className="cursor-pointer hover:scale-105 transition-all"
                  onClick={() => openStudio(studio.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-6 h-6 rounded ${studio.color} flex items-center justify-center`}>
                        <Icon className="w-3 h-3 text-white" />
                      </div>
                      <div className="font-medium text-xs">{studio.name}</div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>

      {/* Activity Ticker */}
      <div className="fixed bottom-4 left-4 right-4 bg-card/90 backdrop-blur-md border rounded-lg p-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary animate-pulse" />
            <span>Ready for next task</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              <span>87% free tier</span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              <span>£0.23 today</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMode('chat')}
            >
              <Home className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderStudiosMode = () => (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-semibold mb-4">Bons-AI Studios</h2>
          <p className="text-muted-foreground">
            Specialized AI-powered development environments
          </p>
          <Button
            variant="outline"
            onClick={() => setMode('chat')}
            className="mt-4"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Chat
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {studios.map((studio) => {
            const Icon = studio.icon
            return (
              <Card 
                key={studio.id} 
                className="hover:scale-105 transition-all cursor-pointer"
                onClick={() => openStudio(studio.id)}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${studio.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <CardTitle className="text-lg">{studio.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {studio.id === 'research' && 'Web scraping, analysis, data gathering with CopyCapy integration'}
                      {studio.id === 'code' && 'Development, testing, debugging with Cursor Pro and DeepSeek V3'}
                      {studio.id === 'design' && 'UI/UX creation with Penpot and v0.dev component generation'}
                      {studio.id === 'build' && 'Full-stack application assembly with Next.js 14 and deployment'}
                      {studio.id === 'cua' && 'Computer Use Agent training with Scrapybara integration'}
                      {studio.id === 'marketplace' && 'MCP server discovery with 12-hour automated scraping'}
                      {studio.id === 'collaborative' && 'Live coding with Prime + 7 AI variant collaboration'}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">Ready</Badge>
                      <Button size="sm" variant="ghost">
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )

  const renderStudioMode = () => {
    if (!activeStudio) return null

    const studio = studios.find(s => s.id === activeStudio)
    if (!studio) return null

    const StudioComponent = studio.component

    return (
      <div className="min-h-screen">
        {/* Studio Header */}
        <div className="bg-card/50 backdrop-blur-sm border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg ${studio.color} flex items-center justify-center`}>
                <studio.icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">{studio.name}</h1>
                <p className="text-sm text-muted-foreground">Press Esc to exit</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                {isCollapsed ? 'Expand' : 'Focus'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMode('studios')}
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMode('chat')}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Studio Content */}
        <div className={isCollapsed ? 'p-2' : ''}>
          <StudioComponent />
        </div>
      </div>
    )
  }

  // Render based on current mode
  if (mode === 'studio') return renderStudioMode()
  if (mode === 'work') return renderWorkMode()
  if (mode === 'studios') return renderStudiosMode()
  return renderChatMode()
}