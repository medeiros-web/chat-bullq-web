'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Link2,
  Copy,
  Check,
  Trash2,
  Plus,
  Loader2,
  Send,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { schedulingService, type BookingLink } from '../services/scheduling.service';
import { channelsService } from '@/features/channels/services/channels.service';

function BookingLinkCard({ link }: { link: BookingLink }) {
  const qc = useQueryClient();
  const [copied, setCopied] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => schedulingService.deleteBookingLink(link.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['booking-links'] });
      toast.success('Link removido.');
    },
  });

  const toggleMutation = useMutation({
    mutationFn: () => schedulingService.updateBookingLink(link.id, { isActive: !link.isActive }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['booking-links'] }),
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(link.publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${
                link.isActive ? 'bg-green-400' : 'bg-zinc-300 dark:bg-zinc-600'
              }`}
            />
            <h4 className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {link.title}
            </h4>
          </div>
          <p className="mt-0.5 text-xs text-zinc-500">
            {link.durationMinutes} min · /{link.slug}
          </p>
          {link.description && (
            <p className="mt-1 text-xs text-zinc-400 line-clamp-2">{link.description}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={() => toggleMutation.mutate()}
            disabled={toggleMutation.isPending}
            title={link.isActive ? 'Desativar' : 'Ativar'}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            {link.isActive ? (
              <ToggleRight className="h-4 w-4 text-green-500" />
            ) : (
              <ToggleLeft className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={handleCopy}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            title="Copiar link"
          >
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </button>
          <button
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
          >
            {deleteMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-zinc-50 px-2.5 py-1.5 dark:bg-zinc-800">
        <Link2 className="h-3 w-3 shrink-0 text-zinc-400" />
        <span className="flex-1 truncate text-[11px] text-zinc-500">{link.publicUrl}</span>
      </div>
    </div>
  );
}

function CreateBookingLinkForm({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [duration, setDuration] = useState(30);
  const [description, setDescription] = useState('');

  const createMutation = useMutation({
    mutationFn: () =>
      schedulingService.createBookingLink({
        title: title.trim(),
        slug: slug.trim(),
        durationMinutes: duration,
        description: description.trim() || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['booking-links'] });
      toast.success('Link criado!');
      onClose();
    },
    onError: () => toast.error('Erro ao criar link.'),
  });

  const autoSlug = (v: string) =>
    v
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

  return (
    <div className="rounded-xl border border-primary/40 bg-primary/5 p-4">
      <h4 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Novo link de agendamento</h4>
      <div className="space-y-3">
        <input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (!slug) setSlug(autoSlug(e.target.value));
          }}
          placeholder="Título (ex: Consulta inicial)"
          className="h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        />
        <div className="flex gap-2">
          <input
            value={slug}
            onChange={(e) => setSlug(autoSlug(e.target.value))}
            placeholder="slug-do-link"
            className="h-9 flex-1 rounded-lg border border-zinc-200 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
          <select
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="h-9 rounded-lg border border-zinc-200 bg-white px-2 text-sm focus:border-primary focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          >
            {[15, 30, 45, 60, 90, 120].map((m) => (
              <option key={m} value={m}>{m} min</option>
            ))}
          </select>
        </div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descrição (opcional)"
          rows={2}
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        />
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-8 rounded-lg border border-zinc-200 px-3 text-xs text-zinc-600 dark:border-zinc-700"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending || !title.trim() || !slug.trim()}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground disabled:opacity-40"
          >
            {createMutation.isPending && <Loader2 className="h-3 w-3 animate-spin" />}
            Criar
          </button>
        </div>
      </div>
    </div>
  );
}

export function BookingLinkPanel() {
  const [creating, setCreating] = useState(false);

  const { data: links = [], isLoading } = useQuery({
    queryKey: ['booking-links'],
    queryFn: () => schedulingService.listBookingLinks(),
    staleTime: 30000,
  });

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-1 pb-3">
        <div className="flex items-center gap-2">
          <Link2 className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Links de Agendamento</h3>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="inline-flex h-7 items-center gap-1 rounded-lg bg-primary px-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-3.5 w-3.5" />
          Novo
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto">
        {creating && <CreateBookingLinkForm onClose={() => setCreating(false)} />}

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
          </div>
        ) : links.length === 0 && !creating ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 py-8 text-center dark:border-zinc-700">
            <Link2 className="mb-2 h-8 w-8 text-zinc-300 dark:text-zinc-600" />
            <p className="text-sm text-zinc-500">Nenhum link criado</p>
            <p className="mt-1 text-xs text-zinc-400">Crie links públicos para seus clientes agendarem</p>
          </div>
        ) : (
          links.map((link) => <BookingLinkCard key={link.id} link={link} />)
        )}
      </div>
    </div>
  );
}
