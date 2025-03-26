declare module '@google/generative-ai' {
  export class GoogleGenerativeAI {
    constructor(apiKey: string);
    getGenerativeModel(config: { model: string; safetySettings?: SafetySetting[] }): GenerativeModel;
  }

  export class GenerativeModel {
    generateContent(content: (string | GenerativeContent)[]): Promise<GenerateContentResult>;
  }

  export interface GenerativeContent {
    inlineData: {
      data: string;
      mimeType: string;
    };
  }

  export interface GenerateContentResult {
    response: {
      text(): string;
    };
  }

  export interface SafetySetting {
    category: HarmCategory;
    threshold: HarmBlockThreshold;
  }

  export enum HarmCategory {
    HARM_CATEGORY_HARASSMENT = 'HARM_CATEGORY_HARASSMENT',
    HARM_CATEGORY_HATE_SPEECH = 'HARM_CATEGORY_HATE_SPEECH',
    HARM_CATEGORY_SEXUALLY_EXPLICIT = 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
    HARM_CATEGORY_DANGEROUS_CONTENT = 'HARM_CATEGORY_DANGEROUS_CONTENT'
  }

  export enum HarmBlockThreshold {
    BLOCK_NONE = 'BLOCK_NONE',
    BLOCK_LOW = 'BLOCK_LOW',
    BLOCK_MEDIUM = 'BLOCK_MEDIUM',
    BLOCK_HIGH = 'BLOCK_HIGH'
  }
} 