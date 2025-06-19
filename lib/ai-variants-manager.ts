/**
 * Prime + 7 Variants Architecture
 * Specialized AI agents for different development tasks
 */

interface AIVariant {
  id: string;
  name: string;
  role: string;
  systemPrompt: string;
  capabilities: string[];
  preferredModels: string[];
  temperature: number;
  maxTokens: number;
  costPriority: 'free' | 'balanced' | 'premium';
}

interface VariantRequest {
  prompt: string;
  context?: string;
  previousMessages?: Array<{ role: string; content: string }>;
  requiresReasoning?: boolean;
  urgency?: 'low' | 'medium' | 'high';
}

interface VariantResponse {
  response: string;
  variant: string;
  reasoning?: string;
  suggestedNextSteps?: string[];
  collaborationNeeded?: string[];
  tokensUsed: number;
  cost: number;
  model: string;
}

class AIVariantsManager {
  private variants: Record<string, AIVariant> = {
    // Prime - Main conductor and user-facing agent
    prime: {
      id: 'prime',
      name: 'Prime Conductor',
      role: 'Main AI conductor and user interface',
      systemPrompt: `You are the Prime Conductor of the Bons-AI platform. You orchestrate between specialized AI variants, manage user interactions, and ensure coherent project flow. You are neurodivergent-friendly, calm, and always explain your reasoning. When needed, delegate to specialist variants and synthesize their responses.`,
      capabilities: ['orchestration', 'user_interface', 'delegation', 'synthesis'],
      preferredModels: ['gemini-2.5-pro', 'claude-3.5-sonnet'],
      temperature: 0.7,
      maxTokens: 4096,
      costPriority: 'balanced',
    },

    // Research Specialist
    research: {
      id: 'research',
      name: 'Research Analyst',
      role: 'Web scraping, data analysis, and research synthesis',
      systemPrompt: `You are a Research Analyst specialized in web scraping, data gathering, and analysis. You excel at finding information, analyzing trends, synthesizing multiple sources, and presenting findings clearly. You work with CopyCapy for documentation scraping and maintain high accuracy standards.`,
      capabilities: ['web_scraping', 'data_analysis', 'research', 'synthesis'],
      preferredModels: ['gemini-2.5-pro', 'claude-3-haiku'],
      temperature: 0.3,
      maxTokens: 8192,
      costPriority: 'free',
    },

    // Code Specialist
    code: {
      id: 'code',
      name: 'Code Architect',
      role: 'Software development, debugging, and code review',
      systemPrompt: `You are a Code Architect specialized in software development, debugging, and code review. You excel at writing clean, efficient code, identifying bugs, optimizing performance, and explaining complex technical concepts. You integrate with Cursor Pro and use DeepSeek for heavy computation.`,
      capabilities: ['coding', 'debugging', 'code_review', 'architecture'],
      preferredModels: ['deepseek-v3', 'claude-3.5-sonnet'],
      temperature: 0.2,
      maxTokens: 8192,
      costPriority: 'balanced',
    },

    // Design Specialist
    design: {
      id: 'design',
      name: 'UX Designer',
      role: 'UI/UX design, component creation, and design systems',
      systemPrompt: `You are a UX Designer specialized in user interface design, user experience optimization, and design systems. You excel at creating intuitive interfaces, accessible designs, and coherent design systems. You work with Penpot and v0.dev for component generation.`,
      capabilities: ['ui_design', 'ux_design', 'design_systems', 'accessibility'],
      preferredModels: ['claude-3.5-sonnet', 'gemini-pro-vision'],
      temperature: 0.8,
      maxTokens: 4096,
      costPriority: 'balanced',
    },

    // Testing & Quality Assurance
    test: {
      id: 'test',
      name: 'QA Engineer',
      role: 'Testing, quality assurance, and performance optimization',
      systemPrompt: `You are a QA Engineer specialized in testing, quality assurance, and performance optimization. You excel at creating test plans, identifying edge cases, performance testing, and ensuring reliability. You focus on comprehensive testing strategies and continuous quality improvement.`,
      capabilities: ['testing', 'qa', 'performance', 'reliability'],
      preferredModels: ['gemini-1.5-flash-8b', 'claude-3-haiku'],
      temperature: 0.1,
      maxTokens: 4096,
      costPriority: 'free',
    },

    // Deployment Specialist
    deploy: {
      id: 'deploy',
      name: 'DevOps Engineer',
      role: 'Deployment, infrastructure, and DevOps automation',
      systemPrompt: `You are a DevOps Engineer specialized in deployment, infrastructure management, and automation. You excel at CI/CD pipelines, cloud infrastructure, monitoring, and ensuring reliable deployments. You focus on scalability, security, and operational excellence.`,
      capabilities: ['deployment', 'infrastructure', 'devops', 'monitoring'],
      preferredModels: ['gemini-2.5-pro', 'claude-3-haiku'],
      temperature: 0.3,
      maxTokens: 4096,
      costPriority: 'free',
    },

    // Documentation Specialist
    document: {
      id: 'document',
      name: 'Technical Writer',
      role: 'Documentation, technical writing, and knowledge management',
      systemPrompt: `You are a Technical Writer specialized in documentation, technical writing, and knowledge management. You excel at creating clear, comprehensive documentation, tutorials, and maintaining knowledge bases. You ensure information is accessible and well-organized.`,
      capabilities: ['documentation', 'technical_writing', 'knowledge_management'],
      preferredModels: ['claude-3.5-sonnet', 'gemini-2.0-flash-lite'],
      temperature: 0.4,
      maxTokens: 6144,
      costPriority: 'free',
    },

    // Debug Specialist
    debug: {
      id: 'debug',
      name: 'Debug Specialist',
      role: 'Debugging, error analysis, and problem solving',
      systemPrompt: `You are a Debug Specialist focused on identifying, analyzing, and solving technical problems. You excel at error analysis, debugging complex issues, performance troubleshooting, and providing step-by-step solutions. You approach problems systematically and think deeply about root causes.`,
      capabilities: ['debugging', 'error_analysis', 'problem_solving', 'diagnostics'],
      preferredModels: ['deepseek-v3', 'gemini-2.5-pro'],
      temperature: 0.1,
      maxTokens: 8192,
      costPriority: 'balanced',
    },
  };

