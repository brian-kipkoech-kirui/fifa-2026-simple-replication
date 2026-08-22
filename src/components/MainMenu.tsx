import React, { useState } from 'react';
import { Team, GameSettings } from '../types';
import { TEAMS } from '../data/teams';
import { sound } from '../utils/audio';
import { 
  Play, 
  Trophy, 
  Sparkles, 
  Briefcase, 
  Target, 
  Settings, 
  Volume2, 
  VolumeX, 
  Shield, 
  ChevronRight,
  Flame,
  Gamepad2,
  Sliders,
  Tv,
  Users
} from 'lucide-react';

interface MainMenuProps {
  onSelectMode: (mode: 'kickoff' | 'tournament' | 'fut' | 'career' | 'penalty' | 'squad') => void;
  onStartKickOff: (home: Team, away: Team) => void;
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onSelectMode,
  onStartKickOff,
  settings,
  onUpdateSettings
}) => {
  const [selectedHomeTeam, setSelectedHomeTeam] = useState<Team>(TEAMS[0]); // Argentina
  const [selectedAwayTeam, setSelectedAwayTeam] = useState<Team>(TEAMS[1]); // France
  const [isKickOffSetupOpen, setIsKickOffSetupOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [activeHeroSlide, setActiveHeroSlide] = useState<number>(0);

  const handleLaunchKickOff = () => {
    sound.playPackOpeningFanfare();
    onStartKickOff(selectedHomeTeam, selectedAwayTeam);
  };

  return (
    <div className="relative w-full min-h-screen stadium-bg text-neutral-100 p-6 flex flex-col justify-between font-sans-ui overflow-x-hidden select-none">
      {/* Background Ambience Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between z-10 border-b border-neutral-800/80 pb-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-lg text-neutral-950 font-display font-black text-sm tracking-wider shadow-lg shadow-emerald-500/20">
            EA SPORTS™
          </div>
          <div>
            <h1 className="font-display font-black text-2xl tracking-tighter text-white">
              FIFA 2026 <span className="text-emerald-400 font-extrabold text-lg">PC EDITION</span>
            </h1>
            <p className="text-[10px] font-bold text-neutral-400 tracking-widest uppercase">
              Official World Cup 2026 Simulation • HyperMotion V Engine
            </p>
          </div>
        </div>

        {/* Top Right Quick Settings */}
        <div className="flex items-center gap-3">
          <button
            id="mainmenu-btn-squad"
            onClick={() => {
              sound.playUISelect();
              onSelectMode('squad');
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 hover:bg-emerald-500/30 text-xs font-bold text-emerald-300 transition shadow cursor-pointer"
          >
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Squad Hub</span>
          </button>

          <button
            onClick={() => {
              onUpdateSettings({ sfxVolume: settings.sfxVolume > 0 ? 0 : 0.8 });
              sound.playUISelect();
            }}
            className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white transition shadow"
            title="Toggle Sound"
          >
            {settings.sfxVolume > 0 ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={() => {
              setIsSettingsOpen(true);
              sound.playUISelect();
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-900/80 border border-neutral-800 hover:border-neutral-700 text-xs font-bold text-neutral-300 transition"
          >
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Center Main Carousel / Mode Tiles Grid */}
      <div className="w-full max-w-7xl mx-auto my-auto py-8 z-10 space-y-6">
        {/* Hero Featured Banner (Kick Off Showcase) */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-emerald-950/40 border border-neutral-800 p-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-display font-black tracking-wider uppercase">
              <Flame className="w-3.5 h-3.5 fill-current" />
              FIFA 26 WORLD CUP MATCHDAY
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-black text-white tracking-tight leading-tight">
              KICK OFF: QUICK MATCH
            </h2>
            <p className="text-sm text-neutral-400 font-medium">
              Jump straight onto the pitch in authentic 60FPS simulation. Choose from world powerhouses with real tactical styles, custom kits, and dynamic crowd commentary.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => {
                  setIsKickOffSetupOpen(true);
                  sound.playUISelect();
                }}
                className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 text-neutral-950 font-display font-black text-sm rounded-2xl transition shadow-xl shadow-emerald-900/40 flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>PLAY KICK OFF</span>
              </button>

              <button
                id="mainmenu-btn-hero-squad"
                onClick={() => {
                  sound.playUISelect();
                  onSelectMode('squad');
                }}
                className="px-5 py-3.5 bg-neutral-950/90 hover:bg-neutral-800 border border-neutral-700 hover:border-emerald-400 text-white font-display font-black text-sm rounded-2xl transition shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <Users className="w-4 h-4 text-emerald-400" />
                <span>SQUAD MANAGEMENT</span>
              </button>

              <div className="flex items-center gap-2 text-xs text-neutral-400 font-bold bg-neutral-950/80 px-3.5 py-2.5 rounded-xl border border-neutral-800">
                <Gamepad2 className="w-4 h-4 text-amber-400" />
                <span>Keyboard & Gamepad Ready</span>
              </div>
            </div>
          </div>

          {/* Teams Clash Graphic */}
          <div className="flex items-center gap-6 bg-neutral-950/80 border border-neutral-800 rounded-3xl p-6 shadow-xl">
            <div className="text-center space-y-2">
              <span className="text-6xl drop-shadow-lg">{selectedHomeTeam.flag}</span>
              <div className="font-display font-black text-base text-white">{selectedHomeTeam.name}</div>
              <div className="text-xs text-amber-400 font-bold">{selectedHomeTeam.overall} OVR</div>
            </div>

            <div className="font-display font-black text-2xl text-emerald-400">VS</div>

            <div className="text-center space-y-2">
              <span className="text-6xl drop-shadow-lg">{selectedAwayTeam.flag}</span>
              <div className="font-display font-black text-base text-white">{selectedAwayTeam.name}</div>
              <div className="text-xs text-amber-400 font-bold">{selectedAwayTeam.overall} OVR</div>
            </div>
          </div>
        </div>

        {/* 5 Mode Navigation Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Tile 1: Squad Management Hub */}
          <div
            id="mainmenu-tile-squad"
            onClick={() => {
              sound.playUISelect();
              onSelectMode('squad');
            }}
            className="group relative bg-gradient-to-b from-neutral-900 to-neutral-950 border border-neutral-800 hover:border-emerald-500/80 rounded-3xl p-5 flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] cursor-pointer shadow-xl"
          >
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-emerald-400 tracking-wider uppercase">ROSTERS & TACTICS</div>
                <h3 className="font-display font-black text-lg text-white">SQUAD HUB</h3>
                <p className="text-[11px] text-neutral-400 mt-1 line-clamp-2">
                  Full 16-player rosters, player profile cards, interactive formation board & custom tactics.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-emerald-400 pt-3 border-t border-neutral-800/80 mt-3">
              <span>MANAGE SQUAD</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Tile 2: Tournament Mode */}
          <div
            id="mainmenu-tile-tournament"
            onClick={() => {
              sound.playUISelect();
              onSelectMode('tournament');
            }}
            className="group relative bg-gradient-to-b from-neutral-900 to-neutral-950 border border-neutral-800 hover:border-amber-500/60 rounded-3xl p-5 flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] cursor-pointer shadow-xl"
          >
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-amber-400 tracking-wider uppercase">TOURNAMENT</div>
                <h3 className="font-display font-black text-lg text-white">WORLD CUP 2026</h3>
                <p className="text-[11px] text-neutral-400 mt-1 line-clamp-2">
                  Official North America 2026 bracket. Fight through groups to the MetLife Grand Final.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-amber-400 pt-3 border-t border-neutral-800/80 mt-3">
              <span>ENTER TOURNAMENT</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Tile 3: Ultimate Team (FUT 26) */}
          <div
            id="mainmenu-tile-fut"
            onClick={() => {
              sound.playUISelect();
              onSelectMode('fut');
            }}
            className="group relative bg-gradient-to-b from-neutral-900 to-neutral-950 border border-neutral-800 hover:border-emerald-500/60 rounded-3xl p-5 flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] cursor-pointer shadow-xl"
          >
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-emerald-400 tracking-wider uppercase">FUT PACKS</div>
                <h3 className="font-display font-black text-lg text-white">ULTIMATE TEAM</h3>
                <p className="text-[11px] text-neutral-400 mt-1 line-clamp-2">
                  Dramatic 3D pack walkouts, chemistry squad builder, and legendary Icon superstars.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-emerald-400 pt-3 border-t border-neutral-800/80 mt-3">
              <span>OPEN PACKS</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Tile 4: Career Mode */}
          <div
            id="mainmenu-tile-career"
            onClick={() => {
              sound.playUISelect();
              onSelectMode('career');
            }}
            className="group relative bg-gradient-to-b from-neutral-900 to-neutral-950 border border-neutral-800 hover:border-blue-500/60 rounded-3xl p-5 flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] cursor-pointer shadow-xl"
          >
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 transition">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-blue-400 tracking-wider uppercase">MANAGER</div>
                <h3 className="font-display font-black text-lg text-white">CAREER MODE</h3>
                <p className="text-[11px] text-neutral-400 mt-1 line-clamp-2">
                  Take the tactical helm, sign blockbuster transfer targets, and conquer the league.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-blue-400 pt-3 border-t border-neutral-800/80 mt-3">
              <span>MANAGE CLUB</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Tile 5: Penalty Arena */}
          <div
            id="mainmenu-tile-penalty"
            onClick={() => {
              sound.playUISelect();
              onSelectMode('penalty');
            }}
            className="group relative bg-gradient-to-b from-neutral-900 to-neutral-950 border border-neutral-800 hover:border-purple-500/60 rounded-3xl p-5 flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] cursor-pointer shadow-xl"
          >
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-purple-400 tracking-wider uppercase">ARENA</div>
                <h3 className="font-display font-black text-lg text-white">PENALTY SPOT</h3>
                <p className="text-[11px] text-neutral-400 mt-1 line-clamp-2">
                  1v1 spot kicks and curved free kicks with aiming reticle & dynamic goalkeeper AI.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-purple-400 pt-3 border-t border-neutral-800/80 mt-3">
              <span>ENTER ARENA</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer Info */}
      <div className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-500 border-t border-neutral-800/80 pt-4 z-10">
        <div>© 2026 FIFA & EA Sports. PC Replica Simulation.</div>
        <div className="flex items-center gap-4">
          <span>Difficulty: <strong className="text-neutral-300">{settings.difficulty}</strong></span>
          <span>•</span>
          <span>Match Duration: <strong className="text-neutral-300">{settings.matchLengthSeconds}s / Half</strong></span>
        </div>
      </div>

      {/* KICK OFF TEAM SELECTOR MODAL */}
      {isKickOffSetupOpen && (
        <div className="fixed inset-0 bg-neutral-950/85 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-in fade-in">
          <div className="w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-3xl p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <h3 className="font-display font-black text-2xl text-white">KICK OFF TEAM SELECT</h3>
              <button
                onClick={() => setIsKickOffSetupOpen(false)}
                className="text-xs text-neutral-400 hover:text-white font-bold"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Home Team Picker */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  HOME SQUAD (YOU CONTROL)
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                  {TEAMS.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setSelectedHomeTeam(t);
                        sound.playUISelect();
                      }}
                      className={`p-3 rounded-xl border flex items-center gap-2.5 transition text-left ${
                        selectedHomeTeam.id === t.id
                          ? 'bg-emerald-950/60 border-emerald-500 text-white'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      <span className="text-2xl">{t.flag}</span>
                      <div>
                        <div className="font-bold text-xs">{t.name}</div>
                        <div className="text-[10px] text-amber-400">{t.overall} OVR</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Away Team Picker */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider">
                  AWAY SQUAD (OPPONENT AI)
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                  {TEAMS.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setSelectedAwayTeam(t);
                        sound.playUISelect();
                      }}
                      className={`p-3 rounded-xl border flex items-center gap-2.5 transition text-left ${
                        selectedAwayTeam.id === t.id
                          ? 'bg-amber-950/60 border-amber-500 text-white'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      <span className="text-2xl">{t.flag}</span>
                      <div>
                        <div className="font-bold text-xs">{t.name}</div>
                        <div className="text-[10px] text-amber-400">{t.overall} OVR</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Stadium & Pitch Atmosphere preview */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Tv className="w-4 h-4 text-emerald-400" />
                <span className="text-neutral-400">Match Venue:</span>
                <span className="font-bold text-white">MetLife Stadium, New York / New Jersey (2026 Final)</span>
              </div>
              <div className="text-neutral-400">
                Weather: <strong className="text-neutral-200">Night Floodlights</strong>
              </div>
            </div>

            <button
              onClick={handleLaunchKickOff}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 text-neutral-950 font-display font-black text-lg rounded-2xl transition shadow-xl cursor-pointer"
            >
              START MATCH (60FPS ENGINE)
            </button>
          </div>
        </div>
      )}

      {/* SETTINGS MODAL */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-neutral-950/85 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-in fade-in">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="font-display font-bold text-lg text-white">GAMEPLAY SETTINGS</h3>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="text-xs text-neutral-400 hover:text-white"
              >
                Done
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Difficulty */}
              <div className="space-y-1">
                <label className="text-neutral-400 block font-bold">AI Match Difficulty</label>
                <select
                  value={settings.difficulty}
                  onChange={(e) => onUpdateSettings({ difficulty: e.target.value as unknown as GameSettings['difficulty'] })}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-white font-bold"
                >
                  <option value="Amateur">Amateur (Beginner Friendly)</option>
                  <option value="Semi-Pro">Semi-Pro (Balanced)</option>
                  <option value="Professional">Professional (Challenging)</option>
                  <option value="World Class">World Class (Expert)</option>
                  <option value="Legendary">Legendary (Hardcore)</option>
                </select>
              </div>

              {/* Half Duration */}
              <div className="space-y-1">
                <label className="text-neutral-400 block font-bold">Half Duration (Seconds)</label>
                <select
                  value={settings.matchLengthSeconds}
                  onChange={(e) => onUpdateSettings({ matchLengthSeconds: Number(e.target.value) })}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-white font-bold"
                >
                  <option value={60}>60 Seconds per half (Fast Action)</option>
                  <option value={90}>90 Seconds per half (Standard)</option>
                  <option value={120}>120 Seconds per half (Extended)</option>
                </select>
              </div>

              {/* Commentary toggle */}
              <div className="flex items-center justify-between bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                <span className="text-neutral-300 font-bold">Live Synthesized Commentary</span>
                <input
                  type="checkbox"
                  checked={settings.commentaryEnabled}
                  onChange={(e) => onUpdateSettings({ commentaryEnabled: e.target.checked })}
                  className="w-4 h-4 accent-emerald-500"
                />
              </div>
            </div>

            <button
              onClick={() => setIsSettingsOpen(false)}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-bold rounded-xl transition"
            >
              Save Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
