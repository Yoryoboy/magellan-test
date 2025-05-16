
import { useState } from 'react';
import QuizPage from './pages/QuizPage';
import IntroductionPage from './pages/IntroductionPage';
import { STORAGE_KEYS, loadFromLocalStorage } from './utils/localStorage';
import type { UserData } from './types/testTypes';



function App() {
  const [userData, setUserData] = useState<UserData | null>(() => {
    return loadFromLocalStorage<UserData>(STORAGE_KEYS.USER_DATA);
  });

  const handleStart = (data: UserData) => {
    setUserData(data);
  };

  return (
    <>
      {!userData ? (
        <IntroductionPage onStart={handleStart} />
      ) : (
        <QuizPage userData={userData} />
      )}
    </>
  );
}

export default App