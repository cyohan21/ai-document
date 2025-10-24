"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export default function TestText() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const connect = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log("Already connected");
      return;
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const wsUrl = API_URL.replace("http", "ws");
    const url = `${wsUrl}/api/ai/text`;

    console.log("Connecting to:", url);
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

  useEffect(() => {
    return () => disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">OpenAI Realtime API - Text Chat</h1>

        {/* Connection Controls */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}></div>
              <span className="font-semibold">{isConnected ? "Connected (Text Only)" : "Disconnected"}</span>
            </div>
            <button
              onClick={isConnected ? disconnect : connect}
              className={`px-4 py-2 rounded-lg font-semibold ${
                isConnected
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-green-500 hover:bg-green-600 text-white"
              }`}
            >
              {isConnected ? "Disconnect" : "Connect"}
            </button>
            <a
              href="/test-ai"
              className="ml-auto px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-semibold"
            >
              Switch to Voice Chat →
            </a>
          </div>
        </div>

        {/* Messages */}
        <div className="bg-white rounded-lg shadow mb-6 h-96 overflow-y-auto p-6">
          {messages.length === 0 && (
            <div className="text-center text-gray-400 mt-20">
              <p>No messages yet. Connect and send a message!</p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`mb-4 ${msg.role === "user" ? "text-right" : ""}`}>
              <div
                className={`inline-block px-4 py-2 rounded-lg max-w-[80%] ${
                  msg.role === "user"
                    ? "bg-blue-500 text-white"
                    : msg.role === "system"
                    ? "bg-gray-200 text-gray-600 text-sm"
                    : "bg-gray-300 text-black"
                }`}
              >
                <div className="text-xs font-bold mb-1">{msg.role.toUpperCase()}</div>
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="mb-4">
              <div className="inline-block px-4 py-2 rounded-lg bg-gray-300">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                  <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex gap-4">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              placeholder={isConnected ? "Type a message..." : "Connect first..."}
              disabled={!isConnected || isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
            <button
              onClick={sendMessage}
              disabled={!isConnected || !inputValue.trim() || isLoading}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
