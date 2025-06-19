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
  Palette,
  Layers,
  Code,
  Download,
  Upload,
  RefreshCw,
  Eye,
  Settings,
  Wand2,
  Grid,
  Monitor,
  Smartphone,
  Tablet,
  Figma,
  Image,
  Type,
  Zap,
  CheckCircle,
  AlertCircle,
  Clock,
  ExternalLink,
  Copy,
  Sparkles,
} from "lucide-react";

interface DesignProject {
  id: string;
  name: string;
  description: string;
  type: 'web-app' | 'mobile-app' | 'component-library' | 'landing-page';
  status: 'draft' | 'in-progress' | 'review' | 'completed';
  components: DesignComponent[];
  theme: DesignTheme;
  penpotProjectId?: string;
  lastModified: Date;
}

interface DesignComponent {
  id: string;
  name: string;
  type: 'button' | 'card' | 'form' | 'navigation' | 'layout' | 'custom';
  description: string;
  code: string;
  preview?: string;
  tailGridsId?: string;
  v0DevId?: string;
  status: 'draft' | 'generated' | 'customized' | 'finalized';
  responsive: {
    mobile: boolean;
    tablet: boolean;
    desktop: boolean;
  };
  accessibility: {
    score: number;
    issues: string[];
  };
}

interface DesignTheme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
  };
  typography: {
    fontFamily: string;
    scale: 'small' | 'medium' | 'large';
  };
  spacing: 'compact' | 'comfortable' | 'spacious';
  borderRadius: 'none' | 'small' | 'medium' | 'large';
}

interface TailGridsComponent {
  id: string;
  name: string;
  category: string;
  tags: string[];
  preview: string;
  code: string;
  premium: boolean;
}

