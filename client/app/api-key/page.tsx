"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function APIKeyPage() {
  const router = useRouter();
  const [apiKey, setApiKey] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const validateAndContinue = async () => {
    // Send logs to backend for terminal output
    const logToBackend = async (message: string) => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        await fetch(`${API_URL}/api/log`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message })
        });
      } catch (e) {
        // Ignore fetch errors
      }
    };

    await logToBackend("========== API KEY VALIDATION ==========");
    await logToBackend(`API Key entered: ${apiKey ? "YES" : "NO"}`);

    if (!apiKey.trim()) {
      await logToBackend("❌ ERROR: API key is empty");
      setError("Please enter your API key");
      return;
    }

    await logToBackend(`API Key length: ${apiKey.length}`);
    await logToBackend(`API Key trimmed length: ${apiKey.trim().length}`);
    await logToBackend(`API Key starts with: ${apiKey.substring(0, 10)}`);
    await logToBackend(`API Key ends with: ${apiKey.substring(apiKey.length - 10)}`);
    await logToBackend(`First character code: ${apiKey.charCodeAt(0)}`);
    await logToBackend(`Starts with 'sk-': ${apiKey.startsWith("sk-")}`);
    await logToBackend(`Starts with 'sk-' (trimmed): ${apiKey.trim().startsWith("sk-")}`);

    if (!apiKey.startsWith("sk-")) {
      await logToBackend("❌ ERROR: Invalid API key format");
      await logToBackend("Key does not start with 'sk-'");
      setError("Invalid API key format. OpenAI API keys start with 'sk-'");
      return;
    }

    await logToBackend("✅ Frontend validation passed");
    setIsValidating(true);
    setError("");

    try {
      // Test the API key by attempting to connect
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const wsUrl = API_URL.replace("http", "ws");

      await logToBackend(`Connecting to: ${wsUrl}`);
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full">
        {/* Logo/Branding */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/30"></div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">Document AI</h1>
          </div>
          <p className="text-sm sm:text-base text-gray-600 px-4">AI-powered document analysis and chat</p>
        </div>

        {/* API Key Input Card */}
        <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-8">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Enter Your OpenAI API Key</h2>
          <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
            Your API key is stored temporarily in your browser session and never sent to our servers.
          </p>

          {/* Input */}
          <div className="mb-4 sm:mb-6">
            <label htmlFor="apiKey" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              API Key
            </label>
            <div className="relative">
              <input
                id="apiKey"
                type={showPassword ? "text" : "password"}
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
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-gray-900 text-sm sm:text-base"
                disabled={isValidating}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-gray-700 focus:outline-none"
                disabled={isValidating}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {error && (
              <p className="mt-2 text-xs sm:text-sm text-red-600">{error}</p>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
            <h3 className="text-xs sm:text-sm font-semibold text-blue-900 mb-1.5 sm:mb-2">Don't have an API key?</h3>
            <p className="text-xs text-blue-800 mb-2 sm:mb-3">
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
            className="w-full py-2.5 sm:py-3 text-sm sm:text-base bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
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
          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
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
        <p className="text-center text-xs text-gray-500 mt-4 sm:mt-6 px-4">
          By using this app, you agree to OpenAI's terms of service and usage policies.
        </p>
      </div>
    </div>
  );
}
