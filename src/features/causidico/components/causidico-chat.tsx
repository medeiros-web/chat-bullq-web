'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Send, Loader2, Bot, User, Copy, Check, RefreshCw,
  Calendar, Video, Zap, MessageCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { causidicoService, type CausidicoConfig } from '../services/causidico.service';
import { schedulingService } from '@/features/scheduling/services/scheduling.service';
import type { ChatMessage } from '@/features/xquads/services/xquads.service';

const PROVIDERS = [
  { id: 'anthropic', label: 'Claude' },
  { id: 'openai', label: 'GPT' },
  { id: 'google', label: 'Gemini' },
];

function MessageBubble({ msg }: { msg: ChatMessage & { id: string } }) {
  const isUser = msg.role === 'user';
  const [copied, setCopied] = useState(false);

  return (
    <div className={`group flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white ${
        isUser ? 'bg-primary' : 'bg-gradient-to-br from-amber-500 to-orange-600'
      }`}>
        {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
      </div>
      <div className={`relative max-w-[80%] flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-primary text-primary-foreground rounded-tr-sm'
            : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100 rounded-tl-sm'
        }`}>
          {msg.content}
        </div>
        <button
          onClick={() => { navigator.clipboard.writeText(msg.content); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 hover:text-zinc-600 ml-1"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        </button>
      </div>
    </div>
  );
}

interface Props {
  config: CausidicoConfig;
}

export function CausidicoChat({ config }: Props) {
  const [messages, setMessages] = useState<(ChatMessage & { id: string })[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [provider, setProvider] = useState('anthropic');
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [scheduleTitle, setScheduleTitle] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (messages.length === 0) inputRef.current?.focus();
  }, []);

  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || isLoading) return;

    const userMsg: ChatMessage & { id: string } = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history: ChatMessage[] = [...messages, userMsg].map(({ role, content }) => ({ role, content }));
      const response = await causidicoService.chat({
        messages: history,
        provider,
        systemPrompt: config.systemPrompt,
      });

      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'assistant', content: response.message },
      ]);
    } catch (err: any) {
      toast.error(err?.message ?? 'Erro ao conectar com o Causídico. Verifique as integrações de LLM.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleSchedule = async () => {
    if (!scheduleTitle || !scheduleDate) {
      toast.error('Preencha o título e a data/hora.');
      return;
    }
    try {
      const start = new Date(scheduleDate);
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      const appointment = await schedulingService.createAppointment({
        title: scheduleTitle,
        startsAt: start.toISOString(),
        endsAt: end.toISOString(),
        createMeet: config.autoMeet,
      });

      let meetMsg = '';
      if (config.autoMeet) {
        try {
          const meet = await schedulingService.createMeet(appointment.id);
          meetMsg = `\n🔗 Google Meet: ${meet.meetLink}`;
        } catch {}
      }

      toast.success('Consulta agendada com sucesso!');
      setShowScheduleForm(false);
      setScheduleTitle('');
      setScheduleDate('');

      const confirmMsg = `✅ Consulta "${scheduleTitle}" agendada para ${start.toLocaleString('pt-BR')}!${meetMsg}\n\nPosso ajudar com mais alguma coisa?`;
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: confirmMsg }]);
    } catch {
      toast.error('Erro ao agendar. Verifique as configurações de agenda.');
    }
  };

  const STARTERS = [
    'Preciso de ajuda com um processo',
    'Quero agendar uma consulta',
    'Quais áreas vocês atendem?',
    'Tenho uma dúvida trabalhista',
  ];

  const isEmpty = messages.length === 0;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex shrink-0 items-center justify-between border-b border-zinc-100 px-4 py-2 dark:border-zinc-800">
        <div className="flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5 text-zinc-400" />
          <span className="text-xs text-zinc-500">Modelo:</span>
          <div className="flex gap-1">
            {PROVIDERS.map((p) => (
              <button
                key={p.id}
                onClick={() => setProvider(p.id)}
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                  provider === p.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowScheduleForm((v) => !v)}
            className="flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400"
          >
            <Calendar className="h-3.5 w-3.5" />
            Agendar
          </button>
          <button
            onClick={() => { setMessages([]); inputRef.current?.focus(); }}
            title="Nova conversa"
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Schedule quick-form */}
      {showScheduleForm && (
        <div className="shrink-0 border-b border-blue-100 bg-blue-50 px-4 py-3 dark:border-blue-900/30 dark:bg-blue-900/10">
          <p className="mb-2 text-xs font-semibold text-blue-700 dark:text-blue-400">Nova consulta</p>
          <div className="flex gap-2">
            <input
              value={scheduleTitle}
              onChange={(e) => setScheduleTitle(e.target.value)}
              placeholder="Assunto da consulta"
              className="flex-1 rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs text-zinc-800 focus:outline-none dark:border-blue-800 dark:bg-zinc-800 dark:text-zinc-100"
            />
            <input
              type="datetime-local"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              className="rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs text-zinc-800 focus:outline-none dark:border-blue-800 dark:bg-zinc-800 dark:text-zinc-100"
            />
            <button
              onClick={handleSchedule}
              className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
            >
              <Video className="h-3.5 w-3.5" />
              {config.autoMeet ? 'Criar + Meet' : 'Criar'}
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {isEmpty && (
          <div className="flex h-full flex-col items-center justify-center text-center px-6 py-10">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
              <Bot className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">{config.agentName}</h3>
            <p className="mt-1 text-sm text-zinc-500">Assistente Jurídico IA · WhatsApp</p>
            <p className="mt-3 text-xs text-zinc-400 max-w-xs">
              {config.welcomeMessage}
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}

        {isLoading && (
          <div className="flex gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600">
              <Bot className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-zinc-100 px-4 py-3 dark:bg-zinc-800">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-zinc-100 p-3 dark:border-zinc-800">
        <div className="flex items-end gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary dark:border-zinc-700 dark:bg-zinc-800">
          <MessageCircle className="mb-1 h-4 w-4 shrink-0 text-zinc-400" />
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Fale com ${config.agentName}…`}
            rows={1}
            className="flex-1 resize-none bg-transparent text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none dark:text-zinc-100 dark:placeholder-zinc-500"
            style={{ maxHeight: '120px' }}
            onInput={(e) => {
              const t = e.target as HTMLTextAreaElement;
              t.style.height = 'auto';
              t.style.height = `${Math.min(t.scrollHeight, 120)}px`;
            }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            className="mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
        <p className="mt-1.5 text-center text-[10px] text-zinc-400">
          Enter para enviar · Shift+Enter para nova linha
        </p>
      </div>
    </div>
  );
}
