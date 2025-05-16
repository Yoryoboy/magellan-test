import { useState, useEffect } from 'react';
import QuestionList from '../components/QuestionList';
import SubmitButton from '../components/SubmitButton';
import { useQuestions } from '../hooks/useQuestions';
import { calculateScore, calculatePercentage } from '../utils/score';
import { STORAGE_KEYS, saveToLocalStorage, loadFromLocalStorage } from '../utils/localStorage';
import { downloadTestSummaryPDF } from '../utils/pdfGenerator';
import type { SubmissionState, QuizPageProps } from '../types/testTypes';



const QuizPage = ({ userData }: QuizPageProps) => {
  const { questions, handleAnswerChange, resetQuestions } = useQuestions();
  
  // Initialize submission state from localStorage
  const [submissionState, setSubmissionState] = useState<SubmissionState>(() => {
    const savedState = loadFromLocalStorage<SubmissionState>(STORAGE_KEYS.SUBMISSION);
    return savedState || { isSubmitted: false, score: 0, percentage: 0 };
  });
  
  const { isSubmitted, score, percentage } = submissionState;
  
  // Save submission state to localStorage whenever it changes
  useEffect(() => {
    saveToLocalStorage(STORAGE_KEYS.SUBMISSION, submissionState);
  }, [submissionState]);

  const handleSubmit = () => {
    const calculatedScore = calculateScore(questions);
    const calculatedPercentage = calculatePercentage(calculatedScore, questions);
    
    // Save the score and percentage to localStorage without setting isSubmitted to true
    const submissionData = {
      isSubmitted: false, // Keep this false so results aren't shown
      score: calculatedScore,
      percentage: calculatedPercentage,
      timestamp: new Date().toISOString() // Add timestamp for when the test was completed
    };
    
    // Save to localStorage directly
    saveToLocalStorage(STORAGE_KEYS.SUBMISSION, submissionData);
    
    try {
      // Generate and download the PDF summary
      downloadTestSummaryPDF(userData, questions, calculatedScore, calculatedPercentage);
      
      // Show confirmation to the user that their answers were saved
      alert('Your answers have been submitted successfully. A summary PDF has been downloaded for your records.');
    } catch (error) {
      console.error('Error generating PDF:', error instanceof Error ? error.message : String(error));
      alert('Your answers have been submitted successfully, but there was an error generating the PDF summary. Check the console for details.');
    }
  };
  
  const handleReset = () => {
    // Reset both the questions and submission state
    resetQuestions();
    setSubmissionState({
      isSubmitted: false,
      score: 0,
      percentage: 0
    });
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
        {isSubmitted && (
          <div className="w-full bg-gray-50 py-8">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h2 className="text-lg leading-6 font-medium text-gray-900">Test Results</h2>
                  <div className="mt-2 max-w-xl text-sm text-gray-500">
                    <p>You scored {score} out of {questions.reduce((total, q) => total + q.points, 0)} points.</p>
                    <p className="mt-1">Percentage: {percentage.toFixed(2)}%</p>
                  </div>
                  <div className="mt-5">
                    <div className="flex space-x-4">
                      <button
                        type="button"
                        onClick={() => setSubmissionState({...submissionState, isSubmitted: false})}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Back to Test
                      </button>
                      <button
                        type="button"
                        onClick={handleReset}
                        className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Reset Test
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <QuestionList 
          questions={questions} 
          onAnswerChange={handleAnswerChange} 
        />
        
        <SubmitButton 
          questions={questions} 
          onSubmit={handleSubmit} 
        />
      </main>
    </div>
  );
};

export default QuizPage;
