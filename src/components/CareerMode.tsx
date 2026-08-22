import React, { useState } from 'react';
import { Team, Player, MatchStats } from '../types';
import { TEAMS } from '../data/teams';
import { ALL_PLAYERS } from '../data/players';
import { sound } from '../utils/audio';
import { 
  Briefcase, 
  ArrowLeft, 
  DollarSign, 
  TrendingUp, 
  Shield, 
  Users, 
  Play, 
  Calendar,
  CheckCircle,
  Plus,
  ArrowUpRight
} from 'lucide-react';

interface CareerModeProps {
  onBack: () => void;
  onPlayMatch: (home: Team, away: Team, onFinish: (stats: MatchStats, homeScore: number, awayScore: number) => void) => void;
}

export const CareerMode: React.FC<CareerModeProps> = ({
  onBack,
  onPlayMatch
}) => {
  const [selectedTeam, setSelectedTeam] = useState<Team>(TEAMS[0]); // Default Argentina
  const [managerName, setManagerName] = useState<string>('Alex Ferguson');
  const [isCareerStarted, setIsCareerStarted] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'hub' | 'squad' | 'transfers' | 'tactics'>('hub');

  // Career Financials & Calendar
  const [transferBudget, setTransferBudget] = useState<number>(120000000); // $120M
  const [wageBudget, setWageBudget] = useState<number>(1500000); // $1.5M/week
  const [matchWeek, setMatchWeek] = useState<number>(1);
  const [managerRating, setManagerRating] = useState<number>(92);

  // League Standings
  const [standings, setStandings] = useState([
    { rank: 1, team: TEAMS[0].name, played: 0, points: 0, gd: 0 },
    { rank: 2, team: TEAMS[1].name, played: 0, points: 0, gd: 0 },
    { rank: 3, team: TEAMS[2].name, played: 0, points: 0, gd: 0 },
    { rank: 4, team: TEAMS[3].name, played: 0, points: 0, gd: 0 },
    { rank: 5, team: TEAMS[4].name, played: 0, points: 0, gd: 0 },
    { rank: 6, team: TEAMS[5].name, played: 0, points: 0, gd: 0 },
  ]);

  // Squad Players for the managed club
  const [squad, setSquad] = useState<Player[]>(selectedTeam.players);

  // Transfer Market Pool (Players available to sign)
  const [transferMarket, setTransferMarket] = useState<{ player: Player; price: number; wage: number }[]>([
    { player: ALL_PLAYERS[11], price: 160000000, wage: 450000 }, // Mbappé
    { player: ALL_PLAYERS[22], price: 120000000, wage: 280000 }, // Lamine Yamal
    { player: ALL_PLAYERS[33], price: 140000000, wage: 350000 }, // Bellingham
    { player: ALL_PLAYERS[45], price: 135000000, wage: 320000 }, // Vinicius Jr
    { player: ALL_PLAYERS[25], price: 95000000, wage: 260000 }, // Rodri
    { player: ALL_PLAYERS[71], price: 175000000, wage: 420000 }, // Haaland
  ]);

  // Handle Buy Transfer
  const handleBuyPlayer = (target: { player: Player; price: number; wage: number }) => {
    if (transferBudget < target.price) {
      alert("Transfer budget insufficient for this blockbuster signing!");
      return;
    }

    setTransferBudget(b => b - target.price);
    setSquad(prev => [target.player, ...prev]);
    setTransferMarket(prev => prev.filter(t => t.player.id !== target.player.id));
    sound.playPackOpeningFanfare();
    alert(`OFFICIAL SIGNING: ${target.player.name} has joined ${selectedTeam.name} on a 5-year contract!`);
  };

  // Play or Simulate Matchweek
  const handleAdvanceMatchweek = (simulateOnly: boolean = false) => {
    const opponent = TEAMS.find(t => t.id !== selectedTeam.id) || TEAMS[1];

    if (simulateOnly) {
      sound.playWhistle('short');
      const homeGoals = Math.floor(Math.random() * 3 + 1);
      const awayGoals = Math.floor(Math.random() * 2);
      processMatchResult(homeGoals, awayGoals, opponent.name);
    } else {
      onPlayMatch(selectedTeam, opponent, (_stats, hScore, aScore) => {
        processMatchResult(hScore, aScore, opponent.name);
      });
    }
  };

  const processMatchResult = (hScore: number, aScore: number, oppName: string) => {
    setMatchWeek(w => w + 1);
    setStandings(prev => {
      const isWin = hScore > aScore;
      const isDraw = hScore === aScore;
      const ptsEarned = isWin ? 3 : isDraw ? 1 : 0;

      return prev.map(s => {
        if (s.team === selectedTeam.name) {
          return {
            ...s,
            played: s.played + 1,
            points: s.points + ptsEarned,
            gd: s.gd + (hScore - aScore)
          };
        }
        return {
          ...s,
          played: s.played + 1,
          points: s.points + Math.floor(Math.random() * 3),
          gd: s.gd + Math.floor(Math.random() * 3 - 1)
        };
      }).sort((a, b) => b.points - a.points || b.gd - a.gd);
    });

    if (hScore > aScore) {
      setManagerRating(r => Math.min(99, r + 1));
    }
  };

  if (!isCareerStarted) {
    return (
      <div className="w-full min-h-screen bg-neutral-950 text-neutral-100 p-6 flex flex-col items-center justify-center font-sans-ui">
        <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-3xl p-8 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" /> Main Menu
            </button>
            <div className="flex items-center gap-2 text-xs font-display font-bold text-emerald-400">
              <Briefcase className="w-4 h-4" /> MANAGER CAREER MODE
            </div>
          </div>

          <div className="text-center space-y-1">
            <h2 className="text-3xl font-display font-black text-white">MANAGER PROFILE SETUP</h2>
            <p className="text-xs text-neutral-400">
              Create your managerial persona and take the helm of a world-class squad.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">Manager Name</label>
              <input
                type="text"
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">Select Club / National Squad</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {TEAMS.map((team) => (
                  <button
                    key={team.id}
                    onClick={() => {
                      setSelectedTeam(team);
                      setSquad(team.players);
                    }}
                    className={`p-3 rounded-xl border flex flex-col items-center text-center transition ${
                      selectedTeam.id === team.id
                        ? 'bg-emerald-950/50 border-emerald-500 text-white'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <span className="text-2xl mb-1">{team.flag}</span>
                    <span className="font-bold text-xs">{team.name}</span>
                    <span className="text-[10px] text-amber-400">{team.overall} OVR</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setIsCareerStarted(true);
              sound.playPackOpeningFanfare();
            }}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-display font-black text-base rounded-2xl transition shadow-xl"
          >
            START 2026/27 SEASON
          </button>
        </div>
      </div>
    );
  }

  // Active Career Dashboard
  return (
    <div className="w-full min-h-screen bg-neutral-950 text-neutral-100 p-6 flex flex-col items-center font-sans-ui">
      <div className="w-full max-w-6xl space-y-6">
        {/* Top Manager Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-3xl">{selectedTeam.flag}</span>
                <div>
                  <h2 className="font-display font-black text-xl text-white">
                    {selectedTeam.name.toUpperCase()}
                  </h2>
                  <p className="text-xs text-neutral-400 font-medium">
                    Manager: <span className="text-emerald-400 font-bold">{managerName}</span> • Matchweek {matchWeek}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Budget Counters & Manager Rating */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="bg-neutral-950 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
              <span className="text-neutral-400 block text-[10px]">Transfer Budget</span>
              <span className="font-display font-bold text-emerald-400 text-sm">
                ${(transferBudget / 1000000).toFixed(1)}M
              </span>
            </div>

            <div className="bg-neutral-950 border border-amber-500/30 px-3 py-1.5 rounded-xl">
              <span className="text-neutral-400 block text-[10px]">Board Rating</span>
              <span className="font-display font-bold text-amber-400 text-sm">{managerRating}/100</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-neutral-800 pb-2 text-sm font-display font-bold">
          <button
            onClick={() => setActiveTab('hub')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'hub' ? 'bg-emerald-600 text-neutral-950' : 'text-neutral-400 hover:text-white'
            }`}
          >
            CENTRAL HUB
          </button>
          <button
            onClick={() => setActiveTab('squad')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'squad' ? 'bg-emerald-600 text-neutral-950' : 'text-neutral-400 hover:text-white'
            }`}
          >
            SQUAD ROSTER ({squad.length})
          </button>
          <button
            onClick={() => setActiveTab('transfers')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'transfers' ? 'bg-emerald-600 text-neutral-950' : 'text-neutral-400 hover:text-white'
            }`}
          >
            TRANSFER MARKET
          </button>
        </div>

        {/* TAB 1: CENTRAL HUB */}
        {activeTab === 'hub' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Next Fixture Card */}
            <div className="bg-gradient-to-b from-neutral-900 to-neutral-950 border border-neutral-800 rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between text-xs text-neutral-400 border-b border-neutral-800 pb-2">
                <span className="flex items-center gap-1.5 font-bold text-emerald-400">
                  <Calendar className="w-4 h-4" /> NEXT FIXTURE
                </span>
                <span>Matchweek {matchWeek}</span>
              </div>

              <div className="flex items-center justify-around py-4">
                <div className="text-center space-y-1">
                  <span className="text-4xl">{selectedTeam.flag}</span>
                  <div className="font-display font-bold text-sm text-white">{selectedTeam.shortName}</div>
                </div>
                <span className="font-display font-black text-xl text-neutral-600">VS</span>
                <div className="text-center space-y-1">
                  <span className="text-4xl">{TEAMS[1].flag}</span>
                  <div className="font-display font-bold text-sm text-white">{TEAMS[1].shortName}</div>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => handleAdvanceMatchweek(false)}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-display font-black text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-lg"
                >
                  <Play className="w-4 h-4 fill-current" /> PLAY MATCH ON PITCH
                </button>
                <button
                  onClick={() => handleAdvanceMatchweek(true)}
                  className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs rounded-xl transition"
                >
                  Quick Sim Matchweek
                </button>
              </div>
            </div>

            {/* League Standings Table */}
            <div className="md:col-span-2 bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5 space-y-3">
              <h3 className="font-display font-bold text-sm text-neutral-200">LEAGUE TABLE</h3>
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-neutral-500 font-display text-[11px] border-b border-neutral-800 pb-2">
                    <th className="text-left pb-2">POS</th>
                    <th className="text-left pb-2">CLUB</th>
                    <th className="text-center pb-2">P</th>
                    <th className="text-center pb-2">GD</th>
                    <th className="text-center pb-2 font-bold text-white">PTS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {standings.map((row) => (
                    <tr
                      key={row.rank}
                      className={row.team === selectedTeam.name ? 'bg-emerald-950/40 text-emerald-300 font-bold' : ''}
                    >
                      <td className="py-2.5 text-neutral-400">{row.rank}</td>
                      <td className="py-2.5">{row.team}</td>
                      <td className="text-center py-2.5">{row.played}</td>
                      <td className="text-center py-2.5">{row.gd}</td>
                      <td className="text-center py-2.5 font-display font-bold text-white">{row.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: SQUAD ROSTER */}
        {activeTab === 'squad' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {squad.map((player) => (
              <div
                key={player.id}
                className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-display font-black text-emerald-400 text-xs">
                    {player.number}
                  </div>
                  <span className="font-display font-black text-amber-400 text-base">{player.rating} OVR</span>
                </div>
                <div>
                  <div className="font-bold text-sm text-white flex items-center gap-1.5">
                    <span>{player.name}</span>
                    <span>{player.nationFlag}</span>
                  </div>
                  <div className="text-xs text-neutral-400">{player.position} • {player.preferredFoot} Foot</div>
                </div>
                <div className="grid grid-cols-3 gap-1 text-[10px] font-display text-neutral-400 pt-2 border-t border-neutral-800">
                  <div>PAC <span className="text-white font-bold">{player.pace}</span></div>
                  <div>SHO <span className="text-white font-bold">{player.shooting}</span></div>
                  <div>PAS <span className="text-white font-bold">{player.passing}</span></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: TRANSFER MARKET */}
        {activeTab === 'transfers' && (
          <div className="space-y-4">
            <h3 className="font-display font-black text-lg text-white">WORLD-CLASS SCOUTED PLAYERS</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {transferMarket.map((target) => (
                <div
                  key={target.player.id}
                  className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-14 rounded-xl bg-gradient-to-b from-amber-500/20 to-neutral-950 border border-amber-500/40 flex flex-col items-center justify-center font-display font-black text-amber-400">
                      <span className="text-sm">{target.player.rating}</span>
                      <span className="text-[9px] text-neutral-400">{target.player.position}</span>
                    </div>
                    <div>
                      <div className="font-bold text-sm text-white flex items-center gap-1.5">
                        <span>{target.player.name}</span>
                        <span>{target.player.nationFlag}</span>
                      </div>
                      <div className="text-xs text-neutral-400">{target.player.club}</div>
                      <div className="text-xs font-bold text-emerald-400 mt-1">
                        Fee: ${(target.price / 1000000).toFixed(0)}M • ${(target.wage / 1000).toFixed(0)}k/wk
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleBuyPlayer(target)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-display font-bold text-xs rounded-xl transition shadow-lg shrink-0 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Sign Player
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
