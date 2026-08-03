import { useState } from "react";
import QuizPage from "./pages/QuizPage";
import IntroductionPage from "./pages/IntroductionPage";
import RulesPage from "./pages/RulesPage";
import IdVerificationPage from "./pages/IdVerificationPage";
import ResultsPage from "./pages/ResultsPage";
import { STORAGE_KEYS, loadFromLocalStorage } from "./utils/localStorage";
import type { UserData } from "./types/testTypes";

function App() {
  const [userData, setUserData] = useState<UserData | null>(() => {
    return loadFromLocalStorage<UserData>(STORAGE_KEYS.USER_DATA);
  });
  const [currentPage, setCurrentPage] = useState<
    "rules" | "idVerification" | "registration" | "results"
  >("rules");
  const [resultsPageId, setResultsPageId] = useState<string | null>(null);

  const handleStart = (data: UserData) => {
    setUserData(data);
  };

  const handleContinueFromRules = () => {
    setCurrentPage("idVerification");
  };

  const handleContinueFromIdVerification = () => {
    setCurrentPage("registration");
  };

  const handleAlreadyTaken = (pageId: string) => {
    setResultsPageId(pageId);
    setCurrentPage("results");
  };

  const handleViewResults = () => {
    if (userData?.taskId) {
      setResultsPageId(userData.taskId);
      setCurrentPage("results");
    }
  };

  const handleEndSession = () => {
    // Wipe all test state so the next ID starts clean
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    localStorage.removeItem(STORAGE_KEYS.QUESTIONS);
    localStorage.removeItem(STORAGE_KEYS.SUBMISSION);
    localStorage.removeItem("verifiedTaskId");
    setUserData(null);
    setResultsPageId(null);
    setCurrentPage("rules");
  };

  return (
    <>
      {currentPage === "results" && resultsPageId ? (
        <ResultsPage pageId={resultsPageId} />
      ) : !userData ? (
        currentPage === "rules" ? (
          <RulesPage onContinue={handleContinueFromRules} />
        ) : currentPage === "idVerification" ? (
          <IdVerificationPage
            onContinue={handleContinueFromIdVerification}
            onAlreadyTaken={handleAlreadyTaken}
          />
        ) : (
          <IntroductionPage onStart={handleStart} />
        )
      ) : (
        <QuizPage
          userData={userData}
          onViewResults={handleViewResults}
          onEndSession={handleEndSession}
        />
      )}
    </>
  );
}

export default App;
