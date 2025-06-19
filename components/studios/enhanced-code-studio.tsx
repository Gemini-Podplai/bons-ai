"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Code,
  Play,
  Bug,
  GitBranch,
  Terminal,
  FileCode,
  Zap,
  CheckCircle,
  AlertCircle,
  Clock,
  ExternalLink,
  Brain,
  Save,
  RefreshCw,
  Settings,
  TestTube,
  Layers,
  GitCommit,
  GitPullRequest,
  Cpu,
  Eye,
  Package,
} from "lucide-react";

interface CodeFile {
  id: string;
  name: string;
  path: string;
  language: string;
  content: string;
  status: 'clean' | 'modified' | 'error' | 'ai-generated';
  lastModified: Date;
  aiSuggestions?: string[];
  cursorSync?: boolean;
  size: number;
}

interface TestResult {
  id: string;
  name: string;
  status: 'passed' | 'failed' | 'running' | 'skipped';
  output?: string;
  duration?: number;
  coverage?: number;
}

interface GitStatus {
  branch: string;
  modified: number;
  staged: number;
  commits: number;
  remote: string;
  lastCommit?: {
    hash: string;
    message: string;
    author: string;
    date: Date;
  };
}

interface DeepSeekJob {
  id: string;
  type: 'code_generation' | 'code_review' | 'debugging' | 'optimization';
  status: 'pending' | 'running' | 'completed' | 'failed';
  input: string;
  output?: string;
  complexity: 'simple' | 'medium' | 'complex';
  estimatedCost: number;
  actualCost?: number;
  timestamp: Date;
}

interface CursorIntegration {
  connected: boolean;
  syncEnabled: boolean;
  activeFile?: string;
  recentSuggestions: Array<{
    file: string;
    suggestion: string;
    accepted: boolean;
    timestamp: Date;
  }>;
}

