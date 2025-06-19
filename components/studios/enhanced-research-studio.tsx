"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Search,
  Globe,
  FileText,
  Download,
  Link,
  Brain,
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  RefreshCw,
  Database,
  TrendingUp,
  Eye,
  Filter,
  BookOpen,
  Zap,
} from "lucide-react";

interface ResearchSource {
  id: string;
  url: string;
  title: string;
  status: 'pending' | 'scraping' | 'completed' | 'failed' | 'processing';
  content?: string;
  summary?: string;
  metadata?: {
    wordCount: number;
    lastModified: Date;
    contentType: string;
    language: string;
    readability: number;
  };
  timestamp: Date;
  copyCapyJobId?: string;
}

interface ResearchProject {
  id: string;
  name: string;
  description: string;
  sources: ResearchSource[];
  progress: number;
  status: 'active' | 'completed' | 'paused';
  masterAnalysis?: string;
  insights?: string[];
  recommendations?: string[];
  collaborators?: string[];
}

interface CopyCapyConfig {
  apiKey: string;
  endpoint: string;
  batchSize: number;
  retryAttempts: number;
  webhookUrl: string;
}

export function EnhancedResearchStudio() {
  const [projects, setProjects] = useState<ResearchProject[]>([
    {
      id: '1',
      name: 'AI Development Platforms Analysis',
      description: 'Comprehensive research on neurodivergent-friendly AI development platforms and their market positioning',
      sources: [
        {
          id: '1',
          url: 'https://docs.anthropic.com',
          title: 'Anthropic Claude Documentation',
          status: 'completed',
          summary: 'Comprehensive API documentation with focus on safety and helpfulness',
          metadata: {
            wordCount: 45000,
            lastModified: new Date(),
            contentType: 'documentation',
            language: 'en',
            readability: 8.5,
          },
          timestamp: new Date(),
          copyCapyJobId: 'job_anthropic_001',
        },
        {
          id: '2',
          url: 'https://platform.openai.com/docs',
          title: 'OpenAI Platform Documentation',
          status: 'processing',
          timestamp: new Date(),
          copyCapyJobId: 'job_openai_001',
        },
      ],
      progress: 35,
      status: 'active',
      insights: [
        'Most platforms lack specific neurodivergent accessibility features',
        'Cost optimization is a major concern for developers',
        'Multi-model routing is becoming a standard requirement',
      ],
    },
  ]);

  const [selectedProject, setSelectedProject] = useState<string>('1');
  const [newUrl, setNewUrl] = useState('');
  const [isScrapingActive, setIsScrapingActive] = useState(false);
  const [copyCapyConnected, setCopyCapyConnected] = useState(false);
  const [autoScrapeEnabled, setAutoScrapeEnabled] = useState(false);
  const [analysisMode, setAnalysisMode] = useState<'quick' | 'comprehensive' | 'collaborative'>('comprehensive');
  const [researchFilter, setResearchFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');

  // CopyCapy configuration
  const [copyCapyConfig] = useState<CopyCapyConfig>({
    apiKey: process.env.NEXT_PUBLIC_COPYC APY_API_KEY || '',
    endpoint: 'https://api.copyc apy.com/v1',
    batchSize: 10,
    retryAttempts: 3,
    webhookUrl: '/api/research/webhook',
  });

  useEffect(() => {
    // Initialize CopyCapy connection
    initializeCopyCapy();
    
    // Set up polling for active scraping jobs
    const interval = setInterval(pollScrapingJobs, 5000);
    return () => clearInterval(interval);
  }, []);

  const initializeCopyCapy = async () => {
    try {
      const response = await fetch('/api/research/copyCapy/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: copyCapyConfig.apiKey }),
      });
      
      if (response.ok) {
        setCopyCapyConnected(true);
      }
    } catch (error) {
      console.error('Failed to connect to CopyCapy:', error);
    }
  };

  const pollScrapingJobs = async () => {
    const currentProject = projects.find(p => p.id === selectedProject);
    if (!currentProject) return;

    const activeSources = currentProject.sources.filter(s => 
      s.status === 'scraping' || s.status === 'processing'
    );

    for (const source of activeSources) {
      if (source.copyCapyJobId) {
        try {
          const response = await fetch(`/api/research/copyCapy/status/${source.copyCapyJobId}`);
          const jobStatus = await response.json();
          
          if (jobStatus.status === 'completed') {
            updateSourceStatus(source.id, 'completed', jobStatus.data);
          } else if (jobStatus.status === 'failed') {
            updateSourceStatus(source.id, 'failed');
          }
        } catch (error) {
          console.error('Failed to poll job status:', error);
        }
      }
    }
  };

  const handleAddSource = async () => {
    if (!newUrl.trim() || !copyCapyConnected) return;

    const newSource: ResearchSource = {
      id: Date.now().toString(),
      url: newUrl,
      title: new URL(newUrl).hostname,
      status: 'pending',
      timestamp: new Date(),
    };

    setProjects(prev => prev.map(project => 
      project.id === selectedProject
        ? { ...project, sources: [...project.sources, newSource] }
        : project
    ));

    setNewUrl('');
    
    // Start CopyCapy scraping job
    try {
      const response = await fetch('/api/research/copyCapy/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: newUrl,
          config: {
            extractText: true,
            extractMetadata: true,
            extractImages: false,
            followLinks: false,
            maxDepth: 1,
          },
          webhook: copyCapyConfig.webhookUrl,
        }),
      });

      const job = await response.json();
      
      if (job.success) {
        updateSourceCopyCapyJob(newSource.id, job.jobId);
        updateSourceStatus(newSource.id, 'scraping');
      } else {
        updateSourceStatus(newSource.id, 'failed');
      }
    } catch (error) {
      console.error('Failed to start scraping job:', error);
      updateSourceStatus(newSource.id, 'failed');
    }
  };

  const handleBulkScrape = async (urls: string[]) => {
    if (!copyCapyConnected) return;

    try {
      const response = await fetch('/api/research/copyCapy/bulk-scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          urls,
          config: {
            batchSize: copyCapyConfig.batchSize,
            extractText: true,
            extractMetadata: true,
            webhook: copyCapyConfig.webhookUrl,
          },
        }),
      });

      const jobs = await response.json();
      
      if (jobs.success) {
        urls.forEach((url, index) => {
          const source: ResearchSource = {
            id: `bulk_${Date.now()}_${index}`,
            url,
            title: new URL(url).hostname,
            status: 'scraping',
            timestamp: new Date(),
            copyCapyJobId: jobs.jobIds[index],
          };

          setProjects(prev => prev.map(project => 
            project.id === selectedProject
              ? { ...project, sources: [...project.sources, source] }
              : project
          ));
        });
      }
    } catch (error) {
      console.error('Bulk scraping failed:', error);
    }
  };

  const handleStartMasterAnalysis = async () => {
    setIsScrapingActive(true);
    const currentProject = projects.find(p => p.id === selectedProject);
    if (!currentProject) return;

    try {
      const response = await fetch('/api/research/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProject,
          sources: currentProject.sources.filter(s => s.status === 'completed'),
          analysisType: analysisMode,
          options: {
            generateInsights: true,
            createSummary: true,
            suggestActions: true,
            collaborative: analysisMode === 'collaborative',
          },
        }),
      });

      const analysis = await response.json();
      
      if (analysis.success) {
        setProjects(prev => prev.map(project => 
          project.id === selectedProject
            ? {
                ...project,
                masterAnalysis: analysis.summary,
                insights: analysis.insights,
                recommendations: analysis.recommendations,
                progress: Math.min(100, project.progress + 25),
              }
            : project
        ));
      }
    } catch (error) {
      console.error('Master analysis failed:', error);
    } finally {
      setIsScrapingActive(false);
    }
  };

  const handleEnableAutoScrape = async () => {
    try {
      const response = await fetch('/api/research/auto-scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled: !autoScrapeEnabled,
          projectId: selectedProject,
          interval: '12h', // 12-hour automated scraping
          config: {
            maxSourcesPerRun: 50,
            depthLimit: 2,
            respectRobots: true,
            rateLimitDelay: 1000,
          },
        }),
      });

      if (response.ok) {
        setAutoScrapeEnabled(!autoScrapeEnabled);
      }
    } catch (error) {
      console.error('Failed to toggle auto-scrape:', error);
    }
  };

  const updateSourceStatus = (sourceId: string, status: ResearchSource['status'], data?: any) => {
    setProjects(prev => prev.map(project => 
      project.id === selectedProject
        ? {
            ...project,
            sources: project.sources.map(source =>
              source.id === sourceId
                ? {
                    ...source,
                    status,
                    ...(data && {
                      content: data.content,
                      summary: data.summary,
                      metadata: data.metadata,
                    }),
                  }
                : source
            )
          }
        : project
    ));
  };

  const updateSourceCopyCapyJob = (sourceId: string, jobId: string) => {
    setProjects(prev => prev.map(project => 
      project.id === selectedProject
        ? {
            ...project,
            sources: project.sources.map(source =>
              source.id === sourceId
                ? { ...source, copyCapyJobId: jobId }
                : source
            )
          }
        : project
    ));
  };

  const currentProject = projects.find(p => p.id === selectedProject);
  const filteredSources = currentProject?.sources.filter(source => {
    if (researchFilter === 'all') return true;
    return source.status === researchFilter;
  }) || [];

  return (
    <div className="p-6 space-y-6">
      {/* Header with CopyCapy Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold">Enhanced Research Studio</h2>
            <p className="text-muted-foreground">
              AI-powered research with CopyCapy integration and collaborative analysis
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${copyCapyConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm">CopyCapy {copyCapyConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
          
          <Button 
            onClick={handleEnableAutoScrape}
            variant={autoScrapeEnabled ? "default" : "outline"}
            disabled={!copyCapyConnected}
            className="gentle-glow"
          >
            {autoScrapeEnabled ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Stop Auto-Scrape
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start 12h Auto-Scrape
              </>
            )}
          </Button>
          
          <Button 
            onClick={handleStartMasterAnalysis}
            disabled={isScrapingActive || !copyCapyConnected}
            className="gentle-glow"
          >
            {isScrapingActive ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Master Analysis
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Auto-Scraping Status Banner */}
      {autoScrapeEnabled && (
        <Alert>
          <Zap className="h-4 w-4" />
          <AlertDescription>
            12-hour automated research scraping is active. The system will continuously discover and analyze new sources related to your project.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-12 gap-6">
        {/* Enhanced Sources Panel */}
        <div className="col-span-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Research Sources
                </div>
                <div className="flex items-center gap-2">
                  <Select value={researchFilter} onValueChange={(value: any) => setResearchFilter(value)}>
                    <SelectTrigger className="w-24 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="completed">Done</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Filter className="w-4 h-4 text-muted-foreground" />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Bulk Add Sources */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter URL to scrape..."
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddSource()}
                    disabled={!copyCapyConnected}
                  />
                  <Button 
                    onClick={handleAddSource} 
                    size="sm"
                    disabled={!copyCapyConnected || !newUrl.trim()}
                  >
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  Or paste multiple URLs (one per line):
                </div>
                <Textarea 
                  placeholder="https://example1.com&#10;https://example2.com&#10;https://example3.com"
                  className="h-16 text-xs"
                  onBlur={(e) => {
                    const urls = e.target.value.split('\n').filter(url => url.trim());
                    if (urls.length > 1) {
                      handleBulkScrape(urls);
                      e.target.value = '';
                    }
                  }}
                />
              </div>

              {/* Sources List */}
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {filteredSources.map((source) => (
                    <Card key={source.id} className="p-3">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">
                              {source.title}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {source.url}
                            </div>
                          </div>
                          <div className="ml-2 flex items-center gap-1">
                            {source.status === 'completed' && (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            )}
                            {(source.status === 'scraping' || source.status === 'processing') && (
                              <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
                            )}
                            {source.status === 'failed' && (
                              <AlertCircle className="w-4 h-4 text-red-500" />
                            )}
                            {source.status === 'pending' && (
                              <Clock className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                        </div>
                        
                        {source.metadata && (
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              {source.metadata.wordCount.toLocaleString()} words
                            </div>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              Score: {source.metadata.readability}/10
                            </div>
                          </div>
                        )}
                        
                        {source.summary && (
                          <div className="text-xs text-muted-foreground border-l-2 border-primary/20 pl-2">
                            {source.summary}
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Analysis Panel */}
        <div className="col-span-8">
          <Tabs defaultValue="analysis" className="space-y-4">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
                <TabsTrigger value="insights">Insights</TabsTrigger>
                <TabsTrigger value="collaborative">Collaborative</TabsTrigger>
                <TabsTrigger value="export">Export</TabsTrigger>
              </TabsList>
              
              <Select value={analysisMode} onValueChange={(value: any) => setAnalysisMode(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quick">Quick Analysis</SelectItem>
                  <SelectItem value="comprehensive">Comprehensive</SelectItem>
                  <SelectItem value="collaborative">Collaborative AI</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <TabsContent value="analysis" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Research Analysis Dashboard
                    <Badge variant="outline">
                      {currentProject?.progress || 0}% Complete
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Project Stats */}
                    <div className="grid grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {currentProject?.sources.length || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">Total Sources</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {currentProject?.sources.filter(s => s.status === 'completed').length || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">Completed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {currentProject?.sources.filter(s => s.status === 'scraping' || s.status === 'processing').length || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">Processing</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {currentProject?.insights?.length || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">Insights</div>
                      </div>
                    </div>

                    <Progress value={currentProject?.progress || 0} className="h-2" />

                    {/* Master Analysis Results */}
                    {currentProject?.masterAnalysis && (
                      <div className="space-y-4">
                        <h4 className="font-medium">Master Analysis Summary</h4>
                        <div className="bg-muted/50 p-4 rounded-lg whitespace-pre-wrap">
                          {currentProject.masterAnalysis}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="insights" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>AI-Generated Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {currentProject?.insights && currentProject.insights.length > 0 ? (
                      currentProject.insights.map((insight, index) => (
                        <div key={index} className="border-l-4 border-primary/30 pl-4 py-2">
                          <div className="flex items-start gap-2">
                            <Brain className="w-4 h-4 text-primary mt-1" />
                            <p className="text-sm">{insight}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Run Master Analysis to generate AI insights</p>
                      </div>
                    )}

                    {currentProject?.recommendations && currentProject.recommendations.length > 0 && (
                      <div className="mt-6">
                        <h4 className="font-medium mb-3">Recommendations</h4>
                        <div className="space-y-2">
                          {currentProject.recommendations.map((rec, index) => (
                            <div key={index} className="flex items-start gap-2 p-2 bg-primary/5 rounded">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                              <span className="text-sm">{rec}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="collaborative" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Collaborative AI Research</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Alert>
                      <Users className="h-4 w-4" />
                      <AlertDescription>
                        Collaborative mode involves multiple AI specialists working together on your research project.
                      </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-2 gap-4">
                      <Card className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Brain className="w-5 h-5 text-blue-500" />
                          <span className="font-medium">Research Analyst</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Data analysis and pattern recognition
                        </p>
                      </Card>
                      
                      <Card className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="w-5 h-5 text-green-500" />
                          <span className="font-medium">Technical Writer</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Documentation and summary generation
                        </p>
                      </Card>
                    </div>

                    <Button 
                      onClick={() => handleStartMasterAnalysis()}
                      disabled={isScrapingActive}
                      className="w-full"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Start Collaborative Analysis
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="export" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Export Research Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Button variant="outline" className="gentle-glow">
                        <FileText className="w-4 h-4 mr-2" />
                        Export as Markdown
                      </Button>
                      <Button variant="outline" className="gentle-glow">
                        <Download className="w-4 h-4 mr-2" />
                        Export as PDF
                      </Button>
                      <Button variant="outline" className="gentle-glow">
                        <Database className="w-4 h-4 mr-2" />
                        Export to JSON
                      </Button>
                      <Button variant="outline" className="gentle-glow">
                        <Link className="w-4 h-4 mr-2" />
                        Share Research Link
                      </Button>
                    </div>
                    
                    <Alert>
                      <Brain className="h-4 w-4" />
                      <AlertDescription>
                        All research data will be automatically uploaded to Mem0 Pro for shared AI memory across all studios.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                      <h4 className="font-medium">Auto-Integration Options</h4>
                      <div className="space-y-1">
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" defaultChecked />
                          Upload to Mem0 Pro for AI memory
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" defaultChecked />
                          Share with Code Studio for implementation
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" />
                          Generate executive summary
                        </label>
                      </div>
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