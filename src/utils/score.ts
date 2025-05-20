import type { Question } from '../types/question';


export const calculateScore = (questions: Question[]): number => {
  return questions.reduce((total, question) => {
    // Si no hay respuesta del usuario, no suma puntos
    if (!question.userAnswer) {
      return total;
    }

    // Verificar si las respuestas del usuario coinciden con las correctas
    // Para considerar correcta una pregunta, todas las respuestas seleccionadas deben ser correctas
    // y no debe faltar ninguna respuesta correcta
    
    // Verificar que todas las respuestas del usuario estén en las correctas
    const allUserAnswersAreCorrect = question.userAnswer.every(answer => 
      question.correctAnswer.includes(answer)
    );
    
    // Verificar que todas las respuestas correctas estén seleccionadas
    const allCorrectAnswersSelected = question.correctAnswer.every(answer => 
      question.userAnswer?.includes(answer) || false
    );
    
    // Solo suma puntos si ambas condiciones se cumplen
    if (allUserAnswersAreCorrect && allCorrectAnswersSelected) {
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