export function EnhancedCodeStudio() {
  const [files, setFiles] = useState<CodeFile[]>([
    {
      id: '1',
      name: 'enhanced-ai-router.ts',
      path: '/lib/enhanced-ai-router.ts',
      language: 'typescript',
      content: `// Enhanced Smart AI Router System
import { googleAIManager } from './google-ai-manager';
import { vertexAIManager } from './vertex-ai-manager';
import { openRouterManager } from './openrouter-manager';

export class EnhancedAIRouter {
  async route(request: EnhancedRouterRequest) {
    // Intelligent routing logic here
    return this.selectOptimalModel(request);
  }
}`,
      status: 'clean',
      lastModified: new Date(),
      size: 1245,
      cursorSync: true,
    },
    {
      id: '2',
      name: 'research-studio.tsx',
      path: '/components/studios/research-studio.tsx',
      language: 'tsx',
      content: `// Research Studio Component
export function ResearchStudio() {
  const [projects, setProjects] = useState([]);
  
  return (
    <div className="research-studio">
      {/* Studio implementation */}
    </div>
  );
}`,
      status: 'modified',
      lastModified: new Date(),
      size: 2156,
      aiSuggestions: ['Add error handling', 'Implement TypeScript interfaces'],
    },
  ]);

  const [selectedFile, setSelectedFile] = useState('1');
  const [gitStatus, setGitStatus] = useState<GitStatus>({
    branch: 'main',
    modified: 3,
    staged: 1,
    commits: 5,
    remote: 'origin/main',
    lastCommit: {
      hash: 'a1b2c3d',
      message: 'feat: enhance AI router with fallback system',
      author: 'Bons-AI',
      date: new Date(),
    },
  });

  const [tests, setTests] = useState<TestResult[]>([
    {
      id: '1',
      name: 'AI Router Tests',
      status: 'passed',
      duration: 1200,
      coverage: 85,
    },
    {
      id: '2',
      name: 'Research Studio Tests',
      status: 'running',
    },
    {
      id: '3',
      name: 'Integration Tests',
      status: 'failed',
      output: 'TypeError: Cannot read property of undefined',
      duration: 450,
    },
  ]);

  const [deepSeekJobs, setDeepSeekJobs] = useState<DeepSeekJob[]>([]);
  const [cursorIntegration, setCursorIntegration] = useState<CursorIntegration>({
    connected: false,
    syncEnabled: false,
    recentSuggestions: [],
  });

  const [isRunning, setIsRunning] = useState(false);
  const [deepSeekMode, setDeepSeekMode] = useState(false);
  const [activeAIAssistant, setActiveAIAssistant] = useState<'cursor' | 'deepseek' | 'both'>('both');
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize Cursor integration
    initializeCursorConnection();
    
    // Initialize DeepSeek connection
    initializeDeepSeekConnection();
    
    // Set up file watching for auto-sync
    setupFileWatching();
  }, []);

  const initializeCursorConnection = async () => {
    try {
      const response = await fetch('/api/code/cursor/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          workspace: '/home/scrapybara/bons-ai-platform',
          apiKey: process.env.NEXT_PUBLIC_CURSOR_API_KEY,
        }),
      });
      
      if (response.ok) {
        setCursorIntegration(prev => ({ ...prev, connected: true }));
      }
    } catch (error) {
      console.error('Failed to connect to Cursor:', error);
    }
  };

  const initializeDeepSeekConnection = async () => {
    try {
      const response = await fetch('/api/code/deepseek/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          apiKey: process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY,
        }),
      });
      
      if (response.ok) {
        setDeepSeekMode(true);
      }
    } catch (error) {
      console.error('Failed to connect to DeepSeek:', error);
    }
  };

  const setupFileWatching = () => {
    // Set up real-time file watching for Cursor sync
    if (cursorIntegration.connected && cursorIntegration.syncEnabled) {
      const eventSource = new EventSource('/api/code/watch');
      
      eventSource.onmessage = (event) => {
        const fileUpdate = JSON.parse(event.data);
        updateFileContent(fileUpdate.path, fileUpdate.content);
      };

      return () => eventSource.close();
    }
  };

  const handleToggleCursorSync = async () => {
    try {
      const newSyncState = !cursorIntegration.syncEnabled;
      
      const response = await fetch('/api/code/cursor/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: newSyncState }),
      });

      if (response.ok) {
        setCursorIntegration(prev => ({ 
          ...prev, 
          syncEnabled: newSyncState,
        }));
      }
    } catch (error) {
      console.error('Failed to toggle Cursor sync:', error);
    }
  };

  const handleDeepSeekGeneration = async (prompt: string, type: DeepSeekJob['type']) => {
    const job: DeepSeekJob = {
      id: Date.now().toString(),
      type,
      status: 'pending',
      input: prompt,
      complexity: prompt.length > 500 ? 'complex' : prompt.length > 100 ? 'medium' : 'simple',
      estimatedCost: calculateDeepSeekCost(prompt),
      timestamp: new Date(),
    };

    setDeepSeekJobs(prev => [job, ...prev]);

    try {
      const response = await fetch('/api/code/deepseek/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          type,
          complexity: job.complexity,
          context: getCurrentFileContext(),
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setDeepSeekJobs(prev => prev.map(j => 
          j.id === job.id 
            ? { 
                ...j, 
                status: 'completed', 
                output: result.code,
                actualCost: result.cost,
              }
            : j
        ));

        // Auto-apply code if it's a simple generation
        if (type === 'code_generation' && job.complexity === 'simple') {
          applyGeneratedCode(result.code);
        }
      } else {
        setDeepSeekJobs(prev => prev.map(j => 
          j.id === job.id ? { ...j, status: 'failed' } : j
        ));
      }
    } catch (error) {
      console.error('DeepSeek generation failed:', error);
      setDeepSeekJobs(prev => prev.map(j => 
        j.id === job.id ? { ...j, status: 'failed' } : j
      ));
    }
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    
    try {
      const response = await fetch('/api/code/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: files.filter(f => f.status === 'modified'),
          command: 'bun run build && bun run test',
          workspace: '/home/scrapybara/bons-ai-platform',
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Update test results
        setTests(result.testResults || []);
        
        // Update terminal output
        if (terminalRef.current) {
          terminalRef.current.innerHTML += `<div class="text-green-400">${result.output}</div>`;
        }
      }
    } catch (error) {
      console.error('Code execution failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const handleDebugCode = async () => {
    const currentFile = files.find(f => f.id === selectedFile);
    if (!currentFile) return;

    await handleDeepSeekGeneration(
      `Debug this code and fix any issues:\n\n${currentFile.content}`,
      'debugging'
    );
  };

  const handleCodeReview = async () => {
    const modifiedFiles = files.filter(f => f.status === 'modified');
    
    for (const file of modifiedFiles) {
      await handleDeepSeekGeneration(
        `Review this code for best practices, security, and performance:\n\n${file.content}`,
        'code_review'
      );
    }
  };

  const handleGitCommit = async (message: string) => {
    try {
      const response = await fetch('/api/code/git/commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          files: files.filter(f => f.status === 'modified').map(f => f.path),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setGitStatus(prev => ({
          ...prev,
          modified: 0,
          staged: 0,
          commits: prev.commits + 1,
          lastCommit: result.commit,
        }));

        // Mark files as clean
        setFiles(prev => prev.map(f => 
          f.status === 'modified' ? { ...f, status: 'clean' } : f
        ));
      }
    } catch (error) {
      console.error('Git commit failed:', error);
    }
  };

  const calculateDeepSeekCost = (prompt: string): number => {
    // DeepSeek pricing: ~$0.14 per 1M input tokens, $0.28 per 1M output tokens
    const inputTokens = Math.ceil(prompt.length / 4);
    const estimatedOutputTokens = inputTokens * 2; // Estimate 2x output
    
    const inputCost = (inputTokens / 1000000) * 0.14;
    const outputCost = (estimatedOutputTokens / 1000000) * 0.28;
    
    return inputCost + outputCost;
  };

  const getCurrentFileContext = (): string => {
    const currentFile = files.find(f => f.id === selectedFile);
    return currentFile ? `Current file: ${currentFile.name}\n${currentFile.content}` : '';
  };

  const applyGeneratedCode = (code: string) => {
    setFiles(prev => prev.map(f => 
      f.id === selectedFile 
        ? { ...f, content: code, status: 'ai-generated', lastModified: new Date() }
        : f
    ));
  };

  const updateFileContent = (path: string, content: string) => {
    setFiles(prev => prev.map(f => 
      f.path === path 
        ? { ...f, content, status: 'modified', lastModified: new Date() }
        : f
    ));
  };

  const currentFile = files.find(f => f.id === selectedFile);

  return (
    <div className="p-6 space-y-6">
      {/* Enhanced Header with AI Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Code className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold">Enhanced Code Studio</h2>
            <p className="text-muted-foreground">
              AI-powered development with Cursor Pro and DeepSeek integration
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <div className="flex items-center gap-2 text-sm">
            <div className={`w-3 h-3 rounded-full ${cursorIntegration.connected ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span>Cursor {cursorIntegration.connected ? 'Connected' : 'Offline'}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <div className={`w-3 h-3 rounded-full ${deepSeekMode ? 'bg-blue-500' : 'bg-gray-400'}`} />
            <span>DeepSeek {deepSeekMode ? 'Ready' : 'Offline'}</span>
          </div>
          
          <Button 
            variant={cursorIntegration.syncEnabled ? "default" : "outline"}
            onClick={handleToggleCursorSync}
            disabled={!cursorIntegration.connected}
            className="gentle-glow"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            {cursorIntegration.syncEnabled ? "Sync Active" : "Enable Sync"}
          </Button>
        </div>
      </div>

      {/* AI Assistant Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            AI Development Assistant
            <Select value={activeAIAssistant} onValueChange={(value: any) => setActiveAIAssistant(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cursor">Cursor Only</SelectItem>
                <SelectItem value="deepseek">DeepSeek Only</SelectItem>
                <SelectItem value="both">Both Active</SelectItem>
              </SelectContent>
            </Select>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <Button 
              onClick={() => handleDeepSeekGeneration('Generate a new React component', 'code_generation')}
              disabled={!deepSeekMode}
              className="gentle-glow"
            >
              <Zap className="w-4 h-4 mr-2" />
              Generate Code
            </Button>
            
            <Button 
              onClick={handleDebugCode}
              disabled={!deepSeekMode || !currentFile}
              variant="outline"
            >
              <Bug className="w-4 h-4 mr-2" />
              Debug Code
            </Button>
            
            <Button 
              onClick={handleCodeReview}
              disabled={!deepSeekMode}
              variant="outline"
            >
              <Eye className="w-4 h-4 mr-2" />
              Code Review
            </Button>
            
            <Button 
              onClick={() => handleDeepSeekGeneration(currentFile?.content || '', 'optimization')}
              disabled={!deepSeekMode || !currentFile}
              variant="outline"
            >
              <Cpu className="w-4 h-4 mr-2" />
              Optimize
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-12 gap-6">
        {/* Enhanced Project Explorer */}
        <div className="col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCode className="w-4 h-4" />
                Project Files
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className={`p-3 cursor-pointer hover:bg-muted/50 border-l-2 ${
                      selectedFile === file.id
                        ? "border-primary bg-primary/5"
                        : "border-transparent"
                    }`}
                    onClick={() => setSelectedFile(file.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileCode className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{file.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {file.status === 'clean' && (
                          <CheckCircle className="w-3 h-3 text-green-500" />
                        )}
                        {file.status === 'modified' && (
                          <AlertCircle className="w-3 h-3 text-yellow-500" />
                        )}
                        {file.status === 'error' && (
                          <AlertCircle className="w-3 h-3 text-red-500" />
                        )}
                        {file.status === 'ai-generated' && (
                          <Brain className="w-3 h-3 text-blue-500" />
                        )}
                        {file.cursorSync && (
                          <ExternalLink className="w-3 h-3 text-purple-500" />
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center justify-between">
                      <span>{file.language}</span>
                      <span>{(file.size / 1024).toFixed(1)}KB</span>
                    </div>
                    {file.aiSuggestions && file.aiSuggestions.length > 0 && (
                      <div className="text-xs text-blue-600 mt-1">
                        {file.aiSuggestions.length} AI suggestions
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Git Status */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="w-4 h-4" />
                Git Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Branch</span>
                  <Badge variant="outline">{gitStatus.branch}</Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Modified</span>
                    <Badge variant="secondary">{gitStatus.modified}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Staged</span>
                    <Badge variant="secondary">{gitStatus.staged}</Badge>
                  </div>
                </div>

                {gitStatus.lastCommit && (
                  <div className="text-xs text-muted-foreground border-t pt-2">
                    <div className="font-mono">{gitStatus.lastCommit.hash}</div>
                    <div>{gitStatus.lastCommit.message}</div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Input 
                    placeholder="Commit message"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleGitCommit(e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                  <div className="grid grid-cols-2 gap-1">
                    <Button size="sm" className="gentle-glow">
                      <GitCommit className="w-3 h-3 mr-1" />
                      Commit
                    </Button>
                    <Button size="sm" variant="outline">
                      <GitPullRequest className="w-3 h-3 mr-1" />
                      Push
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Code Editor */}
        <div className="col-span-9">
          <Tabs defaultValue="editor" className="space-y-4">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="editor">Editor</TabsTrigger>
                <TabsTrigger value="terminal">Terminal</TabsTrigger>
                <TabsTrigger value="tests">Tests</TabsTrigger>
                <TabsTrigger value="ai-jobs">AI Jobs</TabsTrigger>
                <TabsTrigger value="debug">Debug</TabsTrigger>
              </TabsList>
              
              <div className="flex gap-2">
                <Button size="sm" onClick={handleRunCode} disabled={isRunning}>
                  {isRunning ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4 mr-2" />
                  )}
                  Run
                </Button>
                <Button size="sm" variant="outline" onClick={handleDebugCode}>
                  <Bug className="w-4 h-4 mr-2" />
                  Debug
                </Button>
                <Button size="sm" variant="outline">
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>

            <TabsContent value="editor" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {currentFile?.name}
                      {currentFile?.cursorSync && (
                        <Badge variant="outline" className="text-xs">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Cursor Sync
                        </Badge>
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{currentFile?.language}</Badge>
                      <Badge variant={
                        currentFile?.status === 'clean' ? 'default' : 
                        currentFile?.status === 'ai-generated' ? 'secondary' : 'destructive'
                      }>
                        {currentFile?.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <Textarea
                      value={currentFile?.content || ''}
                      onChange={(e) => updateFileContent(currentFile?.path || '', e.target.value)}
                      className="font-mono text-sm min-h-96 resize-none"
                      placeholder="Select a file to start coding..."
                    />
                    
                    {/* AI Enhancement Indicators */}
                    {deepSeekMode && (
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Badge className="bg-blue-100 text-blue-800">
                          <Zap className="w-3 h-3 mr-1" />
                          DeepSeek
                        </Badge>
                        {cursorIntegration.syncEnabled && (
                          <Badge className="bg-purple-100 text-purple-800">
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Cursor
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* AI Suggestions Panel */}
                    {currentFile?.aiSuggestions && currentFile.aiSuggestions.length > 0 && (
                      <div className="absolute bottom-2 right-2 max-w-xs">
                        <Card className="bg-blue-50 border-blue-200">
                          <CardContent className="p-3">
                            <div className="text-xs font-medium mb-2 flex items-center gap-1">
                              <Brain className="w-3 h-3" />
                              AI Suggestions
                            </div>
                            <div className="space-y-1">
                              {currentFile.aiSuggestions.map((suggestion, index) => (
                                <div key={index} className="text-xs p-1 bg-white rounded">
                                  {suggestion}
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="terminal" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Terminal className="w-4 h-4" />
                    Integrated Terminal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    ref={terminalRef}
                    className="bg-black text-green-400 p-4 rounded font-mono text-sm h-96 overflow-y-auto"
                  >
                    <div>$ bun dev</div>
                    <div className="text-blue-400">▲ Next.js 15.0.0</div>
                    <div className="text-green-400">✓ Ready on https://localhost:3000</div>
                    <div className="text-green-400">✓ Compiled successfully</div>
                    {isRunning && (
                      <div className="text-yellow-400 animate-pulse">
                        ⚡ Running tests and build...
                      </div>
                    )}
                    <div className="mt-2">
                      <span className="text-green-400">$</span>
                      <span className="ml-1 animate-pulse">|</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tests" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Test Results
                    <Button size="sm" onClick={handleRunCode}>
                      <TestTube className="w-4 h-4 mr-2" />
                      Run Tests
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {tests.map((test) => (
                      <div 
                        key={test.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {test.status === 'passed' && (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          )}
                          {test.status === 'failed' && (
                            <AlertCircle className="w-5 h-5 text-red-500" />
                          )}
                          {test.status === 'running' && (
                            <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
                          )}
                          {test.status === 'skipped' && (
                            <Clock className="w-5 h-5 text-gray-400" />
                          )}
                          <div>
                            <div className="font-medium">{test.name}</div>
                            {test.duration && (
                              <div className="text-sm text-muted-foreground">
                                {test.duration}ms
                              </div>
                            )}
                            {test.output && test.status === 'failed' && (
                              <div className="text-sm text-red-600 font-mono">
                                {test.output}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {test.coverage && (
                            <Badge variant="outline">
                              {test.coverage}% coverage
                            </Badge>
                          )}
                          <Badge variant={
                            test.status === 'passed' ? 'default' :
                            test.status === 'failed' ? 'destructive' : 'secondary'
                          }>
                            {test.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ai-jobs" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    DeepSeek AI Jobs
                    <Badge variant="outline">
                      Total Cost: ${deepSeekJobs.reduce((sum, job) => sum + (job.actualCost || job.estimatedCost), 0).toFixed(4)}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {deepSeekJobs.map((job) => (
                        <Card key={job.id} className="p-3">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {job.type.replace('_', ' ')}
                              </Badge>
                              <Badge variant={
                                job.status === 'completed' ? 'default' :
                                job.status === 'failed' ? 'destructive' : 'secondary'
                              } className="text-xs">
                                {job.status}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              ${(job.actualCost || job.estimatedCost).toFixed(4)}
                            </div>
                          </div>
                          
                          <div className="text-sm mb-2 font-mono bg-muted/50 p-2 rounded">
                            {job.input.slice(0, 100)}...
                          </div>
                          
                          {job.output && (
                            <div className="text-sm font-mono bg-blue-50 p-2 rounded border">
                              {job.output.slice(0, 200)}...
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="debug" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>AI-Powered Debug Console</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Alert>
                      <Brain className="h-4 w-4" />
                      <AlertDescription>
                        AI debugging with DeepSeek integration provides advanced error analysis and suggestions.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Call Stack</h4>
                        <div className="space-y-1 text-sm font-mono">
                          <div className="bg-primary/10 p-2 rounded">handleDeepSeekGeneration</div>
                          <div className="bg-muted/50 p-2 rounded">EnhancedCodeStudio</div>
                          <div className="bg-muted/50 p-2 rounded">App</div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">AI Analysis</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Error Type</span>
                            <span className="text-red-600">TypeError</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Confidence</span>
                            <span className="text-green-600">95%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Suggested Fix</span>
                            <span className="text-blue-600">Add null check</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">AI Recommendation</h4>
                      <p className="text-sm">
                        The error occurs because <code>currentFile</code> might be undefined. 
                        Add a null check before accessing its properties.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}