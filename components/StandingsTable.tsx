'use client';

import React, { useState } from 'react';
import Image from 'next/image';

export interface StandingsRow {
  posicion: number;
  club_id: string;
  nombre_club: string;
  nombre_corto: string;
  logo_url: string | null;
  pj: number; // Partidos Jugados
  pg: number; // Partidos Ganados
  pe: number; // Partidos Empatados
  pp: number; // Partidos Perdidos
  gf: number; // Goles a Favor
  gc: number; // Goles en Contra
  dg: number; // Diferencia de Goles
  puntos: number; // Puntos Totales
}

export interface CategoryTab {
  id: string;
  nombre: string;
  temporada: string;
}

interface StandingsTableProps {
  initialStandings: StandingsRow[];
  categories?: CategoryTab[];
  activeCategoryId?: string;
  onCategoryChange?: (categoryId: string) => void;
  lastUpdated?: string;
}

export const StandingsTable: React.FC<StandingsTableProps> = ({
  initialStandings,
  categories = [
    { id: 'cat-primera', nombre: 'Primera División', temporada: 'Apertura 2026' },
    { id: 'cat-ascenso', nombre: 'Segunda División', temporada: 'Temporada 2026' },
    { id: 'cat-sub17', nombre: 'Juvenil Sub-17', temporada: 'Torneo Formativo' },
    { id: 'cat-femenino', nombre: 'Fútbol Femenino', temporada: 'Clausura 2026' },
  ],
  activeCategoryId = 'cat-primera',
  onCategoryChange,
  lastUpdated = 'Hace 5 minutos (Oficial)',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(activeCategoryId);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'compact' | 'detailed'>('detailed');

  const handleTabClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    if (onCategoryChange) {
      onCategoryChange(categoryId);
    }
  };

  const filteredStandings = initialStandings.filter((row) =>
    row.nombre_club.toLowerCase().includes(searchQuery.toLowerCase()) ||
    row.nombre_corto.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Helper para identificar la zona de clasificación según la posición
  const getZoneStyle = (pos: number) => {
    if (pos <= 2) {
      return {
        borderColor: 'border-l-emerald-500',
        badgeBg: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
        label: 'Clasificación Directa (Liguilla)',
      };
    }
    if (pos <= 4) {
      return {
        borderColor: 'border-l-blue-500',
        badgeBg: 'bg-blue-500/10 text-blue-400 border border-blue-500/30',
        label: 'Playoff / Repechaje',
      };
    }
    if (pos >= 11) {
      return {
        borderColor: 'border-l-rose-500',
        badgeBg: 'bg-rose-500/10 text-rose-400 border border-rose-500/30',
        label: 'Zona de Descenso',
      };
    }
    return {
      borderColor: 'border-l-transparent',
      badgeBg: 'bg-zinc-800 text-zinc-400 border border-zinc-700/50',
      label: '',
    };
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* 1. HEADER Y TABS DE CATEGORÍAS */}
      <div className="bg-zinc-900/80 backdrop-blur-md rounded-2xl border border-zinc-800 p-4 sm:p-6 shadow-xl shadow-black/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5" />
                Oficial • Temporada 2026
              </span>
              <span className="text-xs text-zinc-400 hidden sm:inline">
                Actualizado: {lastUpdated}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase italic">
              Tabla de Posiciones
            </h1>
          </div>

          {/* Selector de Modo de Vista (Móvil/Desktop) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('detailed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'detailed'
                  ? 'bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/20'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
              }`}
            >
              Completa
            </button>
            <button
              onClick={() => setViewMode('compact')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'compact'
                  ? 'bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/20'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
              }`}
            >
              Compacta
            </button>
          </div>
        </div>

        {/* Barra de Pestañas / Tabs con Scroll Horizontal Móvil */}
        <div className="flex overflow-x-auto pb-2 scrollbar-none gap-2 border-b border-zinc-800">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleTabClick(cat.id)}
                className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex flex-col items-start ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-black shadow-lg shadow-emerald-500/20 font-bold scale-[1.02]'
                    : 'bg-zinc-800/60 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'
                }`}
              >
                <span>{cat.nombre}</span>
                <span className={`text-[10px] ${isActive ? 'text-black/80 font-medium' : 'text-zinc-400'}`}>
                  {cat.temporada}
                </span>
              </button>
            );
          })}
        </div>

        {/* Buscador de Club */}
        <div className="mt-4 flex items-center justify-between gap-4">
          <div className="relative w-full max-w-xs">
            <input
              type="text"
              placeholder="Buscar club..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-3.5 py-2 pl-9 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
            />
            <svg
              className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="text-xs text-zinc-400 hidden sm:block">
            {filteredStandings.length} clubes en competencia
          </div>
        </div>
      </div>

      {/* 2. TABLA RESPONSIVA DE POSICIONES */}
      <div className="bg-zinc-900/90 backdrop-blur-md rounded-2xl border border-zinc-800 shadow-2xl shadow-black/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            {/* ENCABEZADOS DE COLUMNA */}
            <thead>
              <tr className="bg-zinc-950/90 text-[11px] uppercase tracking-wider text-zinc-400 border-b border-zinc-800 font-bold">
                <th className="py-3.5 px-3 text-center w-12">#</th>
                <th className="py-3.5 px-3 min-w-[170px] sm:min-w-[220px]">Club</th>
                <th className="py-3.5 px-2.5 text-center font-semibold" title="Partidos Jugados">PJ</th>
                {viewMode === 'detailed' && (
                  <>
                    <th className="py-3.5 px-2 text-center text-zinc-400 hidden sm:table-cell" title="Partidos Ganados">PG</th>
                    <th className="py-3.5 px-2 text-center text-zinc-400 hidden sm:table-cell" title="Partidos Empatados">PE</th>
                    <th className="py-3.5 px-2 text-center text-zinc-400 hidden sm:table-cell" title="Partidos Perdidos">PP</th>
                    <th className="py-3.5 px-2 text-center text-zinc-400 hidden md:table-cell" title="Goles a Favor">GF</th>
                    <th className="py-3.5 px-2 text-center text-zinc-400 hidden md:table-cell" title="Goles en Contra">GC</th>
                  </>
                )}
                <th className="py-3.5 px-2.5 text-center font-semibold" title="Diferencia de Goles">DG</th>
                <th className="py-3.5 px-4 text-center font-black text-emerald-400 bg-emerald-950/20" title="Puntos Totales">
                  PTS
                </th>
              </tr>
            </thead>

            {/* CUERPO DE LA TABLA */}
            <tbody className="divide-y divide-zinc-800/60 text-sm">
              {filteredStandings.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-zinc-500">
                    No se encontraron clubes para el criterio de búsqueda.
                  </td>
                </tr>
              ) : (
                filteredStandings.map((row) => {
                  const zone = getZoneStyle(row.posicion);
                  const isTopOne = row.posicion === 1;

                  return (
                    <tr
                      key={row.club_id}
                      className={`hover:bg-zinc-800/40 transition-colors border-l-4 ${zone.borderColor} ${
                        isTopOne ? 'bg-emerald-950/10' : ''
                      }`}
                    >
                      {/* POSICIÓN */}
                      <td className="py-3 px-3 text-center font-black">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                            isTopOne
                              ? 'bg-amber-400 text-black font-extrabold shadow-md shadow-amber-400/30'
                              : zone.badgeBg
                          }`}
                        >
                          {row.posicion}
                        </span>
                      </td>

                      {/* CLUB (ESCUDO + NOMBRE) */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-zinc-800 border border-zinc-700/80 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-inner">
                            {row.logo_url ? (
                              <img
                                src={row.logo_url}
                                alt={row.nombre_corto}
                                className="w-full h-full object-contain p-0.5"
                              />
                            ) : (
                              <span className="text-[10px] font-black text-zinc-400 uppercase">
                                {row.nombre_corto.substring(0, 2)}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-white text-xs sm:text-sm truncate">
                              {row.nombre_oficial}
                            </p>
                            <p className="text-[10px] text-zinc-400 uppercase tracking-wider block sm:hidden">
                              {row.nombre_corto}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* PARTIDOS JUGADOS */}
                      <td className="py-3 px-2.5 text-center font-medium text-zinc-300 text-xs sm:text-sm">
                        {row.pj}
                      </td>

                      {/* ESTADÍSTICAS DETALLADAS */}
                      {viewMode === 'detailed' && (
                        <>
                          <td className="py-3 px-2 text-center text-zinc-400 text-xs hidden sm:table-cell font-mono">
                            {row.pg}
                          </td>
                          <td className="py-3 px-2 text-center text-zinc-400 text-xs hidden sm:table-cell font-mono">
                            {row.pe}
                          </td>
                          <td className="py-3 px-2 text-center text-zinc-400 text-xs hidden sm:table-cell font-mono">
                            {row.pp}
                          </td>
                          <td className="py-3 px-2 text-center text-zinc-400 text-xs hidden md:table-cell font-mono">
                            {row.gf}
                          </td>
                          <td className="py-3 px-2 text-center text-zinc-400 text-xs hidden md:table-cell font-mono">
                            {row.gc}
                          </td>
                        </>
                      )}

                      {/* DIFERENCIA DE GOLES */}
                      <td className="py-3 px-2.5 text-center font-bold text-xs sm:text-sm">
                        <span
                          className={
                            row.dg > 0
                              ? 'text-emerald-400'
                              : row.dg < 0
                              ? 'text-rose-400'
                              : 'text-zinc-400'
                          }
                        >
                          {row.dg > 0 ? `+${row.dg}` : row.dg}
                        </span>
                      </td>

                      {/* PUNTOS TOTALES (PTS) - DESTACADO */}
                      <td className="py-3 px-4 text-center font-black text-sm sm:text-base text-emerald-400 bg-emerald-950/20">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 font-mono">
                          {row.puntos}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 3. LEYENDA FEDERATIVA INFERIOR */}
        <div className="bg-zinc-950/90 border-t border-zinc-800 p-4 flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-400">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
              <span>1º y 2º: Liguilla Provincial</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" />
              <span>3º y 4º: Repechaje</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
              <span>Zona de Descenso</span>
            </div>
          </div>

          <div className="text-[11px] text-zinc-400 italic">
            Criterios: 1º PTS | 2º DG | 3º GF | 4º GC
          </div>
        </div>
      </div>
    </div>
  );
};

export default StandingsTable;
