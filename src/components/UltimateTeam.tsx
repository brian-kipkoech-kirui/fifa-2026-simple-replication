import React, { useState } from 'react';
import { Player, FUTPack, Team, MatchStats } from '../types';
import { ALL_PLAYERS } from '../data/players';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  ShoppingBag, 
  Users, 
  Coins, 
  Award, 
  ArrowLeft, 
  Flame, 
  Check, 
  Plus, 
  X,
  Play,
  RotateCcw,
  Star
} from 'lucide-react';

interface UltimateTeamProps {
  onBack: () => void;
  onPlayWithSquad: (squadTeam: Team) => void;
}

const PACKS_STORE: FUTPack[] = [
  {
    id: 'pack_gold',
    name: 'Gold Players Pack',
    description: 'Includes 3 Gold Players with at least one 80+ OVR player guaranteed.',
    costCoins: 5000,
    costPoints: 100,
    rarity: 'gold',
    cardCount: 3,
    minRating: 80,
    imageColor: 'from-amber-600 to-yellow-500'
  },
  {
    id: 'pack_mega',
    name: 'Mega World Cup 2026 Pack',
    description: 'Includes 4 Elite Players with guaranteed 85+ OVR superstar.',
    costCoins: 15000,
    costPoints: 300,
    rarity: 'special',
    cardCount: 4,
    minRating: 85,
    imageColor: 'from-blue-600 to-indigo-600'
  },
  {
    id: 'pack_icons',
    name: 'Ultimate Icons & Legends Pack',
    description: 'Contains guaranteed FIFA Legend Icon (Pelé, Maradona, Zidane, R9, Ronaldinho, Yashin).',
    costCoins: 40000,
    costPoints: 800,
    rarity: 'icon',
    cardCount: 2,
    minRating: 90,
    guaranteedIcons: 1,
    imageColor: 'from-amber-400 via-emerald-400 to-cyan-400'
  }
];

