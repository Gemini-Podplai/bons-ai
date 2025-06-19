import { NextRequest, NextResponse } from 'next/server';

interface GitCommitRequest {
  message: string;
  files: string[];
  author?: {
    name: string;
    email: string;
  };
}

// Handle Git commit operations
export async function POST(request: NextRequest) {
  try {
    const { message, files, author }: GitCommitRequest = await request.json();

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Commit message is required' },
        { status: 400 }
      );
    }

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No files to commit' },
        { status: 400 }
      );
    }

    // For development, return mock Git commit response
    const mockCommitHash = generateMockCommitHash();
    const mockAuthor = author || { name: 'Bons-AI', email: 'dev@bons-ai.dev' };

    const mockCommit = {
      hash: mockCommitHash,
      message,
      author: mockAuthor.name,
      email: mockAuthor.email,
      date: new Date(),
      filesChanged: files.length,
      insertions: Math.floor(Math.random() * 200) + 50,
      deletions: Math.floor(Math.random() * 50) + 5,
    };

    // Simulate Git operations
    const gitOperations = [
      'git add .',
      `git commit -m "${message}"`,
      'git status',
    ];

    const mockGitOutput = `
Bons-AI Git Integration

Staging files...
${files.map(file => `  added: ${file}`).join('\n')}

Committing changes...
[main ${mockCommitHash.slice(0, 7)}] ${message}
 ${files.length} files changed, ${mockCommit.insertions} insertions(+), ${mockCommit.deletions} deletions(-)

Branch status:
On branch main
Your branch is ahead of 'origin/main' by 1 commit.

Nothing to commit, working tree clean.
`;

    // Track commit for analytics
    const commitAnalytics = {
      linesOfCode: mockCommit.insertions - mockCommit.deletions,
      complexity: files.length > 5 ? 'high' : files.length > 2 ? 'medium' : 'low',
      aiGenerated: files.some(f => f.includes('enhanced-') || f.includes('ai-')),
      studioInvolved: determineInvolvedStudios(files),
    };

    return NextResponse.json({
      success: true,
      commit: mockCommit,
      output: mockGitOutput,
      analytics: commitAnalytics,
      suggestions: generateCommitSuggestions(message, files),
      nextSteps: [
        'Review changes in git log',
        'Push to remote repository',
        'Create pull request if needed',
        'Update documentation',
      ],
    });

  } catch (error) {
    console.error('Git commit error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to commit changes' },
      { status: 500 }
    );
  }
}

function generateMockCommitHash(): string {
  const chars = '0123456789abcdef';
  let hash = '';
  for (let i = 0; i < 40; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

function determineInvolvedStudios(files: string[]): string[] {
  const studios: string[] = [];
  
  files.forEach(file => {
    if (file.includes('research') || file.includes('copyCapy')) {
      studios.push('Research Studio');
    }
    if (file.includes('code') || file.includes('deepseek') || file.includes('cursor')) {
      studios.push('Code Studio');
    }
    if (file.includes('design') || file.includes('ui')) {
      studios.push('Design Studio');
    }
    if (file.includes('build') || file.includes('deploy')) {
      studios.push('Build Studio');
    }
  });

  return [...new Set(studios)];
}

function generateCommitSuggestions(message: string, files: string[]): string[] {
  const suggestions: string[] = [];

  // Analyze commit message
  if (message.length < 10) {
    suggestions.push('Consider a more descriptive commit message');
  }

  if (!message.match(/^(feat|fix|docs|style|refactor|test|chore):/)) {
    suggestions.push('Consider using conventional commit format (feat:, fix:, etc.)');
  }

  // Analyze files
  if (files.length > 10) {
    suggestions.push('Large commit - consider breaking into smaller commits');
  }

  const hasTests = files.some(f => f.includes('test') || f.includes('spec'));
  const hasCode = files.some(f => f.includes('.ts') || f.includes('.tsx'));
  
  if (hasCode && !hasTests) {
    suggestions.push('Consider adding tests for the new code');
  }

  if (files.some(f => f.includes('api'))) {
    suggestions.push('API changes detected - ensure backward compatibility');
  }

  return suggestions;
}