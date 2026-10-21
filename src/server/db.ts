import fs from 'fs';
import path from 'path';

export interface Creation {
  id: string;
  prompt: string;
  enhancedPrompt?: string;
  style: string;
  aspectRatio: string;
  width: number;
  height: number;
  imageUrl: string;
  model: string;
  seed: number;
  likes: number;
  createdAt: string;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'imagineai-creations.json');
export const IMAGES_DIR = path.resolve(DATA_DIR, 'images');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

// Initial curated community creations backed by real local files
const INITIAL_CREATIONS: Creation[] = [
  {
    id: 'seed-creation-1',
    prompt: 'A small brown monkey riding a red bicycle, carrying a bunch of yellow bananas stolen from a fruit shop with an angry shopkeeper chasing it',
    enhancedPrompt: 'A small brown monkey riding a red bicycle, carrying a bunch of yellow bananas stolen from a fruit shop with an angry shopkeeper running behind, sharp focus, natural daylight, realistic textures, clear character anatomy',
    style: 'photorealistic',
    aspectRatio: '1:1',
    width: 768,
    height: 768,
    imageUrl: '/api/images/seed-creation-1/file',
    model: 'sana-diffusion',
    seed: 555,
    likes: 42,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'seed-creation-2',
    prompt: 'Floating ancient botanical citadel covered in luminous bioluminescent wisteria vines, ethereal waterfall cascading into pastel clouds',
    enhancedPrompt: 'Floating ancient botanical citadel covered in luminous bioluminescent wisteria vines, ethereal waterfall cascading into pastel clouds, vibrant anime aesthetic, Studio Ghibli style, crisp line work, rich colors',
    style: 'anime',
    aspectRatio: '1:1',
    width: 768,
    height: 768,
    imageUrl: '/api/images/seed-creation-2/file',
    model: 'sana-diffusion',
    seed: 739102,
    likes: 89,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'seed-creation-3',
    prompt: 'Portrait of an astral traveler wearing an ornate blown glass spacesuit helmet filled with miniature swirling galaxies, warm rim light, sharp focus',
    enhancedPrompt: 'Portrait of an astral traveler wearing an ornate blown glass spacesuit helmet filled with miniature swirling galaxies, warm rim light, sharp focus, 35mm photograph, realistic textures',
    style: 'photorealistic',
    aspectRatio: '9:16',
    width: 432,
    height: 768,
    imageUrl: '/api/images/seed-creation-3/file',
    model: 'sana-diffusion',
    seed: 198421,
    likes: 67,
    createdAt: new Date(Date.now() - 3600000 * 10).toISOString(),
  },
  {
    id: 'seed-creation-4',
    prompt: 'Minimalist frosted glass isometric house surrounded by soft clay sculpted bonsai trees, gentle morning fog, muted Scandinavian pastel palette',
    enhancedPrompt: 'Minimalist frosted glass isometric house surrounded by soft clay sculpted bonsai trees, gentle morning fog, clean geometry, soft studio lighting',
    style: 'minimal',
    aspectRatio: '4:3',
    width: 768,
    height: 576,
    imageUrl: '/api/images/seed-creation-4/file',
    model: 'sana-diffusion',
    seed: 827364,
    likes: 31,
    createdAt: new Date(Date.now() - 3600000 * 15).toISOString(),
  },
  {
    id: 'seed-creation-5',
    prompt: 'Neon cybernetic feline prowling across a rain-slicked Tokyo skyscraper balcony at midnight, glowing holographic circuitry, reflections on wet chrome',
    enhancedPrompt: 'Neon cybernetic feline prowling across a rain-slicked Tokyo skyscraper balcony at midnight, glowing holographic circuitry, reflections on wet chrome, neon violet and cyan lighting',
    style: 'cyberpunk',
    aspectRatio: '16:9',
    width: 768,
    height: 432,
    imageUrl: '/api/images/seed-creation-5/file',
    model: 'sana-diffusion',
    seed: 482910,
    likes: 114,
    createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
  }
];

