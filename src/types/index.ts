import { ReactNode } from 'react';

export interface LayoutProps {
  children: ReactNode;
}

export interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  status: 'draft' | 'published' | 'closed';
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  position: string;
  status: 'new' | 'reviewing' | 'interviewing' | 'offered' | 'rejected';
  matchScore: number;
}

export interface Interview {
  id: string;
  candidateName: string;
  position: string;
  interviewer: string;
  date: string;
  type: 'phone' | 'technical' | 'behavioral' | 'final';
  status: 'scheduled' | 'completed' | 'cancelled';
} 