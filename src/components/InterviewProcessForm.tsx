import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { v4 as uuidv4 } from 'uuid';
import { InterviewProcess, InterviewStage, Candidate, JobPosting } from '../types';

interface InterviewProcessFormProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: Candidate;
  jobPosting: JobPosting;
  onSubmit: (process: Omit<InterviewProcess, 'id'>) => Promise<void>;
}

interface StageConfig extends InterviewStage {
  generateQuestions: boolean;
}

const defaultStages: Omit<StageConfig, 'id'>[] = [
  {
    name: 'Technical Interview',
    type: 'technical',
    order: 0,
    status: 'pending',
    generateQuestions: false
  },
  {
    name: 'Behavioral Interview',
    type: 'behavioral',
    order: 1,
    status: 'pending',
    generateQuestions: false
  },
  {
    name: 'Final Interview',
    type: 'final',
    order: 2,
    status: 'pending',
    generateQuestions: false
  }
];

export const InterviewProcessForm: React.FC<InterviewProcessFormProps> = ({
  isOpen,
  onClose,
  candidate,
  jobPosting,
  onSubmit
}) => {
  const [numStages, setNumStages] = useState<number>(3);
  const [stages, setStages] = useState<StageConfig[]>(
    defaultStages.slice(0, 3).map(stage => ({ ...stage, id: uuidv4() }))
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      const selectedStages = stages.slice(0, numStages);
      const generateQuestionsForStages = selectedStages
        .filter(stage => stage.generateQuestions)
        .map(stage => stage.id);

      const process: Omit<InterviewProcess, 'id'> = {
        candidateId: candidate.id,
        jobPostingId: jobPosting.id,
        status: 'in_progress',
        currentStage: 0,
        stages: selectedStages.map(({ generateQuestions, ...stage }) => stage),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Add the list of stages that need AI-generated questions
      const processWithQuestions = {
        ...process,
        generateQuestionsForStages
      };

      await onSubmit(processWithQuestions);
      onClose();
    } catch (err) {
      console.error('Error submitting interview process:', err);
      setError('Failed to create interview process. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStageChange = (index: number, field: keyof StageConfig, value: any) => {
    const newStages = [...stages];
    newStages[index] = {
      ...newStages[index],
      [field]: value
    };
    setStages(newStages);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-2xl w-full bg-white rounded-xl shadow-xl">
          <div className="flex items-center justify-between p-6 border-b">
            <Dialog.Title className="text-lg font-medium">
              Configure Interview Process
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Candidate</h3>
              <p className="text-sm text-gray-600">{candidate.name}</p>
              <p className="text-sm text-gray-500">{candidate.email}</p>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Position</h3>
              <p className="text-sm text-gray-600">{jobPosting.title}</p>
              <p className="text-sm text-gray-500">{jobPosting.department}</p>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Number of Interview Stages</h3>
              <select
                value={numStages}
                onChange={(e) => setNumStages(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-md text-sm"
              >
                <option value={1}>1 Stage</option>
                <option value={2}>2 Stages</option>
                <option value={3}>3 Stages</option>
              </select>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Interview Stages</h3>
              <div className="space-y-4">
                {stages.slice(0, numStages).map((stage, index) => (
                  <div key={stage.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Stage Name
                        </label>
                        <input
                          type="text"
                          value={stage.name}
                          onChange={(e) => handleStageChange(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 border rounded-md text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Type
                        </label>
                        <select
                          value={stage.type}
                          onChange={(e) => handleStageChange(index, 'type', e.target.value as InterviewStage['type'])}
                          className="w-full px-3 py-2 border rounded-md text-sm"
                        >
                          <option value="technical">Technical</option>
                          <option value="behavioral">Behavioral</option>
                          <option value="cultural_fit">Cultural Fit</option>
                          <option value="final">Final</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`generate-questions-${index}`}
                        checked={stage.generateQuestions}
                        onChange={(e) => handleStageChange(index, 'generateQuestions', e.target.checked)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`generate-questions-${index}`} className="ml-2 block text-sm text-gray-900">
                        Generate AI-powered interview questions for this stage
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Start Process'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}; 