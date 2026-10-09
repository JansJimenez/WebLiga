// =============================================================================
// Prisma Seed Script for Liga Provincial de Fútbol
// =============================================================================

import { PrismaClient, UserRole, TournamentFormat } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // ---------------------------------------------------------------------------
  // Usuarios de ejemplo (SUPER_ADMIN, DELEGADO, ARBITRO, PUBLICO)
  // ---------------------------------------------------------------------------
  const users = await prisma.user.createMany({
    data: [
      {
        email: "admin@liga.com",
        password_hash: "$2b$10$examplehashadmin", // bcrypt hash placeholder
        role: "SUPER_ADMIN",
      },
      {
        email: "delegado1@liga.com",
        password_hash: "$2b$10$examplehashdelegado",
        role: "DELEGADO",
      },
      {
        email: "arbitro1@liga.com",
        password_hash: "$2b$10$examplehasharbitro",
        role: "ARBITRO",
      },
      {
        email: "publico@liga.com",
        password_hash: "$2b$10$examplehashpublico",
        role: "PUBLICO",
      },
    ],
    skipDuplicates: true,
  });
  console.log(`👤 Users seeded: ${users.count}`);

  // ---------------------------------------------------------------------------
  // Clubes de ejemplo
  // ---------------------------------------------------------------------------
  const clubA = await prisma.club.upsert({
    where: { nombre_corto: "ClubA" },
    update: {},
    create: {
      nombre_oficial: "Club Atlético A",
      nombre_corto: "ClubA",
      fundacion_year: 1950,
      logo_url: "https://example.com/logos/cluba.png",
      color_principal: "#0044AA",
      color_secundario: "#FFFFFF",
    },
  });

  const clubB = await prisma.club.upsert({
    where: { nombre_corto: "ClubB" },
    update: {},
    create: {
      nombre_oficial: "Club Deportivo B",
      nombre_corto: "ClubB",
      fundacion_year: 1975,
      logo_url: "https://example.com/logos/clubb.png",
      color_principal: "#AA3300",
      color_secundario: "#000000",
    },
  });

  console.log(`🏟️ Clubs seeded: ${[clubA, clubB].length}`);

  // ---------------------------------------------------------------------------
  // Torneos de ejemplo (Round‑Robin & Fase de Grupos)
  // ---------------------------------------------------------------------------
  const torneo1 = await prisma.tournament.upsert({
    where: { nombre: "Liga 2026" },
    update: {},
    create: {
      nombre: "Liga 2026",
      anio: 2026,
      formato: TournamentFormat.TODOS_CONTRA_TODOS,
      puntos_victoria: 3,
      puntos_empate: 1,
      puntos_derrota: 0,
      max_amarillas_suspension: 3,
    },
  });

  const torneo2 = await prisma.tournament.upsert({
    where: { nombre: "Copa Verano 2026" },
    update: {},
    create: {
      nombre: "Copa Verano 2026",
      anio: 2026,
      formato: TournamentFormat.FASE_GRUPOS,
      puntos_victoria: 3,
      puntos_empate: 1,
      puntos_derrota: 0,
      max_amarillas_suspension: 5,
    },
  });

  console.log(`🏆 Tournaments seeded: ${[torneo1, torneo2].length}`);

  // ---------------------------------------------------------------------------
  // Jugadores de ejemplo (asociados a Club A y Club B)
  // ---------------------------------------------------------------------------
  const player1 = await prisma.player.upsert({
    where: { dni: "12345678" },
    update: {},
    create: {
      club_id: clubA.id,
      dni: "12345678",
      nombres: "Juan",
      apellidos: "Pérez",
      fecha_nacimiento: new Date("1995-04-12"),
      foto_url: "https://example.com/fotos/juan.jpg",
      posicion: "Delantero",
      numero_camiseta: 9,
      estado_medico: true,
      habilitado: true,
    },
  });

  const player2 = await prisma.player.upsert({
    where: { dni: "87654321" },
    update: {},
    create: {
      club_id: clubB.id,
      dni: "87654321",
      nombres: "Luis",
      apellidos: "Gómez",
      fecha_nacimiento: new Date("1998-09-30"),
      foto_url: "https://example.com/fotos/luis.jpg",
      posicion: "Defensa",
      numero_camiseta: 4,
      estado_medico: true,
      habilitado: true,
    },
  });

  console.log(`⚽ Players seeded: ${[player1, player2].length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
