import { NextRequest, NextResponse } from 'next/server';
import { enhancedAIRouter } from '@/lib/enhanced-ai-router';
import { googleAIManager } from '@/lib/google-ai-manager';
import { vertexAIManager } from '@/lib/vertex-ai-manager';
import { openRouterManager } from '@/lib/openrouter-manager';

// GET - Real-time usage tracking and monitoring
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const detailed = url.searchParams.get('detailed') === 'true';
    const timeframe = url.searchParams.get('timeframe') || 'current';

    // Get comprehensive usage data
    const googleStatus = googleAIManager.getAccountStatus();
    const vertexStatus = vertexAIManager.getCreditsStatus();
    const openRouterStats = openRouterManager.getUsageStats();
    const systemStatus = await enhancedAIRouter.getSystemStatus();
    const analytics = enhancedAIRouter.getRoutingAnalytics();

    const usageData = {
      summary: {
        totalRequests: analytics.totalRequests,
        successRate: analytics.successRate,
        averageCost: analytics.averageCost,
        totalCostToday: vertexStatus.dailySpend + openRouterStats.usage.daily,
        freeTokensUsed: googleStatus.reduce((sum, acc) => sum + acc.quotaUsed, 0),
        freeQuotaRemaining: googleStatus.reduce((sum, acc) => sum + (acc.quotaTotal - acc.quotaUsed), 0),
      },

      providers: {
        googleAI: {
          accounts: googleStatus,
          totalQuotaUsed: googleStatus.reduce((sum, acc) => sum + acc.quotaUsed, 0),
          totalQuotaAvailable: googleStatus.reduce((sum, acc) => sum + acc.quotaTotal, 0),
          efficiency: googleStatus.reduce((sum, acc) => sum + acc.quotaUsed, 0) / 
                     googleStatus.reduce((sum, acc) => sum + acc.quotaTotal, 0) * 100,
        },
        
        vertexAI: {
          ...vertexStatus,
          efficiency: (vertexStatus.usedCredits / vertexStatus.totalCredits) * 100,
          warnings: vertexAIManager.getCreditWarnings(),
        },
        
        openRouter: {
          ...openRouterStats,
          efficiency: (openRouterStats.usage.daily / openRouterStats.budgetLimits.daily) * 100,
        },
      },

      optimization: {
        freeVsPaidRatio: calculateFreeVsPaidRatio(analytics),
        costPerRequest: analytics.averageCost,
        tokensPerRequest: analytics.averageTokens,
        optimalRouting: calculateOptimalRoutingPercentage(analytics),
        suggestedActions: generateOptimizationSuggestions(systemStatus, vertexStatus, openRouterStats),
      },

      realtime: {
        activeProviders: Object.keys(analytics.providerUsage).length,
        activeVariants: Object.keys(analytics.variantUsage).length,
        systemHealth: systemStatus.overallHealth,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
    };

    if (detailed) {
      usageData.detailed = {
        providerBreakdown: analytics.providerUsage,
        variantBreakdown: analytics.variantUsage,
        hourlyUsage: generateHourlyUsage(),
        costBreakdown: generateCostBreakdown(vertexStatus, openRouterStats),
        quotaProjections: generateQuotaProjections(googleStatus, vertexStatus),
      };
    }

    return NextResponse.json(usageData);

  } catch (error) {
    console.error('Usage tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve usage data' },
      { status: 500 }
    );
  }
}

// POST - Update usage manually or trigger specific tracking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'reset_daily':
        openRouterManager.resetDailyUsage();
        return NextResponse.json({ message: 'Daily usage reset' });

      case 'emergency_brake':
        enhancedAIRouter.emergencyBrake();
        return NextResponse.json({ message: 'Emergency brake activated' });

      case 'health_check':
        const healthStatus = await openRouterManager.getHealthStatus();
        return NextResponse.json({ health: healthStatus });

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Usage management error:', error);
    return NextResponse.json(
      { error: 'Failed to manage usage' },
      { status: 500 }
    );
  }
}

