export interface Competition {
  label: string;
  competitionId: string;
  year: number;
  stages: string[];
  groups: string[];
  rounds: number[];
}

export const COMPETITIONS: Competition[] = [
  {
    label: 'Brasileirão 2025',
    competitionId: 'brasileirao',
    year: 2025,
    stages: ['LEAGUE'],
    groups: [],
    rounds: Array.from({ length: 38 }, (_, i) => i + 1)
  },
  {
    label: 'Brasileirão 2026',
    competitionId: 'brasileirao',
    year: 2026,
    stages: ['LEAGUE'],
    groups: [],
    rounds: Array.from({ length: 38 }, (_, i) => i + 1)
  },
  {
    label: 'Copa do Mundo 2026',
    competitionId: 'world-cup-2026',
    year: 2026,
    stages: ['GROUP', 'SECOND_ROUND', 'ROUND_OF_16', 'QUARTER_FINAL', 'SEMI_FINAL', 'THIRD_PLACE', 'FINAL'],
    groups: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'],
    rounds: [1, 2, 3, 4, 5, 6, 7, 8, 9]
  }
];

export const DEFAULT_COMPETITION: Competition = COMPETITIONS[2]; // WORLD CUP
export const BRASILEIRAO_2026: Competition = COMPETITIONS[1]; // BR 26

export const WORLD_CUP_ROUND_LABELS: Record<number, string> = {
  1: 'Fase de Grupos - Rodada 1',
  2: 'Fase de Grupos - Rodada 2',
  3: 'Fase de Grupos - Rodada 3',
  4: 'Segunda Fase',
  5: 'Oitavas de Final',
  6: 'Quartas de Final',
  7: 'Semifinal',
  8: 'Terceiro Lugar',
  9: 'Final',
};

export const BRASILEIRAO_TEAMS: string[] = [
  'Palmeiras', 'Flamengo', 'Fluminense', 'Athletico-PR', 'Bragantino',
  'São Paulo', 'Bahia', 'Coritiba', 'Cruzeiro', 'Botafogo',
  'Vitória', 'Atlético-MG', 'Internacional', 'Grêmio', 'Corinthians',
  'Vasco', 'Santos', 'Mirassol', 'Remo', 'Chapecoense'
];

export const WORLD_CUP_2026_GROUPS: Record<string, string[]> = {
  A: ['México', 'África do Sul', 'Coreia do Sul', 'República Tcheca'],
  B: ['Canadá', 'Bósnia', 'Catar', 'Suíça'],
  C: ['Brasil', 'Marrocos', 'Haiti', 'Escócia'],
  D: ['Estados Unidos', 'Paraguai', 'Austrália', 'Turquia'],
  E: ['Alemanha', 'Curaçao', 'Costa do Marfim', 'Equador'],
  F: ['Holanda', 'Japão', 'Suécia', 'Tunísia'],
  G: ['Bélgica', 'Egito', 'Irã', 'Nova Zelândia'],
  H: ['Espanha', 'Cabo Verde', 'Arábia Saudita', 'Uruguai'],
  I: ['França', 'Senegal', 'Repescagem Intercontinental 2', 'Noruega'],
  J: ['Argentina', 'Argélia', 'Áustria', 'Jordânia'],
  K: ['Portugal', 'RD Congo', 'Uzbequistão', 'Colômbia'],
  L: ['Inglaterra', 'Croácia', 'Gana', 'Panamá'],
};

export const WORLD_CUP_2026_TEAMS: string[] = ([] as string[]).concat(
  ...Object.keys(WORLD_CUP_2026_GROUPS).map(g => WORLD_CUP_2026_GROUPS[g])
);
