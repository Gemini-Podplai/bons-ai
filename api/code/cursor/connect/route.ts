import { NextRequest, NextResponse } from 'next/server';

interface CursorConnectRequest {
  workspace: string;
  apiKey?: string;
}

// Connect to Cursor Pro
export async function POST(request: NextRequest) {
  try {
    const { workspace, apiKey }: CursorConnectRequest = await request.json();

    if (!workspace) {
      return NextResponse.json(
        { success: false, error: 'Workspace path is required' },
        { status: 400 }
      );
    }

    // Validate workspace path
    if (!workspace.startsWith('/home/scrapybara/')) {
      return NextResponse.json(
        { success: false, error: 'Invalid workspace path' },
        { status: 400 }
      );
    }

    const cursorApiKey = apiKey || process.env.CURSOR_API_KEY;

    if (!cursorApiKey) {
      // Return mock success for development
      return NextResponse.json({
        success: true,
        message: 'Cursor Pro connected successfully (development mode)',
        workspace,
        features: {
          aiSuggestions: true,
          autoComplete: true,
          codeReview: true,
          refactoring: true,
          syncEnabled: false,
        },
        connection: {
          status: 'connected',
          version: '0.42.1',
          lastSync: new Date(),
        },
      });
    }

    // Real Cursor Pro API connection
    try {
      const response = await fetch('https://api.cursor.com/v1/workspace/connect', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cursorApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workspace,
          features: [
            'ai-suggestions',
            'auto-complete',
            'code-review',
            'refactoring',
            'real-time-sync',
          ],
          webhook: `${process.env.NEXT_PUBLIC_BASE_URL}/api/code/cursor/webhook`,
        }),
      });

      if (!response.ok) {
        throw new Error(`Cursor API error: ${response.status}`);
      }

      const data = await response.json();

      return NextResponse.json({
        success: true,
        message: 'Cursor Pro connected successfully',
        workspace,
        sessionId: data.sessionId,
        features: data.enabledFeatures,
        connection: {
          status: 'connected',
          version: data.version,
          lastSync: new Date(),
        },
      });

    } catch (cursorError) {
      console.error('Cursor connection error:', cursorError);
      return NextResponse.json(
        { success: false, error: 'Failed to connect to Cursor Pro' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Cursor connect error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process connection request' },
      { status: 500 }
    );
  }
}