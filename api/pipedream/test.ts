import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const pipedreamToken = import.meta.env.PIPEDREAM_API_KEY;
    
    if (!pipedreamToken) {
      return new Response(JSON.stringify({ 
        error: 'Pipedream API key not configured' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Test Pipedream API connection
    const response = await fetch('https://api.pipedream.com/v1/users/me', {
      headers: {
        'Authorization': `Bearer ${pipedreamToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Pipedream API returned ${response.status}`);
    }

    const userData = await response.json();

    return new Response(JSON.stringify({
      status: 'connected',
      user: userData.username,
      plan: userData.plan,
      workflows: userData.workflow_count || 0
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Pipedream connection failed'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};