class Database {
  private creations: Creation[] = [];

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (!fs.existsSync(IMAGES_DIR)) {
        fs.mkdirSync(IMAGES_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Clean any old external URLs to point to local file endpoints
        this.creations = parsed.map((c: Creation) => {
          if (c.imageUrl && c.imageUrl.startsWith('http') && c.id.startsWith('seed-creation-')) {
            return { ...c, imageUrl: `/api/images/${c.id}/file` };
          }
          return c;
        });
        this.saveToFile();
      } else {
        this.creations = [...INITIAL_CREATIONS];
        this.saveToFile();
      }
    } catch (err) {
      console.error('Error initializing database, using fallback:', err);
      this.creations = [...INITIAL_CREATIONS];
    }
  }

  private saveToFile() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.creations, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  public saveImageBuffer(id: string, buffer: Buffer, mimeType = 'image/jpeg'): string {
    const ext = mimeType.includes('png') ? 'png' : 'jpg';
    const filePath = path.resolve(IMAGES_DIR, `${id}.${ext}`);
    fs.writeFileSync(filePath, buffer);
    return `/api/images/${id}/file`;
  }

  public getImageBuffer(id: string): { buffer: Buffer; mimeType: string } | null {
    const pngPath = path.resolve(IMAGES_DIR, `${id}.png`);
    if (fs.existsSync(pngPath)) {
      return { buffer: fs.readFileSync(pngPath), mimeType: 'image/png' };
    }
    const jpgPath = path.resolve(IMAGES_DIR, `${id}.jpg`);
    if (fs.existsSync(jpgPath)) {
      return { buffer: fs.readFileSync(jpgPath), mimeType: 'image/jpeg' };
    }
    return null;
  }

  public saveCreation(creation: Creation): Creation {
    this.creations.unshift(creation);
    this.saveToFile();
    return creation;
  }

  public getAllCreations(options?: {
    style?: string;
    search?: string;
    sort?: 'newest' | 'likes';
  }): Creation[] {
    let list = [...this.creations];

    if (options?.style && options.style !== 'all') {
      list = list.filter((c) => c.style.toLowerCase() === options.style?.toLowerCase());
    }

    if (options?.search && options.search.trim() !== '') {
      const q = options.search.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.prompt.toLowerCase().includes(q) ||
          c.style.toLowerCase().includes(q) ||
          (c.enhancedPrompt && c.enhancedPrompt.toLowerCase().includes(q))
      );
    }

    if (options?.sort === 'likes') {
      list.sort((a, b) => b.likes - a.likes);
    } else {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return list;
  }

  public getCreationById(id: string): Creation | undefined {
    return this.creations.find((c) => c.id === id);
  }

  public likeCreation(id: string): Creation | undefined {
    const item = this.creations.find((c) => c.id === id);
    if (item) {
      item.likes += 1;
      this.saveToFile();
      return item;
    }
    return undefined;
  }

  public deleteCreation(id: string): boolean {
    const initialLength = this.creations.length;
    this.creations = this.creations.filter((c) => c.id !== id);
    
    // Also remove local image files if present
    const pngPath = path.resolve(IMAGES_DIR, `${id}.png`);
    if (fs.existsSync(pngPath)) fs.unlinkSync(pngPath);
    const jpgPath = path.resolve(IMAGES_DIR, `${id}.jpg`);
    if (fs.existsSync(jpgPath)) fs.unlinkSync(jpgPath);

    if (this.creations.length !== initialLength) {
      this.saveToFile();
      return true;
    }
    return false;
  }

  public getStats() {
    const totalCreations = this.creations.length;
    const totalLikes = this.creations.reduce((acc, curr) => acc + curr.likes, 0);
    const stylesCount: Record<string, number> = {};

    this.creations.forEach((c) => {
      stylesCount[c.style] = (stylesCount[c.style] || 0) + 1;
    });

    return {
      totalCreations,
      totalLikes,
      stylesCount,
    };
  }
}

export const db = new Database();
