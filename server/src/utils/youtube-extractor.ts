import { Innertube } from 'youtubei.js';

interface YouTubeMetadata {
  title: string;
  channelName: string;
  duration: number; // in seconds
  uploadDate: string;
  videoId: string;
}

interface TranscriptResult {
  transcript: string;
  metadata: YouTubeMetadata;
}

/**
 * Extract video ID from YouTube URL
 */
export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\?\/]+)/,
    /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

/**
 * Fetch YouTube video transcript using youtubei.js
 */
export async function fetchYouTubeTranscript(videoId: string, youtube: Innertube): Promise<string> {
  try {
    const info = await youtube.getInfo(videoId);

    // Get transcript
    const transcriptData = await info.getTranscript();

    if (!transcriptData || !transcriptData.transcript) {
      throw new Error('No transcript available');
    }

    // Combine all transcript segments into one text
    const fullTranscript = transcriptData.transcript.content.body.initial_segments
      .map((segment: any) => segment.snippet.text)
      .join(' ');

    return fullTranscript;
  } catch (error) {
    throw new Error(`Failed to fetch transcript: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fetch YouTube video metadata using youtubei.js
 */
export async function fetchYouTubeMetadata(videoId: string, youtube: Innertube): Promise<YouTubeMetadata> {
  try {
    const info = await youtube.getBasicInfo(videoId);

    // Extract metadata
    const title = info.basic_info.title || 'Unknown Title';
    const channelName = info.basic_info.channel?.name || 'Unknown Channel';
    const duration = info.basic_info.duration || 0;

    // Format upload date
    const uploadDate = info.basic_info.start_timestamp
      ? new Date(info.basic_info.start_timestamp).toLocaleDateString()
      : new Date().toLocaleDateString();

    return {
      title,
      channelName,
      duration,
      uploadDate,
      videoId
    };
  } catch (error) {
    throw new Error(`Failed to fetch metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Process YouTube URL: extract transcript and metadata
 */
export async function processYouTubeUrl(url: string): Promise<TranscriptResult> {
  // Extract video ID
  const videoId = extractVideoId(url);
  if (!videoId) {
    throw new Error('Invalid YouTube URL format');
  }

  // Create Innertube instance
  const youtube = await Innertube.create();

  // Fetch metadata first to check duration
  const metadata = await fetchYouTubeMetadata(videoId, youtube);

  // Check duration limit (30 minutes = 1800 seconds)
  const MAX_DURATION = 30 * 60; // 30 minutes in seconds
  if (metadata.duration > MAX_DURATION) {
    throw new Error(`Video duration (${Math.round(metadata.duration / 60)} minutes) exceeds the 30-minute limit`);
  }

  // Fetch transcript
  const transcript = await fetchYouTubeTranscript(videoId, youtube);

  if (!transcript || transcript.trim().length === 0) {
    throw new Error('No transcript available for this video');
  }

  return {
    transcript,
    metadata
  };
}
