import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

// In-memory storage for demo (use database in production)
const activeRecordings = new Map()

export async function POST(request: NextRequest) {
  try {
    const { permission_level, session_name } = await request.json()
    
    // Validate permission level
    if (!['safe', 'restricted', 'full'].includes(permission_level)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid permission level' 
      }, { status: 400 })
    }

    // Create new session
    const sessionId = uuidv4()
    const session = {
      id: sessionId,
      name: session_name || `CUA Session ${Date.now()}`,
      status: 'recording',
      steps: [],
      permission_level,
      startTime: Date.now(),
      scrapybara_instance: null
    }

    // Start Scrapybara instance if not in safe mode
    if (permission_level !== 'safe') {
      const scrapybaraInstance = await createScrapybaraInstance(permission_level)
      if (scrapybaraInstance) {
        session.scrapybara_instance = scrapybaraInstance.id
      }
    }

    // Store active recording
    activeRecordings.set(sessionId, session)

    // Initialize screen recording
    await initializeScreenRecording(sessionId, permission_level)

    return NextResponse.json({ 
      success: true, 
      session,
      message: 'Recording started successfully'
    })
  } catch (error) {
    console.error('Failed to start recording:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to start recording session' 
    }, { status: 500 })
  }
}

async function createScrapybaraInstance(permissionLevel: string) {
  try {
    const scrapybaraUrl = process.env.SCRAPYBARA_URL || 'https://api.scrapybara.com'
    const apiKey = process.env.SCRAPYBARA_API_KEY
    
    if (!apiKey) {
      throw new Error('Scrapybara API key not configured')
    }

    const config = {
      safe: {
        browser_only: true,
        file_system_access: false,
        network_access: false
      },
      restricted: {
        browser_only: false,
        file_system_access: 'limited',
        network_access: 'monitored'
      },
      full: {
        browser_only: false,
        file_system_access: 'full',
        network_access: 'full'
      }
    }

    const response = await fetch(`${scrapybaraUrl}/v1/instances`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: `CUA-Training-${Date.now()}`,
        configuration: config[permissionLevel as keyof typeof config],
        timeout: 3600 // 1 hour timeout
      })
    })

    if (response.ok) {
      return await response.json()
    } else {
      console.error('Failed to create Scrapybara instance:', await response.text())
      return null
    }
  } catch (error) {
    console.error('Error creating Scrapybara instance:', error)
    return null
  }
}

async function initializeScreenRecording(sessionId: string, permissionLevel: string) {
  try {
    // Initialize screen capture and action monitoring
    const recordingConfig = {
      sessionId,
      permissionLevel,
      captureScreenshots: true,
      captureActions: true,
      captureKeystrokes: permissionLevel === 'full',
      captureMouseMovements: true,
      interval: 100 // ms between captures
    }

    // Start background recording process
    // This would integrate with actual screen recording tools
    console.log('Screen recording initialized:', recordingConfig)
    
    return true
  } catch (error) {
    console.error('Failed to initialize screen recording:', error)
    return false
  }
}