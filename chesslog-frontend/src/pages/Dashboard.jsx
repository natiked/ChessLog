import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { apiClient } from "../api/clients.js";

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [careerStats, setCareerStats] = useState({
    total: 0,
    wins: 0,
    losses: 0,
    winRate: 0,
  });

  useEffect(() => {
    let isMounted = true;

    const fetchSessions = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await apiClient(`/analytics?page=${page}&limit=10`);

        if (isMounted) {
          setSessions(response.data || []);
          setHasNext(Boolean(response.next));
          setHasPrev(Boolean(response.previous));

          if (response.careerStats) {
            setCareerStats(response.careerStats);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Failed to load sessions.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchSessions();

    return () => {
      isMounted = false;
    };
  }, [page]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center font-bold text-indigo-400">
            ♟
          </div>
          <div>
            <h1 className="text-base font-semibold leading-none text-white">
              ChessLog Dashboard
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {user?.email || "Player Profile"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/add-session"
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold shadow-lg shadow-indigo-600/20 transition active:scale-95"
          >
            <span>+</span> Log Session
          </Link>
          <button
            onClick={handleLogout}
            className="px-3.5 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8 space-y-8">
        {error && (
          <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            <p className="text-sm text-slate-400">Fetching session records...</p>
          </div>
        ) : (
          <>
            {/* Stat Cards - Now reading from careerStats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Career Games
                </span>
                <p className="text-3xl font-extrabold text-white mt-2">
                  {careerStats.total}
                </p>
                <p className="text-xs text-slate-500 mt-1">Lifetime total</p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Lifetime Win Rate
                </span>
                <p className="text-3xl font-extrabold text-indigo-400 mt-2">
                  {careerStats.winRate}%
                </p>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${careerStats.winRate}%` }}
                  />
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Career Record (W / L)
                </span>
                <p className="text-2xl font-bold text-white mt-2">
                  <span className="text-emerald-400">{careerStats.wins}W</span>
                  <span className="text-slate-600 mx-2">/</span>
                  <span className="text-rose-400">{careerStats.losses}L</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">Wins vs. Losses</p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Page
                </span>
                <p className="text-3xl font-bold text-white mt-2">
                  #{page}
                </p>
                <p className="text-xs text-slate-500 mt-1">10 items per page</p>
              </div>
            </div>

            {/* Lifetime Win/Loss Graphic Breakdown */}
            {careerStats.total > 0 && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-slate-300 mb-3">
                  Lifetime Outcome Breakdown
                </h3>

                <div className="h-4 w-full rounded-lg bg-slate-800 overflow-hidden flex">
                  <div
                    title={`Wins: ${careerStats.wins}`}
                    style={{
                      width: `${(careerStats.wins / careerStats.total) * 100}%`,
                    }}
                    className="bg-emerald-500 transition-all duration-500"
                  />
                  <div
                    title={`Losses: ${careerStats.losses}`}
                    style={{
                      width: `${(careerStats.losses / careerStats.total) * 100}%`,
                    }}
                    className="bg-rose-500 transition-all duration-500"
                  />
                </div>

                <div className="flex items-center gap-6 mt-3 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>Wins ({careerStats.wins})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span>Losses ({careerStats.losses})</span>
                  </div>
                </div>
              </div>
            )}

            {/* Session History List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Session Logs
                </h2>
                <span className="text-xs text-slate-400 font-medium">
                  {sessions.length} on this page
                </span>
              </div>

              {sessions.length === 0 ? (
                <div className="bg-slate-900/40 border border-slate-800 border-dashed rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center text-2xl text-slate-400">
                    📝
                  </div>
                  <div className="max-w-sm">
                    <h3 className="text-base font-semibold text-white">
                      No sessions recorded yet
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">
                      Log your first game to start tracking win rates and tactical insights.
                    </p>
                  </div>
                  <Link
                    to="/add-session"
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition shadow-lg shadow-indigo-600/20"
                  >
                    Record Your First Session
                  </Link>
                </div>
              ) : (
                <div className="grid gap-3">
                  {sessions.map((session) => {
                    const validTags = (session.tags || []).filter(Boolean);

                    return (
                      <div
                        key={session.id}
                        className="bg-slate-900/70 border border-slate-800/80 p-5 rounded-xl flex items-start justify-between gap-4"
                      >
                        <div className="space-y-2.5 flex-1">
                          <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                            {session.log_text}
                          </p>

                          {validTags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {validTags.map((tag, idx) => {
                                const lower = tag.toLowerCase();
                                const isWin = lower === "win";
                                const isLoss = lower === "loss";
                                return (
                                  <span
                                    key={idx}
                                    className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-md border ${
                                      isWin
                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                        : isLoss
                                        ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                        : "bg-slate-800 text-slate-400 border-slate-700"
                                    }`}
                                  >
                                    {tag}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        <span className="text-xs text-slate-500 shrink-0 font-medium pt-0.5">
                          {session.created_at
                            ? new Date(session.created_at).toLocaleDateString()
                            : ""}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination Controls */}
              {sessions.length > 0 && (
                <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
                  <button
                    disabled={!hasPrev || loading}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    ← Previous
                  </button>
                  <span className="text-xs text-slate-400">
                    Page {page}
                  </span>
                  <button
                    disabled={!hasNext || loading}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};