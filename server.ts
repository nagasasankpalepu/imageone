import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { db, Creation } from './src/server/db.js';
import {
  DIMENSIONS,
  STYLE_PROMPTS,
  enhancePrompt,
  generateWithGemini,
  generateWithFlux
} from './src/server/ai.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// API Routes
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    appName: 'ImagineAI',
    models: ['gemini-3.1-flash-lite-image', 'sana-diffusion'],
    geminiKeyConfigured: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
    timestamp: new Date().toISOString()
  });
});

app.get('/api/styles', (_req, res) => {
  res.json({
    success: true,
    styles: Object.entries(STYLE_PROMPTS).map(([id, info]) => ({
      id,
      label: info.label,
      icon: info.icon
    })),
    dimensions: Object.entries(DIMENSIONS).map(([id, info]) => ({
      id,
      label: info.label,
      width: info.width,
      height: info.height
    }))
  });
});

app.get('/api/stats', (_req, res) => {
  try {
    const stats = db.getStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Failed to get stats:', error);
    res.status(500).json({ error: 'Failed to retrieve stats' });
  }
});

app.get('/api/images', (req, res) => {
  try {
    const { style, search, sort } = req.query as {
      style?: string;
      search?: string;
      sort?: 'newest' | 'likes';
    };

    const creations = db.getAllCreations({ style, search, sort });
    res.json({ success: true, data: creations });
  } catch (error) {
    console.error('Failed to fetch images:', error);
    res.status(500).json({ error: 'Could not load community creations' });
  }
});

// Serve direct image binary from local storage
app.get('/api/images/:id/file', (req, res) => {
  try {
    const { id } = req.params;
    const local = db.getImageBuffer(id);
    if (local) {
      res.setHeader('Content-Type', local.mimeType);
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      return res.send(local.buffer);
    }

    const creation = db.getCreationById(id);
    if (creation) {
      if (creation.imageUrl.startsWith('data:')) {
        const matches = creation.imageUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches) {
          res.setHeader('Content-Type', matches[1]);
          return res.send(Buffer.from(matches[2], 'base64'));
        }
      }
      return res.redirect(creation.imageUrl);
    }

    res.status(404).json({ error: 'Image file not found' });
  } catch (err) {
    console.error('Error serving image file:', err);
    res.status(500).json({ error: 'Failed to serve image file' });
  }
});

app.post('/api/prompt/enhance', async (req, res) => {
  try {
    const { prompt, style = 'photorealistic' } = req.body;
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ error: 'Prompt text is required' });
    }

    const enhanced = await enhancePrompt(prompt, style);
    res.json({ success: true, enhancedPrompt: enhanced });
  } catch (error) {
    console.error('Enhance prompt error:', error);
    res.status(500).json({ error: 'Failed to enhance prompt' });
  }
});

/**
 * Real Image Generation endpoint.
 * Prioritizes user prompt subjects, accurately extracts real output resolution,
 * and handles rate limits with automatic server retries.
 */
