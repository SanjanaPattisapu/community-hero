import React, { useState, useEffect } from "react";
import { AIInsights } from "../types";
import { fetchAIInsights } from "../services/api";
import { Sparkles, BarChart3, AlertTriangle, Lightbulb, Loader2, Calendar, FileText, ChevronRight } from "lucide-react";

// Simple custom markdown renderer to safely render Gemini weekly report strings
function SimpleMarkdown({ text }: { text: string }) {
  if (!text) return null;
  const lines = text.split("\n");
  return (
    <div className="space-y-3.5 text-xs text-[#3A3A3A] dark:text-[#E3DCDA] leading-relaxed">
      {lines.map((line, idx) => {
        let clean = line.trim();
        if (!clean) return <div key={idx} className="h-2" />;

        // Headers
        if (clean.startsWith("###")) {
          return <h4 key={idx} className="text-sm font-extrabold text-[#FF6B6B] mt-4 mb-2">{clean.replace("###", "").trim()}</h4>;
        }
        if (clean.startsWith("##")) {
          return <h3 key={idx} className="text-base font-black text-[#3A3A3A] dark:text-white mt-5 mb-2">{clean.replace("##", "").trim()}</h3>;
        }
        if (clean.startsWith("#")) {
          return <h2 key={idx} className="text-lg font-black text-[#3A3A3A] dark:text-white mt-6 mb-3">{clean.replace("#", "").trim()}</h2>;
        }

        // Bullets
        if (clean.startsWith("-") || clean.startsWith("*")) {
          const content = clean.slice(1).trim();
          // Bold matches
          const parts = content.split("**");
          return (
            <li key={idx} className="list-disc pl-1 ml-4 text-left leading-relaxed">
              {parts.map((p, pidx) => pidx % 2 === 1 ? <strong key={pidx} className="font-extrabold text-[#3A3A3A] dark:text-white">{p}</strong> : p)}
            </li>
          );
        }

        // Standard Bold text matches in paragraphs
        const parts = clean.split("**");
        return (
          <p key={idx} className="text-left">
            {parts.map((p, pidx) => pidx % 2 === 1 ? <strong key={pidx} className="font-extrabold text-[#3A3A3A] dark:text-white">{p}</strong> : p)}
          </p>
        );
      })}
    </div>
  );
}

export default function AiInsights() {
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetchAIInsights()
      .then((data) => {
        setInsights(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load AI Insights", err);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-4 bg-[#FFF8F5] dark:bg-[#1C1715]">
        <Loader2 className="w-10 h-10 text-[#FF6B6B] animate-spin mx-auto" />
        <p className="text-sm font-bold text-[#FF6B6B] animate-pulse">Consulting Gemini Predictive Analytics Core...</p>
        <p className="text-xs text-[#777777]">Synthesizing municipal datasets, safety risk patterns, and area trends...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300 text-left bg-[#FFF8F5] dark:bg-[#1C1715]">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[#3A3A3A] dark:text-white flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-[#FF6B6B] animate-spin" style={{ animationDuration: "5s" }} /> AI Planning & Forecasting
        </h1>
        <p className="text-sm text-[#777777] dark:text-[#A89F9D] mt-2">
          Google Gemini AI synthesizes active community complaints and geolocation matrices to forecast structural failures, schedule municipal planning, and draft executive briefings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side (Structured Insights cards) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Most affected locations */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#221C1A] border border-[#F2D5CC] dark:border-[#3E302C] shadow-sm text-left">
            <h3 className="text-xs font-bold text-[#777777] dark:text-[#A89F9D] uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-[#FF6B6B]" /> Area-wise Density hotspots
            </h3>
            <div className="space-y-3.5">
              {insights?.mostAffectedLocations.map((loc, idx) => (
                <div key={idx} className="flex justify-between items-center pb-2 border-b border-neutral-50 dark:border-neutral-800 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#FFF0EB] dark:bg-[#3E2925] text-[#FF6B6B] font-bold text-[10px] flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-[#3A3A3A] dark:text-white">{loc.area}</span>
                  </div>
                  <span className="text-xs font-bold text-[#FF6B6B] bg-[#FFF0EB] dark:bg-[#3E2925] px-2.5 py-1 rounded-full border border-[#FFD6C9]">
                    {loc.count} active reports
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Future Predictions */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#221C1A] border border-[#F2D5CC] dark:border-[#3E302C] shadow-sm text-left">
            <h3 className="text-xs font-bold text-[#777777] dark:text-[#A89F9D] uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-[#F6B756]" /> Structural Failure Predictions
            </h3>
            <div className="space-y-4">
              {insights?.predictedFutureProblems.map((pred, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-orange-50/40 dark:bg-[#2C231E] border border-orange-100 dark:border-[#3E2D25] text-xs leading-relaxed text-[#3A3A3A] dark:text-[#E3DCDA] flex gap-2">
                  <span className="font-extrabold text-[#F6B756] shrink-0">❖</span>
                  <p>{pred}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Actionable Suggestions for City Council */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#221C1A] border border-[#F2D5CC] dark:border-[#3E302C] shadow-sm text-left">
            <h3 className="text-xs font-bold text-[#777777] dark:text-[#A89F9D] uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-green-500" /> Municipal Operations Blueprint
            </h3>
            <div className="space-y-4">
              {insights?.suggestions.map((sug, idx) => (
                <div key={idx} className="flex gap-2.5 text-xs text-[#3A3A3A] dark:text-[#E3DCDA] leading-relaxed">
                  <ChevronRight className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  <p>{sug}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Side (Generative Executive Briefing Report) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#221C1A] p-6 rounded-3xl border border-[#F2D5CC] dark:border-[#3E302C] shadow-sm text-left space-y-6">
          <div className="flex justify-between items-center border-b border-neutral-50 dark:border-neutral-800 pb-3.5">
            <span className="text-xs font-bold text-[#777777] dark:text-[#A89F9D] uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#FF6B6B]" /> Generative Executive Brief
            </span>
            <span className="text-[10px] text-[#777777] font-mono flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Generated: {new Date().toLocaleDateString()}
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-[#FFFBF9] dark:bg-[#1E1917] border border-[#F5DFD9] dark:border-[#3E302C]">
            {insights?.weeklyAIReport ? (
              <SimpleMarkdown text={insights.weeklyAIReport} />
            ) : (
              <p className="text-xs italic text-[#777777]">Briefing draft unavailable.</p>
            )}
          </div>

          <div className="text-[10px] text-[#777777] dark:text-[#A89F9D] italic text-center">
            *This executive summary is compiled automatically using real-time community indicators.
          </div>
        </div>

      </div>

    </div>
  );
}
