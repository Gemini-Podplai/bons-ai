import { NextRequest, NextResponse } from 'next/server';
import { enhancedAIRouter } from '@/lib/enhanced-ai-router';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      message, 
      complexity = 'medium', 
      studio, 
      variant,
      userPreference,
      context,
      urgency = 'medium',
      collaborationMode = false,
      streaming = false
    } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Handle streaming requests
    if (streaming) {
      return handleStreamingRequest(message, complexity, studio, variant, context, urgency);
    }

    // Prepare enhanced request
    const enhancedRequest = {
      prompt: message,
      complexity,
      studio,
      variant,
      userPreference,
      context,
      urgency,
      collaborationMode,
    };

    // Route through enhanced AI router
    let routingResult;
    
    if (collaborationMode) {
      routingResult = await enhancedAIRouter.routeCollaboration(enhancedRequest);
    } else {
      routingResult = await enhancedAIRouter.route(enhancedRequest);
    }

    // Return comprehensive response
    return NextResponse.json({
      response: routingResult.response,
      model: {
        name: routingResult.model,
        provider: routingResult.provider,
        variant: routingResult.variant,
      },
      usage: {
        tokensUsed: routingResult.tokensUsed,
        estimatedCost: routingResult.cost,
        quotaRemaining: routingResult.quotaRemaining,
      },
      reasoning: routingResult.reasoning,
      collaboration: {
        suggestions: routingResult.collaborationSuggestions || [],
        nextSteps: routingResult.nextSteps || [],
      },
      fallbacks: routingResult.fallbacksUsed || [],
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Enhanced chat API error:', error);
    
    // Provide helpful error response
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json({
      response: `I apologize, but I encountered an error: ${errorMessage}. Please try again or contact support if the issue persists.`,
      model: {
        name: 'error-handler',
        provider: 'Bons-AI System',
        variant: 'Error Response',
      },
      usage: {
        tokensUsed: 0,
        estimatedCost: 0,
        quotaRemaining: 0,
      },
      reasoning: 'Error occurred during request processing',
      error: true,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

// Handle streaming responses
async function handleStreamingRequest(
  message: string,
  complexity: string,
  studio?: string,
  variant?: string,
  context?: string,
  urgency?: string
) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const enhancedRequest = {
          prompt: message,
          complexity,
          studio,
          variant,
          context,
          urgency,
          requiresStreaming: true,
        };

        let finalResult;
        
        for await (const chunk of enhancedAIRouter.streamRoute(enhancedRequest)) {
          if (typeof chunk === 'string') {
            // Stream text chunks
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'chunk', data: chunk })}\n\n`));
          } else {
            // Final result
            finalResult = chunk;
          }
        }

        // Send final metadata
        if (finalResult) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            type: 'complete', 
            data: {
              model: finalResult.model,
              provider: finalResult.provider,
              tokensUsed: finalResult.tokensUsed,
              cost: finalResult.cost,
              reasoning: finalResult.reasoning,
            }
          })}\n\n`));
        }

        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
        
      } catch (error) {
        console.error('Streaming error:', error);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
          type: 'error', 
          data: { message: 'Streaming failed' }
        })}\n\n`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

// GET endpoint for comprehensive system status
export async function GET() {
  try {
    const systemStatus = await enhancedAIRouter.getSystemStatus();
    const analytics = enhancedAIRouter.getRoutingAnalytics();

    return NextResponse.json({
      status: systemStatus,
      analytics,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  } catch (error) {
    console.error('Status API error:', error);
    return NextResponse.json(
      { error: 'Failed to get system status' },
      { status: 500 }
    );
  }
}