import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiClient } from "../api/clients.js";

export const CreateLog = () => {
  const navigate = useNavigate();

  const [isWin, setIsWin] = useState(true);
  const [logText, setLogText] = useState("");
  const [customTag, setCustomTag] = useState("");
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAddTag = (e) => {
    e.preventDefault();
    const cleanTag = customTag.trim();
    if (cleanTag && !tags.includes(cleanTag)) {
      setTags([...tags, cleanTag]);
      setCustomTag("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!logText.trim()) {
      setError("Please write some notes or review for the session.");
      return;
    }

    setLoading(true);

    try {
      // Automatically add "Win" or "Loss" to the tags array so it displays on the dashboard
      const resultTag = isWin ? "Win" : "Loss";
      const finalTags = tags.includes(resultTag) ? tags : [resultTag, ...tags];

      // Exact payload expected by sessionController:
      await apiClient("/add-session", {
        method: "POST",
        body: {
          log: logText.trim(), // req.body.log
          win: isWin,          // req.body.win (boolean)
          tags: finalTags,     // req.body.tags (array of strings)
        },
      });

      // Redirect to dashboard on success
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Failed to save match session.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Log Session
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Record match outcome, tags, and game insights
            </p>
          </div>
          <Link
            to="/dashboard"
            className="text-xs text-slate-400 hover:text-white transition px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-950"
          >
            Cancel
          </Link>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            role="alert"
            className="p-3.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-sm flex items-center gap-2"
          >
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Outcome Toggle (Win vs Loss) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Match Result
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsWin(true)}
                className={`py-3 rounded-xl border text-sm font-semibold transition text-center ${
                  isWin
                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                🏆 Win
              </button>

              <button
                type="button"
                onClick={() => setIsWin(false)}
                className={`py-3 rounded-xl border text-sm font-semibold transition text-center ${
                  !isWin
                    ? "bg-rose-500/20 border-rose-500 text-rose-400"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                ❌ Loss / Other
              </button>
            </div>
          </div>

          {/* Log Notes (req.body.log) */}
          <div>
            <label
              htmlFor="log"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2"
            >
              Session Notes
            </label>
            <textarea
              id="log"
              rows={4}
              disabled={loading}
              value={logText}
              onChange={(e) => setLogText(e.target.value)}
              placeholder="e.g., Practiced Catalan setup. Opponent blundered a knight fork on e5."
              className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition disabled:opacity-50"
            />
          </div>

          {/* Tags (req.body.tags) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Tags
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                placeholder="e.g., Rapid, Endgame, Tactics"
                className="flex-1 rounded-lg bg-slate-950 border border-slate-800 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddTag(e);
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition"
              >
                + Add Tag
              </button>
            </div>

            {/* Rendered Tags */}
            <div className="flex flex-wrap gap-2">
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-md border ${
                isWin 
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-400"
              }`}>
                🏷️ {isWin ? "Win" : "Loss"}
              </span>

              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-800 text-slate-300 flex items-center gap-1.5"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-slate-400 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500 transition active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving session..." : "Save Session"}
          </button>
        </form>
      </div>
    </div>
  );
};