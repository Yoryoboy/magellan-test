import { useState } from 'react';
import type { Question } from '../types/question';
import { questions as initialQuestions } from '../questions/questions';

export const useQuestions = () => {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);

  const handleAnswerChange = (id: number, answer: string) => {
    setQuestions(prevQuestions => 
      prevQuestions.map(question => 
        question.id === id 
          ? { ...question, userAnswer: answer } 
          : question
      )
    );
  };

  const resetQuestions = () => {
    setQuestions(initialQuestions.map(question => ({
      ...question,
      userAnswer: null
    })));
  };

  return {
    questions,
    handleAnswerChange,
    resetQuestions
  };
};
