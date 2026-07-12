'use client';

import React, { useReducer } from 'react';
import { Bug, CheckCircle2 } from 'lucide-react';

export default function BugReportForm() {
  // Bug Report Form States
  const [bugState, setBugState] = useReducer(
    (state: any, action: any) => ({ ...state, ...action }),
    { email: "", details: "", isSubmitting: false, success: false, error: "" }
  );

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    const firstAt = val.indexOf('@');
    if (firstAt !== -1) {
      // Keep everything up to the first '@', and strip any subsequent '@' characters from the rest
      const beforeAt = val.slice(0, firstAt + 1);
      const afterAt = val.slice(firstAt + 1).replace(/@/g, '');
      val = beforeAt + afterAt;
    }
    setBugState({ email: val, error: "" });
  };

  const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === '@' && bugState.email.includes('@')) {
      e.preventDefault();
    }
  };

  const handleBugSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBugState({ error: "" });

    // 1. Validate email: must have at least one '@' and ONLY one '@'
    const atCount = (bugState.email.match(/@/g) || []).length;
    if (atCount !== 1) {
      setBugState({ error: "Please enter a valid email address containing exactly one '@' symbol." });
      return;
    }

    // 2. Validate message details
    if (!bugState.details.trim()) {
      setBugState({ error: "Please describe the issue before submitting." });
      return;
    }
    if (bugState.details.length > 200) {
      setBugState({ error: "Message cannot exceed 200 characters." });
      return;
    }

    setBugState({ isSubmitting: true });

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: process.env.NEXT_PUBLIC_WEB3FORMS_KEY || "YOUR_ACCESS_KEY",
          subject: "🚨 New Bug Report - ScanReact",
          from_name: "ScanReact Bug Tracker",
          email: bugState.email || "No email provided",
          message: bugState.details,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setBugState({ success: true, email: "", details: "" });
        setTimeout(() => setBugState({ success: false }), 3000);
      } else {
        console.error("Submission failed", result);
        alert("Failed to send report. Please try again.");
      }
    } catch (error) {
      console.error("Error sending bug report:", error);
      alert("An error occurred while sending the report.");
    } finally {
      setBugState({ isSubmitting: false });
    }
  };

  return (
    <section className="relative z-10 w-full max-w-5xl mx-auto px-6">
      <div className="max-w-lg mx-auto w-full pt-8 pb-8 text-left">
        <div className="p-6 sm:p-8 rounded-2xl bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-md">
          <div className="flex flex-col items-center text-center mb-6">
            <Bug className="w-8 h-8 text-green-400 mb-2" />
            <h3 className="font-semibold text-indigo-400 text-xl">Spotted a bug?</h3>
            <p className="text-sm text-zinc-400 mt-1">Let me know so I can patch it.</p>
          </div>

          {bugState.success ? (
            <div className="py-8 text-center text-indigo-400 animate-in fade-in">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-3" />
              <p>Submitted successfully! Thank you.</p>
            </div>
          ) : (
            <form onSubmit={handleBugSubmit} className="space-y-4">
              {bugState.error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-medium animate-in fade-in">
                  {bugState.error}
                </div>
              )}
              <input
                type="email"
                value={bugState.email}
                onChange={handleEmailChange}
                onKeyDown={handleEmailKeyDown}
                placeholder="Your Email "
                aria-label="Email address"
                required
                className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-green-400 font-medium placeholder:text-zinc-500 placeholder:font-normal focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <div>
                <textarea
                  value={bugState.details}
                  onChange={(e) => setBugState({ details: e.target.value.slice(0, 200), error: "" })}
                  placeholder="Describe the issue or error you encountered..."
                  aria-label="Bug details"
                  required
                  rows={3}
                  maxLength={200}
                  className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-500 resize-none focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <div className="flex justify-end mt-1">
                  <span className={`text-[11px] font-medium ${bugState.details.length >= 200 ? 'text-amber-400' : 'text-zinc-500'}`}>
                    {bugState.details.length} / 200 characters
                  </span>
                </div>
              </div>
              <div className="flex justify-center pt-1">
                <button
                  type="submit"
                  disabled={bugState.isSubmitting}
                  className="px-8 py-3 bg-zinc-100 hover:bg-green-500 hover:text-black text-zinc-900 rounded-xl font-medium text-sm transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                >
                  {bugState.isSubmitting ? "Submitting..." : "Submit Report"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
