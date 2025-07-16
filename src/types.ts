export interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  description: string;
  status: 'draft' | 'published' | 'closed';
  employmentType: 'full-time' | 'part-time' | 'contract';
  shift: 'day' | 'night' | 'flexible';
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  experience: 'entry' | 'intermediate' | 'manager';
  storeType: 'hypermarket' | 'supermarket' | 'convenience';
  physicalRequirements: string[];
  benefits: string[];
}

export interface Experience {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  graduationDate: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  position: string;
  status: 'new' | 'reviewing' | 'interviewing' | 'offered' | 'rejected';
  matchScore: number;
  experience: Experience[];
  education: Education[];
  skills: string[];
  languages: string[];
  certifications: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type InterviewType = 'technical' | 'behavioral' | 'cultural_fit' | 'final';
export type InterviewStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type StageStatus = 'pending' | 'in_progress' | 'completed';

export interface InterviewQuestion {
  text: string;
  type: 'open_ended' | 'multiple_choice';
  options?: string[];
  question?: string;
  expectedAnswer?: string;
  score?: number;
  feedback?: string;
  actualAnswer?: string;
  category?: string;
}

export interface InterviewFeedback {
  overallScore: number;
  feedback: string;
  nextSteps: string;
}

export interface InterviewStage {
  id: string;
  name: string;
  type: InterviewType;
  order: number;
  interviewId?: string;
  questions?: InterviewQuestion[];
  status: StageStatus;
  passed?: boolean;
}

export interface Interviewer {
  name: string;
  email: string;
  role: string;
}

export interface Interview {
  id: string;
  candidateId: string;
  jobPostingId: string;
  processId: string;
  stage: InterviewStage;
  status: InterviewStatus;
  scheduledDate: string;
  interviewer: Interviewer;
  answers?: string[];
  createdAt: string;
  updatedAt: string;
  jobPosting: JobPosting; 
}

export interface InterviewProcess {
  id: string;
  candidateId: string;
  jobPostingId: string;
  stages: InterviewStage[];
  currentStage: number;
  status: 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export type ProcessStatus = 
  | 'in_progress'
  | 'offering'
  | 'accepted'
  | 'rejected'
  | 'withdrawn'; 