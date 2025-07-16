import { JobPosting, Candidate, Interview, InterviewProcess } from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

export const storage = {
  getJobPostings: async (): Promise<JobPosting[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/job-postings`);
      if (!response.ok) {
        throw new Error('Failed to fetch job postings');
      }
      return await response.json();
    } catch (error) {
      console.error('Error reading job postings:', error);
      return [];
    }
  },

  getJobPosting: async (id: string): Promise<JobPosting> => {
    try {
      const response = await fetch(`${API_BASE_URL}/job-postings/${id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch job posting with id ${id}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error reading job posting with id ${id}:`, error);
      throw new Error(`Failed to fetch job posting with id ${id}`);
    }
  },

  addJobPosting: async (posting: Omit<JobPosting, 'id'>): Promise<JobPosting> => {
    try {
      const response = await fetch(`${API_BASE_URL}/job-postings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(posting),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create job posting');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating job posting:', error);
      throw new Error('Failed to create job posting');
    }
  },

  updateJobPosting: async (id: string, posting: Omit<JobPosting, 'id'>): Promise<JobPosting | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/job-postings/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(posting),
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to update job posting');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating job posting:', error);
      throw new Error('Failed to update job posting');
    }
  },

  deleteJobPosting: async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/job-postings/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          return false;
        }
        throw new Error('Failed to delete job posting');
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting job posting:', error);
      throw new Error('Failed to delete job posting');
    }
  },

  getCandidates: async (): Promise<Candidate[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/candidates`);
      if (!response.ok) {
        throw new Error('Failed to fetch candidates');
      }
      return await response.json();
    } catch (error) {
      console.error('Error reading candidates:', error);
      return [];
    }
  },

  addCandidate: async (candidate: Omit<Candidate, 'id'>): Promise<Candidate> => {
    try {
      const response = await fetch(`${API_BASE_URL}/candidates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(candidate),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create candidate');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating candidate:', error);
      throw new Error('Failed to create candidate');
    }
  },

  updateCandidate: async (id: string, candidate: Omit<Candidate, 'id'>): Promise<Candidate | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/candidates/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(candidate),
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to update candidate');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating candidate:', error);
      throw new Error('Failed to update candidate');
    }
  },

  deleteCandidate: async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/candidates/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          return false;
        }
        throw new Error('Failed to delete candidate');
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting candidate:', error);
      throw new Error('Failed to delete candidate');
    }
  },

  getInterviews: async (): Promise<Interview[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/interviews`);
      if (!response.ok) {
        throw new Error('Failed to fetch interviews');
      }
      return await response.json();
    } catch (error) {
      console.error('Error reading interviews:', error);
      return [];
    }
  },

  createInterview: async (interview: Omit<Interview, 'id'>): Promise<Interview> => {
    try {
      const response = await fetch(`${API_BASE_URL}/interviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(interview),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create interview');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating interview:', error);
      throw new Error('Failed to create interview');
    }
  },

  getInterviewProcesses: async (): Promise<InterviewProcess[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/interview-processes`);
      if (!response.ok) {
        throw new Error('Failed to fetch interview processes');
      }
      return await response.json();
    } catch (error) {
      console.error('Error reading interview processes:', error);
      return [];
    }
  },

  createInterviewProcess: async (process: Omit<InterviewProcess, 'id'>): Promise<InterviewProcess> => {
    try {
      const response = await fetch(`${API_BASE_URL}/interview-processes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(process),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create interview process');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating interview process:', error);
      throw new Error('Failed to create interview process');
    }
  },

  getInterviewProcess: async (id: string): Promise<InterviewProcess | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/interview-processes/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to fetch interview process');
      }
      return await response.json();
    } catch (error) {
      console.error('Error reading interview process:', error);
      throw new Error('Failed to fetch interview process');
    }
  },

  updateInterviewProcess: async (id: string, process: Partial<InterviewProcess>): Promise<InterviewProcess | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/interview-processes/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(process),
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to update interview process');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating interview process:', error);
      throw new Error('Failed to update interview process');
    }
  },

  scheduleInterview: async (interview: Omit<Interview, 'id'>): Promise<Interview> => {
    try {
      const response = await fetch(`${API_BASE_URL}/interviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(interview),
      });
      
      if (!response.ok) {
        throw new Error('Failed to schedule interview');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error scheduling interview:', error);
      throw new Error('Failed to schedule interview');
    }
  },

  updateInterview: async (id: string, interview: Partial<Interview>): Promise<Interview | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/interviews/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(interview),
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to update interview');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating interview:', error);
      throw new Error('Failed to update interview');
    }
  },

  deleteInterview: async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/interviews/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          return false;
        }
        throw new Error('Failed to delete interview');
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting interview:', error);
      throw new Error('Failed to delete interview');
    }
  }
}; 