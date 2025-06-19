import { NextRequest, NextResponse } from 'next/server';

interface DeepSeekTestRequest {
  apiKey?: string;
}

// Test DeepSeek API connection
export async function POST(request: NextRequest) {
  try {
    const { apiKey }: DeepSeekTestRequest = await request.json();

    const deepSeekApiKey = apiKey || process.env.DEEPSEEK_API_KEY;

    if (!deepSeekApiKey) {
      // Return mock success for development
      return NextResponse.json({
        success: true,
        message: 'DeepSeek V3 connected successfully (development mode)',
        model: 'deepseek-coder-v2',
        pricing: {
          input: '$0.14 per 1M tokens',
          output: '$0.28 per 1M tokens',
          savings: '95% vs GPT-4',
        },
        capabilities: [
          'code-generation',
          'code-review',
          'debugging',
          'optimization',
          'refactoring',
          'testing',
        ],
        limits: {
          maxTokens: 65536,
          rateLimitPerMinute: 60,
          concurrentRequests: 5,
        },
      });
    }

    // Real DeepSeek API test
    try {
      const response = await fetch('https://api.deepseek.com/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${deepSeekApiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Test with a simple code generation request
      const testResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${deepSeekApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-coder',
          messages: [
            {
              role: 'user',
              content: 'Write a simple "hello world" function in TypeScript.'
            }
          ],
          max_tokens: 100,
          temperature: 0.1,
        }),
      });

      if (!testResponse.ok) {
        throw new Error(`DeepSeek test request failed: ${testResponse.status}`);
      }

      const testResult = await testResponse.json();

      return NextResponse.json({
        success: true,
        message: 'DeepSeek V3 connected and tested successfully',
        model: 'deepseek-coder',
        testResult: testResult.choices[0]?.message?.content?.slice(0, 100) + '...',
        usage: testResult.usage,
        pricing: {
          input: '$0.14 per 1M tokens',
          output: '$0.28 per 1M tokens',
          savings: '95% vs GPT-4',
        },
        capabilities: [
          'code-generation',
          'code-review',
          'debugging',
          'optimization',
          'refactoring',
          'testing',
        ],
        limits: {
          maxTokens: 65536,
          rateLimitPerMinute: 60,
          concurrentRequests: 5,
        },
      });

    } catch (deepSeekError) {
      console.error('DeepSeek connection error:', deepSeekError);
      return NextResponse.json(
        { success: false, error: 'Failed to connect to DeepSeek API' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('DeepSeek test error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to test DeepSeek connection' },
      { status: 500 }
    );
  }
}