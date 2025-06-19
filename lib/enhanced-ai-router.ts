/**
 * Enhanced Smart AI Router System
 * Orchestrates Google AI Studio, Vertex AI Express, OpenRouter, and AI Variants
 */

import { googleAIManager } from './google-ai-manager';
import { vertexAIManager } from './vertex-ai-manager';
import { openRouterManager } from './openrouter-manager';
import { aiVariantsManager } from './ai-variants-manager';

export interface EnhancedRouterRequest {
  prompt: string;
  complexity: 'simple' | 'medium' | 'complex';
  studio?: string;
  variant?: string;
  userPreference?: string;
  maxTokens?: number;
  requiresStreaming?: boolean;
  context?: string;
  urgency?: 'low' | 'medium' | 'high';
  collaborationMode?: boolean;
}

export interface EnhancedRouterResponse {
  response: string;
  variant: string;
  model: string;
  provider: string;
  reasoning: string;
  tokensUsed: number;
  cost: number;
  quotaRemaining: number;
  collaborationSuggestions?: string[];
  nextSteps?: string[];
  fallbacksUsed?: string[];
}

export interface SystemStatus {
  googleAI: {
    accounts: Array<{
      name: string;
      quotaUsed: number;
      quotaTotal: number;
      isAvailable: boolean;
    }>;
    totalQuotaRemaining: number;
  };
  vertexAI: {
    creditsRemaining: number;
    dailySpend: number;
    isAvailable: boolean;
  };
  openRouter: {
    dailyBudgetUsed: number;
    dailyBudgetTotal: number;
    isAvailable: boolean;
  };
  variants: Array<{
    id: string;
    name: string;
    isAvailable: boolean;
  }>;
  overallHealth: 'excellent' | 'good' | 'warning' | 'critical';
}

class EnhancedAIRouter {
  private routingHistory: Array<{
    timestamp: Date;
    request: EnhancedRouterRequest;
    response: EnhancedRouterResponse;
    success: boolean;
  }> = [];

  private fallbackChain = [
    'google-ai-free',
    'google-ai-pro',
    'vertex-ai-express', 
    'openrouter-free',
    'openrouter-paid',
  ];

  /**
   * Main routing function with comprehensive fallback system
   */
  async route(request: EnhancedRouterRequest): Promise<EnhancedRouterResponse> {
    const startTime = Date.now();
    const fallbacksUsed: string[] = [];

    try {
      // Step 1: Determine optimal variant
      const variant = request.variant || aiVariantsManager.determineOptimalVariant(request.prompt, request.context);
      
      // Step 2: Try primary routing
      try {
        const primaryResult = await this.routePrimary(request, variant);
        this.logSuccessfulRoute(request, primaryResult);
        return primaryResult;
      } catch (primaryError) {
        console.log('Primary routing failed, trying fallbacks:', primaryError);
        fallbacksUsed.push('primary-failed');
      }

      // Step 3: Try fallback chain
      for (const fallbackProvider of this.fallbackChain) {
        try {
          const fallbackResult = await this.routeWithFallback(request, variant, fallbackProvider);
          fallbackResult.fallbacksUsed = fallbacksUsed;
          this.logSuccessfulRoute(request, fallbackResult);
          return fallbackResult;
        } catch (fallbackError) {
          console.log(`Fallback ${fallbackProvider} failed:`, fallbackError);
          fallbacksUsed.push(fallbackProvider);
        }
      }

      // Step 4: Emergency response
      return this.generateEmergencyResponse(request, fallbacksUsed);

    } catch (error) {
      console.error('Complete routing failure:', error);
      return this.generateEmergencyResponse(request, fallbacksUsed);
    }
  }

