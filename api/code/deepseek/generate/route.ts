import { NextRequest, NextResponse } from 'next/server';

interface DeepSeekGenerateRequest {
  prompt: string;
  type: 'code_generation' | 'code_review' | 'debugging' | 'optimization' | 'refactoring' | 'testing';
  complexity: 'simple' | 'medium' | 'complex';
  context?: string;
  language?: string;
  framework?: string;
  options?: {
    temperature?: number;
    maxTokens?: number;
    includeComments?: boolean;
    includeTests?: boolean;
    codeStyle?: 'functional' | 'object-oriented' | 'mixed';
  };
}

interface DeepSeekResponse {
  success: boolean;
  code?: string;
  explanation?: string;
  suggestions?: string[];
  cost: number;
  tokensUsed: number;
  model: string;
  processingTime: number;
}

// Generate code using DeepSeek V3
export async function POST(request: NextRequest): Promise<NextResponse<DeepSeekResponse>> {
  const startTime = Date.now();
  
  try {
    const {
      prompt,
      type,
      complexity,
      context,
      language = 'typescript',
      framework,
      options = {}
    }: DeepSeekGenerateRequest = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { success: false, code: '', cost: 0, tokensUsed: 0, model: '', processingTime: 0 },
        { status: 400 }
      );
    }

    const deepSeekApiKey = process.env.DEEPSEEK_API_KEY;

    if (!deepSeekApiKey) {
      // Mock response for development
      const mockResponse = generateMockCode(prompt, type, complexity, language);
      
      return NextResponse.json({
        success: true,
        code: mockResponse.code,
        explanation: mockResponse.explanation,
        suggestions: mockResponse.suggestions,
        cost: calculateMockCost(prompt, complexity),
        tokensUsed: Math.ceil(prompt.length / 4) * 2,
        model: 'deepseek-coder-v3-mock',
        processingTime: Date.now() - startTime,
      });
    }

    // Build enhanced prompt based on task type
    const enhancedPrompt = buildEnhancedPrompt(prompt, type, complexity, context, language, framework, options);

    // Configure model parameters based on task complexity
    const modelConfig = getModelConfig(type, complexity);

    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${deepSeekApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-coder',
          messages: [
            {
              role: 'system',
              content: getSystemPrompt(type, language, framework)
            },
            {
              role: 'user',
              content: enhancedPrompt
            }
          ],
          max_tokens: modelConfig.maxTokens,
          temperature: modelConfig.temperature,
          top_p: 0.95,
          frequency_penalty: 0.1,
          presence_penalty: 0.1,
        }),
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status}`);
      }

      const data = await response.json();
      const generatedContent = data.choices[0]?.message?.content || '';
      const usage = data.usage;

      // Parse the response to extract code and explanation
      const parsed = parseDeepSeekResponse(generatedContent, type);

      // Calculate actual cost
      const cost = calculateCost(usage.prompt_tokens, usage.completion_tokens);

      return NextResponse.json({
        success: true,
        code: parsed.code,
        explanation: parsed.explanation,
        suggestions: parsed.suggestions,
        cost,
        tokensUsed: usage.total_tokens,
        model: 'deepseek-coder',
        processingTime: Date.now() - startTime,
      });

    } catch (deepSeekError) {
      console.error('DeepSeek generation error:', deepSeekError);
      return NextResponse.json(
        { 
          success: false, 
          code: '', 
          cost: 0, 
          tokensUsed: 0, 
          model: '', 
          processingTime: Date.now() - startTime 
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Code generation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        code: '', 
        cost: 0, 
        tokensUsed: 0, 
        model: '', 
        processingTime: Date.now() - startTime 
      },
      { status: 500 }
    );
  }
}

function buildEnhancedPrompt(
  prompt: string,
  type: string,
  complexity: string,
  context?: string,
  language?: string,
  framework?: string,
  options?: any
): string {
  let enhancedPrompt = '';

  // Add context if provided
  if (context) {
    enhancedPrompt += `Context:\n${context}\n\n`;
  }

  // Add task-specific instructions
  switch (type) {
    case 'code_generation':
      enhancedPrompt += `Generate ${language} code for: ${prompt}\n\n`;
      if (framework) {
        enhancedPrompt += `Framework: ${framework}\n`;
      }
      if (options?.includeComments) {
        enhancedPrompt += `Include comprehensive comments explaining the code.\n`;
      }
      if (options?.includeTests) {
        enhancedPrompt += `Include unit tests for the generated code.\n`;
      }
      break;

    case 'code_review':
      enhancedPrompt += `Review this ${language} code and provide feedback:\n${prompt}\n\n`;
      enhancedPrompt += `Focus on: security, performance, maintainability, and best practices.\n`;
      break;

    case 'debugging':
      enhancedPrompt += `Debug this ${language} code and fix any issues:\n${prompt}\n\n`;
      enhancedPrompt += `Provide the corrected code and explain what was wrong.\n`;
      break;

    case 'optimization':
      enhancedPrompt += `Optimize this ${language} code for better performance:\n${prompt}\n\n`;
      enhancedPrompt += `Focus on: speed, memory usage, and scalability.\n`;
      break;

    case 'refactoring':
      enhancedPrompt += `Refactor this ${language} code to improve readability and maintainability:\n${prompt}\n\n`;
      enhancedPrompt += `Apply clean code principles and modern best practices.\n`;
      break;

    case 'testing':
      enhancedPrompt += `Write comprehensive tests for this ${language} code:\n${prompt}\n\n`;
      enhancedPrompt += `Include unit tests, integration tests, and edge cases.\n`;
      break;
  }

  // Add complexity-specific instructions
  if (complexity === 'complex') {
    enhancedPrompt += `\nThis is a complex task requiring advanced techniques and thorough error handling.\n`;
  } else if (complexity === 'simple') {
    enhancedPrompt += `\nKeep the solution simple and straightforward.\n`;
  }

  return enhancedPrompt;
}

function getSystemPrompt(type: string, language: string, framework?: string): string {
  const basePrompt = `You are an expert ${language} developer with deep knowledge of best practices, design patterns, and modern development techniques.`;
  
  const frameworkPrompt = framework ? ` You specialize in ${framework} development.` : '';
  
  const taskPrompts = {
    code_generation: ' Generate clean, efficient, and well-documented code.',
    code_review: ' Provide thorough code reviews focusing on quality, security, and maintainability.',
    debugging: ' Identify and fix bugs systematically, explaining the root cause.',
    optimization: ' Optimize code for performance while maintaining readability.',
    refactoring: ' Refactor code to improve structure and maintainability.',
    testing: ' Write comprehensive tests covering all scenarios and edge cases.',
  };

  return basePrompt + frameworkPrompt + (taskPrompts[type as keyof typeof taskPrompts] || '');
}

function getModelConfig(type: string, complexity: string) {
  const baseConfig = {
    simple: { maxTokens: 1024, temperature: 0.1 },
    medium: { maxTokens: 2048, temperature: 0.3 },
    complex: { maxTokens: 4096, temperature: 0.5 },
  };

  const config = baseConfig[complexity as keyof typeof baseConfig];

  // Adjust for specific task types
  if (type === 'debugging' || type === 'code_review') {
    config.temperature = Math.max(0.1, config.temperature - 0.2); // More deterministic
  } else if (type === 'code_generation') {
    config.temperature = Math.min(0.7, config.temperature + 0.1); // More creative
  }

  return config;
}

function parseDeepSeekResponse(content: string, type: string) {
  const lines = content.split('\n');
  let code = '';
  let explanation = '';
  let suggestions: string[] = [];
  
  let inCodeBlock = false;
  let inExplanation = false;
  
  for (const line of lines) {
    if (line.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
    } else if (inCodeBlock) {
      code += line + '\n';
    } else if (line.toLowerCase().includes('explanation') || line.toLowerCase().includes('summary')) {
      inExplanation = true;
    } else if (line.toLowerCase().includes('suggestion') || line.toLowerCase().includes('recommendation')) {
      suggestions.push(line.replace(/^\W*/, ''));
    } else if (inExplanation && line.trim()) {
      explanation += line + ' ';
    }
  }

  // If no code blocks found, treat entire response as code for generation tasks
  if (!code && type === 'code_generation') {
    code = content;
  }

  return {
    code: code.trim(),
    explanation: explanation.trim() || generateDefaultExplanation(type),
    suggestions: suggestions.length > 0 ? suggestions : generateDefaultSuggestions(type),
  };
}

function calculateCost(promptTokens: number, completionTokens: number): number {
  // DeepSeek pricing: $0.14 per 1M input tokens, $0.28 per 1M output tokens
  const inputCost = (promptTokens / 1000000) * 0.14;
  const outputCost = (completionTokens / 1000000) * 0.28;
  return inputCost + outputCost;
}

function calculateMockCost(prompt: string, complexity: string): number {
  const inputTokens = Math.ceil(prompt.length / 4);
  const outputMultiplier = { simple: 1.5, medium: 2, complex: 3 };
  const outputTokens = inputTokens * (outputMultiplier[complexity as keyof typeof outputMultiplier] || 2);
  
  return calculateCost(inputTokens, outputTokens);
}

function generateMockCode(prompt: string, type: string, complexity: string, language: string) {
  const templates = {
    code_generation: {
      code: `// Generated ${language} code for: ${prompt}
