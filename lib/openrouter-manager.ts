/**
 * OpenRouter Fallback Manager
 * Provides access to 400+ models as backup system
 */

interface OpenRouterModel {
  id: string;
  name: string;
  pricing: {
    prompt: number;
    completion: number;
  };
  context_length: number;
  architecture: {
    modality: string;
    tokenizer: string;
    instruct_type?: string;
  };
  top_provider: {
    context_length: number;
    max_completion_tokens: number;
  };
}

interface OpenRouterRequest {
  prompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemMessage?: string;
  stream?: boolean;
}

interface OpenRouterResponse {
  response: string;
  tokensUsed: number;
  cost: number;
  model: string;
  provider: string;
}

interface Usage {
  daily: number;
  monthly: number;
  total: number;
}

class OpenRouterManager {
  private apiKey = process.env.OPENROUTER_API_KEY || '';
  private baseUrl = 'https://openrouter.ai/api/v1';
  private siteUrl = 'https://bons-ai.dev';
  private siteName = 'Bons-AI Platform';

  private usage: Usage = {
    daily: 0,
    monthly: 0,
    total: 0,
  };

  private budgetLimits = {
    daily: 10, // £10/day
    monthly: 100, // £100/month
  };

  // Popular models optimized for different use cases
  private recommendedModels = {
    // Ultra-cheap models for simple tasks
    cheap: [
      'meta-llama/llama-3.2-1b-instruct:free',
      'microsoft/phi-3-mini-128k-instruct:free',
      'qwen/qwen-2-7b-instruct:free',
    ],
    
    // Balanced performance/cost for medium tasks
    balanced: [
      'meta-llama/llama-3.1-8b-instruct:free',
      'mistralai/mistral-7b-instruct:free',
      'google/gemma-7b-it:free',
    ],
    
    // High-performance models for complex tasks
    premium: [
      'anthropic/claude-3.5-sonnet',
      'openai/gpt-4o-mini',
      'meta-llama/llama-3.1-70b-instruct',
    ],
    
    // Specialized models
    code: [
      'codellama/codellama-34b-instruct',
      'microsoft/wizardcoder-python-34b',
      'deepseek/deepseek-coder-33b-instruct',
    ],
    
    // Long context models
    longContext: [
      'anthropic/claude-3-haiku',
      'google/gemini-pro-1.5',
      'cohere/command-r-plus',
    ],
  };

