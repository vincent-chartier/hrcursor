import React, { useState, useEffect } from 'react';
import { PlusIcon, MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { Candidate } from '../types';
import CVUploader from '../components/CVUploader';
import { CandidateDetailsModal } from '../components/CandidateDetailsModal';
import { storage } from '../services/storage';

const Candidates: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [matchScoreFilter, setMatchScoreFilter] = useState<string>('all');
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  // Load candidates from storage on component mount
  useEffect(() => {
    const loadCandidates = async () => {
      try {
        const loadedCandidates = await storage.getCandidates();
        setCandidates(loadedCandidates);
      } catch (error) {
        console.error('Error loading candidates:', error);
      }
    };
    loadCandidates();
  }, []);

  const positions = ['all', ...new Set(candidates.map(candidate => candidate.position))];
  const statuses = ['all', 'new', 'reviewing', 'interviewing', 'offered', 'rejected'];
  const matchScoreRanges = ['all', '90+', '80-89', '70-79', '<70'];

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPosition = positionFilter === 'all' || candidate.position === positionFilter;
    const matchesStatus = statusFilter === 'all' || candidate.status === statusFilter;
    
    let matchesScore = true;
    if (matchScoreFilter !== 'all') {
      const score = candidate.matchScore;
      switch (matchScoreFilter) {
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
    
    return matchesSearch && matchesPosition && matchesStatus && matchesScore;
  });

  const handleCandidateExtracted = async (candidate: Omit<Candidate, 'id'>) => {
    try {
      const newCandidate = await storage.addCandidate(candidate);
      setCandidates(prev => [...prev, newCandidate]);
      setIsUploaderOpen(false);
    } catch (error) {
      console.error('Error adding candidate:', error);
    }
  };

  const handleUpdateCandidate = async (candidate: Candidate) => {
    try {
      const updatedCandidate = await storage.updateCandidate(candidate.id, candidate);
      if (updatedCandidate) {
        setCandidates(prev => prev.map(c => c.id === updatedCandidate.id ? updatedCandidate : c));
        setSelectedCandidate(updatedCandidate);
      }
    } catch (error) {
      console.error('Error updating candidate:', error);
    }
  };

  const handleDeleteCandidate = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this candidate?')) {
      try {
        const deleted = await storage.deleteCandidate(id);
        if (deleted) {
          setCandidates(prev => prev.filter(c => c.id !== id));
          if (selectedCandidate?.id === id) {
            setSelectedCandidate(null);
          }
        }
      } catch (error) {
        console.error('Error deleting candidate:', error);
      }
    }
  };

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Candidates</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all candidates in your recruitment pipeline.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => setIsUploaderOpen(true)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Add Candidate
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mt-4 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              placeholder="Search by name, email, or position..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center">
            <FunnelIcon className="h-5 w-5 text-gray-400 mr-2" aria-hidden="true" />
            <select
              className="rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
            >
              {positions.map((pos) => (
                <option key={pos} value={pos}>
                  {pos.charAt(0).toUpperCase() + pos.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center">
            <select
              className="rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center">
            <select
              className="rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
              value={matchScoreFilter}
              onChange={(e) => setMatchScoreFilter(e.target.value)}
            >
              {matchScoreRanges.map((range) => (
                <option key={range} value={range}>
                  {range === 'all' ? 'All Scores' : `Match Score ${range}`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Name
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Email
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Position
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Match Score
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredCandidates.map((candidate) => (
                    <tr key={candidate.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {candidate.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{candidate.email}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{candidate.position}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          candidate.status === 'new' ? 'bg-blue-100 text-blue-800' :
                          candidate.status === 'reviewing' ? 'bg-yellow-100 text-yellow-800' :
                          candidate.status === 'interviewing' ? 'bg-purple-100 text-purple-800' :
                          candidate.status === 'offered' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {candidate.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-indigo-600 h-2.5 rounded-full"
                              style={{ width: `${candidate.matchScore}%` }}
                            ></div>
                          </div>
                          <span className="ml-2">{candidate.matchScore}%</span>
                        </div>
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button 
                          onClick={() => setSelectedCandidate(candidate)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          View Details
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

      {isUploaderOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full">
            <div className="p-6">
              <CVUploader
                onCandidateExtracted={handleCandidateExtracted}
                onCancel={() => setIsUploaderOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      {selectedCandidate && (
        <CandidateDetailsModal
          isOpen={!!selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          candidate={selectedCandidate}
          onUpdate={handleUpdateCandidate}
        />
      )}
    </div>
  );
};

export default Candidates; 