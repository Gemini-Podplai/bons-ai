import { NextRequest, NextResponse } from 'next/server';

// Check CopyCapy job status
export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params;

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.COPYC APY_API_KEY;

    if (!apiKey) {
      // Mock response for development
      const status = Math.random() > 0.3 ? 'completed' : 
                    Math.random() > 0.1 ? 'running' : 'failed';

      if (status === 'completed') {
        return NextResponse.json({
          status: 'completed',
          jobId,
          data: {
            content: generateMockStatusContent(),
            summary: 'Mock analysis completed successfully',
            metadata: {
              wordCount: Math.floor(Math.random() * 2000) + 1000,
              lastModified: new Date(),
              contentType: 'article',
              language: 'en',
              readability: Math.floor(Math.random() * 3) + 7,
            },
          },
          completedAt: new Date(),
          processingTime: Math.floor(Math.random() * 10000) + 5000,
        });
      }

      return NextResponse.json({
        status,
        jobId,
        progress: status === 'running' ? Math.floor(Math.random() * 80) + 10 : 0,
        message: status === 'running' ? 'Processing content...' : 'Job failed',
      });
    }

    // Real CopyCapy API call
    const response = await fetch(`https://api.copyCapy.com/v1/jobs/${jobId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Job not found' },
          { status: 404 }
        );
      }
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({
      status: data.status,
      jobId: data.jobId,
      progress: data.progress,
      data: data.result,
      completedAt: data.completedAt,
      processingTime: data.processingTime,
      error: data.error,
    });

  } catch (error) {
    console.error('Job status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check job status' },
      { status: 500 }
    );
  }
}

function generateMockStatusContent(): string {
  return `# Content Analysis Complete

## Executive Summary
The analysis has been completed successfully, providing comprehensive insights into the source material.

## Key Insights
- **Content Quality**: High-quality, well-structured information
- **Technical Depth**: Comprehensive coverage of technical topics
- **Accessibility**: Well-organized with clear navigation
- **Relevance**: Highly relevant to current development practices

## Detailed Analysis
The content demonstrates several strengths:

### Structure and Organization
- Clear hierarchical organization
- Logical flow of information
- Comprehensive cross-references
- Well-designed navigation

### Technical Coverage
- In-depth API documentation
- Practical implementation examples
- Security best practices
- Performance optimization guidelines

### Developer Experience
- Clear getting started guides
- Comprehensive troubleshooting sections
- Active community engagement
- Regular updates and maintenance

## Recommendations
Based on this analysis, we recommend:
1. Implementing similar documentation patterns
2. Adopting comparable organizational structures
3. Following their approach to developer onboarding
4. Considering their community engagement strategies

## Conclusion
This analysis provides valuable insights that can inform our own platform development and documentation strategies.`;
}