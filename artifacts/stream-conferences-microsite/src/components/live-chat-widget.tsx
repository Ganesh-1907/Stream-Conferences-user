import { useState, useRef, useEffect, type FormEvent } from 'react';
import { MessageSquare, X, Send, Sparkles, User, CheckCheck, Minimize2, Paperclip, Smile } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
}

export function LiveChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [hasUnread, setHasUnread] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'bot',
      text: '👋 Hello! Welcome to Stream Conferences 2027. How can we assist your research or conference participation today?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const quickPrompts = [
    'How do I submit an abstract?',
    'What are the registration fees?',
    'Where is the conference venue?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      scrollToBottom();
    }
  }, [isOpen, messages]);

  const handleSend = (textToSend?: string) => {
    const messageText = textToSend || input;
    if (!messageText.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: messageText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');

    // Simulate an automated friendly response
    setTimeout(() => {
      let botResponse = 'Thank you for your message! Our conference team has received your query and will reply shortly.';
      const lower = messageText.toLowerCase();

      if (lower.includes('abstract') || lower.includes('submit')) {
        botResponse = 'You can submit your abstract via the "Call For Papers" portal or click "Submit Abstract" in the main navigation!';
      } else if (lower.includes('fee') || lower.includes('register') || lower.includes('price')) {
        botResponse = 'Registration pricing varies by tier (Academic, Delegate, Student). Visit our Registration page for full detail breakdown.';
      } else if (lower.includes('venue') || lower.includes('location') || lower.includes('where')) {
        botResponse = 'Stream Conferences 2027 will take place in Boston, Massachusetts. Venue address details are under the Venue tab!';
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: botResponse,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 800);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSend();
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end font-sans">
      {/* Floating Chat Box Window */}
      {isOpen && (
        <div className="mb-4 w-[350px] sm:w-[380px] max-w-[calc(100vw-2.5rem)] h-[520px] max-h-[calc(100vh-7rem)] bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] text-[hsl(var(--primary-foreground))] p-4 flex items-center justify-between border-b border-[hsl(var(--border)/.2)]">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center font-bold text-white border border-white/20">
                  <Sparkles size={20} className="text-[hsl(var(--accent))]" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[hsl(var(--primary))] rounded-full"></span>
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight text-white">Stream Live Support</h3>
                <p className="text-[11px] text-white/70 flex items-center gap-1 mt-0.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Online · Answers instantly
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
              aria-label="Close chat"
            >
              <Minimize2 size={16} />
            </button>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[hsl(var(--background)/.5)]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-end gap-2 max-w-[85%]">
                  {msg.sender === 'bot' && (
                    <div className="w-7 h-7 rounded-full bg-[hsl(var(--secondary)/.15)] text-[hsl(var(--secondary))] flex items-center justify-center text-xs font-bold shrink-0 mb-1">
                      SC
                    </div>
                  )}
                  <div
                    className={`p-3 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] rounded-br-xs'
                        : 'bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] shadow-xs rounded-bl-xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
                <span className="text-[10px] text-[hsl(var(--muted-foreground))] mt-1 px-1 flex items-center gap-1">
                  {msg.time}
                  {msg.sender === 'user' && <CheckCheck size={12} className="text-[hsl(var(--secondary))]" />}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Chips */}
          <div className="px-3 py-2 bg-[hsl(var(--card))] border-t border-[hsl(var(--border)/.5)] flex gap-1.5 overflow-x-auto no-scrollbar">
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                className="whitespace-nowrap px-2.5 py-1 bg-[hsl(var(--muted)/.5)] hover:bg-[hsl(var(--secondary)/.15)] hover:text-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-full text-[11px] text-[hsl(var(--muted-foreground))] transition shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <form onSubmit={handleSubmit} className="p-3 bg-[hsl(var(--card))] border-t border-[hsl(var(--border))] flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 px-3 py-2 bg-[hsl(var(--muted)/.3)] border border-[hsl(var(--border))] rounded-xl text-xs text-[hsl(var(--foreground))] focus:outline-none focus:border-[hsl(var(--secondary))] transition"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="w-9 h-9 rounded-xl bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--secondary)/.9)] text-[hsl(var(--secondary-foreground))] flex items-center justify-center transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              aria-label="Send message"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}

      {/* Floating Button Launcher Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-[hsl(var(--primary))] to-[hsl(var(--secondary))] text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center group"
        aria-label="Open Live Chat"
      >
        {isOpen ? (
          <X size={24} className="transition-transform duration-200 rotate-0 group-hover:rotate-90" />
        ) : (
          <MessageSquare size={24} className="transition-transform duration-200 group-hover:scale-110" />
        )}

        {/* Unread indicator dot */}
        {!isOpen && hasUnread && (
          <span className="absolute top-1 right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[hsl(var(--accent))] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[hsl(var(--accent))] border-2 border-[hsl(var(--card))]"></span>
          </span>
        )}
      </button>
    </div>
  );
}
