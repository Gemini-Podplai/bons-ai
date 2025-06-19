import { NextRequest, NextResponse } from 'next/server';

interface SyncRequest {
  enabled: boolean;
  files?: string[];
  options?: {
    autoSync: boolean;
    conflictResolution: 'manual' | 'auto' | 'cursor-wins' | 'web-wins';
    syncInterval: number; // seconds
  };
}

// Manage Cursor Pro sync
export async function POST(request: NextRequest) {
  try {
    const { enabled, files, options }: SyncRequest = await request.json();

    const cursorApiKey = process.env.CURSOR_API_KEY;

    if (!cursorApiKey) {
      // Mock response for development
      return NextResponse.json({
        success: true,
        message: `Cursor sync ${enabled ? 'enabled' : 'disabled'} (development mode)`,
        syncEnabled: enabled,
        syncedFiles: files || [],
        options: options || {
          autoSync: true,
          conflictResolution: 'manual',
          syncInterval: 5,
        },
        lastSync: new Date(),
      });
    }

    // Real Cursor Pro API call
    try {
      const response = await fetch('https://api.cursor.com/v1/sync/configure', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cursorApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enabled,
          files: files || ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
          options: {
            autoSync: options?.autoSync ?? true,
            conflictResolution: options?.conflictResolution ?? 'manual',
            syncInterval: options?.syncInterval ?? 5,
            watchPatterns: ['src/**/*', 'lib/**/*', 'components/**/*'],
            ignorePatterns: ['node_modules/**/*', '.next/**/*', '*.log'],
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Cursor sync API error: ${response.status}`);
      }

      const data = await response.json();

      return NextResponse.json({
        success: true,
        message: `Cursor sync ${enabled ? 'enabled' : 'disabled'} successfully`,
        syncEnabled: enabled,
        syncedFiles: data.trackedFiles,
        options: data.syncOptions,
        lastSync: data.lastSync,
      });

    } catch (cursorError) {
      console.error('Cursor sync error:', cursorError);
      return NextResponse.json(
        { success: false, error: 'Failed to configure Cursor sync' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Sync configuration error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to configure sync' },
      { status: 500 }
    );
  }
}