  /**
   * Primary routing logic with intelligent model selection
   */
  private async routePrimary(request: EnhancedRouterRequest, variant: string): Promise<EnhancedRouterResponse> {
    // Layer 1: Free unlimited models for simple tasks
    if (request.complexity === 'simple' && !request.requiresStreaming) {
      try {
        const result = await googleAIManager.callGeminiFlashLite(request.prompt);
        return this.formatResponse({
          response: result.response,
          variant: 'Gemini 2.0 Flash Lite',
          model: 'gemini-2.0-flash-exp',
          provider: 'Google AI Studio',
          tokensUsed: result.tokensUsed,
          cost: 0,
          quotaRemaining: 999999,
          reasoning: 'Used free unlimited model for simple task',
        });
      } catch (error) {
        throw new Error(`Free model failed: ${error}`);
      }
    }

    // Layer 2: Google AI Studio Pro accounts with quota rotation
    if (request.complexity === 'medium' || request.complexity === 'complex') {
      const quotaRemaining = googleAIManager.getTotalAvailableQuota();
      if (quotaRemaining > 1000) {
        try {
          const result = await googleAIManager.callGeminiPro(request.prompt, {
            systemInstruction: this.getSystemInstructionForVariant(variant),
            temperature: this.getTemperatureForComplexity(request.complexity),
          });
          return this.formatResponse({
            response: result.response,
            variant: result.accountUsed,
            model: 'gemini-2.5-pro',
            provider: 'Google AI Studio',
            tokensUsed: result.tokensUsed,
            cost: 0,
            quotaRemaining,
            reasoning: `Used Google AI Studio Pro account with ${quotaRemaining} tokens remaining`,
          });
        } catch (error) {
          throw new Error(`Google AI Studio Pro failed: ${error}`);
        }
      }
    }

    // Layer 3: Vertex AI Express for complex tasks with credits
    if (request.complexity === 'complex' || request.urgency === 'high') {
      const creditsStatus = vertexAIManager.getCreditsStatus();
      if (creditsStatus.remainingCredits > 1) {
        try {
          const result = await vertexAIManager.callExpressMode(request.prompt, request.complexity);
          return this.formatResponse({
            response: result.response,
            variant: 'Vertex AI Express',
            model: result.model,
            provider: 'Google Cloud',
            tokensUsed: result.tokensUsed,
            cost: result.cost,
            quotaRemaining: creditsStatus.remainingCredits,
            reasoning: `Used Vertex AI Express for complex task, £${creditsStatus.remainingCredits.toFixed(2)} credits remaining`,
          });
        } catch (error) {
          throw new Error(`Vertex AI Express failed: ${error}`);
        }
      }
    }

    throw new Error('No primary routing options available');
  }

  /**
   * Fallback routing with specific providers
   */
  private async routeWithFallback(
    request: EnhancedRouterRequest, 
    variant: string, 
    provider: string
  ): Promise<EnhancedRouterResponse> {
    switch (provider) {
      case 'google-ai-free':
        const flashResult = await googleAIManager.callGeminiFlash8B(request.prompt);
        return this.formatResponse({
          response: flashResult.response,
          variant: 'Gemini 1.5 Flash 8B',
          model: 'gemini-1.5-flash-8b',
          provider: 'Google AI Studio',
          tokensUsed: flashResult.tokensUsed,
          cost: 0,
          quotaRemaining: 999999,
          reasoning: 'Fallback to free Flash 8B model',
        });

      case 'openrouter-free':
        const freeModel = await openRouterManager.getCheapestModel('simple');
        const freeResult = await openRouterManager.callOpenRouter({
          prompt: request.prompt,
          model: freeModel,
          temperature: 0.7,
        });
        return this.formatResponse({
          response: freeResult.response,
          variant: 'OpenRouter Free',
          model: freeResult.model,
          provider: 'OpenRouter',
          tokensUsed: freeResult.tokensUsed,
          cost: freeResult.cost,
          quotaRemaining: 0,
          reasoning: 'Fallback to OpenRouter free model',
        });

      case 'openrouter-paid':
        const paidModel = await openRouterManager.getCheapestModel(request.complexity);
        const paidResult = await openRouterManager.callOpenRouter({
          prompt: request.prompt,
          model: paidModel,
          temperature: this.getTemperatureForComplexity(request.complexity),
        });
        return this.formatResponse({
          response: paidResult.response,
          variant: 'OpenRouter Paid',
          model: paidResult.model,
          provider: 'OpenRouter',
          tokensUsed: paidResult.tokensUsed,
          cost: paidResult.cost,
          quotaRemaining: 0,
          reasoning: 'Fallback to OpenRouter paid model',
        });

      default:
        throw new Error(`Unknown fallback provider: ${provider}`);
    }
  }

