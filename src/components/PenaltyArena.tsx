import React, { useState, useRef, useEffect } from 'react';
import { sound, COMMENTARY_LINES } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  ArrowLeft, 
  Crosshair, 
  RotateCcw, 
  Sparkles, 
  Flame, 
  Award, 
  Volume2, 
  VolumeX,
  Target
} from 'lucide-react';

interface PenaltyArenaProps {
  onBack: () => void;
}

export const PenaltyArena: React.FC<PenaltyArenaProps> = ({ onBack }) => {
  const [mode, setMode] = useState<'penalty' | 'freekick'>('penalty');
  const [score, setScore] = useState<{ user: number; keeper: number; round: number }>({ user: 0, keeper: 0, round: 1 });
  const [aimPos, setAimPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 }); // 0-100% in goal
  const [isCharging, setIsCharging] = useState<boolean>(false);
  const [power, setPower] = useState<number>(0);
  const [curve, setCurve] = useState<number>(0); // -50 to 50
  const [shotResult, setShotResult] = useState<'GOAL' | 'SAVED' | 'MISSED' | null>(null);
  const [keeperDive, setKeeperDive] = useState<{ x: number; y: number; isDiving: boolean }>({ x: 50, y: 70, isDiving: false });
  const [commentary, setCommentary] = useState<string>("Step up to the spot. Aim your shot and release with power!");

  const powerInterval = useRef<number | null>(null);

  const startCharging = () => {
    if (shotResult) return;
    setIsCharging(true);
    setPower(0);
    sound.playUISelect();

    powerInterval.current = window.setInterval(() => {
      setPower(p => {
        if (p >= 100) return 0; // Ping pong or loop
        return p + 4;
      });
    }, 25);
  };

  const releaseShot = () => {
    if (!isCharging) return;
    setIsCharging(false);
    if (powerInterval.current) {
      clearInterval(powerInterval.current);
      powerInterval.current = null;
    }

    // Goalkeeper AI guess dive (10-90% width, 30-80% height)
    const keeperX = Math.random() * 80 + 10;
    const keeperY = Math.random() * 60 + 30;
    setKeeperDive({ x: keeperX, y: keeperY, isDiving: true });

    // Calculate if goal or save
    const finalShotX = aimPos.x + (curve * 0.2);
    const finalShotY = aimPos.y;

    sound.playKick(power > 75 ? 'power_shot' : 'shoot');

    setTimeout(() => {
      // Overhit / Missed
      if (power > 92 || finalShotX < 5 || finalShotX > 95 || finalShotY < 5) {
        setShotResult('MISSED');
        setCommentary("Skied over the crossbar! Too much power on the strike!");
        sound.playWhistle('short');
      } else {
        // Distance between keeper dive and ball
        const dist = Math.hypot(keeperX - finalShotX, keeperY - finalShotY);
        if (dist < 22) {
          // Saved
          setShotResult('SAVED');
          sound.playKick('pass');
          setCommentary("SPECTACULAR SAVE! The goalkeeper guessed the right way!");
        } else {
          // GOAL!
          setShotResult('GOAL');
          sound.playNetSound();
          sound.playGoalCheer();
          setScore(s => ({ ...s, user: s.user + 1 }));
          setCommentary("GOAL! Smashed into the back of the net with conviction!");
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
      }
    }, 600);
  };

  const nextPenaltyRound = () => {
    setShotResult(null);
    setKeeperDive({ x: 50, y: 70, isDiving: false });
    setPower(0);
    setScore(s => ({ ...s, round: s.round + 1 }));
    setCommentary("Next penalty. Pick your spot and hold nerve!");
  };

  return (
    <div className="w-full min-h-screen bg-neutral-950 text-neutral-100 p-6 flex flex-col items-center justify-center font-sans-ui">
      <div className="w-full max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-300 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Main Menu
          </button>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-display font-bold text-sm">
              <Target className="w-4 h-4" /> PENALTY ARENA
            </div>

            <div className="font-display font-black text-sm bg-neutral-950 px-3 py-1 rounded-xl border border-neutral-800">
              ROUND {score.round} • GOALS: <span className="text-emerald-400">{score.user}</span>
            </div>
          </div>
        </div>

        {/* Live Commentary Banner */}
        <div className="text-center bg-neutral-900/70 border border-neutral-800 rounded-xl py-2 px-4 text-xs font-medium text-amber-300 italic">
          "{commentary}"
        </div>

        {/* 3D Goal Stage */}
        <div
          className="relative w-full aspect-[16/9] max-h-[500px] bg-gradient-to-b from-emerald-950 via-emerald-900 to-neutral-950 border-4 border-neutral-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col items-center justify-between p-6 cursor-crosshair select-none"
          onClick={(e) => {
            if (shotResult) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = ((e.clientX - rect.left) / rect.width) * 100;
            const clickY = ((e.clientY - rect.top) / rect.height) * 100;
            setAimPos({ x: Math.max(10, Math.min(90, clickX)), y: Math.max(15, Math.min(85, clickY)) });
          }}
        >
          {/* Goal Frame & Net Geometry */}
          <div className="relative w-4/5 h-3/5 border-t-8 border-l-8 border-r-8 border-white shadow-2xl rounded-t-lg bg-white/5 backdrop-blur-[2px] mt-4 flex items-center justify-center">
            {/* Goal Net Grid Lines */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] bg-[size:16px_16px]" />

            {/* Goalkeeper Entity */}
            <div
              className={`absolute w-16 h-28 transition-all duration-500 flex flex-col items-center justify-center ${
                keeperDive.isDiving ? 'scale-110' : ''
              }`}
              style={{
                left: `${keeperDive.x}%`,
                top: `${keeperDive.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div className="w-8 h-8 rounded-full bg-[#f1c27d] border-2 border-neutral-900" />
              <div className="w-12 h-14 rounded-xl bg-amber-500 border-2 border-neutral-900 flex items-center justify-center font-display font-black text-[10px] text-neutral-950">
                GK
              </div>
              <div className="w-10 h-8 rounded-b-lg bg-neutral-900" />
            </div>

            {/* Aiming Reticle Cursor */}
            <div
              className="absolute w-8 h-8 rounded-full border-2 border-emerald-400 border-dashed flex items-center justify-center pointer-events-none -translate-x-1/2 -translate-y-1/2 transition-all duration-75 animate-spin"
              style={{
                left: `${aimPos.x}%`,
                top: `${aimPos.y}%`
              }}
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
          </div>

          {/* Penalty Spot & Ball */}
          <div className="relative z-10 flex flex-col items-center mb-2">
            <div className="w-10 h-10 rounded-full bg-white border-2 border-neutral-800 shadow-xl flex items-center justify-center text-xs">
              ⚽
            </div>
            <span className="text-[10px] font-display font-bold text-neutral-400 mt-1">12 YARDS PENALTY SPOT</span>
          </div>

          {/* Shot Result Banner */}
          {shotResult && (
            <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-md flex flex-col items-center justify-center z-30 animate-in zoom-in-90">
              <h2
                className={`text-6xl font-display font-black tracking-tight ${
                  shotResult === 'GOAL' ? 'text-emerald-400 drop-shadow-[0_0_30px_rgba(16,185,129,0.8)]' : 'text-red-500'
                }`}
              >
                {shotResult}!
              </h2>
              <button
                onClick={nextPenaltyRound}
                className="mt-4 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-display font-black text-sm rounded-xl transition shadow-xl cursor-pointer"
              >
                NEXT ATTEMPT
              </button>
            </div>
          )}
        </div>

        {/* Shot Charging Controls */}
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Power Meter */}
          <div className="w-full sm:w-1/2 space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-neutral-400">SHOT POWER</span>
              <span className={power > 85 ? 'text-red-400' : 'text-emerald-400'}>{power}%</span>
            </div>
            <div className="w-full h-4 bg-neutral-950 border border-neutral-700 rounded-full overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-75 ${
                  power > 85 ? 'bg-red-500' : power > 50 ? 'bg-amber-400' : 'bg-emerald-500'
                }`}
                style={{ width: `${power}%` }}
              />
            </div>
          </div>

          {/* Curl / Swerve Slider */}
          <div className="w-full sm:w-1/3 space-y-2">
            <div className="flex justify-between text-xs font-bold text-neutral-400">
              <span>BALL SWERVE / CURL</span>
              <span className="text-cyan-400">{curve > 0 ? `+${curve}` : curve}</span>
            </div>
            <input
              type="range"
              min="-40"
              max="40"
              value={curve}
              onChange={(e) => setCurve(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Shoot Button */}
          <button
            onMouseDown={startCharging}
            onMouseUp={releaseShot}
            onTouchStart={startCharging}
            onTouchEnd={releaseShot}
            disabled={!!shotResult}
            className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-display font-black text-base transition shadow-2xl select-none ${
              isCharging
                ? 'bg-amber-400 text-neutral-950 scale-105'
                : 'bg-emerald-600 hover:bg-emerald-500 text-neutral-950 cursor-pointer'
            }`}
          >
            {isCharging ? 'HOLDING POWER...' : 'HOLD TO STRIKE'}
          </button>
        </div>
      </div>
    </div>
  );
};
