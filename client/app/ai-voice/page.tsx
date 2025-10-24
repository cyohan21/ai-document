"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export default function TestAI() {
  const searchParams = useSearchParams();
  const documentName = searchParams.get('documentName');
  const textFileName = searchParams.get('textFileName');

  // Build the text chat URL with query params
  const textChatUrl = `/ai-chat${documentName ? `?documentName=${encodeURIComponent(documentName)}` : ''}`;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [currentAIMessage, setCurrentAIMessage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [microphoneError, setMicrophoneError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioQueueRef = useRef<Int16Array[]>([]);
  const isPlayingRef = useRef(false);
  const playbackContextRef = useRef<AudioContext | null>(null);
  const nextPlayTimeRef = useRef(0);
  const audioProcessorRef = useRef<ScriptProcessorNode | null>(null);

  // Load messages from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('voiceChatMessages');
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
      localStorage.setItem('voiceChatMessages', JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const connect = () => {
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

    const url = `${wsUrl}/api/ai/voice?${params.toString()}`;

    addMessage("system", `Connecting to voice chat...`);

    const ws = new WebSocket(url);

    ws.onopen = async () => {
      console.log("Connected!");
      setIsConnected(true);
      addMessage("system", "Connected to AI (Voice Mode)");

      // Start recording immediately
      await startRecording();
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
          setError(data.message);
          addMessage("system", `Error: ${data.message}`);
          setIsLoading(false);

          // Show user-friendly error and suggest fallback
          if (data.code === 'NO_API_KEY' || data.code === 'INVALID_API_KEY') {
            setTimeout(() => {
              alert(`${data.message}\n\nText chat requires a valid OpenAI API key. Please contact your administrator.`);
              // Disconnect and disable chat
              setIsConnected(false);
            }, 500);
          }
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
            setIsAISpeaking(true);
            queueAudio(data.delta);
          }
        } else if (data.type === "response.audio_transcript.delta") {
          // Show transcript in real-time as AI speaks
          if (data.delta) {
            setCurrentAIMessage((prev) => prev + data.delta);
          }
        } else if (data.type === "response.audio_transcript.done") {
          // When transcript is complete, add it to messages and clear current
          if (currentAIMessage) {
            addMessage("assistant", currentAIMessage);
            setCurrentAIMessage("");
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

      const errorMsg = "Failed to connect to the AI service. Please check your internet connection and try again.";
      setError(errorMsg);
      addMessage("system", errorMsg);
      setIsConnected(false);
      setIsLoading(false);

      // Offer fallback to text chat after a delay
      setTimeout(() => {
        if (confirm(`${errorMsg}\n\nWould you like to try Text Chat instead?`)) {
          const params = new URLSearchParams(window.location.search);
          window.location.href = `/ai-chat?${params.toString()}`;
        }
      }, 500);
    };

    ws.onclose = (event) => {
      console.log("Disconnected", event.code, event.reason);
      setIsConnected(false);
      setIsLoading(false);

      // Only show message if it wasn't a normal close
      if (event.code !== 1000) {
        const closeMsg = event.reason || "Connection closed unexpectedly";
        addMessage("system", closeMsg);

        // If server rejected connection, might be API key issue
        if (event.code === 1008 || event.code === 1011) {
          setTimeout(() => {
            alert("Unable to connect to AI service. This might be due to an invalid API key or server configuration issue. Please contact your administrator.");
          }, 500);
        }
      } else {
        addMessage("system", "Disconnected");
      }
    };

    wsRef.current = ws;
  };

  const disconnect = () => {
    // Stop AI speech playback
    setIsAISpeaking(false);
    audioQueueRef.current = []; // Clear audio queue
    isPlayingRef.current = false;

    // Close playback context to stop any ongoing audio
    if (playbackContextRef.current) {
      playbackContextRef.current.close();
      playbackContextRef.current = null;
    }

    // Reset playback timing
    nextPlayTimeRef.current = 0;

    // Stop recording
    if (audioProcessorRef.current) {
      audioProcessorRef.current.disconnect();
      audioProcessorRef.current = null;
    }

    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
      audioStreamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Close WebSocket
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
    setIsMuted(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
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
      // Check if mediaDevices is supported (works for all modern browsers including Safari)
      if (!navigator.mediaDevices?.getUserMedia) {
        // Fallback for older browsers
        const getUserMedia = (navigator as any).getUserMedia ||
                            (navigator as any).webkitGetUserMedia ||
                            (navigator as any).mozGetUserMedia ||
                            (navigator as any).msGetUserMedia;

        if (!getUserMedia) {
          throw new Error('Your browser does not support microphone access. Please update your browser or use Chrome, Firefox, Safari, or Edge.');
        }
      }

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      audioStreamRef.current = stream;
      setMicrophoneError(null);

      // Create audio context for processing
      const audioContext = new AudioContext({ sampleRate: 24000 });
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);

      source.connect(processor);
      processor.connect(audioContext.destination);

      audioProcessorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
        if (isMuted) return; // Don't send audio when muted

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
    } catch (error: any) {
      console.error("Error starting recording:", error);

      let errorMessage = "Failed to access microphone. ";

      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage += "Microphone permission was denied. Please allow microphone access in your browser settings and try again.";
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorMessage += "No microphone was found. Please connect a microphone and try again.";
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        errorMessage += "Your microphone is already in use by another application. Please close other apps using the microphone.";
      } else {
        errorMessage += error.message || "Unknown error occurred.";
      }

      setMicrophoneError(errorMessage);
      addMessage("system", errorMessage);
      setIsConnected(false);

      // Offer fallback to text chat
      setTimeout(() => {
        const params = new URLSearchParams(window.location.search);
        const chatUrl = `/ai-chat?${params.toString()}`;

        if (confirm(`${errorMessage}\n\nWould you like to switch to Text Chat instead?`)) {
          console.log('Redirecting to:', chatUrl);
          window.location.href = chatUrl;
        } else {
          console.log('User declined redirect to text chat');
        }
      }, 500);
    }
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
      setIsAISpeaking(false);
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

  // Clear chat logs when window closes
  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.removeItem('voiceChatMessages');
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
            <h1 className="text-base sm:text-lg font-semibold text-gray-900 whitespace-nowrap">Voice Chat</h1>
            {documentName && (
              <span className="text-xs sm:text-sm text-gray-500 truncate hidden xs:inline">• {documentName}</span>
            )}
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <a
              href={textChatUrl}
              className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors whitespace-nowrap"
            >
              Text
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

      {/* Main Content - Centered Voice Interface */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          {/* Voice Circle */}
          <div className="mb-8 flex justify-center">
            <div
              className={`w-48 h-48 rounded-full bg-purple-600 flex items-center justify-center transition-all duration-300 ${
                isMuted ? 'opacity-50' : ''
              }`}
              style={{
                animation: isConnected && !isAISpeaking
                  ? 'breathing 3s ease-in-out infinite'
                  : isAISpeaking
                    ? 'erraticHeartbeat 1.2s ease-in-out infinite'
                    : 'none'
              }}
            >
            </div>
          </div>

          {/* Status Text */}
          <p className="text-gray-600 mb-8">
            {!isConnected ? "Not connected" : isMuted ? "Muted" : isAISpeaking ? "AI is speaking..." : "Listening..."}
          </p>

          {/* Control Buttons */}
          <div className="flex justify-center gap-4">
            {!isConnected ? (
              <button
                onClick={connect}
                className="px-6 py-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
              >
                Connect
              </button>
            ) : (
              <>
                <button
                  onClick={toggleMute}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                    isMuted
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4z" />
                      <path d="M5.5 9.643a.75.75 0 00-1.5 0V10c0 3.06 2.29 5.585 5.25 5.954V17.5h-1.5a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-1.5v-1.546A6.001 6.001 0 0016 10v-.357a.75.75 0 00-1.5 0V10a4.5 4.5 0 01-9 0v-.357z" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={disconnect}
                  className="w-14 h-14 rounded-full flex items-center justify-center bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                  title="Stop Connection"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* Transcript Display */}
          {(messages.filter(m => m.role !== "system").length > 0 || currentAIMessage) && (
            <div className="mt-12 max-w-2xl mx-auto">
              <div className="bg-gray-50 rounded-lg p-6 max-h-96 overflow-y-auto">
                {messages.filter(m => m.role !== "system").map((msg, i) => (
                  <div key={i} className="mb-4 last:mb-0 transcription-text">
                    <div className="text-xs font-medium text-gray-500 mb-1">
                      {msg.role === "user" ? "You" : "AI"}
                    </div>
                    <div className="text-gray-900 text-sm leading-relaxed">
                      {msg.content}
                    </div>
                  </div>
                ))}
                {/* Show current AI message being spoken in real-time */}
                {currentAIMessage && (
                  <div className="mb-4 last:mb-0 transcription-text">
                    <div className="text-xs font-medium text-gray-500 mb-1">
                      AI
                    </div>
                    <div className="text-gray-900 text-sm leading-relaxed">
                      {currentAIMessage}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hidden message anchor */}
      <div ref={messagesEndRef} />

      <style jsx>{`
        @keyframes erraticHeartbeat {
          0% {
            transform: scale(1);
          }
          14% {
            transform: scale(1.1);
          }
          28% {
            transform: scale(1);
          }
          42% {
            transform: scale(1.1);
          }
          70% {
            transform: scale(1);
          }
        }

        @keyframes breathing {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
        }

        .transcription-text {
          animation: fadeIn 0.3s ease-in;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
