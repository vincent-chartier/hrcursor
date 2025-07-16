import React, { useState } from 'react';
import { Interview, InterviewStage, InterviewProcess, StageStatus, JobPosting } from '../types';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { generateInterviewQuestions } from '../services/interview';

interface InterviewStageFlowProps {
  process: InterviewProcess;
  currentInterview: Interview & { jobPosting: JobPosting };
  onUpdateInterview: (interview: Interview) => Promise<void>;
}

interface StageModalProps {
  isOpen: boolean;
  onClose: () => void;
  stage: InterviewStage;
  type: 'interview' | 'analysis';
  interview: Interview & { jobPosting: JobPosting };
  onSave: (answers: string[]) => void;
  onAnalysisComplete: (passed: boolean) => void;
}

const StageModal: React.FC<StageModalProps> = ({ 
  isOpen, 
  onClose, 
  stage, 
  type,
  interview,
  onSave,
  onAnalysisComplete
}) => {
  const [answers, setAnswers] = useState<string[]>(
    interview.answers || (stage.questions?.map(() => '') || Array(5).fill(''))
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{score: number, feedback: string} | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const handleSaveAnswers = () => {
    if (answers.some(answer => !answer.trim())) {
      alert('Please answer all questions before saving.');
      return;
    }
    onSave(answers);
    onClose();
  };

  const analyzeResponses = async () => {
    setIsAnalyzing(true);
    // TODO: Implement AI analysis here
    // For now, simulate with random score
    const score = Math.random() * 100;
    const feedback = score > 70 ? 
      "Strong responses demonstrating good understanding and experience." :
      "Responses indicate areas for improvement.";
    
    setAnalysisResult({ score, feedback });
    setIsAnalyzing(false);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-4xl w-full rounded-xl bg-white p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <Dialog.Title className="text-xl font-medium text-gray-900">
                {type === 'interview' ? stage.name : 'Response Analysis'}
              </Dialog.Title>
              <p className="text-sm text-gray-500 mt-1">
                {type === 'interview' ? 'Answer all questions to proceed' : 'Review and analyze responses'}
              </p>
            </div>
            <button
              type="button"
              className="rounded-md bg-white text-gray-400 hover:text-gray-500"
              onClick={onClose}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="mt-4">
            {type === 'interview' ? (
              <div className="space-y-8">
                {stage.questions?.map((question, idx) => (
                  <div 
                    key={idx} 
                    className={`p-6 rounded-lg border ${
                      currentQuestion === idx ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Question {idx + 1}</h3>
                      <span className="text-sm text-gray-500">{question.category}</span>
                    </div>
                    <div className="space-y-4">
                      <p className="font-medium text-gray-900">{question.text}</p>
                      <div className="space-y-2">
                        <textarea
                          value={answers[idx]}
                          onChange={(e) => {
                            const newAnswers = [...answers];
                            newAnswers[idx] = e.target.value;
                            setAnswers(newAnswers);
                          }}
                          onFocus={() => setCurrentQuestion(idx)}
                          className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                          rows={4}
                          placeholder="Type your answer here..."
                        />
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>{answers[idx]?.length || 0} characters</span>
                          <span>{answers[idx]?.split(/\s+/).filter(Boolean).length || 0} words</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="sticky bottom-0 bg-white py-4 border-t">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      {answers.filter(a => a.trim()).length} of {stage.questions?.length || 5} questions answered
                    </div>
                    <button
                      type="button"
                      onClick={handleSaveAnswers}
                      className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      Save Answers
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {!analysisResult ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    {isAnalyzing ? (
                      <div className="text-gray-500">Analyzing responses...</div>
                    ) : (
                      <button
                        onClick={analyzeResponses}
                        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                      >
                        Start Analysis
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="rounded-md bg-gray-50 p-4">
                      <div className="text-lg font-medium text-gray-900 mb-2">
                        Score: {Math.round(analysisResult.score)}%
                      </div>
                      <p className="text-gray-600">{analysisResult.feedback}</p>
                    </div>
                    <div className="mt-6 flex justify-end space-x-4">
                      <button
                        onClick={() => onAnalysisComplete(false)}
                        className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                      >
                        Fail Stage
                      </button>
                      <button
                        onClick={() => onAnalysisComplete(true)}
                        className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                      >
                        Pass Stage
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

const InterviewStageFlow: React.FC<InterviewStageFlowProps> = ({
  process,
  currentInterview,
  onUpdateInterview,
}) => {
  const [modalStage, setModalStage] = useState<InterviewStage | null>(null);
  const [modalType, setModalType] = useState<'interview' | 'analysis'>('interview');

  const getStageStatus = (stage: InterviewStage): 'pending' | 'needs_analysis' | 'passed' | 'failed' => {
    if (stage.status === 'completed') {
      return stage.passed ? 'passed' : 'failed';
    }
    if (stage.status === 'in_progress' && currentInterview.answers?.length) {
      return 'needs_analysis';
    }
    return 'pending';
  };

  const handleStageClick = async (stage: InterviewStage) => {
    const status = getStageStatus(stage);
    if (status === 'pending') {
      // Generate questions if they don't exist
      if (!stage.questions || stage.questions.length === 0) {
        try {
          const updatedStage = {
            ...stage,
            questions: await generateInterviewQuestions(stage, currentInterview.jobPosting)
          };
          const updatedInterview = {
            ...currentInterview,
            stage: updatedStage
          };
          await onUpdateInterview(updatedInterview);
          setModalStage(updatedStage);
        } catch (error) {
          console.error('Error generating questions:', error);
          return;
        }
      } else {
        setModalStage(stage);
      }
      setModalType('interview');
    } else if (status === 'needs_analysis') {
      setModalType('analysis');
      setModalStage(stage);
    }
  };

  const handleSaveAnswers = async (answers: string[]) => {
    if (modalStage) {
      const updatedInterview = {
        ...currentInterview,
        answers,
        status: 'in_progress' as const,
      };
      await onUpdateInterview(updatedInterview);
    }
  };

  const handleAnalysisComplete = async (passed: boolean) => {
    if (modalStage) {
      const updatedInterview = {
        ...currentInterview,
        status: 'completed' as const,
        stage: {
          ...modalStage,
          status: 'completed' as StageStatus,
          passed,
        },
      };
      await onUpdateInterview(updatedInterview);
      setModalStage(null);
    }
  };

  return (
    <div className="py-8">
      <div className="flex items-center justify-center space-x-4">
        {process.stages.map((stage, index) => {
          const status = getStageStatus(stage);
          const isLast = index === process.stages.length - 1;
          const showLine = !isLast && status !== 'failed';

          return (
            <React.Fragment key={stage.id}>
              <div className="flex flex-col items-center">
                <div className="text-sm text-gray-500 mb-2">Stage {index + 1}</div>
                <div className="text-sm font-medium text-gray-700 mb-2">{stage.name}</div>
                <button
                  onClick={() => handleStageClick(stage)}
                  disabled={['passed', 'failed'].includes(status)}
                  className={`
                    relative px-6 py-3 rounded-lg font-medium text-sm shadow-sm
                    ${status === 'pending' ? 'bg-indigo-600 text-white hover:bg-indigo-700' : ''}
                    ${status === 'needs_analysis' ? 'bg-yellow-500 text-white hover:bg-yellow-600' : ''}
                    ${status === 'passed' ? 'bg-green-600 text-white cursor-default' : ''}
                    ${status === 'failed' ? 'bg-red-600 text-white cursor-default' : ''}
                    transition-all duration-200 ease-in-out
                  `}
                >
                  <div className="flex items-center space-x-2">
                    {status === 'pending' && (
                      <>
                        <span>Launch Interview</span>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </>
                    )}
                    {status === 'needs_analysis' && (
                      <>
                        <span>Analyse</span>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </>
                    )}
                    {status === 'passed' && (
                      <>
                        <span>Passed</span>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </>
                    )}
                    {status === 'failed' && (
                      <>
                        <span>Failed</span>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </>
                    )}
                  </div>
                </button>
                <div className="text-xs text-gray-500 mt-2">{stage.type}</div>
              </div>
              {showLine && (
                <div className="flex-1 relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="h-0.5 w-full bg-gray-300" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-gray-300" />
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {modalStage && (
        <StageModal
          isOpen={!!modalStage}
          onClose={() => setModalStage(null)}
          stage={modalStage}
          type={modalType}
          interview={currentInterview}
          onSave={handleSaveAnswers}
          onAnalysisComplete={handleAnalysisComplete}
        />
      )}
    </div>
  );
};

export default InterviewStageFlow; 