'use client';

import { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Bot,
  Check,
  ChevronDown,
  Copy,
  Loader2,
  MessageSquare,
  Send,
  Sparkles,
  User,
} from 'lucide-react';
import { aiCatalogService, type AiSkill } from '../../services/ai-catalog.service';
import { api } from '@/lib/api';
import { useOrgId } from '@/hooks/use-org-query-key';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  copiedId?: string;
}

async function runSkill(skillId: string, message: string): Promise<string> {
  const { data } = await api.post(`/ai-catalog/skills/${skillId}/run`, { message });
  // Handles both { data: { output } } and { output } shapes
  const payload = data?.data ?? data;
  return (
    payload?.output ??
    payload?.result ??
    payload?.content ??
    payload?.text ??
    (typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2))
  );
}

export function JarvisSkillsChatTab() {
  const orgId = useOrgId();
  const [selectedSkill, setSelectedSkill] = useState<AiSkill | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: skills, isLoading: loadingSkills } = useQuery({
    queryKey: ['ai-skills', orgId],
    queryFn: () => aiCatalogService.listSkills(),
  });

  const activeSkillId = selectedSkill?.id ?? '';
  const chat = messages[activeSkillId] ?? [];

  const scrollBottom = () =>
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 60);

  const handleSend = async () => {
    if (!input.trim() || !selectedSkill || loading) return;
    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: input.trim() };
    const next = [...chat, userMsg];
    setMessages((prev) => ({ ...prev, [activeSkillId]: next }));
    setInput('');
    setLoading(true);
    scrollBottom();

    try {
      const reply = await runSkill(selectedSkill.id, userMsg.content);
      const assistantMsg: Message = { id: crypto.randomUUID(), role: 'assistant', content: reply };
      setMessages((prev) => ({
        ...prev,
        [activeSkillId]: [...(prev[activeSkillId] ?? []), assistantMsg],
      }));
    } catch (err: any) {
      const errText =
        err?.response?.data?.message ?? err?.message ?? 'Erro ao executar a skill.';
      const errMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `⚠️ ${errText}`,
      };
      setMessages((prev) => ({
        ...prev,
        [activeSkillId]: [...(prev[activeSkillId] ?? []), errMsg],
      }));
    } finally {
      setLoading(false);
      scrollBottom();
    }
  };

  const copy = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex h-full">
      {/* ── Sidebar: skill picker ─────────────────────────────── */}
      <aside className="flex w-64 shrink-0 flex-col border-r border-zinc-200 dark:border-zinc-800">
        <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            <Sparkles className="h-4 w-4 text-primary" />
            Skills disponíveis
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {loadingSkills && (
            <div className="space-y-2 p-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
              ))}
            </div>
          )}

          {!loadingSkills && (skills ?? []).length === 0 && (
            <p className="p-4 text-center text-xs text-zinc-400">
              Nenhuma skill cadastrada ainda.
            </p>
          )}

          {(skills ?? []).map((skill) => {
            const isActive = selectedSkill?.id === skill.id;
            const hasMessages = (messages[skill.id] ?? []).length > 0;
            return (
              <button
                key={skill.id}
                type="button"
                onClick={() => setSelectedSkill(skill)}
                className={`w-full rounded-lg px-3 py-2 text-left transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary dark:bg-primary/20'
                    : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-primary' : 'text-zinc-400'}`} />
                  <span className="truncate text-xs font-medium">{skill.name}</span>
                  {hasMessages && !isActive && (
                    <MessageSquare className="ml-auto h-3 w-3 shrink-0 text-zinc-400" />
                  )}
                </div>
                {skill.category && (
                  <span className="ml-5 text-[10px] text-zinc-400">{skill.category}</span>
                )}
              </button>
            );
          })}
        </div>
      </aside>

      {/* ── Main chat area ────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-zinc-200 bg-white px-5 py-3 dark:border-zinc-800 dark:bg-zinc-950">
          {selectedSkill ? (
            <>
              <Sparkles className="h-4 w-4 shrink-0 text-primary" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {selectedSkill.name}
                </p>
                {selectedSkill.description && (
                  <p className="truncate text-xs text-zinc-500">{selectedSkill.description}</p>
                )}
              </div>
              {chat.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    setMessages((prev) => ({ ...prev, [activeSkillId]: [] }))
                  }
                  className="ml-auto text-xs text-zinc-400 hover:text-red-500"
                >
                  Limpar chat
                </button>
              )}
            </>
          ) : (
            <p className="text-sm text-zinc-400">Selecione uma skill na barra lateral</p>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {!selectedSkill && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <MessageSquare className="h-12 w-12 text-zinc-200 dark:text-zinc-700" />
              <p className="mt-3 text-sm font-medium text-zinc-500">
                Nenhuma skill selecionada
              </p>
              <p className="mt-1 max-w-xs text-xs text-zinc-400">
                Escolha uma skill na lista à esquerda para iniciar uma conversa.
              </p>
            </div>
          )}

          {selectedSkill && chat.length === 0 && !loading && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <Bot className="h-12 w-12 text-zinc-200 dark:text-zinc-700" />
              <p className="mt-3 text-sm font-medium text-zinc-500">
                Pronto para executar
              </p>
              <p className="mt-1 max-w-xs text-xs text-zinc-400">
                {selectedSkill.promptInstructions
                  ? selectedSkill.promptInstructions.slice(0, 120) + '…'
                  : 'Digite uma mensagem para interagir com esta skill.'}
              </p>
            </div>
          )}

          {chat.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-zinc-100 dark:bg-zinc-800'
                }`}
              >
                {msg.role === 'user' ? (
                  <User className="h-3.5 w-3.5" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                )}
              </div>

              {/* Bubble */}
              <div className={`group relative max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                <div
                  className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-tr-sm'
                      : 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 rounded-tl-sm'
                  }`}
                >
                  {msg.content}
                </div>

                {/* Copy button — only for assistant messages */}
                {msg.role === 'assistant' && (
                  <button
                    type="button"
                    onClick={() => copy(msg.id, msg.content)}
                    className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-zinc-400 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800"
                  >
                    {copiedId === msg.id ? (
                      <>
                        <Check className="h-3 w-3 text-green-500" />
                        <span className="text-green-500">Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        Copiar resposta
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm bg-zinc-100 px-4 py-3 dark:bg-zinc-800">
                <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
                <span className="text-xs text-zinc-500">Executando skill…</span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={!selectedSkill || loading}
              placeholder={
                selectedSkill
                  ? `Mensagem para ${selectedSkill.name}… (Enter para enviar)`
                  : 'Selecione uma skill para começar'
              }
              rows={1}
              className="flex-1 resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              style={{ maxHeight: 120, overflowY: 'auto' }}
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim() || !selectedSkill || loading}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-opacity hover:bg-primary/90 disabled:opacity-40"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
          <p className="mt-1.5 text-[11px] text-zinc-400">
            Shift+Enter para nova linha · Enter para enviar
          </p>
        </div>
      </div>
    </div>
  );
}
