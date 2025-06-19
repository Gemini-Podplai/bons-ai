import { NextResponse } from 'next/server';
import { enhancedAIRouter } from '@/lib/enhanced-ai-router';
import { googleAIManager } from '@/lib/google-ai-manager';
import { vertexAIManager } from '@/lib/vertex-ai-manager';
import { openRouterManager } from '@/lib/openrouter-manager';

export async function POST() {
  try {
    // Comprehensive emergency brake activation
    enhancedAIRouter.emergencyBrake();
    
    // Get status after emergency brake
    const systemStatus = await enhancedAIRouter.getSystemStatus();
    
    return NextResponse.json({
      success: true,
      message: 'Emergency brake activated. All paid AI services have been disabled.',
      details: {
        googleAI: 'Free models still available',
        vertexAI: 'Disabled - no further charges',
        openRouter: 'Limited to free models only',
        systemHealth: systemStatus.overallHealth,
      },
      nextSteps: [
        'Only free AI models are now available',
        'Check usage dashboard for cost analysis',
        'Contact support if emergency brake was triggered in error',
        'Review budget settings and quotas',
      ],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Emergency brake error:', error);
    return NextResponse.json(
      { error: 'Failed to activate emergency brake' },
      { status: 500 }
    );
  }
}

// GET endpoint to check emergency brake status
export async function GET() {
  try {
    const systemStatus = await enhancedAIRouter.getSystemStatus();
    
    const isEmergencyActive = 
      !systemStatus.vertexAI.isAvailable || 
      systemStatus.overallHealth === 'critical';
    
    return NextResponse.json({
      emergencyBrakeActive: isEmergencyActive,
      systemHealth: systemStatus.overallHealth,
      availableServices: {
        googleAIFree: systemStatus.googleAI.totalQuotaRemaining > 0,
        vertexAI: systemStatus.vertexAI.isAvailable,
        openRouterFree: systemStatus.openRouter.isAvailable,
      },
      recommendations: isEmergencyActive ? [
        'Emergency mode active - only free services available',
        'Review cost monitoring dashboard',
        'Adjust budget limits if needed',
      ] : [
        'All systems operating normally',
        'Monitor usage to prevent emergency activation',
      ],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Emergency brake status error:', error);
    return NextResponse.json(
      { error: 'Failed to get emergency brake status' },
      { status: 500 }
    );
  }
}