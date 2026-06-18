'use client';

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  CalendarDays,
  List,
  Link2,
  RefreshCw,
  Calendar,
} from 'lucide-react';
import { schedulingService, type Appointment } from '../services/scheduling.service';
import { CalendarWeekView } from './calendar-week-view';
import { AppointmentDialog } from './appointment-dialog';
import { BookingLinkPanel } from './booking-link-panel';
import { GoogleCalendarConnect } from './google-calendar-connect';

type View = 'week' | 'list';

const STATUS_PILL: Record<string, string> = {
  SCHEDULED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  CONFIRMED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  COMPLETED: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
  CANCELLED: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  NO_SHOW: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};
const STATUS_LABEL: Record<string, string> = {
  SCHEDULED: 'Agendado',
  CONFIRMED: 'Confirmado',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
  NO_SHOW: 'Não compareceu',
};

function getWeekLabel(anchor: Date): string {
  const monday = new Date(anchor);
  const day = anchor.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  monday.setDate(anchor.getDate() + diff);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  const sameMonth = monday.getMonth() === sunday.getMonth();
  if (sameMonth) {
    return `${monday.getDate()} – ${sunday.getDate()} de ${months[monday.getMonth()]} ${monday.getFullYear()}`;
  }
  return `${monday.getDate()} ${months[monday.getMonth()]} – ${sunday.getDate()} ${months[sunday.getMonth()]} ${sunday.getFullYear()}`;
}

