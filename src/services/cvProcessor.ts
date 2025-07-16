import { GoogleGenerativeAI } from '@google/generative-ai';
import { Candidate } from '../types';

const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY || '');

interface ExtractedCVData {
  personalInfo: {
    name: string;
    email: string;
    phone?: string;
    location?: string;
  };
  workExperience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate?: string;
    description: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    graduationDate: string;
  }>;
  skills: string[];
  languages: string[];
  certifications: string[];
}

export async function processCV(file: File): Promise<ExtractedCVData> {
  try {
    // Convert file to base64
    const base64Data = await fileToBase64(file);

    // Get the model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Prepare the prompt
    const prompt = `Analyze this CV and extract the following information in JSON format:
    {
      "personalInfo": {
        "name": "Full name",
        "email": "Email address",
        "phone": "Phone number (if available)",
        "location": "Location/City (if available)"
      },
      "workExperience": [
        {
          "company": "Company name",
          "position": "Job title",
          "startDate": "Start date",
          "endDate": "End date (or 'Present')",
          "description": "Brief description of responsibilities"
        }
      ],
      "education": [
        {
          "institution": "Institution name",
          "degree": "Degree name",
          "field": "Field of study",
          "graduationDate": "Graduation date"
        }
      ],
      "skills": ["List of technical and professional skills"],
      "languages": ["List of languages"],
      "certifications": ["List of certifications"]
    }

    Please ensure:
    1. The response is valid JSON without any markdown formatting
    2. All dates are in a consistent format (e.g., YYYY-MM or YYYY)
    3. Empty arrays are used when no information is found
    4. Required fields (name, email) are never empty strings
    5. Optional fields can be empty strings if not found`;

    // Generate content
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: file.type,
          data: base64Data
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();
    
    // Clean up the response by removing markdown formatting and any potential text before/after the JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in the response');
    }
    
    const cleanedJson = jsonMatch[0];
    const extractedData = JSON.parse(cleanedJson);

    // Validate required fields
    if (!extractedData.personalInfo?.name || !extractedData.personalInfo?.email) {
      throw new Error('Required fields (name, email) are missing from the CV');
    }

    return extractedData;
  } catch (error) {
    console.error('Error processing CV:', error);
    throw error;
  }
}

// Helper function to convert File to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = error => reject(error);
  });
};

// Convert extracted data to Candidate type
export const convertToCandidate = (extractedData: ExtractedCVData): Omit<Candidate, 'id'> => {
  // Get the most recent position from work experience
  const position = extractedData.workExperience.length > 0
    ? extractedData.workExperience[0].position
    : 'Not Specified';

  // Calculate a basic match score based on experience and education
  const matchScore = Math.min(
    100,
    50 + // Base score
    (extractedData.workExperience.length * 5) + // Points for each work experience
    (extractedData.education.length * 5) + // Points for each education entry
    (extractedData.skills.length * 2) + // Points for each skill
    (extractedData.languages.length * 3) // Points for each language
  );

  return {
    name: extractedData.personalInfo.name || '',
    email: extractedData.personalInfo.email || '',
    phone: extractedData.personalInfo.phone || '',
    location: extractedData.personalInfo.location || '',
    position: position || 'Not Specified',
    status: 'new',
    matchScore,
    experience: extractedData.workExperience.map(exp => ({
      company: exp.company || '',
      position: exp.position || '',
      startDate: exp.startDate || '',
      endDate: exp.endDate || 'Present',
      description: exp.description || ''
    })),
    education: extractedData.education.map(edu => ({
      institution: edu.institution || '',
      degree: edu.degree || '',
      field: edu.field || '',
      graduationDate: edu.graduationDate || ''
    })),
    skills: extractedData.skills || [],
    languages: extractedData.languages || [],
    certifications: extractedData.certifications || [],
    notes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}; 