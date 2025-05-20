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

  const handleAnswerChange = (id: number, answer: string, isChecked: boolean) => {
    setQuestions(prevQuestions => 
      prevQuestions.map(question => {
        if (question.id === id) {
          // Si es la primera respuesta, inicializar el array
          if (!question.userAnswer) {
            return isChecked 
              ? { ...question, userAnswer: [answer] } 
              : question;
          }
          
          // Si ya hay respuestas, agregar o quitar según corresponda
          if (isChecked) {
            // Si la respuesta no está en el array, agregarla
            if (!question.userAnswer.includes(answer)) {
              return { ...question, userAnswer: [...question.userAnswer, answer] };
            }
          } else {
            // Si la respuesta está en el array, quitarla
            if (question.userAnswer.includes(answer)) {
              const updatedAnswers = question.userAnswer.filter(ans => ans !== answer);
              return { 
                ...question, 
                userAnswer: updatedAnswers.length > 0 ? updatedAnswers : null 
              };
            }
          }
        }
        return question;
      })
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
