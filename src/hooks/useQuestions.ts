import { useState, useEffect } from 'react';
import type { Question } from '../types/question';
import { questions as defaultQuestions } from '../questions/questions';
import { STORAGE_KEYS, saveToLocalStorage, loadFromLocalStorage } from '../utils/localStorage';

export const useQuestions = () => {
  // Initialize state from localStorage or use default questions
  const [questions, setQuestions] = useState<Question[]>(() => {
    const savedQuestions = loadFromLocalStorage<Question[]>(STORAGE_KEYS.QUESTIONS);
    return savedQuestions || defaultQuestions;
  });

  // Save questions to localStorage whenever they change
  useEffect(() => {
    saveToLocalStorage(STORAGE_KEYS.QUESTIONS, questions);
  }, [questions]);

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
    setQuestions(defaultQuestions.map(question => ({
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
