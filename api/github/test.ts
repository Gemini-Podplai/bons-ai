import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const githubToken = import.meta.env.GITHUB_TOKEN;
    
    if (!githubToken) {
      return new Response(JSON.stringify({ 
        error: 'GitHub token not configured' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Test GitHub API connection
    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Bons-Ai/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API returned ${response.status}`);
    }

    const userData = await response.json();

    return new Response(JSON.stringify({
      status: 'connected',
      user: userData.login,
      rateLimit: {
        remaining: response.headers.get('X-RateLimit-Remaining'),
        limit: response.headers.get('X-RateLimit-Limit'),
        reset: new Date(parseInt(response.headers.get('X-RateLimit-Reset') || '0') * 1000)
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'GitHub connection failed'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};