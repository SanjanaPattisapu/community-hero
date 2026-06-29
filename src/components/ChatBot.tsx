import React, { useState, useRef, useEffect } from "react";
import { sendChatMessage } from "../services/api";
import { Bot, X, Send, Sparkles, Loader2, MessageSquare } from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  simulated?: boolean;
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init",
      role: "model",
      content: "Hello! I am **HeroBot**, your Community Hero municipal assistant. \n\nI am synced with our live neighborhood database. Ask me anything like:\n- *What is the status of the Hayes St leak?*\n- *How do I report a pothole?*\n- *Which department fixes streetlights?*"
    }
  ]);
  const [isPending, setIsPending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to latest bubble
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isPending) return;

    const userText = message;
    setMessage("");

    const newUserMessage: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: userText
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setIsPending(true);

    try {
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content
      }));

      const res = await sendChatMessage(userText, history);
      
      const newBotMessage: ChatMessage = {
        id: `b-${Date.now()}`,
        role: "model",
        content: res.responseText,
        simulated: res.simulated
      };

      setMessages((prev) => [...prev, newBotMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "model",
          content: "I ran into a temporary routing connection issue. Please check your system status or retry shortly!"
        }
      ]);
    } finally {
      setIsPending(false);
    }
  };

  // Simple renderer to render Markdown bubbles securely without crash
  const renderBubbleContent = (content: string) => {
    const lines = content.split("\n");
    return (
      <div className="space-y-1">
        {lines.map((line, idx) => {
          let clean = line.trim();
          if (!clean) return <div key={idx} className="h-1" />;
          
          if (clean.startsWith("-") || clean.startsWith("*")) {
            const val = clean.slice(1).trim();
            const p = val.split("**");
            return (
              <li key={idx} className="list-disc ml-3.5 pl-0.5 text-xs">
                {p.map((segment, sidx) => sidx % 2 === 1 ? <strong key={sidx} className="font-extrabold text-neutral-800 dark:text-white">{segment}</strong> : segment)}
              </li>
            );
          }

          const parts = clean.split("**");
          return (
            <p key={idx} className="text-xs">
              {parts.map((p, pidx) => pidx % 2 === 1 ? <strong key={pidx} className="font-extrabold text-neutral-800 dark:text-white">{p}</strong> : p)}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 text-left">
      
      {/* 1. FLOATING TOGGLE TRIGGER BUTTON */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-[#FF6B6B] to-[#FF8A65] hover:from-[#FF8A65] hover:to-[#FF6B6B] text-white flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer relative group"
          title="Open HeroBot AI Assistant"
        >
          <Bot className="w-6 h-6 animate-bounce" style={{ animationDuration: "2s" }} />
          {/* Custom Notification indicator */}
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] text-white font-black animate-pulse">
            AI
          </span>
        </button>
      )}

      {/* 2. CHAT OVERLAY BOX PANEL */}
      {isOpen && (
        <div className="w-80 sm:w-96 h-[480px] rounded-3xl bg-white dark:bg-[#1E1917] border border-[#F2D5CC] dark:border-[#3E302C] shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-250">
          
          {/* Chat Header */}
          <div className="p-4 bg-gradient-to-r from-[#FF6B6B] to-[#FF8A65] text-white flex justify-between items-center shadow-md shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-white/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-xs block leading-none">HeroBot Assistant</span>
                <span className="text-[9px] text-white/90 font-medium tracking-wide flex items-center gap-1 mt-1">
                  <Sparkles className="w-3 h-3 text-[#FFD6C9] animate-spin" style={{ animationDuration: "3s" }} /> Gemini 2.5 Active Context
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-white/10 text-white cursor-pointer"
              title="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Feed View */}
          <div
            ref={scrollRef}
            className="flex-1 p-4 overflow-y-auto bg-[#FFFBF9] dark:bg-[#1C1715] space-y-3.5 scroll-smooth"
          >
            {messages.map((msg) => {
              const isBot = msg.role === "model";
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 max-w-[85%] ${isBot ? "mr-auto text-left" : "ml-auto flex-row-reverse text-right"}`}
                >
                  {isBot && (
                    <div className="w-6 h-6 rounded-lg bg-[#FFD6C9] text-[#FF6B6B] flex items-center justify-center shrink-0">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}
                  
                  <div className="space-y-1">
                    <div className={`p-3 rounded-2xl leading-relaxed text-xs shadow-sm ${
                      isBot
                        ? "bg-white dark:bg-[#2A2321] text-[#3A3A3A] dark:text-[#E3DCDA] border border-[#F2D5CC] dark:border-[#3E302C] rounded-tl-none"
                        : "bg-gradient-to-r from-[#FF6B6B] to-[#FF8A65] text-white rounded-tr-none"
                    }`}>
                      {renderBubbleContent(msg.content)}
                    </div>
                    {msg.simulated && (
                      <span className="block text-[8px] text-[#777777] italic px-1">Offline Demo Mode</span>
                    )}
                  </div>
                </div>
              );
            })}

            {isPending && (
              <div className="flex gap-2.5 mr-auto max-w-[85%]">
                <div className="w-6 h-6 rounded-lg bg-[#FFD6C9] text-[#FF6B6B] flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="p-3 rounded-2xl bg-white dark:bg-[#2A2321] border border-[#F2D5CC] dark:border-[#3E302C] rounded-tl-none flex items-center gap-1.5 shadow-sm text-xs text-[#FF6B6B] font-bold">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FF6B6B]" /> HeroBot is synthesizing...
                </div>
              </div>
            )}
          </div>

          {/* Form Input Submit Bar */}
          <form
            onSubmit={handleSubmit}
            className="p-3 bg-white dark:bg-[#1E1917] border-t border-[#F2D5CC] dark:border-[#3E302C] flex gap-2 shrink-0"
          >
            <input
              type="text"
              placeholder="Ask HeroBot about water leaks, points..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl text-xs bg-[#FFF8F5] dark:bg-[#2C211E] border border-[#F2D5CC] dark:border-[#3E302C] text-[#3A3A3A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#FF6B6B]"
            />
            <button
              type="submit"
              disabled={isPending || !message.trim()}
              className="p-2.5 rounded-xl bg-gradient-to-r from-[#FF6B6B] to-[#FF8A65] text-white flex items-center justify-center shadow-md cursor-pointer disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}

    </div>
  );
}
