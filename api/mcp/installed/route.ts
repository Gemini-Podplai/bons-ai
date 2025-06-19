import { NextResponse } from 'next/server'

// In-memory storage for demo (use database in production)
let installedServers: string[] = []
let runningServers: string[] = []

export async function GET() {
  try {
    return NextResponse.json({ 
      success: true, 
      servers: installedServers,
      running: runningServers,
      total_installed: installedServers.length,
      total_running: runningServers.length
    })
  } catch (error) {
    console.error('Failed to get installed servers:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to get installed servers' 
    }, { status: 500 })
  }
}