/**
 * Smart AI Router System
 * Handles intelligent model selection, quota tracking, and cost optimization
 */

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  endpoint: string;
  apiKey?: string;
  tier: 'free' | 'paid';
  costPerToken: number;
  dailyQuota: number;
  usedToday: number;
  lastReset: Date;
  capabilities: string[];
  maxTokens: number;
  isAvailable: boolean;
}

export interface RouterRequest {
  prompt: string;
  complexity: 'simple' | 'medium' | 'complex';
  studio?: string;
  userPreference?: string;
  maxTokens?: number;
  requiresStreaming?: boolean;
}

export interface RouterResponse {
  selectedModel: AIModel;
  estimatedCost: number;
  quotaRemaining: number;
  reasoning: string;
}

class SmartAIRouter {
  private models: AIModel[] = [
    {
      id: 'gemini-2.0-flash-lite',
      name: 'Gemini 2.0 Flash Lite',
      provider: 'Google AI Studio',
      endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent',
      tier: 'free',
      costPerToken: 0,
      dailyQuota: 999999, // Unlimited free tier
      usedToday: 0,
      lastReset: new Date(),
      capabilities: ['text', 'simple-reasoning', 'fast-response'],
      maxTokens: 8192,
      isAvailable: true,
    },
    {
      id: 'gemini-1.5-flash-8b',
      name: 'Gemini 1.5 Flash 8B',
      provider: 'Google AI Studio',
      endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-8b:generateContent',
      tier: 'free',
      costPerToken: 0,
      dailyQuota: 999999, // Unlimited free tier
      usedToday: 0,
      lastReset: new Date(),
      capabilities: ['text', 'reasoning', 'code', 'fast-response'],
      maxTokens: 8192,
      isAvailable: true,
    },
    {
      id: 'gemini-2.5-pro-account-1',
      name: 'Gemini 2.5 Pro (Account 1)',
      provider: 'Google AI Studio 1',
      endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-thinking-exp:generateContent',
      tier: 'free',
      costPerToken: 0,
      dailyQuota: 300000,
      usedToday: 45000,
      lastReset: new Date(),
      capabilities: ['text', 'reasoning', 'code', 'analysis', 'thinking'],
      maxTokens: 32768,
      isAvailable: true,
    },
    {
      id: 'gemini-2.5-pro-account-2',
      name: 'Gemini 2.5 Pro (Account 2)',
      provider: 'Google AI Studio 2',
      endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-thinking-exp:generateContent',
      tier: 'free',
      costPerToken: 0,
      dailyQuota: 300000,
      usedToday: 23000,
      lastReset: new Date(),
      capabilities: ['text', 'reasoning', 'code', 'analysis', 'thinking'],
      maxTokens: 32768,
      isAvailable: true,
    },
    {
      id: 'vertex-express-gemini',
      name: 'Vertex AI Express (Gemini Pro)',
      provider: 'Google Cloud',
      endpoint: 'https://us-central1-aiplatform.googleapis.com/v1/projects/YOUR_PROJECT/locations/us-central1/publishers/google/models/gemini-pro:generateContent',
      tier: 'paid',
      costPerToken: 0.0005,
      dailyQuota: 1000000,
      usedToday: 0,
      lastReset: new Date(),
      capabilities: ['text', 'reasoning', 'code', 'analysis', 'multimodal'],
      maxTokens: 32768,
      isAvailable: true,
    },
    {
      id: 'deepseek-v3',
      name: 'DeepSeek V3',
      provider: 'DeepSeek',
      endpoint: 'https://api.deepseek.com/v1/chat/completions',
      tier: 'paid',
      costPerToken: 0.00003, // 95% cheaper than GPT-4
      dailyQuota: 2000000,
      usedToday: 0,
      lastReset: new Date(),
      capabilities: ['text', 'reasoning', 'code', 'math', 'heavy-computation'],
      maxTokens: 65536,
      isAvailable: true,
    },
    {
      id: 'openrouter-cheapest',
      name: 'OpenRouter (Dynamic)',
      provider: 'OpenRouter',
      endpoint: 'https://openrouter.ai/api/v1/chat/completions',
      tier: 'paid',
      costPerToken: 0.0001, // Dynamic pricing
      dailyQuota: 5000000,
      usedToday: 0,
      lastReset: new Date(),
      capabilities: ['text', 'reasoning', 'code', 'fallback'],
      maxTokens: 128000,
      isAvailable: true,
    }
  ];