  /**
   * Route request to appropriate variant
   */
  async routeToVariant(
    variantId: string,
    request: VariantRequest
  ): Promise<VariantResponse> {
    const variant = this.variants[variantId];
    if (!variant) {
      throw new Error(`Unknown variant: ${variantId}`);
    }

    // Import AI managers
    const { googleAIManager } = await import('./google-ai-manager');
    const { vertexAIManager } = await import('./vertex-ai-manager');
    const { openRouterManager } = await import('./openrouter-manager');

    // Select optimal model for this variant
    const selectedModel = await this.selectModelForVariant(variant, request);
    
    // Prepare enhanced prompt with context
    const enhancedPrompt = this.buildEnhancedPrompt(variant, request);

    try {
      let response: VariantResponse;

      // Route to appropriate AI service based on model
      if (selectedModel.includes('gemini')) {
        if (selectedModel.includes('2.0-flash-lite') || selectedModel.includes('1.5-flash-8b')) {
          const result = await googleAIManager.callGeminiFlashLite(enhancedPrompt);
          response = this.formatResponse(variant, result.response, result.tokensUsed, 0, selectedModel);
        } else if (selectedModel.includes('2.5-pro')) {
          const result = await googleAIManager.callGeminiPro(enhancedPrompt, {
            systemInstruction: variant.systemPrompt,
            temperature: variant.temperature,
          });
          response = this.formatResponse(variant, result.response, result.tokensUsed, 0, selectedModel);
        } else {
          // Vertex AI
          const result = await vertexAIManager.callVertexAI({
            prompt: enhancedPrompt,
            model: selectedModel,
            temperature: variant.temperature,
            maxTokens: variant.maxTokens,
            systemInstruction: variant.systemPrompt,
          });
          response = this.formatResponse(variant, result.response, result.tokensUsed, result.cost, selectedModel);
        }
      } else {
        // OpenRouter fallback
        const result = await openRouterManager.callOpenRouter({
          prompt: enhancedPrompt,
          model: selectedModel,
          temperature: variant.temperature,
          maxTokens: variant.maxTokens,
          systemMessage: variant.systemPrompt,
        });
        response = this.formatResponse(variant, result.response, result.tokensUsed, result.cost, selectedModel);
      }

      // Add variant-specific enhancements
      return this.enhanceResponse(variant, response, request);

    } catch (error) {
      console.error(`Variant ${variantId} failed:`, error);
      
      // Fallback to Prime conductor
      if (variantId !== 'prime') {
        return this.routeToVariant('prime', {
          ...request,
          prompt: `The ${variant.name} variant encountered an error. Please handle this request: ${request.prompt}`,
        });
      }
      
      throw error;
    }
  }