  /**
   * Get available models from OpenRouter
   */
  async getAvailableModels(): Promise<OpenRouterModel[]> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': this.siteUrl,
          'X-Title': this.siteName,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.status}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Failed to fetch OpenRouter models:', error);
      return [];
    }
  }

  /**
   * Find the cheapest available model for a task
   */
  async getCheapestModel(
    complexity: 'simple' | 'medium' | 'complex' = 'medium',
    specialization?: 'code' | 'longContext'
  ): Promise<string> {
    // First try free models
    if (specialization === 'code') {
      return this.recommendedModels.code[0];
    }
    
    if (specialization === 'longContext') {
      return this.recommendedModels.longContext[0];
    }

    switch (complexity) {
      case 'simple':
        return this.recommendedModels.cheap[0];
      case 'medium':
        return this.recommendedModels.balanced[0];
      case 'complex':
        // Check budget before using premium models
        if (this.canAffordPremium()) {
          return this.recommendedModels.premium[2]; // Use Llama 3.1 70B
        }
        return this.recommendedModels.balanced[0];
      default:
        return this.recommendedModels.balanced[0];
    }
  }

  /**
   * Make API call to OpenRouter
   */
  async callOpenRouter(request: OpenRouterRequest): Promise<OpenRouterResponse> {
    const model = request.model || await this.getCheapestModel();
    
    // Estimate cost
    const estimatedCost = await this.estimateCost(request.prompt, model);
    
    if (!this.canAfford(estimatedCost)) {
      throw new Error('Request exceeds budget limits');
    }

    const requestBody = {
      model,
      messages: [
        ...(request.systemMessage ? [{ role: 'system', content: request.systemMessage }] : []),
        { role: 'user', content: request.prompt }
      ],
      temperature: request.temperature || 0.7,
      max_tokens: request.maxTokens || 2048,
      stream: request.stream || false,
      route: 'fallback', // Use fallback routing for reliability
    };

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': this.siteUrl,
          'X-Title': this.siteName,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenRouter API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';
      const tokensUsed = data.usage?.total_tokens || 0;
      const actualCost = this.calculateCost(tokensUsed, model);

      // Update usage tracking
      this.updateUsage(actualCost);

      return {
        response: content,
        tokensUsed,
        cost: actualCost,
        model,
        provider: 'OpenRouter',
      };
    } catch (error) {
      console.error('OpenRouter call failed:', error);
      throw error;
    }
  }

  /**
   * Streaming response for real-time applications
   */
  async *streamOpenRouter(request: OpenRouterRequest): AsyncGenerator<string, void, unknown> {
    const model = request.model || await this.getCheapestModel();
    
    const requestBody = {
      model,
      messages: [
        ...(request.systemMessage ? [{ role: 'system', content: request.systemMessage }] : []),
        { role: 'user', content: request.prompt }
      ],
      temperature: request.temperature || 0.7,
      max_tokens: request.maxTokens || 2048,
      stream: true,
    };

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': this.siteUrl,
          'X-Title': this.siteName,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`OpenRouter streaming error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response stream available');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') return;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content;
              if (content) {
                yield content;
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error('OpenRouter streaming failed:', error);
      throw error;
    }
  }

  /**
   * Auto-select best model based on requirements
   */
  async getOptimalModel(requirements: {
    complexity: 'simple' | 'medium' | 'complex';
    contextLength?: number;
    specialization?: 'code' | 'longContext' | 'multimodal';
    maxCost?: number;
  }): Promise<string> {
    // Check for specialization first
    if (requirements.specialization === 'code') {
      return this.recommendedModels.code[0];
    }

    if (requirements.specialization === 'longContext') {
      return this.recommendedModels.longContext[0];
    }

    // Check budget constraints
    if (requirements.maxCost && requirements.maxCost < 0.001) {
      return this.recommendedModels.cheap[0];
    }

    // Check context length requirements
    if (requirements.contextLength && requirements.contextLength > 32000) {
      return this.recommendedModels.longContext[0];
    }

    // Default complexity-based selection
    return this.getCheapestModel(requirements.complexity);
  }

  /**
   * Estimate cost for a request
   */
  private async estimateCost(prompt: string, model: string): Promise<number> {
    // Rough estimation - would be more accurate with model-specific pricing
    const tokenEstimate = Math.ceil(prompt.length / 4) * 2;
    
    // Average cost per 1K tokens for different model tiers
    const costPer1K = model.includes('free') ? 0 : 
                     model.includes('gpt-4') ? 0.01 :
                     model.includes('claude') ? 0.008 :
                     model.includes('llama') ? 0.0002 : 0.001;

    return (tokenEstimate / 1000) * costPer1K;
  }

  /**
   * Calculate actual cost from usage
   */
  private calculateCost(tokens: number, model: string): number {
    // This would normally use the exact pricing from the model metadata
    return this.estimateCost('x'.repeat(tokens * 4), model).then(cost => cost);
  }

  /**
   * Check if we can afford a request
   */
  private canAfford(estimatedCost: number): boolean {
    return (this.usage.daily + estimatedCost) <= this.budgetLimits.daily &&
           (this.usage.monthly + estimatedCost) <= this.budgetLimits.monthly;
  }

  /**
   * Check if we can afford premium models
   */
  private canAffordPremium(): boolean {
    return this.usage.daily < (this.budgetLimits.daily * 0.5); // Only use premium if under 50% of daily budget
  }

  /**
   * Update usage tracking
   */
  private updateUsage(cost: number): void {
    this.usage.daily += cost;
    this.usage.monthly += cost;
    this.usage.total += cost;
  }

  /**
   * Get usage statistics
   */
  getUsageStats() {
    return {
      usage: { ...this.usage },
      budgetLimits: { ...this.budgetLimits },
      remainingBudget: {
        daily: this.budgetLimits.daily - this.usage.daily,
        monthly: this.budgetLimits.monthly - this.usage.monthly,
      },
      utilizationPercentage: {
        daily: (this.usage.daily / this.budgetLimits.daily) * 100,
        monthly: (this.usage.monthly / this.budgetLimits.monthly) * 100,
      },
    };
  }

  /**
   * Reset daily usage (called by cron job)
   */
  resetDailyUsage(): void {
    this.usage.daily = 0;
  }

  /**
   * Reset monthly usage (called by cron job)
   */
  resetMonthlyUsage(): void {
    this.usage.monthly = 0;
  }

  /**
   * Emergency brake - disable all paid models
   */
  emergencyBrake(): void {
    // Override all model selection to only return free models
    this.recommendedModels.premium = [...this.recommendedModels.cheap];
    this.recommendedModels.balanced = [...this.recommendedModels.cheap];
    console.log('OpenRouter emergency brake activated - only free models available');
  }

  /**
   * Test connection and model availability
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.callOpenRouter({
        prompt: 'Hello, this is a test. Please respond with "OK".',
        model: this.recommendedModels.cheap[0],
      });
      
      return response.response.toLowerCase().includes('ok');
    } catch (error) {
      console.error('OpenRouter connection test failed:', error);
      return false;
    }
  }

  /**
   * Get health status
   */
  async getHealthStatus() {
    const isConnected = await this.testConnection();
    const stats = this.getUsageStats();
    
    return {
      isConnected,
      hasRemainingBudget: stats.remainingBudget.daily > 0,
      dailyUsagePercentage: stats.utilizationPercentage.daily,
      recommendedAction: stats.utilizationPercentage.daily > 80 ? 'reduce_usage' : 'normal',
    };
  }
}

export const openRouterManager = new OpenRouterManager();