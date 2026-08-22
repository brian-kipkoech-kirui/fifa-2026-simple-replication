export type Position = 'GK' | 'CB' | 'LB' | 'RB' | 'CDM' | 'CM' | 'CAM' | 'RW' | 'LW' | 'CF' | 'ST';

export type CardTier = 'bronze' | 'silver' | 'gold' | 'special' | 'icon' | 'totw' | 'worldcup';

export interface Player {
  id: string;
  name: string;
  commonName: string;
  number: number;
  position: Position;
  rating: number;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
  cardTier: CardTier;
  nationality: string;
  nationFlag: string;
  club: string;
  clubBadge?: string;
  avatarColor: string; // e.g. skin tone / hair
  hairColor?: string;
  specialMoveSkill: number; // 1 to 5 stars
  preferredFoot: 'L' | 'R';
  photo?: string;
}

export type FormationName = '4-3-3' | '4-4-2' | '4-2-3-1' | '3-5-2' | '5-3-2' | '4-1-2-1-2';
export type TacticalStyle = 'Balanced' | 'Tiki-Taka' | 'Gegenpress' | 'Fast Counter' | 'Wing Play' | 'Park The Bus';

export interface KitConfig {
  primary: string; // jersey body
  secondary: string; // shorts / trims
  accent: string; // stripes/collars
  numbers: string; // text color
  gk: string; // goalkeeper color
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  countryCode: string;
  type: 'national' | 'club';
  flag: string;
  kit: KitConfig;
  awayKit: KitConfig;
  overall: number;
  attack: number;
  midfield: number;
  defense: number;
  formation: FormationName;
  tacticalStyle: TacticalStyle;
  stadium: string;
  players: Player[];
}

export interface MatchStats {
  possession: [number, number]; // [home%, away%]
  shots: [number, number];
  shotsOnTarget: [number, number];
  corners: [number, number];
  fouls: [number, number];
  yellowCards: [number, number];
  redCards: [number, number];
  xG: [number, number];
  passes: [number, number];
  tackles: [number, number];
}

export interface MatchEvent {
  id: string;
  time: number;
  text: string;
  type: 'goal' | 'card' | 'sub' | 'whistle' | 'chance' | 'save' | 'foul';
  teamId?: string;
  scorer?: string;
}

export type GameDifficulty = 'Amateur' | 'Semi-Pro' | 'Professional' | 'World Class' | 'Legendary';
export type CameraAngle = 'Tele Broadcast' | 'Broadcast Classic' | 'Dynamic 3D' | 'End to End';

export interface GameSettings {
  difficulty: GameDifficulty;
  matchLengthSeconds: number; // e.g. 90, 120, 180
  cameraAngle: CameraAngle;
  radarEnabled: boolean;
  commentaryEnabled: boolean;
  sfxVolume: number;
  crowdVolume: number;
  musicVolume: number;
  controlsMode: 'keyboard' | 'gamepad' | 'touch';
}

export interface KeyBindings {
  up: string;
  down: string;
  left: string;
  right: string;
  pass: string;
  shoot: string;
  throughBall: string;
  lobPass: string;
  sprint: string;
  skillMove: string;
  switchPlayer: string;
  pause: string;
}

// Active pitch entity in physics loop
export interface PitchPlayer {
  id: string;
  name: string;
  number: number;
  position: Position;
  teamId: 'home' | 'away';
  role: 'GK' | 'DEF' | 'MID' | 'FWD';
  x: number; // 0 to 1050 (Pitch standard length 105m * 10)
  y: number; // 0 to 680 (Pitch standard width 68m * 10)
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
  stamina: number; // 0 to 100
  facingAngle: number;
  state: 'idle' | 'running' | 'sprinting' | 'tackling' | 'shooting' | 'passing' | 'celebrating' | 'diving' | 'stunned';
  animTimer: number;
  hasCard: 'none' | 'yellow' | 'red';
  isControlled: boolean;
  stats: {
    goals: number;
    assists: number;
    shots: number;
    passes: number;
    tackles: number;
    rating: number;
  };
  // Base attributes cached for high-frequency physics
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
  avatarColor: string;
  hairColor: string;
}

export interface Ball {
  x: number;
  y: number;
  z: number; // height (0 = ground, >0 = in air)
  vx: number;
  vy: number;
  vz: number;
  spinX: number;
  spinY: number;
  state: 'ground' | 'air' | 'net' | 'rebound';
  possessorId: string | null; // pitch player id
  lastTouchTeam: 'home' | 'away' | null;
  lastTouchPlayerName: string | null;
  trail: { x: number; y: number; z: number }[];
}

export interface TournamentTeamStats {
  team: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  pts: number;
}

export interface KnockoutMatch {
  id: string;
  stageName: string;
  homeTeam: Team;
  awayTeam: Team;
  homeScore?: number;
  awayScore?: number;
  penalties?: [number, number];
  winner?: Team;
  isCompleted: boolean;
}

export interface FUTPack {
  id: string;
  name: string;
  description: string;
  costCoins: number;
  costPoints: number;
  rarity: 'gold' | 'mega' | 'icon' | 'totw' | 'worldcup' | 'special';
  cardCount: number;
  minRating: number;
  guaranteedIcons?: number;
  imageColor: string;
}

export interface CareerSave {
  managerName: string;
  team: Team;
  transferBudget: number;
  wageBudget: number;
  currentDate: string;
  matchWeek: number;
  standings: { teamName: string; played: number; points: number; gd: number }[];
  history: { week: number; opponent: string; score: string; result: 'W' | 'D' | 'L' }[];
}
