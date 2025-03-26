import { GoogleGenerativeAI } from '@google/generative-ai/dist/index.js';

// Initialize the Gemini API with the API key from environment variables
const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
console.log('API Key available:', !!API_KEY); // Debug log (will only show if key exists, not the key itself)

const genAI = new GoogleGenerativeAI(API_KEY || '');

// Function to convert file to base64
async function fileToGenerativeContent(file: File) {
  try {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result?.toString().split(',')[1];
        resolve(result || '');
      };
      reader.onerror = () => {
        console.error('Error reading file:', reader.error);
        resolve('');
      };
      reader.readAsDataURL(file);
    });

    const base64Data = await base64EncodedDataPromise;
    console.log('File converted to base64 successfully:', !!base64Data); // Debug log

    return {
      inlineData: {
        data: base64Data,
        mimeType: file.type,
      },
    };
  } catch (error) {
    console.error('Error in fileToGenerativeContent:', error);
    throw new Error('Failed to process image file');
  }
}

export interface AnalysisResult {
  diseaseName: string;
  diseaseType: string;
  reason: string;
  treatment: string;
  healTime: string;
  precautions: string[];
}

export async function analyzeImage(
  imageFile: File,
  type: string
): Promise<AnalysisResult> {
  if (!API_KEY) {
    console.error('Gemini API key not found in environment variables');
    throw new Error('API key not configured. Please check your environment variables.');
  }

  try {
    console.log('Starting image analysis for type:', type);

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash"
    });

    const prompt = `Analyze this ${type} image and provide a detailed, structured analysis. Be very specific and consistent in your response. Use exactly this format:

Disease Name & Type:
[Specific disease name] - [Type/Category of disease]

Reason:
[Provide a clear, scientific explanation of the cause, including environmental factors and visible symptoms]

Treatment & Heal Time:
1. [First immediate action to take]
2. [Chemical treatment if needed]
3. [Application method and frequency]
4. [Duration of treatment]
5. [Signs of improvement to look for]

Estimated healing time: [Specific duration]

Future Precautions:
1. [Environmental control measure]
2. [Preventive treatment]
3. [Monitoring practice]
4. [Best practice for prevention]
5. [Long-term management strategy]

Important: Keep your response structured exactly as above and be consistent in your analysis.`;

    console.log('Converting image to required format...');
    const imageParts = await fileToGenerativeContent(imageFile);
    
    console.log('Sending request to Gemini API...');
    const result = await model.generateContent([prompt, imageParts]);
    
    console.log('Received response from Gemini API');
    const response = await result.response;
    const text = response.text();

    console.log('Processing API response...');
    console.log('Raw response:', text); // Debug log

    // Initialize the result object
    const parsedResult: AnalysisResult = {
      diseaseName: '',
      diseaseType: '',
      reason: '',
      treatment: '',
      healTime: '',
      precautions: [],
    };

    // Split by section headers
    const diseaseMatch = text.match(/Disease Name & Type:\s*([^\n]+)/);
    if (diseaseMatch) {
      const [name, type] = diseaseMatch[1].split('-').map((s: string) => s.trim());
      parsedResult.diseaseName = name;
      parsedResult.diseaseType = type || '';
    }

    const reasonMatch = text.match(/Reason:\s*([^]*?)(?=Treatment & Heal Time:|Future Precautions:|$)/);
    if (reasonMatch) {
      parsedResult.reason = reasonMatch[1].trim();
    }

    const treatmentMatch = text.match(/Treatment & Heal Time:\s*([^]*?)(?=Future Precautions:|$)/);
    if (treatmentMatch) {
      const treatmentText = treatmentMatch[1].trim();
      
      // Extract healing time if present
      const healTimeMatch = treatmentText.match(/(?:Estimated healing time|Total estimated healing time|Expected recovery period|Healing duration):\s*([^]*?)(?=\n|$)/i);
      
      if (healTimeMatch) {
        parsedResult.healTime = healTimeMatch[1].trim();
        parsedResult.treatment = treatmentText.replace(healTimeMatch[0], '').trim();
      } else {
        parsedResult.treatment = treatmentText;
      }
    }

    const precautionsMatch = text.match(/Future Precautions:\s*([^]*?)$/);
    if (precautionsMatch) {
      const precautionsText = precautionsMatch[1].trim();
      parsedResult.precautions = precautionsText
        .split(/(?:\r?\n|\r)/)
        .map((line: string) => line.replace(/^[-•*]\s*/, '').trim())
        .filter((line: string) => line.length > 0);
    }

    console.log('Parsed result:', parsedResult); // Debug log
    return parsedResult;
  } catch (error) {
    console.error('Detailed error in analyzeImage:', error);
    if (error instanceof Error) {
      throw new Error(`Analysis failed: ${error.message}`);
    }
    throw new Error('Failed to analyze image. Please check the console for details.');
  }
} 