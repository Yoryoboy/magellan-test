import { useState, useEffect } from 'react';
import QuestionList from '../components/QuestionList';
import SubmitButton from '../components/SubmitButton';
import CompletionMessage from '../components/CompletionMessage';
import { useQuestions } from '../hooks/useQuestions';
import { calculateScore, calculatePercentage } from '../utils/score';
import { STORAGE_KEYS, saveToLocalStorage, loadFromLocalStorage } from '../utils/localStorage';
import { submitTestToNotion } from '../api/notionSubmission';
import type { SubmissionState, QuizPageProps } from '../types/testTypes';



const QuizPage = ({ userData, onViewResults, onEndSession }: QuizPageProps) => {
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
  const [showEndSessionConfirm, setShowEndSessionConfirm] = useState(false);
  const [unansweredIds, setUnansweredIds] = useState<number[]>([]);
  const [showUnansweredModal, setShowUnansweredModal] = useState(false);
  
  // Save submission state to localStorage whenever it changes
  useEffect(() => {
    saveToLocalStorage(STORAGE_KEYS.SUBMISSION, submissionState);
  }, [submissionState]);

  // Check for unanswered questions first — warn but allow submission anyway.
  const handleSubmit = () => {
    const unanswered = questions
      .filter((q) => !q.userAnswer || q.userAnswer.length === 0)
      .map((q) => q.id);
    if (unanswered.length > 0) {
      setUnansweredIds(unanswered);
      setShowUnansweredModal(true);
    } else {
      doSubmit();
    }
  };

  const doSubmit = async () => {
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
      // Submit all data to Notion
      const result = await submitTestToNotion(
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
          <div className="mt-3 flex justify-center">
            <button
              type="button"
              onClick={() => setShowEndSessionConfirm(true)}
              className="inline-flex items-center px-3 py-1.5 border border-red-300 text-sm font-medium rounded-md text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              End session
            </button>
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
        <CompletionMessage
          isVisible={showCompletionMessage}
          // Only offer results when Notion saved them; on API errors the
          // results page would be empty.
          onViewResults={
            submissionErrors.length === 0 ? onViewResults : undefined
          }
        />
        
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
        {/* Unanswered questions confirmation */}
        {showUnansweredModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-auto">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-amber-100 mb-4">
                  <svg className="h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
                  Unanswered questions
                </h3>
                <p className="text-sm text-gray-500 mb-3">
                  {unansweredIds.length === 1
                    ? "1 question is still unanswered:"
                    : `${unansweredIds.length} questions are still unanswered:`}
                </p>
                <div className="flex flex-wrap justify-center gap-1.5 mb-4">
                  {unansweredIds.map((id) => (
                    <span
                      key={id}
                      className="inline-flex items-center px-2 py-0.5 rounded bg-red-50 border border-red-200 text-xs font-medium text-red-700"
                    >
                      Q{id}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mb-4">
                  You can still submit without them, but check that you didn't
                  miss any by accident.
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowUnansweredModal(false)}
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Review answers
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowUnansweredModal(false);
                      doSubmit();
                    }}
                    className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Submit anyway
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* End session confirmation */}
        {showEndSessionConfirm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-auto">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">End test session?</h3>
                <p className="text-sm text-gray-500">
                  This will delete all your progress and answers so you can start a new test with a different ID.
                </p>
                <div className="mt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowEndSessionConfirm(false)}
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEndSessionConfirm(false);
                      onEndSession?.();
                    }}
                    className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    End session
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default QuizPage;
