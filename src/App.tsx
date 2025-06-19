import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
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
  X,
  Home,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Settings,
  Minimize2,
  Maximize2,
  RefreshCw,
  Globe,
  Terminal,
  Play,
  Square,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  MessageSquare,
  FileText,
  Monitor,
  Camera
} from 'lucide-react'

const studios = [
  { id: 'research', name: 'Research Studio', icon: Brain, color: 'bg-blue-500' },
  { id: 'code', name: 'Code Studio', icon: Code, color: 'bg-green-500' },
  { id: 'design', name: 'Design Studio', icon: Palette, color: 'bg-pink-500' },
  { id: 'build', name: 'Build Studio', icon: Hammer, color: 'bg-orange-500' },
  { id: 'cua', name: 'CUA Studio', icon: Computer, color: 'bg-purple-500' },
  { id: 'marketplace', name: 'MCP Marketplace', icon: Package, color: 'bg-cyan-500' },
  { id: 'collaborative', name: 'Collaborative Studio', icon: Users, color: 'bg-indigo-500' },
]

const aiModels = [
  { name: 'Gemini 2.0 Flash Lite', provider: 'Google', tier: 'Free', quota: 999999, used: 12450, cost: 0 },
  { name: 'Gemini 2.5 Pro', provider: 'Google AI 1', tier: 'Free', quota: 300000, used: 45000, cost: 0 },
  { name: 'Gemini 2.5 Pro', provider: 'Google AI 2', tier: 'Free', quota: 300000, used: 23000, cost: 0 },
  { name: 'DeepSeek V3', provider: 'DeepSeek', tier: 'Paid', quota: 1000000, used: 8900, cost: 0.23 },
]

const themes = [
  { id: 'purple', name: 'Calm Purple', color: 'bg-purple-500' },
  { id: 'orange', name: 'Warm Orange', color: 'bg-orange-500' },
  { id: 'neon', name: 'Neon Focus', color: 'bg-green-400' },
]

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  type?: 'text' | 'audio' | 'browser'
}

interface TickerItem {
  id: string
  type: string
  message: string
  timestamp: number
  status: 'info' | 'success' | 'warning' | 'error'
}

type Mode = 'chat' | 'work' | 'studios' | 'studio'

