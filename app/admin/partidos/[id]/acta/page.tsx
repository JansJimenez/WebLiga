'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';

// -----------------------------------------------------------------------------
// TIPOS E INTERFACES DEL ACTA ARBITRAL
// -----------------------------------------------------------------------------

interface PlayerOption {
  id: string;
  dni: string;
  nombre_completo: string;
  numero_camiseta: number | null;
  posicion: string | null;
  club_id: string;
  habilitado: boolean;
  estado_medico: boolean;
  sancion_activa?: {
    motivo: string;
    fechas_suspension: number;
    fechas_cumplidas: number;
  } | null;
  amarillas_en_partido?: number;
}

interface MatchEventItem {
  id: string;
  tipo: 'GOL' | 'TARJETA_AMARILLA' | 'TARJETA_ROJA' | 'DOBLE_AMARILLA';
  minuto: number;
  equipo_id: string;
  nombre_equipo: string;
  jugador_id: string;
  nombre_jugador: string;
  motivo?: string;
}

interface MatchSheetData {
  id: string;
  torneo_nombre: string;
  estadio: string;
  fecha_hora: string;
  estado: 'PROGRAMADO' | 'EN_JUEGO' | 'FINALIZADO';
  goles_local: number;
  goles_visita: number;
  club_local: {
    id: string;
    nombre_oficial: string;
    nombre_corto: string;
    logo_url: string | null;
  };
  club_visita: {
    id: string;
    nombre_oficial: string;
    nombre_corto: string;
    logo_url: string | null;
  };
}

interface GoalFormData {
  equipo_id: string;
  jugador_id: string;
  minuto: number;
}

interface CardFormData {
  equipo_id: string;
  jugador_id: string;
  tipo: 'AMARILLA' | 'ROJA';
  minuto: number;
  motivo: string;
}

