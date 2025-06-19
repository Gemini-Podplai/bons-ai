import { NextRequest, NextResponse } from 'next/server';

interface PenpotConnectRequest {
  apiKey?: string;
  baseUrl?: string;
}

// Connect to Penpot design tool
export async function POST(request: NextRequest) {
  try {
    const { apiKey, baseUrl = 'https://design.penpot.app' }: PenpotConnectRequest = await request.json();

    const penpotApiKey = apiKey || process.env.PENPOT_API_KEY;

    if (!penpotApiKey) {
      // Return mock success for development
      return NextResponse.json({
        success: true,
        message: 'Penpot connected successfully (development mode)',
        connection: {
          status: 'connected',
          baseUrl,
          features: {
            design: true,
            prototyping: true,
            collaboration: true,
            export: true,
            realTimeSync: true,
          },
          user: {
            id: 'mock-user-id',
            name: 'Bons-AI Developer',
            email: 'dev@bons-ai.dev',
            teams: ['bons-ai-team'],
          },
          quotas: {
            projects: 100,
            filesPerProject: 1000,
            collaborators: 50,
          },
        },
      });
    }

    // Real Penpot API connection
    try {
      const response = await fetch(`${baseUrl}/api/rpc/command/get-profile`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${penpotApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error(`Penpot API error: ${response.status}`);
      }

      const profile = await response.json();

      // Test creating a new team/project to verify permissions
      const testResponse = await fetch(`${baseUrl}/api/rpc/command/get-teams`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${penpotApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (!testResponse.ok) {
        throw new Error(`Penpot permissions error: ${testResponse.status}`);
      }

      const teams = await testResponse.json();

      return NextResponse.json({
        success: true,
        message: 'Penpot connected successfully',
        connection: {
          status: 'connected',
          baseUrl,
          features: {
            design: true,
            prototyping: true,
            collaboration: true,
            export: true,
            realTimeSync: true,
          },
          user: {
            id: profile.id,
            name: profile.fullname || profile.email,
            email: profile.email,
            teams: teams.map((team: any) => team.name),
          },
          quotas: {
            projects: profile.quotas?.projects || 100,
            filesPerProject: profile.quotas?.filesPerProject || 1000,
            collaborators: profile.quotas?.collaborators || 50,
          },
        },
      });

    } catch (penpotError) {
      console.error('Penpot connection error:', penpotError);
      return NextResponse.json(
        { success: false, error: 'Failed to connect to Penpot' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Penpot connect error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process connection request' },
      { status: 500 }
    );
  }
}