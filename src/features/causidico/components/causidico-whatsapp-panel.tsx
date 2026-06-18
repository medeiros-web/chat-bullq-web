'use client';

import { useState, useEffect, useRef } from 'react';
import { Wifi, WifiOff, RefreshCw, Loader2, QrCode, CheckCircle2, Smartphone } from 'lucide-react';
import { channelsService, type Channel } from '@/features/channels/services/channels.service';
import { useQuery } from '@tanstack/react-query';

type QrStatus = 'idle' | 'loading' | 'qr' | 'connected' | 'error';

interface Props {
  channelId: string | null;
  onChannelSelect: (id: string) => void;
}

export function CausidicoWhatsappPanel({ channelId, onChannelSelect }: Props) {
  const [qrStatus, setQrStatus] = useState<QrStatus>('idle');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: channels = [] } = useQuery({
    queryKey: ['channels'],
    queryFn: channelsService.list,
  });

  const waChannels = channels.filter(
    (c) => c.type === 'WHATSAPP_EVOLUTION' || c.type === 'WHATSAPP_EVOLUTION_GO'
  );

  const selectedChannel = waChannels.find((c) => c.id === channelId) ?? null;

  const fetchQr = async (id: string) => {
    try {
      const result = await channelsService.getQrCode(id);
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
      setErrorMsg('Não foi possível obter o QR Code. Verifique as configurações do canal.');
    }
  };

  const startQr = (id: string) => {
    setQrStatus('loading');
    setQrCode(null);
    fetchQr(id);
    pollRef.current = setInterval(() => fetchQr(id), 5000);
  };

  useEffect(() => {
    return () => clearInterval(pollRef.current!);
  }, []);

  useEffect(() => {
    if (channelId) {
      channelsService.getConnectionStatus(channelId).then((s) => {
        if (s.connected) setQrStatus('connected');
        else setQrStatus('idle');
      }).catch(() => setQrStatus('idle'));
    } else {
      setQrStatus('idle');
    }
  }, [channelId]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
          Canal WhatsApp
        </label>
        {waChannels.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-300 p-3 text-center dark:border-zinc-700">
            <Smartphone className="mx-auto h-6 w-6 text-zinc-400 mb-1" />
            <p className="text-xs text-zinc-500">Nenhum canal Evolution ativo.</p>
            <a href="/settings/channels" className="text-xs text-primary hover:underline">
              Configurar canal →
            </a>
          </div>
        ) : (
          <select
            value={channelId ?? ''}
            onChange={(e) => onChannelSelect(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 focus:border-primary focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          >
            <option value="">Selecione um canal…</option>
            {waChannels.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        )}
      </div>

      {channelId && (
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
          {qrStatus === 'idle' && (
            <div className="flex flex-col items-center gap-3 py-2">
              <QrCode className="h-8 w-8 text-zinc-400" />
              <p className="text-xs text-zinc-500 text-center">
                {selectedChannel ? `Canal: ${selectedChannel.name}` : ''}
              </p>
              <button
                onClick={() => startQr(channelId)}
                className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700"
              >
                <QrCode className="h-3.5 w-3.5" />
                Conectar via QR Code
              </button>
            </div>
          )}

          {qrStatus === 'loading' && (
            <div className="flex flex-col items-center gap-2 py-4">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
              <p className="text-xs text-zinc-500">Gerando QR Code…</p>
            </div>
          )}

          {qrStatus === 'qr' && qrCode && (
            <div className="flex flex-col items-center gap-3">
              <div className="rounded-xl border-4 border-zinc-200 bg-white p-2 dark:border-zinc-600">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrCode.startsWith('data:') ? qrCode : `data:image/png;base64,${qrCode}`}
                  alt="QR Code WhatsApp"
                  className="h-44 w-44"
                />
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 dark:bg-amber-900/30">
                <Wifi className="h-3 w-3 text-amber-600" />
                <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400">
                  Aguardando leitura…
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 text-center">
                Abra WhatsApp → Dispositivos conectados → Conectar dispositivo
              </p>
            </div>
          )}

          {qrStatus === 'connected' && (
            <div className="flex flex-col items-center gap-2 py-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-sm font-semibold text-green-700 dark:text-green-400">WhatsApp conectado!</p>
              <p className="text-xs text-zinc-500">{selectedChannel?.name}</p>
              <button
                onClick={() => startQr(channelId)}
                className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-600"
              >
                <RefreshCw className="h-3 w-3" />
                Reconectar
              </button>
            </div>
          )}

          {qrStatus === 'error' && (
            <div className="flex flex-col items-center gap-2 py-2 text-center">
              <WifiOff className="h-7 w-7 text-red-500" />
              <p className="text-xs text-red-600">{errorMsg}</p>
              <button
                onClick={() => startQr(channelId)}
                className="flex items-center gap-1.5 rounded-md bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200"
              >
                <RefreshCw className="h-3 w-3" />
                Tentar novamente
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
