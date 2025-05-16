export interface UserData {
  name: string;
  email: string;
  startTime: string;
}

export interface SubmissionState {
  isSubmitted: boolean;
  score: number;
  percentage: number;
}

export interface QuizPageProps {
  userData: UserData;
}

export interface IntroductionPageProps {
  onStart: (userData: UserData) => void;
}

export interface RulesPageProps {
  onContinue: () => void;
}
