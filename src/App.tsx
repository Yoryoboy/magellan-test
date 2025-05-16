
import { useState } from 'react';
import QuizPage from './pages/QuizPage';
import IntroductionPage from './pages/IntroductionPage';
import RulesPage from './pages/RulesPage';
import IdVerificationPage from './pages/IdVerificationPage';
import { STORAGE_KEYS, loadFromLocalStorage } from './utils/localStorage';
import type { UserData } from './types/testTypes';



function App() {
  const [userData, setUserData] = useState<UserData | null>(() => {
    return loadFromLocalStorage<UserData>(STORAGE_KEYS.USER_DATA);
  });
  const [currentPage, setCurrentPage] = useState<'rules' | 'idVerification' | 'registration'>('rules');

  const handleStart = (data: UserData) => {
    setUserData(data);
  };

  const handleContinueFromRules = () => {
    setCurrentPage('idVerification');
  };

  const handleContinueFromIdVerification = () => {
    setCurrentPage('registration');
  };

  return (
    <>
      {!userData ? (
        currentPage === 'rules' ? (
          <RulesPage onContinue={handleContinueFromRules} />
        ) : currentPage === 'idVerification' ? (
          <IdVerificationPage onContinue={handleContinueFromIdVerification} />
        ) : (
          <IntroductionPage onStart={handleStart} />
        )
      ) : (
        <QuizPage userData={userData} />
      )}
    </>
  );
}

export default App