import React, { useState, useEffect } from 'react';
import { Candidate, JobPosting } from '../types';
import { storage } from '../services/storage';
import { findMatchingCandidates } from '../services/matchingEngine';

interface MatchAnalysisPanelProps {
  className?: string;
}

export const MatchAnalysisPanel: React.FC<MatchAnalysisPanelProps> = ({ className }) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<string>('');
  const [selectedPosting, setSelectedPosting] = useState<string>('');
  const [analysis, setAnalysis] = useState<{
    score: number;
    explanation: string;
    strengths: string[];
    gaps: string[];
    recommendations: string[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [loadedCandidates, loadedPostings] = await Promise.all([
        storage.getCandidates(),
        storage.getJobPostings()
      ]);
      setCandidates(loadedCandidates);
      setJobPostings(loadedPostings);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedCandidate || !selectedPosting) return;

    setIsLoading(true);
    try {
      const candidate = candidates.find(c => c.id === selectedCandidate);
      const posting = jobPostings.find(p => p.id === selectedPosting);

      if (!candidate || !posting) return;

      const matches = await findMatchingCandidates(posting, [candidate]);
      if (matches.length > 0) {
        setAnalysis(matches[0].match);
      } else {
        setAnalysis(null);
      }
    } catch (error) {
      console.error('Error analyzing match:', error);
      setAnalysis(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`bg-white shadow sm:rounded-lg ${className}`}>
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Match Analysis</h3>
        <div className="mt-5 space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="candidate" className="block text-sm font-medium text-gray-700">
                Select Candidate
              </label>
              <select
                id="candidate"
                value={selectedCandidate}
                onChange={(e) => setSelectedCandidate(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">Choose a candidate...</option>
                {candidates.map((candidate) => (
                  <option key={candidate.id} value={candidate.id}>
                    {candidate.name} - {candidate.position}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="posting" className="block text-sm font-medium text-gray-700">
                Select Job Posting
              </label>
              <select
                id="posting"
                value={selectedPosting}
                onChange={(e) => setSelectedPosting(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">Choose a job posting...</option>
                {jobPostings.map((posting) => (
                  <option key={posting.id} value={posting.id}>
                    {posting.title} - {posting.department}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={!selectedCandidate || !selectedPosting || isLoading}
              className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading ? 'Analyzing...' : 'Analyze Match'}
            </button>
          </div>

          {analysis && (
            <div className="mt-6 border-t border-gray-200 pt-6">
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Match Score</h4>
                  <div className="mt-2 flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-indigo-600 h-2.5 rounded-full"
                        style={{ width: `${analysis.score}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 text-sm text-gray-500">{analysis.score}%</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900">Analysis</h4>
                  <p className="mt-2 text-sm text-gray-500">{analysis.explanation}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900">Key Strengths</h4>
                  <ul className="mt-2 list-disc list-inside space-y-1">
                    {analysis.strengths.map((strength, index) => (
                      <li key={index} className="text-sm text-gray-500">{strength}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900">Gaps</h4>
                  <ul className="mt-2 list-disc list-inside space-y-1">
                    {analysis.gaps.map((gap, index) => (
                      <li key={index} className="text-sm text-gray-500">{gap}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900">Recommendations</h4>
                  <ul className="mt-2 list-disc list-inside space-y-1">
                    {analysis.recommendations.map((recommendation, index) => (
                      <li key={index} className="text-sm text-gray-500">{recommendation}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 