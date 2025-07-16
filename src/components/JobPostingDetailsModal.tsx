import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, PencilIcon, CheckIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { JobPosting } from '../types';
import { MatchResults } from './MatchResults';
import { findMatchingCandidates } from '../services/matchingEngine';
import { storage } from '../services/storage';

interface JobPostingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobPosting: JobPosting;
  onUpdate?: (jobPosting: JobPosting) => Promise<void>;
}

export const JobPostingDetailsModal: React.FC<JobPostingDetailsModalProps> = ({
  isOpen,
  onClose,
  jobPosting,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedJobPosting, setEditedJobPosting] = useState<JobPosting>(jobPosting);
  const [isMatching, setIsMatching] = useState(false);
  const [matchResult, setMatchResult] = useState<any>(null);
  const [matchingCandidate, setMatchingCandidate] = useState<any>(null);

  const handleStatusChange = (newStatus: JobPosting['status']) => {
    setEditedJobPosting(prev => ({
      ...prev,
      status: newStatus,
    }));
  };

  const handleSave = async () => {
    if (onUpdate) {
      await onUpdate(editedJobPosting);
      setIsEditing(false);
    }
  };

  const handleMatch = async () => {
    try {
      setIsMatching(true);
      const candidates = await storage.getCandidates();
      const matches = await findMatchingCandidates(jobPosting, candidates);
      if (matches.length > 0) {
        setMatchResult(matches[0].match);
        setMatchingCandidate(matches[0].candidate);
      }
    } catch (error) {
      console.error('Error finding matching candidates:', error);
    } finally {
      setIsMatching(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onClose={onClose} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-start justify-center p-4 overflow-y-auto pt-20">
          <Dialog.Panel className="mx-auto max-w-4xl w-full bg-white rounded-lg shadow-xl my-8">
            <div className="flex items-center justify-between p-6 border-b">
              <Dialog.Title className="text-lg font-medium">
                Posting Details
              </Dialog.Title>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleMatch}
                  disabled={isMatching}
                  className="text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
                >
                  <UserGroupIcon className="h-6 w-6" />
                </button>
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSave}
                      className="text-green-600 hover:text-green-700"
                    >
                      <CheckIcon className="h-6 w-6" />
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditedJobPosting(jobPosting);
                      }}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-indigo-600 hover:text-indigo-700"
                    >
                      <PencilIcon className="h-6 w-6" />
                    </button>
                    <button
                      onClick={onClose}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Title</h3>
                  <p className="mt-1 text-sm text-gray-900">{editedJobPosting.title}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Department</h3>
                  <p className="mt-1 text-sm text-gray-900">{editedJobPosting.department}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Location</h3>
                  <p className="mt-1 text-sm text-gray-900">{editedJobPosting.location}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  {isEditing ? (
                    <select
                      value={editedJobPosting.status}
                      onChange={(e) => handleStatusChange(e.target.value as JobPosting['status'])}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="closed">Closed</option>
                    </select>
                  ) : (
                    <p className="mt-1 text-sm text-gray-900 capitalize">{editedJobPosting.status}</p>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Employment Type</h3>
                  <p className="mt-1 text-sm text-gray-900 capitalize">{editedJobPosting.employmentType}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Shift</h3>
                  <p className="mt-1 text-sm text-gray-900 capitalize">{editedJobPosting.shift}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Experience Level</h3>
                  <p className="mt-1 text-sm text-gray-900 capitalize">{editedJobPosting.experience}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Store Type</h3>
                  <p className="mt-1 text-sm text-gray-900 capitalize">{editedJobPosting.storeType}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Salary Range</h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {editedJobPosting.salary.min} - {editedJobPosting.salary.max} {editedJobPosting.salary.currency}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Physical Requirements</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {editedJobPosting.physicalRequirements.map((req, index) => (
                      <li key={index} className="text-sm text-gray-900">{req}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Benefits</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {editedJobPosting.benefits.map((benefit, index) => (
                      <li key={index} className="text-sm text-gray-900">{benefit}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Job Description</h3>
                  <div className="prose prose-sm max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: editedJobPosting.description.replace(/\n/g, '<br />') }} />
                  </div>
                </div>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {matchResult && matchingCandidate && (
        <MatchResults
          candidate={matchingCandidate}
          jobPosting={jobPosting}
          match={matchResult}
          onClose={() => {
            setMatchResult(null);
            setMatchingCandidate(null);
          }}
        />
      )}
    </>
  );
}; 