export default function BonsAIInterface() {
  // Core state
  const [mode, setMode] = useState<Mode>('chat')
  const [selectedTheme, setSelectedTheme] = useState('purple')
  const [inputValue, setInputValue] = useState('')
  const [activeStudio, setActiveStudio] = useState<string | null>(null)
  
  // Multi-modal state
  const [isRecording, setIsRecording] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(false)
  const [voiceOutput, setVoiceOutput] = useState(false)
  const [visualMode, setVisualMode] = useState(false)
  const [cameraEnabled, setCameraEnabled] = useState(false)
  
  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Welcome to Bons-AI! I\'m your multi-modal AI assistant. I can help you build applications using voice, text, and visual inputs across all 7 specialized studios. How would you like to start?',
      timestamp: Date.now() - 30000,
      type: 'text'
    }
  ])
  const [isThinking, setIsThinking] = useState(false)
  
  // Live ticker state
  const [tickerItems, setTickerItems] = useState<TickerItem[]>([
    { id: '1', type: 'system', message: 'Platform initialized successfully', timestamp: Date.now() - 10000, status: 'success' },
    { id: '2', type: 'ai_activity', message: 'All 7 studios are online and ready', timestamp: Date.now() - 8000, status: 'info' },
    { id: '3', type: 'cost', message: 'Using free tier - 87% remaining', timestamp: Date.now() - 5000, status: 'info' },
  ])
  const [showTicker, setShowTicker] = useState(true)
  
  // Browser automation state
  const [showBrowser, setShowBrowser] = useState(false)
  
  // Refs
  const chatEndRef = useRef<HTMLDivElement>(null)
  
  // Emergency escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMode('chat')
        setActiveStudio(null)
        setShowBrowser(false)
        setIsRecording(false)
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [])

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  // Live ticker updates
  useEffect(() => {
    const interval = setInterval(() => {
      const messages = [
        'Compilation progress: 75%',
        'Gemini 2.5 Pro responding...',
        'Browser automation ready',
        'Voice recognition active',
        'Cost optimization running',
        'Memory usage: 45%',
        'Studios synchronized'
      ]
      
      const newItem: TickerItem = {
        id: Date.now().toString(),
        type: 'system',
        message: messages[Math.floor(Math.random() * messages.length)],
        timestamp: Date.now(),
        status: Math.random() > 0.8 ? 'warning' : 'info'
      }
      
      setTickerItems(prev => [newItem, ...prev.slice(0, 9)])
    }, 4000)
    
    return () => clearInterval(interval)
  }, [])

  const addTickerItem = (type: string, message: string, status: TickerItem['status']) => {
    const newItem: TickerItem = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: Date.now(),
      status
    }
    setTickerItems(prev => [newItem, ...prev.slice(0, 9)])
  }

  const sendMessage = async () => {
    if (!inputValue.trim()) return
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: Date.now(),
      type: 'text'
    }
    
    setChatMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsThinking(true)
    
    addTickerItem('ai_activity', 'Processing your request...', 'info')
    
    // Simulate AI response
    setTimeout(() => {
      const responses = [
        'Perfect! I can help you with that. Let me analyze your request and suggest the best approach using our multi-modal capabilities.',
        'Great idea! I\'ll use our browser automation studio to handle this task. You can watch the process in real-time.',
        'I understand you want to build something amazing! Let me coordinate with our 7 AI specialists to create the perfect solution.',
        'Excellent! I can process this using voice, visual, and text inputs. Which studio would you like me to activate first?'
      ]
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: Date.now(),
        type: 'text'
      }
      
      setChatMessages(prev => [...prev, assistantMessage])
      setIsThinking(false)
      addTickerItem('ai_activity', 'Response generated successfully', 'success')
    }, 2000)
  }

  const openStudio = (studioId: string) => {
    setActiveStudio(studioId)
    setMode('studio')
    addTickerItem('system', `${studios.find(s => s.id === studioId)?.name} opened`, 'info')
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)
    addTickerItem('system', isRecording ? 'Voice recording stopped' : 'Voice recording started', 'info')
  }

  const renderLiveTicker = () => (
    <div className={`fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t transition-all duration-300 ${showTicker ? 'translate-y-0' : 'translate-y-full'}`}>
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-sm font-medium">Live Activity Feed</span>
            <Badge variant="outline" className="text-xs">
              {tickerItems.length} events
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTicker(false)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
        
        <div className="space-y-1 max-h-16 overflow-y-auto">
          {tickerItems.slice(0, 3).map((item) => (
            <div
              key={item.id}
              className={`flex items-center gap-2 text-xs p-1 rounded transition-all duration-300 ${
                item.status === 'error' ? 'text-red-500' :
                item.status === 'warning' ? 'text-yellow-500' :
                item.status === 'success' ? 'text-green-500' :
                'text-muted-foreground'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${
                item.type === 'compilation' ? 'bg-blue-500' :
                item.type === 'cost' ? 'bg-green-500' :
                item.type === 'ai_activity' ? 'bg-purple-500' :
                'bg-gray-500'
              }`} />
              <span className="flex-1">{item.message}</span>
              <span className="text-xs opacity-50">
                {new Date(item.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderChatMode = () => (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <Brain className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Bons-AI</h1>
            <p className="text-xs text-muted-foreground">Multi-modal AI Development Platform</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Multi-modal controls */}
          <Button
            variant={audioEnabled ? "default" : "outline"}
            size="sm"
            onClick={() => setAudioEnabled(!audioEnabled)}
          >
            {audioEnabled ? <Mic className="h-3 w-3" /> : <MicOff className="h-3 w-3" />}
          </Button>
          
          <Button
            variant={voiceOutput ? "default" : "outline"}
            size="sm"
            onClick={() => setVoiceOutput(!voiceOutput)}
          >
            {voiceOutput ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
          </Button>
          
          <Button
            variant={visualMode ? "default" : "outline"}
            size="sm"
            onClick={() => setVisualMode(!visualMode)}
          >
            {visualMode ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
          </Button>
          
          <Button
            variant={cameraEnabled ? "default" : "outline"}
            size="sm"
            onClick={() => setCameraEnabled(!cameraEnabled)}
          >
            <Camera className="h-3 w-3" />
          </Button>
          
          <Separator orientation="vertical" className="h-6" />
          
          {/* Theme selector */}
          {themes.map((theme) => (
            <Button
              key={theme.id}
              variant={selectedTheme === theme.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTheme(theme.id)}
              title={theme.name}
            >
              <div className={`w-3 h-3 rounded-full ${theme.color}`} />
            </Button>
          ))}
          
          <Separator orientation="vertical" className="h-6" />
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMode('work')}
          >
            <ArrowRight className="w-3 h-3 mr-1" />
            Work Mode
          </Button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-4">
        <ScrollArea className="flex-1 mb-4">
          <div className="space-y-4 pb-20">
            {chatMessages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <Brain className="w-4 h-4 text-primary" />
                  </div>
                )}
                
                <div className={`max-w-2xl ${message.role === 'user' ? 'order-1' : ''}`}>
                  <div className={`rounded-lg p-4 transition-all duration-200 hover:shadow-md ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card border'
                  }`}>
                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                  </div>
                </div>
                
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-1 order-2">
                    <Users className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
            
            {isThinking && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                </div>
                <div className="bg-card border rounded-lg p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    AI is thinking...
                  </div>
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border rounded-lg bg-card/50 backdrop-blur-sm p-4">
          <div className="flex gap-2 mb-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBrowser(true)}
            >
              <Globe className="h-3 w-3 mr-1" />
              Browser
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMode('studios')}
            >
              <Sparkles className="h-3 w-3 mr-1" />
              Studios
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMode('work')}
            >
              <Terminal className="h-3 w-3 mr-1" />
              Work Mode
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="What would you like to build today? (Voice, text, or visual input supported)"
              className="flex-1"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  sendMessage()
                }
              }}
            />
            
            <div className="flex gap-2">
              {audioEnabled && (
                <Button
                  variant={isRecording ? "destructive" : "outline"}
                  size="sm"
                  onClick={toggleRecording}
                >
                  {isRecording ? <Square className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
                </Button>
              )}
              
              <Button onClick={sendMessage} disabled={!inputValue.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* AI Model Status */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
            {aiModels.map((model, i) => (
              <div key={i} className="bg-muted/50 p-2 rounded text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium truncate">{model.name}</span>
                  <Badge variant={model.tier === 'Free' ? 'secondary' : 'default'} className="text-xs">
                    {model.tier}
                  </Badge>
                </div>
                <Progress
                  value={(model.used / model.quota) * 100}
                  className="h-1 mb-1"
                />
                <div className="text-xs text-muted-foreground">
                  {((model.used / model.quota) * 100).toFixed(1)}% used
                  {model.cost > 0 && ` • £${model.cost.toFixed(2)}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Browser Overlay */}
      {showBrowser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl h-[80vh]">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Browser Automation Studio
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBrowser(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-96 bg-muted/50 rounded-lg p-8 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Monitor className="h-16 w-16 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Browser Automation Ready</h3>
                  <p className="max-w-md">CUA agents can interact with any webpage in real-time. Voice commands, visual processing, and automated workflows all supported.</p>
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Voice Control</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Visual Processing</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Auto Screenshots</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Safe Sandboxing</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Emergency Escape Indicator */}
      <div className="fixed top-4 right-4 text-xs text-muted-foreground bg-card/80 backdrop-blur-sm px-2 py-1 rounded">
        Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Esc</kbd> anytime to return to chat
      </div>
    </div>
  )

  const renderWorkMode = () => (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-card/50 backdrop-blur-sm border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold">Work Mode</h1>
            <Badge variant="outline">Scout.new 3-Panel Interface</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMode('chat')}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat Mode
            </Button>
          </div>
        </div>
      </div>

      {/* 3-Panel Layout */}
      <div className="flex-1 grid grid-cols-12 gap-4 p-4">
        {/* Timeline Panel */}
        <div className="col-span-3 bg-card/50 backdrop-blur-sm rounded-lg border p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Timeline</h3>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs">
                <CheckCircle className="h-3 w-3" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">Platform Initialized</div>
                <div className="text-xs text-muted-foreground">All 7 studios ready</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs">
                <CheckCircle className="h-3 w-3" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">Multi-modal Setup</div>
                <div className="text-xs text-muted-foreground">Voice, visual, browser ready</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs animate-pulse">
                <Clock className="h-3 w-3" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">Interface Optimized</div>
                <div className="text-xs text-blue-500">In progress...</div>
              </div>
            </div>
          </div>
        </div>

        {/* Files Panel */}
        <div className="col-span-4 bg-card/50 backdrop-blur-sm rounded-lg border p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Workspace Files</h3>
            <Button variant="ghost" size="sm">
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 cursor-pointer">
              <FileText className="h-4 w-4 text-blue-500" />
              <span className="flex-1 text-sm">bons-ai-interface.tsx</span>
              <div className="w-2 h-2 bg-orange-500 rounded-full" />
            </div>
            <div className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 cursor-pointer">
              <Package className="h-4 w-4 text-green-500" />
              <span className="flex-1 text-sm">studios/</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 cursor-pointer">
              <FileText className="h-4 w-4 text-purple-500" />
              <span className="flex-1 text-sm">enhanced-ai-router.ts</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 cursor-pointer">
              <FileText className="h-4 w-4 text-cyan-500" />
              <span className="flex-1 text-sm">multi-modal-core.ts</span>
              <div className="w-2 h-2 bg-orange-500 rounded-full" />
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="col-span-5 bg-card/50 backdrop-blur-sm rounded-lg border p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Studios & Preview</h3>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Eye className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            {studios.slice(0, 4).map((studio) => {
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
                    <div className="text-xs text-green-500">✅ Multi-modal Ready</div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
          
          <div className="h-32 bg-muted/50 rounded-lg flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Monitor className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">Live preview will appear here</p>
            </div>
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
          <p className="text-muted-foreground mb-4">
            Multi-modal AI-powered development environments
          </p>
          <div className="flex justify-center gap-2">
            <Button variant="outline" onClick={() => setMode('chat')}>
              <MessageSquare className="w-4 h-4 mr-2" />
              Chat Mode
            </Button>
            <Button variant="outline" onClick={() => setMode('work')}>
              <Terminal className="w-4 h-4 mr-2" />
              Work Mode
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {studios.map((studio) => {
            const Icon = studio.icon
            return (
              <Card 
                key={studio.id} 
                className="hover:scale-105 transition-all cursor-pointer group"
                onClick={() => openStudio(studio.id)}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${studio.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <CardTitle className="text-lg">{studio.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Enhanced with voice commands, visual processing, and browser automation
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="default" className="text-green-700 bg-green-100">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Multi-modal Ready
                      </Badge>
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
                <p className="text-sm text-muted-foreground">Multi-modal AI environment • Press Esc to exit</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Mic className="h-3 w-3 mr-1" />
                Voice
              </Button>
              <Button variant="outline" size="sm">
                <Eye className="h-3 w-3 mr-1" />
                Visual
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowBrowser(true)}>
                <Monitor className="h-3 w-3 mr-1" />
                Browser
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <Button variant="outline" size="sm" onClick={() => setMode('studios')}>
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setMode('chat')}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Studio Content */}
        <div className="p-6">
          <div className="max-w-6xl mx-auto text-center py-12">
            <div className={`w-24 h-24 rounded-lg ${studio.color} flex items-center justify-center mx-auto mb-6 animate-pulse`}>
              <studio.icon className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-semibold mb-4">{studio.name}</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Experience the future of AI development with full multi-modal capabilities, 
              real-time browser automation, and intelligent collaboration.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mic className="h-5 w-5" />
                    Voice Commands
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Natural language commands with real-time feedback and response synthesis.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Visual Processing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Screen analysis, visual understanding, and camera-based input processing.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="h-5 w-5" />
                    Browser Automation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Live web interaction, automation workflows, and real-time feedback.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Live ticker for all modes except chat
  const showTickerForMode = mode !== 'chat'

  // Render based on current mode
  return (
    <div className="relative">
      {mode === 'studio' && renderStudioMode()}
      {mode === 'work' && renderWorkMode()}
      {mode === 'studios' && renderStudiosMode()}
      {mode === 'chat' && renderChatMode()}
      
      {/* Live Ticker for non-chat modes */}
      {showTickerForMode && renderLiveTicker()}
    </div>
  )
}