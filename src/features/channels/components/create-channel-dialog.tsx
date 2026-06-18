'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Loader2,
  X,
  Copy,
  Check,
  QrCode,
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { channelsService, type ChannelType, type Channel } from '../services/channels.service';
import {
  ZappfyIcon,
  MetaIcon,
  InstagramIcon,
  EvolutionIcon,
  EvolutionGoIcon,
} from '@/components/ui/icons';

// ─── Channel type catalog ────────────────────────────────────────────────────

const channelTypes: {
  value: ChannelType;
  label: string;
  icon: React.ElementType;
  badge?: string;
  description: string;
}[] = [
  {
    value: 'WHATSAPP_EVOLUTION',
    label: 'Evolution API',
    icon: EvolutionIcon,
    badge: 'QR Code',
    description: 'Conecte via Evolution API — autenticação por QR Code, sem restrição de 24h',
  },
  {
    value: 'WHATSAPP_EVOLUTION_GO',
    label: 'Evolution GO',
    icon: EvolutionGoIcon,
    badge: 'QR Code',
    description: 'Evolution GO — versão SaaS gerenciada com QR Code e reconexão automática',
  },
  {
    value: 'WHATSAPP_ZAPPFY',
    label: 'WhatsApp (Zappfy)',
    icon: ZappfyIcon,
    description: 'Conecte via Zappfy/Uazapi — sem restrição de 24h',
  },
  {
    value: 'WHATSAPP_OFFICIAL',
    label: 'WhatsApp Official',
    icon: MetaIcon,
    description: 'Meta Cloud API — templates HSM, alta escala',
  },
  {
    value: 'INSTAGRAM',
    label: 'Instagram',
    icon: InstagramIcon,
    description: 'Instagram API com login empresarial — DMs e stories',
  },
];

// ─── Schemas ─────────────────────────────────────────────────────────────────

const evolutionSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  serverUrl: z.string().url('URL do servidor inválida').min(1, 'URL do servidor é obrigatória'),
  apiKey: z.string().min(1, 'API Key é obrigatória'),
  instanceName: z
    .string()
    .min(1, 'Nome da instância é obrigatório')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Use apenas letras, números, - e _'),
  webhookSecret: z.string().optional(),
});

const evolutionGoSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  serverUrl: z.string().url('URL inválida').min(1, 'URL é obrigatória'),
  apiKey: z.string().min(1, 'API Key é obrigatória'),
  instanceName: z
    .string()
    .min(1, 'Nome da instância é obrigatório')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Use apenas letras, números, - e _'),
  webhookSecret: z.string().optional(),
});

const zappfySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  token: z.string().min(1, 'Token é obrigatório'),
  webhookSecret: z.string().optional(),
});

const waOfficialSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  phoneNumberId: z.string().min(1, 'Phone Number ID é obrigatório'),
  accessToken: z.string().min(1, 'Access Token é obrigatório'),
  appSecret: z.string().min(1, 'App Secret é obrigatório'),
  businessAccountId: z.string().optional(),
  webhookSecret: z.string().optional(),
});

const instagramSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  accessToken: z.string().min(1, 'Access Token é obrigatório'),
  appSecret: z.string().min(1, 'App Secret é obrigatório'),
  igBusinessId: z.string().optional(),
  igAppId: z.string().optional(),
  webhookSecret: z.string().optional(),
});

type EvolutionFormData = z.infer<typeof evolutionSchema>;
type EvolutionGoFormData = z.infer<typeof evolutionGoSchema>;
type ZappfyFormData = z.infer<typeof zappfySchema>;
type WaOfficialFormData = z.infer<typeof waOfficialSchema>;
type InstagramFormData = z.infer<typeof instagramSchema>;

// ─── Styles ───────────────────────────────────────────────────────────────────

const inputCls =
  'flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100';
const labelCls = 'text-sm font-medium text-zinc-700 dark:text-zinc-300';
const errorCls = 'text-xs text-red-500';

// ─── Main component ───────────────────────────────────────────────────────────

type Step = 'type' | 'config' | 'qr';

interface CreateChannelDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateChannelDialog({ open, onClose, onCreated }: CreateChannelDialogProps) {
  const [step, setStep] = useState<Step>('type');
  const [selectedType, setSelectedType] = useState<ChannelType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [visibility, setVisibility] = useState<'ORG' | 'PRIVATE'>('ORG');
  const [createdChannel, setCreatedChannel] = useState<Channel | null>(null);

