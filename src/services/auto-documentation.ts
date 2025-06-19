/**
 * Auto-Documentation System
 * Uses CopyCapy to scrape and transform service docs into neurodivergent-friendly format
 */

export interface DocumentationSource {
  name: string;
  url: string;
  selector?: string;
  type: 'api' | 'guide' | 'reference';
  lastUpdated?: Date;
}

export interface ProcessedDocumentation {
  id: string;
  title: string;
  content: string;
  summary: string;
  sections: DocumentationSection[];
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedReadTime: number;
  neurodivergentOptimized: boolean;
  lastProcessed: Date;
}

export interface DocumentationSection {
  id: string;
  title: string;
  content: string;
  type: 'overview' | 'setup' | 'example' | 'troubleshooting' | 'reference';
  visualAids: VisualAid[];
  breakReminders: boolean;
}

export interface VisualAid {
  type: 'diagram' | 'screenshot' | 'flowchart' | 'checklist';
  description: string;
  url?: string;
  generated: boolean;
}

export class AutoDocumentationSystem {
  private sources: DocumentationSource[] = [
    // AI Services
    { name: 'Google AI Studio', url: 'https://ai.google.dev/docs', type: 'api' },
    { name: 'Vertex AI', url: 'https://cloud.google.com/vertex-ai/docs', type: 'api' },
    { name: 'OpenRouter', url: 'https://openrouter.ai/docs', type: 'api' },
    { name: 'DeepSeek', url: 'https://api-docs.deepseek.com/', type: 'api' },
    
    // Development Tools
    { name: 'Scrapybara', url: 'https://scrapybara.com/docs', type: 'guide' },
    { name: 'Cursor', url: 'https://cursor.sh/docs', type: 'guide' },
    { name: 'Penpot', url: 'https://help.penpot.app/', type: 'guide' },
    
    // Integration Services
    { name: 'Pipedream', url: 'https://pipedream.com/docs', type: 'reference' },
    { name: 'GitHub API', url: 'https://docs.github.com/en/rest', type: 'api' },
    { name: 'Mem0', url: 'https://docs.mem0.ai/', type: 'api' },
    
    // Component Libraries
    { name: 'v0.dev', url: 'https://v0.dev/docs', type: 'guide' },
    { name: 'TailGrids', url: 'https://tailgrids.com/docs', type: 'guide' }
  ];

