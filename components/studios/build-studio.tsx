"use client";

import { useState, useEffect } from "react";
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
  Hammer,
  Rocket,
  Database,
  Layers,
  Activity,
  Settings,
  Globe,
  Code,
  Play,
  Pause,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  ExternalLink,
  Monitor,
  Zap,
  Server,
  Cloud,
  BarChart3,
  GitBranch,
  Package,
  Eye,
  Terminal,
  Gauge,
} from "lucide-react";

interface BuildProject {
  id: string;
  name: string;
  description: string;
  framework: 'next-js' | 'vite-react' | 'node-express' | 'python-flask';
  database: 'postgresql' | 'mysql' | 'mongodb' | 'supabase' | 'planetscale';
  deployment: 'vercel' | 'netlify' | 'aws' | 'digital-ocean' | 'railway';
  status: 'planning' | 'scaffolding' | 'development' | 'testing' | 'deployed';
  environment: {
    development: EnvironmentStatus;
    staging: EnvironmentStatus;
    production: EnvironmentStatus;
  };
  apis: APIEndpoint[];
  performance: PerformanceMetrics;
  lastBuild: Date;
  deploymentUrl?: string;
}

interface EnvironmentStatus {
  status: 'healthy' | 'warning' | 'error' | 'offline';
  url?: string;
  lastDeploy?: Date;
  version?: string;
  metrics?: {
    uptime: number;
    responseTime: number;
    errorRate: number;
  };
}

interface APIEndpoint {
  id: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  status: 'planned' | 'implemented' | 'tested' | 'deprecated';
  responseTime?: number;
  successRate?: number;
}

interface PerformanceMetrics {
  lighthouse: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
  webVitals: {
    lcp: number; // Largest Contentful Paint
    fid: number; // First Input Delay
    cls: number; // Cumulative Layout Shift
  };
  bundle: {
    size: number;
    gzipSize: number;
    loadTime: number;
  };
}

interface DeploymentPipeline {
  stage: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  duration?: number;
  logs?: string[];
}

