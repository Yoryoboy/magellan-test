import { useState, useEffect, useMemo } from "react";
import { fetchResults } from "../api/notion";
import type { ResultsPageProps, TestResults } from "../types/testTypes";

const ResultsPage = ({ pageId, onBack }: ResultsPageProps) => {
  const [results, setResults] = useState<TestResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortMode, setSortMode] = useState<"original" | "failed-first">(
    "original"
  );

  // NOTE: all hooks must run before any early return (Rules of Hooks).
  const sortedQuestions = useMemo(() => {
    if (!results) return [];
    if (sortMode === "original") return results.questions;
    // Failed first (false=0), passed second (true=1); stable sort keeps
    // the original relative order inside each group.
    return [...results.questions].sort(
      (a, b) => Number(a.isCorrect) - Number(b.isCorrect)
    );
  }, [results, sortMode]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchResults(pageId);
        if (data) {
          setResults(data);
        } else {
          setError("Could not load test results.");
        }
      } catch {
        setError("An error occurred while loading results.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [pageId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <svg
            className="animate-spin h-6 w-6 text-indigo-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-gray-600">Loading results...</span>
        </div>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "No results found."}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-indigo-600 hover:text-indigo-800 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const passed = results.status === "test approved";

  return (
    <div className="min-h-screen bg-white pb-24">
      <header className="bg-white shadow-sm relative">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 text-center">
            Magellan Written Test
          </h1>
        </div>
        {onBack && (
          <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              ← Back
            </button>
          </div>
        )}
      </header>

      <main>
        <div className="max-w-4xl mx-auto mt-10 px-4 sm:px-6 lg:px-8">
          {/* Result banner */}
          <div
            className={`rounded-lg p-6 mb-8 ${
              passed ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
            }`}
          >
            <h2 className="text-2xl font-bold text-center mb-4 text-gray-900">Test Results</h2>
            <p className="text-lg text-center mb-2 text-gray-900">
              Candidate: <span className="font-semibold">{results.candidateName}</span>
            </p>
            <p className="text-3xl font-bold text-center mb-2 text-gray-900">
              {results.score} / {results.totalPoints}{" "}
              <span className="text-xl">({results.percentage}%)</span>
            </p>
            <p className="text-xl font-semibold text-center text-gray-900">
              {passed ? "✅ Approved" : "❌ Failed"}
            </p>
          </div>

          {/* Question breakdown */}
          {results.questions.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <h3 className="text-xl font-semibold text-gray-900">
                  Question Breakdown
                </h3>
                <div className="flex items-center gap-1 rounded-md border border-gray-300 p-1">
                  <button
                    type="button"
                    onClick={() => setSortMode("original")}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      sortMode === "original"
                        ? "bg-indigo-600 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Original order
                  </button>
                  <button
                    type="button"
                    onClick={() => setSortMode("failed-first")}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      sortMode === "failed-first"
                        ? "bg-indigo-600 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Failed first
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                {sortedQuestions.map((q) => (
                  <div
                    key={q.id}
                    className={`rounded-lg p-4 border ${
                      q.isCorrect
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg mt-0.5">
                        {q.isCorrect ? "✅" : "❌"}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          Q{q.id}: {q.question}{" "}
                          <span className="text-sm text-gray-500">
                            ({q.points} pts)
                          </span>
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Your answer: {q.userAnswer.join(", ") || "No answer"}
                        </p>
                        {!q.isCorrect && (
                          <p className="text-sm text-green-700 mt-1">
                            Correct answer: {q.correctAnswer.join(", ")}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ResultsPage;
