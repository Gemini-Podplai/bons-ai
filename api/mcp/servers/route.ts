import { NextResponse } from 'next/server'

// In-memory storage for demo (use database in production)
let mcpServers = [
  {
    id: 'filesystem-server',
    name: 'Filesystem Server',
    description: 'Provides file system operations through MCP protocol',
    version: '1.0.0',
    author: 'MCP Community',
    category: 'File System',
    tags: ['filesystem', 'files', 'io'],
    repository: 'https://github.com/mcp-community/filesystem-server',
    install_command: 'npm install @mcp/filesystem-server',
    requirements: ['Node.js 18+'],
    status: 'available',
    last_updated: Date.now() - 86400000,
    stars: 245,
    downloads: 1250,
    compatibility: ['Windows', 'macOS', 'Linux'],
    documentation_url: 'https://docs.mcp.dev/servers/filesystem',
    api_keys_required: [],
    dependencies: ['@mcp/core'],
    test_endpoint: '/api/mcp/test/filesystem'
  },
  {
    id: 'database-server',
    name: 'Database MCP Server',
    description: 'Connect to various databases through MCP protocol',
    version: '2.1.0',
    author: 'DataCorp',
    category: 'Database',
    tags: ['database', 'sql', 'nosql', 'postgres', 'mongodb'],
    repository: 'https://github.com/datacorp/mcp-database-server',
    install_command: 'pip install mcp-database-server',
    requirements: ['Python 3.8+', 'Database drivers'],
    status: 'available',
    last_updated: Date.now() - 43200000,
    stars: 189,
    downloads: 890,
    compatibility: ['Windows', 'macOS', 'Linux'],
    documentation_url: 'https://database-mcp.readthedocs.io',
    api_keys_required: ['DATABASE_URL'],
    dependencies: ['psycopg2', 'pymongo'],
    test_endpoint: '/api/mcp/test/database'
  },
  {
    id: 'weather-api-server',
    name: 'Weather API Server',
    description: 'Access weather data from multiple providers via MCP',
    version: '1.5.2',
    author: 'WeatherDev',
    category: 'API Integration',
    tags: ['weather', 'api', 'climate', 'forecast'],
    repository: 'https://github.com/weatherdev/mcp-weather-server',
    install_command: 'npm install @weather/mcp-server',
    requirements: ['Node.js 16+', 'Weather API keys'],
    status: 'available',
    last_updated: Date.now() - 21600000,
    stars: 156,
    downloads: 672,
    compatibility: ['Windows', 'macOS', 'Linux'],
    documentation_url: 'https://weather-mcp.dev/docs',
    api_keys_required: ['OPENWEATHER_API_KEY', 'WEATHERSTACK_API_KEY'],
    dependencies: ['axios', 'dotenv'],
    test_endpoint: '/api/mcp/test/weather'
  },
  {
    id: 'git-server',
    name: 'Git MCP Server',
    description: 'Git operations and repository management through MCP',
    version: '1.2.1',
    author: 'GitTools',
    category: 'Version Control',
    tags: ['git', 'version-control', 'repository', 'commit'],
    repository: 'https://github.com/gittools/mcp-git-server',
    install_command: 'go install github.com/gittools/mcp-git-server@latest',
    requirements: ['Go 1.19+', 'Git'],
    status: 'available',
    last_updated: Date.now() - 7200000,
    stars: 298,
    downloads: 1456,
    compatibility: ['Windows', 'macOS', 'Linux'],
    documentation_url: 'https://git-mcp.gittools.dev',
    api_keys_required: ['GITHUB_TOKEN'],
    dependencies: ['git'],
    test_endpoint: '/api/mcp/test/git'
  },
  {
    id: 'slack-server',
    name: 'Slack Integration Server',
    description: 'Send messages and interact with Slack through MCP',
    version: '0.9.0',
    author: 'SlackMCP Team',
    category: 'Communication',
    tags: ['slack', 'messaging', 'notifications', 'chat'],
    repository: 'https://github.com/slackmcp/mcp-slack-server',
    install_command: 'npm install @slackmcp/server',
    requirements: ['Node.js 18+', 'Slack App'],
    status: 'available',
    last_updated: Date.now() - 3600000,
    stars: 123,
    downloads: 445,
    compatibility: ['Windows', 'macOS', 'Linux'],
    documentation_url: 'https://slack-mcp.dev',
    api_keys_required: ['SLACK_BOT_TOKEN', 'SLACK_SIGNING_SECRET'],
    dependencies: ['@slack/bolt'],
    test_endpoint: '/api/mcp/test/slack'
  },
  {
    id: 'aws-server',
    name: 'AWS MCP Server',
    description: 'AWS services integration through MCP protocol',
    version: '2.0.0',
    author: 'AWS Community',
    category: 'Cloud Services',
    tags: ['aws', 'cloud', 's3', 'lambda', 'ec2'],
    repository: 'https://github.com/aws-community/mcp-aws-server',
    install_command: 'pip install aws-mcp-server',
    requirements: ['Python 3.9+', 'AWS CLI', 'boto3'],
    status: 'available',
    last_updated: Date.now() - 10800000,
    stars: 334,
    downloads: 2156,
    compatibility: ['Windows', 'macOS', 'Linux'],
    documentation_url: 'https://aws-mcp.amazonaws.com',
    api_keys_required: ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY'],
    dependencies: ['boto3', 'botocore'],
    test_endpoint: '/api/mcp/test/aws'
  },
  {
    id: 'browser-automation-server',
    name: 'Browser Automation Server',
    description: 'Automate web browsers through MCP for testing and scraping',
    version: '1.3.0',
    author: 'AutoBrowser',
    category: 'Automation',
    tags: ['browser', 'automation', 'scraping', 'testing', 'playwright'],
    repository: 'https://github.com/autobrowser/mcp-browser-server',
    install_command: 'npm install @autobrowser/mcp-server',
    requirements: ['Node.js 18+', 'Playwright'],
    status: 'available',
    last_updated: Date.now() - 5400000,
    stars: 201,
    downloads: 723,
    compatibility: ['Windows', 'macOS', 'Linux'],
    documentation_url: 'https://browser-mcp.autobrowser.dev',
    api_keys_required: [],
    dependencies: ['playwright', '@playwright/test'],
    test_endpoint: '/api/mcp/test/browser'
  },
  {
    id: 'email-server',
    name: 'Email MCP Server',
    description: 'Send and receive emails through various providers via MCP',
    version: '1.1.0',
    author: 'EmailMCP',
    category: 'Communication',
    tags: ['email', 'smtp', 'imap', 'gmail', 'outlook'],
    repository: 'https://github.com/emailmcp/mcp-email-server',
    install_command: 'npm install @emailmcp/server',
    requirements: ['Node.js 16+', 'Email provider credentials'],
    status: 'available',
    last_updated: Date.now() - 14400000,
    stars: 87,
    downloads: 234,
    compatibility: ['Windows', 'macOS', 'Linux'],
    documentation_url: 'https://email-mcp.dev',
    api_keys_required: ['EMAIL_PROVIDER_API_KEY'],
    dependencies: ['nodemailer', 'imap'],
    test_endpoint: '/api/mcp/test/email'
  }
]