function getWeekRange(anchor: Date): { from: string; to: string } {
  const monday = new Date(anchor);
  const day = anchor.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  monday.setDate(anchor.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { from: monday.toISOString(), to: sunday.toISOString() };
}

export function SchedulingPage() {
  const [view, setView] = useState<View>('week');
  const [weekAnchor, setWeekAnchor] = useState(() => new Date());
  const [showBookingLinks, setShowBookingLinks] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [defaultStartsAt, setDefaultStartsAt] = useState<string | undefined>();

  const range = getWeekRange(weekAnchor);

  const { data: appointments = [], isLoading, refetch } = useQuery({
    queryKey: ['appointments', range.from, range.to],
    queryFn: () => schedulingService.listAppointments({ from: range.from, to: range.to }),
    staleTime: 15000,
  });

  const handleSlotClick = useCallback((startsAt: string) => {
    setDefaultStartsAt(startsAt);
    setSelectedAppointment(null);
    setDialogOpen(true);
  }, []);

  const handleAppointmentClick = useCallback((a: Appointment) => {
    setSelectedAppointment(a);
    setDefaultStartsAt(undefined);
    setDialogOpen(true);
  }, []);

  const handleNewAppointment = () => {
    setSelectedAppointment(null);
    setDefaultStartsAt(new Date().toISOString());
    setDialogOpen(true);
  };

  const prevWeek = () => {
    setWeekAnchor((d) => {
      const next = new Date(d);
      next.setDate(d.getDate() - 7);
      return next;
    });
  };

  const nextWeek = () => {
    setWeekAnchor((d) => {
      const next = new Date(d);
      next.setDate(d.getDate() + 7);
      return next;
    });
  };

  const today = () => setWeekAnchor(new Date());

  return (
    <div className="flex h-full flex-col gap-0">
      {/* Toolbar */}
      <div className="flex shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <CalendarDays className="h-5 w-5 text-primary" />
            <h1 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Agenda</h1>
          </div>

          {/* Week navigation */}
          <div className="flex items-center gap-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
            <button
              onClick={prevWeek}
              className="flex h-7 w-7 items-center justify-center rounded-l-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={today}
              className="h-7 px-2 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Hoje
            </button>
            <button
              onClick={nextWeek}
              className="flex h-7 w-7 items-center justify-center rounded-r-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            {getWeekLabel(weekAnchor)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh */}
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          {/* View toggle */}
          <div className="flex rounded-lg border border-zinc-200 dark:border-zinc-700">
            <button
              onClick={() => setView('week')}
              className={`flex h-8 w-8 items-center justify-center rounded-l-lg transition-colors ${
                view === 'week'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`flex h-8 w-8 items-center justify-center rounded-r-lg transition-colors ${
                view === 'list'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Booking links */}
          <button
            onClick={() => setShowBookingLinks((v) => !v)}
            className={`flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-colors ${
              showBookingLinks
                ? 'border-primary bg-primary/10 text-primary dark:bg-primary/20'
                : 'border-zinc-200 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800'
            }`}
          >
            <Link2 className="h-3.5 w-3.5" />
            Links
          </button>

          {/* New appointment */}
          <button
            onClick={handleNewAppointment}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-3.5 w-3.5" />
            Novo agendamento
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-hidden p-4">
          {/* Google Calendar connect bar */}
          <div className="mb-3">
            <GoogleCalendarConnect />
          </div>

          {view === 'week' ? (
            <div className="flex-1 overflow-hidden">
              <CalendarWeekView
                weekAnchor={weekAnchor}
                appointments={appointments}
                onSlotClick={handleSlotClick}
                onAppointmentClick={handleAppointmentClick}
              />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <ListView
                appointments={appointments}
                isLoading={isLoading}
                onAppointmentClick={handleAppointmentClick}
              />
            </div>
          )}
        </div>

        {/* Booking links panel */}
        {showBookingLinks && (
          <div className="w-80 shrink-0 overflow-y-auto border-l border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <BookingLinkPanel />
          </div>
        )}
      </div>

      {/* Appointment dialog */}
      {dialogOpen && (
        <AppointmentDialog
          appointment={selectedAppointment}
          defaultStartsAt={defaultStartsAt}
          onClose={() => setDialogOpen(false)}
        />
      )}
    </div>
  );
}

// ─── List View ──────────────────────────────────────────────────────────────

function ListView({
  appointments,
  isLoading,
  onAppointmentClick,
}: {
  appointments: Appointment[];
  isLoading: boolean;
  onAppointmentClick: (a: Appointment) => void;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-5 w-5 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 py-16 text-center dark:border-zinc-700">
        <CalendarDays className="mb-3 h-10 w-10 text-zinc-300 dark:text-zinc-600" />
        <p className="text-sm text-zinc-500">Nenhum agendamento nesta semana</p>
        <p className="mt-1 text-xs text-zinc-400">Clique em "Novo agendamento" para criar um</p>
      </div>
    );
  }

  const sorted = [...appointments].sort(
    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
  );

  const grouped: Record<string, Appointment[]> = {};
  for (const a of sorted) {
    const key = new Date(a.startsAt).toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(a);
  }

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([day, appts]) => (
        <div key={day}>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            {day}
          </h3>
          <div className="space-y-2">
            {appts.map((a) => {
              const start = new Date(a.startsAt);
              const end = new Date(a.endsAt);
              const timeStr = `${start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} – ${end.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
              return (
                <button
                  key={a.id}
                  onClick={() => onAppointmentClick(a)}
                  className="flex w-full items-start gap-3 rounded-xl border border-zinc-200 bg-white p-3 text-left shadow-sm transition-shadow hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900"
                >
                  <div className="flex w-20 shrink-0 flex-col items-center justify-center rounded-lg border border-zinc-100 bg-zinc-50 py-2 text-xs dark:border-zinc-700 dark:bg-zinc-800">
                    <span className="font-bold text-zinc-700 dark:text-zinc-300">
                      {start.getDate()}
                    </span>
                    <span className="text-zinc-400">
                      {start.toLocaleDateString('pt-BR', { month: 'short' })}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {a.title}
                      </span>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_PILL[a.status]}`}>
                        {STATUS_LABEL[a.status]}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-zinc-500">{timeStr}</p>
                    {a.contactName && (
                      <p className="mt-0.5 text-xs text-zinc-400">{a.contactName}</p>
                    )}
                  </div>
                  {a.meetLink && (
                    <span className="shrink-0 text-sm" title="Google Meet">📹</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
