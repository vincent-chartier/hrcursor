import React from 'react';
import { JobPosting, Candidate } from '../types';

interface MatchResult {
  score: number;
  explanation: string;
  strengths: string[];
  gaps: string[];
  recommendations: string[];
}

interface MatchResultsProps {
  candidate?: Candidate;
  jobPosting?: JobPosting;
  match: MatchResult;
  onClose: () => void;
}

export const MatchResults: React.FC<MatchResultsProps> = ({
  candidate,
  jobPosting,
  match,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Match Analysis</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            {candidate && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Candidate</h3>
                <p className="mt-1 text-sm text-gray-900">{candidate.name}</p>
                <p className="text-sm text-gray-500">{candidate.position}</p>
              </div>
            )}
            {jobPosting && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Job Posting</h3>
                <p className="mt-1 text-sm text-gray-900">{jobPosting.title}</p>
                <p className="text-sm text-gray-500">{jobPosting.department}</p>
              </div>
            )}
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Match Score</h3>
              <span className="text-2xl font-semibold text-indigo-600">{match.score}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-indigo-600 h-2.5 rounded-full"
                style={{ width: `${match.score}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Analysis</h3>
              <p className="text-sm text-gray-700">{match.explanation}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Key Strengths</h3>
              <ul className="list-disc list-inside space-y-1">
                {match.strengths.map((strength, index) => (
                  <li key={index} className="text-sm text-gray-700">{strength}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Areas for Improvement</h3>
              <ul className="list-disc list-inside space-y-1">
                {match.gaps.map((gap, index) => (
                  <li key={index} className="text-sm text-gray-700">{gap}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Recommendations</h3>
              <ul className="list-disc list-inside space-y-1">
                {match.recommendations.map((recommendation, index) => (
                  <li key={index} className="text-sm text-gray-700">{recommendation}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 