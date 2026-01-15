
import { GoogleGenAI, Modality, Type } from "@google/genai";

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found. Please provide API_KEY in environment.");
  }
  return new GoogleGenAI({ apiKey });
};

const ASSISTANT_SYSTEM_INSTRUCTION = `
You are **GreenNova AI**, the definitive business growth engine for the **Sustainable Business Launch System (SBL)**.
Your persona is a high-level strategic architect, modeled after elite business coaching frameworks.

## Core Capabilities:
- Move users from "Operator" (manual grind) to "Architect" (system scaling).
- Analyze content for "Viral DNA".
- Draft closing scripts for WhatsApp and DMs.
- Suggest "Blue Ocean" niche pivots.

## Response Style:
- Professional, authoritative, yet encouraging.
- Use bold headers and markdown lists.
- Refer to tools within the GreenNova dashboard (e.g., "Use the Authority Studio to anchor this insight").
`;

export const startAssistantChat = (userContext?: string) => {
  const ai = getAIClient();
  const contextInstruction = userContext 
    ? `\n\nCURRENT USER WORKSPACE CONTEXT:\n${userContext}\n\nTailor all advice to this specific business setup.`
    : "";

  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: ASSISTANT_SYSTEM_INSTRUCTION + contextInstruction,
      temperature: 0.7,
    },
  });
};

export interface WhatsAppParams {
  leadName: string;
  niche: string;
  painPoint: string;
  offer: string;
  ctaKeyword: string;
  tone: string;
  mode: 'Opener' | 'FollowUp' | 'ObjectionKiller' | 'StatusHook' | 'GroupProtocol';
}

export const generateWhatsAppSequences = async (params: WhatsAppParams) => {
  const ai = getAIClient();
  const systemInstruction = `
You are a High-Status DM Closing Specialist. Your goal is to architect a WhatsApp asset that forces engagement and conversion.

MODE: ${params.mode}
TONE: ${params.tone}
CONTEXT: 
- Lead: ${params.leadName}
- Niche: ${params.niche}
- Offer: ${params.offer}
- Action Keyword: ${params.ctaKeyword}

RULES:
- No corporate jargon.
- Use "Pattern Interrupts" (ask an unexpected, high-value question).
- If STATUS mode: generate 3 sequential status frames (Text based).
- If GROUP mode: generate a high-value community contribution script.
- Move to a call or specific link quickly.
`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [{ text: `Architect a WhatsApp ${params.mode} asset.` }] },
    config: { systemInstruction, temperature: 0.8 }
  });

  return response.text || "";
};

export const analyzeLeadPsychology = async (notes: string): Promise<string> => {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze this lead's profile and suggest a closing strategy: ${notes}`,
        config: { systemInstruction: "Lead Strategy Architect. Provide 3 bullet points." }
    });
    return response.text || "Analysis unavailable.";
};

export interface AnalysisResult {
    cancellation_risk: number;
    renewal_action: string;
    plan_change: string;
    message_template: string;
    priority_score: number;
}

export interface ViralPatternIntelligence {
  patterns: {
    title: string;
    hook_logic: string;
    hook_templates: string[];
    psychological_triggers: string[];
    visual_aesthetics: string;
    velocity_score: number;
  }[];
  niche_verdict: string;
  recommended_cta: string;
  sources?: GroundingSource[];
}

export interface SubNiche {
  name: string;
  description: string;
  audience: string;
  keywords: string[];
  profitability_score: number;
}

export interface NicheExplorerResponse {
  broad_niche: string;
  sub_niches: SubNiche[];
}

export interface ViralPostParams {
  style: string;
  platform: string;
  offerName: string;
  offerLink: string;
  offerDescription: string;
  targetAudience: string;
  ctaKeyword: string;
  topics: string[];
  hookType: string;
  language: string;
  brandTone: string;
  industry?: string;
  painPoints?: string;
  goals?: string;
  contentUrl?: string; 
  useDeepResearch?: boolean;
  imageContext?: {
    data: string;
    mimeType: string;
  };
}

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface ViralSearchResponse {
  viral_hooks: string[];
  why_it_works: string[];
  repurposed_content: {
    facebook: string;
    instagram: string;
    tiktok: string;
    x: string;
    linkedin: string;
  };
  viral_titles: string[];
  video_script: string;
  cta_variations: string[];
  image_prompt: string;
  sources?: GroundingSource[];
}

export interface TrendAnalysis {
  topic: string;
  velocity: 'Rising' | 'Exploding' | 'Peaked' | 'Evergreen';
  description: string;
  viral_hook_dna: string;
  opportunity_score: number;
}

export interface VideoGenerationParams {
  prompt: string;
  aspectRatio?: '16:9' | '9:16';
  resolution?: '720p' | '1080p';
  image?: {
    data: string;
    mimeType: string;
  };
}

