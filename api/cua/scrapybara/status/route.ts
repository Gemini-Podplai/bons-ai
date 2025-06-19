import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check Scrapybara connection status
    const scrapybaraUrl = process.env.SCRAPYBARA_URL || 'https://api.scrapybara.com'
    const apiKey = process.env.SCRAPYBARA_API_KEY
    
    if (!apiKey) {
      return NextResponse.json({ 
        connected: false, 
        error: 'Scrapybara API key not configured' 
      })
    }

    const response = await fetch(`${scrapybaraUrl}/v1/instances`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      const instances = await response.json()
      return NextResponse.json({ 
        connected: true, 
        instances: instances.length,
        active_instances: instances.filter((i: any) => i.status === 'running').length
      })
    } else {
      return NextResponse.json({ 
        connected: false, 
        error: 'Failed to connect to Scrapybara API' 
      })
    }
  } catch (error) {
    console.error('Scrapybara connection error:', error)
    return NextResponse.json({ 
      connected: false, 
      error: 'Connection timeout or network error' 
    })
  }
}