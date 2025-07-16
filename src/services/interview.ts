import { generateContent } from './gemini';
import { InterviewStage, JobPosting, InterviewQuestion, InterviewFeedback } from '../types';

export const generateInterviewQuestions = async (
  stage: InterviewStage,
  jobPosting: JobPosting
): Promise<InterviewQuestion[]> => {
  const prompt = `Generate exactly 5 interview questions for a ${stage.type} interview for a ${jobPosting.title} position.
  
Job details:
Title: ${jobPosting.title}
Department: ${jobPosting.department}
Description: ${jobPosting.description}
Experience Level: ${jobPosting.experience}

For each question, provide:
1. The question text
2. The type of question (technical, behavioral, or situational)
3. What to look for in the answer
4. The scoring criteria (what constitutes a good vs poor response)

Format each question as a JSON object with these exact fields:
{
  "text": "question text here",
  "type": "open_ended",
  "category": "type of question",
  "expectedAnswer": "what to look for in the answer"
}

Return exactly 5 questions in a JSON array.`;

  const response = await generateContent(prompt);
  
  try {
    const questions = JSON.parse(response);
    return questions.slice(0, 5).map((q: any) => ({
      text: q.text || 'Question text not provided',
      type: 'open_ended' as const,
      category: q.category || stage.type,
      expectedAnswer: q.expectedAnswer || 'Looking for clear, structured responses demonstrating relevant experience and knowledge'
    }));
  } catch (error) {
    console.error('Error parsing Gemini response:', error);
    // Fallback questions if parsing fails
    return Array(5).fill(null).map((_, i) => ({
      text: `Question ${i + 1} for ${stage.type} stage`,
      type: 'open_ended' as const,
      category: stage.type,
      expectedAnswer: 'Looking for clear, structured responses demonstrating relevant experience and knowledge'
    }));
  }
};

export const analyzeAnswer = async (
  question: InterviewQuestion,
  answer: string,
): Promise<{ score: number; feedback: string }> => {
  const prompt = `Analyze the following interview answer for the question: "${question.text}"

Expected answer criteria:
${question.expectedAnswer}

Candidate's answer:
${answer}

Please provide:
1. A score from 0-100
2. Specific feedback on the answer's strengths and areas for improvement`;

  const response = await generateContent(prompt);
  const scoreMatch = response.match(/score:\s*(\d+)/i);
  const feedbackMatch = response.match(/feedback:([\s\S]*?)(?=\n\n|$)/i);

  return {
    score: scoreMatch ? parseInt(scoreMatch[1], 10) : 50,
    feedback: feedbackMatch ? feedbackMatch[1].trim() : 'No specific feedback provided'
  };
};

export const generateStageFeedback = async (
  questions: InterviewQuestion[],
  stage: InterviewStage
): Promise<InterviewFeedback> => {
  const prompt = `Analyze the following interview responses for a ${stage.type} interview:

${questions.map(q => `
Question: ${q.text}
Answer: ${q.actualAnswer}
Score: ${q.score}
Individual Feedback: ${q.feedback}
`).join('\n')}

Please provide:
1. An overall assessment score (0-100)
2. A summary of the candidate's performance
3. Recommended next steps`;

  const response = await generateContent(prompt);
  const scoreMatch = response.match(/overall score:\s*(\d+)/i);
  const feedbackMatch = response.match(/summary:([\s\S]*?)(?=next steps:|$)/i);
  const nextStepsMatch = response.match(/next steps:([\s\S]*?)$/i);

  const averageScore = questions.reduce((sum, q) => sum + (q.score || 0), 0) / questions.length;

  return {
    overallScore: scoreMatch ? parseInt(scoreMatch[1], 10) : Math.round(averageScore),
    feedback: feedbackMatch ? feedbackMatch[1].trim() : 'No overall feedback provided',
    nextSteps: nextStepsMatch ? nextStepsMatch[1].trim() : 'No next steps provided'
  };
}; 