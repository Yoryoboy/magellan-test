import { useState } from 'react';
import type { FormEvent } from 'react';
import { STORAGE_KEYS, saveToLocalStorage } from '../utils/localStorage';
import { updateTaskToInProgress } from '../api/startTest';
import type { UserData, IntroductionPageProps } from '../types/testTypes';



const IntroductionPage = ({ onStart }: IntroductionPageProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({
    name: '',
    email: ''
  });

  const validateForm = (): boolean => {
    const newErrors = {
      name: '',
      email: ''
    };
    let isValid = true;

    // Validate name
    if (!name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }

    // Validate email
    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusError, setStatusError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      setStatusError('');
      
      // Get the verified task ID from localStorage
      const verifiedTaskId = localStorage.getItem('verifiedTaskId');
      
      if (!verifiedTaskId) {
        // This shouldn't happen since we're coming from the verification page
        console.error('No verified task ID found');
        setIsSubmitting(false);
        return;
      }
      
      const userData: UserData = {
        name,
        email,
        startTime: new Date().toISOString(),
        taskId: verifiedTaskId
      };
      
      // Save user data to localStorage
      saveToLocalStorage(STORAGE_KEYS.USER_DATA, userData);
      
      // Update task status to "test in progress" and set task name
      try {
        const statusUpdated = await updateTaskToInProgress(verifiedTaskId, userData);
        if (!statusUpdated) {
          // Non-blocking error - we'll continue even if status update fails
          console.error('Failed to update task status to in progress');
          setStatusError('Note: Failed to update task status, but you can still continue with the test.');
        }
      } catch (error) {
        console.error('Error updating task status:', error);
        setStatusError('Note: Failed to update task status, but you can still continue with the test.');
      } finally {
        setIsSubmitting(false);
      }
      
      // Proceed to the test
      onStart(userData);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 text-center">Magellan Written Test</h1>
        </div>
      </header>

      <main>
        <div className="max-w-3xl mx-auto mt-10 px-4 sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg leading-6 font-medium text-gray-900 mb-4">Welcome to the Test</h2>
              <p className="text-gray-500 mb-6">
                Please fill in your information below to begin the test. Your responses will be recorded along with the time you start.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md text-gray-900 ${errors.name ? 'border-red-300' : ''}`}
                      placeholder="John Doe"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <div className="mt-1">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md text-gray-900 ${errors.email ? 'border-red-300' : ''}`}
                      placeholder="john@example.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>
                </div>
                {statusError && (
                  <div className="rounded-md bg-yellow-50 p-4 mb-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">{statusError}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Starting Test...
                      </>
                    ) : (
                      'Start Test'
                    )}
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

export default IntroductionPage;
