import { useState, useEffect } from 'react';
import QuestionList from '../components/QuestionList';
import SubmitButton from '../components/SubmitButton';
import CompletionMessage from '../components/CompletionMessage';
import { useQuestions } from '../hooks/useQuestions';
import { calculateScore, calculatePercentage } from '../utils/score';
import { STORAGE_KEYS, saveToLocalStorage, loadFromLocalStorage } from '../utils/localStorage';
import { submitTestToClickUp } from '../api/clickUpSubmission';
import type { SubmissionState, QuizPageProps } from '../types/testTypes';



const QuizPage = ({ userData }: QuizPageProps) => {
  const { questions, handleAnswerChange } = useQuestions();
  
  // Initialize submission state from localStorage
  const [submissionState, setSubmissionState] = useState<SubmissionState>(() => {
    const savedState = loadFromLocalStorage<SubmissionState>(STORAGE_KEYS.SUBMISSION);
    return savedState || { isSubmitted: false, score: 0, percentage: 0 };
  });
  
  // We don't need to destructure these values anymore as we're using the state directly
  
  // State for submission process
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCompletionMessage, setShowCompletionMessage] = useState(false);
  const [submissionErrors, setSubmissionErrors] = useState<string[]>([]);
  
  // Save submission state to localStorage whenever it changes
  useEffect(() => {
    saveToLocalStorage(STORAGE_KEYS.SUBMISSION, submissionState);
  }, [submissionState]);

  const handleSubmit = async () => {
    // Prevent multiple submissions
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setSubmissionErrors([]);
    
    const calculatedScore = calculateScore(questions);
    const calculatedPercentage = calculatePercentage(calculatedScore, questions);
    
    // Save the score and percentage to localStorage
    const submissionData = {
      isSubmitted: true, // Now we can set this to true since we'll show our own message
      score: calculatedScore,
      percentage: calculatedPercentage,
      timestamp: new Date().toISOString()
    };
    
    // Save to localStorage
    saveToLocalStorage(STORAGE_KEYS.SUBMISSION, submissionData);
    setSubmissionState(submissionData);
    
    try {
      // Submit all data to ClickUp
      const result = await submitTestToClickUp(
        userData,
        questions,
        calculatedScore,
        calculatedPercentage
      );
      
      if (!result.success) {
        console.error('Errors during submission:', result.errors);
        setSubmissionErrors(result.errors);
      }
      
      // Show completion message regardless of API success
      // The data is saved locally, so the user can try again later if needed
      setShowCompletionMessage(true);
    } catch (error) {
      console.error('Error during submission:', error instanceof Error ? error.message : String(error));
      setSubmissionErrors(['An unexpected error occurred during submission.']);
      setShowCompletionMessage(true); // Still show completion message
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 text-center">Magellan Written Test</h1>
          <div className="mt-2 text-center text-gray-600">
            <p>Welcome, {userData.name}</p>
            <p className="text-sm">Test started: {new Date(userData.startTime).toLocaleString()}</p>
          </div>
        </div>
      </header>

      <main>

        <QuestionList 
          questions={questions} 
          onAnswerChange={handleAnswerChange} 
        />
        
        {/* Show the submit button only if not already submitting */}
        {!isSubmitting && !showCompletionMessage && (
          <SubmitButton 
            questions={questions} 
            onSubmit={handleSubmit} 
          />
        )}
        
        {/* Show a loading indicator if submitting */}
        {isSubmitting && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-center items-center">
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Submitting your test results...</span>
            </div>
          </div>
        )}
        
        {/* Show completion message */}
        <CompletionMessage isVisible={showCompletionMessage} />
        
        {/* Show submission errors if any */}
        {submissionErrors.length > 0 && showCompletionMessage && (
          <div className="fixed bottom-4 right-4 max-w-md bg-white rounded-lg shadow-lg border border-red-200 p-4 z-50">
            <h3 className="text-sm font-medium text-red-800">Some errors occurred during submission:</h3>
            <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
              {submissionErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-gray-500">
              Your test results have been saved locally. You can close this message.
            </p>
            <button 
              onClick={() => setSubmissionErrors([])} 
              className="mt-2 text-xs text-gray-500 hover:text-gray-700"
            >
              Dismiss
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default QuizPage;
