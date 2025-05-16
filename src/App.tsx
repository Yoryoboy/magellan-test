
import { useState } from 'react';
import QuizPage from './pages/QuizPage';
import IntroductionPage from './pages/IntroductionPage';
import RulesPage from './pages/RulesPage';
import { STORAGE_KEYS, loadFromLocalStorage } from './utils/localStorage';
import type { UserData } from './types/testTypes';



function App() {
  const [userData, setUserData] = useState<UserData | null>(() => {
    return loadFromLocalStorage<UserData>(STORAGE_KEYS.USER_DATA);
  });
  const [showRules, setShowRules] = useState(true);

  const handleStart = (data: UserData) => {
    setUserData(data);
  };

  const handleContinueFromRules = () => {
    setShowRules(false);
  };

  return (
    <>
      {!userData ? (
        showRules ? (
          <RulesPage onContinue={handleContinueFromRules} />
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