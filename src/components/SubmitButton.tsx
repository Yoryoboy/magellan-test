import type { Question } from '../types/question';
import { countAnsweredQuestions } from '../utils/score';

interface SubmitButtonProps {
  questions: Question[];
  onSubmit: () => void;
}

const SubmitButton = ({ questions, onSubmit }: SubmitButtonProps) => {
  const answeredCount = countAnsweredQuestions(questions);
  const totalQuestions = questions.length;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 sm:flex sm:justify-between sm:items-center">
      <div className="mb-3 sm:mb-0">
        <p className="text-sm text-gray-600">
          {answeredCount} of {totalQuestions} questions answered
        </p>
      </div>
      <button
        onClick={onSubmit}
        className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        aria-label="Submit all answers"
      >
        Submit Answers
      </button>
    </div>
  );
};

export default SubmitButton;