export function BuildStudio() {
  const [projects, setProjects] = useState<BuildProject[]>([
    {
      id: '1',
      name: 'AI Research Platform',
      description: 'Full-stack platform for AI-powered research and analysis',
      framework: 'next-js',
      database: 'supabase',
      deployment: 'vercel',
      status: 'development',
      environment: {
        development: {
          status: 'healthy',
          url: 'http://localhost:3000',
          metrics: {
            uptime: 99.9,
            responseTime: 45,
            errorRate: 0.1,
          },
        },
        staging: {
          status: 'healthy',
          url: 'https://staging-ai-research.vercel.app',
          lastDeploy: new Date(),
          version: 'v1.2.3-staging',
          metrics: {
            uptime: 99.5,
            responseTime: 120,
            errorRate: 0.2,
          },
        },
        production: {
          status: 'warning',
          url: 'https://ai-research-platform.com',
          lastDeploy: new Date(Date.now() - 86400000), // 1 day ago
          version: 'v1.2.0',
          metrics: {
            uptime: 99.8,
            responseTime: 89,
            errorRate: 0.05,
          },
        },
      },
      apis: [
        {
          id: '1',
          path: '/api/research/analyze',
          method: 'POST',
          description: 'Analyze research content with AI',
          status: 'implemented',
          responseTime: 850,
          successRate: 99.2,
        },
        {
          id: '2',
          path: '/api/research/projects',
          method: 'GET',
          description: 'Get all research projects',
          status: 'tested',
          responseTime: 45,
          successRate: 100,
        },
      ],
      performance: {
        lighthouse: {
          performance: 92,
          accessibility: 95,
          bestPractices: 88,
          seo: 94,
        },
        webVitals: {
          lcp: 1.2,
          fid: 12,
          cls: 0.05,
        },
        bundle: {
          size: 245,
          gzipSize: 89,
          loadTime: 1.8,
        },
      },
      lastBuild: new Date(),
      deploymentUrl: 'https://ai-research-platform.com',
    },
  ]);

  const [selectedProject, setSelectedProject] = useState('1');
  const [activeTab, setActiveTab] = useState('overview');
  const [isBuilding, setIsBuilding] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentPipeline, setDeploymentPipeline] = useState<DeploymentPipeline[]>([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [showScaffoldDialog, setShowScaffoldDialog] = useState(false);

  const [scaffoldConfig, setScaffoldConfig] = useState({
    framework: 'next-js',
    database: 'supabase',
    authentication: 'clerk',
    deployment: 'vercel',
    features: [] as string[],
  });

  useEffect(() => {
    // Initialize performance monitoring
    initializeMonitoring();
    
    // Set up real-time updates
    const interval = setInterval(updateMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const initializeMonitoring = async () => {
    try {
      // Initialize performance monitoring for all environments
      console.log('Initializing performance monitoring...');
    } catch (error) {
      console.error('Failed to initialize monitoring:', error);
    }
  };

  const updateMetrics = async () => {
    try {
      const response = await fetch(`/api/build/metrics/${selectedProject}`);
      if (response.ok) {
        const metrics = await response.json();
        // Update project metrics
        setProjects(prev => prev.map(project =>
          project.id === selectedProject
            ? { ...project, performance: metrics.performance, environment: metrics.environment }
            : project
        ));
      }
    } catch (error) {
      console.error('Failed to update metrics:', error);
    }
  };

  const handleScaffoldProject = async () => {
    setIsBuilding(true);
    
    try {
      const response = await fetch('/api/build/scaffold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProjectName,
          config: scaffoldConfig,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        const newProject: BuildProject = {
          id: Date.now().toString(),
          name: newProjectName,
          description: `Generated ${scaffoldConfig.framework} project with ${scaffoldConfig.database}`,
          framework: scaffoldConfig.framework as any,
          database: scaffoldConfig.database as any,
          deployment: scaffoldConfig.deployment as any,
          status: 'scaffolding',
          environment: {
            development: { status: 'offline' },
            staging: { status: 'offline' },
            production: { status: 'offline' },
          },
          apis: [],
          performance: {
            lighthouse: { performance: 0, accessibility: 0, bestPractices: 0, seo: 0 },
            webVitals: { lcp: 0, fid: 0, cls: 0 },
            bundle: { size: 0, gzipSize: 0, loadTime: 0 },
          },
          lastBuild: new Date(),
        };

        setProjects(prev => [...prev, newProject]);
        setSelectedProject(newProject.id);
        setShowScaffoldDialog(false);
        setNewProjectName('');
      }
    } catch (error) {
      console.error('Scaffolding failed:', error);
    } finally {
      setIsBuilding(false);
    }
  };

  const handleDeploy = async (environment: 'staging' | 'production') => {
    setIsDeploying(true);
    
    const pipeline: DeploymentPipeline[] = [
      { stage: 'Build', status: 'running' },
      { stage: 'Test', status: 'pending' },
      { stage: 'Deploy', status: 'pending' },
      { stage: 'Verify', status: 'pending' },
    ];
    
    setDeploymentPipeline(pipeline);

    try {
      // Simulate deployment pipeline
      for (let i = 0; i < pipeline.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setDeploymentPipeline(prev => prev.map((stage, index) => {
          if (index === i) {
            return { ...stage, status: 'success', duration: Math.floor(Math.random() * 30) + 10 };
          } else if (index === i + 1) {
            return { ...stage, status: 'running' };
          }
          return stage;
        }));
      }

      // Update project environment status
      setProjects(prev => prev.map(project =>
        project.id === selectedProject
          ? {
              ...project,
              environment: {
                ...project.environment,
                [environment]: {
                  ...project.environment[environment],
                  status: 'healthy',
                  lastDeploy: new Date(),
                  version: `v${Math.floor(Math.random() * 10) + 1}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`,
                },
              },
            }
          : project
      ));

    } catch (error) {
      console.error('Deployment failed:', error);
      setDeploymentPipeline(prev => prev.map(stage => ({ ...stage, status: 'failed' })));
    } finally {
      setIsDeploying(false);
    }
  };

  const handleRunLighthouse = async () => {
    try {
      const response = await fetch(`/api/build/lighthouse/${selectedProject}`, {
        method: 'POST',
      });

      const result = await response.json();
      
      if (result.success) {
        setProjects(prev => prev.map(project =>
          project.id === selectedProject
            ? { ...project, performance: { ...project.performance, lighthouse: result.lighthouse } }
            : project
        ));
      }
    } catch (error) {
      console.error('Lighthouse audit failed:', error);
    }
  };

  const currentProject = projects.find(p => p.id === selectedProject);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Hammer className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold">Build Studio</h2>
            <p className="text-muted-foreground">
              Full-stack application assembly with deployment automation
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowScaffoldDialog(true)}
            className="gentle-glow"
          >
            <Package className="w-4 h-4 mr-2" />
            New Project
          </Button>
          
          <Button 
            onClick={() => handleDeploy('staging')}
            disabled={isDeploying}
            variant="outline"
          >
            <Rocket className="w-4 h-4 mr-2" />
            Deploy Staging
          </Button>
          
          <Button 
            onClick={() => handleDeploy('production')}
            disabled={isDeploying}
            variant="outline"
          >
            <Globe className="w-4 h-4 mr-2" />
            Deploy Production
          </Button>
        </div>
      </div>

      {/* Project Selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {currentProject && (
                <Badge variant={
                  currentProject.status === 'deployed' ? 'default' :
                  currentProject.status === 'development' ? 'secondary' :
                  'outline'
                }>
                  {currentProject.status}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Code className="w-4 h-4" />
                {currentProject?.framework}
              </div>
              <div className="flex items-center gap-1">
                <Database className="w-4 h-4" />
                {currentProject?.database}
              </div>
              <div className="flex items-center gap-1">
                <Cloud className="w-4 h-4" />
                {currentProject?.deployment}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Environment Status */}
      <div className="grid grid-cols-3 gap-4">
        {currentProject && Object.entries(currentProject.environment).map(([env, status]) => (
          <Card key={env}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="capitalize font-medium">{env}</div>
                <div className={`w-3 h-3 rounded-full ${
                  status.status === 'healthy' ? 'bg-green-500' :
                  status.status === 'warning' ? 'bg-yellow-500' :
                  status.status === 'error' ? 'bg-red-500' :
                  'bg-gray-400'
                }`} />
              </div>
              
              {status.url && (
                <div className="text-xs text-muted-foreground mb-2 truncate">
                  {status.url}
                </div>
              )}
              
              {status.metrics && (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>Uptime: {status.metrics.uptime}%</div>
                  <div>Response: {status.metrics.responseTime}ms</div>
                </div>
              )}
              
              <div className="flex gap-1 mt-3">
                <Button size="sm" variant="outline" className="flex-1 text-xs">
                  <Eye className="w-3 h-3 mr-1" />
                  View
                </Button>
                <Button size="sm" variant="outline" className="flex-1 text-xs">
                  <Activity className="w-3 h-3 mr-1" />
                  Logs
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Deployment Pipeline */}
      {deploymentPipeline.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="w-4 h-4" />
              Deployment Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              {deploymentPipeline.map((stage, index) => (
                <div key={index} className="text-center">
                  <div className={`w-12 h-12 rounded-full border-2 mx-auto mb-2 flex items-center justify-center ${
                    stage.status === 'success' ? 'border-green-500 bg-green-50' :
                    stage.status === 'running' ? 'border-blue-500 bg-blue-50' :
                    stage.status === 'failed' ? 'border-red-500 bg-red-50' :
                    'border-gray-300 bg-gray-50'
                  }`}>
                    {stage.status === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
                    {stage.status === 'running' && <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />}
                    {stage.status === 'failed' && <AlertCircle className="w-5 h-5 text-red-500" />}
                    {stage.status === 'pending' && <Clock className="w-5 h-5 text-gray-400" />}
                  </div>
                  <div className="font-medium text-sm">{stage.stage}</div>
                  {stage.duration && (
                    <div className="text-xs text-muted-foreground">{stage.duration}s</div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="apis">APIs</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Structure</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm font-mono bg-muted/50 p-3 rounded">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="w-4 h-4" />
                      {currentProject?.name}
                    </div>
                    <div className="ml-6 space-y-1">
                      <div>├── app/</div>
                      <div>├── components/</div>
                      <div>├── lib/</div>
                      <div>├── public/</div>
                      <div>└── package.json</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Framework: {currentProject?.framework}</div>
                    <div>Database: {currentProject?.database}</div>
                    <div>Deployment: {currentProject?.deployment}</div>
                    <div>Last Build: {currentProject?.lastBuild.toLocaleDateString()}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button size="sm" variant="outline" className="gentle-glow">
                    <Play className="w-4 h-4 mr-2" />
                    Start Dev Server
                  </Button>
                  <Button size="sm" variant="outline" className="gentle-glow">
                    <Terminal className="w-4 h-4 mr-2" />
                    Open Terminal
                  </Button>
                  <Button size="sm" variant="outline" className="gentle-glow">
                    <GitBranch className="w-4 h-4 mr-2" />
                    Git Status
                  </Button>
                  <Button size="sm" variant="outline" className="gentle-glow">
                    <Settings className="w-4 h-4 mr-2" />
                    Configure
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="apis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                API Endpoints
                <Button size="sm">
                  <Code className="w-4 h-4 mr-2" />
                  Generate API
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentProject?.apis.map((api) => (
                  <Card key={api.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="font-mono">
                          {api.method}
                        </Badge>
                        <span className="font-mono">{api.path}</span>
                        <span className="text-sm text-muted-foreground">{api.description}</span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Badge variant={
                          api.status === 'tested' ? 'default' :
                          api.status === 'implemented' ? 'secondary' :
                          'outline'
                        }>
                          {api.status}
                        </Badge>
                        
                        {api.responseTime && (
                          <div className="text-sm text-muted-foreground">
                            {api.responseTime}ms
                          </div>
                        )}
                        
                        {api.successRate && (
                          <div className="text-sm text-green-600">
                            {api.successRate}%
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Lighthouse Scores
                  <Button size="sm" onClick={handleRunLighthouse}>
                    <Gauge className="w-4 h-4 mr-2" />
                    Run Audit
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentProject?.performance.lighthouse && Object.entries(currentProject.performance.lighthouse).map(([metric, score]) => (
                    <div key={metric} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="capitalize text-sm">{metric.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="font-medium">{score}/100</span>
                      </div>
                      <Progress value={score} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Web Vitals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {currentProject?.performance.webVitals.lcp}s
                      </div>
                      <div className="text-xs text-muted-foreground">LCP</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {currentProject?.performance.webVitals.fid}ms
                      </div>
                      <div className="text-xs text-muted-foreground">FID</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        {currentProject?.performance.webVitals.cls}
                      </div>
                      <div className="text-xs text-muted-foreground">CLS</div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>Bundle Size: {currentProject?.performance.bundle.size}KB</div>
                    <div>Gzipped: {currentProject?.performance.bundle.gzipSize}KB</div>
                    <div>Load Time: {currentProject?.performance.bundle.loadTime}s</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                Database Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Database className="h-4 w-4" />
                  <AlertDescription>
                    Connected to {currentProject?.database}. Database operations and migrations can be managed here.
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-3 gap-4">
                  <Button variant="outline" className="gentle-glow">
                    <Layers className="w-4 h-4 mr-2" />
                    View Schema
                  </Button>
                  <Button variant="outline" className="gentle-glow">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Run Migration
                  </Button>
                  <Button variant="outline" className="gentle-glow">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Analytics
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Real-time Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">99.9%</div>
                      <div className="text-sm text-muted-foreground">Uptime</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">89ms</div>
                      <div className="text-sm text-muted-foreground">Avg Response</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>CPU Usage</span>
                      <span>45%</span>
                    </div>
                    <Progress value={45} />
                    
                    <div className="flex justify-between text-sm">
                      <span>Memory Usage</span>
                      <span>62%</span>
                    </div>
                    <Progress value={62} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Error Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">0.05%</div>
                    <div className="text-sm text-muted-foreground">Error Rate</div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">Recent Errors:</div>
                    <div className="bg-muted/50 p-2 rounded text-xs font-mono">
                      No critical errors in the last 24 hours
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Scaffold Dialog */}
      {showScaffoldDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Create New Project</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Project name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
              />
              
              <Select value={scaffoldConfig.framework} onValueChange={(value) => 
                setScaffoldConfig(prev => ({ ...prev, framework: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Framework" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="next-js">Next.js 14</SelectItem>
                  <SelectItem value="vite-react">Vite + React</SelectItem>
                  <SelectItem value="node-express">Node.js + Express</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={scaffoldConfig.database} onValueChange={(value) => 
                setScaffoldConfig(prev => ({ ...prev, database: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Database" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="supabase">Supabase</SelectItem>
                  <SelectItem value="planetscale">PlanetScale</SelectItem>
                  <SelectItem value="postgresql">PostgreSQL</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleScaffoldProject}
                  disabled={!newProjectName.trim() || isBuilding}
                  className="flex-1"
                >
                  {isBuilding ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Package className="w-4 h-4 mr-2" />
                  )}
                  Create
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowScaffoldDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}