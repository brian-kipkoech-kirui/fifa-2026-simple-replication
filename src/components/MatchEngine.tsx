import React, { useEffect, useRef, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  Team, 
  PitchPlayer, 
  Ball, 
  MatchStats, 
  MatchEvent, 
  GameSettings,
  KeyBindings
} from '../types';
import { getFormationCoordinates } from '../data/teams';
import { sound, COMMENTARY_LINES } from '../utils/audio';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Sparkles,
  Shield,
  Activity,
  Award,
  Gamepad2,
  SlidersHorizontal,
  ChevronRight,
  Zap
} from 'lucide-react';

interface MatchEngineProps {
  homeTeam: Team;
  awayTeam: Team;
  settings: GameSettings;
  onMatchEnd: (stats: MatchStats, homeScore: number, awayScore: number) => void;
  onExit: () => void;
}

const PITCH_WIDTH = 1050;
const PITCH_HEIGHT = 680;
const GOAL_Y_MIN = 290;
const GOAL_Y_MAX = 390;
const GOAL_DEPTH = 35;

export const MatchEngine: React.FC<MatchEngineProps> = ({
  homeTeam,
  awayTeam,
  settings,
  onMatchEnd,
  onExit
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Game loop & state refs
  const isRunningRef = useRef<boolean>(true);
  const isPausedRef = useRef<boolean>(false);
  const [isPausedUI, setIsPausedUI] = useState<boolean>(false);
  const [gameTime, setGameTime] = useState<number>(0);
  const [homeScore, setHomeScore] = useState<number>(0);
  const [awayScore, setAwayScore] = useState<number>(0);
  const [currentHalf, setCurrentHalf] = useState<1 | 2 | 'FT'>(1);
  const [activeCommentary, setActiveCommentary] = useState<string>('Welcome to the FIFA World Cup 2026 match!');
  const [goalCelebration, setGoalCelebration] = useState<{ teamName: string; scorer: string; isHome: boolean } | null>(null);
  const [activeTactics, setActiveTactics] = useState<'Defensive' | 'Balanced' | 'Attacking' | 'All-Out'>('Balanced');
  const [powerBar, setPowerBar] = useState<{ type: string; value: number } | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [controlledPlayerInfo, setControlledPlayerInfo] = useState<{ name: string; number: number; stamina: number; rating: number; role: string } | null>(null);
  
  // Control Scheme selector ('wasd_jk' or 'arrows_sdwa')
  const [controlScheme, setControlScheme] = useState<'wasd_jk' | 'arrows_sdwa'>('wasd_jk');
  const [showVirtualPad, setShowVirtualPad] = useState<boolean>(true);

  // Match stats state
  const statsRef = useRef<MatchStats>({
    possession: [50, 50],
    shots: [0, 0],
    shotsOnTarget: [0, 0],
    corners: [0, 0],
    fouls: [0, 0],
    yellowCards: [0, 0],
    redCards: [0, 0],
    xG: [0.0, 0.0],
    passes: [0, 0],
    tackles: [0, 0]
  });

  const eventFeedRef = useRef<MatchEvent[]>([]);
  const [eventFeedUI, setEventFeedUI] = useState<MatchEvent[]>([]);

  // Input tracking
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const chargingAction = useRef<{ type: 'shoot' | 'pass' | 'lob' | 'through'; power: number } | null>(null);
  const powerChargeInterval = useRef<number | null>(null);
  const virtualMoveVector = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Ball and Players refs
  const ballRef = useRef<Ball>({
    x: PITCH_WIDTH / 2,
    y: PITCH_HEIGHT / 2,
    z: 0,
    vx: 0,
    vy: 0,
    vz: 0,
    spinX: 0,
    spinY: 0,
    state: 'ground',
    possessorId: null,
    lastTouchTeam: null,
    lastTouchPlayerName: null,
    trail: []
  });

  const playersRef = useRef<PitchPlayer[]>([]);
  const userControlledId = useRef<string>('');
  const matchClockSeconds = useRef<number>(0);
  const possessionTracker = useRef<{ homeTicks: number; awayTicks: number }>({ homeTicks: 1, awayTicks: 1 });
  const runCycle = useRef<number>(0);

  // Initialize Players on Pitch
  const initializePlayers = useCallback((homeKickoff: boolean = true) => {
    const homeForm = getFormationCoordinates(homeTeam.formation, true);
    const awayForm = getFormationCoordinates(awayTeam.formation, false);

    const playersList: PitchPlayer[] = [];

    // Home Team (Left to Right)
    homeTeam.players.slice(0, 11).forEach((p, idx) => {
      const form = homeForm[idx] || { position: 'CM', role: 'MID', normX: 0.3, normY: 0.5 };
      const startX = homeKickoff && form.position === 'ST' ? PITCH_WIDTH / 2 - 15 : form.normX * PITCH_WIDTH;
      const startY = homeKickoff && form.position === 'ST' ? PITCH_HEIGHT / 2 : form.normY * PITCH_HEIGHT;

      playersList.push({
        id: `home_${p.id}_${idx}`,
        name: p.commonName || p.name,
        number: p.number,
        position: p.position,
        teamId: 'home',
        role: form.role,
        x: startX,
        y: startY,
        vx: 0,
        vy: 0,
        targetX: startX,
        targetY: startY,
        stamina: 100,
        facingAngle: 0, // Facing right
        state: 'idle',
        animTimer: 0,
        hasCard: 'none',
        isControlled: idx === 9 || form.position === 'ST' || idx === 0,
        stats: { goals: 0, assists: 0, shots: 0, passes: 0, tackles: 0, rating: 6.0 },
        pace: p.pace,
        shooting: p.shooting,
        passing: p.passing,
        dribbling: p.dribbling,
        defending: p.defending,
        physical: p.physical,
        avatarColor: p.avatarColor || '#f1c27d',
        hairColor: p.hairColor || '#1a1a1a'
      });
    });

    // Away Team (Right to Left)
    awayTeam.players.slice(0, 11).forEach((p, idx) => {
      const form = awayForm[idx] || { position: 'CM', role: 'MID', normX: 0.7, normY: 0.5 };
      const startX = !homeKickoff && form.position === 'ST' ? PITCH_WIDTH / 2 + 15 : form.normX * PITCH_WIDTH;
      const startY = !homeKickoff && form.position === 'ST' ? PITCH_HEIGHT / 2 : form.normY * PITCH_HEIGHT;

      playersList.push({
        id: `away_${p.id}_${idx}`,
        name: p.commonName || p.name,
        number: p.number,
        position: p.position,
        teamId: 'away',
        role: form.role,
        x: startX,
        y: startY,
        vx: 0,
        vy: 0,
        targetX: startX,
        targetY: startY,
        stamina: 100,
        facingAngle: Math.PI, // Facing left
        state: 'idle',
        animTimer: 0,
        hasCard: 'none',
        isControlled: false,
        stats: { goals: 0, assists: 0, shots: 0, passes: 0, tackles: 0, rating: 6.0 },
        pace: p.pace,
        shooting: p.shooting,
        passing: p.passing,
        dribbling: p.dribbling,
        defending: p.defending,
        physical: p.physical,
        avatarColor: p.avatarColor || '#f1c27d',
        hairColor: p.hairColor || '#1a1a1a'
      });
    });

    playersRef.current = playersList;

    // Pick first controlled player (home striker or forward)
    const initCtrl = playersList.find(p => p.teamId === 'home' && (p.role === 'FWD' || p.position === 'ST')) || playersList[0];
    userControlledId.current = initCtrl.id;
    playersList.forEach(p => {
      p.isControlled = (p.id === initCtrl.id);
    });

    setControlledPlayerInfo({
      name: initCtrl.name,
      number: initCtrl.number,
      stamina: initCtrl.stamina,
      rating: homeTeam.players.find(p => p.number === initCtrl.number)?.rating || 88,
      role: initCtrl.position
    });

    // Reset ball in center circle
    ballRef.current = {
      x: PITCH_WIDTH / 2,
      y: PITCH_HEIGHT / 2,
      z: 0,
      vx: 0,
      vy: 0,
      vz: 0,
      spinX: 0,
      spinY: 0,
      state: 'ground',
      possessorId: homeKickoff ? initCtrl.id : null,
      lastTouchTeam: 'home',
      lastTouchPlayerName: initCtrl.name,
      trail: []
    };
  }, [homeTeam, awayTeam]);

  // Say commentary with UI banner + audio synthesis
  const triggerCommentary = useCallback((text: string) => {
    setActiveCommentary(text);
    if (settings.commentaryEnabled && !isMuted) {
      sound.speakCommentary(text);
    }
  }, [settings.commentaryEnabled, isMuted]);

  // Switch controlled player closest to the ball or manual target
  const switchControlledPlayer = useCallback((targetPlayerId?: string) => {
    const homePlayers = playersRef.current.filter(p => p.teamId === 'home');
    const ball = ballRef.current;

    let target: PitchPlayer | undefined;

    if (targetPlayerId) {
      target = homePlayers.find(p => p.id === targetPlayerId);
    } else {
      let minDist = Infinity;
      homePlayers.forEach(p => {
        if (p.role === 'GK' && ball.x > 220) return;
        const d = Math.hypot(p.x - ball.x, p.y - ball.y);
        if (d < minDist && p.id !== userControlledId.current) {
          minDist = d;
          target = p;
        }
      });
    }

    if (target) {
      userControlledId.current = target.id;
      playersRef.current.forEach(p => {
        p.isControlled = (p.id === target?.id);
      });
      const original = homeTeam.players.find(tp => tp.number === target?.number);
      setControlledPlayerInfo({
        name: target.name,
        number: target.number,
        stamina: Math.round(target.stamina),
        rating: original?.rating || 85,
        role: target.position
      });
      sound.playUISelect();
    }
  }, [homeTeam.players]);

  // Execute Action (Shoot, Pass, Lob, Through, Skill, Tackle)
  const executeAction = useCallback((actionType: 'shoot' | 'pass' | 'lob' | 'through' | 'skill', powerVal: number) => {
    const controlled = playersRef.current.find(p => p.id === userControlledId.current);
    if (!controlled) return;

    const ball = ballRef.current;
    const distToBall = Math.hypot(controlled.x - ball.x, controlled.y - ball.y);

    // Skill move (roulette or stepover burst)
    if (actionType === 'skill') {
      controlled.state = 'dribbling';
      controlled.animTimer = 20;
      const boostSpeed = (controlled.pace / 100) * 80 + 40;
      controlled.vx += Math.cos(controlled.facingAngle) * boostSpeed;
      controlled.vy += Math.sin(controlled.facingAngle) * boostSpeed;
      sound.playUISelect();
      return;
    }

    // Ball-in-possession actions
    if (distToBall < 45 || ball.possessorId === controlled.id) {
      ball.possessorId = null;
      ball.lastTouchTeam = 'home';
      ball.lastTouchPlayerName = controlled.name;

      // Calculate direction based on player facing or keys
      let dirX = Math.cos(controlled.facingAngle);
      let dirY = Math.sin(controlled.facingAngle);

      // Check keys for aiming
      let keyDirX = 0;
      let keyDirY = 0;
      if (keysPressed.current['ArrowUp'] || keysPressed.current['KeyW'] || keysPressed.current['w']) keyDirY -= 1;
      if (keysPressed.current['ArrowDown'] || keysPressed.current['KeyS'] || keysPressed.current['s']) keyDirY += 1;
      if (keysPressed.current['ArrowLeft'] || keysPressed.current['KeyA'] || keysPressed.current['a']) keyDirX -= 1;
      if (keysPressed.current['ArrowRight'] || keysPressed.current['KeyD'] || keysPressed.current['d']) keyDirX += 1;

      if (keyDirX !== 0 || keyDirY !== 0) {
        const len = Math.hypot(keyDirX, keyDirY);
        dirX = keyDirX / len;
        dirY = keyDirY / len;
      }

      const normPower = Math.max(20, powerVal) / 100;

      if (actionType === 'shoot') {
        // Target opponent goal center with stat-based spread
        const targetGoalY = 340 + (Math.random() * 60 - 30) * (1.1 - controlled.shooting / 100);
        const aimX = PITCH_WIDTH - controlled.x;
        const aimY = targetGoalY - controlled.y;
        const aimDist = Math.hypot(aimX, aimY) || 1;

        const shootSpeed = (15 + (controlled.shooting / 100) * 14) * normPower;
        ball.vx = (aimX / aimDist) * shootSpeed;
        ball.vy = (aimY / aimDist) * shootSpeed + (Math.random() * 2 - 1);
        ball.vz = normPower * 14;
        ball.spinY = (controlled.y < 340 ? 1 : -1) * 0.4;
        ball.state = 'air';

        controlled.state = 'shooting';
        controlled.animTimer = 18;
        statsRef.current.shots[0] += 1;

        if (normPower > 0.8) {
          sound.playKick('power_shot');
          triggerCommentary(`Unbelievable power strike from ${controlled.name}!`);
        } else {
          sound.playKick('shoot');
          triggerCommentary(`${controlled.name} unleashes a shot towards the goal!`);
        }
      } else if (actionType === 'pass' || actionType === 'through') {
        // Find best teammate in pass direction
        const teammates = playersRef.current.filter(p => p.teamId === 'home' && p.id !== controlled.id && p.role !== 'GK');
        let bestMate = teammates[0];
        let bestScore = -Infinity;

        teammates.forEach(m => {
          const vecX = m.x - controlled.x;
          const vecY = m.y - controlled.y;
          const d = Math.hypot(vecX, vecY) || 1;
          const dot = (vecX / d) * dirX + (vecY / d) * dirY;
          const score = dot * 200 - d * 0.3;
          if (score > bestScore && d < 480) {
            bestScore = score;
            bestMate = m;
          }
        });

        const leadFactor = actionType === 'through' ? 70 : 10;
        const targetX = bestMate ? bestMate.x + leadFactor : controlled.x + dirX * 220;
        const targetY = bestMate ? bestMate.y : controlled.y + dirY * 220;
        const passDist = Math.hypot(targetX - controlled.x, targetY - controlled.y) || 1;
        const passSpeed = Math.min(19, Math.max(9, (passDist / 22) * (1 + normPower * 0.4)));

        ball.vx = ((targetX - controlled.x) / passDist) * passSpeed;
        ball.vy = ((targetY - controlled.y) / passDist) * passSpeed;
        ball.vz = 0;
        ball.state = 'ground';

        controlled.state = 'passing';
        controlled.animTimer = 14;
        statsRef.current.passes[0] += 1;
        sound.playKick('pass');
      } else if (actionType === 'lob') {
        // High lobbed cross
        const lobSpeed = 13 * normPower + 6;
        ball.vx = dirX * lobSpeed;
        ball.vy = dirY * lobSpeed;
        ball.vz = 16 * normPower + 8;
        ball.state = 'air';

        controlled.state = 'passing';
        controlled.animTimer = 16;
        sound.playKick('lob');
      }
    } else {
      // Defensive slide tackle or standing tackle
      controlled.state = 'tackling';
      controlled.animTimer = 22;
      statsRef.current.tackles[0] += 1;
      sound.playKick('pass');

      // Check tackle collision against opponent
      const opponents = playersRef.current.filter(p => p.teamId === 'away');
      opponents.forEach(opp => {
        const d = Math.hypot(opp.x - controlled.x, opp.y - controlled.y);
        if (d < 35) {
          opp.state = 'stunned';
          opp.animTimer = 35;
          if (ball.possessorId === opp.id) {
            ball.possessorId = null;
            ball.vx = (Math.random() * 6 - 3);
            ball.vy = (Math.random() * 6 - 3);
            triggerCommentary(`Clean ball tackle by ${controlled.name}!`);
          }
        }
      });
    }
  }, [triggerCommentary]);

  // Keyboard Event Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = true;
      keysPressed.current[e.code] = true;

      // Switch player (Q, Tab)
      if (e.key === 'q' || e.key === 'Q' || e.key === 'Tab') {
        e.preventDefault();
        switchControlledPlayer();
        return;
      }

      // Pause match (Escape, P)
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        setIsPausedUI(prev => {
          isPausedRef.current = !prev;
          return !prev;
        });
        return;
      }

      // Skill move (C, V)
      if (e.key === 'c' || e.key === 'C' || e.key === 'v' || e.key === 'V') {
        executeAction('skill', 50);
        return;
      }

      // Action Key Charging
      let actionType: 'shoot' | 'pass' | 'lob' | 'through' | null = null;

      if (controlScheme === 'wasd_jk') {
        // Modern PC layout: WASD move, J=Pass, K=Shoot, L=Through, I=Lob, Space=Shoot
        if (e.key === 'k' || e.key === 'K' || e.key === 'f' || e.key === 'F' || e.key === ' ') {
          actionType = 'shoot';
        } else if (e.key === 'j' || e.key === 'J' || e.key === 'Enter') {
          actionType = 'pass';
        } else if (e.key === 'l' || e.key === 'L' || e.key === 'e' || e.key === 'E') {
          actionType = 'through';
        } else if (e.key === 'i' || e.key === 'I' || e.key === 'r' || e.key === 'R') {
          actionType = 'lob';
        }
      } else {
        // Classic layout: Arrows move, S=Pass, D=Shoot, W=Through, A=Lob
        if (e.key === 'd' || e.key === 'D' || e.key === ' ') {
          actionType = 'shoot';
        } else if (e.key === 's' || e.key === 'S') {
          actionType = 'pass';
        } else if (e.key === 'w' || e.key === 'W') {
          actionType = 'through';
        } else if (e.key === 'a' || e.key === 'A') {
          actionType = 'lob';
        }
      }

      if (actionType && !chargingAction.current) {
        chargingAction.current = { type: actionType, power: 0 };
        if (!powerChargeInterval.current) {
          powerChargeInterval.current = window.setInterval(() => {
            if (chargingAction.current) {
              chargingAction.current.power = Math.min(100, chargingAction.current.power + 5);
              setPowerBar({
                type: chargingAction.current.type.toUpperCase(),
                value: chargingAction.current.power
              });
            }
          }, 20);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = false;
      keysPressed.current[e.code] = false;

      if (chargingAction.current) {
        let isReleased = false;

        if (controlScheme === 'wasd_jk') {
          if (
            (chargingAction.current.type === 'shoot' && (e.key === 'k' || e.key === 'K' || e.key === 'f' || e.key === 'F' || e.key === ' ')) ||
            (chargingAction.current.type === 'pass' && (e.key === 'j' || e.key === 'J' || e.key === 'Enter')) ||
            (chargingAction.current.type === 'through' && (e.key === 'l' || e.key === 'L' || e.key === 'e' || e.key === 'E')) ||
            (chargingAction.current.type === 'lob' && (e.key === 'i' || e.key === 'I' || e.key === 'r' || e.key === 'R'))
          ) {
            isReleased = true;
          }
        } else {
          if (
            (chargingAction.current.type === 'shoot' && (e.key === 'd' || e.key === 'D' || e.key === ' ')) ||
            (chargingAction.current.type === 'pass' && (e.key === 's' || e.key === 'S')) ||
            (chargingAction.current.type === 'through' && (e.key === 'w' || e.key === 'W')) ||
            (chargingAction.current.type === 'lob' && (e.key === 'a' || e.key === 'A'))
          ) {
            isReleased = true;
          }
        }

        if (isReleased) {
          if (powerChargeInterval.current) {
            clearInterval(powerChargeInterval.current);
            powerChargeInterval.current = null;
          }
          executeAction(chargingAction.current.type, chargingAction.current.power);
          chargingAction.current = null;
          setPowerBar(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (powerChargeInterval.current) {
        clearInterval(powerChargeInterval.current);
      }
    };
  }, [controlScheme, executeAction, switchControlledPlayer]);

  // Main 60FPS Game Physics & AI Loop
  useEffect(() => {
    initializePlayers(true);
    sound.startStadiumAtmosphere();
    sound.playWhistle('short');
    const randomKickoff = COMMENTARY_LINES.kickoff[Math.floor(Math.random() * COMMENTARY_LINES.kickoff.length)];
    triggerCommentary(randomKickoff);

    let animationFrameId: number;
    let lastTime = performance.now();
    let clockAccumulator = 0;

    const gameLoop = (currentTime: number) => {
      const delta = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      if (!isPausedRef.current && isRunningRef.current) {
        runCycle.current += delta * 10;

        // Update Match Clock (90 match minutes divided by matchLengthSeconds)
        const secondsPerMatchMin = (settings.matchLengthSeconds * 2) / 90;
        clockAccumulator += delta;

        if (clockAccumulator >= secondsPerMatchMin) {
          clockAccumulator = 0;
          matchClockSeconds.current += 1;
          const currentMin = Math.min(90, Math.floor(matchClockSeconds.current));
          setGameTime(currentMin);

          // Half time check
          if (currentMin === 45 && currentHalf === 1) {
            sound.playWhistle('double');
            setCurrentHalf(2);
            triggerCommentary("Half-time whistle! 45 minutes played.");
            initializePlayers(false);
          } else if (currentMin >= 90) {
            sound.playWhistle('triple');
            setCurrentHalf('FT');
            triggerCommentary("Full time! That brings an end to a fantastic encounter.");
            isRunningRef.current = false;
            onMatchEnd(statsRef.current, homeScore, awayScore);
          }
        }

        // Run Physics & AI Step
        updatePhysics(delta);
      }

      // Render Canvas Scene
      renderCanvas();

      if (isRunningRef.current) {
        animationFrameId = requestAnimationFrame(gameLoop);
      }
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      sound.stopStadiumAtmosphere();
    };
  }, [initializePlayers, settings.matchLengthSeconds, currentHalf, homeScore, awayScore, onMatchEnd, triggerCommentary]);

  // Physics Simulation Step
  const updatePhysics = (dt: number) => {
    const ball = ballRef.current;
    const players = playersRef.current;

    // 1. Controlled Player Movement from Keyboard / Virtual Pad
    const controlled = players.find(p => p.id === userControlledId.current);
    if (controlled) {
      let moveX = virtualMoveVector.current.x;
      let moveY = virtualMoveVector.current.y;
      const isSprinting = keysPressed.current['Shift'] || keysPressed.current['ShiftLeft'] || keysPressed.current['ShiftRight'] || keysPressed.current['o'] || keysPressed.current['O'];

      // WASD or Arrow Keys movement
      if (keysPressed.current['ArrowUp'] || keysPressed.current['KeyW'] || keysPressed.current['w'] || keysPressed.current['W']) moveY -= 1;
      if (keysPressed.current['ArrowDown'] || keysPressed.current['KeyS'] || keysPressed.current['s'] || keysPressed.current['S']) moveY += 1;
      if (keysPressed.current['ArrowLeft'] || keysPressed.current['KeyA'] || keysPressed.current['a'] || keysPressed.current['A']) moveX -= 1;
      if (keysPressed.current['ArrowRight'] || keysPressed.current['KeyD'] || keysPressed.current['d'] || keysPressed.current['D']) moveX += 1;

      if (moveX !== 0 || moveY !== 0) {
        const len = Math.hypot(moveX, moveY);
        moveX /= len;
        moveY /= len;

        const topSpeed = isSprinting ? (controlled.pace / 100) * 260 + 70 : (controlled.pace / 100) * 165 + 45;
        controlled.vx = moveX * topSpeed;
        controlled.vy = moveY * topSpeed;
        controlled.facingAngle = Math.atan2(moveY, moveX);
        controlled.state = isSprinting ? 'sprinting' : 'running';

        // Drain stamina when sprinting
        if (isSprinting && controlled.stamina > 0) {
          controlled.stamina = Math.max(0, controlled.stamina - dt * 7);
        }
      } else {
        controlled.vx *= 0.75;
        controlled.vy *= 0.75;
        if (controlled.state !== 'tackling' && controlled.state !== 'shooting' && controlled.state !== 'passing' && controlled.state !== 'dribbling') {
          controlled.state = 'idle';
        }
      }
    }

    // 2. AI Logic for 21 other players
    players.forEach(p => {
      if (p.animTimer > 0) {
        p.animTimer -= 1;
        if (p.animTimer <= 0) p.state = 'idle';
      }

      // Recover stamina when resting
      if (p.state === 'idle' && p.stamina < 100) {
        p.stamina = Math.min(100, p.stamina + dt * 4);
      }

      // Goalkeeper AI
      if (p.role === 'GK') {
        const isHomeGK = p.teamId === 'home';
        const goalCenter = isHomeGK ? 30 : PITCH_WIDTH - 30;
        const targetGoalY = Math.min(GOAL_Y_MAX - 15, Math.max(GOAL_Y_MIN + 15, ball.y));

        p.targetX = goalCenter;
        p.targetY = targetGoalY;

        // GK dive reaction if ball is shot on goal
        const distToBall = Math.hypot(p.x - ball.x, p.y - ball.y);
        if (distToBall < 120 && ball.state === 'air' && Math.abs(ball.vx) > 7) {
          p.state = 'diving';
          p.animTimer = 25;
          if (distToBall < 55) {
            ball.vx = (isHomeGK ? 1 : -1) * (Math.random() * 8 + 4);
            ball.vy = (Math.random() * 8 - 4);
            ball.vz = 4;
            ball.possessorId = null;
            sound.playKick('pass');
            triggerCommentary(COMMENTARY_LINES.greatSave[Math.floor(Math.random() * COMMENTARY_LINES.greatSave.length)]);
            statsRef.current.shotsOnTarget[isHomeGK ? 1 : 0] += 1;
          }
        }

        p.vx = (p.targetX - p.x) * 4.5;
        p.vy = (p.targetY - p.y) * 4.5;
      } else if (p.id !== userControlledId.current) {
        // Field Player AI (Home & Away)
        const isHome = p.teamId === 'home';
        const ballDist = Math.hypot(p.x - ball.x, p.y - ball.y);

        const ballTeam = ball.possessorId ? players.find(pl => pl.id === ball.possessorId)?.teamId : ball.lastTouchTeam;
        const myTeamHasBall = ballTeam === p.teamId;

        if (myTeamHasBall) {
          // Attacking AI: Make attacking runs forward
          const formationOffset = getFormationCoordinates(
            isHome ? homeTeam.formation : awayTeam.formation,
            isHome
          )[p.number % 11] || { normX: 0.5, normY: 0.5 };

          const advance = (ball.x / PITCH_WIDTH - 0.5) * 160;
          p.targetX = formationOffset.normX * PITCH_WIDTH + (isHome ? advance : -advance);
          p.targetY = formationOffset.normY * PITCH_HEIGHT;

          // If this AI player possesses the ball
          if (ball.possessorId === p.id) {
            const goalX = isHome ? PITCH_WIDTH : 0;
            const distToGoal = Math.abs(p.x - goalX);

            if (distToGoal < 230) {
              // Shoot!
              ball.possessorId = null;
              ball.lastTouchTeam = p.teamId;
              const aimY = 340 + (Math.random() * 60 - 30);
              const shootAngle = Math.atan2(aimY - p.y, goalX - p.x);
              const speed = 18 + (p.shooting / 100) * 9;
              ball.vx = Math.cos(shootAngle) * speed;
              ball.vy = Math.sin(shootAngle) * speed;
              ball.vz = 8;
              ball.state = 'air';
              p.state = 'shooting';
              p.animTimer = 16;
              sound.playKick('shoot');
              statsRef.current.shots[isHome ? 0 : 1] += 1;
            } else if (Math.random() < 0.03) {
              // Pass to open teammate
              const mates = players.filter(pl => pl.teamId === p.teamId && pl.id !== p.id && pl.role !== 'GK');
              const chosen = mates[Math.floor(Math.random() * mates.length)];
              if (chosen) {
                ball.possessorId = null;
                ball.lastTouchTeam = p.teamId;
                const d = Math.hypot(chosen.x - p.x, chosen.y - p.y) || 1;
                ball.vx = ((chosen.x - p.x) / d) * 15;
                ball.vy = ((chosen.y - p.y) / d) * 15;
                ball.vz = 0;
                sound.playKick('pass');
                p.state = 'passing';
                p.animTimer = 12;
              }
            } else {
              // Dribble forward towards goal
              p.vx = (isHome ? 1 : -1) * ((p.pace / 100) * 145 + 35);
              p.vy = (340 - p.y) * 0.45;
              p.facingAngle = isHome ? 0 : Math.PI;
              p.state = 'running';
            }
          } else {
            // Support run
            const dx = p.targetX - p.x;
            const dy = p.targetY - p.y;
            p.vx = dx * 1.5;
            p.vy = dy * 1.5;
          }
        } else {
          // Defending AI: Press ball if close, or maintain compact shape
          if (ballDist < 170) {
            const dx = ball.x - p.x;
            const dy = ball.y - p.y;
            const d = Math.hypot(dx, dy) || 1;
            const speed = (p.pace / 100) * 165 + 45;
            p.vx = (dx / d) * speed;
            p.vy = (dy / d) * speed;
            p.facingAngle = Math.atan2(dy, dx);
            p.state = 'running';

            // Attempt AI tackle
            if (ballDist < 28 && ball.possessorId && ball.possessorId !== p.id) {
              p.state = 'tackling';
              p.animTimer = 16;
              if (Math.random() < 0.4) {
                ball.possessorId = p.id;
                ball.lastTouchTeam = p.teamId;
                sound.playKick('pass');
              }
            }
          } else {
            // Return to defensive zone
            const formationOffset = getFormationCoordinates(
              isHome ? homeTeam.formation : awayTeam.formation,
              isHome
            )[p.number % 11] || { normX: 0.5, normY: 0.5 };
            p.targetX = formationOffset.normX * PITCH_WIDTH;
            p.targetY = formationOffset.normY * PITCH_HEIGHT;
            p.vx = (p.targetX - p.x) * 1.25;
            p.vy = (p.targetY - p.y) * 1.25;
          }
        }
      }

      // Apply velocity and pitch boundaries
      p.x = Math.max(12, Math.min(PITCH_WIDTH - 12, p.x + p.vx * dt));
      p.y = Math.max(12, Math.min(PITCH_HEIGHT - 12, p.y + p.vy * dt));
    });

    // 3. Ball Physics Simulation
    if (ball.possessorId) {
      const possessor = players.find(p => p.id === ball.possessorId);
      if (possessor) {
        const dribbleDist = 14;
        ball.x = possessor.x + Math.cos(possessor.facingAngle) * dribbleDist;
        ball.y = possessor.y + Math.sin(possessor.facingAngle) * dribbleDist;
        ball.z = 0;
        ball.vx = possessor.vx;
        ball.vy = possessor.vy;
        ball.vz = 0;

        if (possessor.teamId === 'home') {
          possessionTracker.current.homeTicks += 1;
        } else {
          possessionTracker.current.awayTicks += 1;
        }
      } else {
        ball.possessorId = null;
      }
    } else {
      // Ball in motion / flight
      ball.x += ball.vx;
      ball.y += ball.vy;
      ball.z += ball.vz;

      ball.vz -= 0.6; // Gravity
      ball.vx *= 0.985; // Drag
      ball.vy *= 0.985;

      // Ball bouncing on ground
      if (ball.z <= 0) {
        ball.z = 0;
        ball.vz = -ball.vz * 0.65;
        if (Math.abs(ball.vz) < 0.8) {
          ball.vz = 0;
          ball.state = 'ground';
        }
        ball.vx *= 0.96;
        ball.vy *= 0.96;
      }

      // Ball trail buffer for high-speed strikes
      if (Math.hypot(ball.vx, ball.vy) > 8) {
        ball.trail.push({ x: ball.x, y: ball.y, z: ball.z });
        if (ball.trail.length > 8) ball.trail.shift();
      } else {
        ball.trail = [];
      }

      // Check player interception / ball pickup
      players.forEach(p => {
        const d = Math.hypot(p.x - ball.x, p.y - ball.y);
        if (d < 24 && ball.z < 25 && p.state !== 'stunned') {
          ball.possessorId = p.id;
          ball.lastTouchTeam = p.teamId;
          ball.lastTouchPlayerName = p.name;
          ball.vx = p.vx;
          ball.vy = p.vy;
          ball.vz = 0;

          // Auto switch to this player if user team picked it up
          if (p.teamId === 'home' && p.id !== userControlledId.current) {
            userControlledId.current = p.id;
            players.forEach(pl => pl.isControlled = (pl.id === p.id));
            const orig = homeTeam.players.find(tp => tp.number === p.number);
            setControlledPlayerInfo({
              name: p.name,
              number: p.number,
              stamina: Math.round(p.stamina),
              rating: orig?.rating || 85,
              role: p.position
            });
          }
        }
      });

      // 4. GOAL CHECK: Left Goal (Away scores) or Right Goal (Home scores)
      if (ball.x <= 12 && ball.y >= GOAL_Y_MIN && ball.y <= GOAL_Y_MAX && ball.z < 60) {
        handleGoal('away');
      } else if (ball.x >= PITCH_WIDTH - 12 && ball.y >= GOAL_Y_MIN && ball.y <= GOAL_Y_MAX && ball.z < 60) {
        handleGoal('home');
      } else {
        // Goal post collision / rebound
        if ((ball.x <= 15 || ball.x >= PITCH_WIDTH - 15) && (Math.abs(ball.y - GOAL_Y_MIN) < 10 || Math.abs(ball.y - GOAL_Y_MAX) < 10)) {
          ball.vx = -ball.vx * 0.8;
          sound.playPostHit();
          triggerCommentary(COMMENTARY_LINES.hitPost[Math.floor(Math.random() * COMMENTARY_LINES.hitPost.length)]);
        }

        // Side boundaries rebound
        if (ball.y < 10) {
          ball.y = 12;
          ball.vy = Math.abs(ball.vy) * 0.7;
        } else if (ball.y > PITCH_HEIGHT - 10) {
          ball.y = PITCH_HEIGHT - 12;
          ball.vy = -Math.abs(ball.vy) * 0.7;
        }

        // Behind goal out of bounds
        if (ball.x < 0) {
          ball.x = 25;
          ball.vx = 8;
        } else if (ball.x > PITCH_WIDTH) {
          ball.x = PITCH_WIDTH - 25;
          ball.vx = -8;
        }
      }
    }

    // Update Possession Stats %
    const totalTicks = possessionTracker.current.homeTicks + possessionTracker.current.awayTicks;
    if (totalTicks > 0) {
      statsRef.current.possession = [
        Math.round((possessionTracker.current.homeTicks / totalTicks) * 100),
        Math.round((possessionTracker.current.awayTicks / totalTicks) * 100)
      ];
    }
  };

  // Handle Goal Event
  const handleGoal = (scoringTeam: 'home' | 'away') => {
    sound.playNetSound();
    sound.playGoalCheer();
    sound.playWhistle('short');

    const scorerName = ballRef.current.lastTouchPlayerName || (scoringTeam === 'home' ? homeTeam.players[0].name : awayTeam.players[0].name);
    const isHome = scoringTeam === 'home';
    const teamName = isHome ? homeTeam.name : awayTeam.name;

    if (isHome) {
      setHomeScore(s => s + 1);
      statsRef.current.shotsOnTarget[0] += 1;
      statsRef.current.xG[0] += 0.85;
      confetti({
        particleCount: 130,
        spread: 85,
        origin: { y: 0.6 }
      });
    } else {
      setAwayScore(s => s + 1);
      statsRef.current.shotsOnTarget[1] += 1;
      statsRef.current.xG[1] += 0.75;
    }

    setGoalCelebration({
      teamName,
      scorer: scorerName,
      isHome
    });

    const goalLine = COMMENTARY_LINES.goalScored[Math.floor(Math.random() * COMMENTARY_LINES.goalScored.length)];
    triggerCommentary(`${goalLine} Goal scored by ${scorerName}!`);

    const event: MatchEvent = {
      id: `evt_${Date.now()}`,
      time: Math.min(90, Math.floor(matchClockSeconds.current)),
      text: `GOAL! ${scorerName} (${teamName})`,
      type: 'goal',
      scorer: scorerName
    };
    eventFeedRef.current.unshift(event);
    setEventFeedUI([...eventFeedRef.current]);

    setTimeout(() => {
      setGoalCelebration(null);
      initializePlayers(scoringTeam === 'away');
    }, 3500);
  };

  // Canvas Drawing / Rendering Routine
  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = PITCH_WIDTH;
    const height = PITCH_HEIGHT;

    ctx.clearRect(0, 0, width, height);

    // 1. Realistic Grass Pitch (Alternate striped mowing pattern)
    const stripeWidth = 52.5;
    const numStripes = Math.ceil(width / stripeWidth);

    for (let i = 0; i < numStripes; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#1b6e3b' : '#1e7b42';
      ctx.fillRect(i * stripeWidth, 0, stripeWidth, height);
    }

    // Pitch Outer Border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.strokeRect(20, 20, width - 40, height - 40);

    // Halfway Line
    ctx.beginPath();
    ctx.moveTo(width / 2, 20);
    ctx.lineTo(width / 2, height - 20);
    ctx.stroke();

    // Center Circle & Center Spot
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, 75, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, 4, 0, Math.PI * 2);
    ctx.fill();

    // Corner Arcs
    const drawArc = (cx: number, cy: number, start: number, end: number) => {
      ctx.beginPath();
      ctx.arc(cx, cy, 18, start, end);
      ctx.stroke();
    };
    drawArc(20, 20, 0, Math.PI / 2);
    drawArc(width - 20, 20, Math.PI / 2, Math.PI);
    drawArc(20, height - 20, Math.PI * 1.5, Math.PI * 2);
    drawArc(width - 20, height - 20, Math.PI, Math.PI * 1.5);

    // Left Penalty Area & 6-Yard Box
    ctx.strokeRect(20, 150, 140, 380);
    ctx.strokeRect(20, 240, 48, 200);
    ctx.beginPath();
    ctx.arc(115, height / 2, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(115, height / 2, 60, -0.65, 0.65);
    ctx.stroke();

    // Right Penalty Area & 6-Yard Box
    ctx.strokeRect(width - 160, 150, 140, 380);
    ctx.strokeRect(width - 68, 240, 48, 200);
    ctx.beginPath();
    ctx.arc(width - 115, height / 2, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(width - 115, height / 2, 60, Math.PI - 0.65, Math.PI + 0.65);
    ctx.stroke();

    // 3D Goal Posts & Netting with Shadows
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillRect(20 - GOAL_DEPTH, GOAL_Y_MIN, GOAL_DEPTH, GOAL_Y_MAX - GOAL_Y_MIN);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.strokeRect(20 - GOAL_DEPTH, GOAL_Y_MIN, GOAL_DEPTH, GOAL_Y_MAX - GOAL_Y_MIN);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillRect(width - 20, GOAL_Y_MIN, GOAL_DEPTH, GOAL_Y_MAX - GOAL_Y_MIN);
    ctx.strokeRect(width - 20, GOAL_Y_MIN, GOAL_DEPTH, GOAL_Y_MAX - GOAL_Y_MIN);

    // 2. Ball Trail
    const ball = ballRef.current;
    if (ball.trail.length > 0) {
      ball.trail.forEach((pos, i) => {
        const alpha = (i + 1) / ball.trail.length * 0.4;
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 4 + pos.z * 0.08, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // 3. Draw Players with Full Render Model & Directional Limbs
    const players = playersRef.current;
    const controlledPlayer = players.find(p => p.id === userControlledId.current);

    // If controlling player, draw subtle aiming assist line towards facing angle
    if (controlledPlayer) {
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(controlledPlayer.x, controlledPlayer.y);
      ctx.lineTo(
        controlledPlayer.x + Math.cos(controlledPlayer.facingAngle) * 90,
        controlledPlayer.y + Math.sin(controlledPlayer.facingAngle) * 90
      );
      ctx.stroke();
      ctx.setLineDash([]);
    }

    players.forEach(p => {
      // Player Ground Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.ellipse(p.x, p.y + 11, 11, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      const isHome = p.teamId === 'home';
      const kit = isHome ? homeTeam.kit : awayTeam.kit;
      const isGK = p.role === 'GK';
      const jerseyColor = isGK ? kit.gk : kit.primary;
      const trimColor = isGK ? '#ffffff' : kit.secondary;

      // Animated Running Legs
      const isMoving = Math.hypot(p.vx, p.vy) > 10;
      const legOsc = isMoving ? Math.sin(runCycle.current + (p.number * 0.5)) * 5 : 0;

      ctx.fillStyle = '#09090b'; // Boots/Shorts
      ctx.beginPath();
      ctx.arc(p.x - 4 + Math.cos(p.facingAngle + 1.5) * legOsc, p.y + 7 + Math.sin(p.facingAngle + 1.5) * legOsc, 3.5, 0, Math.PI * 2);
      ctx.arc(p.x + 4 - Math.cos(p.facingAngle + 1.5) * legOsc, p.y + 7 - Math.sin(p.facingAngle + 1.5) * legOsc, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Player Jersey Body Circle
      ctx.fillStyle = jerseyColor;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 11, 0, Math.PI * 2);
      ctx.fill();

      // Jersey Accent Stripes
      ctx.strokeStyle = trimColor;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Player Arms / Direction Indicator
      ctx.fillStyle = p.avatarColor;
      ctx.beginPath();
      ctx.arc(p.x + Math.cos(p.facingAngle + 1.2) * 9, p.y + Math.sin(p.facingAngle + 1.2) * 9, 3, 0, Math.PI * 2);
      ctx.arc(p.x + Math.cos(p.facingAngle - 1.2) * 9, p.y + Math.sin(p.facingAngle - 1.2) * 9, 3, 0, Math.PI * 2);
      ctx.fill();

      // Player Head & Hair
      ctx.fillStyle = p.avatarColor;
      ctx.beginPath();
      ctx.arc(p.x + Math.cos(p.facingAngle) * 3, p.y + Math.sin(p.facingAngle) * 3 - 3, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = p.hairColor;
      ctx.beginPath();
      ctx.arc(p.x + Math.cos(p.facingAngle) * 3, p.y + Math.sin(p.facingAngle) * 3 - 4, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Player Kit Number
      ctx.fillStyle = kit.numbers;
      ctx.font = 'bold 8px "Chakra Petch", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${p.number}`, p.x, p.y + 1);

      // Controlled Player Indicator & Overhead Nameplate
      if (p.isControlled) {
        // Floating Cursor Triangle
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.moveTo(p.x, p.y - 20);
        ctx.lineTo(p.x - 6, p.y - 28);
        ctx.lineTo(p.x + 6, p.y - 28);
        ctx.closePath();
        ctx.fill();

        // Circular Stamina Ring
        ctx.strokeStyle = p.stamina > 30 ? '#10b981' : '#ef4444';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        const staminaAngle = (p.stamina / 100) * Math.PI * 2;
        ctx.arc(p.x, p.y, 16, -Math.PI / 2, -Math.PI / 2 + staminaAngle);
        ctx.stroke();

        // Player Name Banner
        ctx.fillStyle = 'rgba(9, 9, 11, 0.85)';
        ctx.fillRect(p.x - 30, p.y - 42, 60, 13);
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1;
        ctx.strokeRect(p.x - 30, p.y - 42, 60, 13);

        ctx.fillStyle = '#ffffff';
        ctx.font = '700 8px Outfit, sans-serif';
        ctx.fillText(p.name, p.x, p.y - 35);
      }
    });

    // 4. Match Ball
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    const shadowSize = Math.max(3, 7 - ball.z * 0.08);
    ctx.ellipse(ball.x, ball.y, shadowSize, shadowSize * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    const ballRenderY = ball.y - ball.z;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(ball.x, ballRenderY, 6.5 + ball.z * 0.04, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(ball.x, ballRenderY, 4.5, 0, Math.PI);
    ctx.stroke();

    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.arc(ball.x - 1, ballRenderY - 1, 2, 0, Math.PI * 2);
    ctx.fill();
  };

  // Canvas Click to switch player directly by clicking on their player icon
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = PITCH_WIDTH / rect.width;
    const scaleY = PITCH_HEIGHT / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // Check if clicked near any home player
    const homePlayers = playersRef.current.filter(p => p.teamId === 'home');
    let clickedPlayer = homePlayers.find(p => Math.hypot(p.x - clickX, p.y - clickY) < 30);

    if (clickedPlayer) {
      switchControlledPlayer(clickedPlayer.id);
    } else {
      switchControlledPlayer();
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-center select-none overflow-hidden font-sans-ui">
      {/* Top FIFA Broadcast Score Bug HUD */}
      <div className="w-full max-w-6xl px-4 pt-3 pb-1 flex items-center justify-between z-20">
        {/* Left Team Info & Score Bar */}
        <div className="flex items-center gap-2 bg-neutral-900/90 backdrop-blur-md border border-neutral-700/60 rounded-xl px-3 py-1.5 shadow-2xl">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-gradient-to-r from-amber-500/20 to-emerald-500/20 border border-amber-400/30 text-xs font-display font-bold text-amber-400 tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            FIFA 2026
          </div>

          {/* Home Team */}
          <div className="flex items-center gap-2 px-2">
            <span className="text-xl">{homeTeam.flag}</span>
            <span className="font-display font-bold text-sm tracking-wider">{homeTeam.shortName}</span>
            <span className="font-display font-extrabold text-lg text-emerald-400 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
              {homeScore}
            </span>
          </div>

          <span className="text-neutral-500 font-bold">:</span>

          {/* Away Team */}
          <div className="flex items-center gap-2 px-2">
            <span className="font-display font-extrabold text-lg text-amber-400 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
              {awayScore}
            </span>
            <span className="font-display font-bold text-sm tracking-wider">{awayTeam.shortName}</span>
            <span className="text-xl">{awayTeam.flag}</span>
          </div>

          {/* Match Clock */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-neutral-700 text-xs font-display font-bold text-neutral-300">
            <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span>{gameTime}'</span>
            <span className="text-neutral-500 text-[10px]">
              {currentHalf === 1 ? '1ST' : currentHalf === 2 ? '2ND' : 'FT'}
            </span>
          </div>
        </div>

        {/* Live Commentary Marquee Banner */}
        <div className="hidden md:flex items-center gap-2 bg-neutral-900/80 backdrop-blur-md border border-neutral-800 rounded-xl px-4 py-1.5 max-w-md truncate">
          <Activity className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs text-neutral-300 italic truncate font-medium">
            "{activeCommentary}"
          </span>
        </div>

        {/* Quick Tactical & Audio Controls */}
        <div className="flex items-center gap-2">
          {/* Controls Scheme Selector */}
          <div className="hidden sm:flex items-center gap-1 bg-neutral-900/90 border border-neutral-800 rounded-xl px-2 py-1 text-xs">
            <Gamepad2 className="w-3.5 h-3.5 text-amber-400" />
            <select
              value={controlScheme}
              onChange={(e) => setControlScheme(e.target.value as 'wasd_jk' | 'arrows_sdwa')}
              className="bg-transparent text-neutral-200 font-bold focus:outline-none cursor-pointer text-[11px]"
            >
              <option value="wasd_jk" className="bg-neutral-900">WASD + J/K/L/I</option>
              <option value="arrows_sdwa" className="bg-neutral-900">Arrows + S/D/W/A</option>
            </select>
          </div>

          {/* Tactics Pill */}
          <div className="hidden sm:flex items-center gap-1 bg-neutral-900/90 border border-neutral-800 rounded-xl px-2 py-1 text-xs">
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            <select
              value={activeTactics}
              onChange={(e) => setActiveTactics(e.target.value as unknown as 'Defensive' | 'Balanced' | 'Attacking' | 'All-Out')}
              className="bg-transparent text-neutral-200 font-bold focus:outline-none cursor-pointer text-[11px]"
            >
              <option value="Defensive" className="bg-neutral-900">Defensive</option>
              <option value="Balanced" className="bg-neutral-900">Balanced</option>
              <option value="Attacking" className="bg-neutral-900">Attacking</option>
              <option value="All-Out" className="bg-neutral-900">All-Out Attack</option>
            </select>
          </div>

          {/* Mute Button */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-xl bg-neutral-900/90 border border-neutral-800 hover:border-neutral-600 text-neutral-400 hover:text-white transition"
            title="Toggle Audio"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Pause Button */}
          <button
            onClick={() => {
              isPausedRef.current = !isPausedUI;
              setIsPausedUI(!isPausedUI);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-bold text-xs transition shadow-lg shadow-emerald-900/30 cursor-pointer"
          >
            {isPausedUI ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
            <span>{isPausedUI ? 'Resume' : 'Pause'}</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Pitch Stage */}
      <div className="relative w-full max-w-6xl aspect-[1050/680] max-h-[72vh] flex items-center justify-center p-2">
        <canvas
          ref={canvasRef}
          width={PITCH_WIDTH}
          height={PITCH_HEIGHT}
          onClick={handleCanvasClick}
          className="w-full h-full object-contain rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] border-4 border-neutral-800/80 bg-emerald-900 cursor-crosshair"
        />

        {/* Dynamic Power Bar Overlay */}
        {powerBar && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-neutral-950/90 backdrop-blur-md border border-neutral-700 rounded-xl px-4 py-2 flex items-center gap-3 z-30 shadow-2xl">
            <span className="text-xs font-display font-extrabold text-amber-400">{powerBar.type}</span>
            <div className="w-44 h-3 bg-neutral-800 rounded-full overflow-hidden p-0.5 border border-neutral-700">
              <div
                className={`h-full rounded-full transition-all duration-75 ${
                  powerBar.value > 80 ? 'bg-red-500' : powerBar.value > 50 ? 'bg-amber-400' : 'bg-emerald-500'
                }`}
                style={{ width: `${powerBar.value}%` }}
              />
            </div>
            <span className="text-xs font-bold text-neutral-300">{powerBar.value}%</span>
          </div>
        )}

        {/* Goal Cinematic Splash Overlay */}
        {goalCelebration && (
          <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-md flex flex-col items-center justify-center z-40 animate-in fade-in zoom-in-90 duration-300">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-400 font-display font-black text-sm tracking-widest uppercase">
                <Sparkles className="w-4 h-4 fill-current animate-bounce" />
                Goal Celebration
              </div>
              <h1 className="text-6xl md:text-8xl font-display font-black tracking-tight text-white drop-shadow-[0_10px_30px_rgba(16,185,129,0.5)]">
                GOAL!
              </h1>
              <p className="text-2xl font-bold text-amber-400">{goalCelebration.scorer}</p>
              <p className="text-neutral-400 text-sm font-medium">{goalCelebration.teamName}</p>
            </div>
          </div>
        )}

        {/* Pause Menu Modal */}
        {isPausedUI && (
          <div className="absolute inset-0 bg-neutral-950/85 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <h3 className="font-display font-extrabold text-xl text-white">MATCH PAUSED</h3>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                  {homeTeam.shortName} {homeScore} - {awayScore} {awayTeam.shortName}
                </span>
              </div>

              {/* Match Stats Summary */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-neutral-400 font-bold">
                  <span>{homeTeam.shortName}</span>
                  <span className="text-neutral-200">MATCH STATS</span>
                  <span>{awayTeam.shortName}</span>
                </div>
                <div className="flex items-center justify-between bg-neutral-950 p-2.5 rounded-xl">
                  <span className="font-bold">{statsRef.current.possession[0]}%</span>
                  <span className="text-neutral-400">Possession</span>
                  <span className="font-bold">{statsRef.current.possession[1]}%</span>
                </div>
                <div className="flex items-center justify-between bg-neutral-950 p-2.5 rounded-xl">
                  <span className="font-bold">{statsRef.current.shots[0]}</span>
                  <span className="text-neutral-400">Shots</span>
                  <span className="font-bold">{statsRef.current.shots[1]}</span>
                </div>
                <div className="flex items-center justify-between bg-neutral-950 p-2.5 rounded-xl">
                  <span className="font-bold">{statsRef.current.passes[0]}</span>
                  <span className="text-neutral-400">Passes</span>
                  <span className="font-bold">{statsRef.current.passes[1]}</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => {
                    isPausedRef.current = false;
                    setIsPausedUI(false);
                  }}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-bold rounded-xl transition shadow-lg cursor-pointer"
                >
                  Resume Match
                </button>
                <button
                  onClick={() => {
                    initializePlayers(true);
                    setHomeScore(0);
                    setAwayScore(0);
                    matchClockSeconds.current = 0;
                    isPausedRef.current = false;
                    setIsPausedUI(false);
                  }}
                  className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold rounded-xl transition flex items-center justify-center gap-2 text-sm cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" /> Restart Match
                </button>
                <button
                  onClick={onExit}
                  className="w-full py-2.5 bg-red-950/40 hover:bg-red-900/60 text-red-400 font-bold rounded-xl transition text-sm border border-red-800/40 cursor-pointer"
                >
                  Exit to Main Menu
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom PC Controls Bar & Virtual Action Buttons */}
      <div className="w-full max-w-6xl px-4 py-2 flex flex-col md:flex-row items-center justify-between gap-3 text-xs z-10">
        {/* Controlled Player Card Mini Status */}
        {controlledPlayerInfo && (
          <div className="flex items-center gap-3 bg-neutral-900/90 border border-neutral-800 rounded-xl px-3 py-2 shadow-lg shrink-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-display font-black text-emerald-400">
              {controlledPlayerInfo.number}
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold text-white">
                <span>{controlledPlayerInfo.name}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-800 text-amber-400 font-display">
                  {controlledPlayerInfo.rating} OVR • {controlledPlayerInfo.role}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-neutral-400 mt-0.5">
                <span>Stamina</span>
                <div className="w-16 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full transition-all"
                    style={{ width: `${controlledPlayerInfo.stamina}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Keybinds Guide based on selected Scheme */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-neutral-300">
          {controlScheme === 'wasd_jk' ? (
            <>
              <span className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 px-2 py-1 rounded-lg">
                <kbd className="bg-neutral-800 px-1.5 py-0.5 rounded text-[10px] font-bold text-amber-400">WASD</kbd> Move
              </span>
              <span className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 px-2 py-1 rounded-lg">
                <kbd className="bg-neutral-800 px-1.5 py-0.5 rounded text-[10px] font-bold text-blue-400">J</kbd> Short Pass
              </span>
              <span className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 px-2 py-1 rounded-lg">
                <kbd className="bg-neutral-800 px-1.5 py-0.5 rounded text-[10px] font-bold text-emerald-400">K / Space</kbd> Shoot
              </span>
              <span className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 px-2 py-1 rounded-lg">
                <kbd className="bg-neutral-800 px-1.5 py-0.5 rounded text-[10px] font-bold text-yellow-400">L / E</kbd> Through
              </span>
              <span className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 px-2 py-1 rounded-lg">
                <kbd className="bg-neutral-800 px-1.5 py-0.5 rounded text-[10px] font-bold text-purple-400">I / R</kbd> Lob
              </span>
              <span className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 px-2 py-1 rounded-lg">
                <kbd className="bg-neutral-800 px-1.5 py-0.5 rounded text-[10px] font-bold text-red-400">Shift</kbd> Sprint
              </span>
              <span className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 px-2 py-1 rounded-lg">
                <kbd className="bg-neutral-800 px-1.5 py-0.5 rounded text-[10px] font-bold text-cyan-400">Q</kbd> Switch
              </span>
            </>
          ) : (
            <>
              <span className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 px-2 py-1 rounded-lg">
                <kbd className="bg-neutral-800 px-1.5 py-0.5 rounded text-[10px] font-bold text-amber-400">↑↓←→</kbd> Move
              </span>
              <span className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 px-2 py-1 rounded-lg">
                <kbd className="bg-neutral-800 px-1.5 py-0.5 rounded text-[10px] font-bold text-blue-400">S</kbd> Short Pass
              </span>
              <span className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 px-2 py-1 rounded-lg">
                <kbd className="bg-neutral-800 px-1.5 py-0.5 rounded text-[10px] font-bold text-emerald-400">D / Space</kbd> Shoot
              </span>
              <span className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 px-2 py-1 rounded-lg">
                <kbd className="bg-neutral-800 px-1.5 py-0.5 rounded text-[10px] font-bold text-yellow-400">W</kbd> Through
              </span>
              <span className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 px-2 py-1 rounded-lg">
                <kbd className="bg-neutral-800 px-1.5 py-0.5 rounded text-[10px] font-bold text-purple-400">A</kbd> Lob
              </span>
              <span className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 px-2 py-1 rounded-lg">
                <kbd className="bg-neutral-800 px-1.5 py-0.5 rounded text-[10px] font-bold text-red-400">Shift</kbd> Sprint
              </span>
              <span className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 px-2 py-1 rounded-lg">
                <kbd className="bg-neutral-800 px-1.5 py-0.5 rounded text-[10px] font-bold text-cyan-400">Q</kbd> Switch
              </span>
            </>
          )}
        </div>

        {/* Action Buttons for Click / Touch */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => executeAction('pass', 60)}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition active:scale-95 text-xs cursor-pointer shadow"
          >
            Pass (J)
          </button>
          <button
            onClick={() => executeAction('shoot', 75)}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-black rounded-xl transition active:scale-95 text-xs cursor-pointer shadow"
          >
            Shoot (K)
          </button>
          <button
            onClick={() => executeAction('through', 65)}
            className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-500 text-neutral-950 font-bold rounded-xl transition active:scale-95 text-xs cursor-pointer shadow"
          >
            Through (L)
          </button>
          <button
            onClick={() => executeAction('skill', 50)}
            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition active:scale-95 text-xs cursor-pointer shadow flex items-center gap-1"
          >
            <Zap className="w-3.5 h-3.5" /> Skill (C)
          </button>
          <button
            onClick={() => switchControlledPlayer()}
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold rounded-xl transition active:scale-95 text-xs cursor-pointer shadow"
          >
            Switch (Q)
          </button>
        </div>
      </div>
    </div>
  );
};
