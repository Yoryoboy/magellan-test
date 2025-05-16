import { useState } from 'react';
import type { FormEvent } from 'react';

interface IdVerificationPageProps {
  onContinue: () => void;
}

const IdVerificationPage: React.FC<IdVerificationPageProps> = ({ onContinue }) => {
  const [supervisorId, setSupervisorId] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Process the ID - remove # if present
    let processedId = supervisorId.trim();
    if (processedId.startsWith('#')) {
      processedId = processedId.substring(1);
    }
    
    // Basic validation - just checking if it's not empty for now
    if (!processedId) {
      setError('Supervisor ID is required');
      return;
    }
    
    // Here you'll implement the actual verification logic later
    // For now, just proceed to the next step
    onContinue();
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 text-center">Magellan Written Test - ID Verification</h1>
        </div>
      </header>

      <main>
        <div className="max-w-3xl mx-auto mt-10 px-4 sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg leading-6 font-medium text-gray-900 mb-4">Enter Supervisor ID</h2>
              <p className="text-gray-500 mb-6">
                Please enter the ID provided by your supervisor or manager to continue with the test.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="supervisorId" className="block text-sm font-medium text-gray-700">
                    Supervisor ID
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="supervisorId"
                      name="supervisorId"
                      value={supervisorId}
                      onChange={(e) => setSupervisorId(e.target.value)}
                      className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md text-gray-900 ${error ? 'border-red-300' : ''}`}
                      
                    />
                    {error && (
                      <p className="mt-1 text-sm text-red-600">{error}</p>
                    )}
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Verify ID
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default IdVerificationPage;
