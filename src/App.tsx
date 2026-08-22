/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Team, GameSettings, MatchStats } from './types';
import { TEAMS } from './data/teams';
import { MainMenu } from './components/MainMenu';
import { MatchEngine } from './components/MatchEngine';
import { TournamentMode } from './components/TournamentMode';
import { UltimateTeam } from './components/UltimateTeam';
import { CareerMode } from './components/CareerMode';
import { PenaltyArena } from './components/PenaltyArena';
import { SquadManagement } from './components/SquadManagement';
import { sound } from './utils/audio';
import { RotateCcw, Trophy, ArrowLeft, Award, Activity } from 'lucide-react';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'menu' | 'match' | 'tournament' | 'fut' | 'career' | 'penalty' | 'squad' | 'post_match'>('menu');
  const [activeHomeTeam, setActiveHomeTeam] = useState<Team>(TEAMS[0]);
  const [activeAwayTeam, setActiveAwayTeam] = useState<Team>(TEAMS[1]);
  const [matchCallback, setMatchCallback] = useState<((stats: MatchStats, hScore: number, aScore: number) => void) | null>(null);
  
  const [postMatchData, setPostMatchData] = useState<{
    stats: MatchStats;
    homeScore: number;
    awayScore: number;
    homeTeam: Team;
    awayTeam: Team;
  } | null>(null);

  const [settings, setSettings] = useState<GameSettings>({
    difficulty: 'Semi-Pro',
    matchLengthSeconds: 90,
    cameraAngle: 'Tele Broadcast',
    radarEnabled: true,
    commentaryEnabled: true,
    sfxVolume: 0.8,
    crowdVolume: 0.5,
    musicVolume: 0.5,
    controlsMode: 'keyboard'
  });

  const handleUpdateSettings = (newSettings: Partial<GameSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    if (newSettings.sfxVolume !== undefined) {
      sound.sfxVolume = newSettings.sfxVolume;
    }
    if (newSettings.crowdVolume !== undefined) {
      sound.crowdVolume = newSettings.crowdVolume;
    }
    if (newSettings.commentaryEnabled !== undefined) {
      sound.commentaryEnabled = newSettings.commentaryEnabled;
    }
  };

  // Launch Kick Off Match
  const handleStartKickOff = (home: Team, away: Team) => {
    setActiveHomeTeam(home);
    setActiveAwayTeam(away);
    setMatchCallback(null);
    setCurrentScreen('match');
  };

  // Launch Match from Tournament or Career mode
  const handleStartCustomMatch = (
    home: Team, 
    away: Team, 
    onFinish?: (stats: MatchStats, homeScore: number, awayScore: number) => void
  ) => {
    setActiveHomeTeam(home);
    setActiveAwayTeam(away);
    setMatchCallback(() => onFinish || null);
    setCurrentScreen('match');
  };

  // Handle Match Completed
  const handleMatchEnd = (stats: MatchStats, homeScore: number, awayScore: number) => {
    if (matchCallback) {
      matchCallback(stats, homeScore, awayScore);
    }
    setPostMatchData({
      stats,
      homeScore,
      awayScore,
      homeTeam: activeHomeTeam,
      awayTeam: activeAwayTeam
    });
    setCurrentScreen('post_match');
  };

  return (
    <main className="w-full min-h-screen bg-neutral-950 text-neutral-100 selection:bg-emerald-500 selection:text-black">
      {/* 1. Main Menu Screen */}
      {currentScreen === 'menu' && (
        <MainMenu
          onSelectMode={(mode) => setCurrentScreen(mode)}
          onStartKickOff={handleStartKickOff}
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
        />
      )}

      {/* 2. Live 60FPS Pitch Match Simulation Screen */}
      {currentScreen === 'match' && (
        <MatchEngine
          homeTeam={activeHomeTeam}
          awayTeam={activeAwayTeam}
          settings={settings}
          onMatchEnd={handleMatchEnd}
          onExit={() => setCurrentScreen('menu')}
        />
      )}

      {/* 3. FIFA World Cup 2026 Tournament Mode */}
      {currentScreen === 'tournament' && (
        <TournamentMode
          onStartMatch={handleStartCustomMatch}
          onBack={() => setCurrentScreen('menu')}
          settings={settings}
        />
      )}

      {/* 4. Ultimate Team (FUT 26) Mode */}
      {currentScreen === 'fut' && (
        <UltimateTeam
          onBack={() => setCurrentScreen('menu')}
          onPlayWithSquad={(futTeam) => {
            const opp = TEAMS[7]; // Play vs FIFA Icons Legends
            handleStartKickOff(futTeam, opp);
          }}
        />
      )}

      {/* 5. Career Manager Mode */}
      {currentScreen === 'career' && (
        <CareerMode
          onBack={() => setCurrentScreen('menu')}
          onPlayMatch={handleStartCustomMatch}
        />
      )}

      {/* 6. Penalty Shootout & Free Kick Arena */}
      {currentScreen === 'penalty' && (
        <PenaltyArena onBack={() => setCurrentScreen('menu')} />
      )}

      {/* 7. Squad Management & Tactics Hub Screen */}
      {currentScreen === 'squad' && (
        <SquadManagement
          initialTeam={activeHomeTeam}
          onBack={() => setCurrentScreen('menu')}
          onPlayWithTeam={(selectedTeam) => {
            const opp = TEAMS.find(t => t.id !== selectedTeam.id) || TEAMS[1];
            handleStartKickOff(selectedTeam, opp);
          }}
        />
      )}

      {/* 8. Post-Match Statistics & Results Screen */}
      {currentScreen === 'post_match' && postMatchData && (
        <div className="w-full min-h-screen stadium-bg p-6 flex flex-col items-center justify-center font-sans-ui">
          <div className="w-full max-w-2xl bg-neutral-900/90 border border-neutral-800 rounded-3xl p-8 space-y-6 shadow-2xl animate-in zoom-in-95">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-display font-black tracking-wider uppercase">
                <Award className="w-4 h-4" /> FULL TIME RESULT
              </div>
              <h2 className="text-3xl font-display font-black text-white">MATCH SUMMARY</h2>
            </div>

            {/* Score Showcase */}
            <div className="flex items-center justify-around bg-neutral-950 border border-neutral-800 rounded-2xl p-6">
              <div className="text-center space-y-1">
                <span className="text-5xl drop-shadow">{postMatchData.homeTeam.flag}</span>
                <div className="font-display font-black text-base text-white">{postMatchData.homeTeam.name}</div>
              </div>

              <div className="text-center">
                <div className="font-display font-black text-5xl text-emerald-400">
                  {postMatchData.homeScore} - {postMatchData.awayScore}
                </div>
                <div className="text-xs text-neutral-400 font-bold mt-1">FINAL WHISTLE</div>
              </div>

              <div className="text-center space-y-1">
                <span className="text-5xl drop-shadow">{postMatchData.awayTeam.flag}</span>
                <div className="font-display font-black text-base text-white">{postMatchData.awayTeam.name}</div>
              </div>
            </div>

            {/* Detailed Match Statistics */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-neutral-400 font-bold px-2">
                <span>{postMatchData.homeTeam.shortName}</span>
                <span>MATCH STATS</span>
                <span>{postMatchData.awayTeam.shortName}</span>
              </div>

              <div className="flex items-center justify-between bg-neutral-950 p-2.5 rounded-xl">
                <span className="font-bold">{postMatchData.stats.possession[0]}%</span>
                <span className="text-neutral-400">Possession</span>
                <span className="font-bold">{postMatchData.stats.possession[1]}%</span>
              </div>

              <div className="flex items-center justify-between bg-neutral-950 p-2.5 rounded-xl">
                <span className="font-bold">{postMatchData.stats.shots[0]}</span>
                <span className="text-neutral-400">Total Shots</span>
                <span className="font-bold">{postMatchData.stats.shots[1]}</span>
              </div>

              <div className="flex items-center justify-between bg-neutral-950 p-2.5 rounded-xl">
                <span className="font-bold">{postMatchData.stats.shotsOnTarget[0]}</span>
                <span className="text-neutral-400">Shots on Target</span>
                <span className="font-bold">{postMatchData.stats.shotsOnTarget[1]}</span>
              </div>

              <div className="flex items-center justify-between bg-neutral-950 p-2.5 rounded-xl">
                <span className="font-bold">{postMatchData.stats.passes[0]}</span>
                <span className="text-neutral-400">Passes Completed</span>
                <span className="font-bold">{postMatchData.stats.passes[1]}</span>
              </div>

              <div className="flex items-center justify-between bg-neutral-950 p-2.5 rounded-xl">
                <span className="font-bold">{postMatchData.stats.tackles[0]}</span>
                <span className="text-neutral-400">Tackles Won</span>
                <span className="font-bold">{postMatchData.stats.tackles[1]}</span>
              </div>
            </div>

            {/* Navigation Options */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => {
                  setCurrentScreen('match');
                  sound.playUISelect();
                }}
                className="py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Rematch
              </button>

              <button
                onClick={() => {
                  setCurrentScreen('menu');
                  sound.playUISelect();
                }}
                className="py-3 bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-display font-black text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-lg"
              >
                <ArrowLeft className="w-4 h-4" /> Main Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
