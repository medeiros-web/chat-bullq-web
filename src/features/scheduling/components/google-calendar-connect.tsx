'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, ExternalLink, X, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { schedulingService } from '../services/scheduling.service';

function GoogleCalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="2" fill="white" stroke="#dadce0" />
      <rect x="3" y="3" width="18" height="5" rx="2" fill="#1a73e8" />
      <rect x="3" y="3" width="18" height="3" fill="#1a73e8" />
      <rect x="8" y="1" width="2" height="4" rx="1" fill="#1a73e8" />
      <rect x="14" y="1" width="2" height="4" rx="1" fill="#1a73e8" />
      <text x="12" y="17" textAnchor="middle" fontSize="7" fontWeight="700" fill="#1a73e8">31</text>
    </svg>
  );
}

export function GoogleCalendarConnect() {
  const qc = useQueryClient();

  const { data: status, isLoading } = useQuery({
    queryKey: ['google-calendar-status'],
    queryFn: () => schedulingService.getGoogleCalendarStatus(),
    staleTime: 60000,
    retry: false,
  });

  const connectMutation = useMutation({
    mutationFn: async () => {
      const { authUrl } = await schedulingService.getGoogleCalendarAuthUrl();
      window.open(authUrl, '_blank', 'width=600,height=700');
    },
    onError: () => toast.error('Erro ao iniciar autenticação com Google.'),
  });

  const disconnectMutation = useMutation({
    mutationFn: () => schedulingService.disconnectGoogleCalendar(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['google-calendar-status'] });
      toast.success('Google Calendar desconectado.');
    },
    onError: () => toast.error('Erro ao desconectar.'),
  });

  if (isLoading) return null;

  if (status?.connected) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 dark:border-green-800/40 dark:bg-green-900/20">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
        <GoogleCalendarIcon />
        <span className="flex-1 text-xs font-medium text-green-700 dark:text-green-400">
          Google Calendar conectado{status.email ? ` · ${status.email}` : ''}
        </span>
        <button
          onClick={() => disconnectMutation.mutate()}
          disabled={disconnectMutation.isPending}
          className="flex items-center gap-1 text-xs text-green-600 hover:text-red-500 dark:text-green-400"
          title="Desconectar"
        >
          {disconnectMutation.isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <X className="h-3.5 w-3.5" />
          )}
          Desconectar
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800/50">
      <GoogleCalendarIcon />
      <span className="flex-1 text-xs text-zinc-500 dark:text-zinc-400">
        Conecte o Google Calendar para sincronizar agendamentos e criar Google Meet
      </span>
      <button
        onClick={() => connectMutation.mutate()}
        disabled={connectMutation.isPending}
        className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 text-xs font-medium text-zinc-700 shadow-sm hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600"
      >
        {connectMutation.isPending ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <ExternalLink className="h-3 w-3" />
        )}
        Conectar
      </button>
    </div>
  );
}
