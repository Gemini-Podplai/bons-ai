import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const mem0ApiKey = import.meta.env.MEM0_API_KEY;
    
    if (!mem0ApiKey) {
      return new Response(JSON.stringify({ 
        error: 'Mem0 API key not configured' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Test Mem0 API connection
    const response = await fetch('https://api.mem0.ai/v1/memories', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${mem0ApiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Mem0 API returned ${response.status}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify({
      status: 'connected',
      memoriesCount: data.memories?.length || 0,
      usage: {
        current: data.usage?.current || 0,
        limit: data.usage?.limit || 1000000
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Mem0 connection failed'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};