  const evolutionForm = useForm<EvolutionFormData>({
    resolver: zodResolver(evolutionSchema),
    defaultValues: { name: '', serverUrl: '', apiKey: '', instanceName: '', webhookSecret: '' },
  });
  const evolutionGoForm = useForm<EvolutionGoFormData>({
    resolver: zodResolver(evolutionGoSchema),
    defaultValues: { name: '', serverUrl: '', apiKey: '', instanceName: '', webhookSecret: '' },
  });
  const zappfyForm = useForm<ZappfyFormData>({
    resolver: zodResolver(zappfySchema),
    defaultValues: { name: '', token: '', webhookSecret: '' },
  });
  const waForm = useForm<WaOfficialFormData>({
    resolver: zodResolver(waOfficialSchema),
    defaultValues: { name: '', phoneNumberId: '', accessToken: '', appSecret: '', businessAccountId: '', webhookSecret: '' },
  });
  const igForm = useForm<InstagramFormData>({
    resolver: zodResolver(instagramSchema),
    defaultValues: { name: '', accessToken: '', appSecret: '', igBusinessId: '', igAppId: '', webhookSecret: '' },
  });

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
  const isEvolution =
    selectedType === 'WHATSAPP_EVOLUTION' || selectedType === 'WHATSAPP_EVOLUTION_GO';

