'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  Code, 
  Users, 
  Play, 
  Bug, 
  Save, 
  FolderOpen, 
  Search, 
  MessageSquare,
  Lightbulb,
  Zap,
  GitBranch,
  Terminal,
  Eye,
  EyeOff,
  Settings,
  Send,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Share,
  Download,
  Upload,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Cpu,
  Bot
} from 'lucide-react'

interface AIAgent {
  id: string
  name: string
  role: 'prime' | 'code' | 'debug' | 'test' | 'review' | 'optimize' | 'research'
  status: 'active' | 'idle' | 'thinking' | 'typing'
  avatar: string
  expertise: string[]
  current_task?: string
  suggestions: number
  contributions: number
}

interface CodeSuggestion {
  id: string
  agent_id: string
  type: 'fix' | 'optimize' | 'enhance' | 'alternative'
  line_start: number
  line_end: number
  original_code: string
  suggested_code: string
  explanation: string
  confidence: number
  applied: boolean
}

interface ChatMessage {
  id: string
  sender: string
  sender_type: 'user' | 'ai'
  message: string
  timestamp: number
  code_snippet?: string
  file_reference?: string
  line_reference?: number
}

interface FileTab {
  id: string
  name: string
  path: string
  language: string
  content: string
  modified: boolean
  ai_suggestions: CodeSuggestion[]
}

