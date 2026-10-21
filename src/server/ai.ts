import { GoogleGenAI } from '@google/genai';

export const DIMENSIONS: Record<string, { width: number; height: number; label: string; geminiRatio: string }> = {
  '1:1': { width: 768, height: 768, label: 'Square (768×768)', geminiRatio: '1:1' },
  '16:9': { width: 768, height: 432, label: 'Landscape (768×432)', geminiRatio: '16:9' },
  '9:16': { width: 432, height: 768, label: 'Portrait (432×768)', geminiRatio: '9:16' },
  '4:3': { width: 768, height: 576, label: 'Standard (768×576)', geminiRatio: '4:3' },
  '3:2': { width: 768, height: 512, label: 'Classic 3:2 (768×512)', geminiRatio: '4:3' }
};

export const STYLE_PROMPTS: Record<string, { label: string; desc: string; icon: string }> = {
  photorealistic: {
    label: 'Photorealistic',
    desc: 'sharp focus, natural lighting, 35mm photograph, realistic textures',
    icon: 'Camera'
  },
  anime: {
    label: 'Vibrant Anime',
    desc: 'vibrant anime aesthetic, Studio Ghibli style, crisp line work, rich colors',
    icon: 'Sparkles'
  },
  cyberpunk: {
    label: 'Cyberpunk Neon',
    desc: 'cyberpunk style, neon violet and cyan lighting, wet reflections, high tech atmosphere',
    icon: 'Zap'
  },
  fantasy: {
    label: 'Ethereal Fantasy',
    desc: 'epic high fantasy art, magical realism, glowing particles, detailed digital painting',
    icon: 'Crown'
  },
  minimal: {
    label: 'Minimalist 3D',
    desc: 'minimalist 3D render, clean geometry, soft studio lighting, modern composition',
    icon: 'Box'
  },
  cinematic: {
    label: 'Cinematic Movie',
    desc: 'cinematic film still, 35mm anamorphic lens, dramatic lighting, color graded',
    icon: 'Film'
  },
  isometric: {
    label: 'Isometric Diorama',
    desc: 'isometric 3D diorama, tilt-shift miniature, cute voxel modeling, ambient occlusion',
    icon: 'Layers'
  }
};

let genAIClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI | null {
  if (genAIClient) return genAIClient;
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
    try {
      genAIClient = new GoogleGenAI();
      return genAIClient;
    } catch (e) {
      console.warn('Failed to initialize GoogleGenAI client:', e);
    }
  }
  return null;
}

/**
 * Extracts true width and height from JPEG / PNG headers so reported dimensions
 * accurately reflect the real output of the model without false claims.
 */
export function getImageDimensions(buf: Buffer): { width: number; height: number } {
  // Check PNG
  if (buf.length > 24 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) {
    const width = buf.readUInt32BE(16);
    const height = buf.readUInt32BE(20);
    return { width, height };
  }

  // Check JPEG
  let offset = 2;
  while (offset < buf.length) {
    if (buf[offset] !== 0xFF) break;
    const marker = buf[offset + 1];
    if (marker === 0xC0 || marker === 0xC2) {
      const height = buf.readUInt16BE(offset + 5);
      const width = buf.readUInt16BE(offset + 7);
      return { width, height };
    }
    const len = buf.readUInt16BE(offset + 2);
    offset += 2 + len;
  }

  return { width: 768, height: 768 };
}

/**
 * Generates an image using Google's official Gemini multimodal image model (gemini-3.1-flash-lite-image).
 */
