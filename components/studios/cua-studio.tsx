'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Play, 
  Square, 
  Recording, 
  Shield, 
  Monitor, 
  Zap, 
  History,
  Download,
  Upload,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3
} from 'lucide-react'

interface WorkflowStep {
  id: string
  action: string
  target: string
  screenshot?: string
  timestamp: number
  status: 'pending' | 'running' | 'completed' | 'failed'
  duration?: number
}

interface CUASession {
  id: string
  name: string
  status: 'idle' | 'recording' | 'playing' | 'training'
  steps: WorkflowStep[]
  startTime?: number
  duration?: number
  success_rate?: number
  scrapybara_instance?: string
}

export default function CUAStudio() {
  const [activeSession, setActiveSession] = useState<CUASession | null>(null)
  const [sessions, setSessions] = useState<CUASession[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [isTraining, setIsTraining] = useState(false)
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('')
  const [permissionLevel, setPermissionLevel] = useState<'safe' | 'restricted' | 'full'>('safe')
  const [scrapybaraStatus, setScrapybaraStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected')
  const [trainingProgress, setTrainingProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState<WorkflowStep | null>(null)

  // Initialize CUA Studio
  useEffect(() => {
    checkScrapybaraConnection()
    loadSavedSessions()
  }, [])

  const checkScrapybaraConnection = async () => {
    setScrapybaraStatus('connecting')
    try {
      const response = await fetch('/api/cua/scrapybara/status')
      const data = await response.json()
      setScrapybaraStatus(data.connected ? 'connected' : 'disconnected')
    } catch (error) {
      setScrapybaraStatus('disconnected')
    }
  }

  const loadSavedSessions = async () => {
    try {
      const response = await fetch('/api/cua/sessions')
      const data = await response.json()
      setSessions(data.sessions || [])
    } catch (error) {
      console.error('Failed to load sessions:', error)
    }
  }

  const startRecording = async () => {
    if (scrapybaraStatus !== 'connected') {
      alert('Please connect to Scrapybara first')
      return
    }

    try {
      const response = await fetch('/api/cua/recording/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          permission_level: permissionLevel,
          session_name: `CUA Session ${Date.now()}`
        })
      })
      
      const data = await response.json()
      if (data.success) {
        setIsRecording(true)
        setActiveSession(data.session)
      }
    } catch (error) {
      console.error('Failed to start recording:', error)
    }
  }

  const stopRecording = async () => {
    try {
      await fetch('/api/cua/recording/stop', { method: 'POST' })
      setIsRecording(false)
      loadSavedSessions()
    } catch (error) {
      console.error('Failed to stop recording:', error)
    }
  }

  const playWorkflow = async (sessionId: string) => {
    try {
      const response = await fetch('/api/cua/workflow/play', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId })
      })
      
      const data = await response.json()
      if (data.success) {
        // Start monitoring playback
        monitorPlayback(sessionId)
      }
    } catch (error) {
      console.error('Failed to play workflow:', error)
    }
  }

  const monitorPlayback = (sessionId: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/cua/workflow/status/${sessionId}`)
        const data = await response.json()
        
        if (data.currentStep) {
          setCurrentStep(data.currentStep)
        }
        
        if (data.status === 'completed' || data.status === 'failed') {
          clearInterval(interval)
          setCurrentStep(null)
          loadSavedSessions()
        }
      } catch (error) {
        clearInterval(interval)
      }
    }, 1000)
  }

  const startTraining = async () => {
    if (!selectedWorkflow) return
    
    setIsTraining(true)
    setTrainingProgress(0)
    
    try {
      const response = await fetch('/api/cua/training/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          workflow_id: selectedWorkflow,
          iterations: 10,
          model_type: 'prime'
        })
      })
      
      const data = await response.json()
      if (data.success) {
        monitorTraining(data.training_id)
      }
    } catch (error) {
      console.error('Failed to start training:', error)
      setIsTraining(false)
    }
  }

  const monitorTraining = (trainingId: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/cua/training/status/${trainingId}`)
        const data = await response.json()
        
        setTrainingProgress(data.progress || 0)
        
        if (data.status === 'completed' || data.status === 'failed') {
          clearInterval(interval)
          setIsTraining(false)
          setTrainingProgress(0)
        }
      } catch (error) {
        clearInterval(interval)
        setIsTraining(false)
      }
    }, 2000)
  }

  const exportWorkflow = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/cua/workflow/export/${sessionId}`)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `workflow-${sessionId}.json`
      a.click()
    } catch (error) {
      console.error('Failed to export workflow:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-500'
      case 'failed': return 'text-red-500'
      case 'running': return 'text-blue-500'
      default: return 'text-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'failed': return <XCircle className="h-4 w-4" />
      case 'running': return <Clock className="h-4 w-4 animate-spin" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">CUA Studio</h1>
          <p className="text-muted-foreground">Computer Use Agent Training & Testing</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant={scrapybaraStatus === 'connected' ? 'default' : 'destructive'}>
            <Monitor className="h-3 w-3 mr-1" />
            Scrapybara {scrapybaraStatus}
          </Badge>
          <Button 
            variant="outline" 
            size="sm"
            onClick={checkScrapybaraConnection}
          >
            <Settings className="h-4 w-4 mr-2" />
            Reconnect
          </Button>
        </div>
      </div>

      {/* Connection Status Alert */}
      {scrapybaraStatus !== 'connected' && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Scrapybara connection required for CUA training. Please ensure your Scrapybara instance is running.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="record" className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="record">Record</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Recording Tab */}
        <TabsContent value="record" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Recording className="h-5 w-5" />
                Workflow Recording
              </CardTitle>
              <CardDescription>
                Record desktop automation workflows for CUA training
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="permission-level">Permission Level</Label>
                  <select 
                    id="permission-level"
                    className="w-full p-2 border rounded-md"
                    value={permissionLevel}
                    onChange={(e) => setPermissionLevel(e.target.value as any)}
                  >
                    <option value="safe">Safe Mode (No system changes)</option>
                    <option value="restricted">Restricted (Limited file access)</option>
                    <option value="full">Full Access (Dangerous)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Recording Status</Label>
                  <div className="flex items-center gap-2">
                    {isRecording ? (
                      <Badge variant="destructive">
                        <Recording className="h-3 w-3 mr-1 animate-pulse" />
                        Recording
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <Square className="h-3 w-3 mr-1" />
                        Idle
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                {!isRecording ? (
                  <Button onClick={startRecording} disabled={scrapybaraStatus !== 'connected'}>
                    <Play className="h-4 w-4 mr-2" />
                    Start Recording
                  </Button>
                ) : (
                  <Button onClick={stopRecording} variant="destructive">
                    <Square className="h-4 w-4 mr-2" />
                    Stop Recording
                  </Button>
                )}
              </div>

              {activeSession && (
                <div className="mt-4 p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Current Session: {activeSession.name}</h4>
                  <div className="text-sm text-muted-foreground">
                    Steps recorded: {activeSession.steps.length}
                  </div>
                  {activeSession.steps.length > 0 && (
                    <ScrollArea className="h-32 mt-2">
                      {activeSession.steps.map((step, index) => (
                        <div key={step.id} className="flex items-center gap-2 py-1">
                          <span className="text-xs">{index + 1}.</span>
                          <span className="text-sm">{step.action}</span>
                          <span className="text-xs text-muted-foreground">{step.target}</span>
                        </div>
                      ))}
                    </ScrollArea>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workflows Tab */}
        <TabsContent value="workflows" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Saved Workflows
              </CardTitle>
              <CardDescription>
                Manage and replay recorded workflows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {sessions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No workflows recorded yet. Start by recording a new workflow.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {sessions.map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{session.name}</h4>
                            <Badge variant="outline" className={getStatusColor(session.status)}>
                              {getStatusIcon(session.status)}
                              {session.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {session.steps.length} steps • {session.success_rate ? `${session.success_rate}% success` : 'Not tested'}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => playWorkflow(session.id)}
                            disabled={scrapybaraStatus !== 'connected'}
                          >
                            <Play className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => exportWorkflow(session.id)}
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Training Tab */}
        <TabsContent value="training" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                AI Model Training
              </CardTitle>
              <CardDescription>
                Train AI models on recorded workflows
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="workflow-select">Select Workflow</Label>
                  <select 
                    id="workflow-select"
                    className="w-full p-2 border rounded-md"
                    value={selectedWorkflow}
                    onChange={(e) => setSelectedWorkflow(e.target.value)}
                  >
                    <option value="">Choose a workflow...</option>
                    {sessions.map((session) => (
                      <option key={session.id} value={session.id}>
                        {session.name} ({session.steps.length} steps)
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Training Model</Label>
                  <Badge variant="outline">Prime + 7 Variants</Badge>
                </div>
              </div>

              {isTraining && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Training Progress</span>
                    <span className="text-sm">{trainingProgress}%</span>
                  </div>
                  <Progress value={trainingProgress} />
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  onClick={startTraining} 
                  disabled={!selectedWorkflow || isTraining || scrapybaraStatus !== 'connected'}
                >
                  {isTraining ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Training...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Start Training
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Safety & Permissions
              </CardTitle>
              <CardDescription>
                Configure safety constraints for CUA operations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold text-green-600 mb-2">Safe Mode (Recommended)</h4>
                  <ul className="text-sm space-y-1">
                    <li>• No system file modifications</li>
                    <li>• No network access</li>
                    <li>• Screenshot and click only</li>
                    <li>• Sandboxed environment</li>
                  </ul>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold text-yellow-600 mb-2">Restricted Mode</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Limited file system access</li>
                    <li>• Browser automation allowed</li>
                    <li>• Basic application control</li>
                    <li>• Monitored operations</li>
                  </ul>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold text-red-600 mb-2">Full Access (Dangerous)</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Complete system access</li>
                    <li>• File system modifications</li>
                    <li>• Network operations</li>
                    <li>• Use with extreme caution</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Training Analytics
              </CardTitle>
              <CardDescription>
                Performance metrics and improvement tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg text-center">
                  <div className="text-2xl font-bold">
                    {sessions.filter(s => s.success_rate && s.success_rate > 80).length}
                  </div>
                  <div className="text-sm text-muted-foreground">High-performing workflows</div>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <div className="text-2xl font-bold">
                    {sessions.reduce((acc, s) => acc + s.steps.length, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total steps recorded</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Current Step Display */}
      {currentStep && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 animate-spin text-blue-500" />
              <span className="font-medium">Executing:</span>
              <span>{currentStep.action} → {currentStep.target}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}