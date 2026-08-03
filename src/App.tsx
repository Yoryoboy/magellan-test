import { useState } from "react";
import QuizPage from "./pages/QuizPage";
import IntroductionPage from "./pages/IntroductionPage";
import RulesPage from "./pages/RulesPage";
import IdVerificationPage from "./pages/IdVerificationPage";
import ResultsPage from "./pages/ResultsPage";
import AdminPage from "./pages/AdminPage";
import { STORAGE_KEYS, loadFromLocalStorage } from "./utils/localStorage";
import type { UserData } from "./types/testTypes";

function App() {
  const [userData, setUserData] = useState<UserData | null>(() => {
    return loadFromLocalStorage<UserData>(STORAGE_KEYS.USER_DATA);
  });
  const [currentPage, setCurrentPage] = useState<
    "rules" | "idVerification" | "registration" | "results" | "admin"
  >("rules");
  const [resultsPageId, setResultsPageId] = useState<string | null>(null);
  const [resultsBackTo, setResultsBackTo] = useState<
    "rules" | "idVerification" | "admin" | null
  >(null);

  const goToResults = (
    pageId: string,
    backTo: "rules" | "idVerification" | "admin"
  ) => {
    setResultsPageId(pageId);
    setResultsBackTo(backTo);
    setCurrentPage("results");
  };

  const handleStart = (data: UserData) => {
    setUserData(data);
  };

  const handleContinueFromRules = () => {
    setCurrentPage("idVerification");
  };

  const handleOpenAdmin = () => {
    setCurrentPage("admin");
  };

  const handleBackFromAdmin = () => {
    setCurrentPage("rules");
  };

  const handleContinueFromIdVerification = () => {
    setCurrentPage("registration");
  };

  const handleAlreadyTaken = (pageId: string) => {
    goToResults(pageId, "idVerification");
  };

  const handleViewResults = () => {
    if (userData?.taskId) {
      goToResults(userData.taskId, "rules");
    }
  };

  const handleViewCandidateFromAdmin = (pageId: string) => {
    goToResults(pageId, "admin");
  };

  const handleBackFromResults = () => {
    setCurrentPage(resultsBackTo ?? "rules");
    setResultsBackTo(null);
    setResultsPageId(null);
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
        <ResultsPage pageId={resultsPageId} onBack={handleBackFromResults} />
      ) : currentPage === "admin" ? (
        <AdminPage
          onBack={handleBackFromAdmin}
          onViewCandidate={handleViewCandidateFromAdmin}
        />
      ) : !userData ? (
        currentPage === "rules" ? (
          <RulesPage
            onContinue={handleContinueFromRules}
            onOpenAdmin={handleOpenAdmin}
          />
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
