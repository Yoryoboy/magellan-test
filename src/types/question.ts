export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string[];
  points: number;
  userAnswer: string[] | null;
}