  private costBudget = {
    daily: 50, // £50/day budget
    monthly: 500, // £500/month budget
    usedToday: 0.23,
    usedThisMonth: 12.50,
  };

  /**
   * Route a request to the optimal AI model
   */
  async route(request: RouterRequest): Promise<RouterResponse> {
    // Reset daily quotas if needed
    this.resetDailyQuotas();

    // Get available models based on request
    const availableModels = this.getAvailableModels(request);
    
    if (availableModels.length === 0) {
      throw new Error('No available models for this request');
    }

    // Select best model using routing logic
    const selectedModel = this.selectOptimalModel(availableModels, request);
    
    // Calculate estimated cost and quota
    const estimatedTokens = this.estimateTokens(request.prompt);
    const estimatedCost = selectedModel.costPerToken * estimatedTokens;
    const quotaRemaining = selectedModel.dailyQuota - selectedModel.usedToday;

    return {
      selectedModel,
      estimatedCost,
      quotaRemaining,
      reasoning: this.generateReasoning(selectedModel, request),
    };
  }

  /**
   * Get models available for the request
   */
  private getAvailableModels(request: RouterRequest): AIModel[] {
    return this.models.filter(model => {
      // Check if model is available
      if (!model.isAvailable) return false;

      // Check quota availability
      const estimatedTokens = this.estimateTokens(request.prompt);
      if (model.usedToday + estimatedTokens > model.dailyQuota) return false;

      // Check budget constraints
      const estimatedCost = model.costPerToken * estimatedTokens;
      if (this.costBudget.usedToday + estimatedCost > this.costBudget.daily) {
        // Only allow free models if budget exceeded
        return model.tier === 'free';
      }

      // Check capabilities match
      const requiredCapabilities = this.getRequiredCapabilities(request);
      const hasCapabilities = requiredCapabilities.every(cap => 
        model.capabilities.includes(cap)
      );
      if (!hasCapabilities) return false;

      return true;
    });
  }

  /**
   * Select the optimal model based on routing logic
   */
  private selectOptimalModel(availableModels: AIModel[], request: RouterRequest): AIModel {
    // Layer 1: Free unlimited models for simple tasks
    if (request.complexity === 'simple') {
      const unlimitedFree = availableModels.filter(m => 
        m.tier === 'free' && m.dailyQuota > 500000
      );
      if (unlimitedFree.length > 0) {
        return unlimitedFree[0]; // Gemini 2.0 Flash Lite or 1.5 Flash 8B
      }
    }

    // Layer 2: Free tier rotation for medium complexity
    if (request.complexity === 'medium') {
      const freeTierModels = availableModels.filter(m => 
        m.tier === 'free' && m.id.includes('gemini-2.5-pro')
      );
      
      // Select account with most quota remaining
      if (freeTierModels.length > 0) {
        return freeTierModels.sort((a, b) => 
          (b.dailyQuota - b.usedToday) - (a.dailyQuota - a.usedToday)
        )[0];
      }
    }

    // Layer 3: Vertex Express for complex tasks if credits available
    if (request.complexity === 'complex') {
      const vertexModel = availableModels.find(m => m.id === 'vertex-express-gemini');
      if (vertexModel && this.hasVertexCredits()) {
        return vertexModel;
      }
    }

    // Layer 4: Cheapest paid model (DeepSeek for heavy computation)
    if (request.studio === 'code' || request.complexity === 'complex') {
      const deepseek = availableModels.find(m => m.id === 'deepseek-v3');
      if (deepseek) return deepseek;
    }

    // Layer 5: OpenRouter fallback
    const openRouter = availableModels.find(m => m.id === 'openrouter-cheapest');
    if (openRouter) return openRouter;

    // Fallback to first available model
    return availableModels[0];
  }

