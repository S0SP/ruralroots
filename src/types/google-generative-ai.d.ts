declare module '@google/generative-ai/dist/index.js' {
  export class GoogleGenerativeAI {
    constructor(apiKey: string);
    getGenerativeModel(config: { model: string }): GenerativeModel;
  }

  interface GenerativeModel {
    generateContent(contents: Array<string | { inlineData: { data: string; mimeType: string } }>): Promise<GenerateContentResult>;
  }

  interface GenerateContentResult {
    response: {
      text: () => string;
    };
  }
} 