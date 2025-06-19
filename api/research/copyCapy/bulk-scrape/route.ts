import { NextRequest, NextResponse } from 'next/server';

interface BulkScrapeRequest {
  urls: string[];
  config: {
    batchSize: number;
    extractText: boolean;
    extractMetadata: boolean;
    webhook?: string;
  };
}

// Start bulk CopyCapy scraping jobs
export async function POST(request: NextRequest) {
  try {
    const { urls, config }: BulkScrapeRequest = await request.json();

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { success: false, error: 'URLs array is required' },
        { status: 400 }
      );
    }

    // Validate URLs
    const validUrls = [];
    const invalidUrls = [];

    for (const url of urls) {
      try {
        new URL(url);
        validUrls.push(url);
      } catch (error) {
        invalidUrls.push(url);
      }
    }

    if (validUrls.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid URLs provided' },
        { status: 400 }
      );
    }

    const apiKey = process.env.COPYC APY_API_KEY;
    const batchSize = Math.min(config.batchSize || 10, 20); // Limit batch size

    if (!apiKey) {
      // Mock response for development
      const mockJobIds = validUrls.map((url, index) => 
        `job_bulk_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`
      );

      // Simulate delayed completion for each job
      mockJobIds.forEach((jobId, index) => {
        const delay = 5000 + (index * 2000) + Math.random() * 5000; // Staggered completion
        
        setTimeout(async () => {
          try {
            await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/research/copyCapy/webhook`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                jobId,
                status: 'completed',
                data: {
                  content: generateMockBulkContent(validUrls[index]),
                  summary: generateMockBulkSummary(validUrls[index]),
                  metadata: {
                    wordCount: Math.floor(Math.random() * 3000) + 500,
                    lastModified: new Date(),
                    contentType: 'documentation',
                    language: 'en',
                    readability: Math.floor(Math.random() * 3) + 6,
                  },
                },
              }),
            });
          } catch (error) {
            console.error('Mock bulk webhook error:', error);
          }
        }, delay);
      });

      return NextResponse.json({
        success: true,
        jobIds: mockJobIds,
        message: `Bulk scraping started for ${validUrls.length} URLs (development mode)`,
        invalidUrls,
        batchInfo: {
          totalBatches: Math.ceil(validUrls.length / batchSize),
          urlsPerBatch: batchSize,
          estimatedCompletion: new Date(Date.now() + (validUrls.length * 3000)),
        },
      });
    }

    // Real CopyCapy bulk API call
    const jobIds: string[] = [];
    const errors: string[] = [];

    // Process URLs in batches
    for (let i = 0; i < validUrls.length; i += batchSize) {
      const batch = validUrls.slice(i, i + batchSize);
      
      try {
        const response = await fetch('https://api.copyCapy.com/v1/bulk-scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            urls: batch,
            options: {
              extractText: config.extractText,
              extractMetadata: config.extractMetadata,
              respectRobots: true,
              userAgent: 'Bons-AI Research Studio',
              priority: 'normal',
            },
            webhook: config.webhook ? `${process.env.NEXT_PUBLIC_BASE_URL}${config.webhook}` : undefined,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          jobIds.push(...data.jobIds);
        } else {
          errors.push(`Batch ${Math.floor(i / batchSize) + 1} failed: ${response.status}`);
        }
      } catch (error) {
        errors.push(`Batch ${Math.floor(i / batchSize) + 1} error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      // Rate limiting delay between batches
      if (i + batchSize < validUrls.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return NextResponse.json({
      success: jobIds.length > 0,
      jobIds,
      message: `Bulk scraping started for ${jobIds.length} URLs`,
      invalidUrls,
      errors: errors.length > 0 ? errors : undefined,
      batchInfo: {
        totalBatches: Math.ceil(validUrls.length / batchSize),
        successfulBatches: Math.ceil(jobIds.length / batchSize),
        urlsPerBatch: batchSize,
      },
    });

  } catch (error) {
    console.error('Bulk scrape error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to start bulk scraping' },
      { status: 500 }
    );
  }
}

function generateMockBulkContent(url: string): string {
  const domain = new URL(url).hostname;
  
  return `# ${domain} Analysis

## Summary
Automated analysis of ${url} revealing key insights about their platform and approach.

## Key Findings
- **Architecture**: Modern, scalable design patterns
- **Performance**: Optimized for high throughput
- **Security**: Industry-standard practices implemented
- **Documentation**: Comprehensive and well-maintained

## Technical Insights
The platform demonstrates several interesting technical approaches:
1. Microservices architecture with API-first design
2. Comprehensive error handling and logging
3. Efficient caching and rate limiting strategies
4. Well-documented API endpoints with clear examples

## Competitive Analysis
Compared to similar platforms, this solution offers:
- Superior documentation quality
- More flexible API design
- Better cost optimization features
- Enhanced developer experience

## Recommendations
Based on this analysis, we recommend:
1. Adopting similar documentation patterns
2. Implementing comparable error handling
3. Following their API design principles
4. Considering their cost optimization strategies`;
}

function generateMockBulkSummary(url: string): string {
  const domain = new URL(url).hostname;
  return `Analysis of ${domain} showing strong technical architecture, comprehensive documentation, and innovative approaches to cost optimization and developer experience.`;
}