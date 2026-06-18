'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Loader2, Video, VideoOff, Send, Trash2, CalendarDays, Clock, User, Bot, Radio } from 'lucide-react';
import { toast } from 'sonner';
import {
  schedulingService,
  type Appointment,
  type CreateAppointmentPayload,
  type AppointmentStatus,
} from '../services/scheduling.service';
import { aiAgentsService } from '@/features/ai-agents/services/ai-agents.service';
import { channelsService } from '@/features/channels/services/channels.service';

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  SCHEDULED: 'Agendado',
  CONFIRMED: 'Confirmado',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
  NO_SHOW: 'Não compareceu',
};

const STATUS_COLORS: Record<AppointmentStatus, string> = {
  SCHEDULED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  CONFIRMED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  COMPLETED: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
  CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  NO_SHOW: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

function toLocalDatetimeValue(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function addMinutes(iso: string, minutes: number) {
  return new Date(new Date(iso).getTime() + minutes * 60000).toISOString();
}

interface Props {
  appointment?: Appointment | null;
  defaultStartsAt?: string;
  onClose: () => void;
}

export function AppointmentDialog({ appointment, defaultStartsAt, onClose }: Props) {
  const qc = useQueryClient();
  const isEdit = !!appointment;

  const now = defaultStartsAt ?? new Date().toISOString();
  const [title, setTitle] = useState(appointment?.title ?? '');
  const [description, setDescription] = useState(appointment?.description ?? '');
  const [startsAt, setStartsAt] = useState(toLocalDatetimeValue(appointment?.startsAt ?? now));
  const [endsAt, setEndsAt] = useState(toLocalDatetimeValue(appointment?.endsAt ?? addMinutes(now, 60)));
  const [agentId, setAgentId] = useState(appointment?.agentId ?? '');
  const [channelId, setChannelId] = useState(appointment?.channelId ?? '');
  const [notes, setNotes] = useState(appointment?.notes ?? '');
  const [createMeet, setCreateMeet] = useState(false);
  const [status, setStatus] = useState<AppointmentStatus>(appointment?.status ?? 'SCHEDULED');

  const { data: agents = [] } = useQuery({
    queryKey: ['ai-agents'],
    queryFn: () => aiAgentsService.list(),
    staleTime: 60000,
  });

  const { data: channels = [] } = useQuery({
    queryKey: ['channels'],
    queryFn: () => channelsService.list(),
    staleTime: 60000,
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateAppointmentPayload) => schedulingService.createAppointment(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Agendamento criado!');
      onClose();
    },
    onError: () => toast.error('Erro ao criar agendamento.'),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: Parameters<typeof schedulingService.updateAppointment>[1]) =>
      schedulingService.updateAppointment(appointment!.id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Agendamento atualizado!');
      onClose();
    },
    onError: () => toast.error('Erro ao atualizar agendamento.'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => schedulingService.deleteAppointment(appointment!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Agendamento removido.');
      onClose();
    },
    onError: () => toast.error('Erro ao remover agendamento.'),
  });

  const createMeetMutation = useMutation({
    mutationFn: () => schedulingService.createMeet(appointment!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Google Meet criado!');
    },
    onError: () => toast.error('Erro ao criar Meet.'),
  });

  const deleteMeetMutation = useMutation({
    mutationFn: () => schedulingService.deleteMeet(appointment!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Google Meet removido.');
    },
    onError: () => toast.error('Erro ao remover Meet.'),
  });

  const sendLinkMutation = useMutation({
    mutationFn: () => schedulingService.sendLink(appointment!.id),
    onSuccess: () => toast.success('Link enviado ao cliente!'),
    onError: () => toast.error('Erro ao enviar link.'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
      agentId: agentId || undefined,
      channelId: channelId || undefined,
      notes: notes.trim() || undefined,
      startsAt: new Date(startsAt).toISOString(),
      endsAt: new Date(endsAt).toISOString(),
    };
    if (isEdit) {
      updateMutation.mutate({ ...payload, status });
    } else {
      createMutation.mutate({ ...payload, createMeet });
    }
  };

  const isBusy =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              {isEdit ? 'Editar Agendamento' : 'Novo Agendamento'}
            </h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-4">
          {/* Title */}
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Título *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Reunião de apresentação"
              className="h-9 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              required
            />
          </div>

          {/* Date / Time row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                <Clock className="mr-1 inline h-3 w-3" />Início
              </label>
              <input
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className="h-9 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Fim</label>
              <input
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                className="h-9 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                required
              />
            </div>
          </div>

          {/* Status (edit only) */}
          {isEdit && (
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Status</label>
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(STATUS_LABELS) as AppointmentStatus[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-all ${
                      status === s
                        ? STATUS_COLORS[s] + ' ring-2 ring-offset-1 ring-current'
                        : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                    }`}
                  >
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Agent + Channel */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                <Bot className="mr-1 inline h-3 w-3" />Agente IA
              </label>
              <select
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                className="h-9 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              >
                <option value="">Sem agente</option>
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                <Radio className="mr-1 inline h-3 w-3" />Canal
              </label>
              <select
                value={channelId}
                onChange={(e) => setChannelId(e.target.value)}
                className="h-9 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              >
                <option value="">Sem canal</option>
                {channels.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Observações</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Notas internas sobre o agendamento..."
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>

          {/* Google Meet toggle (new) / Meet actions (edit) */}
          {!isEdit ? (
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-200 p-3 dark:border-zinc-700">
              <input
                type="checkbox"
                checked={createMeet}
                onChange={(e) => setCreateMeet(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-300 accent-primary"
              />
              <Video className="h-4 w-4 text-blue-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Criar Google Meet</p>
                <p className="text-xs text-zinc-500">Gerar link de videoconferência automaticamente</p>
              </div>
            </label>
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-zinc-200 p-3 dark:border-zinc-700">
              <Video className="h-4 w-4 text-blue-500" />
              <div className="flex-1">
                {appointment.meetLink ? (
                  <a href={appointment.meetLink} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">
                    {appointment.meetLink}
                  </a>
                ) : (
                  <p className="text-sm text-zinc-500">Sem Google Meet</p>
                )}
              </div>
              {appointment.meetLink ? (
                <button
                  type="button"
                  onClick={() => deleteMeetMutation.mutate()}
                  disabled={deleteMeetMutation.isPending}
                  className="flex items-center gap-1 rounded-lg border border-red-200 px-2 py-1 text-xs text-red-500 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
                >
                  {deleteMeetMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <VideoOff className="h-3 w-3" />}
                  Remover
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => createMeetMutation.mutate()}
                  disabled={createMeetMutation.isPending}
                  className="flex items-center gap-1 rounded-lg bg-blue-500 px-2 py-1 text-xs text-white hover:bg-blue-600"
                >
                  {createMeetMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Video className="h-3 w-3" />}
                  Criar Meet
                </button>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex gap-2">
              {isEdit && (
                <>
                  <button
                    type="button"
                    onClick={() => deleteMutation.mutate()}
                    disabled={isBusy}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-zinc-200 px-3 text-xs text-red-500 hover:bg-red-50 dark:border-zinc-700 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Excluir
                  </button>
                  <button
                    type="button"
                    onClick={() => sendLinkMutation.mutate()}
                    disabled={sendLinkMutation.isPending || !appointment.channelId}
                    title={!appointment.channelId ? 'Selecione um canal para enviar' : undefined}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-zinc-200 px-3 text-xs text-zinc-600 hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-300"
                  >
                    {sendLinkMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                    Enviar link
                  </button>
                </>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="h-9 rounded-lg border border-zinc-200 px-4 text-sm text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isBusy || !title.trim()}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
              >
                {isBusy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {isEdit ? 'Salvar' : 'Criar'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