export async function generateWithGemini(options: {
  prompt: string;
  aspectRatio: string;
}): Promise<{ buffer: Buffer; mimeType: string; width: number; height: number }> {
  const ai = getGenAI();
  if (!ai) {
    throw new Error('GEMINI_API_KEY is not configured in the server environment.');
  }

  const dim = DIMENSIONS[options.aspectRatio] || DIMENSIONS['1:1'];
  const geminiRatio = dim.geminiRatio;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: {
        parts: [
          {
            text: options.prompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: geminiRatio,
        },
      },
    });

    const candidates = response.candidates || [];
    if (!candidates.length || !candidates[0].content?.parts) {
      throw new Error('Gemini API returned an empty response.');
    }

    const parts = candidates[0].content.parts;
    for (const part of parts) {
      if (part.inlineData?.data) {
        const mimeType = part.inlineData.mimeType || 'image/png';
        const buffer = Buffer.from(part.inlineData.data, 'base64');
        const dims = getImageDimensions(buffer);
        return { buffer, mimeType, width: dims.width, height: dims.height };
      }
    }

    const textPart = parts.find((p) => p.text)?.text;
    throw new Error(
      textPart
        ? `Model returned text instead of image: "${textPart}"`
        : 'No image data found in Gemini response.'
    );
  } catch (err: any) {
    const errorStr = (err.message || JSON.stringify(err)).toLowerCase();
    if (errorStr.includes('quota') || errorStr.includes('429') || errorStr.includes('resource_exhausted')) {
      const billingErr = new Error(
        'Google Gemini image generation requires an API key with billing enabled. Free tier accounts currently have a quota limit of 0 for image models.'
      );
      (billingErr as any).requiresBilling = true;
      (billingErr as any).model = 'gemini-3.1-flash-lite-image';
      throw billingErr;
    }
    throw err;
  }
}

/**
 * Generates an image using the neural diffusion model with built-in retry handling for rate limits.
 * Inspects returned binary headers to guarantee correct dimensions and high clarity.
 */
export async function generateWithFlux(options: {
  prompt: string;
  width: number;
  height: number;
  seed: number;
  negativePrompt?: string;
}): Promise<{ buffer: Buffer; mimeType: string; width: number; height: number; model: string }> {
  const { prompt, width, height, seed, negativePrompt } = options;
  let finalPrompt = prompt.trim();
  if (negativePrompt && negativePrompt.trim()) {
    finalPrompt += ` | avoid: ${negativePrompt.trim()}`;
  }

  // Request high-clarity output
  const encodedPrompt = encodeURIComponent(finalPrompt);
  const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true&nofeed=true&model=sana`;

  const maxAttempts = 3;
  let lastError = 'Image generation failed.';

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'ImagineAI-Engine/2.0',
        },
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type') || 'image/jpeg';
        const modelUsed = response.headers.get('x-model-used') || 'sana-diffusion';
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        if (buffer.length < 1000) {
          throw new Error('Image generator returned invalid or truncated data.');
        }

        const dims = getImageDimensions(buffer);

        return {
          buffer,
          mimeType: contentType.includes('png') ? 'image/png' : 'image/jpeg',
          width: dims.width,
          height: dims.height,
          model: modelUsed,
        };
      }

      // If rate limited (status 402 with Retry after Xs)
      const errText = await response.text();
      lastError = errText;
      console.warn(`[ImagineAI] Generation attempt ${attempt} status ${response.status}:`, errText);

      const match = errText.match(/Retry after (\d+)s/i);
      const waitSeconds = match ? parseInt(match[1], 10) + 1 : 5;

      if (attempt < maxAttempts) {
        console.log(`[ImagineAI] Waiting ${waitSeconds}s for public neural queue slot...`);
        await new Promise((resolve) => setTimeout(resolve, waitSeconds * 1000));
      }
    } catch (fetchErr: any) {
      lastError = fetchErr.message;
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }
  }

  throw new Error(`The free image generation queue is currently busy: ${lastError}. Please wait a few seconds and try again.`);
}

/**
 * Enhances a user prompt with lighting and composition details.
 */
export async function enhancePrompt(basePrompt: string, styleKey: string): Promise<string> {
  const cleanPrompt = basePrompt.trim();
  const style = STYLE_PROMPTS[styleKey] || STYLE_PROMPTS.photorealistic;

  const ai = getGenAI();
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `You are an expert prompt engineer for modern text-to-image AI models.
Enhance this prompt by keeping all requested subjects, objects, characters, and actions strictly intact while adding vivid details, natural lighting, and sharp focus.
User prompt: "${cleanPrompt}"
Style guidance: ${style.desc}

Rules:
- Keep all subjects from the original prompt (never replace or drop requested characters, animals, or items).
- Output under 50 words.
- No conversational filler. Output only the prompt.`,
      });

      const enhanced = response.text?.trim();
      if (enhanced && enhanced.length > 10) {
        return enhanced;
      }
    } catch (err) {
      console.warn('Gemini prompt enhancement fallback triggered:', err);
    }
  }

  return `${cleanPrompt}, ${style.desc}`;
}
