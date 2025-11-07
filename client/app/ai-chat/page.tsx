"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

function TextChatContent() {
  const searchParams = useSearchParams();
  const documentName = searchParams.get('documentName');
  const textFileName = searchParams.get('textFileName');

  // Build the voice chat URL with query params
  const voiceChatUrl = `/ai-voice${documentName ? `?documentName=${encodeURIComponent(documentName)}` : ''}`;

  // Get document type from localStorage
  const [documentType, setDocumentType] = useState<'pdf' | 'youtube' | null>(null);

  useEffect(() => {
    const currentDocId = localStorage.getItem('currentDocumentId');
    if (currentDocId) {
      const documentsStr = localStorage.getItem('documents');
      if (documentsStr) {
        const documents = JSON.parse(documentsStr);
        const currentDoc = documents.find((doc: any) => doc.id === currentDocId);
        if (currentDoc) {
          setDocumentType(currentDoc.type);
        }
      }
    }
  }, []);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('textChatMessages');
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (error) {
        console.error('Failed to load messages from localStorage:', error);
      }
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('textChatMessages', JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const connect = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log("Already connected");
      return;
    }

    // Get API key from sessionStorage
    const apiKey = sessionStorage.getItem('openai_api_key');
    if (!apiKey) {
      addMessage("system", "Error: No API key found. Redirecting to API key page...");
      setTimeout(() => {
        window.location.href = '/api-key';
      }, 2000);
      return;
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
    const wsUrl = API_URL.replace("http", "ws");

    // Get document text and full metadata from localStorage
    const documentText = localStorage.getItem('currentDocumentText');
    const currentDocId = localStorage.getItem('currentDocumentId');

    // Get full document metadata from stored documents
    let currentDoc: any = null;
    if (currentDocId) {
      const documentsStr = localStorage.getItem('documents');
      if (documentsStr) {
        const documents = JSON.parse(documentsStr);
        currentDoc = documents.find((doc: any) => doc.id === currentDocId);
      }
    }

    // Add document context parameters if available
    const params = new URLSearchParams();
    params.append('apiKey', apiKey); // Pass API key to backend

    console.log('[Text Chat] Current document ID:', currentDocId);
    console.log('[Text Chat] Current document:', currentDoc);
    console.log('[Text Chat] Document text length:', documentText?.length || 0);

    if (currentDoc) {
      // Send full document metadata
      params.append('documentName', currentDoc.title || documentName || '');
      params.append('documentText', currentDoc.extractedText || documentText || '');
      params.append('contentType', currentDoc.type || 'pdf');

      console.log('[Text Chat] Sending document:', {
        title: currentDoc.title,
        textLength: (currentDoc.extractedText || documentText || '').length,
        type: currentDoc.type
      });

      // Add YouTube-specific metadata
      if (currentDoc.type === 'youtube') {
        if (currentDoc.youtubeUrl) params.append('youtubeUrl', currentDoc.youtubeUrl);
        if (currentDoc.channelName) params.append('channelName', currentDoc.channelName);
        if (currentDoc.duration) params.append('duration', currentDoc.duration.toString());
        if (currentDoc.uploadDate) params.append('uploadDate', currentDoc.uploadDate);

        console.log('[Text Chat] YouTube metadata:', {
          url: currentDoc.youtubeUrl,
          channel: currentDoc.channelName,
          duration: currentDoc.duration,
          uploadDate: currentDoc.uploadDate
        });
      }
    } else {
      console.warn('[Text Chat] No current document found, using fallback');
      // Fallback to basic data if document not found
      if (documentName) params.append('documentName', documentName);
      if (documentText) params.append('documentText', documentText);
    }

    const url = `${wsUrl}/api/ai/text?${params.toString()}`;

    console.log("Connecting to:", url.replace(apiKey, 'sk-***').substring(0, 200) + '...');
    const ws = new WebSocket(url);

    ws.onopen = () => {
      console.log("Connected!");
      setIsConnected(true);
      addMessage("system", "Connected to AI (Text Mode)");
    };

    ws.onmessage = async (event) => {
      try {
        let messageText: string;
        if (event.data instanceof Blob) {
          messageText = await event.data.text();
        } else {
          messageText = event.data;
        }

        const data = JSON.parse(messageText);
        console.log("Received:", data);

        if (data.type === "error") {
          addMessage("system", `Error: ${data.message}`);
          setIsLoading(false);
        } else if (data.type === "connected") {
          addMessage("system", data.message);
        } else if (data.type === "response.text.delta") {
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last && last.role === "assistant") {
              return [
                ...prev.slice(0, -1),
                { ...last, content: last.content + (data.delta || "") }
              ];
            } else {
              return [...prev, { role: "assistant", content: data.delta || "" }];
            }
          });
        } else if (data.type === "response.done" || data.type === "response.text.done") {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Parse error:", error, event.data);
      }
    };

    ws.onerror = (error) => {
      // Suppress error logging - these are expected during normal connection lifecycle
      setIsConnected(false);
      setIsLoading(false);
    };

    ws.onclose = () => {
      console.log("Disconnected");
      setIsConnected(false);
      setIsLoading(false);
      addMessage("system", "Disconnected");
    };

    wsRef.current = ws;
  };

  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  };

  const addMessage = (role: "user" | "assistant" | "system", content: string) => {
    setMessages((prev) => [...prev, { role, content }]);
  };

  const sendMessage = () => {
    if (!inputValue.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    const text = inputValue.trim();
    addMessage("user", text);
    setInputValue("");
    setIsLoading(true);

    wsRef.current.send(JSON.stringify({
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [{ type: "input_text", text }]
      }
    }));

    wsRef.current.send(JSON.stringify({
      type: "response.create",
      response: { modalities: ["text"] }
    }));
  };

  // Auto-connect on page load
  useEffect(() => {
    connect();
    return () => disconnect();
  }, []);

  // Clear chat logs when window closes
  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.removeItem('textChatMessages');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 px-3 sm:px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <a href="/dashboard" className="flex items-center gap-2 hover:opacity-70 transition-opacity flex-shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/30"></div>
            </div>
            <span className="text-base sm:text-lg font-bold text-gray-900 hidden sm:inline">Document AI</span>
          </a>
          <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
            <a
              href={voiceChatUrl}
              className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors whitespace-nowrap"
            >
              Voice
            </a>
            <a
              href="/dashboard"
              className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors whitespace-nowrap"
            >
              Dashboard
            </a>
          </div>
        </div>
      </div>

      {/* Document Title Bar */}
      <div className="border-b border-gray-200 px-3 sm:px-4 py-3">
        <div className="max-w-4xl mx-auto flex justify-center">
          <a
            href="/dashboard"
            className="flex items-center gap-3 hover:opacity-70 transition-opacity"
          >
            {documentType ? (
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                documentType === 'youtube' ? 'bg-red-600' : 'bg-purple-600'
              }`}>
                {documentType === 'youtube' ? (
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )}
              </div>
            ) : (
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center bg-gray-600 flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                {documentName && documentName.length > 65
                  ? (() => {
                      const truncated = documentName.substring(0, 65);
                      const lastSpace = truncated.lastIndexOf(' ');
                      return (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + '...';
                    })()
                  : documentName || 'Text Chat'}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">Text Chat</p>
            </div>
          </a>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto flex items-center">
        <div className="max-w-3xl mx-auto px-4 py-8 w-full">
          {messages.filter(m => m.role !== "system").length === 0 && (
            <div className="text-center text-gray-400">
              <p className="text-lg">What are you working on?</p>
            </div>
          )}

          {messages.filter(m => m.role !== "system").map((msg, i) => (
            <div key={i} className="mb-8">
              <div className="flex gap-4">
                {msg.role === "user" ? (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                ) : (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-xs font-semibold text-white">
                    AI
                  </div>
                )}
                <div className="flex-1 pt-1">
                  <div className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                    {msg.content}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="mb-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-xs font-semibold text-white">
                  AI
                </div>
                <div className="flex-1 pt-1 flex items-center">
                  <div className="w-3 h-3 bg-black rounded-full" style={{ animation: 'pulseScale 1s ease-in-out infinite' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder="What are you working on?"
              disabled={!isConnected || isLoading}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:border-gray-400 disabled:bg-gray-50 disabled:text-gray-400"
              autoFocus
            />
            <button
              onClick={sendMessage}
              disabled={!isConnected || !inputValue.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg bg-black text-white disabled:bg-gray-200 disabled:text-gray-400 hover:bg-gray-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulseScale {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.5);
          }
        }
      `}</style>
    </div>
  );
}

export default function TestText() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    }>
      <TextChatContent />
    </Suspense>
  );
}
