import type { Question } from '../types/question';

interface QuestionCardProps {
  question: Question;
  onAnswerChange: (id: number, answer: string, isChecked: boolean) => void;
}

const QuestionCard = ({ question, onAnswerChange }: QuestionCardProps) => {
  // Determine if the question has been answered
  const isAnswered = question.userAnswer !== null;
  
  return (
    <div className={`rounded-lg shadow-md p-6 mb-6 transition-all duration-300 ${isAnswered ? 'bg-indigo-50 border-l-4 border-indigo-500' : 'bg-white'}`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-medium text-gray-900 mb-2">{question.question}</h3>
        {isAnswered && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
            Answered
          </span>
        )}
      </div>
      <div className="space-y-3">
        {question.options.map((option, index) => (
          <div key={index} className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id={`question-${question.id}-option-${index}`}
                name={`question-${question.id}-option-${index}`}
                type="checkbox"
                className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                checked={question.userAnswer ? question.userAnswer.includes(option) : false}
                onChange={(e) => onAnswerChange(question.id, option, e.target.checked)}
                aria-labelledby={`question-${question.id}-option-${index}-label`}
              />
            </div>
            <div className="ml-3 text-sm">
              <label 
                id={`question-${question.id}-option-${index}-label`}
                htmlFor={`question-${question.id}-option-${index}`} 
                className="font-medium text-gray-700 cursor-pointer"
              >
                {option}
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestionCard;