export default function MatchRefereeSheetPage({
  params,
}: {
  params: { id: string };
}) {
  const matchId = params?.id || 'demo-match-id';

  // Estados de interfaz y flujo
  const [activeTab, setActiveTab] = useState<'GOL' | 'TARJETA'>('GOL');
  const [isClosingModalOpen, setIsClosingModalOpen] = useState(false);
  const [refereePin, setRefereePin] = useState('');
  const [pinError, setPinError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    tipo: 'success' | 'error' | 'warning';
    texto: string;
  } | null>(null);

  // Datos simulados/conectables del partido
  const [matchData, setMatchData] = useState<MatchSheetData>({
    id: matchId,
    torneo_nombre: 'Torneo Apertura 2026 • Primera División',
    estadio: 'Estadio Municipal San Cristóbal',
    fecha_hora: '08 de Octubre, 15:30 hrs',
    estado: 'EN_JUEGO',
    goles_local: 1,
    goles_visita: 0,
    club_local: {
      id: 'club-loc-1',
      nombre_oficial: 'Club Deportivo Coronel Bolognesi',
      nombre_corto: 'Bolognesi',
      logo_url: null,
    },
    club_visita: {
      id: 'club-vis-2',
      nombre_oficial: 'Atlético Municipal Provincial',
      nombre_corto: 'Municipal',
      logo_url: null,
    },
  });

  // Lista de jugadores con estados médicos y sanciones
  const [playersList, setPlayersList] = useState<PlayerOption[]>([
    // Club Local
    {
      id: 'p-loc-1',
      dni: '70891234',
      nombre_completo: 'Carlos "El Tanque" Ramos',
      numero_camiseta: 9,
      posicion: 'Delantero',
      club_id: 'club-loc-1',
      habilitado: true,
      estado_medico: true,
      amarillas_en_partido: 0,
    },
    {
      id: 'p-loc-2',
      dni: '71928374',
      nombre_completo: 'Miguel Ángel Benítez',
      numero_camiseta: 10,
      posicion: 'Mediocampista',
      club_id: 'club-loc-1',
      habilitado: true,
      estado_medico: true,
      amarillas_en_partido: 1, // Ya tiene 1 amarilla
    },
    {
      id: 'p-loc-3',
      dni: '45892019',
      nombre_completo: 'Julio César Palomino',
      numero_camiseta: 4,
      posicion: 'Defensa',
      club_id: 'club-loc-1',
      habilitado: true,
      estado_medico: false, // Sin apto médico
    },
    {
      id: 'p-loc-4',
      dni: '76891029',
      nombre_completo: 'Sebastián Zúñiga',
      numero_camiseta: 8,
      posicion: 'Volante',
      club_id: 'club-loc-1',
      habilitado: true,
      estado_medico: true,
      sancion_activa: {
        motivo: 'Acumulación de 3 amarillas en la fecha anterior',
        fechas_suspension: 1,
        fechas_cumplidas: 0,
      },
    },

    // Club Visita
    {
      id: 'p-vis-1',
      dni: '73928172',
      nombre_completo: 'Diego Armando Farfán',
      numero_camiseta: 11,
      posicion: 'Delantero',
      club_id: 'club-vis-2',
      habilitado: true,
      estado_medico: true,
      amarillas_en_partido: 0,
    },
    {
      id: 'p-vis-2',
      dni: '47891234',
      nombre_completo: 'Luis Alberto Guadalupe',
      numero_camiseta: 5,
      posicion: 'Defensa Central',
      club_id: 'club-vis-2',
      habilitado: true,
      estado_medico: true,
      amarillas_en_partido: 0,
    },
    {
      id: 'p-vis-3',
      dni: '49827361',
      nombre_completo: 'Renzo Gastón Quiñónez',
      numero_camiseta: 7,
      posicion: 'Extremo',
      club_id: 'club-vis-2',
      habilitado: false, // Inhabilitado administrativamente
      estado_medico: true,
    },
    {
      id: 'p-vis-4',
      dni: '48291029',
      nombre_completo: 'Víctor Hugo Carrillo Jr.',
      numero_camiseta: 1,
      posicion: 'Arquero',
      club_id: 'club-vis-2',
      habilitado: true,
      estado_medico: true,
      amarillas_en_partido: 0,
    },
  ]);

  // Línea de tiempo de eventos registrados
  const [eventsTimeline, setEventsTimeline] = useState<MatchEventItem[]>([
    {
      id: 'ev-1',
      tipo: 'GOL',
      minuto: 24,
      equipo_id: 'club-loc-1',
      nombre_equipo: 'Bolognesi',
      jugador_id: 'p-loc-1',
      nombre_jugador: 'Carlos Ramos (Nº 9)',
    },
    {
      id: 'ev-2',
      tipo: 'TARJETA_AMARILLA',
      minuto: 38,
      equipo_id: 'club-loc-1',
      nombre_equipo: 'Bolognesi',
      jugador_id: 'p-loc-2',
      nombre_jugador: 'Miguel Ángel Benítez (Nº 10)',
      motivo: 'Falta táctica reiterada',
    },
  ]);

  // Formularios con react-hook-form
  const goalForm = useForm<GoalFormData>({
    defaultValues: {
      equipo_id: 'club-loc-1',
      jugador_id: '',
      minuto: 45,
    },
  });

  const cardForm = useForm<CardFormData>({
    defaultValues: {
      equipo_id: 'club-loc-1',
      jugador_id: '',
      tipo: 'AMARILLA',
      minuto: 45,
      motivo: 'Conducta antideportiva / Falta temeraria',
    },
  });

  // Observar equipo seleccionado en cada formulario
  const selectedGoalTeamId = goalForm.watch('equipo_id');
  const selectedGoalPlayerId = goalForm.watch('jugador_id');

  const selectedCardTeamId = cardForm.watch('equipo_id');
  const selectedCardPlayerId = cardForm.watch('jugador_id');
  const selectedCardType = cardForm.watch('tipo');

  // Jugador seleccionado actualmente para verificar alertas
  const currentGoalPlayer = playersList.find((p) => p.id === selectedGoalPlayerId);
  const currentCardPlayer = playersList.find((p) => p.id === selectedCardPlayerId);

  // ---------------------------------------------------------------------------
  // MANEJADORES DE SUBMIT (GOL Y TARJETA)
  // ---------------------------------------------------------------------------

  const onSubmitGoal = async (data: GoalFormData) => {
    if (matchData.estado === 'FINALIZADO') {
      setFeedbackMessage({
        tipo: 'error',
        texto: 'El acta está finalizada y es estrictamente inmutable.',
      });
      return;
    }

    const player = playersList.find((p) => p.id === data.jugador_id);
    if (!player) return;

    // Validación de alineación y habilitación
    if (!player.habilitado || !player.estado_medico || player.sancion_activa) {
      setFeedbackMessage({
        tipo: 'error',
        texto: `ALINEACIÓN INDEBIDA BLOQUEADA: El jugador ${player.nombre_completo} no está habilitado para disputar el encuentro.`,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulación de llamada POST /api/v1/matches/:id/goals
      const teamName =
        data.equipo_id === matchData.club_local.id
          ? matchData.club_local.nombre_corto
          : matchData.club_visita.nombre_corto;

      const newEvent: MatchEventItem = {
        id: `goal-${Date.now()}`,
        tipo: 'GOL',
        minuto: Number(data.minuto),
        equipo_id: data.equipo_id,
        nombre_equipo: teamName,
        jugador_id: data.jugador_id,
        nombre_jugador: `${player.nombre_completo} (Nº ${player.numero_camiseta || '-'})`,
      };

      setEventsTimeline((prev) => [...prev, newEvent]);

      // Actualizar marcador
      if (data.equipo_id === matchData.club_local.id) {
        setMatchData((prev) => ({ ...prev, goles_local: prev.goles_local + 1 }));
      } else {
        setMatchData((prev) => ({ ...prev, goles_visita: prev.goles_visita + 1 }));
      }

      setFeedbackMessage({
        tipo: 'success',
        texto: `¡GOL asentado con éxito! Minuto ${data.minuto}' para ${teamName} (${player.nombre_completo}).`,
      });
      goalForm.reset({ equipo_id: data.equipo_id, jugador_id: '', minuto: Number(data.minuto) });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitCard = async (data: CardFormData) => {
    if (matchData.estado === 'FINALIZADO') {
      setFeedbackMessage({
        tipo: 'error',
        texto: 'El acta está finalizada y es estrictamente inmutable.',
      });
      return;
    }

    const player = playersList.find((p) => p.id === data.jugador_id);
    if (!player) return;

    setIsSubmitting(true);
    try {
      const isSecondYellow = data.tipo === 'AMARILLA' && (player.amarillas_en_partido || 0) >= 1;
      const teamName =
        data.equipo_id === matchData.club_local.id
          ? matchData.club_local.nombre_corto
          : matchData.club_visita.nombre_corto;

      const eventType = isSecondYellow ? 'DOBLE_AMARILLA' : data.tipo === 'AMARILLA' ? 'TARJETA_AMARILLA' : 'TARJETA_ROJA';

      const newEvent: MatchEventItem = {
        id: `card-${Date.now()}`,
        tipo: eventType,
        minuto: Number(data.minuto),
        equipo_id: data.equipo_id,
        nombre_equipo: teamName,
        jugador_id: data.jugador_id,
        nombre_jugador: `${player.nombre_completo} (Nº ${player.numero_camiseta || '-'})`,
        motivo: data.motivo,
      };

      setEventsTimeline((prev) => [...prev, newEvent]);

      // Actualizar conteo de amarillas localmente
      if (data.tipo === 'AMARILLA') {
        setPlayersList((prev) =>
          prev.map((p) =>
            p.id === player.id
              ? { ...p, amarillas_en_partido: (p.amarillas_en_partido || 0) + 1 }
              : p
          )
        );
      }

      if (isSecondYellow) {
        setFeedbackMessage({
          tipo: 'warning',
          texto: `¡EXPULSIÓN POR DOBLE AMARILLA! ${player.nombre_completo} recibe su 2ª tarjeta y queda inhabilitado con sanción automática.`,
        });
      } else if (data.tipo === 'ROJA') {
        setFeedbackMessage({
          tipo: 'error',
          texto: `¡TARJETA ROJA DIRECTA! ${player.nombre_completo} expulsado en el minuto ${data.minuto}'. Sanción registrada.`,
        });
      } else {
        setFeedbackMessage({
          tipo: 'success',
          texto: `Tarjeta amarilla asentada en el acta arbitral (Minuto ${data.minuto}').`,
        });
      }

      cardForm.reset({
        equipo_id: data.equipo_id,
        jugador_id: '',
        tipo: 'AMARILLA',
        minuto: Number(data.minuto),
        motivo: 'Conducta antideportiva / Falta temeraria',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // CIERRE DE PARTIDO (POST /api/v1/matches/:id/close)
  // ---------------------------------------------------------------------------

  const handleCloseMatchConfirm = async () => {
    if (refereePin !== '1234') {
      setPinError('PIN arbitral inválido. Ingrese el código de 4 dígitos de la terna.');
      return;
    }

    setIsSubmitting(true);
    setPinError('');

    try {
      // Petición real o simulada: PATCH /api/v1/matches/:id/close
      await new Promise((r) => setTimeout(r, 600));

      setMatchData((prev) => ({ ...prev, estado: 'FINALIZADO' }));
      setIsClosingModalOpen(false);
      setFeedbackMessage({
        tipo: 'success',
        texto:
          '¡ACTA SELLADA CON ÉXITO! El partido ha finalizado y el acta es INMUTABLE. La tabla de posiciones ha sido recalculada automáticamente.',
      });
    } catch (e) {
      setPinError('Error de red al sincronizar con el servidor de la Liga.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isMatchClosed = matchData.estado === 'FINALIZADO';

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* BARRA SUPERIOR DE AUDITORÍA ARBITRAL */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/90 border border-zinc-800 rounded-2xl px-5 py-3 shadow-lg">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-widest">
              Panel de Mesa de Control & Terna Arbitral
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-400">Estado del Acta:</span>
            <span
              className={`px-3 py-1 rounded-full font-black text-xs ${
                isMatchClosed
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse'
              }`}
            >
              {matchData.estado}
            </span>
          </div>
        </div>

        {/* FEEDBACK ALERT BANNER */}
        {feedbackMessage && (
          <div
            className={`p-4 rounded-xl text-sm font-semibold flex items-center justify-between border shadow-lg transition-all ${
              feedbackMessage.tipo === 'success'
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80'
                : feedbackMessage.tipo === 'warning'
                ? 'bg-amber-950/80 text-amber-300 border-amber-700/80'
                : 'bg-rose-950/80 text-rose-300 border-rose-700/80'
            }`}
          >
            <span>{feedbackMessage.texto}</span>
            <button
              onClick={() => setFeedbackMessage(null)}
              className="text-xs underline hover:opacity-80 ml-3"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* MARCADOR EN VIVO (SCOREBOARD) */}
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-amber-500 to-emerald-500" />
          <div className="text-center mb-4">
            <p className="text-xs uppercase tracking-widest font-bold text-zinc-400">
              {matchData.torneo_nombre}
            </p>
            <p className="text-[11px] text-zinc-400">{matchData.estadio} • {matchData.fecha_hora}</p>
          </div>

          <div className="grid grid-cols-7 items-center text-center">
            {/* Club Local */}
            <div className="col-span-3 flex flex-col items-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-zinc-800 border-2 border-emerald-500/40 flex items-center justify-center font-black text-xl text-emerald-400 shadow-xl mb-2">
                {matchData.club_local.nombre_corto.substring(0, 3)}
              </div>
              <h2 className="text-sm sm:text-lg font-black text-white leading-tight">
                {matchData.club_local.nombre_oficial}
              </h2>
              <span className="text-xs text-emerald-400 font-bold uppercase mt-0.5">LOCAL</span>
            </div>

            {/* Score */}
            <div className="col-span-1 flex flex-col items-center">
              <div className="flex items-center gap-2 sm:gap-4 font-mono font-black text-4xl sm:text-6xl text-white">
                <span className="bg-zinc-800/80 px-3 py-1.5 rounded-2xl border border-zinc-700">
                  {matchData.goles_local}
                </span>
                <span className="text-zinc-600 text-3xl">-</span>
                <span className="bg-zinc-800/80 px-3 py-1.5 rounded-2xl border border-zinc-700">
                  {matchData.goles_visita}
                </span>
              </div>
              <span className="mt-2 text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                {isMatchClosed ? 'Finalizado' : 'Tiempo Oficial'}
              </span>
            </div>

            {/* Club Visita */}
            <div className="col-span-3 flex flex-col items-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-zinc-800 border-2 border-blue-500/40 flex items-center justify-center font-black text-xl text-blue-400 shadow-xl mb-2">
                {matchData.club_visita.nombre_corto.substring(0, 3)}
              </div>
              <h2 className="text-sm sm:text-lg font-black text-white leading-tight">
                {matchData.club_visita.nombre_oficial}
              </h2>
              <span className="text-xs text-blue-400 font-bold uppercase mt-0.5">VISITANTE</span>
            </div>
          </div>
        </div>

        {/* ALERTA DE JUGADORES INHABILITADOS EN EL PARTIDO */}
        <div className="bg-rose-950/20 border border-rose-900/60 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>Alerta de Alineación Indebida • Jugadores Bloqueados por la Liga</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
            {playersList
              .filter((p) => !p.habilitado || !p.estado_medico || p.sancion_activa)
              .map((p) => (
                <div
                  key={p.id}
                  className="bg-zinc-900/90 border border-rose-800/40 rounded-xl p-2.5 flex flex-col justify-between"
                >
                  <div>
                    <span className="font-bold text-white block truncate">{p.nombre_completo}</span>
                    <span className="text-[10px] text-zinc-400 block">DNI: {p.dni}</span>
                  </div>
                  <span className="mt-1 inline-block text-[10px] font-black uppercase text-rose-400 bg-rose-950 px-2 py-0.5 rounded">
                    {p.sancion_activa
                      ? 'SUSPENDIDO POR SANCIÓN'
                      : !p.estado_medico
                      ? 'SIN APTO MÉDICO'
                      : 'INHABILITADO ADMIN.'}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* CUERPO PRINCIPAL: FORMULARIOS DE REGISTRO & LÍNEA DE TIEMPO */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* COLUMNA IZQUIERDA: FORMULARIOS (7 COLS) */}
          <div className="lg:col-span-7 bg-zinc-900 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xl">
            {/* TABS DE SELECCIÓN: REGISTRAR GOL / TARJETA */}
            <div className="flex gap-2 p-1.5 bg-zinc-950 rounded-2xl mb-6 border border-zinc-800">
              <button
                type="button"
                onClick={() => setActiveTab('GOL')}
                disabled={isMatchClosed}
                className={`flex-1 py-3 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'GOL'
                    ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                    : 'text-zinc-400 hover:text-white'
                } ${isMatchClosed ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span>⚽</span> REGISTRAR GOL
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('TARJETA')}
                disabled={isMatchClosed}
                className={`flex-1 py-3 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'TARJETA'
                    ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                    : 'text-zinc-400 hover:text-white'
                } ${isMatchClosed ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span>🟨🟥</span> REGISTRAR TARJETA
              </button>
            </div>

            {isMatchClosed ? (
              <div className="text-center py-12 px-4 bg-zinc-950/60 rounded-2xl border border-zinc-800">
                <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-3 font-black text-xl">
                  🔒
                </div>
                <h3 className="text-base font-bold text-white mb-1">Acta Cerrada e Inmutable</h3>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  El partido ha sido finalizado. Para cualquier rectificación o reclamo se debe emitir un recurso formal ante el Tribunal de Disciplina de la Liga.
                </p>
              </div>
            ) : (
              <>
                {/* ------------------------------------------------------------- */}
                {/* FORMULARIO 1: REGISTRAR GOL                                   */}
                {/* ------------------------------------------------------------- */}
                {activeTab === 'GOL' && (
                  <form onSubmit={goalForm.handleSubmit(onSubmitGoal)} className="space-y-4">
                    {/* Selector de Equipo */}
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                        1. Seleccionar Equipo Anotador
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <label
                          className={`p-3.5 rounded-2xl border cursor-pointer flex items-center gap-3 transition-all ${
                            selectedGoalTeamId === matchData.club_local.id
                              ? 'bg-emerald-950/30 border-emerald-500 text-white'
                              : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                          }`}
                        >
                          <input
                            type="radio"
                            value={matchData.club_local.id}
                            {...goalForm.register('equipo_id')}
                            className="text-emerald-500 focus:ring-emerald-500"
                          />
                          <span className="font-bold text-xs sm:text-sm">
                            {matchData.club_local.nombre_oficial} (Local)
                          </span>
                        </label>

                        <label
                          className={`p-3.5 rounded-2xl border cursor-pointer flex items-center gap-3 transition-all ${
                            selectedGoalTeamId === matchData.club_visita.id
                              ? 'bg-blue-950/30 border-blue-500 text-white'
                              : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                          }`}
                        >
                          <input
                            type="radio"
                            value={matchData.club_visita.id}
                            {...goalForm.register('equipo_id')}
                            className="text-blue-500 focus:ring-blue-500"
                          />
                          <span className="font-bold text-xs sm:text-sm">
                            {matchData.club_visita.nombre_oficial} (Visita)
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Selector de Jugador */}
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                        2. Futbolista Autor del Gol
                      </label>
                      <select
                        {...goalForm.register('jugador_id', { required: true })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      >
                        <option value="">-- Seleccionar jugador de la planilla --</option>
                        {playersList
                          .filter((p) => p.club_id === selectedGoalTeamId)
                          .map((p) => {
                            const isBlocked = !p.habilitado || !p.estado_medico || !!p.sancion_activa;
                            return (
                              <option key={p.id} value={p.id} disabled={isBlocked}>
                                {isBlocked ? '🚫 [INHABILITADO] ' : ''}
                                Nº {p.numero_camiseta || '-'} • {p.nombre_completo} ({p.posicion})
                              </option>
                            );
                          })}
                      </select>

                      {/* Alerta si el jugador seleccionado tiene advertencia */}
                      {currentGoalPlayer &&
                        (!currentGoalPlayer.habilitado ||
                          !currentGoalPlayer.estado_medico ||
                          currentGoalPlayer.sancion_activa) && (
                          <div className="mt-2 p-3 bg-rose-950/80 border border-rose-800 text-rose-300 text-xs rounded-xl flex items-center gap-2">
                            <span>⚠️</span>
                            <span>
                              <strong>Advertencia:</strong> Este jugador no puede ser registrado por
                              inhabilitación deportiva.
                            </span>
                          </div>
                        )}
                    </div>

                    {/* Minuto del Gol */}
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                        3. Minuto de Juego (1' a 90'+)
                      </label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="number"
                          min="1"
                          max="130"
                          {...goalForm.register('minuto', { required: true, min: 1, max: 130 })}
                          className="w-28 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-center text-lg font-mono font-black text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                        <span className="text-sm text-zinc-400 font-bold">Minutos</span>

                        {/* Botones de Minuto Rápido */}
                        <div className="flex gap-1.5 ml-auto flex-wrap">
                          {[15, 30, 45, 60, 75, 90].map((m) => (
                            <button
                              key={m}
                              type="button"
                              onClick={() => goalForm.setValue('minuto', m)}
                              className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs font-mono font-bold text-zinc-300 transition-colors"
                            >
                              {m}'
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Botón de Enviar Gol */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full mt-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm py-4 rounded-2xl shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                    >
                      <span className="text-base">⚽</span>
                      {isSubmitting ? 'Asentando en Acta...' : 'REGISTRAR GOL OFICIAL (+1)'}
                    </button>
                  </form>
                )}

                {/* ------------------------------------------------------------- */}
                {/* FORMULARIO 2: REGISTRAR TARJETA                               */}
                {/* ------------------------------------------------------------- */}
                {activeTab === 'TARJETA' && (
                  <form onSubmit={cardForm.handleSubmit(onSubmitCard)} className="space-y-4">
                    {/* Selector de Equipo */}
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                        1. Seleccionar Equipo del Infractor
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <label
                          className={`p-3.5 rounded-2xl border cursor-pointer flex items-center gap-3 transition-all ${
                            selectedCardTeamId === matchData.club_local.id
                              ? 'bg-amber-950/30 border-amber-500 text-white'
                              : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                          }`}
                        >
                          <input
                            type="radio"
                            value={matchData.club_local.id}
                            {...cardForm.register('equipo_id')}
                            className="text-amber-500 focus:ring-amber-500"
                          />
                          <span className="font-bold text-xs sm:text-sm">
                            {matchData.club_local.nombre_corto} (Local)
                          </span>
                        </label>

                        <label
                          className={`p-3.5 rounded-2xl border cursor-pointer flex items-center gap-3 transition-all ${
                            selectedCardTeamId === matchData.club_visita.id
                              ? 'bg-amber-950/30 border-amber-500 text-white'
                              : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                          }`}
                        >
                          <input
                            type="radio"
                            value={matchData.club_visita.id}
                            {...cardForm.register('equipo_id')}
                            className="text-amber-500 focus:ring-amber-500"
                          />
                          <span className="font-bold text-xs sm:text-sm">
                            {matchData.club_visita.nombre_corto} (Visita)
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Selector de Tipo de Tarjeta */}
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                        2. Tipo de Tarjeta Disciplinaria
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <label
                          className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-center gap-2 font-black text-sm transition-all ${
                            selectedCardType === 'AMARILLA'
                              ? 'bg-amber-400 text-black border-amber-300 shadow-lg shadow-amber-400/20'
                              : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                          }`}
                        >
                          <input
                            type="radio"
                            value="AMARILLA"
                            {...cardForm.register('tipo')}
                            className="sr-only"
                          />
                          <span className="w-3.5 h-5 bg-amber-400 rounded-sm border border-black/40 inline-block" />
                          <span>AMARILLA</span>
                        </label>

                        <label
                          className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-center gap-2 font-black text-sm transition-all ${
                            selectedCardType === 'ROJA'
                              ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-600/30'
                              : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                          }`}
                        >
                          <input
                            type="radio"
                            value="ROJA"
                            {...cardForm.register('tipo')}
                            className="sr-only"
                          />
                          <span className="w-3.5 h-5 bg-rose-600 rounded-sm border border-black/40 inline-block" />
                          <span>ROJA DIRECTA</span>
                        </label>
                      </div>
                    </div>

                    {/* Selector de Jugador */}
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                        3. Futbolista Amonestado / Expulsado
                      </label>
                      <select
                        {...cardForm.register('jugador_id', { required: true })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      >
                        <option value="">-- Seleccionar jugador --</option>
                        {playersList
                          .filter((p) => p.club_id === selectedCardTeamId)
                          .map((p) => (
                            <option key={p.id} value={p.id}>
                              Nº {p.numero_camiseta || '-'} • {p.nombre_completo}
                              {(p.amarillas_en_partido || 0) > 0 ? ' [🟨 Ya tiene 1 amarilla]' : ''}
                            </option>
                          ))}
                      </select>

                      {/* Notificación si es segunda amarilla */}
                      {currentCardPlayer && (currentCardPlayer.amarillas_en_partido || 0) >= 1 && (
                        <div className="mt-2 p-3 bg-amber-950/80 border border-amber-600 text-amber-200 text-xs rounded-xl flex items-center gap-2">
                          <span className="text-base">⚠️</span>
                          <span>
                            <strong>¡ATENCIÓN!</strong> Este jugador ya registra 1 tarjeta amarilla previa.
                            Si se confirma otra amarilla, se procesará automáticamente como <strong>DOBLE AMARILLA (EXPULSIÓN)</strong> con sanción para la siguiente fecha.
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Minuto y Motivo */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                          Minuto (1' - 90'+)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="130"
                          {...cardForm.register('minuto', { required: true })}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-center text-lg font-mono font-black text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                          Motivo Tipificado
                        </label>
                        <input
                          type="text"
                          placeholder="Ej. Juego brusco grave, insultos, reclamo..."
                          {...cardForm.register('motivo', { required: true })}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Botón de Enviar Tarjeta */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full mt-4 bg-amber-500 hover:bg-amber-400 text-black font-black text-sm py-4 rounded-2xl shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                    >
                      <span className="text-base">🟨</span>
                      {isSubmitting ? 'Asentando en Acta...' : 'ASENTAR SANCIÓN EN ACTA'}
                    </button>
                  </form>
                )}
              </>
            )}
          </div>

          {/* COLUMNA DERECHA: CRONOLOGÍA DE EVENTOS & CIERRE (5 COLS) */}
          <div className="lg:col-span-5 space-y-6">
            {/* LÍNEA DE TIEMPO DEL PARTIDO */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-3">
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <span>⏱️</span> Incidencias Registradas ({eventsTimeline.length})
                </h3>
                <span className="text-[10px] text-zinc-400 uppercase font-mono">Oficial</span>
              </div>

              {eventsTimeline.length === 0 ? (
                <p className="text-center py-8 text-xs text-zinc-400">
                  No se han registrado incidencias en el encuentro todavía.
                </p>
              ) : (
                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {eventsTimeline.map((ev) => (
                    <div
                      key={ev.id}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 text-xs"
                    >
                      <span className="w-9 h-9 rounded-xl bg-zinc-800 font-mono font-black text-emerald-400 flex items-center justify-center flex-shrink-0 text-xs border border-zinc-700">
                        {ev.minuto}'
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 font-bold text-white">
                          <span>
                            {ev.tipo === 'GOL'
                              ? '⚽ Gol de'
                              : ev.tipo === 'TARJETA_AMARILLA'
                              ? '🟨 Tarjeta Amarilla'
                              : ev.tipo === 'DOBLE_AMARILLA'
                              ? '🟨🟥 Doble Amarilla (Expulsión)'
                              : '🟥 Tarjeta Roja Directa'}
                          </span>
                          <span className="text-zinc-400 font-normal">({ev.nombre_equipo})</span>
                        </div>
                        <p className="text-zinc-300 truncate">{ev.nombre_jugador}</p>
                        {ev.motivo && (
                          <p className="text-[10px] text-zinc-400 italic truncate">{ev.motivo}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* BOTÓN FINAL DE CIERRE DE ACTA */}
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-5 shadow-xl">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Finalización del Encuentro
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                Una vez completados los 90 minutos y tiempos adicionales, la terna arbitral debe sellar el acta digital. Esta acción es <strong>irreversible</strong> y recalcula la tabla de posiciones en tiempo real.
              </p>

              <button
                type="button"
                disabled={isMatchClosed || isSubmitting}
                onClick={() => setIsClosingModalOpen(true)}
                className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
                  isMatchClosed
                    ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed border border-zinc-700'
                    : 'bg-rose-600 hover:bg-rose-500 text-white shadow-xl shadow-rose-600/30'
                }`}
              >
                <span>🔒</span>
                {isMatchClosed ? 'ACTA CERRADA E INMUTABLE' : 'CERRAR Y APROBAR ACTA DE PARTIDO'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* MODAL DE CONFIRMACIÓN DE CIERRE FORMAL DEL ACTA                       */}
      {/* --------------------------------------------------------------------- */}
      {isClosingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 flex items-center justify-center text-2xl mb-4 mx-auto">
              ⚠️
            </div>

            <h3 className="text-xl font-black text-white text-center uppercase tracking-tight mb-2">
              ¿Cerrar y Sellar Acta Oficial?
            </h3>

            <p className="text-xs text-zinc-300 text-center leading-relaxed mb-5">
              Marcador definitivo:{' '}
              <strong className="text-white">
                {matchData.club_local.nombre_corto} {matchData.goles_local} -{' '}
                {matchData.goles_visita} {matchData.club_visita.nombre_corto}
              </strong>
              .<br />
              Al aprobar esta acción, el acta pasará a estado <strong>FINALIZADO</strong> y se
              activará la regla de <strong>inmutabilidad de datos</strong>. Se aplicarán las
              sanciones automáticas y se actualizará la tabla de posiciones general.
            </p>

            <div className="space-y-3 mb-6">
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider text-center">
                Ingrese PIN de Validación Arbitral (Demo: 1234)
              </label>
              <input
                type="password"
                maxLength={4}
                value={refereePin}
                onChange={(e) => setRefereePin(e.target.value)}
                placeholder="****"
                className="w-36 mx-auto block bg-zinc-950 border border-zinc-700 rounded-xl py-3 text-center text-2xl font-mono tracking-widest text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              {pinError && (
                <p className="text-xs text-rose-400 text-center font-semibold">{pinError}</p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsClosingModalOpen(false);
                  setPinError('');
                }}
                className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleCloseMatchConfirm}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-lg shadow-rose-600/30 transition-colors"
              >
                {isSubmitting ? 'Procesando...' : 'CONFIRMAR CIERRE'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