  /**
   * Generate emergency response when all systems fail
   */
  private generateEmergencyResponse(
    request: EnhancedRouterRequest, 
    fallbacksUsed: string[]
  ): EnhancedRouterResponse {
    return {
      response: `I apologize, but I'm experiencing technical difficulties with all AI services. The request "${request.prompt}" couldn't be processed. Please try again in a few minutes or contact support if the issue persists.`,
      variant: 'Emergency Response',
      model: 'system-fallback',
      provider: 'Bons-AI System',
      reasoning: `All services failed. Attempted: ${fallbacksUsed.join(', ')}`,
      tokensUsed: 0,
      cost: 0,
      quotaRemaining: 0,
      fallbacksUsed,
    };
  }

  /**
   * Stream response for real-time applications
   */
  async *streamRoute(request: EnhancedRouterRequest): AsyncGenerator<string, EnhancedRouterResponse, unknown> {
    try {
      // Try OpenRouter streaming first
      const model = await openRouterManager.getCheapestModel(request.complexity);
      let totalResponse = '';
      let tokensUsed = 0;

      for await (const chunk of openRouterManager.streamOpenRouter({
        prompt: request.prompt,
        model,
        temperature: this.getTemperatureForComplexity(request.complexity),
      })) {
        totalResponse += chunk;
        tokensUsed += 1; // Rough estimate
        yield chunk;
      }

      return this.formatResponse({
        response: totalResponse,
        variant: 'OpenRouter Streaming',
        model,
        provider: 'OpenRouter',
        tokensUsed,
        cost: 0.001 * tokensUsed,
        quotaRemaining: 0,
        reasoning: 'Streaming response via OpenRouter',
      });

    } catch (error) {
      console.error('Streaming failed:', error);
      
      // Fallback to regular routing
      const result = await this.route(request);
      yield result.response;
      return result;
    }
  }

  /**
   * Collaboration mode - involves multiple variants
   */
  async routeCollaboration(request: EnhancedRouterRequest): Promise<EnhancedRouterResponse> {
    // Determine which variants should collaborate
    const involvedVariants = this.determineCollaboratingVariants(request);
    
    try {
      const collaborationResult = await aiVariantsManager.orchestrateCollaboration(
        {
          prompt: request.prompt,
          context: request.context,
          requiresReasoning: request.complexity === 'complex',
          urgency: request.urgency,
        },
        involvedVariants
      );

      return {
        response: collaborationResult.response,
        variant: `Collaboration: ${involvedVariants.join(', ')}`,
        model: collaborationResult.model,
        provider: 'AI Variants',
        reasoning: `Collaborated between ${involvedVariants.length} specialists`,
        tokensUsed: collaborationResult.tokensUsed,
        cost: collaborationResult.cost,
        quotaRemaining: 0,
        collaborationSuggestions: collaborationResult.collaborationNeeded,
        nextSteps: collaborationResult.suggestedNextSteps,
      };
    } catch (error) {
      console.error('Collaboration failed:', error);
      // Fallback to single variant
      return this.route({ ...request, collaborationMode: false });
    }
  }

  /**
   * Get comprehensive system status
   */
  async getSystemStatus(): Promise<SystemStatus> {
    const googleStatus = googleAIManager.getAccountStatus();
    const vertexStatus = vertexAIManager.getCreditsStatus();
    const openRouterStatus = openRouterManager.getUsageStats();
    const variantStatus = aiVariantsManager.getVariantStatus();

    const totalQuotaRemaining = googleStatus.reduce((sum, acc) => 
      sum + (acc.quotaTotal - acc.quotaUsed), 0
    );

    // Determine overall health
    let overallHealth: 'excellent' | 'good' | 'warning' | 'critical' = 'excellent';
    
    if (vertexStatus.remainingCredits < 50 && totalQuotaRemaining < 50000) {
      overallHealth = 'critical';
    } else if (vertexStatus.remainingCredits < 100 || totalQuotaRemaining < 100000) {
      overallHealth = 'warning';
    } else if (vertexStatus.remainingCredits < 200 || totalQuotaRemaining < 200000) {
      overallHealth = 'good';
    }

    return {
      googleAI: {
        accounts: googleStatus.map(acc => ({
          name: acc.name,
          quotaUsed: acc.quotaUsed,
          quotaTotal: acc.quotaTotal,
          isAvailable: acc.isActive && !acc.isRateLimited,
        })),
        totalQuotaRemaining,
      },
      vertexAI: {
        creditsRemaining: vertexStatus.remainingCredits,
        dailySpend: vertexStatus.dailySpend,
        isAvailable: vertexStatus.remainingCredits > 0,
      },
      openRouter: {
        dailyBudgetUsed: openRouterStatus.usage.daily,
        dailyBudgetTotal: openRouterStatus.budgetLimits.daily,
        isAvailable: openRouterStatus.remainingBudget.daily > 0,
      },
      variants: variantStatus,
      overallHealth,
    };
  }

