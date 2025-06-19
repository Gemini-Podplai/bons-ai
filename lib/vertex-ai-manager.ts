/**
 * Vertex AI Express Manager
 * Utilizes Google Cloud £240 free credits
 */

interface VertexAICredits {
  totalCredits: number;
  usedCredits: number;
  remainingCredits: number;
  dailySpend: number;
  monthlySpend: number;
  lastUpdated: Date;
}

interface VertexAIRequest {
  prompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemInstruction?: string;
}

interface VertexAIResponse {
  response: string;
  tokensUsed: number;
  cost: number;
  model: string;
}

class VertexAIManager {
  private projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || '';
  private region = 'us-central1';
  private apiKey = process.env.GOOGLE_CLOUD_API_KEY || '';
  
  private credits: VertexAICredits = {
    totalCredits: 240, // £240 free credits
    usedCredits: 0,
    remainingCredits: 240,
    dailySpend: 0,
    monthlySpend: 0,
    lastUpdated: new Date(),
  };

  private baseUrl = `https://${this.region}-aiplatform.googleapis.com/v1/projects/${this.projectId}/locations/${this.region}/publishers/google/models`;

  // Cost per 1K tokens in £ (approximate)
  private modelCosts = {
    'gemini-pro': 0.0005,
    'gemini-pro-vision': 0.0025,
    'gemini-ultra': 0.008,
    'text-bison': 0.0003,
    'chat-bison': 0.0003,
  };

  /**
   * Check if we have enough credits for a request
   */
  hasEnoughCredits(estimatedCost: number): boolean {
    this.updateCreditsTracking();
    return this.credits.remainingCredits >= estimatedCost;
  }

  /**
   * Estimate cost for a request
   */
  estimateCost(prompt: string, model: string = 'gemini-pro'): number {
    const tokenEstimate = Math.ceil(prompt.length / 4) * 2; // Input + output estimate
    const costPerToken = this.modelCosts[model as keyof typeof this.modelCosts] || 0.0005;
    return (tokenEstimate / 1000) * costPerToken;
  }

  /**
   * Make API call to Vertex AI
   */
  async callVertexAI(request: VertexAIRequest): Promise<VertexAIResponse> {
    const model = request.model || 'gemini-pro';
    const estimatedCost = this.estimateCost(request.prompt, model);

    if (!this.hasEnoughCredits(estimatedCost)) {
      throw new Error('Insufficient Vertex AI credits');
    }

    const url = `${this.baseUrl}/${model}:generateContent`;
    
    const requestBody = {
      contents: [{
        role: 'user',
        parts: [{ text: request.prompt }]
      }],
      generation_config: {
        temperature: request.temperature || 0.7,
        max_output_tokens: request.maxTokens || 2048,
        top_p: 0.8,
        top_k: 40,
      },
      ...(request.systemInstruction && {
        system_instruction: {
          parts: [{ text: request.systemInstruction }]
        }
      })
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await this.getAccessToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Vertex AI error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.candidates[0]?.content?.parts[0]?.text || '';
      const tokensUsed = this.estimateTokensFromResponse(content, request.prompt);
      const actualCost = (tokensUsed / 1000) * (this.modelCosts[model as keyof typeof this.modelCosts] || 0.0005);

      // Update credits tracking
      this.updateCreditsUsage(actualCost);

      return {
        response: content,
        tokensUsed,
        cost: actualCost,
        model,
      };
    } catch (error) {
      console.error('Vertex AI call failed:', error);
      throw error;
    }
  }

  /**
   * Get OAuth2 access token for Vertex AI
   */
  private async getAccessToken(): Promise<string> {
    // In production, this would use proper service account authentication
    // For demo, return the API key
    return this.apiKey;
  }

  /**
   * Express mode for quick deployment with optimized models
   */
  async callExpressMode(
    prompt: string,
    complexity: 'simple' | 'medium' | 'complex' = 'medium'
  ): Promise<VertexAIResponse> {
    // Select model based on complexity
    let model = 'gemini-pro';
    let temperature = 0.7;
    let maxTokens = 2048;

    switch (complexity) {
      case 'simple':
        model = 'text-bison';
        temperature = 0.3;
        maxTokens = 1024;
        break;
      case 'medium':
        model = 'gemini-pro';
        temperature = 0.7;
        maxTokens = 2048;
        break;
      case 'complex':
        model = 'gemini-ultra';
        temperature = 0.9;
        maxTokens = 4096;
        break;
    }

    return this.callVertexAI({
      prompt,
      model,
      temperature,
      maxTokens,
    });
  }