export default function CollaborativeStudio() {
  const [activeFile, setActiveFile] = useState<FileTab | null>(null)
  const [openFiles, setOpenFiles] = useState<FileTab[]>([])
  const [aiAgents, setAiAgents] = useState<AIAgent[]>([])
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [codeSuggestions, setCodeSuggestions] = useState<CodeSuggestion[]>([])
  const [isCollaborating, setIsCollaborating] = useState(false)
  const [selectedAgents, setSelectedAgents] = useState<string[]>([])
  const [debugMode, setDebugMode] = useState(false)
  const [liveEdit, setLiveEdit] = useState(true)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [videoEnabled, setVideoEnabled] = useState(false)
  
  const codeEditorRef = useRef<HTMLTextAreaElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Initialize AI agents
  useEffect(() => {
    const defaultAgents: AIAgent[] = [
      {
        id: 'prime',
        name: 'Prime',
        role: 'prime',
        status: 'active',
        avatar: '🧠',
        expertise: ['Architecture', 'Planning', 'Coordination'],
        suggestions: 0,
        contributions: 0
      },
      {
        id: 'coder',
        name: 'CodeCraft',
        role: 'code',
        status: 'idle',
        avatar: '⚡',
        expertise: ['JavaScript', 'TypeScript', 'React', 'Node.js'],
        suggestions: 0,
        contributions: 0
      },
      {
        id: 'debugger',
        name: 'BugHunter',
        role: 'debug',
        status: 'idle',
        avatar: '🐛',
        expertise: ['Debugging', 'Testing', 'Error Analysis'],
        suggestions: 0,
        contributions: 0
      },
      {
        id: 'optimizer',
        name: 'PerfMaster',
        role: 'optimize',
        status: 'idle',
        avatar: '🚀',
        expertise: ['Performance', 'Optimization', 'Best Practices'],
        suggestions: 0,
        contributions: 0
      },
      {
        id: 'reviewer',
        name: 'CodeReview',
        role: 'review',
        status: 'idle',
        avatar: '👀',
        expertise: ['Code Review', 'Security', 'Standards'],
        suggestions: 0,
        contributions: 0
      },
      {
        id: 'tester',
        name: 'TestBot',
        role: 'test',
        status: 'idle',
        avatar: '🧪',
        expertise: ['Unit Testing', 'Integration Testing', 'E2E Testing'],
        suggestions: 0,
        contributions: 0
      },
      {
        id: 'researcher',
        name: 'InfoSeeker',
        role: 'research',
        status: 'idle',
        avatar: '🔍',
        expertise: ['Documentation', 'Research', 'Examples'],
        suggestions: 0,
        contributions: 0
      }
    ]
    
    setAiAgents(defaultAgents)
    setSelectedAgents(['prime', 'coder']) // Start with prime and coder
  }, [])

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const startCollaboration = async () => {
    setIsCollaborating(true)
    
    // Activate selected agents
    setAiAgents(prev => prev.map(agent => ({
      ...agent,
      status: selectedAgents.includes(agent.id) ? 'active' : 'idle'
    })))

    // Initialize collaboration session
    try {
      const response = await fetch('/api/collaborative/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agents: selectedAgents,
          file: activeFile,
          live_edit: liveEdit,
          debug_mode: debugMode
        })
      })
      
      const data = await response.json()
      if (data.success) {
        addChatMessage('system', 'Collaboration session started with ' + selectedAgents.length + ' AI agents')
      }
    } catch (error) {
      console.error('Failed to start collaboration:', error)
    }
  }

  const stopCollaboration = async () => {
    setIsCollaborating(false)
    
    // Deactivate all agents
    setAiAgents(prev => prev.map(agent => ({
      ...agent,
      status: 'idle'
    })))

    try {
      await fetch('/api/collaborative/stop', { method: 'POST' })
      addChatMessage('system', 'Collaboration session ended')
    } catch (error) {
      console.error('Failed to stop collaboration:', error)
    }
  }

  const addChatMessage = (sender: string, message: string, type: 'user' | 'ai' = 'ai') => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender,
      sender_type: type,
      message,
      timestamp: Date.now()
    }
    setChatMessages(prev => [...prev, newMessage])
  }

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return
    
    const userMessage = chatInput
    setChatInput('')
    addChatMessage('You', userMessage, 'user')
    
    if (isCollaborating) {
      try {
        const response = await fetch('/api/collaborative/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userMessage,
            context: {
              active_file: activeFile,
              selected_code: getSelectedCode(),
              debug_mode: debugMode
            }
          })
        })
        
        const data = await response.json()
        if (data.success && data.response) {
          addChatMessage(data.agent_name, data.response)
          
          // Handle code suggestions
          if (data.suggestions) {
            setCodeSuggestions(prev => [...prev, ...data.suggestions])
          }
        }
      } catch (error) {
        console.error('Failed to send chat message:', error)
      }
    }
  }

  const getSelectedCode = () => {
    if (!codeEditorRef.current) return ''
    const textarea = codeEditorRef.current
    return textarea.value.substring(textarea.selectionStart, textarea.selectionEnd)
  }

  const applySuggestion = (suggestion: CodeSuggestion) => {
    if (!activeFile) return
    
    const lines = activeFile.content.split('\n')
    const newLines = [...lines]
    
    // Replace the lines
    newLines.splice(
      suggestion.line_start - 1,
      suggestion.line_end - suggestion.line_start + 1,
      suggestion.suggested_code
    )
    
    const newContent = newLines.join('\n')
    
    setActiveFile({
      ...activeFile,
      content: newContent,
      modified: true
    })
    
    // Mark suggestion as applied
    setCodeSuggestions(prev => prev.map(s => 
      s.id === suggestion.id ? { ...s, applied: true } : s
    ))
    
    // Update agent contributions
    setAiAgents(prev => prev.map(agent => 
      agent.id === suggestion.agent_id 
        ? { ...agent, contributions: agent.contributions + 1 }
        : agent
    ))
  }

  const createNewFile = () => {
    const newFile: FileTab = {
      id: Date.now().toString(),
      name: 'untitled.tsx',
      path: '/untitled.tsx',
      language: 'typescript',
      content: '',
      modified: false,
      ai_suggestions: []
    }
    
    setOpenFiles(prev => [...prev, newFile])
    setActiveFile(newFile)
  }

  const saveFile = async () => {
    if (!activeFile) return
    
    try {
      const response = await fetch('/api/collaborative/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file: activeFile
        })
      })
      
      const data = await response.json()
      if (data.success) {
        setActiveFile({
          ...activeFile,
          modified: false
        })
        addChatMessage('system', `File ${activeFile.name} saved successfully`)
      }
    } catch (error) {
      console.error('Failed to save file:', error)
    }
  }

  const runCode = async () => {
    if (!activeFile) return
    
    addChatMessage('system', 'Running code...')
    
    try {
      const response = await fetch('/api/collaborative/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file: activeFile,
          agents: selectedAgents
        })
      })
      
      const data = await response.json()
      if (data.success) {
        addChatMessage('system', `Code executed successfully: ${data.result}`)
      } else {
        addChatMessage('system', `Error: ${data.error}`)
        if (debugMode) {
          // Trigger debug suggestions
          requestDebugSuggestions(data.error)
        }
      }
    } catch (error) {
      console.error('Failed to run code:', error)
    }
  }

  const requestDebugSuggestions = async (error: string) => {
    try {
      const response = await fetch('/api/collaborative/debug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error,
          code: activeFile?.content,
          agents: ['debugger', 'coder']
        })
      })
      
      const data = await response.json()
      if (data.success && data.suggestions) {
        setCodeSuggestions(prev => [...prev, ...data.suggestions])
        addChatMessage('BugHunter', `Found ${data.suggestions.length} potential fixes for this error`)
      }
    } catch (error) {
      console.error('Failed to get debug suggestions:', error)
    }
  }

  const getAgentStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500'
      case 'thinking': return 'text-blue-500'
      case 'typing': return 'text-yellow-500'
      default: return 'text-gray-500'
    }
  }

  const getAgentStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-3 w-3" />
      case 'thinking': return <Clock className="h-3 w-3 animate-spin" />
      case 'typing': return <Cpu className="h-3 w-3 animate-pulse" />
      default: return <Bot className="h-3 w-3" />
    }
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">Collaborative Studio</h1>
          <Badge variant={isCollaborating ? 'default' : 'secondary'}>
            <Users className="h-3 w-3 mr-1" />
            {isCollaborating ? 'Collaborating' : 'Solo'}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setVoiceEnabled(!voiceEnabled)}
          >
            {voiceEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setVideoEnabled(!videoEnabled)}
          >
            {videoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
          </Button>
          <Separator orientation="vertical" className="h-6" />
          {!isCollaborating ? (
            <Button onClick={startCollaboration} disabled={selectedAgents.length === 0}>
              <Play className="h-4 w-4 mr-2" />
              Start Collaboration
            </Button>
          ) : (
            <Button onClick={stopCollaboration} variant="destructive">
              <RefreshCw className="h-4 w-4 mr-2" />
              Stop Collaboration
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Left Sidebar - AI Agents */}
        <div className="w-64 border-r bg-muted/30">
          <div className="p-4">
            <h3 className="font-semibold mb-3">AI Agents</h3>
            <div className="space-y-2">
              {aiAgents.map((agent) => (
                <div
                  key={agent.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedAgents.includes(agent.id) 
                      ? 'bg-primary/10 border-primary' 
                      : 'bg-background border-border hover:bg-muted/50'
                  }`}
                  onClick={() => {
                    if (selectedAgents.includes(agent.id)) {
                      setSelectedAgents(prev => prev.filter(id => id !== agent.id))
                    } else {
                      setSelectedAgents(prev => [...prev, agent.id])
                    }
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{agent.avatar}</span>
                      <span className="font-medium text-sm">{agent.name}</span>
                    </div>
                    <Badge variant="outline" className={getAgentStatusColor(agent.status)}>
                      {getAgentStatusIcon(agent.status)}
                      {agent.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {agent.expertise.slice(0, 2).join(', ')}
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{agent.suggestions} suggestions</span>
                    <span>{agent.contributions} contributions</span>
                  </div>
                  {agent.current_task && (
                    <div className="text-xs text-blue-600 mt-1">
                      {agent.current_task}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* File Tabs */}
          <div className="flex items-center bg-muted/30 border-b">
            {openFiles.map((file) => (
              <div
                key={file.id}
                className={`flex items-center gap-2 px-4 py-2 border-r cursor-pointer ${
                  activeFile?.id === file.id ? 'bg-background' : 'hover:bg-muted/50'
                }`}
                onClick={() => setActiveFile(file)}
              >
                <span className={file.modified ? 'text-orange-500' : ''}>{file.name}</span>
                {file.modified && <span className="w-2 h-2 bg-orange-500 rounded-full" />}
              </div>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={createNewFile}
              className="ml-2"
            >
              +
            </Button>
          </div>

          {/* Editor Toolbar */}
          <div className="flex items-center justify-between p-2 border-b bg-muted/30">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={saveFile} disabled={!activeFile?.modified}>
                <Save className="h-3 w-3 mr-1" />
                Save
              </Button>
              <Button variant="outline" size="sm" onClick={runCode} disabled={!activeFile}>
                <Play className="h-3 w-3 mr-1" />
                Run
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDebugMode(!debugMode)}
              >
                <Bug className={`h-3 w-3 mr-1 ${debugMode ? 'text-red-500' : ''}`} />
                Debug
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSuggestions(!showSuggestions)}
              >
                {showSuggestions ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLiveEdit(!liveEdit)}
              >
                <Lightbulb className={`h-3 w-3 ${liveEdit ? 'text-yellow-500' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Code Editor */}
          <div className="flex-1 relative">
            {activeFile ? (
              <div className="h-full flex">
                <div className="flex-1">
                  <Textarea
                    ref={codeEditorRef}
                    value={activeFile.content}
                    onChange={(e) => {
                      setActiveFile({
                        ...activeFile,
                        content: e.target.value,
                        modified: true
                      })
                    }}
                    className="h-full resize-none border-0 rounded-none font-mono text-sm"
                    placeholder="Start typing your code..."
                  />
                </div>
                
                {/* Code Suggestions Panel */}
                {showSuggestions && codeSuggestions.length > 0 && (
                  <div className="w-80 border-l bg-muted/30">
                    <div className="p-3 border-b">
                      <h4 className="font-semibold text-sm">AI Suggestions</h4>
                    </div>
                    <ScrollArea className="h-full">
                      <div className="p-3 space-y-3">
                        {codeSuggestions.filter(s => !s.applied).map((suggestion) => {
                          const agent = aiAgents.find(a => a.id === suggestion.agent_id)
                          return (
                            <div key={suggestion.id} className="p-3 border rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span>{agent?.avatar}</span>
                                  <span className="text-sm font-medium">{agent?.name}</span>
                                </div>
                                <Badge variant="outline" className={
                                  suggestion.type === 'fix' ? 'text-red-500' :
                                  suggestion.type === 'optimize' ? 'text-blue-500' :
                                  'text-green-500'
                                }>
                                  {suggestion.type}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mb-2">
                                Lines {suggestion.line_start}-{suggestion.line_end}
                              </p>
                              <p className="text-sm mb-3">{suggestion.explanation}</p>
                              <div className="flex justify-between items-center">
                                <div className="text-xs text-muted-foreground">
                                  Confidence: {Math.round(suggestion.confidence * 100)}%
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => applySuggestion(suggestion)}
                                >
                                  Apply
                                </Button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No file open</p>
                  <Button onClick={createNewFile} className="mt-2">
                    Create New File
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Chat */}
        <div className="w-80 border-l flex flex-col">
          <div className="p-3 border-b">
            <h3 className="font-semibold">AI Collaboration Chat</h3>
          </div>
          
          <ScrollArea className="flex-1 p-3">
            <div className="space-y-3">
              {chatMessages.map((message) => (
                <div key={message.id} className={`flex gap-2 ${message.sender_type === 'user' ? 'justify-end' : ''}`}>
                  {message.sender_type === 'ai' && (
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs">
                      {aiAgents.find(a => a.name === message.sender)?.avatar || '🤖'}  
                    </div>
                  )}
                  <div className={`max-w-[70%] p-2 rounded-lg text-sm ${
                    message.sender_type === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}>
                    <div className="font-medium text-xs mb-1">{message.sender}</div>
                    <div>{message.message}</div>
                    {message.code_snippet && (
                      <div className="mt-2 p-2 bg-black/20 rounded text-xs font-mono">
                        {message.code_snippet}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          </ScrollArea>
          
          <div className="p-3 border-t">
            <div className="flex gap-2">
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask your AI team..."
                onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
              />
              <Button size="sm" onClick={sendChatMessage}>
                <Send className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}