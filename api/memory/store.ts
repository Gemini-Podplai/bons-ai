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
    const { id, content, metadata } = body;

    if (!id || !content) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: id and content' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Store memory in Mem0
    const response = await fetch('https://api.mem0.ai/v1/memories', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mem0ApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: content
          }
        ],
        user_id: 'bons-ai-system',
        metadata: {
          id,
          type: 'system_knowledge',
          timestamp: new Date().toISOString(),
          ...metadata
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Mem0 API returned ${response.status}: ${errorData}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify({
      success: true,
      memoryId: data.id,
      message: 'Memory stored successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Failed to store memory'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};