  const handleTypeSelect = (type: ChannelType) => {
    setSelectedType(type);
    setStep('config');
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const submitChannel = async (
    type: ChannelType,
    name: string,
    config: Record<string, any>,
    webhookSecret?: string,
  ) => {
    setIsLoading(true);
    try {
      const channel = await channelsService.create({ type, name, config, webhookSecret, visibility });
      toast.success('Canal criado!');
      if (type === 'WHATSAPP_EVOLUTION' || type === 'WHATSAPP_EVOLUTION_GO') {
        setCreatedChannel(channel);
        setStep('qr');
        onCreated();
      } else {
        handleClose();
        onCreated();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao criar canal');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitEvolution = (data: EvolutionFormData) =>
    submitChannel('WHATSAPP_EVOLUTION', data.name, {
      serverUrl: data.serverUrl.replace(/\/$/, ''),
      apiKey: data.apiKey,
      instanceName: data.instanceName,
    }, data.webhookSecret);

  const onSubmitEvolutionGo = (data: EvolutionGoFormData) =>
    submitChannel('WHATSAPP_EVOLUTION_GO', data.name, {
      serverUrl: data.serverUrl.replace(/\/$/, ''),
      apiKey: data.apiKey,
      instanceName: data.instanceName,
    }, data.webhookSecret);

  const onSubmitZappfy = (data: ZappfyFormData) =>
    submitChannel('WHATSAPP_ZAPPFY', data.name, { token: data.token }, data.webhookSecret);

  const onSubmitWaOfficial = (data: WaOfficialFormData) =>
    submitChannel('WHATSAPP_OFFICIAL', data.name, {
      phoneNumberId: data.phoneNumberId,
      accessToken: data.accessToken,
      appSecret: data.appSecret,
      businessAccountId: data.businessAccountId || undefined,
    }, data.webhookSecret);

  const onSubmitInstagram = (data: InstagramFormData) =>
    submitChannel('INSTAGRAM', data.name, {
      accessToken: data.accessToken,
      appSecret: data.appSecret,
      igBusinessId: data.igBusinessId || undefined,
      igAppId: data.igAppId || undefined,
      apiVersion: 'v21.0',
    }, data.webhookSecret);

  const handleClose = () => {
    setStep('type');
    setSelectedType(null);
    setCreatedChannel(null);
    evolutionForm.reset();
    evolutionGoForm.reset();
    zappfyForm.reset();
    waForm.reset();
    igForm.reset();
    onClose();
  };

  if (!open) return null;

  const titleMap: Partial<Record<ChannelType, string>> = {
    WHATSAPP_EVOLUTION: 'Configurar Evolution API',
    WHATSAPP_EVOLUTION_GO: 'Configurar Evolution GO',
    WHATSAPP_ZAPPFY: 'Configurar Zappfy',
    WHATSAPP_OFFICIAL: 'Configurar WhatsApp Official',
    INSTAGRAM: 'Configurar Instagram',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={step === 'qr' ? undefined : handleClose} />
      <div className="relative z-50 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {step === 'type'
              ? 'Novo Canal'
              : step === 'qr'
              ? 'Conectar WhatsApp'
              : titleMap[selectedType || 'WHATSAPP_OFFICIAL']}
          </h2>
          <button onClick={handleClose} className="rounded-md p-1 text-zinc-400 hover:text-zinc-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step 1: type selection */}
        {step === 'type' && (
          <div className="mt-6 grid gap-3">
            {channelTypes.map((ct) => (
              <button
                key={ct.value}
                onClick={() => handleTypeSelect(ct.value)}
                className="flex items-center gap-4 rounded-xl border border-zinc-200 p-4 text-left transition-all hover:border-primary hover:shadow-sm dark:border-zinc-700 dark:hover:border-primary"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-200/60 bg-zinc-50 dark:border-zinc-700/60 dark:bg-zinc-800">
                  <ct.icon className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{ct.label}</p>
                    {ct.badge && (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700 dark:bg-green-900/40 dark:text-green-400">
                        {ct.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{ct.description}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Step 2: config forms */}
        {step === 'config' && selectedType === 'WHATSAPP_EVOLUTION' && (
          <EvolutionForm
            form={evolutionForm}
            onSubmit={onSubmitEvolution}
            onBack={() => setStep('type')}
            isLoading={isLoading}
            apiBaseUrl={apiBaseUrl}
            copied={copied}
            onCopy={handleCopy}
            channelType="WHATSAPP_EVOLUTION"
          />
        )}

        {step === 'config' && selectedType === 'WHATSAPP_EVOLUTION_GO' && (
          <EvolutionForm
            form={evolutionGoForm}
            onSubmit={onSubmitEvolutionGo}
            onBack={() => setStep('type')}
            isLoading={isLoading}
            apiBaseUrl={apiBaseUrl}
            copied={copied}
            onCopy={handleCopy}
            channelType="WHATSAPP_EVOLUTION_GO"
          />
        )}

        {step === 'config' && selectedType === 'WHATSAPP_ZAPPFY' && (
          <form onSubmit={zappfyForm.handleSubmit(onSubmitZappfy)} className="mt-6 space-y-4">
            <Field label="Nome do canal" placeholder="Ex: WhatsApp Principal" error={zappfyForm.formState.errors.name?.message} {...zappfyForm.register('name')} />
            <Field label="Token" placeholder="Token da instância Zappfy" error={zappfyForm.formState.errors.token?.message} {...zappfyForm.register('token')} />
            <Field label="Webhook Secret" placeholder="Opcional" optional {...zappfyForm.register('webhookSecret')} />
            <WebhookUrl url={`${apiBaseUrl}/webhooks/WHATSAPP_ZAPPFY`} copied={copied} onCopy={() => handleCopy(`${apiBaseUrl}/webhooks/WHATSAPP_ZAPPFY`)} />
            <FormFooter isLoading={isLoading} onBack={() => setStep('type')} />
          </form>
        )}

        {step === 'config' && selectedType === 'WHATSAPP_OFFICIAL' && (
          <form onSubmit={waForm.handleSubmit(onSubmitWaOfficial)} className="mt-6 space-y-4">
            <Field label="Nome do canal" placeholder="Ex: WhatsApp Business" error={waForm.formState.errors.name?.message} {...waForm.register('name')} />
            <Field label="Phone Number ID" placeholder="Encontrado no Meta Business Suite" error={waForm.formState.errors.phoneNumberId?.message} {...waForm.register('phoneNumberId')} />
            <Field label="Access Token" placeholder="System User Token" error={waForm.formState.errors.accessToken?.message} {...waForm.register('accessToken')} />
            <Field label="App Secret" placeholder="Settings → Basic na Meta" error={waForm.formState.errors.appSecret?.message} {...waForm.register('appSecret')} />
            <Field label="Business Account ID (WABA)" placeholder="Opcional" optional {...waForm.register('businessAccountId')} />
            <Field label="Webhook Verify Token" placeholder="Token definido no Meta" optional {...waForm.register('webhookSecret')} />
            <WebhookUrl url={`${apiBaseUrl}/webhooks/WHATSAPP_OFFICIAL`} copied={copied} onCopy={() => handleCopy(`${apiBaseUrl}/webhooks/WHATSAPP_OFFICIAL`)} />
            <FormFooter isLoading={isLoading} onBack={() => setStep('type')} />
          </form>
        )}

        {step === 'config' && selectedType === 'INSTAGRAM' && (
          <form onSubmit={igForm.handleSubmit(onSubmitInstagram)} className="mt-6 space-y-4">
            <Field label="Nome do canal" placeholder="Ex: Instagram Loja" error={igForm.formState.errors.name?.message} {...igForm.register('name')} />
            <Field label="Access Token" placeholder="Instagram User Access Token" error={igForm.formState.errors.accessToken?.message} {...igForm.register('accessToken')} />
            <Field label="App Secret" placeholder="Chave secreta do app" error={igForm.formState.errors.appSecret?.message} {...igForm.register('appSecret')} />
            <Field label="Instagram Business ID" placeholder="Opcional" optional {...igForm.register('igBusinessId')} />
            <Field label="Instagram App ID" placeholder="Opcional" optional {...igForm.register('igAppId')} />
            <Field label="Webhook Verify Token" placeholder="Token definido no Meta" optional {...igForm.register('webhookSecret')} />
            <WebhookUrl url={`${apiBaseUrl}/webhooks/INSTAGRAM`} copied={copied} onCopy={() => handleCopy(`${apiBaseUrl}/webhooks/INSTAGRAM`)} />
            <FormFooter isLoading={isLoading} onBack={() => setStep('type')} />
          </form>
        )}

        {/* Step 3: QR Code */}
        {step === 'qr' && createdChannel && (
          <QrCodeStep channel={createdChannel} onDone={handleClose} />
        )}
      </div>
    </div>
  );
}

// ─── Evolution form (shared for API and GO) ───────────────────────────────────

function EvolutionForm({
  form,
  onSubmit,
  onBack,
  isLoading,
  apiBaseUrl,
  copied,
  onCopy,
  channelType,
}: {
  form: any;
  onSubmit: (data: any) => void;
  onBack: () => void;
  isLoading: boolean;
  apiBaseUrl: string;
  copied: boolean;
  onCopy: (url: string) => void;
  channelType: ChannelType;
}) {
  const webhookUrl = `${apiBaseUrl}/webhooks/${channelType}`;
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800/50 dark:bg-emerald-900/20">
        <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
          ✅ Autenticação por QR Code — escaneie pelo WhatsApp após criar o canal
        </p>
      </div>

      <Field
        label="Nome do canal"
        placeholder="Ex: Atendimento WhatsApp"
        error={form.formState.errors.name?.message}
        {...form.register('name')}
      />
      <Field
        label="URL do servidor Evolution"
        placeholder="https://evolution.seudominio.com"
        error={form.formState.errors.serverUrl?.message}
        {...form.register('serverUrl')}
      />
      <Field
        label="API Key (Global)"
        placeholder="Chave global do servidor Evolution"
        type="password"
        error={form.formState.errors.apiKey?.message}
        {...form.register('apiKey')}
      />
      <Field
        label="Nome da instância"
        placeholder="minha-instancia (letras, números, - e _)"
        error={form.formState.errors.instanceName?.message}
        {...form.register('instanceName')}
      />
      <Field
        label="Webhook Secret"
        placeholder="Opcional"
        optional
        {...form.register('webhookSecret')}
      />
      <WebhookUrl url={webhookUrl} copied={copied} onCopy={() => onCopy(webhookUrl)} />
      <FormFooter isLoading={isLoading} onBack={onBack} label="Criar e conectar via QR" />
    </form>
  );
}

// ─── QR Code step ─────────────────────────────────────────────────────────────

type QrStatus = 'loading' | 'qr' | 'connected' | 'error';

function QrCodeStep({ channel, onDone }: { channel: Channel; onDone: () => void }) {
  const [qrStatus, setQrStatus] = useState<QrStatus>('loading');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchQr = async () => {
    try {
      const result = await channelsService.getQrCode(channel.id);
      if (result.status === 'open' || result.status === 'connected') {
        setQrStatus('connected');
        clearInterval(pollRef.current!);
        return;
      }
      if (result.qrCode) {
        setQrCode(result.qrCode);
        setQrStatus('qr');
      }
    } catch {
      setQrStatus('error');
      setErrorMsg('Não foi possível obter o QR Code. Verifique a URL e API Key do servidor.');
    }
  };

  useEffect(() => {
    fetchQr();
    pollRef.current = setInterval(fetchQr, 5000);
    return () => clearInterval(pollRef.current!);
  }, []);

  return (
    <div className="mt-6 flex flex-col items-center gap-4">
      {qrStatus === 'loading' && (
        <div className="flex flex-col items-center gap-3 py-8">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-zinc-500">Aguardando QR Code do servidor…</p>
        </div>
      )}

      {qrStatus === 'error' && (
        <div className="w-full rounded-lg border border-red-200 bg-red-50 p-4 text-center dark:border-red-800/50 dark:bg-red-900/20">
          <WifiOff className="mx-auto h-8 w-8 text-red-500" />
          <p className="mt-2 text-sm font-medium text-red-700 dark:text-red-400">{errorMsg}</p>
          <button
            onClick={() => { setQrStatus('loading'); fetchQr(); }}
            className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-400"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Tentar novamente
          </button>
        </div>
      )}

      {qrStatus === 'qr' && qrCode && (
        <>
          <div className="flex flex-col items-center gap-2">
            <div className="rounded-xl border-4 border-zinc-200 bg-white p-3 dark:border-zinc-700">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrCode.startsWith('data:') ? qrCode : `data:image/png;base64,${qrCode}`}
                alt="QR Code WhatsApp"
                className="h-52 w-52"
              />
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 dark:bg-amber-900/30">
              <Wifi className="h-3.5 w-3.5 text-amber-600" />
              <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
                Aguardando leitura…
              </span>
            </div>
          </div>

          <ol className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
            <p className="mb-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400">Como conectar:</p>
            {[
              'Abra o WhatsApp no celular',
              'Toque em ⋮ (Android) ou Configurações (iOS)',
              'Selecione "Aparelhos conectados"',
              'Toque em "Conectar aparelho" e escaneie o QR',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2 py-0.5 text-xs text-zinc-600 dark:text-zinc-400">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>

          <button
            onClick={() => { setQrStatus('loading'); setQrCode(null); fetchQr(); }}
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-600"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Atualizar QR Code
          </button>
        </>
      )}

      {qrStatus === 'connected' && (
        <div className="flex flex-col items-center gap-4 py-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle2 className="h-9 w-9 text-green-600 dark:text-green-400" />
          </div>
          <div className="text-center">
            <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              WhatsApp conectado!
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              O canal <span className="font-medium">{channel.name}</span> está ativo e pronto para receber mensagens.
            </p>
          </div>
        </div>
      )}

      <div className="flex w-full justify-end gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
        {qrStatus === 'connected' ? (
          <button
            onClick={onDone}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Fechar
          </button>
        ) : (
          <button
            onClick={onDone}
            className="rounded-md px-4 py-2 text-sm font-medium text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Conectar depois
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────────

import { forwardRef } from 'react';

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  optional?: boolean;
}

const Field = forwardRef<HTMLInputElement, FieldProps>(({ label, error, optional, ...props }, ref) => (
  <div className="space-y-1.5">
    <label className={labelCls}>
      {label} {optional && <span className="text-zinc-400">(opcional)</span>}
    </label>
    <input ref={ref} className={inputCls} {...props} />
    {error && <p className={errorCls}>{error}</p>}
  </div>
));
Field.displayName = 'Field';

function WebhookUrl({ url, copied, onCopy }: { url: string; copied: boolean; onCopy: () => void }) {
  return (
    <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800/50">
      <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
        URL do Webhook (cole no painel do provedor):
      </p>
      <div className="mt-1.5 flex items-center gap-2">
        <code className="flex-1 truncate rounded bg-zinc-100 px-2 py-1 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
          {url}
        </code>
        <button
          type="button"
          onClick={onCopy}
          className="shrink-0 rounded-md p-1.5 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600 dark:hover:bg-zinc-700"
        >
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

function FormFooter({
  isLoading,
  onBack,
  label = 'Criar Canal',
}: {
  isLoading: boolean;
  onBack: () => void;
  label?: string;
}) {
  return (
    <div className="flex items-center justify-end gap-3 pt-2">
      <button
        type="button"
        onClick={onBack}
        className="rounded-md px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
      >
        Voltar
      </button>
      <button
        type="submit"
        disabled={isLoading}
        className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {label}
      </button>
    </div>
  );
}
