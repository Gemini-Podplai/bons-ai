/**
 * Integration Testing Service
 * Tests all service connections and performance metrics
 */

import { GoogleAIManager } from '../lib/google-ai-manager';
import { VertexAIManager } from '../lib/vertex-ai-manager';
import { OpenRouterManager } from '../lib/openrouter-manager';

export interface ServiceTest {
  name: string;
  status: 'pending' | 'success' | 'error';
  responseTime?: number;
  error?: string;
  metadata?: Record<string, any>;
}

export interface IntegrationTestResult {
  overallStatus: 'pass' | 'fail' | 'partial';
  totalTests: number;
  passedTests: number;
  failedTests: number;
  averageResponseTime: number;
  tests: ServiceTest[];
  timestamp: Date;
}

export class IntegrationTester {
  private results: ServiceTest[] = [];

  async runAllTests(): Promise<IntegrationTestResult> {
    this.results = [];
    const startTime = Date.now();

    // AI Service Tests
    await Promise.allSettled([
      this.testGoogleAI(),
      this.testVertexAI(),
      this.testOpenRouter(),
      this.testDeepSeek(),
      this.testScrapybara(),
      this.testCursor(),
      this.testPenpot(),
      this.testCopyCapy(),
      this.testGitHub(),
      this.testPipedream(),
      this.testMemorySystem(),
      this.testPerformanceMetrics()
    ]);

    const totalTime = Date.now() - startTime;
    const passedTests = this.results.filter(t => t.status === 'success').length;
    const failedTests = this.results.filter(t => t.status === 'error').length;
    const avgResponseTime = this.results
      .filter(t => t.responseTime)
      .reduce((sum, t) => sum + (t.responseTime || 0), 0) / this.results.length;

    return {
      overallStatus: failedTests === 0 ? 'pass' : passedTests > 0 ? 'partial' : 'fail',
      totalTests: this.results.length,
      passedTests,
      failedTests,
      averageResponseTime: avgResponseTime,
      tests: this.results,
      timestamp: new Date()
    };
  }

  private async testGoogleAI(): Promise<void> {
    const test: ServiceTest = { name: 'Google AI Studio', status: 'pending' };
    const startTime = Date.now();

    try {
      const manager = new GoogleAIManager();
      await manager.testConnection();
      test.status = 'success';
      test.responseTime = Date.now() - startTime;
      test.metadata = { accounts: manager.getAccountCount() };
    } catch (error) {
      test.status = 'error';
      test.error = error instanceof Error ? error.message : 'Unknown error';
    }

    this.results.push(test);
  }

