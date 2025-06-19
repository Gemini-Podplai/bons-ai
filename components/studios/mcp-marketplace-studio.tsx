'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Package, 
  Search, 
  Download, 
  RefreshCw, 
  Star, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Globe,
  Database,
  Zap,
  Settings,
  Eye,
  Play,
  Stop,
  Monitor,
  GitBranch,
  Users,
  TrendingUp
} from 'lucide-react'

interface MCPServer {
  id: string
  name: string
  description: string
  version: string
  author: string
  category: string
  tags: string[]
  repository: string
  npm_package?: string
  python_package?: string
  install_command: string
  requirements: string[]
  status: 'available' | 'installed' | 'running' | 'failed'
  last_updated: number
  stars: number
  downloads: number
  compatibility: string[]
  documentation_url: string
  api_keys_required: string[]
  dependencies: string[]
  test_endpoint?: string
}

interface ScrapingJob {
  id: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number
  servers_found: number
  last_run: number
  sources: string[]
}

export default function MCPMarketplaceStudio() {
  const [servers, setServers] = useState<MCPServer[]>([])
  const [filteredServers, setFilteredServers] = useState<MCPServer[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedServer, setSelectedServer] = useState<MCPServer | null>(null)
  const [installedServers, setInstalledServers] = useState<string[]>([])
  const [runningServers, setRunningServers] = useState<string[]>([])
  const [scrapingJob, setScrapingJob] = useState<ScrapingJob | null>(null)
  const [autoScrapeEnabled, setAutoScrapeEnabled] = useState(false)

  useEffect(() => {
    loadServers()
    loadInstalledServers()
    checkScrapingStatus()
    
    // Set up 12-hour auto-scraping
    const interval = setInterval(() => {
      if (autoScrapeEnabled) {
        startScraping()
      }
    }, 12 * 60 * 60 * 1000) // 12 hours

    return () => clearInterval(interval)
  }, [autoScrapeEnabled])

  useEffect(() => {
    filterServers()
  }, [servers, searchQuery, selectedCategory])

  const loadServers = async () => {
    try {
      const response = await fetch('/api/mcp/servers')
      const data = await response.json()
      if (data.success) {
        setServers(data.servers)
      }
    } catch (error) {
      console.error('Failed to load servers:', error)
    }
  }

  const loadInstalledServers = async () => {
    try {
      const response = await fetch('/api/mcp/installed')
      const data = await response.json()
      if (data.success) {
        setInstalledServers(data.servers)
        setRunningServers(data.running)
      }
    } catch (error) {
      console.error('Failed to load installed servers:', error)
    }
  }

  const checkScrapingStatus = async () => {
    try {
      const response = await fetch('/api/mcp/scraping/status')
      const data = await response.json()
      if (data.success && data.job) {
        setScrapingJob(data.job)
      }
    } catch (error) {
      console.error('Failed to check scraping status:', error)
    }
  }

  const filterServers = () => {
    let filtered = servers

    if (searchQuery) {
      filtered = filtered.filter(server => 
        server.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        server.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        server.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(server => server.category === selectedCategory)
    }

    setFilteredServers(filtered)
  }

  const startScraping = async () => {
    try {
      const response = await fetch('/api/mcp/scraping/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sources: [
            'https://github.com/topics/mcp-server',
            'https://npmjs.com/search?q=mcp-server',
            'https://pypi.org/search/?q=mcp+server',
            'https://awesome-mcp.com',
            'https://mcp-community.org'
          ]
        })
      })
      
      const data = await response.json()
      if (data.success) {
        setScrapingJob(data.job)
        monitorScraping(data.job.id)
      }
    } catch (error) {
      console.error('Failed to start scraping:', error)
    }
  }

  const monitorScraping = (jobId: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/mcp/scraping/status/${jobId}`)
        const data = await response.json()
        
        if (data.success) {
          setScrapingJob(data.job)
          
          if (data.job.status === 'completed' || data.job.status === 'failed') {
            clearInterval(interval)
            if (data.job.status === 'completed') {
              loadServers() // Refresh server list
            }
          }
        }
      } catch (error) {
        clearInterval(interval)
      }
    }, 2000)
  }

  const installServer = async (server: MCPServer) => {
    try {
      const response = await fetch('/api/mcp/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ server_id: server.id })
      })
      
      const data = await response.json()
      if (data.success) {
        setInstalledServers(prev => [...prev, server.id])
        // Update server status
        setServers(prev => prev.map(s => 
          s.id === server.id ? { ...s, status: 'installed' } : s
        ))
      }
    } catch (error) {
      console.error('Failed to install server:', error)
    }
  }

  const startServer = async (serverId: string) => {
    try {
      const response = await fetch('/api/mcp/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ server_id: serverId })
      })
      
      const data = await response.json()
      if (data.success) {
        setRunningServers(prev => [...prev, serverId])
        setServers(prev => prev.map(s => 
          s.id === serverId ? { ...s, status: 'running' } : s
        ))
      }
    } catch (error) {
      console.error('Failed to start server:', error)
    }
  }

  const stopServer = async (serverId: string) => {
    try {
      const response = await fetch('/api/mcp/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ server_id: serverId })
      })
      
      const data = await response.json()
      if (data.success) {
        setRunningServers(prev => prev.filter(id => id !== serverId))
        setServers(prev => prev.map(s => 
          s.id === serverId ? { ...s, status: 'installed' } : s
        ))
      }
    } catch (error) {
      console.error('Failed to stop server:', error)
    }
  }

  const testServer = async (server: MCPServer) => {
    if (!server.test_endpoint) return
    
    try {
      const response = await fetch('/api/mcp/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          server_id: server.id,
          test_endpoint: server.test_endpoint
        })
      })
      
      const data = await response.json()
      alert(data.success ? 'Server test passed!' : `Server test failed: ${data.error}`)
    } catch (error) {
      console.error('Failed to test server:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-green-500'
      case 'installed': return 'text-blue-500'
      case 'failed': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <CheckCircle className="h-4 w-4" />
      case 'installed': return <Download className="h-4 w-4" />
      case 'failed': return <XCircle className="h-4 w-4" />
      default: return <Package className="h-4 w-4" />
    }
  }

  const categories = [...new Set(servers.map(s => s.category))]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">MCP Marketplace</h1>
          <p className="text-muted-foreground">Discover and manage MCP servers</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline">
            <Package className="h-3 w-3 mr-1" />
            {servers.length} servers
          </Badge>
          <Badge variant="outline">
            <Download className="h-3 w-3 mr-1" />
            {installedServers.length} installed
          </Badge>
          <Button 
            variant="outline" 
            size="sm"
            onClick={startScraping}
            disabled={scrapingJob?.status === 'running'}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${scrapingJob?.status === 'running' ? 'animate-spin' : ''}`} />
            {scrapingJob?.status === 'running' ? 'Scraping...' : 'Update Servers'}
          </Button>
        </div>
      </div>

      {/* Scraping Status */}
      {scrapingJob && scrapingJob.status === 'running' && (
        <Alert>
          <RefreshCw className="h-4 w-4 animate-spin" />
          <AlertDescription>
            Scraping MCP servers from {scrapingJob.sources.length} sources... 
            Found {scrapingJob.servers_found} servers ({scrapingJob.progress}%)
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="marketplace" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="installed">Installed</TabsTrigger>
          <TabsTrigger value="running">Running</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Marketplace Tab */}
        <TabsContent value="marketplace" className="space-y-4">
          {/* Search and Filters */}
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search servers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select 
              className="p-2 border rounded-md"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Server Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredServers.map((server) => (
              <Card key={server.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{server.name}</CardTitle>
                      <CardDescription className="text-sm">
                        by {server.author} • v{server.version}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className={getStatusColor(server.status)}>
                      {getStatusIcon(server.status)}
                      {server.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {server.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-1">
                    {server.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {server.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{server.tags.length - 3}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {server.stars}
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        {server.downloads}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(server.last_updated).toLocaleDateString()}
                    </div>
                  </div>

                  {server.api_keys_required.length > 0 && (
                    <Alert className="py-2">
                      <AlertTriangle className="h-3 w-3" />
                      <AlertDescription className="text-xs">
                        Requires: {server.api_keys_required.join(', ')}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex gap-2">
                    {!installedServers.includes(server.id) ? (
                      <Button
                        size="sm"
                        onClick={() => installServer(server)}
                        className="flex-1"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Install
                      </Button>
                    ) : !runningServers.includes(server.id) ? (
                      <Button
                        size="sm"
                        onClick={() => startServer(server.id)}
                        className="flex-1"
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Start
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => stopServer(server.id)}
                        className="flex-1"
                      >
                        <Stop className="h-3 w-3 mr-1" />
                        Stop
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedServer(server)}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    
                    {server.test_endpoint && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => testServer(server)}
                      >
                        <Zap className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Installed Tab */}
        <TabsContent value="installed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Installed Servers</CardTitle>
              <CardDescription>
                Manage your installed MCP servers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {installedServers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No servers installed yet. Browse the marketplace to get started.
                </div>
              ) : (
                <div className="space-y-2">
                  {servers.filter(s => installedServers.includes(s.id)).map((server) => (
                    <div key={server.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{server.name}</h4>
                          <Badge variant="outline" className={getStatusColor(server.status)}>
                            {getStatusIcon(server.status)}
                            {server.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          v{server.version} • {server.category}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!runningServers.includes(server.id) ? (
                          <Button
                            size="sm"
                            onClick={() => startServer(server.id)}
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Start
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => stopServer(server.id)}
                          >
                            <Stop className="h-3 w-3 mr-1" />
                            Stop
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedServer(server)}
                        >
                          <Settings className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Running Tab */}
        <TabsContent value="running" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Running Servers
              </CardTitle>
              <CardDescription>
                Monitor active MCP server instances
              </CardDescription>
            </CardHeader>
            <CardContent>
              {runningServers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No servers currently running.
                </div>
              ) : (
                <div className="space-y-4">
                  {servers.filter(s => runningServers.includes(s.id)).map((server) => (
                    <div key={server.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{server.name}</h4>
                          <Badge variant="default">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Running
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => stopServer(server.id)}
                        >
                          <Stop className="h-3 w-3 mr-1" />
                          Stop
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Version:</span>
                          <span className="ml-2">{server.version}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Category:</span>
                          <span className="ml-2">{server.category}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Status:</span>
                          <span className="ml-2 text-green-500">Healthy</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Auto-Scraping Settings</CardTitle>
              <CardDescription>
                Configure automatic server discovery
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-scrape">Enable 12-hour auto-scraping</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically discover new MCP servers every 12 hours
                  </p>
                </div>
                <Button
                  variant={autoScrapeEnabled ? "default" : "outline"}
                  onClick={() => setAutoScrapeEnabled(!autoScrapeEnabled)}
                >
                  {autoScrapeEnabled ? 'Enabled' : 'Disabled'}
                </Button>
              </div>
              
              <div className="space-y-2">
                <Label>Scraping Sources</Label>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div>• GitHub repositories (mcp-server topic)</div>
                  <div>• NPM packages (mcp-server keyword)</div>
                  <div>• PyPI packages (mcp server search)</div>
                  <div>• Community curated lists</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Server Detail Modal */}
      {selectedServer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{selectedServer.name}</CardTitle>
                  <CardDescription>
                    by {selectedServer.author} • v{selectedServer.version}
                  </CardDescription>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedServer(null)}
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">{selectedServer.description}</p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Installation</h4>
                <code className="text-sm bg-muted p-2 rounded block">
                  {selectedServer.install_command}
                </code>
              </div>
              
              {selectedServer.requirements.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Requirements</h4>
                  <ul className="text-sm space-y-1">
                    {selectedServer.requirements.map((req, index) => (
                      <li key={index}>• {req}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button asChild>
                  <a href={selectedServer.repository} target="_blank" rel="noopener noreferrer">
                    <GitBranch className="h-4 w-4 mr-2" />
                    Repository
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href={selectedServer.documentation_url} target="_blank" rel="noopener noreferrer">
                    <Globe className="h-4 w-4 mr-2" />
                    Documentation
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}