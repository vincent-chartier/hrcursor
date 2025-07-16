import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, PencilIcon, CheckIcon, BriefcaseIcon } from '@heroicons/react/24/outline';
import { Candidate } from '../types';
import { MatchResults } from './MatchResults';
import { findMatchingJobs } from '../services/matchingEngine';
import { storage } from '../services/storage';

interface CandidateDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: Candidate;
  onUpdate?: (candidate: Candidate) => Promise<void>;
}

export const CandidateDetailsModal: React.FC<CandidateDetailsModalProps> = ({
  isOpen,
  onClose,
  candidate,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedCandidate, setEditedCandidate] = useState<Candidate>(candidate);
  const [isMatching, setIsMatching] = useState(false);
  const [matchResult, setMatchResult] = useState<any>(null);
  const [matchingJob, setMatchingJob] = useState<any>(null);

  const handleStatusChange = (newStatus: Candidate['status']) => {
    setEditedCandidate(prev => ({
      ...prev,
      status: newStatus,
      updatedAt: new Date().toISOString()
    }));
  };

  const handleNotesChange = (notes: string) => {
    setEditedCandidate(prev => ({
      ...prev,
      notes,
      updatedAt: new Date().toISOString()
    }));
  };

  const handleSave = async () => {
    if (onUpdate) {
      await onUpdate(editedCandidate);
      setIsEditing(false);
    }
  };

  const handleMatch = async () => {
    try {
      setIsMatching(true);
      const jobPostings = await storage.getJobPostings();
      const matches = await findMatchingJobs(candidate, jobPostings);
      if (matches.length > 0) {
        setMatchResult(matches[0].match);
        setMatchingJob(matches[0].jobPosting);
      }
    } catch (error) {
      console.error('Error finding matching jobs:', error);
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
                Candidate Details
              </Dialog.Title>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleMatch}
                  disabled={isMatching}
                  className="text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
                >
                  <BriefcaseIcon className="h-6 w-6" />
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
                        setEditedCandidate(candidate);
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
                  <h3 className="text-sm font-medium text-gray-500">Name</h3>
                  <p className="mt-1 text-sm text-gray-900">{editedCandidate.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Email</h3>
                  <p className="mt-1 text-sm text-gray-900">{editedCandidate.email}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                  <p className="mt-1 text-sm text-gray-900">{editedCandidate.phone}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Location</h3>
                  <p className="mt-1 text-sm text-gray-900">{editedCandidate.location}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Position</h3>
                  <p className="mt-1 text-sm text-gray-900">{editedCandidate.position}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  {isEditing ? (
                    <select
                      value={editedCandidate.status}
                      onChange={(e) => handleStatusChange(e.target.value as Candidate['status'])}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      <option value="new">New</option>
                      <option value="reviewing">Reviewing</option>
                      <option value="interviewing">Interviewing</option>
                      <option value="offered">Offered</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  ) : (
                    <p className="mt-1 text-sm text-gray-900 capitalize">{editedCandidate.status}</p>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Match Score</h3>
                  <div className="mt-1 flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-indigo-600 h-2.5 rounded-full"
                        style={{ width: `${editedCandidate.matchScore}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 text-sm text-gray-900">{editedCandidate.matchScore}%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Work Experience</h3>
                  <div className="space-y-4">
                    {editedCandidate.experience.map((exp, index) => (
                      <div key={index} className="border-l-2 border-indigo-600 pl-4">
                        <h4 className="text-sm font-medium text-gray-900">{exp.position}</h4>
                        <p className="text-sm text-gray-500">{exp.company}</p>
                        <p className="text-sm text-gray-500">
                          {exp.startDate} - {exp.endDate}
                        </p>
                        <p className="mt-1 text-sm text-gray-700">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Education</h3>
                  <div className="space-y-4">
                    {editedCandidate.education.map((edu, index) => (
                      <div key={index} className="border-l-2 border-indigo-600 pl-4">
                        <h4 className="text-sm font-medium text-gray-900">{edu.degree}</h4>
                        <p className="text-sm text-gray-500">{edu.institution}</p>
                        <p className="text-sm text-gray-500">
                          {edu.field} • {edu.graduationDate}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {editedCandidate.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Languages</h3>
                    <div className="flex flex-wrap gap-2">
                      {editedCandidate.languages.map((language, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                        >
                          {language}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {editedCandidate.certifications.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Certifications</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {editedCandidate.certifications.map((cert, index) => (
                        <li key={index} className="text-sm text-gray-700">{cert}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Notes</h3>
                  {isEditing ? (
                    <textarea
                      value={editedCandidate.notes}
                      onChange={(e) => handleNotesChange(e.target.value)}
                      rows={3}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  ) : (
                    <p className="text-sm text-gray-700">{editedCandidate.notes || 'No notes'}</p>
                  )}
                </div>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {matchResult && matchingJob && (
        <MatchResults
          candidate={candidate}
          jobPosting={matchingJob}
          match={matchResult}
          onClose={() => {
            setMatchResult(null);
            setMatchingJob(null);
          }}
        />
      )}
    </>
  );
}; 