export const exploreSubNiches = async (broadNiche: string): Promise<NicheExplorerResponse> => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [{ text: `Explore sub-niches for: ${broadNiche}` }] },
    config: { 
        systemInstruction: "High-Level Strategic Niche Consultant. Return JSON.",
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }]
    }
  });
  return JSON.parse(response.text || "{}");
};

export const generateViralBlog = async (params: ViralPostParams): Promise<string> => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [{ text: `Write a viral blog about: ${params.topics.join(", ")}` }] },
    config: { systemInstruction: "Viral Content Architect. 1500-3000 chars.", tools: params.useDeepResearch ? [{ googleSearch: {} }] : undefined }
  });
  return response.text || "";
};

export const getViralPatternIntelligence = async (niche: string, platform: string): Promise<ViralPatternIntelligence> => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [{ text: `Analyze patterns for: ${niche}` }] },
    config: { systemInstruction: "Viral Pattern Analyst. Return valid JSON.", responseMimeType: "application/json", tools: [{ googleSearch: {} }] }
  });
  return JSON.parse(response.text || "{}");
};

export const generateCarouselDesignerContent = async (idea: string, ctaKeyword: string, language: string = 'English'): Promise<string[]> => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [{ text: `Idea: ${idea}, CTA: ${ctaKeyword}` }] },
    config: { systemInstruction: "Visual Content Architect. Convert into 7 slides." }
  });
  return (response.text || "").split(/SLIDE \d:?/gi).filter(s => s.trim().length > 5).map(s => s.trim());
};

export const generateTrendsForNiche = async (niche: string): Promise<TrendAnalysis[]> => {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts: [{ text: `Trends for ${niche}` }] },
        config: { systemInstruction: "Identify 5-6 trending topics. Return JSON array.", responseMimeType: "application/json", tools: [{ googleSearch: {} }] }
    });
    return JSON.parse(response.text || "[]");
};

export const generateViralPost = async (params: ViralPostParams): Promise<string> => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [{ text: `Offer: ${params.offerName}` }] },
      config: { systemInstruction: "SBL Viral Strategist. Generate 11-asset campaign.", tools: params.useDeepResearch ? [{ googleSearch: {} }] : undefined }
  });
  return response.text || "";
};

export const generateQuickViralPost = async (params: ViralPostParams): Promise<{ post: string, dna: string, sources?: GroundingSource[] }> => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [{ text: `Generate for niche: ${params.topics.join(", ")}` }] },
    config: { systemInstruction: "Viral Content Specialist. Structure: [POST_CONTENT]...[/POST_CONTENT] [VIRAL_DNA]...[/VIRAL_DNA]", tools: params.useDeepResearch ? [{ googleSearch: {} }] : undefined }
  });
  const text = response.text || "";
  const post = text.match(/\[POST_CONTENT\]([\s\S]*?)\[\/POST_CONTENT\]/)?.[1]?.trim() || text;
  const dna = text.match(/\[VIRAL_DNA\]([\s\S]*?)\[\/VIRAL_DNA\]/)?.[1]?.trim() || "";
  return { post, dna };
};

export const findViralContent = async (niche: string, platform: string): Promise<ViralSearchResponse> => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [{ text: `Perform deep viral research for: ${niche} on ${platform}.` }] },
    config: { 
        systemInstruction: "Viral Research Specialist. Return JSON.",
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }]
    }
  });
  return JSON.parse(response.text || "{}");
};

export const repurposeVideoFromUrl = async (url: string, offerContext: string, ctaKeyword: string = "ACTION", language: string = 'English') => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [{ text: `Repurpose video at ${url}` }] },
    config: { systemInstruction: `Content Repurposing Architect. Analyze video and bridge to ${offerContext}.`, tools: [{ googleSearch: {} }] }
  });
  return { text: response.text || "", sources: [] };
};

export const transcribeAudio = async (data: string, mime: string): Promise<string> => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [{ inlineData: { data, mimeType: mime } }, { text: "Transcribe." }] }
  });
  return response.text || "";
};

export const generateImageNano = async (prompt: string, imageContext?: {data: string, mimeType: string}) => {
  const ai = getAIClient();
  const parts: any[] = [{ text: prompt }];
  if (imageContext) parts.unshift({ inlineData: { data: imageContext.data, mimeType: imageContext.mimeType } });
  const response = await ai.models.generateContent({ model: 'gemini-2.5-flash-image', contents: { parts } });
  return `data:image/png;base64,${response.candidates[0].content.parts.find(p => p.inlineData)?.inlineData.data}`;
};