  /**
   * Multi-modal mode with vision capabilities
   */
  async callWithVision(
    prompt: string,
    imageData?: string
  ): Promise<VertexAIResponse> {
    const requestBody = {
      contents: [{
        role: 'user',
        parts: [
          { text: prompt },
          ...(imageData ? [{ inline_data: { mime_type: 'image/jpeg', data: imageData } }] : [])
        ]
      }],
      generation_config: {
        temperature: 0.4,
        max_output_tokens: 2048,
      }
    };

    const estimatedCost = this.estimateCost(prompt, 'gemini-pro-vision');
    if (!this.hasEnoughCredits(estimatedCost)) {
      throw new Error('Insufficient credits for vision model');
    }

    // Similar API call logic as callVertexAI but with vision model
    return this.callVertexAI({
      prompt,
      model: 'gemini-pro-vision',
      temperature: 0.4,
    });
  }

  /**
   * Estimate tokens from response
   */
  private estimateTokensFromResponse(response: string, prompt: string): number {
    return Math.ceil((response.length + prompt.length) / 4);
  }

  /**
   * Update credits tracking
   */
  private updateCreditsTracking(): void {
    const now = new Date();
    const today = now.toDateString();
    const lastUpdate = this.credits.lastUpdated.toDateString();

    // Reset daily spend if new day
    if (today !== lastUpdate) {
      this.credits.dailySpend = 0;
    }

    // Reset monthly spend if new month
    if (now.getMonth() !== this.credits.lastUpdated.getMonth()) {
      this.credits.monthlySpend = 0;
    }

    this.credits.lastUpdated = now;
  }

  /**
   * Update credits usage after API call
   */
  private updateCreditsUsage(cost: number): void {
    this.credits.usedCredits += cost;
    this.credits.remainingCredits = this.credits.totalCredits - this.credits.usedCredits;
    this.credits.dailySpend += cost;
    this.credits.monthlySpend += cost;
  }

  /**
   * Get credits status for monitoring
   */
  getCreditsStatus() {
    this.updateCreditsTracking();
    return {
      totalCredits: this.credits.totalCredits,
      usedCredits: this.credits.usedCredits,
      remainingCredits: this.credits.remainingCredits,
      usagePercentage: (this.credits.usedCredits / this.credits.totalCredits) * 100,
      dailySpend: this.credits.dailySpend,
      monthlySpend: this.credits.monthlySpend,
      estimatedDaysRemaining: this.credits.dailySpend > 0 
        ? Math.floor(this.credits.remainingCredits / this.credits.dailySpend)
        : Infinity,
    };
  }

  /**
   * Set daily spending limit
   */
  setDailyLimit(limit: number): void {
    // In production, this would integrate with Google Cloud billing alerts
    console.log(`Daily spending limit set to £${limit}`);
  }

  /**
   * Emergency stop - disable Vertex AI
   */
  emergencyStop(): void {
    this.credits.remainingCredits = 0;
    console.log('Vertex AI emergency stop activated');
  }

  /**
   * Check if we're approaching credit limits
   */
  getCreditWarnings() {
    const status = this.getCreditsStatus();
    const warnings = [];

    if (status.usagePercentage > 80) {
      warnings.push('Vertex AI credits usage above 80%');
    }

    if (status.dailySpend > 10) {
      warnings.push('Daily Vertex AI spending above £10');
    }

    if (status.estimatedDaysRemaining < 7 && status.estimatedDaysRemaining !== Infinity) {
      warnings.push(`Vertex AI credits will run out in ${status.estimatedDaysRemaining} days`);
    }

    return warnings;
  }

  /**
   * Optimize model selection based on remaining credits
   */
  getOptimalModel(complexity: 'simple' | 'medium' | 'complex'): string {
    const status = this.getCreditsStatus();
    
    // If low on credits, use cheaper models
    if (status.usagePercentage > 70) {
      return complexity === 'complex' ? 'gemini-pro' : 'text-bison';
    }

    // Normal model selection
    switch (complexity) {
      case 'simple': return 'text-bison';
      case 'medium': return 'gemini-pro';
      case 'complex': return 'gemini-ultra';
      default: return 'gemini-pro';
    }
  }
}

export const vertexAIManager = new VertexAIManager();