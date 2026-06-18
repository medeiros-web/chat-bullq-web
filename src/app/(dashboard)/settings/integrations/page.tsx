'use client';

import { useState } from 'react';
import { Eye, EyeOff, Check, Loader2, Trash2, KeyRound, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { integrationsService, type LlmProvider } from '@/features/settings/services/integrations.service';
import {
  OpenAIIcon,
  GrokIcon,
  GeminiIcon,
  AnthropicIcon,
} from '@/components/ui/icons';

interface ProviderConfig {
  id: LlmProvider;
  name: string;
  icon: React.ElementType;
  description: string;
  docsUrl: string;
  placeholder: string;
  keyPrefix: string;
  color: string;
}

const PROVIDERS: ProviderConfig[] = [
  {
    id: 'openai',
    name: 'OpenAI (ChatGPT)',
    icon: OpenAIIcon,
    description: 'GPT-4o, GPT-4o mini, o1, o3 — modelos da OpenAI',
    docsUrl: 'https://platform.openai.com/api-keys',
    placeholder: 'sk-proj-...',
    keyPrefix: 'sk-',
    color: 'border-zinc-300 dark:border-zinc-700',
  },
  {
    id: 'xai',
    name: 'xAI (Grok)',
    icon: GrokIcon,
    description: 'Grok-2, Grok-3 — modelos da xAI com acesso à internet',
    docsUrl: 'https://console.x.ai',
    placeholder: 'xai-...',
    keyPrefix: 'xai-',
    color: 'border-zinc-300 dark:border-zinc-700',
  },
  {
    id: 'google',
    name: 'Google Gemini',
    icon: GeminiIcon,
    description: 'Gemini 2.0 Flash, Gemini 2.5 Pro — modelos do Google',
    docsUrl: 'https://aistudio.google.com/app/apikey',
    placeholder: 'AIza...',
    keyPrefix: 'AIza',
    color: 'border-zinc-300 dark:border-zinc-700',
  },
  {
    id: 'anthropic',
    name: 'Anthropic (Claude)',
    icon: AnthropicIcon,
    description: 'Claude Opus 4.7, Sonnet 4.6, Haiku 4.5 — modelos da Anthropic',
    docsUrl: 'https://console.anthropic.com/settings/keys',
    placeholder: 'sk-ant-...',
    keyPrefix: 'sk-ant-',
    color: 'border-zinc-300 dark:border-zinc-700',
  },
];

function ProviderCard({ provider }: { provider: ProviderConfig }) {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!apiKey.trim()) return;
    setIsSaving(true);
    try {
      await integrationsService.saveLlmKey(provider.id, apiKey.trim());
      toast.success(`Chave ${provider.name} salva com sucesso!`);
      setSaved(true);
      setApiKey('');
      setTimeout(() => setSaved(false), 3000);
    } catch {
      toast.error('Erro ao salvar a chave. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await integrationsService.removeLlmKey(provider.id);
      toast.success(`Chave ${provider.name} removida.`);
    } catch {
      toast.error('Erro ao remover a chave.');
    } finally {
      setIsRemoving(false);
    }
  };

  const Icon = provider.icon;

  return (
    <div className={`rounded-xl border bg-white p-5 shadow-sm dark:bg-zinc-900 ${provider.color}`}>
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800">
          <Icon className="h-7 w-7" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {provider.name}
            </h3>
            <a
              href={provider.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-primary"
            >
              Obter chave
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{provider.description}</p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <KeyRound className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              placeholder={provider.placeholder}
              className="h-9 w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-8 pr-9 text-sm placeholder-zinc-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
            <button
              type="button"
              onClick={() => setShowKey((v) => !v)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
            >
              {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>

          <button
            onClick={handleSave}
            disabled={!apiKey.trim() || isSaving}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
          >
            {isSaving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : saved ? (
              <Check className="h-3.5 w-3.5" />
            ) : null}
            {saved ? 'Salvo!' : 'Salvar'}
          </button>

          <button
            onClick={handleRemove}
            disabled={isRemoving}
            title="Remover chave"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-400 hover:border-red-300 hover:bg-red-50 hover:text-red-500 dark:border-zinc-700 dark:hover:border-red-800 dark:hover:bg-red-900/20 disabled:opacity-40"
          >
            {isRemoving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
          </button>
        </div>

        <p className="text-[11px] text-zinc-400">
          A chave é armazenada encriptada e nunca exposta após salva.
        </p>
      </div>
    </div>
  );
}

export default function IntegrationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Integrações de LLM
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Conecte provedores de IA para usar nos seus agentes. Configure as chaves de API de cada provedor abaixo.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {PROVIDERS.map((provider) => (
          <ProviderCard key={provider.id} provider={provider} />
        ))}
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/40 dark:bg-amber-900/20">
        <p className="text-xs font-medium text-amber-800 dark:text-amber-400">
          🔒 Segurança: as chaves são criptografadas em repouso (AES-256) e transmitidas via HTTPS. Nunca são exibidas em texto plano após salvas.
        </p>
      </div>
    </div>
  );
}
