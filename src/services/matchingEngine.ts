import { GoogleGenerativeAI } from '@google/generative-ai';
import { JobPosting, Candidate } from '../types';

const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY || '');

interface MatchResult {
  score: number;
  explanation: string;
  strengths: string[];
  gaps: string[];
  recommendations: string[];
}

interface Match {
  candidate: Candidate;
  jobPosting: JobPosting;
  match: MatchResult;
}

export const findMatchingJobs = async (candidate: Candidate, jobPostings: JobPosting[]): Promise<Match[]> => {
  const matches: Match[] = [];

  for (const jobPosting of jobPostings) {
    if (jobPosting.status !== 'published') continue;

    const match = await analyzeMatch(candidate, jobPosting);
    if (match.score > 0) {
      matches.push({
        candidate,
        jobPosting,
        match,
      });
    }
  }

  // Sort matches by score in descending order
  matches.sort((a, b) => b.match.score - a.match.score);

  return matches;
};

export const findMatchingCandidates = async (jobPosting: JobPosting, candidates: Candidate[]): Promise<Match[]> => {
  const matches: Match[] = [];

  for (const candidate of candidates) {
    const match = await analyzeMatch(candidate, jobPosting);
    if (match.score > 0) {
      matches.push({
        candidate,
        jobPosting,
        match,
      });
    }
  }

  // Sort matches by score in descending order
  matches.sort((a, b) => b.match.score - a.match.score);

  return matches;
};

const analyzeMatch = async (candidate: Candidate, jobPosting: JobPosting): Promise<MatchResult> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Analyze the compatibility between this candidate and job posting. 
    Provide a detailed analysis including:
    1. Overall match score (0-100)
    2. Explanation of the score
    3. Key strengths that make this a good match
    4. Potential gaps or areas for improvement
    5. Recommendations for the candidate

    Job Posting:
    Title: ${jobPosting.title}
    Department: ${jobPosting.department}
    Location: ${jobPosting.location}
    Employment Type: ${jobPosting.employmentType}
    Shift: ${jobPosting.shift}
    Experience Level: ${jobPosting.experience}
    Store Type: ${jobPosting.storeType}
    Physical Requirements: ${jobPosting.physicalRequirements.join(', ')}
    Benefits: ${jobPosting.benefits.join(', ')}
    Description: ${jobPosting.description}

    Candidate Profile:
    Name: ${candidate.name}
    Position: ${candidate.position}
    Location: ${candidate.location}
    Experience: ${candidate.experience.map(exp => 
      `${exp.position} at ${exp.company} (${exp.startDate} - ${exp.endDate}): ${exp.description}`
    ).join('\n')}
    Education: ${candidate.education.map(edu => 
      `${edu.degree} in ${edu.field} from ${edu.institution} (${edu.graduationDate})`
    ).join('\n')}
    Skills: ${candidate.skills.join(', ')}
    Languages: ${candidate.languages.join(', ')}
    Certifications: ${candidate.certifications.join(', ')}

    Please provide the analysis in the following JSON format:
    {
      "score": number,
      "explanation": string,
      "strengths": string[],
      "gaps": string[],
      "recommendations": string[]
    }

    Consider factors like:
    - Location match and relocation requirements
    - Language requirements
    - Experience level match
    - Skills alignment
    - Education relevance
    - Industry experience`;

    // Generate the analysis
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean up the response by removing markdown formatting and any potential text before/after the JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in the response');
    }
    
    const cleanedJson = jsonMatch[0];
    const matchResult = JSON.parse(cleanedJson);

    return matchResult;
  } catch (error) {
    console.error('Error analyzing match:', error);
    return {
      score: 0,
      explanation: 'Error analyzing match. Please try again.',
      strengths: [],
      gaps: [],
      recommendations: [],
    };
  }
};

export async function matchCandidateWithJob(
  candidate: Candidate,
  jobPosting: JobPosting
): Promise<MatchResult> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Prepare the prompt for the matching analysis
    const prompt = `Analyze the compatibility between this candidate and job posting. 
    Provide a detailed analysis including:
    1. Overall match score (0-100)
    2. Explanation of the score
    3. Key strengths that make this a good match
    4. Potential gaps or areas for improvement
    5. Recommendations for the candidate

    Job Posting:
    Title: ${jobPosting.title}
    Department: ${jobPosting.department}
    Location: ${jobPosting.location}
    Employment Type: ${jobPosting.employmentType}
    Shift: ${jobPosting.shift}
    Experience Level: ${jobPosting.experience}
    Store Type: ${jobPosting.storeType}
    Physical Requirements: ${jobPosting.physicalRequirements.join(', ')}
    Benefits: ${jobPosting.benefits.join(', ')}
    Description: ${jobPosting.description}

    Candidate Profile:
    Name: ${candidate.name}
    Position: ${candidate.position}
    Experience: ${candidate.experience.map(exp => 
      `${exp.position} at ${exp.company} (${exp.startDate} - ${exp.endDate})`
    ).join('\n')}
    Education: ${candidate.education.map(edu => 
      `${edu.degree} in ${edu.field} from ${edu.institution} (${edu.graduationDate})`
    ).join('\n')}
    Skills: ${candidate.skills.join(', ')}
    Languages: ${candidate.languages.join(', ')}
    Certifications: ${candidate.certifications.join(', ')}
    Current Status: ${candidate.status}
    Current Match Score: ${candidate.matchScore}

    Please provide the analysis in the following JSON format:
    {
      "score": number,
      "explanation": string,
      "strengths": string[],
      "gaps": string[],
      "recommendations": string[]
    }`;

    // Generate the analysis
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean up the response by removing markdown formatting and any potential text before/after the JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in the response');
    }
    
    const cleanedJson = jsonMatch[0];
    const matchResult = JSON.parse(cleanedJson);

    return matchResult;
  } catch (error) {
    console.error('Error matching candidate with job:', error);
    throw error;
  }
}

