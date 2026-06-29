import React, { useState } from "react";
import { Sparkles, MapPin, CheckCircle2, ShieldCheck, Award, MessageSquare, ArrowRight, HelpCircle } from "lucide-react";

interface LandingPageProps {
  onCTA: (tab: string) => void;
  darkMode: boolean;
}

export default function LandingPage({ onCTA, darkMode }: LandingPageProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const stats = [
    { label: "Issues Resolved", value: "382", desc: "Permanent fixes deployed" },
    { label: "Community Verifications", value: "1,420", desc: "Citizen validations processed" },
    { label: "Average Routing Speed", value: "<12m", desc: "Instant AI diagnostics & dispatch" },
    { label: "Leaderboard Heroes", value: "185", desc: "Superstar local volunteers" }
  ];

  const features = [
    {
      icon: <Sparkles className="w-5 h-5 text-[#FF6B6B]" />,
      title: "Google Gemini Diagnostics",
      desc: "Our vision model automatically analyzes photos of potholes, water leaks, or garbage piles to assess size, severity, priority, and department routing."
    },
    {
      icon: <CheckCircle2 className="w-5 h-5 text-[#FF8A65]" />,
      title: "AI Draft Enhancement",
      desc: "Turn messy scribbles into formal, structured complaints that city municipal managers can understand and act on immediately."
    },
    {
      icon: <MapPin className="w-5 h-5 text-[#FF6B6B]" />,
      title: "Duplicate Issue Prevention",
      desc: "Smart geospatial matching reviews neighboring reports of identical categories to prevent municipal inbox spam, suggesting you upvote instead."
    },
    {
      icon: <Award className="w-5 h-5 text-[#FF8A65]" />,
      title: "Hyperlocal Citizen Rewards",
      desc: "Earn points, unlock achievement badges, and move up the community leaderboards by submitting unique reports and verifying cases."
    }
  ];

  const faqs = [
    {
      q: "How does the AI determine severity and routing?",
      a: "When you upload an image, Google Gemini AI analyzes visual elements (like depth of a pothole, leak spray volume, or size of trash piles) to estimate severity. It maps the visual analysis against pre-configured city charter manuals to recommend the exact department (like DPW or SFPUC) to handle the case."
    },
    {
      q: "Can I report an issue without a photo?",
      a: "Yes! While uploading a photo allows our Gemini AI to automatically calculate details, you can manually write descriptions, select categories, and drag your location pin on our custom vector map."
    },
    {
      q: "What do I get for earning points?",
      a: "As your points grow, you level up from Beginner to Volunteer, Community Hero, and Gold Hero. Your profile unlocks exclusive, high-visibility achievement badges (like First Responder or City Legend) celebrating your direct role in maintaining city infrastructure."
    },
    {
      q: "How do authorities see these complaints?",
      a: "Our centralized database groups reports by department. Authorized admins from municipal offices log into the Admin Hub to review verified complaints, dispatch crews, and mark tasks as 'Work Started' or 'Resolved', triggering instant notifications to reporting citizens."
    }
  ];

  return (
    <div className="w-full text-left transition-colors duration-300 bg-[#FFF8F5] dark:bg-[#1C1715]">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
        {/* Ambient Gradients */}
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-gradient-to-tr from-[#FFD6C9] to-transparent opacity-40 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-gradient-to-tr from-[#FF8A65]/30 to-transparent opacity-30 blur-3xl" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#2A2321] border border-[#F2D5CC] dark:border-[#3E302C] text-xs font-bold text-[#FF6B6B] shadow-sm mb-6 animate-bounce">
            <Sparkles className="w-4 h-4" /> Empowering Communities Through AI
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#3A3A3A] dark:text-white leading-tight">
            The Hyperlocal Solution for <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-[#FF6B6B] via-[#FF8A65] to-[#FFD6C9] bg-clip-text text-transparent">
              Better Neighborhoods
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-[#777777] dark:text-[#A89F9D] max-w-2xl mx-auto leading-relaxed">
            Report local concerns like potholes, broken streetlights, water leaks, or illegal dumping. 
            Google Gemini AI analyzes your reports, routes them to city departments, and helps neighbors verify and upvote solutions in real time.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => onCTA("report")}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#FF6B6B] to-[#FF8A65] text-white font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
            >
              Report Local Issue <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => onCTA("dashboard")}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white dark:bg-[#2A2321] text-[#FF6B6B] border border-[#F2D5CC] dark:border-[#3E302C] font-bold shadow-md hover:bg-neutral-50 dark:hover:bg-[#3E322F] transition-all cursor-pointer"
            >
              Explore Active Map
            </button>
          </div>
        </div>
      </section>

      {/* 2. STATS STATS COMPONENT */}
      <section className="py-12 bg-white/60 dark:bg-[#221C1A]/60 border-y border-[#F2D5CC] dark:border-[#3E302C] backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center p-4">
                <span className="block text-3xl sm:text-4xl font-extrabold text-[#FF6B6B] tracking-tight">
                  {stat.value}
                </span>
                <span className="block text-sm font-bold text-[#3A3A3A] dark:text-[#E3DCDA] mt-2">
                  {stat.label}
                </span>
                <span className="block text-[11px] text-[#777777] dark:text-[#A89F9D] mt-1 leading-snug">
                  {stat.desc}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. AI ADVANTAGE FEATURES */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-[#3A3A3A] dark:text-white">
              AI-Powered Civic Coordination
            </h2>
            <p className="mt-4 text-sm text-[#777777] dark:text-[#A89F9D]">
              We skip traditional bureaucratic delays. Gemini AI translates reports, maps duplicates, and speeds up public works resolution cycles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feat, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white dark:bg-[#251E1C] border border-[#F2D5CC] dark:border-[#3E302C] shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 rounded-xl bg-[#FFF0EB] dark:bg-[#3E2925] flex items-center justify-center mb-5 shadow-sm">
                  {feat.icon}
                </div>
                <h3 className="text-base font-bold text-[#3A3A3A] dark:text-white mb-2">
                  {feat.title}
                </h3>
                <p className="text-xs text-[#777777] dark:text-[#A89F9D] leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. WORKFLOW GRAPHIC */}
      <section className="py-20 bg-[#FFF3F0] dark:bg-[#251D1A] px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-[#3A3A3A] dark:text-white mb-12">
            The Resolution Lifespan
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative z-10">
            {[
              { num: "01", title: "Submit", desc: "Citizen uploads photo and details." },
              { num: "02", title: "AI Verify", desc: "Gemini analyzes priority & routes category." },
              { num: "03", title: "Upvote", desc: "Local community supports the report." },
              { num: "04", title: "Assign", desc: "Municipal offices dispatch road or sewer crews." },
              { num: "05", title: "Resolve", desc: "Crews seal the pothole & close the alert!" }
            ].map((step, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-white dark:bg-[#1E1816] border border-[#F2D5CC] dark:border-[#3E302C] shadow-sm text-left">
                <span className="block text-xs font-black text-[#FF6B6B] opacity-55 mb-2">{step.num}</span>
                <h4 className="text-sm font-extrabold text-[#3A3A3A] dark:text-white mb-1.5">{step.title}</h4>
                <p className="text-[11px] text-[#777777] dark:text-[#A89F9D] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. TESTIMONIALS */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-[#3A3A3A] dark:text-white">
              Loved by Citizens and City Staff
            </h2>
            <p className="mt-4 text-sm text-[#777777] dark:text-[#A89F9D]">
              Real-world success from neighborhood advocates keeping sidewalks secure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "The duplicate detection was brilliant. I was about to submit a water leak on Hayes St, but saw the map already highlighted it. I just upvoted it and got notified when repair started!",
                author: "Marcus Aurelius",
                role: "Hayes Valley Resident"
              },
              {
                quote: "Writing detailed letters to council is tedious. Community Hero's AI rewrite turned my short sentence about a broken lamp into a beautiful formal request. Two days later, a lighting crew fixed it.",
                author: "Daniel Miller",
                role: "Panhandle Volunteer"
              },
              {
                quote: "As a public works manager, sorting duplicate emails is our biggest bottleneck. Having issues auto-categorized and pre-verified by 15 local residents lets us route crews directly to high-priority sites.",
                author: "Sarah Jenkins",
                role: "DPW Operations Lead"
              }
            ].map((t, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-white dark:bg-[#251E1C] border border-[#F2D5CC] dark:border-[#3E302C] shadow-sm italic text-xs leading-relaxed text-[#777777] dark:text-[#A89F9D] relative">
                <span className="text-4xl text-[#FFD6C9] dark:text-[#3E2925] absolute top-4 left-4 font-serif">“</span>
                <p className="pt-6 relative z-10">"{t.quote}"</p>
                <div className="mt-5 border-t border-neutral-100 dark:border-neutral-800 pt-3 flex items-center justify-between not-italic">
                  <span className="font-extrabold text-[#3A3A3A] dark:text-white">{t.author}</span>
                  <span className="text-[10px] text-[#FF6B6B] font-semibold">{t.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FAQ ACCORDION */}
      <section className="py-20 bg-white/40 dark:bg-neutral-900/40 border-t border-[#F2D5CC] dark:border-[#3E302C] px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-extrabold text-[#3A3A3A] dark:text-white text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-[#F2D5CC] dark:border-[#3E302C] overflow-hidden transition-colors bg-white dark:bg-[#1E1816]"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full flex justify-between items-center px-6 py-4 text-left font-bold text-sm text-[#3A3A3A] dark:text-white hover:bg-neutral-50 dark:hover:bg-[#2A2321] transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <span className="text-[#FF6B6B] text-lg font-bold">{isOpen ? "−" : "+"}</span>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-xs text-[#777777] dark:text-[#A89F9D] leading-relaxed border-t border-[#F5DFD9] dark:border-[#3E302C] bg-[#FFFBF9] dark:bg-[#251E1C]">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. RECENT REPORTERS BANNER CTA */}
      <section className="py-16 bg-gradient-to-tr from-[#FF6B6B] via-[#FF8A65] to-[#FFD6C9] text-center px-4">
        <div className="max-w-2xl mx-auto">
          <h3 className="text-2xl sm:text-3xl font-black text-white">Ready to fix your street?</h3>
          <p className="text-sm text-white/90 mt-3 leading-relaxed">
            Report hazards, support community repairs, track work timelines, and earn reward points to become a Certified local Community Hero!
          </p>
          <button
            onClick={() => onCTA("report")}
            className="mt-8 px-8 py-4 rounded-2xl bg-white text-[#FF6B6B] font-extrabold shadow-lg hover:scale-[1.03] active:scale-[0.98] transition-transform cursor-pointer"
          >
            File Your First Report Now
          </button>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="py-12 bg-white dark:bg-[#151110] border-t border-[#F2D5CC] dark:border-[#3E302C] text-xs text-[#777777] dark:text-[#A89F9D] px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[#3A3A3A] dark:text-[#E3DCDA]">Community Hero</span>
            <span className="text-[#F2D5CC]">|</span>
            <span>Civic Solvers Co.</span>
          </div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-[#FF6B6B] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[#FF6B6B] transition-colors">City Charters</a>
            <a href="#" className="hover:text-[#FF6B6B] transition-colors">Authority Access</a>
          </div>
          <div>
            <span>© 2026 Community Hero Inc. Empowered by Google Gemini 2.5.</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
