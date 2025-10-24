import express, { Request, Response } from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Storage directory for text files
const TEXT_DIR = path.join(__dirname, '../../storage/texts');

/**
 * GET /api/ai/realtime-test
 * Simple test endpoint to verify OpenAI Realtime API connection
 */
router.get('/realtime-test', async (req: Request, res: Response) => {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: 'OpenAI API key not configured',
        details: 'OPENAI_API_KEY environment variable is missing'
      });
    }

    const model = process.env.OPENAI_REALTIME_MODEL || 'gpt-4o-realtime-preview-2024-10-01';
    const url = `wss://api.openai.com/v1/realtime?model=${model}`;

    // Create test WebSocket connection
    const ws = new WebSocket(url, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'OpenAI-Beta': 'realtime=v1'
      }
    });

    ws.on('open', () => {
      console.log('[Realtime API] Test connection successful!');
      ws.close();

      res.json({
        success: true,
        message: 'Successfully connected to OpenAI Realtime API',
        model
      });
    });

    ws.on('error', (error) => {
      console.error('[Realtime API] Connection error:', error);
      res.status(500).json({
        error: 'Failed to connect to OpenAI Realtime API',
        details: error.message
      });
    });

    // Timeout after 10 seconds
    setTimeout(() => {
      if (ws.readyState !== WebSocket.CLOSED && !res.headersSent) {
        ws.close();
        res.status(500).json({
          error: 'Connection timeout',
          details: 'Could not establish connection within 10 seconds'
        });
      }
    }, 10000);

  } catch (error) {
    console.error('[Realtime API] Test error:', error);
    res.status(500).json({
      error: 'Failed to test Realtime API',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Helper function to load document context
 */
function loadDocumentContext(textFileName: string): string | null {
  try {
    const filePath = path.join(TEXT_DIR, textFileName);

    if (!fs.existsSync(filePath)) {
      console.error(`Text file not found: ${textFileName}`);
      return null;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    return content;
  } catch (error) {
    console.error('Error loading document context:', error);
    return null;
  }
}

/**
 * WebSocket endpoint for Realtime API
 * This will be upgraded to WebSocket by express-ws or similar
 */
/**
 * Helper function to handle WebSocket connection
 */
function handleRealtimeConnection(clientWs: WebSocket, request: any, modality: 'text' | 'voice') {
  const modeLabel = modality === 'text' ? 'Text Chat' : 'Voice Chat';
  console.log(`[${modeLabel}] Client connected`);

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    clientWs.send(JSON.stringify({
      type: 'error',
      message: 'OpenAI API key not configured'
    }));
    clientWs.close();
    return;
  }

  // Parse query parameters
  const url = new URL(request.url, `http://${request.headers.host}`);
  const textFileName = url.searchParams.get('textFileName');
  const documentName = url.searchParams.get('documentName') || 'Unknown Document';

  // Load document context if provided (optional)
  let documentContext = '';
  if (textFileName) {
    const content = loadDocumentContext(textFileName);
    if (content) {
      documentContext = content;
      console.log(`[${modeLabel}] Loaded document: ${textFileName} (${content.length} chars)`);
    }
  }

  // Build system instructions
  let instructions = 'You are a helpful AI assistant.';
  if (documentContext) {
    instructions = `You are an AI assistant helping users understand and analyze documents.

Document Context:
---
Title: ${documentName}
Content:
${documentContext}
---

Answer the user's questions about this document. Be concise, accurate, and cite specific parts of the document when relevant.`;
  }

  try {
    // Create WebSocket connection to OpenAI
    const model = process.env.OPENAI_REALTIME_MODEL || 'gpt-4o-realtime-preview-2024-10-01';
    const openaiUrl = `wss://api.openai.com/v1/realtime?model=${model}`;

    const openaiWs = new WebSocket(openaiUrl, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'OpenAI-Beta': 'realtime=v1'
      }
    });

    openaiWs.on('open', () => {
      console.log(`[${modeLabel}] Connected to OpenAI`);

      // Configure session based on modality
      const sessionConfig: any = {
        instructions
      };

      if (modality === 'text') {
        // Text-only mode
        sessionConfig.modalities = ['text'];
      } else {
        // Voice mode with audio
        sessionConfig.modalities = ['text', 'audio'];
        sessionConfig.voice = 'alloy';
        sessionConfig.input_audio_format = 'pcm16';
        sessionConfig.output_audio_format = 'pcm16';
        sessionConfig.input_audio_transcription = { model: 'whisper-1' };
        sessionConfig.turn_detection = {
          type: 'server_vad',
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 1000
        };
      }

      openaiWs.send(JSON.stringify({
        type: 'session.update',
        session: sessionConfig
      }));

      // Notify client
      clientWs.send(JSON.stringify({
        type: 'connected',
        message: `Connected to OpenAI Realtime API (${modeLabel})`,
        hasDocumentContext: !!documentContext
      }));
    });

    // Forward messages from client to OpenAI
    clientWs.on('message', (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        console.log(`[${modeLabel}] Client message:`, message.type);

        if (openaiWs.readyState === WebSocket.OPEN) {
          openaiWs.send(JSON.stringify(message));
        }
      } catch (error) {
        console.error(`[${modeLabel}] Error parsing client message:`, error);
      }
    });

    // Forward messages from OpenAI to client
    openaiWs.on('message', (data: Buffer) => {
      try {
        if (clientWs.readyState === WebSocket.OPEN) {
          clientWs.send(data);
        }
      } catch (error) {
        console.error(`[${modeLabel}] Error forwarding message:`, error);
      }
    });

    // Handle OpenAI errors
    openaiWs.on('error', (error: Error) => {
      console.error(`[${modeLabel}] OpenAI error:`, error);
      clientWs.send(JSON.stringify({
        type: 'error',
        message: error.message
      }));
    });

    // Handle OpenAI close
    openaiWs.on('close', () => {
      console.log(`[${modeLabel}] OpenAI connection closed`);
      clientWs.close();
    });

    // Handle client disconnect
    clientWs.on('close', () => {
      console.log(`[${modeLabel}] Client disconnected`);
      if (openaiWs.readyState === WebSocket.OPEN) {
        openaiWs.close();
      }
    });

  } catch (error) {
    console.error(`[${modeLabel}] Error setting up connection:`, error);
    clientWs.send(JSON.stringify({
      type: 'error',
      message: 'Failed to establish OpenAI connection'
    }));
    clientWs.close();
  }
}

export function setupRealtimeWebSocket(server: any) {
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request: any, socket: any, head: any) => {
    const pathname = new URL(request.url, `http://${request.headers.host}`).pathname;

    if (pathname === '/api/ai/text') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        handleRealtimeConnection(ws, request, 'text');
      });
    } else if (pathname === '/api/ai/voice') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        handleRealtimeConnection(ws, request, 'voice');
      });
    } else if (pathname === '/api/ai/realtime') {
      // Keep old endpoint for backward compatibility with AIChat component
      wss.handleUpgrade(request, socket, head, (ws) => {
        handleRealtimeConnection(ws, request, 'text');
      });
    } else {
      socket.destroy();
    }
  });

  console.log('[Realtime API] WebSocket server initialized');
  console.log('  - /api/ai/text (text-only chat)');
  console.log('  - /api/ai/voice (voice chat with audio)');
  console.log('  - /api/ai/realtime (legacy, text-only)');
}

export default router;
