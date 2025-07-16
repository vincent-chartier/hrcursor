import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { JobPosting } from '../types';
import { generateJobDescription } from '../services/gemini';

interface JobPostingFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (posting: Omit<JobPosting, 'id'>) => Promise<void>;
  initialData?: JobPosting;
}

export const JobPostingForm: React.FC<JobPostingFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [formData, setFormData] = useState<Omit<JobPosting, 'id'>>({
    title: '',
    department: '',
    location: '',
    status: 'draft',
    description: '',
    employmentType: 'full-time',
    shift: 'day',
    salary: {
      min: 0,
      max: 0,
      currency: 'USD',
    },
    experience: 'entry',
    storeType: 'hypermarket',
    physicalRequirements: [],
    benefits: [],
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        department: initialData.department,
        location: initialData.location,
        status: initialData.status,
        description: initialData.description,
        employmentType: initialData.employmentType,
        shift: initialData.shift,
        salary: initialData.salary,
        experience: initialData.experience,
        storeType: initialData.storeType,
        physicalRequirements: initialData.physicalRequirements,
        benefits: initialData.benefits,
      });
    }
  }, [initialData]);

  useEffect(() => {
    // Validate required fields
    const isValid = 
      formData.title.trim() !== '' &&
      formData.department.trim() !== '' &&
      formData.location.trim() !== '';
    
    setIsFormValid(isValid);
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('salary.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        salary: {
          ...prev.salary,
          [field]: field === 'min' || field === 'max' ? Number(value) : value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save job posting');
    }
  };

  const handleGenerateDescription = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const description = await generateJobDescription(formData);
      setFormData(prev => ({
        ...prev,
        description,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate job description');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-start justify-center p-4 overflow-y-auto pt-20">
        <Dialog.Panel className="mx-auto max-w-4xl w-full bg-white rounded-lg shadow-xl my-8">
          <div className="flex items-center justify-between p-6 border-b">
            <Dialog.Title className="text-lg font-medium">
              {initialData ? 'Edit Posting' : 'Create Posting'}
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department *
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="">Select a department</option>
                  <option value="Management">Store Management</option>
                  <option value="Cashier">Cashier</option>
                  <option value="Stock">Stock Management</option>
                  <option value="Customer Service">Customer Service</option>
                  <option value="Butcher">Butcher Shop</option>
                  <option value="Bakery">Bakery</option>
                  <option value="Produce">Fruits & Vegetables</option>
                  <option value="Deli">Deli Counter</option>
                  <option value="Seafood">Seafood</option>
                  <option value="Dairy">Dairy</option>
                  <option value="Frozen">Frozen Foods</option>
                  <option value="Grocery">Grocery</option>
                  <option value="Household">Household</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Security">Security</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employment Type
                </label>
                <select
                  name="employmentType"
                  value={formData.employmentType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="contract">Contract</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shift
                </label>
                <select
                  name="shift"
                  value={formData.shift}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="day">Day</option>
                  <option value="night">Night</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Experience Level
                </label>
                <select
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="entry">Entry Level</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Store Type
                </label>
                <select
                  name="storeType"
                  value={formData.storeType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="hypermarket">Hypermarket</option>
                  <option value="supermarket">Supermarket</option>
                  <option value="convenience">Convenience Store</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Salary
                </label>
                <input
                  type="number"
                  name="salary.min"
                  value={formData.salary.min}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Salary
                </label>
                <input
                  type="number"
                  name="salary.max"
                  value={formData.salary.max}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
                {error}
              </div>
            )}

            <div className="flex justify-end space-x-3 mb-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerateDescription}
                disabled={!isFormValid || isGenerating}
                className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md flex items-center space-x-2 ${
                  (!isFormValid || isGenerating) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                }`}
              >
                {isGenerating ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <span>Generate Job Description</span>
                )}
              </button>
              <button
                type="submit"
                disabled={!isFormValid}
                className={`px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md ${
                  !isFormValid ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'
                }`}
              >
                Save
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Description
              </label>
              <div className="w-full h-96 p-6 border rounded-md bg-white overflow-auto prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed">
                  {formData.description ? (
                    <div dangerouslySetInnerHTML={{ __html: formData.description.replace(/\n/g, '<br />') }} />
                  ) : (
                    <p className="text-gray-500 italic">No description generated yet.</p>
                  )}
                </div>
              </div>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}; 