export const generateImageNanoPro = async (prompt: string, aspectRatio: string = '1:1', imageContext?: {data: string, mimeType: string}) => {
  const ai = getAIClient();
  const parts: any[] = [{ text: prompt }];
  if (imageContext) parts.unshift({ inlineData: { data: imageContext.data, mimeType: imageContext.mimeType } });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: { parts },
    config: { imageConfig: { aspectRatio: aspectRatio as any } }
  });
  return `data:image/png;base64,${response.candidates[0].content.parts.find(p => p.inlineData)?.inlineData.data}`;
};

export const generateImage = async (prompt: string, aspectRatio: string = '1:1') => {
  const ai = getAIClient();
  const response = await ai.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt,
    config: { numberOfImages: 1, aspectRatio: aspectRatio as any }
  });
  return `data:image/png;base64,${response.generatedImages[0].image.imageBytes}`;
};

export const editImageWithPrompt = async (base64Data: string, mimeType: string, prompt: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ inlineData: { data: base64Data, mimeType } }, { text: prompt }] }
  });
  return `data:image/png;base64,${response.candidates[0].content.parts.find(p => p.inlineData)?.inlineData.data}`;
};

export const generateVideo = async (params: VideoGenerationParams) => {
  const ai = getAIClient();
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: params.prompt,
    image: params.image ? { imageBytes: params.image.data, mimeType: params.image.mimeType } : undefined,
    config: { numberOfVideos: 1, resolution: '720p', aspectRatio: params.aspectRatio || '16:9' }
  });
  while (!operation.done) {
    await new Promise(r => setTimeout(r, 10000));
    operation = await ai.operations.getVideosOperation({operation});
  }
  const response = await fetch(`${operation.response?.generatedVideos?.[0]?.video?.uri}&key=${process.env.API_KEY}`);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};

export const generateVideoMeta = async (task: 'hooks' | 'captions' | 'script', context: string, videoData?: { data: string, mimeType: string }): Promise<string> => {
    const ai = getAIClient();
    const parts: any[] = [{ text: `Task: ${task}. Context: ${context}` }];
    if (videoData) {
        parts.unshift({ inlineData: { data: videoData.data, mimeType: videoData.mimeType } });
    }
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts },
        config: { systemInstruction: "High-Status Video Strategy Architect. Produce viral hooks, smart captions or edited scripts." }
    });
    return response.text || "";
};

export const generateSpeech = async (text: string, voiceName: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: { responseModalities: [Modality.AUDIO], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } } }
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
};

export const analyzeSubscription = async (data: any): Promise<AnalysisResult> => {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts: [{ text: `Analyze subscription data and predict retention: ${JSON.stringify(data)}` }] },
        config: { 
            systemInstruction: "Subscription Intelligence Analyst. Return valid JSON.",
            responseMimeType: "application/json"
        }
    });
    return JSON.parse(response.text || "{}");
};

export const generateBusinessRoadmap = async (businessType: string): Promise<string> => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a 7-day launch roadmap for: ${businessType}.`
  });
  return response.text || "";
};

export const generateFaceFusion = async (images: {data: string, mimeType: string}[], prompt: string) => {
    const ai = getAIClient();
    const parts: any[] = images.map(img => ({ inlineData: { data: img.data, mimeType: img.mimeType } }));
    parts.push({ text: prompt });
    const response = await ai.models.generateContent({ model: 'gemini-3-pro-image-preview', contents: { parts } });
    return `data:image/png;base64,${response.candidates[0].content.parts.find(p => p.inlineData)?.inlineData.data}`;
};

export const generateFaceFusionNano = async (images: {data: string, mimeType: string}[], prompt: string) => {
    const ai = getAIClient();
    const parts: any[] = images.map(img => ({ inlineData: { data: img.data, mimeType: img.mimeType } }));
    parts.push({ text: prompt });
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash-image', contents: { parts } });
    return `data:image/png;base64,${response.candidates[0].content.parts.find(p => p.inlineData)?.inlineData.data}`;
};

export const generateVideoFromImages = async (images: {data: string, mimeType: string}[], prompt: string) => {
    const ai = getAIClient();
    const referenceImages = images.slice(0, 3).map(img => ({ image: { imageBytes: img.data, mimeType: img.mimeType }, referenceType: "ASSET" }));
    let operation = await ai.models.generateVideos({
        model: 'veo-3.1-generate-preview',
        prompt,
        config: { numberOfVideos: 1, referenceImages, resolution: '720p', aspectRatio: '16:9' }
    });
    while (!operation.done) {
        await new Promise(r => setTimeout(r, 10000));
        operation = await ai.operations.getVideosOperation({operation});
    }
    const response = await fetch(`${operation.response?.generatedVideos?.[0]?.video?.uri}&key=${process.env.API_KEY}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
};