  /**
   * Orchestrate collaboration between variants
   */
  async orchestrateCollaboration(
    request: VariantRequest,
    involvedVariants: string[]
  ): Promise<VariantResponse> {
    const results: VariantResponse[] = [];
    
    // Get input from each variant
    for (const variantId of involvedVariants) {
      try {
        const result = await this.routeToVariant(variantId, request);
        results.push(result);
      } catch (error) {
        console.error(`Variant ${variantId} failed in collaboration:`, error);
      }
    }

    // Have Prime synthesize all responses
    const synthesisPrompt = `
Synthesize the following responses from different AI specialists:

${results.map(r => `${r.variant}: ${r.response}`).join('\n\n')}

Original request: ${request.prompt}

Provide a coherent, comprehensive response that combines the best insights from each specialist.
    `;

    const synthesis = await this.routeToVariant('prime', {
      prompt: synthesisPrompt,
      context: request.context,
    });

    return {
      ...synthesis,
      collaborationNeeded: [],
      tokensUsed: results.reduce((sum, r) => sum + r.tokensUsed, 0) + synthesis.tokensUsed,
      cost: results.reduce((sum, r) => sum + r.cost, 0) + synthesis.cost,
    };
  }

  /**
   * Auto-select best variant for a request
   */
  determineOptimalVariant(prompt: string, context?: string): string {
    const lowercasePrompt = prompt.toLowerCase();
    
    // Check for specific keywords to determine variant
    if (lowercasePrompt.includes('research') || lowercasePrompt.includes('find') || lowercasePrompt.includes('analyze')) {
      return 'research';
    }
    
    if (lowercasePrompt.includes('code') || lowercasePrompt.includes('function') || lowercasePrompt.includes('program')) {
      return 'code';
    }
    
    if (lowercasePrompt.includes('design') || lowercasePrompt.includes('ui') || lowercasePrompt.includes('interface')) {
      return 'design';
    }
    
    if (lowercasePrompt.includes('test') || lowercasePrompt.includes('qa') || lowercasePrompt.includes('quality')) {
      return 'test';
    }
    
    if (lowercasePrompt.includes('deploy') || lowercasePrompt.includes('devops') || lowercasePrompt.includes('infrastructure')) {
      return 'deploy';
    }
    
    if (lowercasePrompt.includes('document') || lowercasePrompt.includes('docs') || lowercasePrompt.includes('write')) {
      return 'document';
    }
    
    if (lowercasePrompt.includes('debug') || lowercasePrompt.includes('error') || lowercasePrompt.includes('fix')) {
      return 'debug';
    }
    
    // Default to Prime conductor
    return 'prime';
  }

