export interface UserData {
  name: string;
  email: string;
  startTime: string;
  taskId?: string;
}

export interface SubmissionState {
  isSubmitted: boolean;
  score: number;
  percentage: number;
}

export interface QuizPageProps {
  userData: UserData;
  onViewResults?: () => void;
  onEndSession?: () => void;
}

export interface IntroductionPageProps {
  onStart: (userData: UserData) => void;
}

export interface RulesPageProps {
  onContinue: () => void;
}

export interface IdVerificationPageProps {
  onContinue: () => void;
  onAlreadyTaken: (pageId: string) => void;
}

export interface ResultsPageProps {
  pageId: string;
}

// Returned by fetchResults for the results page
export interface TestResults {
  candidateName: string;
  score: number;
  percentage: number;
  status: string;
  totalPoints: number;
  questions: ResultQuestion[];
}

export interface ResultQuestion {
  id: number;
  question: string;
  userAnswer: string[];
  correctAnswer: string[];
  points: number;
  isCorrect: boolean;
}
