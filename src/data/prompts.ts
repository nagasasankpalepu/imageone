export interface InspirationPrompt {
  id: string;
  category: string;
  title: string;
  prompt: string;
  style: string;
  aspectRatio: string;
}

export const SURPRISE_PROMPTS = [
  {
    prompt: 'A bioluminescent glass greenhouse perched on a mossy Nordic cliff at twilight, glowing exotic flora inside, misty sea waves crashing below',
    style: 'photorealistic',
    aspectRatio: '16:9'
  },
  {
    prompt: 'Floating sky island with ancient marble ruins, crystalline waterfalls flowing into pastel dawn clouds, flock of golden cranes',
    style: 'anime',
    aspectRatio: '1:1'
  },
  {
    prompt: 'Cyberpunk street vendor selling holographic noodle bowls under vibrant neon signage in rainy Neo-Tokyo, retro-futuristic detailing',
    style: 'cyberpunk',
    aspectRatio: '16:9'
  },
  {
    prompt: 'An armored celestial knight riding an iridescent crystal stag across a starry cosmic meadow, ethereal aurora borealis',
    style: 'fantasy',
    aspectRatio: '9:16'
  },
  {
    prompt: 'Isometric architectural cutaway of a cozy subterranean library with reading nooks, warm lamps, spiral staircases, and tiny sleeping foxes',
    style: 'isometric',
    aspectRatio: '4:3'
  },
  {
    prompt: 'Minimalist frosted glass sphere reflecting a serene desert dunescape under a pale lilac sky, clean modern Scandinavian sculpture',
    style: 'minimal',
    aspectRatio: '1:1'
  },
  {
    prompt: 'Cinematic wide shot of a futuristic solar train speeding through an orange canyon during golden hour, dust trails, anamorphic lens flare',
    style: 'cinematic',
    aspectRatio: '16:9'
  },
  {
    prompt: 'A wise mechanical owl made of ornate brass clockwork gears and luminous sapphire eyes perched on an antique leather grimoire',
    style: 'fantasy',
    aspectRatio: '1:1'
  }
];

export const INSPIRATION_LIBRARY: InspirationPrompt[] = [
  {
    id: 'insp-1',
    category: 'Cyberpunk & Sci-Fi',
    title: 'Neon Skyscraper Overlook',
    prompt: 'A cybernetic street detective wearing an illuminated trench coat standing on a wet neon rooftop, gazing over towering skyscrapers of a dystopian city',
    style: 'cyberpunk',
    aspectRatio: '16:9'
  },
  {
    id: 'insp-2',
    category: 'Cyberpunk & Sci-Fi',
    title: 'Orbital Habitat Greenhouse',
    prompt: 'Interior of a massive cylindrical space colony with lush terraced orchards, artificial sunlight streaming through gigantic curved window arrays',
    style: 'cinematic',
    aspectRatio: '16:9'
  },
  {
    id: 'insp-3',
    category: 'Fantasy & Mystical',
    title: 'Celestial Spirit Wolf',
    prompt: 'A gigantic mythical wolf composed of shimmering stardust and midnight aurora wandering through an enchanted snowy pine forest',
    style: 'fantasy',
    aspectRatio: '1:1'
  },
  {
    id: 'insp-4',
    category: 'Fantasy & Mystical',
    title: 'Tree of Whispering Glyphs',
    prompt: 'Ancient colossal willow tree with glowing turquoise runes carved into its silver bark, glowing butterflies fluttering around crystal pools',
    style: 'fantasy',
    aspectRatio: '9:16'
  },
  {
    id: 'insp-5',
    category: 'Anime & Illustration',
    title: 'Cozy Train Compartment at Sunset',
    prompt: 'Two young friends sharing headphones inside a vintage train carriage as warm crimson sunset light pours through the window over coastal hills',
    style: 'anime',
    aspectRatio: '16:9'
  },
  {
    id: 'insp-6',
    category: 'Anime & Illustration',
    title: 'Rooftop Stargazing in Kyoto',
    prompt: 'High school student sitting on a traditional tile rooftop with a telescope, shooting stars streaking across a deep indigo summer night',
    style: 'anime',
    aspectRatio: '1:1'
  },
  {
    id: 'insp-7',
    category: '3D & Minimalist',
    title: 'Floating Zen Stones & Water',
    prompt: 'Smooth obsidian pebbles floating weightlessly above a calm reflective pool in a clean brutalist concrete courtyard, soft natural morning shadow',
    style: 'minimal',
    aspectRatio: '4:3'
  },
  {
    id: 'insp-8',
    category: '3D & Minimalist',
    title: 'Isometric Cyberpunk Alleyway',
    prompt: 'Isometric 3D diorama of a tiny cyber alley with neon vending machines, cat on fire escape, puddle reflections, tilt-shift miniature effect',
    style: 'isometric',
    aspectRatio: '1:1'
  },
  {
    id: 'insp-9',
    category: 'Photorealistic & Portraits',
    title: 'Emerald Desert Nomad',
    prompt: 'Hyper-detailed close-up portrait of a weathered desert wanderer with intense green eyes, wrapped in indigo linen, backlit by setting sun',
    style: 'photorealistic',
    aspectRatio: '9:16'
  },
  {
    id: 'insp-10',
    category: 'Photorealistic & Portraits',
    title: 'Deep Ocean Bioluminescent Jellyfish',
    prompt: 'Close-up macro shot of a crystalline translucent jellyfish pulsing in midnight abyssal water, radiating electric sapphire and magenta filaments',
    style: 'photorealistic',
    aspectRatio: '1:1'
  }
];
