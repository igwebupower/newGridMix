'use client';

import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Zap, X, Send, Loader2 } from 'lucide-react';

interface WattMessage {
  role: 'user' | 'assistant' | 'error';
  content: string;
  source?: string;
}

const SUGGESTED_QUESTIONS = [
  "What's powering the grid right now?",
  'Is now a good time to charge my EV?',
  'How does today\'s solar compare to yesterday?',
];

function splitSource(content: string): { body: string; source?: string } {
  const marker = content.lastIndexOf('Source:');
  if (marker === -1) return { body: content };
  return {
    body: content.slice(0, marker).trim(),
    source: content.slice(marker + 'Source:'.length).trim(),
  };
}

export function Watt() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<WattMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  async function ask(question: string) {
    if (!question.trim() || loading) return;

    setMessages((prev) => [...prev, { role: 'user', content: question }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/watt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          { role: 'error', content: data.message || "Watt couldn't answer that." },
        ]);
        return;
      }

      const { body, source } = splitSource(data.answer || '');
      setMessages((prev) => [...prev, { role: 'assistant', content: body, source }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'error', content: "Couldn't reach Watt — check your connection and try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating launcher */}
      <motion.button
        onClick={() => setIsOpen((v) => !v)}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
        aria-label={isOpen ? 'Close Watt' : 'Ask Watt'}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
        {!isOpen && <span className="hidden sm:inline">Ask Watt</span>}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="glass fixed bottom-20 right-5 z-50 w-[calc(100vw-2.5rem)] sm:w-96 h-[32rem] flex flex-col shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200/20 dark:border-gray-800/20">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-800 dark:text-gray-100">Watt</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Ask about the UK grid</p>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.length === 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Ask me anything about live or recent UK grid data — I&apos;ll always cite where the answer comes from.
                  </p>
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => ask(q)}
                      className="block w-full text-left text-sm px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 hover:bg-blue-500/10 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                    m.role === 'user'
                      ? 'ml-auto bg-blue-600 text-white'
                      : m.role === 'error'
                      ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                      : 'bg-gray-100 dark:bg-gray-800/60 text-gray-800 dark:text-gray-200'
                  }`}
                >
                  <p>{m.content}</p>
                  {m.source && (
                    <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-300/30 dark:border-gray-700/30 pt-1.5">
                      Source: {m.source}
                    </p>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 px-3 py-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Checking the grid…
                </div>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                ask(input);
              }}
              className="flex items-center gap-2 p-3 border-t border-gray-200/20 dark:border-gray-800/20"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about the grid…"
                maxLength={500}
                disabled={loading}
                className="flex-1 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800/60 text-sm text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="p-2 rounded-lg bg-blue-600 text-white disabled:opacity-40 hover:bg-blue-700 transition-colors"
                aria-label="Send"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
