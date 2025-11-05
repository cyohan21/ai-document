import express, { Request, Response } from 'express';
import { processYouTubeUrl } from '../utils/youtube-extractor';

const router = express.Router();

/**
 * POST /api/youtube/process
 * Process YouTube URL: extract transcript and metadata
 */
router.post('/process', async (req: Request, res: Response) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'YouTube URL is required' });
    }

    // Validate it's a YouTube URL
    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    console.log('Processing YouTube URL:', url);

    // Process the YouTube URL
    const result = await processYouTubeUrl(url);

    res.json({
      success: true,
      message: 'YouTube video processed successfully',
      data: {
        transcript: result.transcript,
        metadata: result.metadata,
        transcriptLength: result.transcript.length,
        transcriptPreview: result.transcript.substring(0, 500)
      }
    });
  } catch (error) {
    console.error('Error processing YouTube URL:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Handle specific error cases
    if (errorMessage.includes('No transcript')) {
      return res.status(400).json({
        error: 'No transcript available for this video',
        details: errorMessage
      });
    }

    if (errorMessage.includes('duration') && errorMessage.includes('exceeds')) {
      return res.status(400).json({
        error: 'Video is too long',
        details: errorMessage
      });
    }

    if (errorMessage.includes('Invalid YouTube URL')) {
      return res.status(400).json({
        error: 'Invalid YouTube URL format',
        details: errorMessage
      });
    }

    res.status(500).json({
      error: 'Failed to process YouTube video',
      details: errorMessage
    });
  }
});

export default router;
