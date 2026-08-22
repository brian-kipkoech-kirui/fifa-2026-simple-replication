import React, { useState, useMemo } from 'react';
import { Team, Player, Position, FormationName, TacticalStyle } from '../types';
import { TEAMS } from '../data/teams';
import { sound } from '../utils/audio';
import { 
  ArrowLeft, 
  Shield, 
  Sparkles, 
  UserCheck, 
  ArrowLeftRight, 
  Search, 
  Filter, 
  SlidersHorizontal, 
  ChevronRight, 
  Play, 
  Star, 
  Activity, 
  Zap, 
  Award,
  Flame,
  CheckCircle2,
  RefreshCw,
  Info
} from 'lucide-react';

interface SquadManagementProps {
  initialTeam?: Team;
  onBack: () => void;
  onPlayWithTeam?: (team: Team) => void;
}

const FORMATIONS: { name: FormationName; description: string; positions: { pos: Position; role: string; top: number; left: number }[] }[] = [
  {
    name: '4-3-3',
    description: 'Balanced wide attacking system with high wingers and compact midfield trio.',
    positions: [
      { pos: 'GK', role: 'Goalkeeper', top: 88, left: 50 },
      { pos: 'RB', role: 'Right Back', top: 72, left: 85 },
      { pos: 'CB', role: 'Center Back (R)', top: 74, left: 63 },
      { pos: 'CB', role: 'Center Back (L)', top: 74, left: 37 },
      { pos: 'LB', role: 'Left Back', top: 72, left: 15 },
      { pos: 'CDM', role: 'Defensive Midfielder', top: 54, left: 50 },
      { pos: 'CM', role: 'Right Central Midfielder', top: 42, left: 70 },
      { pos: 'CM', role: 'Left Central Midfielder', top: 42, left: 30 },
      { pos: 'RW', role: 'Right Winger', top: 20, left: 82 },
      { pos: 'ST', role: 'Striker', top: 14, left: 50 },
      { pos: 'LW', role: 'Left Winger', top: 20, left: 18 },
    ]
  },
  {
    name: '4-2-3-1',
    description: 'Solid double pivot with creative central attacking midfielder behind lone striker.',
    positions: [
      { pos: 'GK', role: 'Goalkeeper', top: 88, left: 50 },
      { pos: 'RB', role: 'Right Back', top: 72, left: 85 },
      { pos: 'CB', role: 'Center Back (R)', top: 74, left: 63 },
      { pos: 'CB', role: 'Center Back (L)', top: 74, left: 37 },
      { pos: 'LB', role: 'Left Back', top: 72, left: 15 },
      { pos: 'CDM', role: 'Right Defensive Mid', top: 56, left: 65 },
      { pos: 'CDM', role: 'Left Defensive Mid', top: 56, left: 35 },
      { pos: 'CAM', role: 'Central Attacking Mid', top: 35, left: 50 },
      { pos: 'RW', role: 'Right Attacking Mid', top: 32, left: 82 },
      { pos: 'LW', role: 'Left Attacking Mid', top: 32, left: 18 },
      { pos: 'ST', role: 'Striker', top: 14, left: 50 },
    ]
  },
  {
    name: '4-4-2',
    description: 'Classic dual-striker structure with robust four-man midfield and wide flanks.',
    positions: [
      { pos: 'GK', role: 'Goalkeeper', top: 88, left: 50 },
      { pos: 'RB', role: 'Right Back', top: 72, left: 85 },
      { pos: 'CB', role: 'Center Back (R)', top: 74, left: 63 },
      { pos: 'CB', role: 'Center Back (L)', top: 74, left: 37 },
      { pos: 'LB', role: 'Left Back', top: 72, left: 15 },
      { pos: 'RW', role: 'Right Midfielder', top: 48, left: 84 },
      { pos: 'CM', role: 'Right Central Mid', top: 50, left: 62 },
      { pos: 'CM', role: 'Left Central Mid', top: 50, left: 38 },
      { pos: 'LW', role: 'Left Midfielder', top: 48, left: 16 },
      { pos: 'ST', role: 'Right Striker', top: 18, left: 62 },
      { pos: 'ST', role: 'Left Striker', top: 18, left: 38 },
    ]
  },
  {
    name: '3-5-2',
    description: 'Heavy midfield overload with dynamic wing-backs and twin center-forwards.',
    positions: [
      { pos: 'GK', role: 'Goalkeeper', top: 88, left: 50 },
      { pos: 'CB', role: 'Right Center Back', top: 73, left: 75 },
      { pos: 'CB', role: 'Central Center Back', top: 76, left: 50 },
      { pos: 'CB', role: 'Left Center Back', top: 73, left: 25 },
      { pos: 'RB', role: 'Right Wing-Back', top: 46, left: 88 },
      { pos: 'CDM', role: 'Defensive Midfielder', top: 56, left: 50 },
      { pos: 'CM', role: 'Central Midfielder', top: 42, left: 65 },
      { pos: 'CM', role: 'Central Midfielder', top: 42, left: 35 },
      { pos: 'LB', role: 'Left Wing-Back', top: 46, left: 12 },
      { pos: 'ST', role: 'Right Striker', top: 18, left: 62 },
      { pos: 'ST', role: 'Left Striker', top: 18, left: 38 },
    ]
  }
];

const TACTICAL_STYLES: { name: TacticalStyle; desc: string; tempo: string; defense: string }[] = [
  { name: 'Tiki-Taka', desc: 'Short, sharp possession passes with high line to dominate territory.', tempo: 'Controlled (Fast)', defense: 'High Press' },
  { name: 'Gegenpress', desc: 'Furious immediate pressing upon losing possession to force turnovers in final third.', tempo: 'Intense', defense: 'Aggressive High Line' },
  { name: 'Fast Counter', desc: 'Absorb pressure in mid-block then strike rapidly into open transitional space.', tempo: 'Direct & Rapid', defense: 'Mid Block' },
  { name: 'Wing Play', desc: 'Overload wide flanks for early crosses and cutbacks into the penalty box.', tempo: 'Wide Dynamic', defense: 'Balanced' },
  { name: 'Balanced', desc: 'Adaptable shape maintaining structure according to match state.', tempo: 'Standard', defense: 'Balanced' },
  { name: 'Park The Bus', desc: 'Ultra-low defensive block with compact double banks behind the ball.', tempo: 'Cautious', defense: 'Deep Low Block' }
];

