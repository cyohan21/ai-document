"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function APIKeyPage() {
  const router = useRouter();
  const [apiKey, setApiKey] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState("");

  const validateAndContinue = async () => {
    if (!apiKey.trim()) {
      setError("Please enter your API key");
      return;
    }

    if (!apiKey.startsWith("sk-")) {
      setError("Invalid API key format. OpenAI API keys start with 'sk-'");
      return;
    }

    setIsValidating(true);
    setError("");

    try {
      // Test the API key by attempting to connect
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const wsUrl = API_URL.replace("http", "ws");

      const ws = new WebSocket(`${wsUrl}/api/ai/text?apiKey=${encodeURIComponent(apiKey)}&test=true`);

      const timeout = setTimeout(() => {
        ws.close();
        setError("Connection timeout. Please check your API key and try again.");
        setIsValidating(false);
      }, 10000);

      ws.onopen = () => {
        clearTimeout(timeout);
        ws.close();

        // Store in sessionStorage (ephemeral - lost on tab close)
        sessionStorage.setItem("openai_api_key", apiKey);

        // Redirect to dashboard
        router.push("/dashboard");
      };

      ws.onerror = () => {
        clearTimeout(timeout);
        setError("Failed to validate API key. Please check that it's correct.");
        setIsValidating(false);
      };

      ws.onmessage = async (event) => {
        try {
          const messageText = event.data instanceof Blob ? await event.data.text() : event.data;
          const data = JSON.parse(messageText);

          if (data.type === "error") {
            clearTimeout(timeout);
            ws.close();

            if (data.code === "INVALID_API_KEY" || data.code === "NO_API_KEY") {
              setError("Invalid API key. Please check your OpenAI API key.");
            } else {
              setError(data.message || "Failed to validate API key");
            }
            setIsValidating(false);
          }
        } catch (e) {
          // Ignore parsing errors
        }
      };

    } catch (error) {
      setError("Failed to validate API key. Please try again.");
      setIsValidating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Logo/Branding */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
              <div className="w-7 h-7 rounded-full bg-white/30"></div>
            </div>
            <h1 className="text-3xl font-semibold text-gray-900">Document AI</h1>
          </div>
          <p className="text-gray-600">AI-powered document analysis and chat</p>
        </div>

        {/* API Key Input Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Enter Your OpenAI API Key</h2>
          <p className="text-sm text-gray-600 mb-6">
            Your API key is stored temporarily in your browser session and never sent to our servers.
          </p>

          {/* Input */}
          <div className="mb-6">
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
              API Key
            </label>
            <input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  validateAndContinue();
                }
              }}
              placeholder="sk-..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-gray-900"
              disabled={isValidating}
            />
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Don't have an API key?</h3>
            <p className="text-xs text-blue-800 mb-3">
              Get your OpenAI API key from the OpenAI platform. It usually starts with "sk-".
            </p>
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1"
            >
              Get API Key
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>

          {/* Continue Button */}
          <button
            onClick={validateAndContinue}
            disabled={isValidating || !apiKey.trim()}
            className="w-full py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isValidating ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Validating...
              </span>
            ) : (
              "Continue to App"
            )}
          </button>

          {/* Security Notice */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-start gap-2 text-xs text-gray-600">
              <svg className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div>
                <strong className="text-gray-900">Secure & Private:</strong> Your API key is only stored in your browser's session storage and is cleared when you close the tab. We never send your key to our servers.
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <p className="text-center text-xs text-gray-500 mt-6">
          By using this app, you agree to OpenAI's terms of service and usage policies.
        </p>
      </div>
    </div>
  );
}