app.post('/api/generate', async (req, res) => {
  try {
    const {
      prompt,
      style = 'photorealistic',
      aspectRatio = '1:1',
      engine = 'flux', // 'gemini' or 'flux'
      seed: userSeed,
      negativePrompt,
      autoEnhance = false
    } = req.body;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ error: 'Prompt is required.' });
    }

    const dim = DIMENSIONS[aspectRatio] || DIMENSIONS['1:1'];
    const styleInfo = STYLE_PROMPTS[style] || STYLE_PROMPTS.photorealistic;

    let finalPrompt = prompt.trim();
    let enhancedPromptText: string | undefined = undefined;

    if (autoEnhance) {
      enhancedPromptText = await enhancePrompt(prompt, style);
      finalPrompt = enhancedPromptText;
    } else if (styleInfo) {
      // User prompt leads first to ensure subject integrity
      finalPrompt = `${prompt.trim()}, ${styleInfo.desc}`;
    }

    const seed =
      typeof userSeed === 'number' && !isNaN(userSeed) && userSeed > 0
        ? Math.floor(userSeed)
        : Math.floor(Math.random() * 1000000);

    const creationId = crypto.randomUUID();
    let imageBuffer: Buffer;
    let mimeType: string;
    let actualWidth = dim.width;
    let actualHeight = dim.height;
    let usedModelName = 'sana-diffusion';

    if (engine === 'gemini') {
      try {
        console.log(`[ImagineAI] Generating with Google Gemini (gemini-3.1-flash-lite-image)...`);
        const result = await generateWithGemini({
          prompt: finalPrompt,
          aspectRatio
        });
        imageBuffer = result.buffer;
        mimeType = result.mimeType;
        actualWidth = result.width;
        actualHeight = result.height;
        usedModelName = 'gemini-3.1-flash-lite-image';
      } catch (geminiErr: any) {
        console.error('[ImagineAI] Gemini generation failed:', geminiErr.message);
        if (geminiErr.requiresBilling) {
          return res.status(402).json({
            success: false,
            error: geminiErr.message,
            requiresBilling: true,
            model: 'gemini-3.1-flash-lite-image',
            suggestion: 'Switch to the free neural diffusion engine for instant $0.00 generation.'
          });
        }
        return res.status(500).json({
          success: false,
          error: geminiErr.message || 'Gemini image generation failed.'
        });
      }
    } else {
      // Neural Diffusion Engine with built-in retry
      console.log(`[ImagineAI] Generating image with neural diffusion engine...`);
      const result = await generateWithFlux({
        prompt: finalPrompt,
        width: dim.width,
        height: dim.height,
        seed,
        negativePrompt
      });
      imageBuffer = result.buffer;
      mimeType = result.mimeType;
      actualWidth = result.width;
      actualHeight = result.height;
      usedModelName = result.model || 'sana-diffusion';
    }

    // Persist real image bytes locally
    const fileUrl = db.saveImageBuffer(creationId, imageBuffer, mimeType);

    const newCreation: Creation = {
      id: creationId,
      prompt: prompt.trim(),
      enhancedPrompt: enhancedPromptText || finalPrompt,
      style,
      aspectRatio,
      width: actualWidth,
      height: actualHeight,
      imageUrl: fileUrl,
      model: usedModelName,
      seed,
      likes: 0,
      createdAt: new Date().toISOString()
    };

    db.saveCreation(newCreation);

    res.status(201).json({
      success: true,
      data: newCreation
    });
  } catch (error: any) {
    console.error('Generation Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate image. Please try again.'
    });
  }
});

app.post('/api/images/:id/like', (req, res) => {
  try {
    const { id } = req.params;
    const updated = db.likeCreation(id);
    if (!updated) {
      return res.status(404).json({ error: 'Creation not found.' });
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Like error:', error);
    res.status(500).json({ error: 'Failed to like image.' });
  }
});

app.delete('/api/images/:id', (req, res) => {
  try {
    const { id } = req.params;
    const success = db.deleteCreation(id);
    if (!success) {
      return res.status(404).json({ error: 'Creation not found.' });
    }
    res.json({ success: true, message: 'Creation deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete creation.' });
  }
});

app.get('/api/images/:id/download', async (req, res) => {
  try {
    const { id } = req.params;
    const format = ((req.query.format as string) || 'png').toLowerCase();
    
    // Check local storage first
    const local = db.getImageBuffer(id);
    let buffer: Buffer;

    if (local) {
      buffer = local.buffer;
    } else {
      const creation = db.getCreationById(id);
      if (!creation) {
        return res.status(404).json({ error: 'Creation not found.' });
      }
      const response = await fetch(creation.imageUrl);
      if (!response.ok) {
        return res.status(502).json({ error: 'Failed to fetch source image.' });
      }
      const arrayBuffer = await response.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    }

    const contentType =
      format === 'png' ? 'image/png' : format === 'webp' ? 'image/webp' : 'image/jpeg';
    const ext = format === 'png' ? 'png' : format === 'webp' ? 'webp' : 'jpg';

    res.setHeader('Content-Type', contentType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="imagineai-${id}.${ext}"`
    );

    res.send(buffer);
  } catch (error) {
    console.error('Download route error:', error);
    res.status(500).json({ error: 'Failed to process image download.' });
  }
});

// Setup dev server with Vite middlewares or serve static build
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✨ ImagineAI Server running on http://localhost:${PORT}`);
    console.log(`🤖 Image Engines: Google Gemini (gemini-3.1-flash-lite-image) & Neural Diffusion`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