  /**
   * Select optimal model for variant
   */
  private async selectModelForVariant(variant: AIVariant, request: VariantRequest): Promise<string> {
    const { aiRouter } = await import('./ai-router');
    
    // Determine complexity based on request
    let complexity: 'simple' | 'medium' | 'complex' = 'medium';
    
    if (request.requiresReasoning || request.prompt.length > 1000) {
      complexity = 'complex';
    } else if (request.prompt.length < 100) {
      complexity = 'simple';
    }

    // Route through main AI router
    const routingResult = await aiRouter.route({
      prompt: request.prompt,
      complexity,
      studio: variant.id,
    });

    return routingResult.selectedModel.id;
  }

  /**
   * Build enhanced prompt with context and variant specialization
   */
  private buildEnhancedPrompt(variant: AIVariant, request: VariantRequest): string {
    let prompt = `As the ${variant.name}, ${request.prompt}`;
    
    if (request.context) {
      prompt = `Context: ${request.context}\n\n${prompt}`;
    }
    
    if (request.previousMessages && request.previousMessages.length > 0) {
      const history = request.previousMessages
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');
      prompt = `Previous conversation:\n${history}\n\n${prompt}`;
    }
    
    return prompt;
  }

  /**
   * Format response with variant metadata
   */
  private formatResponse(
    variant: AIVariant,
    response: string,
    tokensUsed: number,
    cost: number,
    model: string
  ): VariantResponse {
    return {
      response,
      variant: variant.name,
      tokensUsed,
      cost,
      model,
    };
  }

  /**
   * Enhance response with variant-specific features
   */
  private enhanceResponse(
    variant: AIVariant,
    response: VariantResponse,
    request: VariantRequest
  ): VariantResponse {
    // Add reasoning for complex requests
    if (request.requiresReasoning && variant.id === 'prime') {
      response.reasoning = `Selected ${variant.name} based on request complexity and capabilities required.`;
    }

    // Add suggested next steps based on variant type
    switch (variant.id) {
      case 'research':
        response.suggestedNextSteps = [
          'Review findings for accuracy',
          'Cross-reference with additional sources',
          'Consider documentation updates',
        ];
        break;
      case 'code':
        response.suggestedNextSteps = [
          'Test the implementation',
          'Review code for optimization',
          'Update documentation',
        ];
        break;
      case 'design':
        response.suggestedNextSteps = [
          'Create prototypes',
          'Gather user feedback',
          'Implement design system',
        ];
        break;
    }

    // Suggest collaboration if beneficial
    if (variant.id !== 'prime') {
      response.collaborationNeeded = this.suggestCollaboration(variant.id, request.prompt);
    }

    return response;
  }

  /**
   * Suggest other variants that might help with the request
   */
  private suggestCollaboration(currentVariantId: string, prompt: string): string[] {
    const suggestions: string[] = [];
    const lowercasePrompt = prompt.toLowerCase();

    // Common collaboration patterns
    if (currentVariantId === 'code' && lowercasePrompt.includes('test')) {
      suggestions.push('test');
    }
    
    if (currentVariantId === 'design' && lowercasePrompt.includes('implement')) {
      suggestions.push('code');
    }
    
    if (currentVariantId === 'research' && lowercasePrompt.includes('build')) {
      suggestions.push('code', 'design');
    }
    
    // Always suggest documentation for complex projects
    if (prompt.length > 500 && !suggestions.includes('document')) {
      suggestions.push('document');
    }

    return suggestions;
  }

  /**
   * Get variant capabilities and status
   */
  getVariantStatus() {
    return Object.values(this.variants).map(variant => ({
      id: variant.id,
      name: variant.name,
      role: variant.role,
      capabilities: variant.capabilities,
      costPriority: variant.costPriority,
      isAvailable: true, // In production, check actual model availability
    }));
  }

  /**
   * Update variant configuration
   */
  updateVariantConfig(variantId: string, updates: Partial<AIVariant>): void {
    if (this.variants[variantId]) {
      this.variants[variantId] = { ...this.variants[variantId], ...updates };
    }
  }
}

export const aiVariantsManager = new AIVariantsManager();