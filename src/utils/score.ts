import type { Question } from '../types/question';


export const calculateScore = (questions: Question[]): number => {
  return questions.reduce((total, question) => {
    if (question.userAnswer && question.correctAnswer.includes(question.userAnswer)) {
      return total + question.points;
    }
    return total;
  }, 0);
};


export const calculatePercentage = (score: number, questions: Question[]): number => {
  const totalPossiblePoints = questions.reduce((total, question) => total + question.points, 0);
  return (score / totalPossiblePoints) * 100;
};


export const countAnsweredQuestions = (questions: Question[]): number => {
  return questions.filter(question => question.userAnswer !== null).length;
};


export const areAllQuestionsAnswered = (questions: Question[]): boolean => {
  return questions.every(question => question.userAnswer !== null);
};
