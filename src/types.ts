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

export interface StyleOption {
  id: string;
  label: string;
  icon: string;
}

export interface RatioOption {
  id: string;
  label: string;
  width: number;
  height: number;
  aspect: string;
}

export interface StatsData {
  totalCreations: number;
  totalLikes: number;
  stylesCount: Record<string, number>;
}
