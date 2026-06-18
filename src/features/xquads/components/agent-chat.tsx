'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2, Bot, User, Copy, Check, RefreshCw, Zap } from 'lucide-react';
import { toast } from 'sonner';
import type { XAgent } from '../data/agents';
import { xquadsService, type ChatMessage } from '../services/xquads.service';

const TIER_LABEL: Record<number, string> = { 0: 'Orchestrador', 1: 'Especialista', 2: 'Suporte' };
const TIER_COLOR: Record<number, string> = {
  0: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  1: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  2: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
};

function MessageBubble({ msg, isLast }: { msg: ChatMessage & { id: string }; isLast: boolean }) {
  const isUser = msg.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`group flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${isUser ? 'bg-primary text-primary-foreground' : 'bg-zinc-200 dark:bg-zinc-700'}`}>
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4 text-zinc-600 dark:text-zinc-300" />}
      </div>
      <div className={`relative max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-primary text-primary-foreground rounded-tr-sm'
            : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100 rounded-tl-sm'
        }`}>
          {msg.content}
        </div>
        <button
          onClick={handleCopy}
          className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        </button>
      </div>
    </div>
  );
}

interface Props {
  agent: XAgent;
  squadColor: string;
  onClose: () => void;
}

export function AgentChat({ agent, squadColor, onClose }: Props) {
  const [messages, setMessages] = useState<(ChatMessage & { id: string })[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [provider, setProvider] = useState('anthropic');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage & { id: string } = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history: ChatMessage[] = [...messages, userMsg].map(({ role, content }) => ({ role, content }));
      const response = await xquadsService.chat({
        agentId: agent.id,
        systemPrompt: agent.systemPrompt,
        messages: history,
        provider,
      });

      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'assistant', content: response.message },
      ]);
    } catch (err: any) {
      toast.error(err?.message ?? 'Erro ao chamar o agente. Verifique as integrações de LLM.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    inputRef.current?.focus();
  };

  const PROVIDERS = [
    { id: 'anthropic', label: 'Claude' },
    { id: 'openai', label: 'GPT' },
    { id: 'google', label: 'Gemini' },
    { id: 'xai', label: 'Grok' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative flex h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">
        {/* Header */}
        <div className={`bg-gradient-to-r ${squadColor} flex shrink-0 items-center gap-3 px-4 py-3`}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-white truncate">{agent.name}</h2>
            <div className="flex items-center gap-2">
              <p className="text-xs text-white/75 truncate">{agent.role}</p>
              <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${TIER_COLOR[agent.tier]}`}>
                {TIER_LABEL[agent.tier]}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={clearChat} title="Limpar conversa" className="rounded-lg p-1.5 text-white/70 hover:bg-white/20">
              <RefreshCw className="h-4 w-4" />
            </button>
            <button onClick={onClose} className="rounded-lg p-1.5 text-white/70 hover:bg-white/20">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Provider selector */}
        <div className="flex shrink-0 items-center gap-2 border-b border-zinc-100 px-4 py-2 dark:border-zinc-800">
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

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center text-center px-6">
              <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${squadColor}`}>
                <Bot className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">{agent.name}</h3>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{agent.role}</p>
              <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-500 max-w-xs">
                Olá! Sou <strong>{agent.name}</strong>. {agent.squad === 'Advisory Board' ? 'Faça uma pergunta estratégica para começar.' : 'Como posso ajudá-lo hoje?'}
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {getStarterPrompts(agent).map((p) => (
                  <button
                    key={p}
                    onClick={() => { setInput(p); inputRef.current?.focus(); }}
                    className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <MessageBubble key={msg.id} msg={msg} isLast={i === messages.length - 1} />
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700">
                <Bot className="h-4 w-4 text-zinc-600 dark:text-zinc-300" />
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
          <div className="flex items-end gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Fale com ${agent.name}...`}
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
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-colors"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
          <p className="mt-1.5 text-center text-[10px] text-zinc-400">Enter para enviar · Shift+Enter para nova linha</p>
        </div>
      </div>
    </div>
  );
}

function getStarterPrompts(agent: XAgent): string[] {
  const prompts: Record<string, string[]> = {
    'board-chair': ['Analise minha estratégia de negócio', 'Qual especialista devo consultar?', 'Diagnose meu maior problema'],
    'ray-dalio': ['Quais são os princípios para escalar?', 'Como pensar em risco sistêmico?', 'Explique a máquina econômica'],
    'charlie-munger': ['Me dê os modelos mentais essenciais', 'Como evitar erros de julgamento?', 'Inverta o problema para mim'],
    'naval-ravikant': ['Como criar alavancagem real?', 'O que é riqueza vs dinheiro?', 'Como encontrar o leverage certo?'],
    'hormozi-chief': ['Audite meu negócio', 'Qual é o meu maior bottleneck?', 'Como construo uma Grand Slam Offer?'],
    'cyber-chief': ['Avalie minha postura de segurança', 'Como estruturar um programa de segurança?', 'Quais são as ameaças prioritárias?'],
    'brand-chief': ['Diagnostique minha marca', 'Preciso de posicionamento ou identidade?', 'Qual especialista de marca preciso?'],
    'traffic-chief': ['Audite minha estratégia de tráfego', 'Diagnose meu CAC alto', 'Qual plataforma devo priorizar?'],
    'story-chief': ['Qual framework de narrativa preciso?', 'Como estruturo minha história de marca?', 'Diagnostique meu problema de storytelling'],
  };
  return prompts[agent.id] ?? [
    `Como você pode me ajudar?`,
    `Quais são seus frameworks principais?`,
    `Me dê um diagnóstico rápido do meu negócio`,
  ];
}
