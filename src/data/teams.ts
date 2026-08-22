import { Team } from '../types';
import { ALL_PLAYERS } from './players';

export const TEAMS: Team[] = [
  {
    id: 'arg',
    name: 'Argentina',
    shortName: 'ARG',
    countryCode: 'AR',
    type: 'national',
    flag: '🇦🇷',
    kit: {
      primary: '#75aadb', // Sky blue
      secondary: '#ffffff', // White stripes & shorts
      accent: '#f6b40e', // Gold sun accent
      numbers: '#000000',
      gk: '#10b981'
    },
    awayKit: {
      primary: '#312e81', // Deep royal navy
      secondary: '#1e1b4b',
      accent: '#6366f1',
      numbers: '#ffffff',
      gk: '#f59e0b'
    },
    overall: 88,
    attack: 89,
    midfield: 87,
    defense: 86,
    formation: '4-3-3',
    tacticalStyle: 'Tiki-Taka',
    stadium: 'Estadio Monumental / MetLife 2026',
    players: ALL_PLAYERS.filter(p => p.nationality === 'Argentina' && !p.id.startsWith('ico'))
  },
  {
    id: 'fra',
    name: 'France',
    shortName: 'FRA',
    countryCode: 'FR',
    type: 'national',
    flag: '🇫🇷',
    kit: {
      primary: '#1e3a8a', // Deep Blue
      secondary: '#ffffff',
      accent: '#ef4444',
      numbers: '#ffffff',
      gk: '#eab308'
    },
    awayKit: {
      primary: '#f8fafc',
      secondary: '#1e3a8a',
      accent: '#3b82f6',
      numbers: '#1e3a8a',
      gk: '#ec4899'
    },
    overall: 89,
    attack: 90,
    midfield: 88,
    defense: 87,
    formation: '4-3-3',
    tacticalStyle: 'Fast Counter',
    stadium: 'Stade de France / SoFi Stadium 2026',
    players: ALL_PLAYERS.filter(p => p.nationality === 'France' && !p.id.startsWith('ico'))
  },
  {
    id: 'esp',
    name: 'Spain',
    shortName: 'ESP',
    countryCode: 'ES',
    type: 'national',
    flag: '🇪🇸',
    kit: {
      primary: '#dc2626', // Spanish Red
      secondary: '#1e3a8a', // Navy blue shorts
      accent: '#facc15', // Gold trims
      numbers: '#facc15',
      gk: '#06b6d4'
    },
    awayKit: {
      primary: '#fef08a',
      secondary: '#dc2626',
      accent: '#ef4444',
      numbers: '#dc2626',
      gk: '#10b981'
    },
    overall: 88,
    attack: 87,
    midfield: 90,
    defense: 86,
    formation: '4-3-3',
    tacticalStyle: 'Tiki-Taka',
    stadium: 'Santiago Bernabéu / Azteca Stadium 2026',
    players: ALL_PLAYERS.filter(p => p.nationality === 'Spain')
  },
  {
    id: 'eng',
    name: 'England',
    shortName: 'ENG',
    countryCode: 'GB',
    type: 'national',
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    kit: {
      primary: '#ffffff', // White
      secondary: '#1e293b', // Navy shorts
      accent: '#2563eb', // Royal blue trim
      numbers: '#1e293b',
      gk: '#10b981'
    },
    awayKit: {
      primary: '#dc2626',
      secondary: '#ffffff',
      accent: '#ffffff',
      numbers: '#ffffff',
      gk: '#eab308'
    },
    overall: 88,
    attack: 89,
    midfield: 88,
    defense: 86,
    formation: '4-2-3-1',
    tacticalStyle: 'Balanced',
    stadium: 'Wembley Stadium / AT&T Stadium 2026',
    players: ALL_PLAYERS.filter(p => p.nationality === 'England')
  },
  {
    id: 'bra',
    name: 'Brazil',
    shortName: 'BRA',
    countryCode: 'BR',
    type: 'national',
    flag: '🇧🇷',
    kit: {
      primary: '#eab308', // Canary Yellow
      secondary: '#2563eb', // Blue shorts
      accent: '#16a34a', // Green collar
      numbers: '#16a34a',
      gk: '#1e293b'
    },
    awayKit: {
      primary: '#2563eb',
      secondary: '#ffffff',
      accent: '#eab308',
      numbers: '#ffffff',
      gk: '#06b6d4'
    },
    overall: 87,
    attack: 89,
    midfield: 86,
    defense: 86,
    formation: '4-3-3',
    tacticalStyle: 'Wing Play',
    stadium: 'Maracanã / Hard Rock Stadium 2026',
    players: ALL_PLAYERS.filter(p => p.nationality === 'Brazil' && !p.id.startsWith('ico'))
  },
  {
    id: 'por',
    name: 'Portugal',
    shortName: 'POR',
    countryCode: 'PT',
    type: 'national',
    flag: '🇵🇹',
    kit: {
      primary: '#b91c1c', // Crimson Red
      secondary: '#15803d', // Green
      accent: '#facc15',
      numbers: '#facc15',
      gk: '#eab308'
    },
    awayKit: {
      primary: '#f8fafc',
      secondary: '#b91c1c',
      accent: '#0284c7',
      numbers: '#b91c1c',
      gk: '#10b981'
    },
    overall: 87,
    attack: 88,
    midfield: 88,
    defense: 85,
    formation: '4-3-3',
    tacticalStyle: 'Gegenpress',
    stadium: 'Estádio da Luz / BC Place 2026',
    players: ALL_PLAYERS.filter(p => p.nationality === 'Portugal')
  },
  {
    id: 'usa',
    name: 'USA',
    shortName: 'USA',
    countryCode: 'US',
    type: 'national',
    flag: '🇺🇸',
    kit: {
      primary: '#ffffff',
      secondary: '#1e3a8a',
      accent: '#dc2626',
      numbers: '#1e3a8a',
      gk: '#84cc16'
    },
    awayKit: {
      primary: '#1e3a8a',
      secondary: '#dc2626',
      accent: '#ffffff',
      numbers: '#ffffff',
      gk: '#eab308'
    },
    overall: 83,
    attack: 83,
    midfield: 82,
    defense: 81,
    formation: '4-3-3',
    tacticalStyle: 'Fast Counter',
    stadium: 'MetLife Stadium (2026 Final Venue)',
    players: ALL_PLAYERS.filter(p => p.nationality === 'USA')
  },
  {
    id: 'legends',
    name: 'FIFA 2026 Ultimate Icons',
    shortName: 'ICN',
    countryCode: 'UN',
    type: 'club',
    flag: '⭐',
    kit: {
      primary: '#18181b', // Obsidian Gold
      secondary: '#09090b',
      accent: '#eab308',
      numbers: '#eab308',
      gk: '#fbbf24'
    },
    awayKit: {
      primary: '#ffffff',
      secondary: '#eab308',
      accent: '#18181b',
      numbers: '#18181b',
      gk: '#10b981'
    },
    overall: 96,
    attack: 97,
    midfield: 96,
    defense: 95,
    formation: '4-3-3',
    tacticalStyle: 'Tiki-Taka',
    stadium: 'FIFA Icons Grand Coliseum',
    players: ALL_PLAYERS.filter(p => p.id.startsWith('ico_') || p.id === 'arg_1' || p.id === 'fra_1' || p.id === 'esp_1')
  }
];