// Helper functions
function calculateFreeVsPaidRatio(analytics: any): number {
  const freeProviders = ['Google AI Studio', 'Google Cloud'];
  const totalRequests = Object.values(analytics.providerUsage).reduce((sum: number, count: any) => sum + count, 0);
  const freeRequests = Object.entries(analytics.providerUsage)
    .filter(([provider]) => freeProviders.includes(provider))
    .reduce((sum, [, count]) => sum + (count as number), 0);
  
  return totalRequests > 0 ? (freeRequests / totalRequests) * 100 : 0;
}

function calculateOptimalRoutingPercentage(analytics: any): number {
  // Calculate percentage of requests that used optimal (cheapest available) models
  // This is a simplified calculation - in production, would track actual vs optimal costs
  return analytics.successRate * 0.9; // Assume 90% of successful requests were optimally routed
}

function generateOptimizationSuggestions(
  systemStatus: any,
  vertexStatus: any,
  openRouterStats: any
): string[] {
  const suggestions: string[] = [];

  // Credit usage suggestions
  if (vertexStatus.usagePercentage > 80) {
    suggestions.push('Vertex AI credits running low - consider using more free models');
  }

  // Quota optimization
  if (systemStatus.googleAI.totalQuotaRemaining < 50000) {
    suggestions.push('Google AI quota running low - optimize request frequency');
  }

  // Cost optimization
  if (openRouterStats.utilizationPercentage.daily > 70) {
    suggestions.push('OpenRouter daily budget usage high - switch to free alternatives');
  }

  // Health recommendations
  if (systemStatus.overallHealth === 'warning') {
    suggestions.push('System health degraded - consider reducing request complexity');
  }

  // Default suggestion
  if (suggestions.length === 0) {
    suggestions.push('System operating optimally - maintain current usage patterns');
  }

  return suggestions;
}

function generateHourlyUsage(): Array<{ hour: number; requests: number; cost: number }> {
  // Mock hourly usage data - in production, would come from database
  const hours = [];
  const currentHour = new Date().getHours();
  
  for (let i = 0; i < 24; i++) {
    hours.push({
      hour: i,
      requests: Math.max(0, Math.floor(Math.random() * 100) - (Math.abs(i - currentHour) * 2)),
      cost: Math.random() * 5,
    });
  }
  
  return hours;
}

function generateCostBreakdown(vertexStatus: any, openRouterStats: any) {
  return {
    vertex: {
      today: vertexStatus.dailySpend,
      month: vertexStatus.monthlySpend,
      percentage: (vertexStatus.dailySpend / (vertexStatus.dailySpend + openRouterStats.usage.daily)) * 100,
    },
    openRouter: {
      today: openRouterStats.usage.daily,
      month: openRouterStats.usage.monthly,
      percentage: (openRouterStats.usage.daily / (vertexStatus.dailySpend + openRouterStats.usage.daily)) * 100,
    },
    total: {
      today: vertexStatus.dailySpend + openRouterStats.usage.daily,
      month: vertexStatus.monthlySpend + openRouterStats.usage.monthly,
    },
  };
}

function generateQuotaProjections(googleStatus: any[], vertexStatus: any) {
  const totalUsed = googleStatus.reduce((sum, acc) => sum + acc.quotaUsed, 0);
  const totalAvailable = googleStatus.reduce((sum, acc) => sum + acc.quotaTotal, 0);
  const currentHour = new Date().getHours();
  
  // Simple projection based on current usage rate
  const hourlyRate = totalUsed / Math.max(currentHour, 1);
  const projectedDailyUsage = hourlyRate * 24;
  
  return {
    google: {
      projectedDailyUsage: Math.min(projectedDailyUsage, totalAvailable),
      daysUntilExhaustion: hourlyRate > 0 ? (totalAvailable - totalUsed) / (hourlyRate * 24) : Infinity,
      recommendedPacing: totalAvailable / 24, // Tokens per hour for even distribution
    },
    vertex: {
      projectedDailySpend: vertexStatus.dailySpend * (24 / Math.max(currentHour, 1)),
      daysUntilExhaustion: vertexStatus.estimatedDaysRemaining,
      recommendedDailyLimit: vertexStatus.remainingCredits / 30, // Spread over 30 days
    },
  };
}