export const UltimateTeam: React.FC<UltimateTeamProps> = ({
  onBack,
  onPlayWithSquad
}) => {
  const [coins, setCoins] = useState<number>(25000);
  const [activeTab, setActiveTab] = useState<'squad' | 'store' | 'club'>('squad');

  // Owned Card Collection (starts with standard starter cards)
  const [ownedPlayers, setOwnedPlayers] = useState<Player[]>([
    ALL_PLAYERS[0], // Messi
    ALL_PLAYERS[11], // Mbappé
    ALL_PLAYERS[22], // Yamal
    ALL_PLAYERS[33], // Bellingham
    ALL_PLAYERS[4], // Mac Allister
    ALL_PLAYERS[25], // Rodri
    ALL_PLAYERS[45], // Vinicius Jr
    ALL_PLAYERS[6], // Romero
    ALL_PLAYERS[17], // Saliba
    ALL_PLAYERS[62], // Alexander-Arnold
    ALL_PLAYERS[10], // E. Martínez
    ALL_PLAYERS[56], // Cristiano Ronaldo
    ALL_PLAYERS[67], // Pulisic
  ]);

  // Squad 11 Starters (4-3-3: GK, RB, CB1, CB2, LB, CDM, CM1, CM2, RW, ST, LW)
  const [starterSquad, setStarterSquad] = useState<(Player | null)[]>([
    ALL_PLAYERS[10], // GK E. Martínez
    ALL_PLAYERS[62], // RB Alexander-Arnold
    ALL_PLAYERS[6],  // CB1 Romero
    ALL_PLAYERS[17], // CB2 Saliba
    ALL_PLAYERS[20], // LB Theo Hernández
    ALL_PLAYERS[25], // CDM Rodri
    ALL_PLAYERS[4],  // CM1 Mac Allister
    ALL_PLAYERS[33], // CM2 Bellingham
    ALL_PLAYERS[0],  // RW Messi
    ALL_PLAYERS[11], // ST Mbappé
    ALL_PLAYERS[45], // LW Vinicius Jr
  ]);

  // Pack Walkout Modal State
  const [openingPack, setOpeningPack] = useState<FUTPack | null>(null);
  const [revealedCards, setRevealedCards] = useState<Player[]>([]);
  const [walkoutStage, setWalkoutStage] = useState<'tunnel' | 'walkout' | 'summary'>('tunnel');
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);

  // Open a pack
  const handleBuyPack = (pack: FUTPack) => {
    if (coins < pack.costCoins) {
      alert("Not enough FIFA Coins! Claim free daily coins below to open more packs.");
      return;
    }

    setCoins(c => c - pack.costCoins);
    sound.playPackOpeningFanfare();

    // Pull cards
    let pool = ALL_PLAYERS;
    if (pack.rarity === 'icon') {
      pool = ALL_PLAYERS.filter(p => p.cardTier === 'icon' || p.rating >= 90);
    } else if (pack.rarity === 'special') {
      pool = ALL_PLAYERS.filter(p => p.rating >= pack.minRating);
    }

    const pulled: Player[] = [];
    for (let i = 0; i < pack.cardCount; i++) {
      const card = pool[Math.floor(Math.random() * pool.length)] || ALL_PLAYERS[0];
      pulled.push(card);
    }

    // Sort by rating descending so top card walks out
    pulled.sort((a, b) => b.rating - a.rating);

    setOpeningPack(pack);
    setRevealedCards(pulled);
    setWalkoutStage('tunnel');

    // Sequence walkout
    setTimeout(() => {
      setWalkoutStage('walkout');
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.6 }
      });
    }, 1800);

    // Add to collection
    setOwnedPlayers(prev => {
      const newItems = [...prev];
      pulled.forEach(c => {
        if (!newItems.find(p => p.id === c.id)) {
          newItems.push(c);
        }
      });
      return newItems;
    });
  };

  // Calculate Squad Overall and Chemistry
  const squadOverall = Math.round(
    starterSquad.filter(Boolean).reduce((acc, p) => acc + (p?.rating || 0), 0) /
    (starterSquad.filter(Boolean).length || 1)
  );

  const chemistry = Math.min(33, starterSquad.filter(Boolean).length * 3);

  // Construct FUT playable team
  const handlePlayFUTMatch = () => {
    const validPlayers = starterSquad.map((p, idx) => p || ALL_PLAYERS[idx]);
    const futTeam: Team = {
      id: 'fut_custom_team',
      name: 'Ultimate Dream XI 2026',
      shortName: 'FUT',
      countryCode: 'UN',
      type: 'club',
      flag: '⭐',
      kit: {
        primary: '#09090b',
        secondary: '#eab308',
        accent: '#10b981',
        numbers: '#ffffff',
        gk: '#f59e0b'
      },
      awayKit: {
        primary: '#ffffff',
        secondary: '#09090b',
        accent: '#3b82f6',
        numbers: '#09090b',
        gk: '#ec4899'
      },
      overall: squadOverall,
      attack: squadOverall + 1,
      midfield: squadOverall,
      defense: squadOverall - 1,
      formation: '4-3-3',
      tacticalStyle: 'Tiki-Taka',
      stadium: 'Ultimate FUT 2026 Arena',
      players: validPlayers
    };

    onPlayWithSquad(futTeam);
  };

  return (
    <div className="w-full min-h-screen bg-neutral-950 text-neutral-100 p-6 flex flex-col items-center font-sans-ui">
      <div className="w-full max-w-6xl space-y-6">
        {/* Header Navigation Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="font-display font-black text-xl text-amber-400 flex items-center gap-2">
                <Sparkles className="w-5 h-5" /> ULTIMATE TEAM 2026 (FUT)
              </h2>
              <p className="text-xs text-neutral-400">Squad Building • Pack Openings • Dream XI</p>
            </div>
          </div>

          {/* User Currency Counter */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-neutral-950 border border-amber-500/30 px-3.5 py-1.5 rounded-xl">
              <Coins className="w-4 h-4 text-amber-400" />
              <span className="font-display font-bold text-amber-400 text-sm">
                {coins.toLocaleString()} <span className="text-xs text-neutral-400">COINS</span>
              </span>
            </div>

            <button
              onClick={() => {
                setCoins(c => c + 15000);
                sound.playPackOpeningFanfare();
              }}
              className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs rounded-xl transition"
            >
              + Free 15K Coins
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 border-b border-neutral-800 pb-2 text-sm font-display font-bold">
          <button
            onClick={() => setActiveTab('squad')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${
              activeTab === 'squad' ? 'bg-amber-500 text-neutral-950 shadow-lg' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" /> ACTIVE SQUAD (4-3-3)
          </button>
          <button
            onClick={() => setActiveTab('store')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${
              activeTab === 'store' ? 'bg-amber-500 text-neutral-950 shadow-lg' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-4 h-4" /> PACK STORE
          </button>
          <button
            onClick={() => setActiveTab('club')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${
              activeTab === 'club' ? 'bg-amber-500 text-neutral-950 shadow-lg' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Award className="w-4 h-4" /> MY CLUB ({ownedPlayers.length} CARDS)
          </button>
        </div>

        {/* TAB 1: SQUAD BUILDER */}
        {activeTab === 'squad' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Pitch View with Player Cards */}
            <div className="lg:col-span-2 bg-gradient-to-b from-emerald-950/40 via-neutral-900/90 to-neutral-950 border border-neutral-800 rounded-2xl p-6 relative flex flex-col items-center">
              {/* Pitch Visual Markings */}
              <div className="absolute inset-4 border-2 border-emerald-500/20 rounded-xl pointer-events-none" />
              <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-emerald-500/20 pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 border border-emerald-500/20 rounded-full pointer-events-none" />

              {/* Top Squad Metrics Bar */}
              <div className="w-full flex items-center justify-between z-10 mb-6 bg-neutral-900/90 border border-neutral-800 px-4 py-2 rounded-xl">
                <div className="flex items-center gap-4 text-xs">
                  <div>
                    <span className="text-neutral-400">Rating: </span>
                    <span className="font-display font-bold text-amber-400 text-base">{squadOverall}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400">Chemistry: </span>
                    <span className="font-display font-bold text-emerald-400 text-base">{chemistry}/33</span>
                  </div>
                  <div>
                    <span className="text-neutral-400">Formation: </span>
                    <span className="font-bold text-neutral-200">4-3-3</span>
                  </div>
                </div>

                <button
                  onClick={handlePlayFUTMatch}
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-emerald-400 hover:brightness-110 text-neutral-950 font-display font-black text-xs rounded-xl transition flex items-center gap-1.5 shadow-lg"
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> PLAY WITH SQUAD
                </button>
              </div>

              {/* 4-3-3 Formation Card Grid */}
              <div className="w-full max-w-lg space-y-4 z-10">
                {/* Attackers (RW, ST, LW) */}
                <div className="flex justify-around items-center">
                  {[8, 9, 10].map((slotIdx) => {
                    const player = starterSquad[slotIdx];
                    const posLabel = slotIdx === 8 ? 'RW' : slotIdx === 9 ? 'ST' : 'LW';
                    return (
                      <FUTCardSlot
                        key={slotIdx}
                        player={player}
                        slotPosition={posLabel}
                        onClick={() => setSelectedSlotIndex(slotIdx)}
                      />
                    );
                  })}
                </div>

                {/* Midfielders (CM, CDM, CM) */}
                <div className="flex justify-around items-center">
                  {[6, 5, 7].map((slotIdx) => {
                    const player = starterSquad[slotIdx];
                    const posLabel = slotIdx === 5 ? 'CDM' : 'CM';
                    return (
                      <FUTCardSlot
                        key={slotIdx}
                        player={player}
                        slotPosition={posLabel}
                        onClick={() => setSelectedSlotIndex(slotIdx)}
                      />
                    );
                  })}
                </div>

                {/* Defenders (LB, CB, CB, RB) */}
                <div className="flex justify-around items-center">
                  {[4, 2, 3, 1].map((slotIdx) => {
                    const player = starterSquad[slotIdx];
                    const posLabel = slotIdx === 4 ? 'LB' : slotIdx === 1 ? 'RB' : 'CB';
                    return (
                      <FUTCardSlot
                        key={slotIdx}
                        player={player}
                        slotPosition={posLabel}
                        onClick={() => setSelectedSlotIndex(slotIdx)}
                      />
                    );
                  })}
                </div>

                {/* Goalkeeper (GK) */}
                <div className="flex justify-center items-center">
                  <FUTCardSlot
                    player={starterSquad[0]}
                    slotPosition="GK"
                    onClick={() => setSelectedSlotIndex(0)}
                  />
                </div>
              </div>
            </div>

            {/* Right 1 Col: Bench & Card Assign Panel */}
            <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <h3 className="font-display font-bold text-sm text-neutral-200">
                  {selectedSlotIndex !== null ? `SWAP PLAYER FOR SLOT #${selectedSlotIndex + 1}` : 'CLUB RESERVES'}
                </h3>
                {selectedSlotIndex !== null && (
                  <button
                    onClick={() => setSelectedSlotIndex(null)}
                    className="text-xs text-neutral-400 hover:text-white"
                  >
                    Cancel
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                {ownedPlayers.map((player) => (
                  <div
                    key={player.id}
                    onClick={() => {
                      if (selectedSlotIndex !== null) {
                        const newSquad = [...starterSquad];
                        newSquad[selectedSlotIndex] = player;
                        setStarterSquad(newSquad);
                        setSelectedSlotIndex(null);
                        sound.playUISelect();
                      }
                    }}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 transition cursor-pointer ${
                      selectedSlotIndex !== null
                        ? 'hover:border-emerald-500 bg-neutral-950 border-neutral-800'
                        : 'bg-neutral-950/60 border-neutral-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-11 rounded bg-gradient-to-b from-amber-500/20 to-neutral-900 border border-amber-500/40 flex flex-col items-center justify-center text-[10px] font-display font-black text-amber-400">
                        <span>{player.rating}</span>
                        <span className="text-[8px] text-neutral-300">{player.position}</span>
                      </div>
                      <div>
                        <div className="font-bold text-xs text-white flex items-center gap-1.5">
                          <span>{player.name}</span>
                          <span className="text-xs">{player.nationFlag}</span>
                        </div>
                        <div className="text-[10px] text-neutral-400">{player.club}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] font-display text-neutral-400">
                      <span className="text-emerald-400 font-bold">{player.pace} PAC</span>
                      <span>•</span>
                      <span className="text-amber-400 font-bold">{player.shooting} SHO</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PACK STORE */}
        {activeTab === 'store' && (
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <h3 className="text-2xl font-display font-black text-white">FIFA 2026 PACK STORE</h3>
              <p className="text-neutral-400 text-xs">
                Unlock gold stars, special World Cup edition cards, and legendary Icons to dominate the pitch.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {PACKS_STORE.map((pack) => (
                <div
                  key={pack.id}
                  className="bg-neutral-900/90 border border-neutral-800 hover:border-amber-500/50 rounded-2xl p-6 flex flex-col items-center text-center space-y-5 transition duration-300 shadow-xl group"
                >
                  {/* 3D-style Pack Foil Cover */}
                  <div
                    className={`w-36 h-48 rounded-2xl bg-gradient-to-tr ${pack.imageColor} card-foil border-2 border-white/20 shadow-2xl flex flex-col items-center justify-between p-4 group-hover:scale-105 transition duration-300`}
                  >
                    <div className="flex items-center justify-between w-full text-[10px] font-display font-bold text-white tracking-widest">
                      <span>FUT 26</span>
                      <span>{pack.rarity.toUpperCase()}</span>
                    </div>
                    <div className="p-3 bg-black/30 rounded-full backdrop-blur-sm">
                      <Sparkles className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-center font-display font-extrabold text-xs text-white">
                      {pack.cardCount} PLAYERS
                    </div>
                  </div>

                  <div>
                    <h4 className="font-display font-extrabold text-lg text-white">{pack.name}</h4>
                    <p className="text-xs text-neutral-400 mt-1">{pack.description}</p>
                  </div>

                  <button
                    onClick={() => handleBuyPack(pack)}
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-display font-black text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Coins className="w-4 h-4 fill-current" />
                    <span>OPEN FOR {pack.costCoins.toLocaleString()} COINS</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: MY CLUB CARD COLLECTION */}
        {activeTab === 'club' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {ownedPlayers.map((player) => (
              <FUTCardItem key={player.id} player={player} />
            ))}
          </div>
        )}

        {/* DRAMATIC PACK WALKOUT OVERLAY MODAL */}
        {openingPack && (
          <div className="fixed inset-0 bg-neutral-950/95 backdrop-blur-xl flex flex-col items-center justify-center z-50 p-6 animate-in fade-in duration-300">
            {walkoutStage === 'tunnel' && (
              <div className="text-center space-y-4 animate-pulse">
                <div className="w-20 h-20 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center mx-auto text-amber-400">
                  <Sparkles className="w-10 h-10 animate-spin" />
                </div>
                <h2 className="text-3xl font-display font-black text-white tracking-widest uppercase">
                  OPENING {openingPack.name}...
                </h2>
              </div>
            )}

            {walkoutStage === 'walkout' && revealedCards.length > 0 && (
              <div className="flex flex-col items-center space-y-6 animate-in zoom-in-75 duration-500">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400 text-amber-400 font-display font-black text-sm tracking-widest uppercase animate-bounce">
                  <Flame className="w-4 h-4 fill-current" />
                  WALKOUT SUPERSTAR REVEAL
                </div>

                {/* Top Card Walkout Display */}
                <div className="scale-125 my-4">
                  <FUTCardItem player={revealedCards[0]} />
                </div>

                {/* Other Cards in Pack */}
                <div className="flex items-center gap-3 pt-4 border-t border-neutral-800">
                  {revealedCards.slice(1).map((c) => (
                    <FUTCardItem key={c.id} player={c} isMini />
                  ))}
                </div>

                <button
                  onClick={() => setOpeningPack(null)}
                  className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-display font-black text-sm rounded-xl transition shadow-xl"
                >
                  ADD TO SQUAD / CLAIM CARDS
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Sub-component: FUT Pitch Card Slot
const FUTCardSlot: React.FC<{ player: Player | null; slotPosition: string; onClick: () => void }> = ({
  player,
  slotPosition,
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className={`w-20 h-28 rounded-xl border transition-all cursor-pointer flex flex-col items-center justify-between p-1.5 shadow-md ${
        player
          ? 'bg-gradient-to-b from-neutral-800 to-neutral-950 border-amber-500/50 hover:border-amber-400 hover:scale-105'
          : 'bg-neutral-950/80 border-dashed border-neutral-700 hover:border-emerald-500'
      }`}
    >
      {player ? (
        <>
          <div className="w-full flex items-center justify-between text-[10px] font-display font-extrabold text-amber-400 leading-tight">
            <span>{player.rating}</span>
            <span className="text-[8px] text-neutral-400">{slotPosition}</span>
          </div>

          <div className="w-9 h-9 rounded-full bg-neutral-800 flex items-center justify-center text-sm">
            {player.nationFlag}
          </div>

          <div className="text-center w-full">
            <div className="font-bold text-[10px] text-white truncate">{player.commonName}</div>
            <div className="text-[8px] text-neutral-400 truncate">{player.club}</div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-neutral-500 gap-1">
          <Plus className="w-4 h-4" />
          <span className="text-[9px] font-bold">{slotPosition}</span>
        </div>
      )}
    </div>
  );
};

// Sub-component: Authentic FUT Gold / Icon Card Presentation
const FUTCardItem: React.FC<{ player: Player; isMini?: boolean }> = ({ player, isMini }) => {
  const isIcon = player.cardTier === 'icon';
  const isSpecial = player.cardTier === 'special';

  const cardGradient = isIcon
    ? 'from-amber-200 via-amber-400 to-yellow-600 border-amber-300 text-neutral-950'
    : isSpecial
    ? 'from-cyan-900 via-blue-900 to-neutral-950 border-cyan-400 text-white'
    : 'from-amber-600 via-yellow-700 to-neutral-900 border-amber-500/60 text-white';

  if (isMini) {
    return (
      <div className={`w-16 h-22 rounded-lg bg-gradient-to-b ${cardGradient} border p-1 flex flex-col items-center justify-between text-[9px]`}>
        <div className="font-display font-black text-amber-300">{player.rating}</div>
        <div className="text-xs">{player.nationFlag}</div>
        <div className="font-bold truncate text-[8px]">{player.commonName}</div>
      </div>
    );
  }

  return (
    <div
      className={`w-32 h-48 rounded-2xl bg-gradient-to-b ${cardGradient} card-foil border-2 p-3 flex flex-col justify-between shadow-2xl transition hover:scale-105`}
    >
      {/* Top Card Info */}
      <div className="flex items-start justify-between">
        <div className="leading-tight">
          <div className="font-display font-black text-2xl text-amber-300 drop-shadow">
            {player.rating}
          </div>
          <div className="text-[10px] font-display font-extrabold text-neutral-300">{player.position}</div>
          <div className="text-base mt-0.5">{player.nationFlag}</div>
        </div>

        <div className="w-14 h-14 rounded-full bg-black/20 border border-white/20 flex items-center justify-center text-xl shadow-inner">
          ⚽
        </div>
      </div>

      {/* Player Name */}
      <div className="text-center border-t border-b border-white/20 py-1">
        <div className="font-display font-black text-xs tracking-wider uppercase truncate">
          {player.name}
        </div>
        <div className="text-[9px] text-neutral-300 truncate">{player.club}</div>
      </div>

      {/* Hex Attributes */}
      <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[9px] font-display font-bold">
        <div className="flex justify-between">
          <span className="text-neutral-400">PAC</span>
          <span>{player.pace}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-400">DRI</span>
          <span>{player.dribbling}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-400">SHO</span>
          <span>{player.shooting}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-400">DEF</span>
          <span>{player.defending}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-400">PAS</span>
          <span>{player.passing}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-400">PHY</span>
          <span>{player.physical}</span>
        </div>
      </div>
    </div>
  );
};
