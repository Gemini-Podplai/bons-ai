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

    const body = await request.json();
    const { query, filters, limit = 10 } = body;

    if (!query) {
      return new Response(JSON.stringify({ 
        error: 'Missing required field: query' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Search memories in Mem0
    const searchParams = new URLSearchParams({
      user_id: 'bons-ai-system',
      limit: limit.toString()
    });

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          searchParams.append(`metadata.${key}`, value as string);
        }
      });
    }

    const response = await fetch(`https://api.mem0.ai/v1/memories/search?${searchParams}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mem0ApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query,
        user_id: 'bons-ai-system'
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Mem0 API returned ${response.status}: ${errorData}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify({
      results: data.results || [],
      total: data.total || 0,
      query
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Failed to search memories'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};