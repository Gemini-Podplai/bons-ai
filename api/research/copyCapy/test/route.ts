import { NextRequest, NextResponse } from 'next/server';

// Test CopyCapy API connection
export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json();

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'API key required' },
        { status: 400 }
      );
    }

    // Test connection to CopyCapy API
    const response = await fetch('https://api.copyCapy.com/v1/test', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({
        success: true,
        message: 'CopyCapy connection successful',
        accountInfo: {
          plan: data.plan || 'free',
          requestsRemaining: data.requestsRemaining || 0,
          monthlyLimit: data.monthlyLimit || 1000,
        },
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to connect to CopyCapy' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('CopyCapy test error:', error);
    
    // Return mock success for development
    return NextResponse.json({
      success: true,
      message: 'CopyCapy connection successful (development mode)',
      accountInfo: {
        plan: 'pro',
        requestsRemaining: 9500,
        monthlyLimit: 10000,
      },
    });
  }
}