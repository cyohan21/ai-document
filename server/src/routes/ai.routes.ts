import express, { Request, Response } from 'express';
import { WebSocketServer, WebSocket } from 'ws';

const router = express.Router();

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
 * WebSocket endpoint for Realtime API
 * This will be upgraded to WebSocket by express-ws or similar
 */
/**
 * Helper function to handle WebSocket connection
 */
function handleRealtimeConnection(clientWs: WebSocket, request: any, modality: 'text' | 'voice') {
  const modeLabel = modality === 'text' ? 'Text Chat' : 'Voice Chat';
  console.log(`[${modeLabel}] Client connected`);

  // Parse query parameters
  const url = new URL(request.url, `http://${request.headers.host}`);

  // Get API key from query parameter (ephemeral - provided by client)
  const apiKey = url.searchParams.get('apiKey');
  const documentText = url.searchParams.get('documentText');
  const documentName = url.searchParams.get('documentName') || 'Unknown Document';

  // Detailed logging for debugging
  console.log(`\n[${modeLabel}] ========== CONNECTION ATTEMPT ==========`);
  console.log(`[${modeLabel}] Request URL: ${request.url}`);
  console.log(`[${modeLabel}] API Key received: ${apiKey ? 'YES' : 'NO'}`);
  if (apiKey) {
    console.log(`[${modeLabel}] API Key length: ${apiKey.length}`);
    console.log(`[${modeLabel}] API Key starts with: ${apiKey.substring(0, 8)}...`);
    console.log(`[${modeLabel}] API Key ends with: ...${apiKey.substring(apiKey.length - 8)}`);
    console.log(`[${modeLabel}] API Key format check: starts with 'sk-' = ${apiKey.startsWith('sk-')}`);
  }
  console.log(`[${modeLabel}] Document: ${documentName}`);
  console.log(`[${modeLabel}] ===========================================\n`);

  // Validate API key is provided
  if (!apiKey) {
    console.error(`[${modeLabel}] ❌ ERROR: No API key provided`);
    clientWs.send(JSON.stringify({
      type: 'error',
      message: 'OpenAI API key not provided. Please enter your API key to continue.',
      code: 'NO_API_KEY'
    }));
    clientWs.close();
    return;
  }

  // Validate API key format
  if (!apiKey.startsWith('sk-')) {
    console.error(`[${modeLabel}] ❌ ERROR: Invalid OpenAI API key format`);
    console.error(`[${modeLabel}] Received key: "${apiKey.substring(0, 20)}..."`);
    clientWs.send(JSON.stringify({
      type: 'error',
      message: 'Invalid OpenAI API key format. API keys should start with "sk-".',
      code: 'INVALID_API_KEY'
    }));
    clientWs.close();
    return;
  }

  console.log(`[${modeLabel}] ✅ API Key validation passed`);

  console.log(`[${modeLabel}] Request params:`, {
    documentName,
    documentTextLength: documentText ? documentText.length : 0
  });

  // Use document context from query parameter (directly from localStorage)
  let documentContext = '';
  if (documentText) {
    documentContext = documentText;
    console.log(`[${modeLabel}] Loaded document: ${documentName} (${documentText.length} chars)`);
  } else {
    console.log(`[${modeLabel}] No document text provided - general chat mode`);
  }

  // Build system instructions following OpenAI Realtime prompting guide
  let instructions = 'You are a helpful AI assistant. Keep all responses to 3-4 sentences maximum.';
  if (documentContext) {
    instructions = `# Role & Objective
You are an expert document analysis assistant. Your primary goal is to help users deeply understand and extract insights from their documents. Success means providing accurate, relevant, and actionable information based solely on the document content.

# Personality & Tone
- Speak clearly and conversationally
- Be professional yet approachable
- Show confidence in your knowledge of the document
- Use natural pauses and varied inflection
- Avoid robotic or repetitive phrasing - vary your responses

# Context
You have full access to the following document:

---
DOCUMENT TITLE: ${documentName}

DOCUMENT CONTENT:
${documentContext}
---

# Instructions / Rules
- **CRITICAL: Keep ALL responses to 3-4 sentences maximum. This is the most important rule.**
- Be extremely concise and direct in your answers
- ALWAYS base your answers on the document content provided above
- Cite specific sections, quotes, or details from the document when answering
- If asked about something NOT in the document, clearly state: "That information is not mentioned in this document"
- If you're unsure about an interpretation, acknowledge it and offer the most likely meaning
- NEVER invent or assume information that isn't in the document
- Break long explanations into multiple short exchanges - wait for user follow-up instead of over-explaining

# Conversation Flow
1. First interaction: Brief greeting (1-2 sentences), acknowledge document
2. For questions: Answer directly in 3-4 sentences max
3. For follow-ups: Build on context but still keep it brief
4. Never provide lengthy explanations - users can always ask for more details

# Safety & Escalation
- If asked to perform actions outside document analysis (like writing code, accessing external info), politely redirect to the document content
- If document contains sensitive/personal information, acknowledge it professionally without dwelling on it
- Stay focused on helping users understand THIS specific document`;
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
      console.log(`[${modeLabel}] Has document context:`, !!documentContext);
      console.log(`[${modeLabel}] Instructions length:`, instructions.length);

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

      let errorMessage = 'Failed to connect to OpenAI. Please try again.';
      let errorCode = 'OPENAI_ERROR';

      // Check for specific error types
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        errorMessage = 'Invalid OpenAI API key. Please check your API key and try again.';
        errorCode = 'INVALID_API_KEY';
      } else if (error.message.includes('429') || error.message.includes('rate limit')) {
        errorMessage = 'OpenAI rate limit exceeded. Please try again later.';
        errorCode = 'RATE_LIMIT';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Connection to OpenAI timed out. Please check your internet connection.';
        errorCode = 'TIMEOUT';
      }

      clientWs.send(JSON.stringify({
        type: 'error',
        message: errorMessage,
        code: errorCode
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
