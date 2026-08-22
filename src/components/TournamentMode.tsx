import React, { useState } from 'react';
import { Team, TournamentTeamStats, KnockoutMatch, MatchStats, GameSettings } from '../types';
import { TEAMS } from '../data/teams';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  Play, 
  Sparkles, 
  ChevronRight, 
  Shield, 
  ArrowLeft, 
  Medal, 
  Calendar,
  Flame,
  CheckCircle2
} from 'lucide-react';

interface TournamentModeProps {
  onStartMatch: (home: Team, away: Team, onMatchFinished?: (stats: MatchStats, homeScore: number, awayScore: number) => void) => void;
  onBack: () => void;
  settings: GameSettings;
}

export const TournamentMode: React.FC<TournamentModeProps> = ({
  onStartMatch,
  onBack,
  settings
}) => {
  const [selectedUserTeam, setSelectedUserTeam] = useState<Team | null>(null);
  const [tournamentStarted, setTournamentStarted] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'groups' | 'knockout' | 'stats'>('groups');
  const [champion, setChampion] = useState<Team | null>(null);

  // Group A & Group B setups
  const [groupA, setGroupA] = useState<TournamentTeamStats[]>([
    { team: TEAMS[0], played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, pts: 0 }, // Argentina
    { team: TEAMS[2], played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, pts: 0 }, // Spain
    { team: TEAMS[4], played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, pts: 0 }, // Brazil
    { team: TEAMS[6], played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, pts: 0 }, // USA
  ]);

  const [groupB, setGroupB] = useState<TournamentTeamStats[]>([
    { team: TEAMS[1], played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, pts: 0 }, // France
    { team: TEAMS[3], played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, pts: 0 }, // England
    { team: TEAMS[5], played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, pts: 0 }, // Portugal
    { team: TEAMS[7], played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, pts: 0 }, // Icons
  ]);

  // Knockout Tree
  const [semiFinals, setSemiFinals] = useState<KnockoutMatch[]>([
    { id: 'sf1', stageName: 'Semi-Final 1 (SoFi Stadium)', homeTeam: TEAMS[0], awayTeam: TEAMS[3], isCompleted: false },
    { id: 'sf2', stageName: 'Semi-Final 2 (AT&T Stadium)', homeTeam: TEAMS[1], awayTeam: TEAMS[2], isCompleted: false }
  ]);

  const [grandFinal, setGrandFinal] = useState<KnockoutMatch>({
    id: 'final',
    stageName: 'Grand Final (MetLife Stadium, New York)',
    homeTeam: TEAMS[0],
    awayTeam: TEAMS[1],
    isCompleted: false
  });

  const handleSelectTeam = (team: Team) => {
    sound.playUISelect();
    setSelectedUserTeam(team);
  };

  const startTournament = () => {
    if (!selectedUserTeam) return;
    sound.playPackOpeningFanfare();
    setTournamentStarted(true);
  };

  // Simulate a fixture with smart rating weighting
  const simulateMatch = (home: Team, away: Team): [number, number] => {
    const homeWeight = home.overall + 3; // Home advantage
    const awayWeight = away.overall;
    const diff = (homeWeight - awayWeight) / 10;

    let homeScore = Math.floor(Math.max(0, Math.random() * 3 + diff));
    let awayScore = Math.floor(Math.max(0, Math.random() * 3 - diff));

    if (homeScore === awayScore && Math.random() > 0.5) {
      if (homeWeight > awayWeight) homeScore += 1;
      else awayScore += 1;
    }

    return [homeScore, awayScore];
  };

  // Play or Simulate next match
  const handlePlayFixture = (home: Team, away: Team, onFinish: (hScore: number, aScore: number) => void) => {
    if (selectedUserTeam && (home.id === selectedUserTeam.id || away.id === selectedUserTeam.id)) {
      // User is playing!
      onStartMatch(home, away, (_stats, hScore, aScore) => {
        onFinish(hScore, aScore);
      });
    } else {
      // Simulate AI match instantly
      const [hScore, aScore] = simulateMatch(home, away);
      sound.playKick('shoot');
      onFinish(hScore, aScore);
    }
  };

  const handleSimulateGroupStage = () => {
    sound.playWhistle('double');
    const updateStats = (group: TournamentTeamStats[]) => {
      return group.map(t => {
        const won = Math.floor(Math.random() * 2 + 1);
        const drawn = Math.floor(Math.random() * 2);
        const lost = 3 - won - drawn;
        const gf = won * 2 + drawn;
        const ga = lost * 2;
        return {
          ...t,
          played: 3,
          won,
          drawn,
          lost,
          gf,
          ga,
          pts: won * 3 + drawn
        };
      }).sort((a, b) => b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga));
    };

    const newA = updateStats(groupA);
    const newB = updateStats(groupB);
    setGroupA(newA);
    setGroupB(newB);

    // Seed Semi-Finals (Winner A vs Runner-up B, Winner B vs Runner-up A)
    setSemiFinals([
      { id: 'sf1', stageName: 'Semi-Final 1 (SoFi Stadium)', homeTeam: newA[0].team, awayTeam: newB[1].team, isCompleted: false },
      { id: 'sf2', stageName: 'Semi-Final 2 (AT&T Stadium)', homeTeam: newB[0].team, awayTeam: newA[1].team, isCompleted: false }
    ]);
    setActiveTab('knockout');
  };

  const handlePlaySemiFinal = (index: number) => {
    const match = semiFinals[index];
    handlePlayFixture(match.homeTeam, match.awayTeam, (hScore, aScore) => {
      const winner = hScore >= aScore ? match.homeTeam : match.awayTeam;
      const updated = [...semiFinals];
      updated[index] = {
        ...match,
        homeScore: hScore,
        awayScore: aScore,
        winner,
        isCompleted: true
      };
      setSemiFinals(updated);

      // If both completed, update Grand Final
      if (updated.every(m => m.isCompleted)) {
        setGrandFinal({
          ...grandFinal,
          homeTeam: updated[0].winner!,
          awayTeam: updated[1].winner!,
          isCompleted: false
        });
      }
    });
  };

  const handlePlayFinal = () => {
    handlePlayFixture(grandFinal.homeTeam, grandFinal.awayTeam, (hScore, aScore) => {
      // Ensure winner in final
      let finalHScore = hScore;
      let finalAScore = aScore;
      if (finalHScore === finalAScore) {
        finalHScore += 1; // Extra time decider
      }
      const winner = finalHScore > finalAScore ? grandFinal.homeTeam : grandFinal.awayTeam;
      setGrandFinal({
        ...grandFinal,
        homeScore: finalHScore,
        awayScore: finalAScore,
        winner,
        isCompleted: true
      });
      setChampion(winner);
      sound.playPackOpeningFanfare();
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.5 }
      });
    });
  };

  if (!tournamentStarted) {
    return (
      <div className="w-full min-h-screen bg-neutral-950 text-neutral-100 p-6 flex flex-col items-center justify-center font-sans-ui">
        <div className="w-full max-w-4xl space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-neutral-300 text-sm font-semibold transition"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Main Menu
            </button>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-display font-bold uppercase tracking-wider">
              <Trophy className="w-3.5 h-3.5" /> Official Tournament Mode
            </div>
          </div>

          <div className="text-center space-y-2">
            <h1 className="text-4xl md:text-5xl font-display font-black text-white tracking-tight">
              FIFA WORLD CUP 2026™
            </h1>
            <p className="text-neutral-400 text-sm max-w-xl mx-auto">
              Select your national squad and embark on the road to glory across USA, Canada, and Mexico to lift the most prestigious trophy in sports history.
            </p>
          </div>

          {/* Team Grid Selection */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {TEAMS.map((team) => {
              const isSelected = selectedUserTeam?.id === team.id;
              return (
                <div
                  key={team.id}
                  onClick={() => handleSelectTeam(team)}
                  className={`relative p-5 rounded-2xl border transition-all cursor-pointer flex flex-col items-center text-center space-y-3 group ${
                    isSelected
                      ? 'bg-emerald-950/40 border-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.3)] scale-[1.03]'
                      : 'bg-neutral-900/80 hover:bg-neutral-800/90 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <span className="text-5xl drop-shadow-md group-hover:scale-110 transition duration-300">
                    {team.flag}
                  </span>
                  <div>
                    <h3 className="font-display font-bold text-lg text-white">{team.name}</h3>
                    <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-400 mt-1">
                      <span className="text-amber-400 font-bold">{team.overall} OVR</span>
                      <span>•</span>
                      <span>{team.formation}</span>
                    </div>
                  </div>
                  <div className="w-full grid grid-cols-3 gap-1 pt-2 border-t border-neutral-800/80 text-[10px] text-neutral-400 font-display">
                    <div>
                      <div className="text-emerald-400 font-bold">{team.attack}</div>
                      <div>ATT</div>
                    </div>
                    <div>
                      <div className="text-blue-400 font-bold">{team.midfield}</div>
                      <div>MID</div>
                    </div>
                    <div>
                      <div className="text-purple-400 font-bold">{team.defense}</div>
                      <div>DEF</div>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-500 text-neutral-950 flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Launch Tournament Button */}
          <div className="flex justify-center pt-4">
            <button
              onClick={startTournament}
              disabled={!selectedUserTeam}
              className={`px-8 py-4 rounded-2xl font-display font-black text-lg tracking-wider flex items-center gap-3 transition shadow-2xl ${
                selectedUserTeam
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-neutral-950 hover:brightness-110 cursor-pointer shadow-emerald-900/40 animate-pulse'
                  : 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700'
              }`}
            >
              <Trophy className="w-5 h-5" />
              <span>START WORLD CUP CAMPAIGN</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Tournament Hub / Bracket Active View
  return (
    <div className="w-full min-h-screen bg-neutral-950 text-neutral-100 p-6 flex flex-col items-center font-sans-ui">
      <div className="w-full max-w-6xl space-y-6">
        {/* Top Hub Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{selectedUserTeam?.flag}</span>
                <h2 className="font-display font-black text-xl text-white">
                  {selectedUserTeam?.name} WORLD CUP RUN
                </h2>
              </div>
              <p className="text-xs text-neutral-400">Road to the Trophy • 2026 Finals</p>
            </div>
          </div>

          {/* Mode Tabs */}
          <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-xs font-bold">
            <button
              onClick={() => setActiveTab('groups')}
              className={`px-4 py-2 rounded-lg transition ${
                activeTab === 'groups' ? 'bg-emerald-500 text-neutral-950' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Group Stages
            </button>
            <button
              onClick={() => setActiveTab('knockout')}
              className={`px-4 py-2 rounded-lg transition ${
                activeTab === 'knockout' ? 'bg-emerald-500 text-neutral-950' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Knockout Bracket
            </button>
          </div>
        </div>

        {/* Champion Banner if finished */}
        {champion && (
          <div className="w-full bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-amber-500/20 border border-amber-500/50 rounded-2xl p-6 text-center space-y-3 shadow-[0_0_40px_rgba(245,158,11,0.2)] animate-in zoom-in-95">
            <div className="inline-flex p-3 rounded-full bg-amber-500 text-neutral-950 shadow-lg">
              <Trophy className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-display font-black text-white">
              {champion.name.toUpperCase()} ARE WORLD CHAMPIONS!
            </h1>
            <p className="text-neutral-300 text-sm">
              Congratulations! {champion.name} have conquered the world in the FIFA World Cup 2026!
            </p>
          </div>
        )}

        {/* Tab 1: Group Standings */}
        {activeTab === 'groups' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Group A */}
              <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <h3 className="font-display font-black text-lg text-emerald-400">GROUP A</h3>
                  <span className="text-xs text-neutral-400">Matches 1-3</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-neutral-500 font-display text-[11px] border-b border-neutral-800 pb-2">
                        <th className="text-left pb-2">TEAM</th>
                        <th className="text-center pb-2">P</th>
                        <th className="text-center pb-2">W</th>
                        <th className="text-center pb-2">D</th>
                        <th className="text-center pb-2">L</th>
                        <th className="text-center pb-2">GD</th>
                        <th className="text-center pb-2 font-bold text-white">PTS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/60">
                      {groupA.map((row, idx) => (
                        <tr
                          key={row.team.id}
                          className={`hover:bg-neutral-800/40 transition ${
                            row.team.id === selectedUserTeam?.id ? 'bg-emerald-950/30 text-emerald-300 font-bold' : ''
                          }`}
                        >
                          <td className="py-2.5 flex items-center gap-2">
                            <span className="text-neutral-500 text-[10px] w-3">{idx + 1}</span>
                            <span className="text-base">{row.team.flag}</span>
                            <span className="font-semibold">{row.team.name}</span>
                          </td>
                          <td className="text-center py-2.5">{row.played}</td>
                          <td className="text-center py-2.5">{row.won}</td>
                          <td className="text-center py-2.5">{row.drawn}</td>
                          <td className="text-center py-2.5">{row.lost}</td>
                          <td className="text-center py-2.5 text-neutral-400">{row.gf - row.ga}</td>
                          <td className="text-center py-2.5 font-display font-bold text-white text-sm">
                            {row.pts}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Group B */}
              <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <h3 className="font-display font-black text-lg text-blue-400">GROUP B</h3>
                  <span className="text-xs text-neutral-400">Matches 1-3</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-neutral-500 font-display text-[11px] border-b border-neutral-800 pb-2">
                        <th className="text-left pb-2">TEAM</th>
                        <th className="text-center pb-2">P</th>
                        <th className="text-center pb-2">W</th>
                        <th className="text-center pb-2">D</th>
                        <th className="text-center pb-2">L</th>
                        <th className="text-center pb-2">GD</th>
                        <th className="text-center pb-2 font-bold text-white">PTS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/60">
                      {groupB.map((row, idx) => (
                        <tr
                          key={row.team.id}
                          className={`hover:bg-neutral-800/40 transition ${
                            row.team.id === selectedUserTeam?.id ? 'bg-emerald-950/30 text-emerald-300 font-bold' : ''
                          }`}
                        >
                          <td className="py-2.5 flex items-center gap-2">
                            <span className="text-neutral-500 text-[10px] w-3">{idx + 1}</span>
                            <span className="text-base">{row.team.flag}</span>
                            <span className="font-semibold">{row.team.name}</span>
                          </td>
                          <td className="text-center py-2.5">{row.played}</td>
                          <td className="text-center py-2.5">{row.won}</td>
                          <td className="text-center py-2.5">{row.drawn}</td>
                          <td className="text-center py-2.5">{row.lost}</td>
                          <td className="text-center py-2.5 text-neutral-400">{row.gf - row.ga}</td>
                          <td className="text-center py-2.5 font-display font-bold text-white text-sm">
                            {row.pts}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Quick Action */}
            <div className="flex justify-center">
              <button
                onClick={handleSimulateGroupStage}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-display font-bold rounded-xl transition shadow-lg flex items-center gap-2 text-sm"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Simulate / Finish Group Stage</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Knockout Bracket */}
        {activeTab === 'knockout' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Semi Finals */}
              <div className="space-y-4">
                <h3 className="font-display font-black text-lg text-neutral-200">SEMI-FINALS</h3>
                {semiFinals.map((match, idx) => (
                  <div
                    key={match.id}
                    className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs text-neutral-400 border-b border-neutral-800 pb-2">
                      <span>{match.stageName}</span>
                      {match.isCompleted ? (
                        <span className="text-emerald-400 font-bold">COMPLETED</span>
                      ) : (
                        <span className="text-amber-400 font-bold">UPCOMING</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{match.homeTeam.flag}</span>
                        <span className="font-bold text-sm">{match.homeTeam.name}</span>
                      </div>
                      <span className="font-display font-black text-lg text-white">
                        {match.homeScore ?? '-'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{match.awayTeam.flag}</span>
                        <span className="font-bold text-sm">{match.awayTeam.name}</span>
                      </div>
                      <span className="font-display font-black text-lg text-white">
                        {match.awayScore ?? '-'}
                      </span>
                    </div>

                    {!match.isCompleted && (
                      <button
                        onClick={() => handlePlaySemiFinal(idx)}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-display font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" /> Play Semi-Final Match
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Grand Final */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <h3 className="font-display font-black text-lg text-amber-400">GRAND FINAL</h3>
                </div>
                <div className="bg-gradient-to-b from-neutral-900 to-neutral-950 border border-amber-500/40 rounded-2xl p-6 space-y-4 shadow-xl">
                  <div className="text-xs text-amber-400/80 border-b border-neutral-800 pb-2">
                    {grandFinal.stageName}
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{grandFinal.homeTeam.flag}</span>
                      <div>
                        <div className="font-display font-bold text-base text-white">{grandFinal.homeTeam.name}</div>
                        <div className="text-[11px] text-neutral-400">{grandFinal.homeTeam.overall} OVR</div>
                      </div>
                    </div>
                    <span className="font-display font-black text-3xl text-emerald-400">
                      {grandFinal.homeScore ?? '-'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{grandFinal.awayTeam.flag}</span>
                      <div>
                        <div className="font-display font-bold text-base text-white">{grandFinal.awayTeam.name}</div>
                        <div className="text-[11px] text-neutral-400">{grandFinal.awayTeam.overall} OVR</div>
                      </div>
                    </div>
                    <span className="font-display font-black text-3xl text-emerald-400">
                      {grandFinal.awayScore ?? '-'}
                    </span>
                  </div>

                  {!grandFinal.isCompleted && semiFinals.every(m => m.isCompleted) && (
                    <button
                      onClick={handlePlayFinal}
                      className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-emerald-400 hover:brightness-110 text-neutral-950 font-display font-black text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                    >
                      <Trophy className="w-4 h-4" /> PLAY 2026 WORLD CUP FINAL
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
