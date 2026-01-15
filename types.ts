
export enum View {
  DASHBOARD = 'DASHBOARD',
  MASTERCLASS = 'MASTERCLASS', 
  SHORTS_GENERATOR = 'SHORTS_GENERATOR',
  POST_TEMPLATES = 'POST_TEMPLATES',
  VIRAL_GENERATOR = 'VIRAL_GENERATOR',
  VIRAL_SEARCH = 'VIRAL_SEARCH',
  TRENDS_BOARD = 'TRENDS_BOARD',
  VIDEO_REPURPOSER = 'VIDEO_REPURPOSER',
  STUDIO_JAMES = 'STUDIO_JAMES',
  VIDEO_MAKER = 'VIDEO_MAKER',
  FREE_VIDEO_GENERATOR = 'FREE_VIDEO_GENERATOR',
  IMAGE_GENERATOR = 'IMAGE_GENERATOR',
  AUTHORITY_GENERATOR = 'AUTHORITY_GENERATOR',
  FACE_FUSION = 'FACE_FUSION',
  SAVED_POSTS = 'SAVED_POSTS',
  SCHEDULER = 'SCHEDULER',
  ADMIN = 'ADMIN',
  ACCOUNT = 'ACCOUNT',
  SETTINGS = 'SETTINGS',
  VIRAL_MOCKUPS = 'VIRAL_MOCKUPS',
  CAROUSEL_DESIGNER = 'CAROUSEL_DESIGNER',
  VIRAL_PATTERNS = 'VIRAL_PATTERNS',
  NICHE_EXPLORER = 'NICHE_EXPLORER',
  BLOG_ARCHITECT = 'BLOG_ARCHITECT',
  WHATSAPP_BRIDGE = 'WHATSAPP_BRIDGE',
  LEAD_CRM = 'LEAD_CRM',
  NEURAL_COMMAND = 'NEURAL_COMMAND'
}

export interface ContentItem {
  id: string;
  title: string;
  type: 'Blog' | 'Facebook' | 'X' | 'Instagram' | 'TikTok' | 'WhatsApp';
  status: 'Draft' | 'Scheduled' | 'Published';
  date: string;
  engagement?: string;
}

export interface Lead {
  id: string;
  name: string;
  source: string;
  status: 'Hooked' | 'Engaged' | 'Conversion' | 'Closed';
  notes: string;
  lastContact: number;
}

export interface SavedItem {
  id: string;
  type: 'Post' | 'Image' | 'Video' | 'Audio' | 'Sequence';
  content: string; 
  preview?: string; 
  title: string; 
  createdAt: number;
}

export enum AIModel {
  TEXT = 'gemini-3-flash-preview',
  IMAGE_EDIT = 'gemini-2.5-flash-image',
  IMAGE_GEN = 'imagen-4.0-generate-001',
  TTS = 'gemini-2.5-flash-preview-tts',
  VIDEO = 'veo-3.1-fast-generate-preview',
  LIVE = 'gemini-2.5-flash-native-audio-preview-12-2025'
}
