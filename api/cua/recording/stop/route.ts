import { NextResponse } from 'next/server'

// In-memory storage for demo (use database in production)
const activeRecordings = new Map()
const savedSessions = new Map()

export async function POST() {
  try {
    // Find active recording session
    let activeSession = null
    let sessionId = null
    
    for (const [id, session] of activeRecordings.entries()) {
      if (session.status === 'recording') {
        activeSession = session
        sessionId = id
        break
      }
    }

    if (!activeSession) {
      return NextResponse.json({ 
        success: false, 
        error: 'No active recording session found' 
      }, { status: 400 })
    }

    // Stop screen recording
    await stopScreenRecording(sessionId)

    // Clean up Scrapybara instance if created
    if (activeSession.scrapybara_instance) {
      await cleanupScrapybaraInstance(activeSession.scrapybara_instance)
    }

    // Finalize session
    const finalSession = {
      ...activeSession,
      status: 'completed',
      endTime: Date.now(),
      duration: Date.now() - activeSession.startTime
    }

    // Move to saved sessions
    savedSessions.set(sessionId, finalSession)
    activeRecordings.delete(sessionId)

    // Process and analyze recorded steps
    const analyzedSession = await analyzeRecordedSteps(finalSession)

    return NextResponse.json({ 
      success: true, 
      session: analyzedSession,
      message: `Recording stopped. Captured ${analyzedSession.steps.length} steps.`
    })
  } catch (error) {
    console.error('Failed to stop recording:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to stop recording session' 
    }, { status: 500 })
  }
}

async function stopScreenRecording(sessionId: string) {
  try {
    // Stop screen capture and action monitoring
    console.log('Stopping screen recording for session:', sessionId)
    
    // This would integrate with actual screen recording tools
    // For now, simulate stopping the recording
    return true
  } catch (error) {
    console.error('Failed to stop screen recording:', error)
    return false
  }
}

async function cleanupScrapybaraInstance(instanceId: string) {
  try {
    const scrapybaraUrl = process.env.SCRAPYBARA_URL || 'https://api.scrapybara.com'
    const apiKey = process.env.SCRAPYBARA_API_KEY
    
    if (!apiKey) {
      console.error('Scrapybara API key not configured')
      return false
    }

    const response = await fetch(`${scrapybaraUrl}/v1/instances/${instanceId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      console.log('Scrapybara instance cleaned up:', instanceId)
      return true
    } else {
      console.error('Failed to cleanup Scrapybara instance:', await response.text())
      return false
    }
  } catch (error) {
    console.error('Error cleaning up Scrapybara instance:', error)
    return false
  }
}

async function analyzeRecordedSteps(session: any) {
  try {
    // Simulate step analysis and optimization
    const analyzedSteps = session.steps.map((step: any, index: number) => ({
      ...step,
      id: step.id || `step-${index}`,
      confidence: Math.random() * 0.3 + 0.7, // 70-100% confidence
      optimization_suggestion: generateOptimizationSuggestion(step)
    }))

    return {
      ...session,
      steps: analyzedSteps,
      analysis: {
        total_steps: analyzedSteps.length,
        avg_confidence: analyzedSteps.reduce((acc: number, step: any) => acc + step.confidence, 0) / analyzedSteps.length,
        optimization_opportunities: analyzedSteps.filter((step: any) => step.optimization_suggestion).length,
        estimated_success_rate: Math.min(95, Math.max(60, 80 + (analyzedSteps.length * 2)))
      }
    }
  } catch (error) {
    console.error('Failed to analyze recorded steps:', error)
    return session
  }
}

function generateOptimizationSuggestion(step: any) {
  // Simple heuristics for optimization suggestions
  if (step.action === 'click' && step.duration > 2000) {
    return 'Consider using element wait strategies for better reliability'
  }
  if (step.action === 'type' && step.target.includes('password')) {
    return 'Use secure credential management for password inputs'
  }
  if (step.action === 'scroll' && step.duration < 100) {
    return 'Add delay after scroll to ensure content loads'
  }
  return null
}