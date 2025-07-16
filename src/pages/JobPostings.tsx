import React, { useState, useEffect } from 'react';
import { JobPosting } from '../types';
import { JobPostingForm } from '../components/JobPostingForm';
import { JobPostingDetailsModal } from '../components/JobPostingDetailsModal';
import { storage } from '../services/storage';

const JobPostings: React.FC = () => {
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPosting, setEditingPosting] = useState<JobPosting | null>(null);
  const [viewingPosting, setViewingPosting] = useState<JobPosting | null>(null);

  // Load job postings from storage on component mount
  useEffect(() => {
    const loadJobPostings = async () => {
      try {
        const postings = await storage.getJobPostings();
        setJobPostings(postings);
      } catch (error) {
        console.error('Error loading job postings:', error);
      }
    };
    loadJobPostings();
  }, []);

  const filteredPostings = jobPostings.filter(posting => {
    const matchesSearch = posting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         posting.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         posting.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || posting.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreatePosting = async (posting: Omit<JobPosting, 'id'>) => {
    try {
      const newPosting = await storage.addJobPosting(posting);
      setJobPostings(prev => [...prev, newPosting]);
      setIsFormOpen(false);
      setEditingPosting(null);
    } catch (error) {
      console.error('Error creating job posting:', error);
    }
  };

  const handleUpdatePosting = async (posting: Omit<JobPosting, 'id'>) => {
    if (!editingPosting) return;
    
    try {
      const updatedPosting = await storage.updateJobPosting(editingPosting.id, posting);
      if (updatedPosting) {
        setJobPostings(prev => prev.map(p => p.id === updatedPosting.id ? updatedPosting : p));
        setIsFormOpen(false);
        setEditingPosting(null);
      }
    } catch (error) {
      console.error('Error updating job posting:', error);
    }
  };

  const handleDeletePosting = async (postingId: string) => {
    if (window.confirm('Are you sure you want to delete this job posting?')) {
      try {
        const deleted = await storage.deleteJobPosting(postingId);
        if (deleted) {
          setJobPostings(prev => prev.filter(p => p.id !== postingId));
        }
      } catch (error) {
        console.error('Error deleting job posting:', error);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Postings</h1>
        <button
          onClick={() => {
            setEditingPosting(null);
            setIsFormOpen(true);
          }}
          className="px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-sm"
        >
          Create Posting
        </button>
      </div>

      <div className="flex space-x-4 mb-6">
        <input
          type="text"
          placeholder="Search postings..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900"
        >
          <option value="all">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPostings.map((posting) => (
              <tr key={posting.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{posting.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{posting.department}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{posting.location}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    posting.status === 'published' ? 'bg-green-100 text-green-800' :
                    posting.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {posting.status.charAt(0).toUpperCase() + posting.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                  <button
                    onClick={() => setViewingPosting(posting)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    View
                  </button>
                  <button
                    onClick={() => {
                      setEditingPosting(posting);
                      setIsFormOpen(true);
                    }}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeletePosting(posting.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isFormOpen && (
        <JobPostingForm
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingPosting(null);
          }}
          onSubmit={editingPosting ? handleUpdatePosting : handleCreatePosting}
          initialData={editingPosting || undefined}
        />
      )}

      {viewingPosting && (
        <JobPostingDetailsModal
          isOpen={!!viewingPosting}
          onClose={() => setViewingPosting(null)}
          jobPosting={viewingPosting}
          onUpdate={async (updatedPosting) => {
            setJobPostings(prev => prev.map(p => p.id === updatedPosting.id ? updatedPosting : p));
          }}
        />
      )}
    </div>
  );
};

export default JobPostings; 