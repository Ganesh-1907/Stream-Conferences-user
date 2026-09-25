import { useState, useRef, useEffect, type FormEvent } from 'react';
import { MessageSquare, X, Send, Sparkles, CheckCheck, Minimize2, User, Mail, Phone, Globe, Edit2 } from 'lucide-react';
import { io, type Socket } from 'socket.io-client';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { COUNTRIES } from '@/lib/countries';

const SERVER_ORIGIN = import.meta.env.VITE_SERVER_ORIGIN || 'http://localhost:7867';
const VISITOR_KEY = 'stream-chat-visitor-id';
const VISITOR_DETAILS_KEY = 'stream-chat-visitor-details';

interface VisitorDetails {
  name: string;
  email: string;
  phone: string;
  country: string;
}

interface ChatMessage {
  _id?: string;
  sessionId?: string;
  sender: 'visitor' | 'admin';
  senderName?: string;
  text: string;
  createdAt?: string;
}

function getVisitorId(conferenceId?: string | null): string {
  const key = conferenceId ? `stream-chat-visitor-${conferenceId}` : 'stream-chat-visitor-main';
  let id = localStorage.getItem(key);
  if (!id) {
    id = `v_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(key, id);
  }
  return id;
}

function getSavedVisitorDetails(): VisitorDetails | null {
  try {
    const raw = localStorage.getItem(VISITOR_DETAILS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.name && parsed.email && parsed.phone && parsed.country) {
      return parsed;
    }
  } catch (e) {
    console.error('Error reading visitor details from localStorage:', e);
  }
  return null;
}

interface LiveChatWidgetProps {
  event?: any;
}

export function LiveChatWidget({ event }: LiveChatWidgetProps = {}) {
  const conferenceId = event?._id || null;
  const eventId = event?.eventId || null;
  const conferenceTitle = event?.title || '';
  const scope = conferenceId ? 'conference' : 'main';

  const [isOpen, setIsOpen] = useState(false);
  const [visitorDetails, setVisitorDetails] = useState<VisitorDetails | null>(() => getSavedVisitorDetails());
  const [step, setStep] = useState<'form' | 'chat'>(() => (getSavedVisitorDetails() ? 'chat' : 'form'));

  // Form input state
  const [formState, setFormState] = useState<VisitorDetails>({
    name: visitorDetails?.name || '',
    email: visitorDetails?.email || '',
    phone: visitorDetails?.phone || '',
    country: visitorDetails?.country || '',
  });

  const [input, setInput] = useState('');
  const [hasUnread, setHasUnread] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const visitorIdRef = useRef(getVisitorId(conferenceId));

  const quickPrompts = [
    'How do I submit an abstract?',
    'What are the registration fees?',
    'Where is the conference venue?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Initialize session and socket
  useEffect(() => {
    let active = true;
    const currentVisitorId = getVisitorId(conferenceId);
    visitorIdRef.current = currentVisitorId;
    const saved = getSavedVisitorDetails();

    const ensureSession = async () => {
      try {
        const queryParams = conferenceId ? `?conferenceId=${encodeURIComponent(conferenceId)}&eventId=${encodeURIComponent(eventId || '')}` : '';
        const historyRes = await fetch(`${SERVER_ORIGIN}/api/chat/visitor/${encodeURIComponent(currentVisitorId)}/history${queryParams}`);
        if (historyRes.ok) {
          const history = await historyRes.json();
          if (!active) return;
          if (history.session) {
            setSessionId(history.session._id);
            setMessages(history.messages || []);
            return history.session;
          }
        }

        const res = await fetch(`${SERVER_ORIGIN}/api/chat/session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            visitorId: currentVisitorId,
            conferenceId,
            eventId,
            conferenceTitle,
            scope,
            visitorName: saved?.name || 'Visitor',
            visitorEmail: saved?.email || '',
            visitorPhone: saved?.phone || '',
            visitorCountry: saved?.country || '',
          }),
        });
        if (!res.ok) throw new Error('Failed to init chat session');
        const session = await res.json();
        if (!active) return;
        setSessionId(session._id);
        return session;
      } catch (err) {
        console.error('Chat session init error:', err);
        if (active) setConnected(false);
      }
    };

    ensureSession();

    const socket = io(SERVER_ORIGIN, {
      query: { role: 'visitor' },
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('visitor:join', {
        visitorId: currentVisitorId,
        conferenceId,
        eventId,
        conferenceTitle,
        visitorName: saved?.name || 'Visitor',
        visitorEmail: saved?.email || '',
        visitorPhone: saved?.phone || '',
        visitorCountry: saved?.country || '',
      });
    });
    socket.on('disconnect', () => setConnected(false));
    socket.on('chat:message', (msg: ChatMessage) => {
      setMessages((prev) => {
        if (msg._id && prev.some((m) => m._id === msg._id)) return prev;
        if (msg.sender === 'visitor') {
          const tempIdx = prev.findIndex((m) => m._id?.startsWith('temp_') && m.text === msg.text);
          if (tempIdx !== -1) {
            const next = [...prev];
            next[tempIdx] = msg;
            return next;
          }
        }
        return [...prev, msg];
      });
      if (!isOpen) setHasUnread(true);
    });
    socket.on('chat:typing', (payload: { typing: boolean }) => {
      setTyping(payload.typing);
    });

    return () => {
      active = false;
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isOpen, conferenceId, eventId]);

  useEffect(() => {
    let active = true;
    if (!isOpen || step !== 'chat') return;

    const syncHistory = async () => {
      const visitorId = getVisitorId(conferenceId);
      try {
        const queryParams = conferenceId ? `?conferenceId=${encodeURIComponent(conferenceId)}&eventId=${encodeURIComponent(eventId || '')}` : '';
        const res = await fetch(`${SERVER_ORIGIN}/api/chat/visitor/${encodeURIComponent(visitorId)}/history${queryParams}`);
        if (res.ok) {
          const data = await res.json();
          if (active && data.messages) {
            setMessages((prev) => {
              const prevIds = new Set(prev.map((m) => m._id).filter(Boolean));
              const newMsgs = data.messages.filter((m: any) => m._id && !prevIds.has(m._id));
              if (newMsgs.length === 0) return prev;
              return [...prev, ...newMsgs];
            });
          }
        }
      } catch {}
    };

    syncHistory();
    const interval = setInterval(syncHistory, 3000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [isOpen, step, conferenceId, eventId]);

  useEffect(() => {
    if (isOpen && step === 'chat') {
      setHasUnread(false);
      scrollToBottom();
    }
  }, [isOpen, messages, step]);

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formState.name.trim() || !formState.email.trim() || !formState.phone.trim() || !formState.country.trim()) {
      return;
    }

    const details: VisitorDetails = {
      name: formState.name.trim(),
      email: formState.email.trim(),
      phone: formState.phone.trim(),
      country: formState.country.trim(),
    };

    localStorage.setItem(VISITOR_DETAILS_KEY, JSON.stringify(details));
    setVisitorDetails(details);

    const visitorId = visitorIdRef.current || getVisitorId(conferenceId);

    // Send session update REST
    try {
      const res = await fetch(`${SERVER_ORIGIN}/api/chat/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorId,
          conferenceId,
          eventId,
          conferenceTitle,
          scope,
          visitorName: details.name,
          visitorEmail: details.email,
          visitorPhone: details.phone,
          visitorCountry: details.country,
        }),
      });
      if (res.ok) {
        const session = await res.json();
        setSessionId(session._id);
      }
    } catch (err) {
      console.error('Error saving chat session details:', err);
    }

    // Emit details over socket
    if (socketRef.current) {
      socketRef.current.emit('visitor:updateDetails', {
        visitorId,
        conferenceId,
        eventId,
        conferenceTitle,
        visitorName: details.name,
        visitorEmail: details.email,
        visitorPhone: details.phone,
        visitorCountry: details.country,
      });
    }

    setStep('chat');
  };

  const sendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text) return;

    const saved = visitorDetails || formState;
    const optimisticId = `temp_${Date.now()}`;
    const optimisticMsg: ChatMessage = {
      _id: optimisticId,
      sender: 'visitor',
      senderName: saved.name || 'Visitor',
      text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setInput('');

    const payload = {
      visitorId: visitorIdRef.current || getVisitorId(conferenceId),
      conferenceId,
      eventId,
      conferenceTitle,
      scope,
      text,
      visitorName: saved.name || 'Visitor',
      visitorEmail: saved.email || '',
      visitorPhone: saved.phone || '',
      visitorCountry: saved.country || '',
    };

    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('visitor:message', payload);
    } else {
      try {
        const res = await fetch(`${SERVER_ORIGIN}/api/chat/visitor/message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.message?._id) {
            setMessages((prev) =>
              prev.map((m) => (m._id === optimisticId ? data.message : m))
            );
          }
        }
      } catch (err) {
        console.error('Send visitor message error:', err);
      }
    }
  };

  const handleMessageSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  return (
    <div className="fixed bottom-3 right-3 sm:bottom-5 sm:right-5 z-50 flex flex-col items-end font-sans">
      {/* Floating Chat Box Window */}
      {isOpen && (
        <div className="mb-3 sm:mb-4 w-[340px] sm:w-[380px] max-w-[calc(100vw-1.5rem)] h-[520px] max-h-[calc(100vh-6rem)] bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] text-[hsl(var(--primary-foreground))] p-4 flex items-center justify-between border-b border-[hsl(var(--border)/.2)]">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center font-bold text-white border border-white/20">
                  <Sparkles size={20} className="text-[hsl(var(--accent))]" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[hsl(var(--primary))] rounded-full"></span>
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-sm leading-tight text-white truncate">
                  {event ? (event.title || 'Conference Support') : 'Stream Live Support'}
                </h3>
                <p className="text-[11px] text-white/80 flex items-center gap-1 mt-0.5 truncate">
                  <span className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                  {event?.eventId ? `${event.eventId} · Support` : (connected ? 'Online · Team replies when active' : 'Connecting…')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {step === 'chat' && visitorDetails && (
                <button
                  onClick={() => setStep('form')}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
                  title="Update your details"
                >
                  <Edit2 size={14} />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
                aria-label="Close chat"
              >
                <Minimize2 size={16} />
              </button>
            </div>
          </div>

          {/* Form Step */}
          {step === 'form' ? (
            <div className="flex-1 p-5 overflow-y-auto bg-[hsl(var(--background)/.5)] flex flex-col justify-center">
              <div className="mb-4 text-center">
                <div className="w-12 h-12 rounded-full bg-[hsl(var(--secondary)/.15)] text-[hsl(var(--secondary))] flex items-center justify-center mx-auto mb-2">
                  <User size={24} />
                </div>
                <h4 className="font-bold text-sm text-[hsl(var(--foreground))]">Welcome to Live Support</h4>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                  Please enter your contact details before starting the chat conversation.
                </p>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
                    <input
                      type="text"
                      required
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                      placeholder="e.g. Dr. John Doe"
                      className="w-full pl-9 pr-3 py-2 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl text-xs text-[hsl(var(--foreground))] focus:outline-none focus:border-[hsl(var(--secondary))] transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
                    <input
                      type="email"
                      required
                      value={formState.email}
                      onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                      placeholder="john@example.com"
                      className="w-full pl-9 pr-3 py-2 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl text-xs text-[hsl(var(--foreground))] focus:outline-none focus:border-[hsl(var(--secondary))] transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-1">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
                    <input
                      type="tel"
                      required
                      value={formState.phone}
                      onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                      className="w-full pl-9 pr-3 py-2 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl text-xs text-[hsl(var(--foreground))] focus:outline-none focus:border-[hsl(var(--secondary))] transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-1">
                    Country *
                  </label>
                  <div className="relative">
                    <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] z-10" />
                    <Select value={formState.country} onValueChange={(v) => setFormState({ ...formState, country: v })}>
                      <SelectTrigger className="w-full pl-9 pr-3 py-2 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl text-xs text-[hsl(var(--foreground))] focus:outline-none focus:border-[hsl(var(--secondary))] transition h-10 cursor-pointer">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-xl text-[hsl(var(--foreground))] z-50 p-1 max-h-64 overflow-auto">
                        {COUNTRIES.map((c) => (
                          <SelectItem key={c.code} value={c.name} className="rounded-lg cursor-pointer py-2 px-3 text-xs focus:bg-[hsl(var(--secondary)/.1)] focus:text-[hsl(var(--secondary))]">
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-2.5 px-4 bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--secondary)/.9)] text-[hsl(var(--secondary-foreground))] font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
                >
                  Start Chat
                </button>
              </form>
            </div>
          ) : (
            /* Chat Messages Body */
            <>
              {visitorDetails && (
                <div className="px-3 py-1.5 bg-[hsl(var(--muted)/.4)] border-b border-[hsl(var(--border)/.4)] flex items-center justify-between text-[11px] text-[hsl(var(--muted-foreground))] shrink-0">
                  <span className="truncate">
                    Chatting as <strong className="text-[hsl(var(--foreground))] font-semibold">{visitorDetails.name}</strong> ({visitorDetails.country})
                  </span>
                </div>
              )}

              <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[hsl(var(--background)/.5)]">
                {messages.length === 0 && (
                  <div className="text-center text-xs text-[hsl(var(--muted-foreground))] pt-8">
                    <p className="text-2xl mb-2">👋</p>
                    Hello {visitorDetails?.name ? visitorDetails.name.split(' ')[0] : ''}! How can we assist your research or conference participation today?
                  </div>
                )}
                {messages.map((msg, idx) => {
                  const isVisitor = msg.sender === 'visitor';
                  return (
                    <div key={msg._id || idx} className={`flex flex-col ${isVisitor ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-end gap-2 max-w-[85%]">
                        {!isVisitor && (
                          <div className="w-7 h-7 rounded-full bg-[hsl(var(--secondary)/.15)] text-[hsl(var(--secondary))] flex items-center justify-center text-xs font-bold shrink-0 mb-1">
                            SC
                          </div>
                        )}
                        <div
                          className={`p-3 rounded-2xl text-xs leading-relaxed ${
                            isVisitor
                              ? 'bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] rounded-br-xs'
                              : 'bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] shadow-xs rounded-bl-xs'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                      <span className="text-[10px] text-[hsl(var(--muted-foreground))] mt-1 px-1 flex items-center gap-1">
                        {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        {isVisitor && <CheckCheck size={12} className="text-[hsl(var(--secondary))]" />}
                      </span>
                    </div>
                  );
                })}
                {typing && (
                  <div className="flex items-start gap-2">
                    <div className="w-7 h-7 rounded-full bg-[hsl(var(--secondary)/.15)] text-[hsl(var(--secondary))] flex items-center justify-center text-xs font-bold shrink-0">SC</div>
                    <div className="px-3 py-2.5 rounded-2xl rounded-bl-xs bg-[hsl(var(--card))] border border-[hsl(var(--border))] flex gap-1">
                      <span className="w-1.5 h-1.5 bg-[hsl(var(--muted-foreground))] rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-[hsl(var(--muted-foreground))] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                      <span className="w-1.5 h-1.5 bg-[hsl(var(--muted-foreground))] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompts Chips */}
              <div className="px-3 py-2 bg-[hsl(var(--card))] border-t border-[hsl(var(--border)/.5)] flex gap-1.5 overflow-x-auto no-scrollbar">
                {quickPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(prompt)}
                    className="whitespace-nowrap px-2.5 py-1 bg-[hsl(var(--muted)/.5)] hover:bg-[hsl(var(--secondary)/.15)] hover:text-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-full text-[11px] text-[hsl(var(--muted-foreground))] transition shrink-0"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Input Footer */}
              <form onSubmit={handleMessageSubmit} className="p-3 bg-[hsl(var(--card))] border-t border-[hsl(var(--border))] flex items-center gap-2">
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
                  className="w-9 h-9 rounded-xl bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--secondary)/.9)] text-[hsl(var(--secondary-foreground))] flex items-center justify-center transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0 cursor-pointer shadow-xs"
                  aria-label="Send message"
                >
                  <Send size={15} />
                </button>
              </form>
            </>
          )}
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
