import React, { useState, useEffect } from 'react';
import { Candidate, JobPosting, Interview, InterviewStage, InterviewProcess } from '../types';
import { storage } from '../services/storage';
import { findMatchingCandidates } from '../services/matchingEngine';
import { CandidateDetailsModal } from '../components/CandidateDetailsModal';
import { JobPostingDetailsModal } from '../components/JobPostingDetailsModal';
import { MatchAnalysisPanel } from '../components/MatchAnalysisPanel';
import { InterviewProcessForm } from '../components/InterviewProcessForm';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

interface Prospect {
  candidate: Candidate;
  jobPosting: JobPosting;
  score: number;
  strengths: string[];
  gaps: string[];
}

interface StoredMatches {
  prospects: Prospect[];
  lastRefreshTime: string;
  lastKnownPostings: string[];  // Array of posting IDs
  lastKnownCandidates: string[];  // Array of candidate IDs
}

const Prospects: React.FC = () => {
  const navigate = useNavigate();
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [scoreFilter, setScoreFilter] = useState<string>('all');
  const [jobFilter, setJobFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [selectedJobPosting, setSelectedJobPosting] = useState<JobPosting | null>(null);
  const [showAnalysisPanel, setShowAnalysisPanel] = useState(false);
  const [newItemsSinceRefresh, setNewItemsSinceRefresh] = useState({ postings: 0, candidates: 0 });
  const [isProcessFormOpen, setIsProcessFormOpen] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);

  useEffect(() => {
    loadStoredMatches();
    checkForNewItems();
  }, []);

  const loadStoredMatches = () => {
    const storedData = localStorage.getItem('prospects');
    if (storedData) {
      const data: StoredMatches = JSON.parse(storedData);
      setProspects(data.prospects);
    }
  };

  const checkForNewItems = async () => {
    try {
      const storedData = localStorage.getItem('prospects');
      if (!storedData) {
        return;
      }

      const data: StoredMatches = JSON.parse(storedData);
      const currentPostings = await storage.getJobPostings();
      const currentCandidates = await storage.getCandidates();

      const newPostings = currentPostings.filter(
        posting => !data.lastKnownPostings.includes(posting.id)
      ).length;

      const newCandidates = currentCandidates.filter(
        candidate => !data.lastKnownCandidates.includes(candidate.id)
      ).length;

      setNewItemsSinceRefresh({ postings: newPostings, candidates: newCandidates });
    } catch (error) {
      console.error('Error checking for new items:', error);
    }
  };

  const loadProspects = async () => {
    setIsLoading(true);
    try {
      const jobPostings = await storage.getJobPostings();
      const candidates = await storage.getCandidates();
      const allProspects: Prospect[] = [];

      const publishedJobs = jobPostings.filter(job => job.status === 'published');

      for (const job of publishedJobs) {
        const matches = await findMatchingCandidates(job, candidates);
        matches.forEach(match => {
          allProspects.push({
            candidate: match.candidate,
            jobPosting: job,
            score: match.match.score,
            strengths: match.match.strengths,
            gaps: match.match.gaps,
          });
        });
      }

      allProspects.sort((a, b) => b.score - a.score);
      setProspects(allProspects);

      // Store matches and current state
      const storedData: StoredMatches = {
        prospects: allProspects,
        lastRefreshTime: new Date().toISOString(),
        lastKnownPostings: jobPostings.map(p => p.id),
        lastKnownCandidates: candidates.map(c => c.id)
      };
      localStorage.setItem('prospects', JSON.stringify(storedData));

      // Reset new items counter
      setNewItemsSinceRefresh({ postings: 0, candidates: 0 });
    } catch (error) {
      console.error('Error loading prospects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const jobs = ['all', ...new Set(prospects.map(p => p.jobPosting.title))];
  const scoreRanges = ['all', '90+', '80-89', '70-79', '<70'];

  const filteredProspects = prospects.filter(prospect => {
    const matchesSearch = 
      prospect.candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prospect.candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prospect.jobPosting.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesJob = jobFilter === 'all' || prospect.jobPosting.title === jobFilter;
    
    let matchesScore = true;
    if (scoreFilter !== 'all') {
      const score = prospect.score;
      switch (scoreFilter) {
        case '90+':
          matchesScore = score >= 90;
          break;
        case '80-89':
          matchesScore = score >= 80 && score < 90;
          break;
        case '70-79':
          matchesScore = score >= 70 && score < 80;
          break;
        case '<70':
          matchesScore = score < 70;
          break;
      }
    }
    
    return matchesSearch && matchesJob && matchesScore;
  });

  const startInterviewProcess = (prospect: Prospect) => {
    setSelectedProspect(prospect);
    setIsProcessFormOpen(true);
  };

  const handleCreateProcess = async (process: Omit<InterviewProcess, 'id'>) => {
    try {
      console.log('Creating interview process:', process);
      const newProcess = await storage.createInterviewProcess(process);
      console.log('Created interview process:', newProcess);
      
      // Create an interview for the first stage
      const interview: Omit<Interview, 'id'> = {
        candidateId: process.candidateId,
        jobPostingId: process.jobPostingId,
        processId: newProcess.id,
        stage: newProcess.stages[0],
        status: 'scheduled',
        scheduledDate: new Date().toISOString(), // Default to current date
        interviewer: {
          name: 'TBD',
          email: 'tbd@example.com',
          role: 'Interviewer'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        jobPosting: await storage.getJobPosting(process.jobPostingId)
      };

      const newInterview = await storage.createInterview(interview);
      
      // Navigate to the interview page
      navigate(`/interviews/${newInterview.id}`);
      
      // Close the modal
      setIsProcessFormOpen(false);
      setSelectedProspect(null);
    } catch (error) {
      console.error('Error creating interview process:', error);
      alert('Failed to create interview process. Please try again.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Prospects</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of potential matches between candidates and job postings.
            {(newItemsSinceRefresh.postings > 0 || newItemsSinceRefresh.candidates > 0) && (
              <span className="ml-2 text-indigo-600">
                {newItemsSinceRefresh.postings > 0 && 
                  `${newItemsSinceRefresh.postings} new posting${newItemsSinceRefresh.postings > 1 ? 's' : ''}`}
                {newItemsSinceRefresh.postings > 0 && newItemsSinceRefresh.candidates > 0 && ' and '}
                {newItemsSinceRefresh.candidates > 0 && 
                  `${newItemsSinceRefresh.candidates} new candidate${newItemsSinceRefresh.candidates > 1 ? 's' : ''}`}
                {' since last refresh'}
              </span>
            )}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-4">
          <button
            onClick={() => setShowAnalysisPanel(!showAnalysisPanel)}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {showAnalysisPanel ? 'Hide Analysis Panel' : 'Show Analysis Panel'}
          </button>
          <button
            onClick={loadProspects}
            disabled={isLoading}
            className={`inline-flex items-center justify-center rounded-md border border-transparent ${
              newItemsSinceRefresh.postings > 0 || newItemsSinceRefresh.candidates > 0
                ? 'bg-indigo-500'
                : 'bg-indigo-600'
            } px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto disabled:opacity-50`}
          >
            {isLoading ? 'Refreshing...' : 'Refresh Matches'}
            {(newItemsSinceRefresh.postings > 0 || newItemsSinceRefresh.candidates > 0) && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                {newItemsSinceRefresh.postings + newItemsSinceRefresh.candidates}
              </span>
            )}
          </button>
        </div>
      </div>

      {showAnalysisPanel && (
        <div className="mt-8">
          <MatchAnalysisPanel />
        </div>
      )}

      <div className="mt-8 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        <input
          type="text"
          placeholder="Search prospects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        />
        <select
          value={jobFilter}
          onChange={(e) => setJobFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="all">All Jobs</option>
          {jobs.filter(job => job !== 'all').map(job => (
            <option key={job} value={job}>{job}</option>
          ))}
        </select>
        <select
          value={scoreFilter}
          onChange={(e) => setScoreFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="all">All Scores</option>
          {scoreRanges.filter(range => range !== 'all').map(range => (
            <option key={range} value={range}>{range}%</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="mt-8 flex justify-center items-center h-32 bg-white rounded-lg border border-gray-200">
          <div className="text-gray-500">Loading prospects...</div>
        </div>
      ) : prospects.length === 0 ? (
        <div className="mt-8 flex flex-col justify-center items-center h-64 bg-white rounded-lg border border-gray-200">
          <div className="text-gray-500 text-lg mb-2">No matches found</div>
          <p className="text-gray-400 text-sm text-center max-w-md">
            There are currently no matches between candidates and job postings. 
            This could be because:
          </p>
          <ul className="text-gray-400 text-sm list-disc mt-4">
            <li>No published job postings are available</li>
            <li>No candidates have been added to the system</li>
            <li>No candidates match the current job requirements</li>
          </ul>
          <button
            onClick={loadProspects}
            className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Run Initial Match
          </button>
        </div>
      ) : (
        <>
          <div className="mt-4 text-sm text-gray-500">
            {(() => {
              const storedData = localStorage.getItem('prospects');
              if (storedData) {
                const data: StoredMatches = JSON.parse(storedData);
                const lastRefresh = new Date(data.lastRefreshTime);
                return `Last refreshed on ${lastRefresh.toLocaleDateString()} at ${lastRefresh.toLocaleTimeString()}`;
              }
              return null;
            })()}
          </div>
          {filteredProspects.length === 0 ? (
            <div className="mt-8 flex flex-col justify-center items-center h-32 bg-white rounded-lg border border-gray-200">
              <div className="text-gray-500 text-lg">No matches found with current filters</div>
              <p className="text-gray-400 text-sm mt-2">
                Try adjusting your search terms or filters
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
                          <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                            Candidate
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Job Posting
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Match Score
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Key Strengths
                          </th>
                          <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {filteredProspects.map((prospect) => (
                          <tr key={`${prospect.candidate.id}-${prospect.jobPosting.id}`}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                              <button
                                onClick={() => setSelectedCandidate(prospect.candidate)}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                {prospect.candidate.name}
                              </button>
                              <div className="text-gray-500">{prospect.candidate.email}</div>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              <button
                                onClick={() => setSelectedJobPosting(prospect.jobPosting)}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                {prospect.jobPosting.title}
                              </button>
                              <div>{prospect.jobPosting.department}</div>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                              <div className="flex items-center">
                                <div className="w-24 bg-gray-200 rounded-full h-2.5 mr-2">
                                  <div
                                    className="bg-indigo-600 h-2.5 rounded-full"
                                    style={{ width: `${prospect.score}%` }}
                                  ></div>
                                </div>
                                <span>{prospect.score}%</span>
                              </div>
                            </td>
                            <td className="px-3 py-4 text-sm text-gray-500">
                              <ul className="list-disc list-inside">
                                {prospect.strengths.slice(0, 2).map((strength, idx) => (
                                  <li key={idx}>{strength}</li>
                                ))}
                              </ul>
                            </td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                              <button
                                onClick={() => setSelectedCandidate(prospect.candidate)}
                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                              >
                                View Candidate
                              </button>
                              <button
                                onClick={() => startInterviewProcess(prospect)}
                                className="text-green-600 hover:text-green-900"
                              >
                                Start Interview Process
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {selectedCandidate && (
        <CandidateDetailsModal
          isOpen={!!selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          candidate={selectedCandidate}
        />
      )}

      {selectedJobPosting && (
        <JobPostingDetailsModal
          isOpen={!!selectedJobPosting}
          onClose={() => setSelectedJobPosting(null)}
          jobPosting={selectedJobPosting}
        />
      )}

      {isProcessFormOpen && selectedProspect && (
        <InterviewProcessForm
          isOpen={isProcessFormOpen}
          onClose={() => {
            setIsProcessFormOpen(false);
            setSelectedProspect(null);
          }}
          candidate={selectedProspect.candidate}
          jobPosting={selectedProspect.jobPosting}
          onSubmit={handleCreateProcess}
        />
      )}
    </div>
  );
};

export default Prospects; 
