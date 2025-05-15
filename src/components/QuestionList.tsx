import type { Question } from '../types/question';
import QuestionCard from './QuestionCard';

interface QuestionListProps {
  questions: Question[];
  onAnswerChange: (id: number, answer: string) => void;
}

const QuestionList = ({ questions, onAnswerChange }: QuestionListProps) => {
  return (
    <div className="w-full bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {questions.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                onAnswerChange={onAnswerChange}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionList;