export function generatedFunction() {
  // Implementation based on your requirements
  return "Hello, World!";
}`,
      explanation: `Generated ${language} code based on your requirements. The function includes error handling and follows best practices.`,
      suggestions: ['Add input validation', 'Consider async/await pattern', 'Add comprehensive tests'],
    },
    debugging: {
      code: `// Fixed version of the code
export function fixedFunction() {
  // Bug fixes applied:
  // - Added null checks
  // - Fixed async handling
  return "Fixed!";
}`,
      explanation: 'Identified and fixed several issues including null pointer errors and async handling problems.',
      suggestions: ['Add more error handling', 'Consider edge cases', 'Add logging'],
    },
    code_review: {
      code: `// Code review results:
// ✅ Good practices found
// ⚠️  Areas for improvement identified
// 🔧 Suggested fixes provided`,
      explanation: 'Code review completed. Found several areas for improvement including security and performance optimizations.',
      suggestions: ['Improve error handling', 'Add input validation', 'Optimize performance'],
    },
  };

  return templates[type as keyof typeof templates] || templates.code_generation;
}

function generateDefaultExplanation(type: string): string {
  const explanations = {
    code_generation: 'Generated code based on the provided requirements.',
    debugging: 'Analyzed and fixed issues in the provided code.',
    code_review: 'Completed comprehensive code review.',
    optimization: 'Optimized code for better performance.',
    refactoring: 'Refactored code for improved maintainability.',
    testing: 'Created comprehensive test suite.',
  };

  return explanations[type as keyof typeof explanations] || 'Task completed successfully.';
}

function generateDefaultSuggestions(type: string): string[] {
  const suggestions = {
    code_generation: ['Add input validation', 'Include error handling', 'Add documentation'],
    debugging: ['Add logging', 'Include edge case handling', 'Add defensive programming'],
    code_review: ['Follow coding standards', 'Improve naming conventions', 'Add tests'],
    optimization: ['Profile performance', 'Consider caching', 'Optimize algorithms'],
    refactoring: ['Extract common functions', 'Improve readability', 'Reduce complexity'],
    testing: ['Test edge cases', 'Add integration tests', 'Mock external dependencies'],
  };

  return suggestions[type as keyof typeof suggestions] || ['Consider best practices'];
}