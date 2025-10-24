"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export default function TestText() {
  const searchParams = useSearchParams();
  const documentName = searchParams.get('documentName');
  const textFileName = searchParams.get('textFileName');

  // Build the voice chat URL with query params
  const voiceChatUrl = `/ai-voice${documentName ? `?documentName=${encodeURIComponent(documentName)}` : ''}`;

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

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const wsUrl = API_URL.replace("http", "ws");

    // Get document text from localStorage if available
    const documentText = localStorage.getItem('currentDocumentText');

    // Add document context parameters if available
    const params = new URLSearchParams();
    params.append('apiKey', apiKey); // Pass API key to backend
    if (documentName) params.append('documentName', documentName);
    if (documentText) params.append('documentText', documentText);

    const url = `${wsUrl}/api/ai/text?${params.toString()}`;

    console.log("Connecting to:", url.replace(apiKey, 'sk-***'));
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
      console.error("WebSocket error:", error);
      addMessage("system", "Connection error!");
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
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <h1 className="text-base sm:text-lg font-semibold text-gray-900 whitespace-nowrap">Text Chat</h1>
            {documentName && (
              <span className="text-xs sm:text-sm text-gray-500 truncate hidden xs:inline">• {documentName}</span>
            )}
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
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
