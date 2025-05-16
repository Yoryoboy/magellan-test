import { useState } from 'react';
import type { FormEvent } from 'react';
import { verifyTaskId } from '../api/clickUp';
import type { IdVerificationPageProps } from '../types/testTypes';



const IdVerificationPage: React.FC<IdVerificationPageProps> = ({ onContinue }) => {
  const [supervisorId, setSupervisorId] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    let processedId = supervisorId.trim();
    if (processedId.startsWith('#')) {
      processedId = processedId.substring(1);
    }
    
    if (!processedId) {
      setError('Supervisor ID is required');
      return;
    }
    
    try {
      setIsVerifying(true);
      setError('');
      
      const result = await verifyTaskId(processedId);
      
      if (result.valid) {
        setVerificationSuccess(true);
        // Save the verified ID to localStorage for later use
        localStorage.setItem('verifiedTaskId', processedId);
        // Wait a moment to show success message before continuing
        setTimeout(() => {
          onContinue();
        }, 1500);
      } else {
        setError(result.error || 'Invalid ID. Please contact your supervisor.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Error during ID verification:', err);
    } finally {
      setIsVerifying(false);
    }
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
              <h2 className="text-lg leading-6 font-medium text-gray-900 mb-4">Enter Test ID</h2>
              <p className="text-gray-500 mb-6">
                Please enter the ID provided by your supervisor or manager to continue with the test.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="supervisorId" className="block text-sm font-medium text-gray-700">
                    Test ID
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
                  {verificationSuccess ? (
                    <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg" role="alert">
                      <span className="font-medium">Success!</span> ID verified successfully. Redirecting...
                    </div>
                  ) : (
                    <button
                      type="submit"
                      disabled={isVerifying}
                      className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isVerifying ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                    >
                      {isVerifying ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Verifying...
                        </>
                      ) : (
                        'Verify ID'
                      )}
                    </button>
                  )}
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