  /**
   * Get required capabilities for the request
   */
  private getRequiredCapabilities(request: RouterRequest): string[] {
    const capabilities: string[] = ['text'];

    // Add capabilities based on complexity
    if (request.complexity === 'medium') {
      capabilities.push('reasoning');
    }
    if (request.complexity === 'complex') {
      capabilities.push('reasoning', 'analysis');
    }

    // Add capabilities based on studio
    switch (request.studio) {
      case 'code':
        capabilities.push('code');
        break;
      case 'research':
        capabilities.push('analysis');
        break;
      case 'cua':
        capabilities.push('reasoning', 'thinking');
        break;
    }

    return capabilities;
  }

  /**
   * Estimate token count for a prompt
   */
  private estimateTokens(prompt: string): number {
    // Rough estimation: 1 token per 4 characters
    return Math.ceil(prompt.length / 4) * 2; // *2 for response
  }

  /**
   * Generate reasoning explanation
   */
  private generateReasoning(model: AIModel, request: RouterRequest): string {
    if (model.tier === 'free') {
      return `Selected ${model.name} (free tier) - optimal for ${request.complexity} complexity tasks. ${model.dailyQuota - model.usedToday} tokens remaining today.`;
    } else {
      return `Selected ${model.name} (paid) - best performance for ${request.complexity} complexity. Estimated cost: £${(model.costPerToken * this.estimateTokens(request.prompt)).toFixed(4)}.`;
    }
  }

  /**
   * Check if Vertex AI credits are available
   */
  private hasVertexCredits(): boolean {
    // Mock check - in real implementation, check actual Google Cloud billing
    return true; // Assuming we have £240 free credits
  }

  /**
   * Reset daily quotas if it's a new day
   */
  private resetDailyQuotas(): void {
    const now = new Date();
    this.models.forEach(model => {
      if (now.getDate() !== model.lastReset.getDate()) {
        model.usedToday = 0;
        model.lastReset = now;
      }
    });

    // Reset daily budget if new day
    const lastBudgetReset = new Date(this.costBudget.usedToday).getDate();
    if (now.getDate() !== lastBudgetReset) {
      this.costBudget.usedToday = 0;
    }
  }

  /**
   * Update model usage after successful request
   */
  updateUsage(modelId: string, tokensUsed: number, cost: number): void {
    const model = this.models.find(m => m.id === modelId);
    if (model) {
      model.usedToday += tokensUsed;
      this.costBudget.usedToday += cost;
    }
  }

  /**
   * Get current status of all models
   */
  getStatus(): { models: AIModel[]; budget: typeof this.costBudget } {
    return {
      models: [...this.models],
      budget: { ...this.costBudget },
    };
  }

  /**
   * Set emergency brake - stop all paid models
   */
  emergencyBrake(): void {
    this.models.forEach(model => {
      if (model.tier === 'paid') {
        model.isAvailable = false;
      }
    });
  }

  /**
   * Get cost monitoring data
   */
  getCostMonitoring() {
    const freeUsage = this.models
      .filter(m => m.tier === 'free')
      .reduce((total, m) => total + m.usedToday, 0);
    
    const paidUsage = this.models
      .filter(m => m.tier === 'paid')
      .reduce((total, m) => total + (m.usedToday * m.costPerToken), 0);

    return {
      freeTokensUsed: freeUsage,
      freeQuotaRemaining: this.models
        .filter(m => m.tier === 'free')
        .reduce((total, m) => total + (m.dailyQuota - m.usedToday), 0),
      costToday: this.costBudget.usedToday,
      budgetRemaining: this.costBudget.daily - this.costBudget.usedToday,
      costThisMonth: this.costBudget.usedThisMonth,
      monthlyBudgetRemaining: this.costBudget.monthly - this.costBudget.usedThisMonth,
    };
  }
}

// Export singleton instance
export const aiRouter = new SmartAIRouter();