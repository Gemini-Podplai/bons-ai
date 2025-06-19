import { NextRequest, NextResponse } from 'next/server';

interface WebhookPayload {
  jobId: string;
  status: 'completed' | 'failed' | 'cancelled';
  data?: {
    content: string;
    summary: string;
    metadata: {
      wordCount: number;
      lastModified: Date;
      contentType: string;
      language: string;
      readability: number;
    };
  };
  error?: string;
  completedAt?: Date;
  processingTime?: number;
}

// Handle CopyCapy webhook notifications
export async function POST(request: NextRequest) {
  try {
    const payload: WebhookPayload = await request.json();
    
    // Verify webhook signature if available
    const signature = request.headers.get('x-copyCapy-signature');
    if (signature && process.env.COPYC APY_WEBHOOK_SECRET) {
      // Verify webhook signature for security
      // Implementation would depend on CopyCapy's signature method
    }

    // Log webhook receipt
    console.log(`Webhook received for job ${payload.jobId}: ${payload.status}`);

    // Process the webhook based on status
    switch (payload.status) {
      case 'completed':
        await handleCompletedJob(payload);
        break;
      
      case 'failed':
        await handleFailedJob(payload);
        break;
      
      case 'cancelled':
        await handleCancelledJob(payload);
        break;
      
      default:
        console.warn(`Unknown webhook status: ${payload.status}`);
    }

    // Send real-time update to connected clients
    await notifyClients(payload);

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
      jobId: payload.jobId,
      status: payload.status,
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}

async function handleCompletedJob(payload: WebhookPayload) {
  try {
    // Store the completed job data
    // In production, this would save to database
    console.log(`Job ${payload.jobId} completed successfully`);
    
    if (payload.data) {
      // Process the scraped content
      await processScrapedContent(payload.jobId, payload.data);
      
      // Update Mem0 with the new research data
      await uploadToMem0(payload.data);
      
      // Generate AI insights if enabled
      await generateAIInsights(payload.data);
    }
    
  } catch (error) {
    console.error(`Error handling completed job ${payload.jobId}:`, error);
  }
}

async function handleFailedJob(payload: WebhookPayload) {
  try {
    console.log(`Job ${payload.jobId} failed: ${payload.error}`);
    
    // Log the failure for analysis
    // In production, this would update the database and notify users
    
    // Attempt retry if appropriate
    await considerRetry(payload.jobId, payload.error);
    
  } catch (error) {
    console.error(`Error handling failed job ${payload.jobId}:`, error);
  }
}

async function handleCancelledJob(payload: WebhookPayload) {
  try {
    console.log(`Job ${payload.jobId} was cancelled`);
    
    // Clean up any resources
    // Update status in database
    
  } catch (error) {
    console.error(`Error handling cancelled job ${payload.jobId}:`, error);
  }
}

async function processScrapedContent(jobId: string, data: WebhookPayload['data']) {
  if (!data) return;

  try {
    // Extract key information
    const insights = await extractInsights(data.content);
    
    // Categorize content
    const category = categorizeContent(data.content, data.metadata);
    
    // Update search index
    await updateSearchIndex(jobId, data, insights, category);
    
    console.log(`Processed content for job ${jobId}: ${data.metadata.wordCount} words`);
    
  } catch (error) {
    console.error(`Error processing content for job ${jobId}:`, error);
  }
}

async function extractInsights(content: string): Promise<string[]> {
  // Use AI to extract key insights from the content
  try {
    const response = await fetch('/api/research/analyze-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content,
        analysisType: 'insights',
      }),
    });

    if (response.ok) {
      const result = await response.json();
      return result.insights || [];
    }
  } catch (error) {
    console.error('Failed to extract insights:', error);
  }

  return [];
}

function categorizeContent(content: string, metadata: any): string {
  // Simple categorization based on content and metadata
  const lowerContent = content.toLowerCase();
  
  if (lowerContent.includes('api') && lowerContent.includes('documentation')) {
    return 'api-documentation';
  }
  
  if (lowerContent.includes('tutorial') || lowerContent.includes('guide')) {
    return 'tutorial';
  }
  
  if (metadata.contentType === 'documentation') {
    return 'technical-documentation';
  }
  
  return 'general-content';
}

async function updateSearchIndex(
  jobId: string, 
  data: WebhookPayload['data'], 
  insights: string[], 
  category: string
) {
  // Update search index for future queries
  // In production, this would use Elasticsearch or similar
  console.log(`Updating search index for job ${jobId} in category ${category}`);
}

async function uploadToMem0(data: WebhookPayload['data']) {
  if (!data) return;

  try {
    // Upload to Mem0 for AI memory
    const response = await fetch('/api/mem0/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: data.content,
        summary: data.summary,
        metadata: data.metadata,
        type: 'research-content',
      }),
    });

    if (response.ok) {
      console.log('Successfully uploaded to Mem0');
    }
  } catch (error) {
    console.error('Failed to upload to Mem0:', error);
  }
}

async function generateAIInsights(data: WebhookPayload['data']) {
  if (!data) return;

  try {
    // Generate AI insights using the enhanced router
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `Analyze this research content and provide key insights: ${data.content.slice(0, 2000)}...`,
        complexity: 'medium',
        variant: 'research',
      }),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('AI insights generated:', result.response.slice(0, 100) + '...');
    }
  } catch (error) {
    console.error('Failed to generate AI insights:', error);
  }
}

async function considerRetry(jobId: string, error?: string) {
  // Implement retry logic for failed jobs
  if (error && (error.includes('timeout') || error.includes('rate limit'))) {
    console.log(`Considering retry for job ${jobId} due to: ${error}`);
    // Implement retry scheduling
  }
}

async function notifyClients(payload: WebhookPayload) {
  // Send real-time updates to connected clients via WebSocket or Server-Sent Events
  // This would notify the frontend of job completion
  console.log(`Notifying clients of job ${payload.jobId} status: ${payload.status}`);
  
  // In production, this would use WebSocket connections or similar real-time mechanism
}