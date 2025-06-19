import { NextResponse } from 'next/server'

// In-memory storage for demo (use database in production)
let currentScrapingJob: any = null

export async function GET() {
  try {
    return NextResponse.json({ 
      success: true, 
      job: currentScrapingJob,
      message: currentScrapingJob ? 'Scraping job found' : 'No active scraping job'
    })
  } catch (error) {
    console.error('Failed to get scraping status:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to get scraping status' 
    }, { status: 500 })
  }
}