import React, { useEffect, useState } from 'react';
import { listAvailableModels } from '../services/gemini';

export const TestGemini: React.FC = () => {
  const [models, setModels] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkModels = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await listAvailableModels();
        console.log('Available models:', data);
        setModels(data);
      } catch (error) {
        console.error('Error checking models:', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    checkModels();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Gemini API Test</h1>
      
      {loading && (
        <div className="text-gray-600">Loading available models...</div>
      )}

      {error && (
        <div className="text-red-600 mb-4">
          Error: {error}
        </div>
      )}

      {models && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Available Models:</h2>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
            {JSON.stringify(models, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}; 