  async scrapeAllDocumentation(): Promise<ProcessedDocumentation[]> {
    const results: ProcessedDocumentation[] = [];
    
    for (const source of this.sources) {
      try {
        const processed = await this.scrapeAndProcess(source);
        if (processed) {
          results.push(processed);
          await this.uploadToMem0(processed);
        }
      } catch (error) {
        console.error(`Failed to process ${source.name}:`, error);
      }
      
      // Delay between requests to be respectful
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    return results;
  }

  private async scrapeAndProcess(source: DocumentationSource): Promise<ProcessedDocumentation | null> {
    // Use CopyCapy to scrape the documentation
    const scrapeResponse = await fetch('/api/research/copyCapy/scrape', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: source.url,
        selector: source.selector || 'main, article, .content, .documentation',
        options: {
          includeImages: true,
          followLinks: true,
          maxDepth: 2
        }
      })
    });

    if (!scrapeResponse.ok) {
      throw new Error(`Failed to scrape ${source.name}`);
    }

    const scrapeData = await scrapeResponse.json();
    
    // Transform into neurodivergent-friendly format
    const processed = await this.transformToNeurodivergentFormat(scrapeData, source);
    
    return processed;
  }

  private async transformToNeurodivergentFormat(
    rawContent: any, 
    source: DocumentationSource
  ): Promise<ProcessedDocumentation> {
    // Use AI to transform the content
    const transformResponse = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `Transform this documentation into a neurodivergent-friendly format:

REQUIREMENTS:
- Clear, simple language (avoid jargon)
- Step-by-step instructions with checkboxes
- Visual cues and section breaks
- Executive function support (clear next steps)
- Sensory considerations (not overwhelming)
- Break reminders every 10 minutes of content
- Multiple learning styles (visual, auditory, kinesthetic)

RAW CONTENT:
${JSON.stringify(rawContent, null, 2)}

Transform this into sections with clear headings, examples, and practical steps.`,
        studio: 'research',
        options: {
          model: 'gemini-2.5-pro',
          maxTokens: 8000
        }
      })
    });

    const aiResponse = await transformResponse.json();
    const transformedContent = aiResponse.response;

    // Parse the transformed content into structured format
    const sections = this.parseIntoSections(transformedContent);
    
    return {
      id: `${source.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      title: `${source.name} - Neurodivergent-Friendly Guide`,
      content: transformedContent,
      summary: this.generateSummary(transformedContent),
      sections,
      tags: this.extractTags(source, transformedContent),
      difficulty: this.assessDifficulty(transformedContent),
      estimatedReadTime: this.calculateReadTime(transformedContent),
      neurodivergentOptimized: true,
      lastProcessed: new Date()
    };
  }

  private parseIntoSections(content: string): DocumentationSection[] {
    const sections: DocumentationSection[] = [];
    const lines = content.split('\n');
    let currentSection: Partial<DocumentationSection> | null = null;
    
    for (const line of lines) {
      if (line.startsWith('##')) {
        // Save previous section
        if (currentSection && currentSection.title && currentSection.content) {
          sections.push(currentSection as DocumentationSection);
        }
        
        // Start new section
        currentSection = {
          id: line.slice(2).trim().toLowerCase().replace(/\s+/g, '-'),
          title: line.slice(2).trim(),
          content: '',
          type: this.detectSectionType(line),
          visualAids: [],
          breakReminders: true
        };
      } else if (currentSection) {
        currentSection.content += line + '\n';
      }
    }
    
    // Add final section
    if (currentSection && currentSection.title && currentSection.content) {
      sections.push(currentSection as DocumentationSection);
    }
    
    return sections;
  }

  private detectSectionType(title: string): DocumentationSection['type'] {
    const lower = title.toLowerCase();
    if (lower.includes('overview') || lower.includes('introduction')) return 'overview';
    if (lower.includes('setup') || lower.includes('install') || lower.includes('getting started')) return 'setup';
    if (lower.includes('example') || lower.includes('tutorial') || lower.includes('walkthrough')) return 'example';
    if (lower.includes('troubleshoot') || lower.includes('common issues') || lower.includes('faq')) return 'troubleshooting';
    return 'reference';
  }

  private generateSummary(content: string): string {
    const sentences = content.split('.').slice(0, 3);
    return sentences.join('.') + '.';
  }

  private extractTags(source: DocumentationSource, content: string): string[] {
    const tags = [source.name.toLowerCase(), source.type];
    
    // Extract additional tags from content
    const contentLower = content.toLowerCase();
    if (contentLower.includes('api')) tags.push('api');
    if (contentLower.includes('authentication')) tags.push('auth');
    if (contentLower.includes('webhook')) tags.push('webhooks');
    if (contentLower.includes('rate limit')) tags.push('rate-limiting');
    if (contentLower.includes('pricing')) tags.push('pricing');
    
    return Array.from(new Set(tags));
  }

  private assessDifficulty(content: string): 'beginner' | 'intermediate' | 'advanced' {
    const contentLower = content.toLowerCase();
    let complexity = 0;
    
    // Increase complexity for technical terms
    if (contentLower.includes('oauth')) complexity += 2;
    if (contentLower.includes('webhook')) complexity += 2;
    if (contentLower.includes('regex')) complexity += 3;
    if (contentLower.includes('jwt')) complexity += 3;
    if (contentLower.includes('encryption')) complexity += 3;
    
    // Increase complexity for advanced concepts
    const advancedTerms = ['microservice', 'kubernetes', 'docker', 'serverless', 'graphql'];
    for (const term of advancedTerms) {
      if (contentLower.includes(term)) complexity += 2;
    }
    
    if (complexity >= 8) return 'advanced';
    if (complexity >= 4) return 'intermediate';
    return 'beginner';
  }

  private calculateReadTime(content: string): number {
    const words = content.split(/\s+/).length;
    const wordsPerMinute = 200; // Average reading speed
    return Math.ceil(words / wordsPerMinute);
  }

  private async uploadToMem0(doc: ProcessedDocumentation): Promise<void> {
    try {
      await fetch('/api/memory/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: doc.id,
          content: doc.content,
          metadata: {
            title: doc.title,
            tags: doc.tags,
            difficulty: doc.difficulty,
            type: 'documentation',
            neurodivergentOptimized: doc.neurodivergentOptimized,
            sections: doc.sections.map(s => ({ id: s.id, title: s.title, type: s.type }))
          }
        })
      });
    } catch (error) {
      console.error('Failed to upload to Mem0:', error);
    }
  }

  async startScheduledScraping(): Promise<void> {
    // Run documentation scraping every 12 hours
    const runScraping = async () => {
      console.log('Starting scheduled documentation scraping...');
      const results = await this.scrapeAllDocumentation();
      console.log(`Processed ${results.length} documentation sources`);
    };

    // Run immediately
    await runScraping();
    
    // Schedule every 12 hours
    setInterval(runScraping, 12 * 60 * 60 * 1000);
  }

  async searchDocumentation(query: string, filters?: {
    difficulty?: string;
    type?: string;
    tags?: string[];
  }): Promise<ProcessedDocumentation[]> {
    const searchResponse = await fetch('/api/memory/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        filters: {
          type: 'documentation',
          ...filters
        }
      })
    });

    if (!searchResponse.ok) {
      throw new Error('Failed to search documentation');
    }

    return searchResponse.json();
  }
}