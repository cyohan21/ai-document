"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export default function TestAI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioQueueRef = useRef<Int16Array[]>([]);
  const isPlayingRef = useRef(false);
  const playbackContextRef = useRef<AudioContext | null>(null);
  const nextPlayTimeRef = useRef(0);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const connect = () => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const wsUrl = API_URL.replace("http", "ws");
    const url = `${wsUrl}/api/ai/voice`;

    addMessage("system", `Connecting to ${url}...`);

    const ws = new WebSocket(url);

    ws.onopen = () => {
      console.log("Connected!");
      setIsConnected(true);
      addMessage("system", "Connected to AI (Voice Mode)");
    };

    ws.onmessage = async (event) => {
      try {
        // Handle Blob or string
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
          // Append text
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
        } else if (data.type === "response.audio.delta") {
          // Queue audio chunk for sequential playback
          if (data.delta) {
            queueAudio(data.delta);
          }
        } else if (data.type === "response.audio_transcript.delta") {
          // Show transcript in chat
          if (data.delta) {
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last && last.role === "assistant") {
                return [
                  ...prev.slice(0, -1),
                  { ...last, content: last.content + data.delta }
                ];
              } else {
                return [...prev, { role: "assistant", content: data.delta }];
              }
            });
          }
        } else if (data.type === "conversation.item.input_audio_transcription.completed") {
          // Show user's audio transcription
          if (data.transcript) {
            addMessage("user", data.transcript);
          }
        } else if (data.type === "input_audio_buffer.speech_started") {
          // User started speaking
          console.log("Speech started");
        } else if (data.type === "input_audio_buffer.speech_stopped") {
          // User stopped speaking
          console.log("Speech stopped");
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

    // Send to OpenAI
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
      response: { modalities: ["text", "audio"] }
    }));
  };

  const startRecording = async () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      alert("Connect first!");
      return;
    }

    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;

      // Create audio context for processing
      const audioContext = new AudioContext({ sampleRate: 24000 });
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);

      source.connect(processor);
      processor.connect(audioContext.destination);

      processor.onaudioprocess = (e) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

        const inputData = e.inputBuffer.getChannelData(0);

        // Convert Float32Array to Int16Array (PCM16)
        const pcm16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }

        // Convert to base64
        const base64 = btoa(String.fromCharCode(...new Uint8Array(pcm16.buffer)));

        // Send audio chunk to OpenAI
        wsRef.current.send(JSON.stringify({
          type: "input_audio_buffer.append",
          audio: base64
        }));
      };

      setIsRecording(true);
      addMessage("system", "Recording... Speak now!");
    } catch (error) {
      console.error("Error starting recording:", error);
      addMessage("system", "Failed to access microphone");
    }
  };

  const stopRecording = () => {
    // Stop all audio tracks
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
      audioStreamRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Commit the audio buffer
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "input_audio_buffer.commit"
      }));

      wsRef.current.send(JSON.stringify({
        type: "response.create",
        response: { modalities: ["text", "audio"] }
      }));
    }

    setIsRecording(false);
    addMessage("system", "Recording stopped. Processing...");
    setIsLoading(true);
  };

  // Add audio chunk to queue
  const queueAudio = (base64Audio: string) => {
    try {
      // Decode base64 to ArrayBuffer
      const binaryString = atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Convert to Int16Array with proper alignment
      const int16Array = new Int16Array(bytes.buffer, bytes.byteOffset, bytes.byteLength / 2);
      audioQueueRef.current.push(int16Array);

      if (!isPlayingRef.current) {
        playNextAudio();
      }
    } catch (error) {
      console.error("Error queueing audio:", error);
    }
  };

  // Play next audio chunk from queue with seamless playback
  const playNextAudio = async () => {
    if (audioQueueRef.current.length === 0) {
      isPlayingRef.current = false;
      return;
    }

    isPlayingRef.current = true;

    try {
      // Create audio context if needed
      if (!playbackContextRef.current) {
        playbackContextRef.current = new AudioContext({ sampleRate: 24000 });
        nextPlayTimeRef.current = playbackContextRef.current.currentTime;
      }

      const audioContext = playbackContextRef.current;
      const pcm16Data = audioQueueRef.current.shift()!;

      // Create audio buffer
      const audioBuffer = audioContext.createBuffer(1, pcm16Data.length, 24000);
      const channelData = audioBuffer.getChannelData(0);

      // Convert PCM16 to Float32 with proper normalization
      for (let i = 0; i < pcm16Data.length; i++) {
        const sample = pcm16Data[i];
        // Proper PCM16 to Float32 conversion
        channelData[i] = sample < 0 ? sample / 32768.0 : sample / 32767.0;
      }

      // Create buffer source with gain control
      const source = audioContext.createBufferSource();
      const gainNode = audioContext.createGain();

      source.buffer = audioBuffer;
      source.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Set gain to prevent clipping
      gainNode.gain.value = 0.9;

      // Schedule playback at the next available time to avoid gaps
      const currentTime = audioContext.currentTime;
      const startTime = Math.max(currentTime + 0.01, nextPlayTimeRef.current);

      source.start(startTime);

      // Update next play time with small overlap to prevent gaps
      nextPlayTimeRef.current = startTime + audioBuffer.duration - 0.01;

      // Continue playing next chunk
      source.onended = () => {
        playNextAudio();
      };

    } catch (error) {
      console.error("Error playing audio:", error);
      // Continue with next chunk even if this one failed
      playNextAudio();
    }
  };

  useEffect(() => {
    return () => {
      disconnect();
      stopRecording();

      // Clean up playback context
      if (playbackContextRef.current) {
        playbackContextRef.current.close();
        playbackContextRef.current = null;
      }

      // Clear audio queue
      audioQueueRef.current = [];
      isPlayingRef.current = false;
      nextPlayTimeRef.current = 0;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">OpenAI Realtime API - Voice Chat</h1>

        {/* Connection Controls */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}></div>
              <span className="font-semibold">{isConnected ? "Connected (Voice + Text)" : "Disconnected"}</span>
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
              href="/test-text"
              className="ml-auto px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-semibold"
            >
              Switch to Text Only →
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
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              placeholder={isConnected ? "Type a message..." : "Connect first..."}
              disabled={!isConnected || isLoading || isRecording}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
            <button
              onClick={sendMessage}
              disabled={!isConnected || !inputValue.trim() || isLoading || isRecording}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold"
            >
              Send
            </button>
          </div>

          <div className="text-center">
            <div className="text-sm text-gray-500 mb-2">Or speak to the AI</div>
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={!isConnected || isLoading}
              className={`px-8 py-4 rounded-full font-semibold text-white transition-all ${
                isRecording
                  ? "bg-red-500 hover:bg-red-600 animate-pulse"
                  : "bg-green-500 hover:bg-green-600"
              } disabled:bg-gray-300 disabled:cursor-not-allowed`}
            >
              {isRecording ? (
                <span className="flex items-center gap-2">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <rect x="6" y="6" width="8" height="8" />
                  </svg>
                  Stop Recording
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4z" />
                    <path d="M5.5 9.643a.75.75 0 00-1.5 0V10c0 3.06 2.29 5.585 5.25 5.954V17.5h-1.5a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-1.5v-1.546A6.001 6.001 0 0016 10v-.357a.75.75 0 00-1.5 0V10a4.5 4.5 0 01-9 0v-.357z" />
                  </svg>
                  {isLoading ? "Processing..." : "Hold to Talk"}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