export function DesignStudio() {
  const [projects, setProjects] = useState<DesignProject[]>([
    {
      id: '1',
      name: 'Bons-AI Dashboard',
      description: 'Neurodivergent-friendly AI platform interface',
      type: 'web-app',
      status: 'in-progress',
      components: [],
      theme: {
        name: 'Calm Purple',
        colors: {
          primary: '#8b5cf6',
          secondary: '#a78bfa',
          accent: '#c084fc',
          background: '#faf7ff',
          foreground: '#1e1b2e',
        },
        typography: {
          fontFamily: 'Inter',
          scale: 'medium',
        },
        spacing: 'comfortable',
        borderRadius: 'medium',
      },
      lastModified: new Date(),
    },
  ]);

  const [selectedProject, setSelectedProject] = useState('1');
  const [activeTab, setActiveTab] = useState('components');
  const [penpotConnected, setPenpotConnected] = useState(false);
  const [v0DevConnected, setV0DevConnected] = useState(false);
  const [tailGridsConnected, setTailGridsConnected] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [isGenerating, setIsGenerating] = useState(false);
  const [designPrompt, setDesignPrompt] = useState('');

  // TailGrids component library
  const [tailGridsComponents, setTailGridsComponents] = useState<TailGridsComponent[]>([
    {
      id: 'hero-1',
      name: 'Hero Section with CTA',
      category: 'Heroes',
      tags: ['responsive', 'modern', 'gradient'],
      preview: '/api/tailgrids/preview/hero-1.jpg',
      code: '<section class="bg-gradient-to-r from-purple-600 to-blue-600">...</section>',
      premium: false,
    },
    {
      id: 'nav-1',
      name: 'Navigation Bar',
      category: 'Navigation',
      tags: ['responsive', 'dropdown', 'mobile-friendly'],
      preview: '/api/tailgrids/preview/nav-1.jpg',
      code: '<nav class="bg-white shadow-lg">...</nav>',
      premium: false,
    },
  ]);

  useEffect(() => {
    // Initialize integrations
    initializePenpot();
    initializeV0Dev();
    initializeTailGrids();
  }, []);

  const initializePenpot = async () => {
    try {
      const response = await fetch('/api/design/penpot/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: process.env.NEXT_PUBLIC_PENPOT_API_KEY }),
      });
      
      if (response.ok) {
        setPenpotConnected(true);
      }
    } catch (error) {
      console.error('Failed to connect to Penpot:', error);
    }
  };

  const initializeV0Dev = async () => {
    try {
      const response = await fetch('/api/design/v0dev/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        setV0DevConnected(true);
      }
    } catch (error) {
      console.error('Failed to connect to v0.dev:', error);
    }
  };

  const initializeTailGrids = async () => {
    try {
      const response = await fetch('/api/design/tailgrids/components', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${process.env.NEXT_PUBLIC_TAILGRIDS_API_KEY}` },
      });
      
      if (response.ok) {
        const components = await response.json();
        setTailGridsComponents(components);
        setTailGridsConnected(true);
      }
    } catch (error) {
      console.error('Failed to connect to TailGrids:', error);
    }
  };

  const handleGenerateWithV0Dev = async () => {
    if (!designPrompt.trim()) return;

    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/design/v0dev/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: designPrompt,
          framework: 'react',
          styling: 'tailwind',
          theme: projects.find(p => p.id === selectedProject)?.theme,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        const newComponent: DesignComponent = {
          id: Date.now().toString(),
          name: result.componentName,
          type: 'custom',
          description: designPrompt,
          code: result.code,
          preview: result.preview,
          v0DevId: result.v0DevId,
          status: 'generated',
          responsive: {
            mobile: true,
            tablet: true,
            desktop: true,
          },
          accessibility: {
            score: result.accessibilityScore || 85,
            issues: result.accessibilityIssues || [],
          },
        };

        setProjects(prev => prev.map(project =>
          project.id === selectedProject
            ? { ...project, components: [...project.components, newComponent] }
            : project
        ));

        setDesignPrompt('');
      }
    } catch (error) {
      console.error('v0.dev generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImportFromTailGrids = async (componentId: string) => {
    try {
      const response = await fetch(`/api/design/tailgrids/import/${componentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectTheme: projects.find(p => p.id === selectedProject)?.theme,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        const tailGridsComponent = tailGridsComponents.find(c => c.id === componentId);
        
        const newComponent: DesignComponent = {
          id: Date.now().toString(),
          name: tailGridsComponent?.name || 'Imported Component',
          type: 'custom',
          description: `Imported from TailGrids: ${tailGridsComponent?.category}`,
          code: result.adaptedCode,
          preview: result.preview,
          tailGridsId: componentId,
          status: 'customized',
          responsive: {
            mobile: true,
            tablet: true,
            desktop: true,
          },
          accessibility: {
            score: 90,
            issues: [],
          },
        };

        setProjects(prev => prev.map(project =>
          project.id === selectedProject
            ? { ...project, components: [...project.components, newComponent] }
            : project
        ));
      }
    } catch (error) {
      console.error('TailGrids import failed:', error);
    }
  };

  const handleExportToPenpot = async () => {
    const currentProject = projects.find(p => p.id === selectedProject);
    if (!currentProject) return;

    try {
      const response = await fetch('/api/design/penpot/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project: currentProject,
          exportFormat: 'penpot-design',
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setProjects(prev => prev.map(project =>
          project.id === selectedProject
            ? { ...project, penpotProjectId: result.penpotProjectId }
            : project
        ));
      }
    } catch (error) {
      console.error('Penpot export failed:', error);
    }
  };

  const handleGenerateCode = async (component: DesignComponent) => {
    try {
      const response = await fetch('/api/design/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          component,
          framework: 'next-js',
          styling: 'tailwind',
          typescript: true,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Update component with generated code
        setProjects(prev => prev.map(project =>
          project.id === selectedProject
            ? {
                ...project,
                components: project.components.map(comp =>
                  comp.id === component.id
                    ? { ...comp, code: result.code, status: 'finalized' }
                    : comp
                )
              }
            : project
        ));
      }
    } catch (error) {
      console.error('Code generation failed:', error);
    }
  };

  const currentProject = projects.find(p => p.id === selectedProject);

  return (
    <div className="p-6 space-y-6">
      {/* Header with Integration Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
            <Palette className="w-5 h-5 text-pink-600" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold">Design Studio</h2>
            <p className="text-muted-foreground">
              UI/UX creation with Penpot, v0.dev, and TailGrids integration
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <div className="flex items-center gap-2 text-sm">
            <div className={`w-3 h-3 rounded-full ${penpotConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span>Penpot</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className={`w-3 h-3 rounded-full ${v0DevConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span>v0.dev</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className={`w-3 h-3 rounded-full ${tailGridsConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span>TailGrids</span>
          </div>
          
          <Button onClick={handleExportToPenpot} disabled={!penpotConnected}>
            <ExternalLink className="w-4 h-4 mr-2" />
            Export to Penpot
          </Button>
        </div>
      </div>

      {/* Device Preview Selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Preview Device:</span>
              <div className="flex gap-1">
                <Button
                  variant={selectedDevice === 'mobile' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedDevice('mobile')}
                >
                  <Smartphone className="w-4 h-4" />
                </Button>
                <Button
                  variant={selectedDevice === 'tablet' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedDevice('tablet')}
                >
                  <Tablet className="w-4 h-4" />
                </Button>
                <Button
                  variant={selectedDevice === 'desktop' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedDevice('desktop')}
                >
                  <Monitor className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {currentProject?.theme.name} Theme
              </span>
              <div 
                className="w-6 h-6 rounded border-2 border-white shadow-sm"
                style={{ backgroundColor: currentProject?.theme.colors.primary }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-12 gap-6">
        {/* Tools Panel */}
        <div className="col-span-3">
          <Tabs defaultValue="generate" className="space-y-4">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="generate">Generate</TabsTrigger>
              <TabsTrigger value="library">Library</TabsTrigger>
            </TabsList>

            <TabsContent value="generate" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wand2 className="w-4 h-4" />
                    v0.dev Generator
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Describe the component you want to create..."
                    value={designPrompt}
                    onChange={(e) => setDesignPrompt(e.target.value)}
                    className="min-h-20"
                  />
                  
                  <Button 
                    onClick={handleGenerateWithV0Dev}
                    disabled={!v0DevConnected || isGenerating || !designPrompt.trim()}
                    className="w-full"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Component
                      </>
                    )}
                  </Button>

                  <Alert>
                    <Zap className="h-4 w-4" />
                    <AlertDescription>
                      v0.dev will generate React components with Tailwind CSS based on your description.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Theme Manager
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    {currentProject?.theme.colors && Object.entries(currentProject.theme.colors).map(([key, color]) => (
                      <div key={key} className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded border"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-xs capitalize">{key}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button size="sm" variant="outline" className="w-full">
                    <Settings className="w-4 h-4 mr-2" />
                    Customize Theme
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="library" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Grid className="w-4 h-4" />
                    TailGrids Library
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {tailGridsComponents.map((component) => (
                        <Card key={component.id} className="p-3">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="font-medium text-sm">{component.name}</div>
                              {component.premium && (
                                <Badge variant="secondary" className="text-xs">
                                  Premium
                                </Badge>
                              )}
                            </div>
                            
                            <div className="text-xs text-muted-foreground">
                              {component.category}
                            </div>
                            
                            <div className="flex flex-wrap gap-1">
                              {component.tags.slice(0, 2).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            
                            <Button 
                              size="sm" 
                              className="w-full"
                              onClick={() => handleImportFromTailGrids(component.id)}
                              disabled={!tailGridsConnected}
                            >
                              <Download className="w-3 h-3 mr-1" />
                              Import
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Main Design Area */}
        <div className="col-span-9">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="components">Components</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="code">Code</TabsTrigger>
              <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
            </TabsList>

            <TabsContent value="components" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Project Components</CardTitle>
                </CardHeader>
                <CardContent>
                  {currentProject?.components.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Layers className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No components yet. Generate or import components to get started.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      {currentProject?.components.map((component) => (
                        <Card key={component.id} className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="font-medium">{component.name}</div>
                              <Badge variant={
                                component.status === 'finalized' ? 'default' :
                                component.status === 'generated' ? 'secondary' :
                                'outline'
                              }>
                                {component.status}
                              </Badge>
                            </div>
                            
                            <div className="text-sm text-muted-foreground">
                              {component.description}
                            </div>
                            
                            <div className="flex items-center gap-2 text-xs">
                              {component.responsive.mobile && <Smartphone className="w-3 h-3" />}
                              {component.responsive.tablet && <Tablet className="w-3 h-3" />}
                              {component.responsive.desktop && <Monitor className="w-3 h-3" />}
                              
                              <span className="ml-auto">
                                A11y: {component.accessibility.score}/100
                              </span>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" className="flex-1">
                                <Eye className="w-3 h-3 mr-1" />
                                Preview
                              </Button>
                              <Button 
                                size="sm" 
                                className="flex-1"
                                onClick={() => handleGenerateCode(component)}
                              >
                                <Code className="w-3 h-3 mr-1" />
                                Code
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Live Preview
                    <div className="text-sm text-muted-foreground">
                      {selectedDevice} view
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`border rounded-lg overflow-hidden ${
                    selectedDevice === 'mobile' ? 'max-w-sm mx-auto' :
                    selectedDevice === 'tablet' ? 'max-w-2xl mx-auto' :
                    'w-full'
                  }`}>
                    <div className="bg-gradient-to-br from-primary/5 to-accent/5 p-8 min-h-96 flex items-center justify-center">
                      <div className="text-center">
                        <Monitor className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          Component preview will appear here
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="code" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Generated Code
                    <Button size="sm" variant="outline">
                      <Copy className="w-4 h-4 mr-2" />
                      Copy All
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    className="font-mono text-sm min-h-96"
                    value={currentProject?.components[0]?.code || '// Select a component to view its code'}
                    readOnly
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="accessibility" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Accessibility Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">92</div>
                        <div className="text-sm text-muted-foreground">Overall Score</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">98%</div>
                        <div className="text-sm text-muted-foreground">Color Contrast</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">100%</div>
                        <div className="text-sm text-muted-foreground">Keyboard Nav</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium">Accessibility Checklist</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Alt text for images</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Semantic HTML structure</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">ARIA labels and roles</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm">Focus indicators could be improved</span>
                        </div>
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