  /**
   * Emergency brake - disable all paid services
   */
  emergencyBrake(): void {
    googleAIManager.emergencyDisable();
    vertexAIManager.emergencyStop();
    openRouterManager.emergencyBrake();
    
    console.log('🚨 EMERGENCY BRAKE ACTIVATED - All paid AI services disabled');
  }

  /**
   * Helper methods
   */
  private formatResponse(data: Partial<EnhancedRouterResponse>): EnhancedRouterResponse {
    return {
      response: data.response || '',
      variant: data.variant || 'Unknown',
      model: data.model || 'unknown',
      provider: data.provider || 'unknown',
      reasoning: data.reasoning || '',
      tokensUsed: data.tokensUsed || 0,
      cost: data.cost || 0,
      quotaRemaining: data.quotaRemaining || 0,
      ...data,
    };
  }

  private getSystemInstructionForVariant(variant: string): string {
    const instructions = {
      research: 'You are a research specialist. Focus on accuracy, cite sources, and provide comprehensive analysis.',
      code: 'You are a code specialist. Write clean, efficient code with proper error handling and documentation.',
      design: 'You are a UX designer. Focus on user experience, accessibility, and design best practices.',
      debug: 'You are a debugging specialist. Systematically analyze problems and provide step-by-step solutions.',
    };
    
    return instructions[variant as keyof typeof instructions] || 
           'You are a helpful AI assistant focused on providing accurate and useful responses.';
  }

  private getTemperatureForComplexity(complexity: string): number {
    switch (complexity) {
      case 'simple': return 0.3;
      case 'medium': return 0.7;
      case 'complex': return 0.9;
      default: return 0.7;
    }
  }

  private determineCollaboratingVariants(request: EnhancedRouterRequest): string[] {
    const prompt = request.prompt.toLowerCase();
    const variants: string[] = [];

    // Always include prime as conductor
    variants.push('prime');

    // Add specialists based on content
    if (prompt.includes('research') || prompt.includes('find')) variants.push('research');
    if (prompt.includes('code') || prompt.includes('develop')) variants.push('code');
    if (prompt.includes('design') || prompt.includes('ui')) variants.push('design');
    if (prompt.includes('test') || prompt.includes('qa')) variants.push('test');
    if (prompt.includes('deploy') || prompt.includes('devops')) variants.push('deploy');
    if (prompt.includes('debug') || prompt.includes('error')) variants.push('debug');

    // For complex requests, add documentation
    if (request.complexity === 'complex') variants.push('document');

    return [...new Set(variants)]; // Remove duplicates
  }

  private logSuccessfulRoute(request: EnhancedRouterRequest, response: EnhancedRouterResponse): void {
    this.routingHistory.push({
      timestamp: new Date(),
      request,
      response,
      success: true,
    });

    // Keep only last 100 entries
    if (this.routingHistory.length > 100) {
      this.routingHistory = this.routingHistory.slice(-100);
    }
  }

  /**
   * Get routing analytics
   */
  getRoutingAnalytics() {
    const recent = this.routingHistory.slice(-50);
    
    return {
      totalRequests: this.routingHistory.length,
      successRate: this.routingHistory.filter(h => h.success).length / this.routingHistory.length,
      averageCost: recent.reduce((sum, h) => sum + h.response.cost, 0) / recent.length,
      averageTokens: recent.reduce((sum, h) => sum + h.response.tokensUsed, 0) / recent.length,
      providerUsage: this.getProviderUsageStats(recent),
      variantUsage: this.getVariantUsageStats(recent),
    };
  }

  private getProviderUsageStats(history: typeof this.routingHistory) {
    const usage: Record<string, number> = {};
    history.forEach(h => {
      usage[h.response.provider] = (usage[h.response.provider] || 0) + 1;
    });
    return usage;
  }

  private getVariantUsageStats(history: typeof this.routingHistory) {
    const usage: Record<string, number> = {};
    history.forEach(h => {
      usage[h.response.variant] = (usage[h.response.variant] || 0) + 1;
    });
    return usage;
  }
}

export const enhancedAIRouter = new EnhancedAIRouter();