import { useState, useEffect, useCallback, useRef } from "react";
import type { FormEvent } from "react";
import { createTestEntry, listCandidates } from "../api/notion";
import { ADMIN_PASSWORD } from "../config";
import type { AdminCandidate, AdminPageProps } from "../types/testTypes";

const ADMIN_AUTH_KEY = "magellan-admin-authenticated";

const AdminPasswordGate = ({ onSuccess }: { onSuccess: () => void }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      onSuccess();
    } else {
      setError("Incorrect password. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="bg-white overflow-hidden shadow rounded-lg w-full max-w-sm">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-1">Admin access</h2>
          <p className="text-sm text-gray-500 mb-4">
            Enter the admin password to manage test entries.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              id="adminPassword"
              name="adminPassword"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoFocus
              className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md text-gray-900 ${
                error ? "border-red-300" : ""
              }`}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Enter
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const statusBadge = (status: string, testTaken: boolean) => {
  const base = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
  if (testTaken) {
    if (status === "test approved")
      return `${base} bg-green-100 text-green-800`;
    if (status === "test failed") return `${base} bg-red-100 text-red-800`;
  }
  if (status === "test in progress")
    return `${base} bg-amber-100 text-amber-800`;
  return `${base} bg-gray-100 text-gray-600`;
};

const statusLabel = (status: string, testTaken: boolean) => {
  if (!testTaken) return "Not started";
  if (status === "test approved") return "Approved";
  if (status === "test failed") return "Failed";
  if (status === "test in progress") return "In progress";
  return status;
};

const AdminPage = ({ onBack, onViewCandidate }: AdminPageProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem(ADMIN_AUTH_KEY) === "true";
  });
  const [candidates, setCandidates] = useState<AdminCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const copyTimer = useRef<number | null>(null);

  const handleCopy = async (candidateId: string) => {
    try {
      await navigator.clipboard.writeText(candidateId);
      setCopiedId(candidateId);
      if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setCopiedId(null), 1500);
    } catch {
      // Clipboard API unavailable — the ID is still visible for manual copy
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const data = await listCandidates();
    if (data === null) {
      setError("Could not load the candidate list. Please try again.");
    } else {
      setCandidates(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated) load();
  }, [isAuthenticated, load]);

  if (!isAuthenticated) {
    return (
      <AdminPasswordGate
        onSuccess={() => {
          sessionStorage.setItem(ADMIN_AUTH_KEY, "true");
          setIsAuthenticated(true);
        }}
      />
    );
  }

  const handleCreate = async () => {
    if (creating) return;
    setCreating(true);
    setCreated(null);
    setError("");
    const result = await createTestEntry();
    if (result.success && result.candidateId) {
      setCreated(result.candidateId);
      await load();
    } else {
      setError(result.error || "Failed to create the test entry.");
    }
    setCreating(false);
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 text-center">
            Magellan Written Test - Admin
          </h1>
        </div>
      </header>

      <main>
        <div className="max-w-6xl mx-auto mt-10 px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={onBack}
            className="mb-6 inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            ← Back to start
          </button>

          {/* Create entry */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-8">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-1">
                Create test entry
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Generates a random Candidate ID and creates a placeholder page
                in Notion. Share the ID with the candidate so they can start the test.
              </p>
              <button
                type="button"
                onClick={handleCreate}
                disabled={creating}
                className={`inline-flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  creating
                    ? "bg-indigo-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
              >
                {creating ? "Creating..." : "Generate new ID"}
              </button>
              {created && (
                <div
                  className="mt-4 p-4 text-sm text-green-700 bg-green-100 rounded-lg"
                  role="alert"
                >
                  <span className="font-medium">Entry created!</span> New
                  Candidate ID: <span className="font-mono font-semibold">{created}</span>
                </div>
              )}
            </div>
          </div>

          {/* Candidate list */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                All tests
              </h2>

              {error && (
                <p className="text-sm text-red-600 mb-4">{error}</p>
              )}

              {loading ? (
                <p className="text-sm text-gray-500">Loading candidates...</p>
              ) : candidates.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No test entries found in the database.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead>
                      <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <th className="px-3 py-3">Name</th>
                        <th className="px-3 py-3">Candidate ID</th>
                        <th className="px-3 py-3">Email</th>
                        <th className="px-3 py-3">Status</th>
                        <th className="px-3 py-3 text-right">Score</th>
                        <th className="px-3 py-3 text-right">%</th>
                        <th className="px-3 py-3">Completed</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {candidates.map((c) => (
                        <tr
                          key={c.pageId}
                          onClick={() => onViewCandidate(c.pageId)}
                          className="cursor-pointer hover:bg-gray-50"
                        >
                          <td className="px-3 py-3 font-medium text-gray-900">
                            {c.name}
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-gray-700">
                                {c.candidateId || "-"}
                              </span>
                              {c.candidateId && (
                                <button
                                  type="button"
                                  title="Copy ID"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopy(c.candidateId);
                                  }}
                                  className="text-gray-400 hover:text-indigo-600 focus:outline-none"
                                >
                                  {copiedId === c.candidateId ? (
                                    <svg
                                      className="h-4 w-4 text-green-600"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                      />
                                    </svg>
                                  ) : (
                                    <svg
                                      className="h-4 w-4"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                      />
                                    </svg>
                                  )}
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-3 text-gray-600">
                            {c.email || "-"}
                          </td>
                          <td className="px-3 py-3">
                            <span className={statusBadge(c.status, c.testTaken)}>
                              {statusLabel(c.status, c.testTaken)}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-right text-gray-700">
                            {c.score ?? "-"}
                          </td>
                          <td className="px-3 py-3 text-right text-gray-700">
                            {c.percentage ?? "-"}
                          </td>
                          <td className="px-3 py-3 text-gray-600">
                            {c.completionDate
                              ? new Date(c.completionDate).toLocaleDateString()
                              : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminPage;
