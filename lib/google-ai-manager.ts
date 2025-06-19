/**
 * Google AI Studio Multi-Account Manager
 * Handles 2 Google AI Studio accounts with quota rotation
 */

interface GoogleAIAccount {
  id: string;
  name: string;
  apiKey: string;
  dailyQuota: number;
  usedToday: number;
  lastReset: Date;
  isActive: boolean;
  rateLimitReset?: Date;
}

interface GoogleAIResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
  }>;
  usageMetadata: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

class GoogleAIManager {
  private accounts: GoogleAIAccount[] = [
    {
      id: 'google-ai-1',
      name: 'Google AI Studio Account 1',
      apiKey: process.env.GOOGLE_AI_STUDIO_KEY_1 || '',
      dailyQuota: 300000, // 300K tokens/day for Gemini 2.5 Pro
      usedToday: 0,
      lastReset: new Date(),
      isActive: true,
    },
    {
      id: 'google-ai-2',
      name: 'Google AI Studio Account 2', 
      apiKey: process.env.GOOGLE_AI_STUDIO_KEY_2 || '',
      dailyQuota: 300000,
      usedToday: 0,
      lastReset: new Date(),
      isActive: true,
    }
  ];

  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';

  /**
   * Get the best available account for a request
   */
  getBestAccount(estimatedTokens: number): GoogleAIAccount | null {
    this.resetDailyQuotas();
    
    // Filter available accounts
    const availableAccounts = this.accounts.filter(account => 
      account.isActive && 
      account.usedToday + estimatedTokens <= account.dailyQuota &&
      (!account.rateLimitReset || account.rateLimitReset < new Date())
    );

    if (availableAccounts.length === 0) {
      return null;
    }

    // Return account with most remaining quota
    return availableAccounts.sort((a, b) => 
      (b.dailyQuota - b.usedToday) - (a.dailyQuota - a.usedToday)
    )[0];
  }

  /**
   * Make API call to Google AI Studio
   */
  async callGoogleAI(
    accountId: string,
    model: string,
    prompt: string,
    options: {
      temperature?: number;
      maxTokens?: number;
      systemInstruction?: string;
    } = {}
  ): Promise<{ response: string; tokensUsed: number }> {
    const account = this.accounts.find(acc => acc.id === accountId);
    if (!account || !account.isActive) {
      throw new Error('Account not available');
    }

    const url = `${this.baseUrl}/${model}:generateContent?key=${account.apiKey}`;
    
    const requestBody = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: options.temperature || 0.7,
        maxOutputTokens: options.maxTokens || 2048,
        topP: 0.8,
        topK: 40,
      },
      ...(options.systemInstruction && {
        systemInstruction: {
          parts: [{ text: options.systemInstruction }]
        }
      })
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        if (response.status === 429) {
          // Rate limited - mark account temporarily unavailable
          account.rateLimitReset = new Date(Date.now() + 60000); // 1 minute
          throw new Error('Rate limited');
        }
        throw new Error(`API error: ${response.status}`);
      }

      const data: GoogleAIResponse = await response.json();
      const content = data.candidates[0]?.content.parts[0]?.text || '';
      const tokensUsed = data.usageMetadata?.totalTokenCount || 0;

      // Update usage
      account.usedToday += tokensUsed;

      return {
        response: content,
        tokensUsed,
      };
    } catch (error) {
      console.error(`Google AI call failed for ${account.name}:`, error);
      throw error;
    }
  }

  /**
   * Call Gemini 2.0 Flash Lite (unlimited free)
   */
  async callGeminiFlashLite(prompt: string): Promise<{ response: string; tokensUsed: number }> {
    const account = this.getBestAccount(1000); // Estimate for prompt
    if (!account) {
      throw new Error('No available Google AI accounts');
    }

    return this.callGoogleAI(account.id, 'gemini-2.0-flash-exp', prompt, {
      temperature: 0.3,
      maxTokens: 8192,
    });
  }

  /**
   * Call Gemini 1.5 Flash 8B (unlimited free)
   */
  async callGeminiFlash8B(prompt: string): Promise<{ response: string; tokensUsed: number }> {
    const account = this.getBestAccount(1000);
    if (!account) {
      throw new Error('No available Google AI accounts');
    }

    return this.callGoogleAI(account.id, 'gemini-1.5-flash-8b', prompt, {
      temperature: 0.5,
      maxTokens: 8192,
    });
  }

  /**
   * Call Gemini 2.5 Pro (300K tokens/day per account)
   */
  async callGeminiPro(
    prompt: string, 
    options: { systemInstruction?: string; temperature?: number } = {}
  ): Promise<{ response: string; tokensUsed: number; accountUsed: string }> {
    const estimatedTokens = Math.ceil(prompt.length / 4) * 2; // Rough estimate
    const account = this.getBestAccount(estimatedTokens);
    
    if (!account) {
      throw new Error('No available Google AI Pro accounts');
    }

    const result = await this.callGoogleAI(
      account.id, 
      'gemini-2.0-flash-thinking-exp', 
      prompt, 
      {
        temperature: options.temperature || 0.7,
        maxTokens: 32768,
        systemInstruction: options.systemInstruction,
      }
    );

    return {
      ...result,
      accountUsed: account.name,
    };
  }

  /**
   * Reset daily quotas if needed
   */
  private resetDailyQuotas(): void {
    const now = new Date();
    this.accounts.forEach(account => {
      if (now.getDate() !== account.lastReset.getDate()) {
        account.usedToday = 0;
        account.lastReset = now;
        account.rateLimitReset = undefined;
      }
    });
  }

  /**
   * Get account status for monitoring
   */
  getAccountStatus() {
    this.resetDailyQuotas();
    return this.accounts.map(account => ({
      id: account.id,
      name: account.name,
      quotaUsed: account.usedToday,
      quotaTotal: account.dailyQuota,
      quotaPercentage: (account.usedToday / account.dailyQuota) * 100,
      isActive: account.isActive,
      isRateLimited: account.rateLimitReset ? account.rateLimitReset > new Date() : false,
    }));
  }

  /**
   * Emergency disable all accounts
   */
  emergencyDisable(): void {
    this.accounts.forEach(account => {
      account.isActive = false;
    });
  }

  /**
   * Get total available quota across all accounts
   */
  getTotalAvailableQuota(): number {
    this.resetDailyQuotas();
    return this.accounts.reduce((total, account) => {
      if (account.isActive) {
        return total + (account.dailyQuota - account.usedToday);
      }
      return total;
    }, 0);
  }
}

export const googleAIManager = new GoogleAIManager();