export async function GET() {
  try {
    // Sort servers by popularity (stars + downloads)
    const sortedServers = mcpServers.sort((a, b) => 
      (b.stars + b.downloads) - (a.stars + a.downloads)
    )

    return NextResponse.json({ 
      success: true, 
      servers: sortedServers,
      total: sortedServers.length,
      categories: [...new Set(sortedServers.map(s => s.category))],
      last_updated: Math.max(...sortedServers.map(s => s.last_updated))
    })
  } catch (error) {
    console.error('Failed to load MCP servers:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to load MCP servers' 
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const newServer = await request.json()
    
    // Validate required fields
    const requiredFields = ['id', 'name', 'description', 'version', 'author', 'category']
    for (const field of requiredFields) {
      if (!newServer[field]) {
        return NextResponse.json({ 
          success: false, 
          error: `Missing required field: ${field}` 
        }, { status: 400 })
      }
    }

    // Check if server already exists
    if (mcpServers.find(s => s.id === newServer.id)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Server with this ID already exists' 
      }, { status: 409 })
    }

    // Add default values
    const server = {
      ...newServer,
      status: 'available',
      last_updated: Date.now(),
      stars: 0,
      downloads: 0,
      tags: newServer.tags || [],
      requirements: newServer.requirements || [],
      compatibility: newServer.compatibility || ['Windows', 'macOS', 'Linux'],
      api_keys_required: newServer.api_keys_required || [],
      dependencies: newServer.dependencies || []
    }

    mcpServers.push(server)

    return NextResponse.json({ 
      success: true, 
      server,
      message: 'MCP server added successfully'
    })
  } catch (error) {
    console.error('Failed to add MCP server:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to add MCP server' 
    }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const updatedServer = await request.json()
    
    if (!updatedServer.id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Server ID is required' 
      }, { status: 400 })
    }

    const index = mcpServers.findIndex(s => s.id === updatedServer.id)
    if (index === -1) {
      return NextResponse.json({ 
        success: false, 
        error: 'Server not found' 
      }, { status: 404 })
    }

    // Update the server
    mcpServers[index] = {
      ...mcpServers[index],
      ...updatedServer,
      last_updated: Date.now()
    }

    return NextResponse.json({ 
      success: true, 
      server: mcpServers[index],
      message: 'MCP server updated successfully'
    })
  } catch (error) {
    console.error('Failed to update MCP server:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update MCP server' 
    }, { status: 500 })
  }
}