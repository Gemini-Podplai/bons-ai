import { NextRequest, NextResponse } from 'next/server'

// In-memory storage for demo (use database in production)
let runningServers: string[] = []

export async function POST(request: NextRequest) {
  try {
    const { server_id } = await request.json()
    
    if (!server_id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Server ID is required' 
      }, { status: 400 })
    }

    // Check if server is running
    if (!runningServers.includes(server_id)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Server is not running' 
      }, { status: 404 })
    }

    // Stop the server
    await stopServer(server_id)
    
    // Remove from running list
    runningServers = runningServers.filter(id => id !== server_id)

    return NextResponse.json({ 
      success: true, 
      server_id,
      message: 'Server stopped successfully'
    })
  } catch (error) {
    console.error('Failed to stop server:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to stop server' 
    }, { status: 500 })
  }
}

async function stopServer(serverId: string) {
  // In a real implementation, this would:
  // 1. Gracefully shutdown server connections
  // 2. Save server state if needed
  // 3. Terminate server process
  // 4. Clean up resources
  // 5. Update MCP registry
  
  console.log(`Stopping MCP server: ${serverId}`)
  
  // Simulate shutdown time
  await new Promise(resolve => setTimeout(resolve, 500))
  
  console.log(`Successfully stopped MCP server: ${serverId}`)
}