export const SquadManagement: React.FC<SquadManagementProps> = ({
  initialTeam,
  onBack,
  onPlayWithTeam
}) => {
  // Currently selected team
  const [selectedTeamId, setSelectedTeamId] = useState<string>(initialTeam?.id || TEAMS[0].id);
  const currentBaseTeam = useMemo(() => TEAMS.find(t => t.id === selectedTeamId) || TEAMS[0], [selectedTeamId]);

  // Squad state: Starters (11 players) and Substitutes (remaining players)
  const [squadLineup, setSquadLineup] = useState<{ [teamId: string]: { starters: Player[]; subs: Player[]; formation: FormationName; tacticalStyle: TacticalStyle } }>({});

  // Ensure current team is initialized in state
  const teamSquad = useMemo(() => {
    if (squadLineup[currentBaseTeam.id]) {
      return squadLineup[currentBaseTeam.id];
    }
    const all = [...currentBaseTeam.players];
    const starters = all.slice(0, 11);
    const subs = all.slice(11);
    return {
      starters,
      subs,
      formation: currentBaseTeam.formation || '4-3-3',
      tacticalStyle: currentBaseTeam.tacticalStyle || 'Tiki-Taka'
    };
  }, [currentBaseTeam, squadLineup]);

  // Currently inspected player for the FIFA Profile Card
  const [inspectedPlayer, setInspectedPlayer] = useState<Player>(teamSquad.starters[0] || currentBaseTeam.players[0]);

  // Player selected for quick substitution swap
  const [swapSourceId, setSwapSourceId] = useState<string | null>(null);

  // Filter & Search state for roster list
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [rosterFilter, setRosterFilter] = useState<'all' | 'starters' | 'subs' | 'gk' | 'def' | 'mid' | 'fwd'>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'pace' | 'shooting' | 'passing' | 'dribbling' | 'defending' | 'physical' | 'number'>('rating');

  // Active view tab: 'pitch' or 'tactics' or 'list'
  const [activeTab, setActiveTab] = useState<'pitch' | 'tactics' | 'roster'>('pitch');

  // Current formation config
  const currentFormationConfig = useMemo(() => {
    return FORMATIONS.find(f => f.name === teamSquad.formation) || FORMATIONS[0];
  }, [teamSquad.formation]);

  // Recalculate dynamic team ratings
  const dynamicTeamStats = useMemo(() => {
    const starters = teamSquad.starters;
    if (starters.length === 0) return { overall: currentBaseTeam.overall, att: currentBaseTeam.attack, mid: currentBaseTeam.midfield, def: currentBaseTeam.defense };

    const avg = (arr: number[]) => Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
    const overallAvg = avg(starters.map(p => p.rating));
    
    const fwdRatings = starters.filter(p => ['ST', 'CF', 'RW', 'LW'].includes(p.position)).map(p => p.shooting);
    const midRatings = starters.filter(p => ['CAM', 'CM', 'CDM', 'RM', 'LM'].includes(p.position)).map(p => p.passing);
    const defRatings = starters.filter(p => ['CB', 'LB', 'RB', 'GK'].includes(p.position)).map(p => p.defending);

    return {
      overall: overallAvg,
      att: fwdRatings.length ? avg(fwdRatings) : currentBaseTeam.attack,
      mid: midRatings.length ? avg(midRatings) : currentBaseTeam.midfield,
      def: defRatings.length ? avg(defRatings) : currentBaseTeam.defense,
    };
  }, [teamSquad.starters, currentBaseTeam]);

  // Handle player selection
  const handleSelectPlayer = (player: Player) => {
    setInspectedPlayer(player);
    sound.playUISelect();
  };

  // Handle substitution swap
  const handleSwapClick = (player: Player) => {
    if (!swapSourceId) {
      // Pick first player to swap
      setSwapSourceId(player.id);
      sound.playUISelect();
    } else if (swapSourceId === player.id) {
      // Deselect
      setSwapSourceId(null);
      sound.playUISelect();
    } else {
      // Execute swap between swapSourceId and player.id
      const sourceId = swapSourceId;
      setSquadLineup(prev => {
        const current = prev[currentBaseTeam.id] || teamSquad;
        const allList = [...current.starters, ...current.subs];
        
        const p1IndexStarter = current.starters.findIndex(p => p.id === sourceId);
        const p1IndexSub = current.subs.findIndex(p => p.id === sourceId);
        
        const p2IndexStarter = current.starters.findIndex(p => p.id === player.id);
        const p2IndexSub = current.subs.findIndex(p => p.id === player.id);

        let newStarters = [...current.starters];
        let newSubs = [...current.subs];

        // Case 1: Starter with Sub
        if (p1IndexStarter !== -1 && p2IndexSub !== -1) {
          const starterP = newStarters[p1IndexStarter];
          const subP = newSubs[p2IndexSub];
          newStarters[p1IndexStarter] = subP;
          newSubs[p2IndexSub] = starterP;
        } else if (p1IndexSub !== -1 && p2IndexStarter !== -1) {
          const subP = newSubs[p1IndexSub];
          const starterP = newStarters[p2IndexStarter];
          newSubs[p1IndexSub] = starterP;
          newStarters[p2IndexStarter] = subP;
        }
        // Case 2: Starter with Starter
        else if (p1IndexStarter !== -1 && p2IndexStarter !== -1) {
          const temp = newStarters[p1IndexStarter];
          newStarters[p1IndexStarter] = newStarters[p2IndexStarter];
          newStarters[p2IndexStarter] = temp;
        }
        // Case 3: Sub with Sub
        else if (p1IndexSub !== -1 && p2IndexSub !== -1) {
          const temp = newSubs[p1IndexSub];
          newSubs[p1IndexSub] = newSubs[p2IndexSub];
          newSubs[p2IndexSub] = temp;
        }

        return {
          ...prev,
          [currentBaseTeam.id]: {
            ...current,
            starters: newStarters,
            subs: newSubs
          }
        };
      });

      setSwapSourceId(null);
      setInspectedPlayer(player);
      sound.playKick('pass');
    }
  };

  // Change formation
  const handleChangeFormation = (formation: FormationName) => {
    setSquadLineup(prev => ({
      ...prev,
      [currentBaseTeam.id]: {
        ...(prev[currentBaseTeam.id] || teamSquad),
        formation
      }
    }));
    sound.playUISelect();
  };

  // Change tactical style
  const handleChangeTactics = (tacticalStyle: TacticalStyle) => {
    setSquadLineup(prev => ({
      ...prev,
      [currentBaseTeam.id]: {
        ...(prev[currentBaseTeam.id] || teamSquad),
        tacticalStyle
      }
    }));
    sound.playUISelect();
  };

  // Reset to default lineup
  const handleResetLineup = () => {
    const all = [...currentBaseTeam.players];
    setSquadLineup(prev => ({
      ...prev,
      [currentBaseTeam.id]: {
        starters: all.slice(0, 11),
        subs: all.slice(11),
        formation: currentBaseTeam.formation || '4-3-3',
        tacticalStyle: currentBaseTeam.tacticalStyle || 'Tiki-Taka'
      }
    }));
    setSwapSourceId(null);
    sound.playUISelect();
  };

  // Filter and Sort Full Roster
  const filteredRoster = useMemo(() => {
    const all = [...teamSquad.starters, ...teamSquad.subs];
    return all.filter(p => {
      // Search
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.commonName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.club.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.position.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // Category filter
      if (rosterFilter === 'starters') return teamSquad.starters.some(s => s.id === p.id);
      if (rosterFilter === 'subs') return teamSquad.subs.some(s => s.id === p.id);
      if (rosterFilter === 'gk') return p.position === 'GK';
      if (rosterFilter === 'def') return ['CB', 'LB', 'RB'].includes(p.position);
      if (rosterFilter === 'mid') return ['CDM', 'CM', 'CAM', 'RM', 'LM'].includes(p.position);
      if (rosterFilter === 'fwd') return ['ST', 'CF', 'RW', 'LW'].includes(p.position);
      return true;
    }).sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'pace') return b.pace - a.pace;
      if (sortBy === 'shooting') return b.shooting - a.shooting;
      if (sortBy === 'passing') return b.passing - a.passing;
      if (sortBy === 'dribbling') return b.dribbling - a.dribbling;
      if (sortBy === 'defending') return b.defending - a.defending;
      if (sortBy === 'physical') return b.physical - a.physical;
      if (sortBy === 'number') return a.number - b.number;
      return 0;
    });
  }, [teamSquad, searchQuery, rosterFilter, sortBy]);

  // Card tier background style helper
  const getCardTierStyles = (tier: string) => {
    switch (tier) {
      case 'icon':
        return {
          bg: 'bg-gradient-to-b from-amber-100 via-amber-200 to-amber-400 text-neutral-950 border-amber-300 shadow-amber-500/30',
          badge: 'bg-neutral-900 text-amber-300 border-amber-400/50',
          accent: 'text-amber-950'
        };
      case 'special':
      case 'worldcup':
        return {
          bg: 'bg-gradient-to-b from-blue-600 via-indigo-700 to-purple-900 text-white border-blue-400 shadow-blue-500/30',
          badge: 'bg-blue-950 text-blue-200 border-blue-400/50',
          accent: 'text-blue-200'
        };
      case 'silver':
        return {
          bg: 'bg-gradient-to-b from-slate-200 via-slate-300 to-slate-400 text-neutral-900 border-slate-300 shadow-slate-500/20',
          badge: 'bg-neutral-900 text-slate-200 border-slate-400/50',
          accent: 'text-slate-900'
        };
      case 'gold':
      default:
        return {
          bg: 'bg-gradient-to-b from-amber-200 via-yellow-400 to-amber-600 text-neutral-950 border-yellow-300 shadow-yellow-500/30',
          badge: 'bg-neutral-900 text-yellow-300 border-yellow-400/50',
          accent: 'text-amber-950'
        };
    }
  };

  const cardStyle = getCardTierStyles(inspectedPlayer.cardTier);

  return (
    <div className="relative w-full min-h-screen stadium-bg text-neutral-100 p-4 md:p-6 flex flex-col justify-between font-sans-ui overflow-x-hidden select-none">
      {/* Background glow ambiance */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <header className="w-full max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 z-10 border-b border-neutral-800 pb-4">
        {/* Left Title & Back */}
        <div className="flex items-center gap-4">
          <button
            id="squad-btn-back"
            onClick={() => {
              sound.playUISelect();
              onBack();
            }}
            className="p-2.5 rounded-2xl bg-neutral-900/80 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white transition shadow flex items-center gap-2 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Main Menu</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-display font-black tracking-widest uppercase">
                FIFA 26 TEAM HUB
              </span>
              <span className="text-xs text-neutral-400 font-bold">• 16-Player Matchday Roster</span>
            </div>
            <h1 className="font-display font-black text-2xl tracking-tight text-white flex items-center gap-2">
              SQUAD MANAGEMENT <span className="text-emerald-400 text-lg">& TACTICS</span>
            </h1>
          </div>
        </div>

        {/* Team Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          {TEAMS.map((t) => {
            const isSelected = t.id === selectedTeamId;
            return (
              <button
                key={t.id}
                id={`squad-select-team-${t.id}`}
                onClick={() => {
                  setSelectedTeamId(t.id);
                  const teamPlayers = t.players;
                  if (teamPlayers.length > 0) {
                    setInspectedPlayer(teamPlayers[0]);
                  }
                  setSwapSourceId(null);
                  sound.playUISelect();
                }}
                className={`px-3 py-2 rounded-2xl border flex items-center gap-2 transition whitespace-nowrap text-xs font-bold cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-lg shadow-emerald-500/10'
                    : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                }`}
              >
                <span className="text-base">{t.flag}</span>
                <span>{t.shortName}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${isSelected ? 'bg-emerald-400 text-neutral-950 font-black' : 'bg-neutral-800 text-neutral-400'}`}>
                  {t.overall}
                </span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Layout Grid */}
      <main className="w-full max-w-7xl mx-auto my-4 z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-start">
        
        {/* LEFT COLUMN: Team Summary & Interactive Pitch Formation (5 cols) */}
        <section className="lg:col-span-5 flex flex-col gap-4">
          
          {/* Team Overview Card with Formation/Style info */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-4xl drop-shadow">{currentBaseTeam.flag}</span>
                <div>
                  <h2 className="font-display font-black text-xl text-white flex items-center gap-2">
                    {currentBaseTeam.name}
                  </h2>
                  <p className="text-xs text-neutral-400 font-medium">
                    {currentBaseTeam.stadium}
                  </p>
                </div>
              </div>

              {/* Dynamic Overall Badge */}
              <div className="text-right">
                <div className="text-3xl font-display font-black text-emerald-400">
                  {dynamicTeamStats.overall}
                </div>
                <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">TEAM OVR</div>
              </div>
            </div>

            {/* Attack / Midfield / Defense Gauge Pills */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-neutral-950 border border-neutral-800/80 rounded-2xl p-2.5 text-center">
                <div className="text-[10px] font-bold text-rose-400 uppercase">ATTACK</div>
                <div className="font-display font-black text-lg text-white">{dynamicTeamStats.att}</div>
              </div>
              <div className="bg-neutral-950 border border-neutral-800/80 rounded-2xl p-2.5 text-center">
                <div className="text-[10px] font-bold text-amber-400 uppercase">MIDFIELD</div>
                <div className="font-display font-black text-lg text-white">{dynamicTeamStats.mid}</div>
              </div>
              <div className="bg-neutral-950 border border-neutral-800/80 rounded-2xl p-2.5 text-center">
                <div className="text-[10px] font-bold text-blue-400 uppercase">DEFENSE</div>
                <div className="font-display font-black text-lg text-white">{dynamicTeamStats.def}</div>
              </div>
            </div>

            {/* Formation & Tactics Controls */}
            <div className="grid grid-cols-2 gap-3 pt-1 border-t border-neutral-800/80">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-400 uppercase">Formation</label>
                <select
                  id="squad-select-formation"
                  value={teamSquad.formation}
                  onChange={(e) => handleChangeFormation(e.target.value as FormationName)}
                  className="w-full bg-neutral-950 border border-neutral-700 hover:border-emerald-500 rounded-xl px-2.5 py-1.5 text-xs text-white font-bold transition focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {FORMATIONS.map(f => (
                    <option key={f.name} value={f.name}>{f.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-400 uppercase">Tactical Style</label>
                <select
                  id="squad-select-tactics"
                  value={teamSquad.tacticalStyle}
                  onChange={(e) => handleChangeTactics(e.target.value as TacticalStyle)}
                  className="w-full bg-neutral-950 border border-neutral-700 hover:border-emerald-500 rounded-xl px-2.5 py-1.5 text-xs text-white font-bold transition focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {TACTICAL_STYLES.map(t => (
                    <option key={t.name} value={t.name}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Swap Mode Prompt Banner */}
            {swapSourceId && (
              <div className="bg-amber-500/20 border border-amber-500/50 rounded-2xl p-3 flex items-center justify-between text-xs animate-pulse">
                <div className="flex items-center gap-2 text-amber-300 font-bold">
                  <ArrowLeftRight className="w-4 h-4" />
                  <span>Select any player to swap with {teamSquad.starters.find(p => p.id === swapSourceId)?.commonName || teamSquad.subs.find(p => p.id === swapSourceId)?.commonName}</span>
                </div>
                <button
                  onClick={() => setSwapSourceId(null)}
                  className="text-[10px] bg-neutral-900 hover:bg-neutral-800 text-neutral-300 px-2 py-1 rounded-lg font-bold"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* 2D Interactive Pitch Formation Visualizer */}
          <div className="relative bg-emerald-950/70 border-2 border-emerald-600/40 rounded-3xl p-4 shadow-2xl overflow-hidden aspect-[4/5] flex flex-col justify-between">
            {/* Realistic Turf Stripes & Markings */}
            <div className="absolute inset-0 bg-[radial-gradient(#15803d_1px,transparent_1px)] [background-size:16px_16px] opacity-25 pointer-events-none" />
            <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-emerald-900/30 to-emerald-950/40 pointer-events-none" />
            
            {/* Center Circle & Penalty Lines */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-20 border border-emerald-500/30 rounded-b-full pointer-events-none" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-24 border border-emerald-500/40 rounded-t-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-28 h-12 border border-emerald-500/40 rounded-t-xl pointer-events-none" />
            <div className="absolute top-1/2 inset-x-0 border-t border-emerald-500/30 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border border-emerald-500/30 rounded-full pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-emerald-400/60 rounded-full pointer-events-none" />

            {/* Pitch Header Badge */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-full bg-neutral-950/80 border border-neutral-700/60 text-emerald-300 text-[10px] font-bold tracking-wider">
                STARTING XI • {teamSquad.formation}
              </span>
              <button
                onClick={handleResetLineup}
                title="Reset to default Starting XI"
                className="px-2.5 py-1 rounded-full bg-neutral-950/80 border border-neutral-700/60 hover:border-neutral-500 text-neutral-400 hover:text-white text-[10px] font-bold flex items-center gap-1 transition"
              >
                <RefreshCw className="w-3 h-3" /> Reset
              </button>
            </div>

            {/* 11 Starting Pitch Nodes */}
            <div className="relative w-full h-full my-auto">
              {currentFormationConfig.positions.map((slot, index) => {
                const player = teamSquad.starters[index];
                if (!player) return null;
                const isInspected = inspectedPlayer.id === player.id;
                const isSwapTarget = swapSourceId === player.id;

                return (
                  <button
                    key={player.id}
                    id={`pitch-player-${player.id}`}
                    onClick={() => handleSelectPlayer(player)}
                    onDoubleClick={() => handleSwapClick(player)}
                    style={{
                      top: `${slot.top}%`,
                      left: `${slot.left}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                    className={`absolute group flex flex-col items-center cursor-pointer transition-all duration-200 ${
                      isSwapTarget ? 'scale-125 z-30' : isInspected ? 'scale-115 z-20' : 'hover:scale-110 z-10'
                    }`}
                  >
                    {/* Player Jersey Circle Node */}
                    <div
                      className={`relative w-9 h-9 rounded-full flex items-center justify-center font-display font-black text-xs shadow-lg transition-all ${
                        isSwapTarget
                          ? 'ring-4 ring-amber-400 animate-bounce'
                          : isInspected
                          ? 'ring-3 ring-emerald-400 ring-offset-2 ring-offset-neutral-950'
                          : 'ring-1 ring-white/30'
                      }`}
                      style={{
                        backgroundColor: player.avatarColor || '#eab308',
                        color: '#111827'
                      }}
                    >
                      <span>{player.number}</span>
                      
                      {/* Position Tag Badge */}
                      <span className="absolute -top-2.5 -right-2 px-1 py-0.2 bg-neutral-950 text-white border border-neutral-700 rounded text-[9px] font-bold">
                        {slot.pos}
                      </span>
                    </div>

                    {/* Player Name Pill */}
                    <div className={`mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-tight whitespace-nowrap shadow-md transition ${
                      isInspected 
                        ? 'bg-emerald-500 text-neutral-950 font-black' 
                        : 'bg-neutral-950/90 text-neutral-200 border border-neutral-800'
                    }`}>
                      {player.commonName}
                      <span className="ml-1 text-[9px] font-bold text-amber-400">{player.rating}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Pitch Footer Hint */}
            <div className="relative z-10 flex items-center justify-between text-[10px] text-emerald-200/60 bg-neutral-950/60 backdrop-blur-sm px-3 py-1 rounded-xl border border-emerald-500/20">
              <span>Click player to inspect card</span>
              <span>Double-click or click "Swap" to substitute</span>
            </div>
          </div>
        </section>

        {/* MIDDLE / RIGHT COLUMN: FIFA Profile Card & Roster List / Tactical Instructions (7 cols) */}
        <section className="lg:col-span-7 flex flex-col gap-5">
          
          {/* Top Tabs: Profile & Chemistry vs Full Roster vs Tactical Instructions */}
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setActiveTab('pitch');
                  sound.playUISelect();
                }}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
                  activeTab === 'pitch'
                    ? 'bg-emerald-500 text-neutral-950 font-black shadow-lg shadow-emerald-500/20'
                    : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Player Profile & Attributes</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('roster');
                  sound.playUISelect();
                }}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
                  activeTab === 'roster'
                    ? 'bg-emerald-500 text-neutral-950 font-black shadow-lg shadow-emerald-500/20'
                    : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Full Roster (16 Players)</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('tactics');
                  sound.playUISelect();
                }}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
                  activeTab === 'tactics'
                    ? 'bg-emerald-500 text-neutral-950 font-black shadow-lg shadow-emerald-500/20'
                    : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Custom Tactics</span>
              </button>
            </div>

            {/* Quick Action: Start Match with this squad */}
            {onPlayWithTeam && (
              <button
                id="squad-btn-play-match"
                onClick={() => {
                  sound.playPackOpeningFanfare();
                  onPlayWithTeam(currentBaseTeam);
                }}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 text-neutral-950 font-display font-black text-xs rounded-2xl transition shadow-lg flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>PLAY KICK OFF</span>
              </button>
            )}
          </div>

          {/* TAB 1: PLAYER PROFILE CARD & DEEP ATTRIBUTE BREAKDOWN */}
          {activeTab === 'pitch' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 animate-in fade-in">
              
              {/* FIFA Ultimate Team / Match Profile Card (5 cols) */}
              <div className="md:col-span-5 flex flex-col items-center">
                <div className={`relative w-full max-w-[260px] rounded-3xl p-5 border-2 shadow-2xl ${cardStyle.bg} flex flex-col justify-between transition-all duration-300 hover:scale-105`}>
                  
                  {/* Shimmer / Holographic lines effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent rounded-3xl pointer-events-none" />
                  
                  {/* Top Card Header: Rating, Position, Nation Flag, Club */}
                  <div className="flex items-start justify-between z-10">
                    <div className="flex flex-col items-center leading-none">
                      <span className="font-display font-black text-4xl tracking-tighter">
                        {inspectedPlayer.rating}
                      </span>
                      <span className="font-display font-black text-sm tracking-wider uppercase mt-0.5">
                        {inspectedPlayer.position}
                      </span>
                      <div className="w-6 h-0.5 bg-neutral-950/40 my-1.5" />
                      <span className="text-xl drop-shadow">{inspectedPlayer.nationFlag}</span>
                    </div>

                    {/* Card Tier Badge */}
                    <div className="text-right flex flex-col items-end">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-display font-black tracking-widest uppercase border ${cardStyle.badge}`}>
                        {inspectedPlayer.cardTier}
                      </span>
                      <span className="text-[10px] font-bold mt-1 max-w-[90px] text-right truncate">
                        {inspectedPlayer.club}
                      </span>
                    </div>
                  </div>

                  {/* Player Avatar Bust & Silhouette */}
                  <div className="relative my-4 flex justify-center z-10">
                    <div className="relative w-28 h-28 rounded-full border-4 border-neutral-950/20 flex items-center justify-center shadow-xl overflow-hidden"
                         style={{ backgroundColor: inspectedPlayer.avatarColor }}>
                      <div className="absolute inset-x-0 bottom-0 h-10 bg-neutral-950/20 rounded-t-full" />
                      <div className="absolute top-2 w-12 h-6 rounded-t-full" style={{ backgroundColor: inspectedPlayer.hairColor || '#111827' }} />
                      <span className="font-display font-black text-3xl text-neutral-950/80">
                        {inspectedPlayer.number}
                      </span>
                    </div>
                  </div>

                  {/* Player Name */}
                  <div className="text-center z-10 border-b border-neutral-950/20 pb-2">
                    <h3 className="font-display font-black text-xl tracking-tight uppercase truncate">
                      {inspectedPlayer.name}
                    </h3>
                    <div className="flex items-center justify-center gap-2 text-[10px] font-bold opacity-80 mt-0.5">
                      <span>Foot: {inspectedPlayer.preferredFoot === 'L' ? 'Left' : 'Right'}</span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5">
                        Skill: {inspectedPlayer.specialMoveSkill} <Star className="w-2.5 h-2.5 fill-current" />
                      </span>
                    </div>
                  </div>

                  {/* 6 Key Face Attributes (PAC, SHO, PAS, DRI, DEF, PHY) */}
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 pt-3 text-xs font-bold z-10">
                    <div className="flex items-center justify-between border-b border-neutral-950/10 pb-0.5">
                      <span className="font-black text-sm">{inspectedPlayer.pace}</span>
                      <span className="font-display font-black tracking-wider text-[11px]">PAC</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-neutral-950/10 pb-0.5">
                      <span className="font-black text-sm">{inspectedPlayer.dribbling}</span>
                      <span className="font-display font-black tracking-wider text-[11px]">DRI</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-neutral-950/10 pb-0.5">
                      <span className="font-black text-sm">{inspectedPlayer.shooting}</span>
                      <span className="font-display font-black tracking-wider text-[11px]">SHO</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-neutral-950/10 pb-0.5">
                      <span className="font-black text-sm">{inspectedPlayer.defending}</span>
                      <span className="font-display font-black tracking-wider text-[11px]">DEF</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-neutral-950/10 pb-0.5">
                      <span className="font-black text-sm">{inspectedPlayer.passing}</span>
                      <span className="font-display font-black tracking-wider text-[11px]">PAS</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-neutral-950/10 pb-0.5">
                      <span className="font-black text-sm">{inspectedPlayer.physical}</span>
                      <span className="font-display font-black tracking-wider text-[11px]">PHY</span>
                    </div>
                  </div>
                </div>

                {/* Quick Swap Button for inspected player */}
                <button
                  onClick={() => handleSwapClick(inspectedPlayer)}
                  className={`w-full max-w-[260px] mt-3 py-2.5 rounded-2xl font-display font-black text-xs transition flex items-center justify-center gap-2 cursor-pointer ${
                    swapSourceId === inspectedPlayer.id
                      ? 'bg-amber-400 text-neutral-950 animate-pulse'
                      : 'bg-neutral-800 hover:bg-neutral-700 text-white'
                  }`}
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span>{swapSourceId === inspectedPlayer.id ? 'Cancel Swap' : 'Swap Player In Lineup'}</span>
                </button>
              </div>

              {/* Detailed Radar Bars & Attribute Breakdown (7 cols) */}
              <div className="md:col-span-7 space-y-4">
                <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-5 shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                    <div>
                      <h4 className="font-display font-black text-base text-white flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-400" />
                        TECHNICAL ATTRIBUTES
                      </h4>
                      <p className="text-[11px] text-neutral-400">
                        Detailed FIFA ratings & in-game physical breakdown
                      </p>
                    </div>
                    <span className="text-xs font-bold text-amber-400">
                      Jersey #{inspectedPlayer.number}
                    </span>
                  </div>

                  {/* 6 Key Attribute Bars */}
                  <div className="space-y-3">
                    {/* Pace */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-neutral-300">Pace (Sprint Speed & Acceleration)</span>
                        <span className="text-emerald-400">{inspectedPlayer.pace}</span>
                      </div>
                      <div className="w-full h-2 bg-neutral-950 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" style={{ width: `${inspectedPlayer.pace}%` }} />
                      </div>
                    </div>

                    {/* Shooting */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-neutral-300">Shooting (Finishing & Power)</span>
                        <span className="text-rose-400">{inspectedPlayer.shooting}</span>
                      </div>
                      <div className="w-full h-2 bg-neutral-950 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full" style={{ width: `${inspectedPlayer.shooting}%` }} />
                      </div>
                    </div>

                    {/* Passing */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-neutral-300">Passing (Vision & Crossing)</span>
                        <span className="text-amber-400">{inspectedPlayer.passing}</span>
                      </div>
                      <div className="w-full h-2 bg-neutral-950 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full" style={{ width: `${inspectedPlayer.passing}%` }} />
                      </div>
                    </div>

                    {/* Dribbling */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-neutral-300">Dribbling (Agility & Ball Control)</span>
                        <span className="text-cyan-400">{inspectedPlayer.dribbling}</span>
                      </div>
                      <div className="w-full h-2 bg-neutral-950 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 rounded-full" style={{ width: `${inspectedPlayer.dribbling}%` }} />
                      </div>
                    </div>

                    {/* Defending */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-neutral-300">Defending (Tackling & Interceptions)</span>
                        <span className="text-blue-400">{inspectedPlayer.defending}</span>
                      </div>
                      <div className="w-full h-2 bg-neutral-950 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" style={{ width: `${inspectedPlayer.defending}%` }} />
                      </div>
                    </div>

                    {/* Physical */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-neutral-300">Physical (Strength & Stamina)</span>
                        <span className="text-purple-400">{inspectedPlayer.physical}</span>
                      </div>
                      <div className="w-full h-2 bg-neutral-950 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" style={{ width: `${inspectedPlayer.physical}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Sub-Specialties Pill Grid */}
                  <div className="pt-2 border-t border-neutral-800">
                    <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
                      KEY IN-GAME TRAITS & SPECIALTIES
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {inspectedPlayer.pace >= 88 && (
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold flex items-center gap-1">
                          <Zap className="w-3 h-3 text-emerald-400" /> Speedster / Rapid
                        </span>
                      )}
                      {inspectedPlayer.shooting >= 85 && (
                        <span className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[10px] font-bold flex items-center gap-1">
                          <Flame className="w-3 h-3 text-rose-400" /> Clinical Finisher
                        </span>
                      )}
                      {inspectedPlayer.passing >= 86 && (
                        <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-bold flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-400" /> Playmaker Vision
                        </span>
                      )}
                      {inspectedPlayer.dribbling >= 88 && (
                        <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold flex items-center gap-1">
                          <Star className="w-3 h-3 text-cyan-400" /> Technical Dribbler
                        </span>
                      )}
                      {inspectedPlayer.defending >= 85 && (
                        <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 text-[10px] font-bold flex items-center gap-1">
                          <Shield className="w-3 h-3 text-blue-400" /> Defensive Anchor
                        </span>
                      )}
                      {inspectedPlayer.physical >= 82 && (
                        <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[10px] font-bold flex items-center gap-1">
                          <Award className="w-3 h-3 text-purple-400" /> Aerial Enforcer
                        </span>
                      )}
                      <span className="px-2.5 py-1 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-400 text-[10px] font-bold">
                        {inspectedPlayer.preferredFoot === 'L' ? 'Left-Footed Specialist' : 'Right-Footed Maestro'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Substitutes Quick Bench Carousel */}
                <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-4 shadow-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="font-display font-black text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                      <ArrowLeftRight className="w-3.5 h-3.5 text-amber-400" />
                      SUBSTITUTES & RESERVES BENCH ({teamSquad.subs.length})
                    </h5>
                    <span className="text-[10px] text-neutral-400">Click to inspect or swap</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {teamSquad.subs.map((sub) => {
                      const isInspected = inspectedPlayer.id === sub.id;
                      const isSwap = swapSourceId === sub.id;
                      return (
                        <button
                          key={sub.id}
                          onClick={() => handleSelectPlayer(sub)}
                          onDoubleClick={() => handleSwapClick(sub)}
                          className={`p-2.5 rounded-2xl border flex flex-col items-center gap-1 transition text-center cursor-pointer ${
                            isSwap
                              ? 'bg-amber-500/20 border-amber-400 text-white animate-pulse'
                              : isInspected
                              ? 'bg-emerald-500/20 border-emerald-400 text-white'
                              : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                          }`}
                        >
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] px-1 py-0.2 bg-neutral-800 text-neutral-300 rounded font-bold">
                              {sub.position}
                            </span>
                            <span className="text-xs font-display font-black text-amber-400">{sub.rating}</span>
                          </div>
                          <div className="text-xs font-bold truncate max-w-full">{sub.commonName}</div>
                          <div className="text-[9px] text-neutral-400">#{sub.number}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FULL ROSTER TABLE & SEARCH / SORT (16 PLAYERS) */}
          {activeTab === 'roster' && (
            <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-5 shadow-xl space-y-4 animate-in fade-in">
              {/* Search & Filters */}
              <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
                {/* Search input */}
                <div className="relative w-full md:w-64">
                  <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search player, club, position..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-2xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {/* Filter categories */}
                <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1">
                  {[
                    { key: 'all', label: 'All (16)' },
                    { key: 'starters', label: 'Starters (11)' },
                    { key: 'subs', label: 'Bench (5)' },
                    { key: 'gk', label: 'GK' },
                    { key: 'def', label: 'DEF' },
                    { key: 'mid', label: 'MID' },
                    { key: 'fwd', label: 'FWD' },
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => {
                        setRosterFilter(tab.key as typeof rosterFilter);
                        sound.playUISelect();
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                        rosterFilter === tab.key
                          ? 'bg-emerald-500 text-neutral-950 font-black'
                          : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Sort selector */}
                <div className="flex items-center gap-2 self-end md:self-auto text-xs">
                  <span className="text-neutral-400 text-[10px] font-bold uppercase">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className="bg-neutral-950 border border-neutral-700 rounded-xl px-2.5 py-1.5 text-xs text-white font-bold focus:outline-none"
                  >
                    <option value="rating">Rating (OVR)</option>
                    <option value="pace">Pace (PAC)</option>
                    <option value="shooting">Shooting (SHO)</option>
                    <option value="passing">Passing (PAS)</option>
                    <option value="dribbling">Dribbling (DRI)</option>
                    <option value="defending">Defending (DEF)</option>
                    <option value="physical">Physical (PHY)</option>
                    <option value="number">Jersey #</option>
                  </select>
                </div>
              </div>

              {/* Roster Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-800 text-neutral-400 font-bold text-[10px] uppercase tracking-wider">
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Player</th>
                      <th className="py-2.5 px-2">Pos</th>
                      <th className="py-2.5 px-2 text-center">OVR</th>
                      <th className="py-2.5 px-2 text-center">PAC</th>
                      <th className="py-2.5 px-2 text-center">SHO</th>
                      <th className="py-2.5 px-2 text-center">PAS</th>
                      <th className="py-2.5 px-2 text-center">DRI</th>
                      <th className="py-2.5 px-2 text-center">DEF</th>
                      <th className="py-2.5 px-2 text-center">PHY</th>
                      <th className="py-2.5 px-3">Club</th>
                      <th className="py-2.5 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60">
                    {filteredRoster.map((player) => {
                      const isStarter = teamSquad.starters.some(s => s.id === player.id);
                      const isInspected = inspectedPlayer.id === player.id;
                      const isSwap = swapSourceId === player.id;

                      return (
                        <tr
                          key={player.id}
                          onClick={() => handleSelectPlayer(player)}
                          className={`group cursor-pointer transition ${
                            isSwap
                              ? 'bg-amber-500/20 text-white'
                              : isInspected
                              ? 'bg-emerald-500/15 text-white'
                              : 'hover:bg-neutral-800/40 text-neutral-300'
                          }`}
                        >
                          <td className="py-3 px-3 font-bold text-neutral-400">{player.number}</td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] text-neutral-950 flex-shrink-0"
                                style={{ backgroundColor: player.avatarColor }}
                              >
                                {player.number}
                              </div>
                              <div>
                                <div className="font-bold text-white flex items-center gap-1.5">
                                  <span>{player.name}</span>
                                  {player.cardTier === 'icon' && <span className="text-[9px] px-1 py-0.2 rounded bg-amber-400 text-neutral-950 font-black">ICON</span>}
                                </div>
                                <div className="text-[10px] text-neutral-400">{player.nationality}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <span className="px-1.5 py-0.5 rounded bg-neutral-950 border border-neutral-700 text-neutral-200 font-bold text-[10px]">
                              {player.position}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-center font-display font-black text-emerald-400 text-sm">{player.rating}</td>
                          <td className="py-3 px-2 text-center font-bold">{player.pace}</td>
                          <td className="py-3 px-2 text-center font-bold">{player.shooting}</td>
                          <td className="py-3 px-2 text-center font-bold">{player.passing}</td>
                          <td className="py-3 px-2 text-center font-bold">{player.dribbling}</td>
                          <td className="py-3 px-2 text-center font-bold">{player.defending}</td>
                          <td className="py-3 px-2 text-center font-bold">{player.physical}</td>
                          <td className="py-3 px-3 text-neutral-400 truncate max-w-[120px]">{player.club}</td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSwapClick(player);
                              }}
                              className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition ${
                                isStarter
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500 hover:text-neutral-950'
                                  : 'bg-neutral-800 text-neutral-400 hover:bg-amber-400 hover:text-neutral-950'
                              }`}
                            >
                              {isStarter ? 'Starter' : 'Substitute'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOM TACTICS & GAMEPLAN */}
          {activeTab === 'tactics' && (
            <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 shadow-xl space-y-6 animate-in fade-in">
              <div className="border-b border-neutral-800 pb-3">
                <h4 className="font-display font-black text-lg text-white flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-emerald-400" />
                  CUSTOM TACTICAL GAMEPLAN
                </h4>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Configure playstyle parameters, defensive line width, build-up tempo, and box crosses.
                </p>
              </div>

              {/* Tactical Styles Selector Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {TACTICAL_STYLES.map((tac) => {
                  const isActive = teamSquad.tacticalStyle === tac.name;
                  return (
                    <button
                      key={tac.name}
                      onClick={() => handleChangeTactics(tac.name)}
                      className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between gap-2 cursor-pointer ${
                        isActive
                          ? 'bg-emerald-950/60 border-emerald-400 text-white shadow-lg'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-display font-black text-sm text-white">{tac.name}</span>
                        {isActive && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      </div>
                      <p className="text-[11px] leading-relaxed text-neutral-300">
                        {tac.desc}
                      </p>
                      <div className="flex items-center justify-between text-[10px] font-bold text-neutral-400 pt-2 border-t border-neutral-800/80">
                        <span>Tempo: <strong className="text-amber-400">{tac.tempo}</strong></span>
                        <span>Defense: <strong className="text-blue-400">{tac.defense}</strong></span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Slider Settings preview */}
              <div className="space-y-4 pt-2 border-t border-neutral-800 text-xs">
                <div className="space-y-1">
                  <div className="flex justify-between font-bold">
                    <span className="text-neutral-300">Defensive Depth & Line Height</span>
                    <span className="text-emerald-400">72 (High Pressing Line)</span>
                  </div>
                  <input type="range" min="20" max="90" defaultValue="72" className="w-full accent-emerald-500" />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-bold">
                    <span className="text-neutral-300">Attacking Width & Flank Overloads</span>
                    <span className="text-emerald-400">65 (Wide Support)</span>
                  </div>
                  <input type="range" min="30" max="90" defaultValue="65" className="w-full accent-emerald-500" />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-bold">
                    <span className="text-neutral-300">Players in Box on Crosses</span>
                    <span className="text-emerald-400">5 Attackers</span>
                  </div>
                  <input type="range" min="2" max="7" defaultValue="5" className="w-full accent-emerald-500" />
                </div>
              </div>
            </div>
          )}

        </section>
      </main>

      {/* Footer Navigation Bar */}
      <footer className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-500 border-t border-neutral-800 pt-3 z-10">
        <div>Official FIFA 26 Squad Management & Lineup Engine</div>
        <div className="flex items-center gap-3">
          <span>Active Squad: <strong className="text-neutral-300">{currentBaseTeam.name}</strong></span>
          <span>•</span>
          <span>Formation: <strong className="text-emerald-400">{teamSquad.formation}</strong></span>
          <span>•</span>
          <span>Tactics: <strong className="text-amber-400">{teamSquad.tacticalStyle}</strong></span>
        </div>
      </footer>
    </div>
  );
};