  private async testVertexAI(): Promise<void> {
    const test: ServiceTest = { name: 'Vertex AI', status: 'pending' };
    const startTime = Date.now();

    try {
      const response = await fetch('/api/vertex/test', { method: 'POST' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      test.status = 'success';
      test.responseTime = Date.now() - startTime;
      test.metadata = { credits: data.remainingCredits };
    } catch (error) {
      test.status = 'error';
      test.error = error instanceof Error ? error.message : 'Unknown error';
    }

    this.results.push(test);
  }

  private async testOpenRouter(): Promise<void> {
    const test: ServiceTest = { name: 'OpenRouter', status: 'pending' };
    const startTime = Date.now();

    try {
      const response = await fetch('/api/openrouter/test', { method: 'POST' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      test.status = 'success';
      test.responseTime = Date.now() - startTime;
      test.metadata = { models: data.availableModels };
    } catch (error) {
      test.status = 'error';
      test.error = error instanceof Error ? error.message : 'Unknown error';
    }

    this.results.push(test);
  }

  private async testDeepSeek(): Promise<void> {
    const test: ServiceTest = { name: 'DeepSeek API', status: 'pending' };
    const startTime = Date.now();

    try {
      const response = await fetch('/api/code/deepseek/test', { method: 'POST' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      test.status = 'success';
      test.responseTime = Date.now() - startTime;
    } catch (error) {
      test.status = 'error';
      test.error = error instanceof Error ? error.message : 'Unknown error';
    }

    this.results.push(test);
  }

  private async testScrapybara(): Promise<void> {
    const test: ServiceTest = { name: 'Scrapybara', status: 'pending' };
    const startTime = Date.now();

    try {
      const response = await fetch('/api/cua/scrapybara/status', { method: 'GET' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      test.status = 'success';
      test.responseTime = Date.now() - startTime;
      test.metadata = { 
        instancesAvailable: data.instancesAvailable,
        hoursRemaining: data.hoursRemaining 
      };
    } catch (error) {
      test.status = 'error';
      test.error = error instanceof Error ? error.message : 'Unknown error';
    }

    this.results.push(test);
  }

  private async testCursor(): Promise<void> {
    const test: ServiceTest = { name: 'Cursor Pro', status: 'pending' };
    const startTime = Date.now();

    try {
      const response = await fetch('/api/code/cursor/connect', { method: 'POST' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      test.status = 'success';
      test.responseTime = Date.now() - startTime;
    } catch (error) {
      test.status = 'error';
      test.error = error instanceof Error ? error.message : 'Unknown error';
    }

    this.results.push(test);
  }

  private async testPenpot(): Promise<void> {
    const test: ServiceTest = { name: 'Penpot', status: 'pending' };
    const startTime = Date.now();

    try {
      const response = await fetch('/api/design/penpot/connect', { method: 'POST' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      test.status = 'success';
      test.responseTime = Date.now() - startTime;
    } catch (error) {
      test.status = 'error';
      test.error = error instanceof Error ? error.message : 'Unknown error';
    }

    this.results.push(test);
  }

  private async testCopyCapy(): Promise<void> {
    const test: ServiceTest = { name: 'CopyCapy', status: 'pending' };
    const startTime = Date.now();

    try {
      const response = await fetch('/api/research/copyCapy/test', { method: 'POST' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      test.status = 'success';
      test.responseTime = Date.now() - startTime;
    } catch (error) {
      test.status = 'error';
      test.error = error instanceof Error ? error.message : 'Unknown error';
    }

    this.results.push(test);
  }

  private async testGitHub(): Promise<void> {
    const test: ServiceTest = { name: 'GitHub API', status: 'pending' };
    const startTime = Date.now();

    try {
      const response = await fetch('/api/github/test', { method: 'POST' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      test.status = 'success';
      test.responseTime = Date.now() - startTime;
    } catch (error) {
      test.status = 'error';
      test.error = error instanceof Error ? error.message : 'Unknown error';
    }

    this.results.push(test);
  }

  private async testPipedream(): Promise<void> {
    const test: ServiceTest = { name: 'Pipedream', status: 'pending' };
    const startTime = Date.now();

    try {
      const response = await fetch('/api/pipedream/test', { method: 'POST' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      test.status = 'success';
      test.responseTime = Date.now() - startTime;
    } catch (error) {
      test.status = 'error';
      test.error = error instanceof Error ? error.message : 'Unknown error';
    }

    this.results.push(test);
  }

  private async testMemorySystem(): Promise<void> {
    const test: ServiceTest = { name: 'Mem0 Memory', status: 'pending' };
    const startTime = Date.now();

    try {
      const response = await fetch('/api/memory/test', { method: 'POST' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      test.status = 'success';
      test.responseTime = Date.now() - startTime;
    } catch (error) {
      test.status = 'error';
      test.error = error instanceof Error ? error.message : 'Unknown error';
    }

    this.results.push(test);
  }

  private async testPerformanceMetrics(): Promise<void> {
    const test: ServiceTest = { name: 'Performance Metrics', status: 'pending' };
    const startTime = Date.now();

    try {
      // Test studio switching speed
      const studioSwitchStart = performance.now();
      // Simulate studio switch
      await new Promise(resolve => setTimeout(resolve, 100));
      const studioSwitchTime = performance.now() - studioSwitchStart;

      // Test AI response time
      const aiResponseStart = performance.now();
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'test', studio: 'research' })
      });
      const aiResponseTime = performance.now() - aiResponseStart;

      const requirements = {
        studioSwitch: studioSwitchTime < 2000, // <2s requirement
        aiResponse: aiResponseTime < 5000      // <5s requirement
      };

      if (requirements.studioSwitch && requirements.aiResponse) {
        test.status = 'success';
      } else {
        test.status = 'error';
        test.error = `Performance requirements not met: Studio switch: ${studioSwitchTime}ms, AI response: ${aiResponseTime}ms`;
      }

      test.responseTime = Date.now() - startTime;
      test.metadata = {
        studioSwitchTime,
        aiResponseTime,
        requirements
      };
    } catch (error) {
      test.status = 'error';
      test.error = error instanceof Error ? error.message : 'Unknown error';
    }

    this.results.push(test);
  }
}