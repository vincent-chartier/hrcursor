import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Interview, Candidate, JobPosting, InterviewProcess } from '../types';
import { storage } from '../services/storage';
import { InterviewProcessForm } from '../components/InterviewProcessForm';
import InterviewStageFlow from '../components/InterviewStageFlow';

const Interviews: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [processes, setProcesses] = useState<InterviewProcess[]>([]);
  const [candidates, setCandidates] = useState<Record<string, Candidate>>({});
  const [jobPostings, setJobPostings] = useState<Record<string, JobPosting>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessFormOpen, setIsProcessFormOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [selectedJobPosting, setSelectedJobPosting] = useState<JobPosting | null>(null);
  const [currentInterview, setCurrentInterview] = useState<Interview | null>(null);

  const statuses = ['all', 'scheduled', 'in_progress', 'completed', 'cancelled'];
  const dateRanges = ['all', 'today', 'tomorrow', 'this-week', 'next-week'];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Check for candidate and job posting IDs in the URL
    const params = new URLSearchParams(location.search);
    const candidateId = params.get('candidateId');
    const jobPostingId = params.get('jobPostingId');

    if (candidateId && jobPostingId && candidates[candidateId] && jobPostings[jobPostingId]) {
      setSelectedCandidate(candidates[candidateId]);
      setSelectedJobPosting(jobPostings[jobPostingId]);
      setIsProcessFormOpen(true);
    }
  }, [location, candidates, jobPostings]);

  useEffect(() => {
    if (id) {
      const interview = interviews.find(i => i.id === id);
      if (interview) {
        setCurrentInterview(interview);
      }
    } else {
      setCurrentInterview(null);
    }
  }, [id, interviews]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [interviewsData, processesData, candidatesData, jobPostingsData] = await Promise.all([
        storage.getInterviews(),
        storage.getInterviewProcesses(),
        storage.getCandidates(),
        storage.getJobPostings()
      ]);

      // Create lookup objects
      const candidatesMap: Record<string, Candidate> = {};
      const jobPostingsMap: Record<string, JobPosting> = {};

      candidatesData.forEach(candidate => {
        candidatesMap[candidate.id] = candidate;
      });

      jobPostingsData.forEach(posting => {
        jobPostingsMap[posting.id] = posting;
      });

      setInterviews(interviewsData);
      setProcesses(processesData);
      setCandidates(candidatesMap);
      setJobPostings(jobPostingsMap);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProcess = async (process: Omit<InterviewProcess, 'id'>) => {
    try {
      const newProcess = await storage.createInterviewProcess(process);
      setProcesses(prev => [...prev, newProcess]);
      
      // Clear URL parameters
      navigate('/interviews');
    } catch (error) {
      console.error('Error creating interview process:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const filteredInterviews = interviews.filter(interview => {
    const candidate = candidates[interview.candidateId];
    const jobPosting = jobPostings[interview.jobPostingId];
    
    const matchesSearch = 
      candidate?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      jobPosting?.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || interview.status === statusFilter;
    
    // Add date filtering logic
    const interviewDate = new Date(interview.scheduledDate);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const matchesDate = dateFilter === 'all' ||
      (dateFilter === 'today' && interviewDate.toDateString() === today.toDateString()) ||
      (dateFilter === 'tomorrow' && interviewDate.toDateString() === tomorrow.toDateString()) ||
      (dateFilter === 'this-week' && interviewDate <= nextWeek && interviewDate >= today);
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleDeleteInterview = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this interview?')) {
      try {
        await storage.deleteInterview(id);
        setInterviews(prev => prev.filter(interview => interview.id !== id));
      } catch (error) {
        console.error('Error deleting interview:', error);
        alert('Failed to delete interview. Please try again.');
      }
    }
  };

  const handleViewInterview = (interviewId: string) => {
    navigate(`/interviews/${interviewId}`);
  };

  if (id && !currentInterview) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="text-gray-500 mb-4">Interview not found</div>
        <button
          onClick={() => navigate('/interviews')}
          className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Back to Interviews
        </button>
      </div>
    );
  }

  if (currentInterview) {
    const candidate = candidates[currentInterview.candidateId];
    const jobPosting = jobPostings[currentInterview.jobPostingId];
    const process = processes.find(p => p.id === currentInterview.processId);

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center mb-8">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Interview Details</h1>
            <p className="mt-2 text-sm text-gray-700">
              Details for interview with {candidate?.name} for {jobPosting?.title} position
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              type="button"
              onClick={() => navigate('/interviews')}
              className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
            >
              Back to List
            </button>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Interview Information</h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Candidate</dt>
                <dd className="mt-1 text-sm text-gray-900">{candidate?.name}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Position</dt>
                <dd className="mt-1 text-sm text-gray-900">{jobPosting?.title}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Interviewer</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {currentInterview.interviewer.name}
                  <div className="text-gray-500 text-xs">{currentInterview.interviewer.role}</div>
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Date</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(currentInterview.scheduledDate)}</dd>
              </div>
            </dl>
          </div>
        </div>

        {process && (
          <div className="mt-8">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Interview Process</h3>
            <InterviewStageFlow
              process={process}
              currentInterview={currentInterview}
              onUpdateInterview={async (updatedInterview: Interview) => {
                try {
                  await storage.updateInterview(updatedInterview.id, updatedInterview);
                  // Refresh the interviews list
                  const updatedInterviews = await storage.getInterviews();
                  setInterviews(updatedInterviews);
                } catch (error) {
                  console.error('Error updating interview:', error);
                  alert('Failed to update interview. Please try again.');
                }
              }}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Interviews</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all scheduled and completed interviews.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => setIsProcessFormOpen(true)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Start Interview Process
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:space-x-4">
        <div className="flex-1">
          <div className="relative rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-md border-gray-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Search interviews..."
            />
          </div>
        </div>
        <div className="mt-2 sm:mt-0 flex space-x-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
          >
            {dateRanges.map((range) => (
              <option key={range} value={range}>
                {range.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-8 flex justify-center items-center h-32">
          <div className="text-gray-500">Loading interviews...</div>
        </div>
      ) : filteredInterviews.length === 0 ? (
        <div className="mt-8 flex flex-col justify-center items-center h-64 bg-white rounded-lg border border-gray-200">
          <div className="text-gray-500 text-lg mb-2">No interviews found</div>
          <p className="text-gray-400 text-sm text-center max-w-md">
            There are currently no interviews scheduled.
          </p>
        </div>
      ) : (
        <div className="mt-8 flex flex-col">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Candidate
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Position
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Stage
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Date
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Status
                      </th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredInterviews.map((interview) => {
                      const candidate = candidates[interview.candidateId];
                      const jobPosting = jobPostings[interview.jobPostingId];
                      const process = processes.find(p => p.id === interview.processId);
                      
                      return (
                        <tr key={interview.id}>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <div className="font-medium text-gray-900">{candidate?.name}</div>
                            <div className="text-gray-500">{candidate?.email}</div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <div className="font-medium text-gray-900">{jobPosting?.title}</div>
                            <div className="text-gray-500">{jobPosting?.department}</div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                            {interview.stage?.name || 'Not set'}
                            {process && (
                              <div className="text-gray-500">
                                Stage {process?.currentStage !== undefined ? process.currentStage + 1 : 1} of {process?.stages?.length ?? 1}
                              </div>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                            {formatDate(interview.scheduledDate)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusColor(interview.status)}`}>
                              {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                            </span>
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <button
                              onClick={() => handleViewInterview(interview.id)}
                              className="text-indigo-600 hover:text-indigo-900 mr-4"
                            >
                              View<span className="sr-only">, {candidate?.name}</span>
                            </button>
                            <button
                              onClick={() => handleDeleteInterview(interview.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete<span className="sr-only">, {candidate?.name}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {isProcessFormOpen && selectedCandidate && selectedJobPosting && (
        <InterviewProcessForm
          isOpen={isProcessFormOpen}
          onClose={() => {
            setIsProcessFormOpen(false);
            setSelectedCandidate(null);
            setSelectedJobPosting(null);
          }}
          candidate={selectedCandidate}
          jobPosting={selectedJobPosting}
          onSubmit={handleCreateProcess}
        />
      )}
    </div>
  );
};

export default Interviews; 