// Helper to get formation coordinate offsets (0 to 1 normalized on pitch)
export function getFormationCoordinates(
  formation: string,
  isHome: boolean
): { position: string; role: 'GK' | 'DEF' | 'MID' | 'FWD'; normX: number; normY: number }[] {
  // Home attacks left to right (x: 0.05 to 0.45 in their half)
  // Away attacks right to left (x: 0.95 to 0.55 in their half)
  
  const base433 = [
    { position: 'GK', role: 'GK' as const, normX: 0.06, normY: 0.5 },
    { position: 'RB', role: 'DEF' as const, normX: 0.22, normY: 0.15 },
    { position: 'CB', role: 'DEF' as const, normX: 0.18, normY: 0.38 },
    { position: 'CB', role: 'DEF' as const, normX: 0.18, normY: 0.62 },
    { position: 'LB', role: 'DEF' as const, normX: 0.22, normY: 0.85 },
    { position: 'CDM', role: 'MID' as const, normX: 0.32, normY: 0.5 },
    { position: 'CM', role: 'MID' as const, normX: 0.38, normY: 0.32 },
    { position: 'CM', role: 'MID' as const, normX: 0.38, normY: 0.68 },
    { position: 'RW', role: 'FWD' as const, normX: 0.46, normY: 0.18 },
    { position: 'ST', role: 'FWD' as const, normX: 0.48, normY: 0.5 },
    { position: 'LW', role: 'FWD' as const, normX: 0.46, normY: 0.82 }
  ];

  const base4231 = [
    { position: 'GK', role: 'GK' as const, normX: 0.06, normY: 0.5 },
    { position: 'RB', role: 'DEF' as const, normX: 0.22, normY: 0.15 },
    { position: 'CB', role: 'DEF' as const, normX: 0.18, normY: 0.38 },
    { position: 'CB', role: 'DEF' as const, normX: 0.18, normY: 0.62 },
    { position: 'LB', role: 'DEF' as const, normX: 0.22, normY: 0.85 },
    { position: 'CDM', role: 'MID' as const, normX: 0.30, normY: 0.38 },
    { position: 'CDM', role: 'MID' as const, normX: 0.30, normY: 0.62 },
    { position: 'CAM', role: 'MID' as const, normX: 0.40, normY: 0.5 },
    { position: 'RW', role: 'FWD' as const, normX: 0.44, normY: 0.18 },
    { position: 'LW', role: 'FWD' as const, normX: 0.44, normY: 0.82 },
    { position: 'ST', role: 'FWD' as const, normX: 0.48, normY: 0.5 }
  ];

  const positions = formation === '4-2-3-1' ? base4231 : base433;

  if (isHome) {
    return positions;
  } else {
    // Mirror for away team attacking right to left
    return positions.map(p => ({
      ...p,
      normX: 1.0 - p.normX,
      normY: 1.0 - p.normY
    }));
  }
}
