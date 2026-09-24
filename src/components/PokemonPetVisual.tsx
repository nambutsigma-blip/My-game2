import React from 'react';
import {
  PetCompanion,
  PetAppearance,
  PetArchetype,
  PetPattern,
  PetHeadAccessory,
  PetBackWing,
  PetAuraEffect,
  PetParticleStyle,
  PetAuraIntensity,
} from '../types';

interface PokemonPetVisualProps {
  pet: PetCompanion;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'giant' | 'battle-front' | 'battle-back';
  facing?: 'front' | 'back';
  combatState?: 'idle' | 'attack' | 'hit' | 'special' | 'victory' | 'faint';
  overrideAppearance?: PetAppearance;
  className?: string;
  showAura?: boolean;
  showShadow?: boolean;
  showTitleBadge?: boolean;
}

// Default appearance derivation based on pet element, rarity, and name
export const getDefaultAppearance = (pet: PetCompanion): PetAppearance => {
  const nameLower = (pet.name + ' ' + (pet.description || '')).toLowerCase();

  let archetype: PetArchetype = 'dragon';
  if (nameLower.includes('ancient') || nameLower.includes('viễn cổ') || nameLower.includes('long vương') || pet.tierRank >= 11) {
    archetype = 'ancient_dragon';
  } else if (nameLower.includes('lion') || nameLower.includes('sư tử')) {
    archetype = 'divine_lion';
  } else if (nameLower.includes('pegasus') || nameLower.includes('thiên mã') || nameLower.includes('ngựa') || nameLower.includes('unicorn')) {
    archetype = 'pegasus';
  } else if (nameLower.includes('leviathan') || nameLower.includes('thủy quái') || nameLower.includes('whale') || nameLower.includes('cá voi')) {
    archetype = 'leviathan';
  } else if (nameLower.includes('shadow phoenix') || nameLower.includes('hắc phượng') || (nameLower.includes('phoenix') && pet.element === 'void')) {
    archetype = 'shadow_phoenix';
  } else if (nameLower.includes('behemoth') || nameLower.includes('cự thú') || nameLower.includes('rex') || nameLower.includes('mammoth')) {
    archetype = 'behemoth';
  } else if (nameLower.includes('wolf') || nameLower.includes('sói') || nameLower.includes('hound') || nameLower.includes('chó')) {
    archetype = 'wolf';
  } else if (nameLower.includes('fox') || nameLower.includes('cáo') || nameLower.includes('kitsune')) {
    archetype = 'kitsune';
  } else if (nameLower.includes('tiger') || nameLower.includes('hổ') || nameLower.includes('báo') || nameLower.includes('cat')) {
    archetype = 'tiger';
  } else if (nameLower.includes('bird') || nameLower.includes('phoenix') || nameLower.includes('phượng') || nameLower.includes('chim') || nameLower.includes('eagle')) {
    archetype = 'phoenix';
  } else if (nameLower.includes('serpent') || nameLower.includes('snake') || nameLower.includes('rắn')) {
    archetype = 'serpent';
  } else if (nameLower.includes('turtle') || nameLower.includes('rùa') || nameLower.includes('golem')) {
    archetype = 'turtle';
  } else if (nameLower.includes('mecha') || nameLower.includes('robot') || nameLower.includes('máy')) {
    archetype = 'mecha';
  } else if (nameLower.includes('chúa tể') || nameLower.includes('lord') || nameLower.includes('god') || pet.rarity === 'king_of_god') {
    archetype = 'celestial';
  }

  let primaryColor = '#ef4444';
  let secondaryColor = '#f59e0b';
  let eyeGlowColor = '#facc15';
  let auraEffect: PetAuraEffect = 'flames';
  let particleStyle: PetParticleStyle = 'none';

  switch (pet.element) {
    case 'fire':
      primaryColor = '#ef4444';
      secondaryColor = '#f97316';
      eyeGlowColor = '#fde047';
      auraEffect = 'flames';
      particleStyle = 'embers';
      break;
    case 'frost':
      primaryColor = '#0284c7';
      secondaryColor = '#38bdf8';
      eyeGlowColor = '#bae6fd';
      auraEffect = 'ice_crystals';
      particleStyle = 'stars';
      break;
    case 'thunder':
      primaryColor = '#eab308';
      secondaryColor = '#facc15';
      eyeGlowColor = '#fef08a';
      auraEffect = 'sparks';
      particleStyle = 'lightning';
      break;
    case 'shadow':
    case 'void':
      primaryColor = '#6b21a8';
      secondaryColor = '#a855f7';
      eyeGlowColor = '#e9d5ff';
      auraEffect = 'dark_matter';
      particleStyle = 'embers';
      break;
    case 'nature':
      primaryColor = '#059669';
      secondaryColor = '#34d399';
      eyeGlowColor = '#a7f3d0';
      auraEffect = 'nature_leaves';
      particleStyle = 'petals';
      break;
    case 'wind':
      primaryColor = '#0d9488';
      secondaryColor = '#2dd4bf';
      eyeGlowColor = '#99f6e4';
      auraEffect = 'sparks';
      particleStyle = 'feathers';
      break;
    case 'gold':
    case 'divine':
      primaryColor = '#d97706';
      secondaryColor = '#fde047';
      eyeGlowColor = '#ffffff';
      auraEffect = 'divine_matrix';
      particleStyle = 'stars';
      break;
    case 'cosmic':
    default:
      primaryColor = '#7e22ce';
      secondaryColor = '#ec4899';
      eyeGlowColor = '#f472b6';
      auraEffect = 'supernova';
      particleStyle = 'stars';
      break;
  }

  const isHighTier = (pet.tierRank || 1) >= 10 || (pet.enchantmentLevel || 0) >= 4;
  const isMythic = (pet.tierRank || 1) >= 12 || (pet.enchantmentLevel || 0) >= 5;

  let headAccessory: PetHeadAccessory = 'none';
  if (isMythic) headAccessory = 'pharaoh_crown';
  else if (isHighTier) headAccessory = 'crown';
  else if ((pet.enchantmentLevel || 0) >= 2) headAccessory = 'dragon_horns';

  let backWing: PetBackWing = 'none';
  if (isMythic) backWing = 'phoenix_flame_wings';
  else if (isHighTier) backWing = 'dragon_wings';
  else if ((pet.enchantmentLevel || 0) >= 3) backWing = 'angel_feathers';

  let pattern: PetPattern = 'none';
  if (isMythic) pattern = 'divine_crest';
  else if (isHighTier) pattern = 'runes';

  let auraIntensity: PetAuraIntensity = 'radiant';
  if (isMythic) auraIntensity = 'godlike';
  else if (isHighTier) auraIntensity = 'hyper';

  return {
    archetype,
    primaryColor,
    secondaryColor,
    eyeGlowColor,
    pattern,
    headAccessory,
    backWing,
    auraEffect: isHighTier ? auraEffect : 'none',
    auraIntensity,
    particleStyle: isHighTier ? particleStyle : 'none',
    costumeTitle: isHighTier ? `Linh Thú ${pet.name}` : undefined,
  };
};

const PokemonPetVisualComponent: React.FC<PokemonPetVisualProps> = ({
  pet,
  size = 'md',
  facing = 'front',
  combatState = 'idle',
  overrideAppearance,
  className = '',
  showAura = true,
  showShadow = true,
  showTitleBadge = true,
}) => {
  const app = overrideAppearance || pet.appearance || getDefaultAppearance(pet);
  const gradId = `pet-art-${pet.id || 'preview'}-${facing}-${Math.abs(hashString(app.primaryColor + app.secondaryColor))}`;

  // Box dimensions
  let boxPx = 96;
  if (size === 'xs') boxPx = 48;
  else if (size === 'sm') boxPx = 64;
  else if (size === 'md') boxPx = 96;
  else if (size === 'lg') boxPx = 130;
  else if (size === 'xl') boxPx = 180;
  else if (size === 'giant') boxPx = 240;
  else if (size === 'battle-front') boxPx = 200;
  else if (size === 'battle-back') boxPx = 220;

  // Combat animation classes
  let animClass = 'animate-pet-breathe';
  if (combatState === 'attack') animClass = facing === 'back' ? 'attackLunge animate-lunge-back' : 'attackLunge attackLungeOpponent animate-lunge-front';
  else if (combatState === 'hit') animClass = 'hitFlash animate-hit-shake';
  else if (combatState === 'special') animClass = facing === 'back' ? 'attackLunge animate-lunge-back scale-110' : 'attackLunge attackLungeOpponent animate-lunge-front scale-110';
  else if (combatState === 'victory') animClass = 'animate-bounce';
  else if (combatState === 'faint') animClass = 'opacity-40 translate-y-6 grayscale transition-all duration-700';

  // Aura intensity scaling
  const intensity = app.auraIntensity || 'radiant';
  let auraScale = 1.35;
  let auraOpacity = 0.65;
  if (intensity === 'subtle') {
    auraScale = 1.15;
    auraOpacity = 0.35;
  } else if (intensity === 'hyper') {
    auraScale = 1.55;
    auraOpacity = 0.85;
  } else if (intensity === 'godlike') {
    auraScale = 1.8;
    auraOpacity = 1.0;
  }

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${animClass} ${className}`}
      style={{ width: boxPx, height: boxPx }}
    >
      {/* --- FLOATING TITLE BADGE --- */}
      {showTitleBadge && app.costumeTitle && size !== 'xs' && size !== 'sm' && (
        <div className="absolute -top-7 pointer-events-none whitespace-nowrap px-2.5 py-0.5 rounded-full bg-slate-950/90 border border-amber-400/80 text-[10px] font-black text-amber-300 shadow-lg shadow-amber-950/60 flex items-center gap-1 z-30 animate-pulse">
          <span className="text-[10px]">✨</span>
          <span>{app.costumeTitle}</span>
          <span className="text-[10px]">✨</span>
        </div>
      )}

      {/* --- 1. GROUND SHADOW --- */}
      {showShadow && (
        <div
          className="absolute bottom-1 w-[70%] h-3 bg-black/50 rounded-full blur-sm pointer-events-none -z-20"
          style={{ transform: 'scaleY(0.5)' }}
        />
      )}

      {/* --- 2. ELEMENTAL AMBIENT AURA --- */}
      {showAura && app.auraEffect && app.auraEffect !== 'none' && (
        <div
          className="absolute inset-0 rounded-full pointer-events-none -z-10 animate-pulse"
          style={{
            background: `radial-gradient(circle, ${app.secondaryColor}50 0%, ${app.primaryColor}30 50%, transparent 75%)`,
            transform: `scale(${auraScale})`,
            filter: 'blur(10px)',
            opacity: auraOpacity,
          }}
        />
      )}

      {/* Godlike double rainbow ring */}
      {showAura && intensity === 'godlike' && (
        <div
          className="absolute inset-0 rounded-full pointer-events-none -z-10 animate-spin"
          style={{
            border: `2px dashed ${app.secondaryColor}`,
            transform: 'scale(1.6)',
            animationDuration: '14s',
            opacity: 0.7,
            filter: 'drop-shadow(0 0 8px rgba(250,204,21,0.8))',
          }}
        />
      )}

      {/* --- 3. DYNAMIC AURA FX --- */}
      {showAura && app.auraEffect === 'sparks' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10 animate-spin" style={{ animationDuration: '6s' }}>
          <div className="absolute -top-2 w-3 h-3 rounded-full bg-amber-300 shadow-[0_0_10px_#facc15] animate-ping" />
          <div className="absolute -bottom-2 w-2.5 h-2.5 rounded-full bg-cyan-300 shadow-[0_0_10px_#38bdf8]" />
        </div>
      )}

      {showAura && app.auraEffect === 'flames' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
          <div className="absolute -top-4 w-3.5 h-3.5 rounded-full bg-rose-500 blur-[1px] animate-bounce" />
          <div className="absolute -top-2 right-2 w-3 h-3 rounded-full bg-amber-400 blur-[1px] animate-pulse" />
          <div className="absolute bottom-1 left-2 w-2.5 h-2.5 rounded-full bg-orange-500 blur-[1px] animate-ping" />
        </div>
      )}

      {showAura && (app.auraEffect === 'frost' || app.auraEffect === 'ice_crystals') && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
          <div className="absolute -top-3 left-1 text-xs animate-spin" style={{ animationDuration: '8s' }}>❄️</div>
          <div className="absolute -bottom-2 right-1 text-xs animate-pulse">💎</div>
          <div className="absolute top-1 right-[-4px] text-[10px] animate-ping">✨</div>
        </div>
      )}

      {showAura && app.auraEffect === 'supernova' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
          <div className="absolute w-[120%] h-[120%] rounded-full border border-pink-400/60 animate-ping opacity-60" />
          <div className="absolute w-[140%] h-[140%] rounded-full border-2 border-purple-400/40 animate-spin" style={{ animationDuration: '10s' }} />
          <div className="absolute -top-3 text-xs animate-pulse">🪐</div>
        </div>
      )}

      {showAura && app.auraEffect === 'divine_matrix' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10 animate-spin" style={{ animationDuration: '12s' }}>
          <div className="w-[130%] h-[130%] rounded-full border-2 border-dashed border-amber-300/80 shadow-[0_0_12px_#facc15]" />
          <div className="absolute -top-2 text-xs">☀️</div>
          <div className="absolute -bottom-2 text-xs">👑</div>
        </div>
      )}

      {showAura && app.auraEffect === 'dark_matter' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10 animate-spin" style={{ animationDuration: '9s' }}>
          <div className="w-[140%] h-[140%] rounded-full bg-purple-950/40 border border-purple-500/70 blur-[2px] shadow-[0_0_15px_#7c3aed]" />
          <div className="absolute -top-2 text-xs">🕳️</div>
          <div className="absolute -bottom-2 text-xs">⚡</div>
        </div>
      )}

      {showAura && app.auraEffect === 'nature_leaves' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10 animate-spin" style={{ animationDuration: '14s' }}>
          <div className="absolute -top-3 left-2 text-xs">🍃</div>
          <div className="absolute -bottom-2 right-2 text-xs">🌿</div>
          <div className="absolute top-2 -left-2 text-xs">🌸</div>
        </div>
      )}

      {/* --- 4. ATMOSPHERIC FLOATING PARTICLES --- */}
      {app.particleStyle === 'petals' && (
        <div className="absolute inset-0 pointer-events-none -z-10 overflow-visible">
          <div className="absolute top-0 left-1 text-[11px] animate-bounce opacity-80">🌸</div>
          <div className="absolute bottom-1 right-2 text-[9px] animate-pulse opacity-70">🌺</div>
        </div>
      )}
      {app.particleStyle === 'feathers' && (
        <div className="absolute inset-0 pointer-events-none -z-10 overflow-visible">
          <div className="absolute -top-2 right-1 text-[11px] animate-bounce opacity-85">🪶</div>
          <div className="absolute bottom-2 left-0 text-[10px] animate-pulse opacity-75">🕊️</div>
        </div>
      )}
      {app.particleStyle === 'stars' && (
        <div className="absolute inset-0 pointer-events-none -z-10 overflow-visible">
          <div className="absolute -top-3 right-0 text-[11px] animate-ping opacity-90">✨</div>
          <div className="absolute bottom-0 left-1 text-[10px] animate-pulse opacity-80">⭐</div>
          <div className="absolute top-4 -left-2 text-[8px] animate-ping opacity-70">💫</div>
        </div>
      )}
      {app.particleStyle === 'lightning' && (
        <div className="absolute inset-0 pointer-events-none -z-10 overflow-visible">
          <div className="absolute -top-2 left-2 text-[11px] animate-ping text-amber-300">⚡</div>
          <div className="absolute bottom-1 right-1 text-[10px] animate-bounce text-cyan-300">⚡</div>
        </div>
      )}
      {app.particleStyle === 'bubbles' && (
        <div className="absolute inset-0 pointer-events-none -z-10 overflow-visible">
          <div className="absolute top-1 left-2 text-[10px] animate-bounce opacity-75">🫧</div>
          <div className="absolute bottom-2 right-3 text-[12px] animate-ping opacity-60">🫧</div>
        </div>
      )}
      {app.particleStyle === 'embers' && (
        <div className="absolute inset-0 pointer-events-none -z-10 overflow-visible">
          <div className="absolute top-0 right-3 w-1.5 h-1.5 rounded-full bg-orange-400 shadow-[0_0_6px_#f97316] animate-ping" />
          <div className="absolute bottom-3 left-2 w-2 h-2 rounded-full bg-amber-300 shadow-[0_0_8px_#facc15] animate-bounce" />
        </div>
      )}

      {/* --- 5. MAIN SVG CREATURE GRAPHIC --- */}
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full drop-shadow-xl overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`${gradId}-body`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={app.secondaryColor} />
            <stop offset="100%" stopColor={app.primaryColor} />
          </linearGradient>

          <linearGradient id={`${gradId}-belly`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="100%" stopColor={app.secondaryColor} stopOpacity="0.8" />
          </linearGradient>

          <linearGradient id={`${gradId}-wing`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="40%" stopColor={app.secondaryColor} />
            <stop offset="100%" stopColor={app.primaryColor} />
          </linearGradient>

          <linearGradient id={`${gradId}-flame`} x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#b91c1c" />
            <stop offset="50%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#fef08a" />
          </linearGradient>

          <linearGradient id={`${gradId}-mech`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>

          <filter id={`${gradId}-glow`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* --- BACK WINGS / CAPES LAYER (BEHIND BODY) --- */}
        {app.backWing === 'dragon_wings' && (
          <g className="animate-wing-flap">
            <path
              d="M100 95 C60 40 10 35 5 60 C5 95 65 110 100 105 Z"
              fill={`url(#${gradId}-wing)`}
              stroke="#0f172a"
              strokeWidth="2.5"
              filter={`url(#${gradId}-glow)`}
            />
            <path
              d="M100 95 C140 40 190 35 195 60 C195 95 135 110 100 105 Z"
              fill={`url(#${gradId}-wing)`}
              stroke="#0f172a"
              strokeWidth="2.5"
              filter={`url(#${gradId}-glow)`}
            />
          </g>
        )}

        {app.backWing === 'phoenix_flame_wings' && (
          <g className="animate-wing-flap">
            {/* Multi-layered fiery feathers */}
            <path
              d="M100 100 C50 35 5 30 0 65 C0 100 60 115 100 105 Z"
              fill={`url(#${gradId}-flame)`}
              stroke="#ca8a04"
              strokeWidth="2"
              filter={`url(#${gradId}-glow)`}
            />
            <path
              d="M100 100 C150 35 195 30 200 65 C200 100 140 115 100 105 Z"
              fill={`url(#${gradId}-flame)`}
              stroke="#ca8a04"
              strokeWidth="2"
              filter={`url(#${gradId}-glow)`}
            />
            <path d="M40 50 Q20 20 15 35 Q45 65 65 85" stroke="#fef08a" strokeWidth="2.5" />
            <path d="M160 50 Q180 20 185 35 Q155 65 135 85" stroke="#fef08a" strokeWidth="2.5" />
          </g>
        )}

        {app.backWing === 'angel_feathers' && (
          <g className="animate-wing-flap">
            <path
              d="M95 100 C60 40 25 35 15 65 C10 85 45 115 95 110 Z"
              fill="#ffffff"
              stroke={app.secondaryColor}
              strokeWidth="2"
            />
            <path d="M45 60 C35 75 40 95 65 105" stroke={app.primaryColor} strokeWidth="1.5" />
            <path
              d="M105 100 C140 40 175 35 185 65 C190 85 155 115 105 110 Z"
              fill="#ffffff"
              stroke={app.secondaryColor}
              strokeWidth="2"
            />
            <path d="M155 60 C165 75 160 95 135 105" stroke={app.primaryColor} strokeWidth="1.5" />
          </g>
        )}

        {app.backWing === 'void_shadow_cape' && (
          <g className="animate-pulse">
            <path
              d="M70 95 C50 115 30 160 35 185 C45 190 60 175 75 180 C85 185 90 170 100 175 C110 170 115 185 125 180 C140 175 155 190 165 185 C170 160 150 115 130 95 Z"
              fill="#1e1b4b"
              stroke="#7c3aed"
              strokeWidth="2.5"
              filter={`url(#${gradId}-glow)`}
            />
          </g>
        )}

        {app.backWing === 'celestial_mech_thrusters' && (
          <g>
            <rect x="50" y="80" width="16" height="36" rx="4" fill="#334155" stroke="#94a3b8" strokeWidth="2" />
            <rect x="134" y="80" width="16" height="36" rx="4" fill="#334155" stroke="#94a3b8" strokeWidth="2" />
            {/* Plasma exhaust cones */}
            <polygon points="52,116 64,116 58,145" fill={`url(#${gradId}-mech)`} filter={`url(#${gradId}-glow)`} />
            <polygon points="136,116 148,116 142,145" fill={`url(#${gradId}-mech)`} filter={`url(#${gradId}-glow)`} />
          </g>
        )}

        {app.backWing === 'butterfly_prism_wings' && (
          <g opacity="0.9" className="animate-wing-flap">
            <path d="M98 90 C65 30 10 30 20 80 C28 115 80 105 98 98 Z" fill="#e0e7ff" stroke="#818cf8" strokeWidth="2" />
            <path d="M98 102 C60 110 30 145 50 165 C70 175 90 130 98 108 Z" fill="#fae8ff" stroke="#d946ef" strokeWidth="1.5" />
            <path d="M102 90 C135 30 190 30 180 80 C172 115 120 105 102 98 Z" fill="#e0e7ff" stroke="#818cf8" strokeWidth="2" />
            <path d="M102 102 C140 110 170 145 150 165 C130 175 110 130 102 108 Z" fill="#fae8ff" stroke="#d946ef" strokeWidth="1.5" />
          </g>
        )}

        {app.backWing === 'energy_blades' && (
          <g className="animate-pulse">
            <polygon points="100,90 20,40 45,85 85,95" fill={app.secondaryColor} opacity="0.9" />
            <polygon points="100,90 180,40 155,85 115,95" fill={app.secondaryColor} opacity="0.9" />
          </g>
        )}

        {app.backWing === 'fairy_wings' && (
          <g opacity="0.85">
            <ellipse cx="60" cy="70" rx="35" ry="25" fill="#fbcfe8" transform="rotate(-25 60 70)" stroke="#ec4899" strokeWidth="1.5" />
            <ellipse cx="140" cy="70" rx="35" ry="25" fill="#fbcfe8" transform="rotate(25 140 70)" stroke="#ec4899" strokeWidth="1.5" />
          </g>
        )}

        {/* --- TAIL / REAR DETAILS --- */}
        {facing === 'front' ? (
          /* Front view: Tail curling from side */
          app.archetype === 'kitsune' ? (
            /* Multi-tail fanning */
            <g opacity="0.9">
              <path d="M125 140 C170 135 190 110 180 85 C170 100 150 120 120 135 Z" fill={`url(#${gradId}-body)`} stroke="#0f172a" strokeWidth="2" />
              <path d="M130 145 C180 150 195 130 190 105 C180 120 155 135 125 140 Z" fill={`url(#${gradId}-body)`} stroke="#0f172a" strokeWidth="2" />
            </g>
          ) : (
            <path
              d="M130 145 C165 145 185 120 180 95 C175 75 160 85 165 100 C170 115 150 130 120 138 Z"
              fill={`url(#${gradId}-body)`}
              stroke="#0f172a"
              strokeWidth="2"
            />
          )
        ) : (
          /* Back view: Tail prominently centered extending upward */
          <path
            d="M100 150 C115 175 150 180 165 150 C175 125 145 115 135 135 C125 145 115 140 100 145 Z"
            fill={`url(#${gradId}-body)`}
            stroke="#0f172a"
            strokeWidth="2.5"
          />
        )}

        {/* --- MAIN CREATURE BODY --- */}
        {/* Feet / Paws */}
        <ellipse cx="70" cy="165" rx="18" ry="10" fill={app.primaryColor} stroke="#0f172a" strokeWidth="2" />
        <ellipse cx="130" cy="165" rx="18" ry="10" fill={app.primaryColor} stroke="#0f172a" strokeWidth="2" />

        {/* Torso */}
        <path
          d="M60 115 C55 145 70 165 100 165 C130 165 145 145 140 115 C135 90 65 90 60 115 Z"
          fill={`url(#${gradId}-body)`}
          stroke="#0f172a"
          strokeWidth="3"
        />

        {/* Belly patch if facing front */}
        {facing === 'front' && (
          <path
            d="M75 125 C75 150 85 160 100 160 C115 160 125 150 125 125 C125 115 75 115 75 125 Z"
            fill={`url(#${gradId}-belly)`}
            stroke="#0f172a"
            strokeWidth="1.5"
          />
        )}

        {/* --- BODY PATTERNS --- */}
        {app.pattern === 'stripes' && (
          <g stroke="#0f172a" strokeWidth="2.5" opacity="0.6">
            <path d="M68 120 L85 125" />
            <path d="M66 135 L88 138" />
            <path d="M132 120 L115 125" />
            <path d="M134 135 L112 138" />
          </g>
        )}

        {app.pattern === 'tiger_stripes_gold' && (
          <g stroke="#facc15" strokeWidth="2.5" filter={`url(#${gradId}-glow)`}>
            <path d="M68 120 L86 124" />
            <path d="M66 135 L88 138" />
            <path d="M132 120 L114 124" />
            <path d="M134 135 L112 138" />
          </g>
        )}

        {app.pattern === 'runes' && (
          <g stroke="#ffffff" strokeWidth="2" filter={`url(#${gradId}-glow)`} opacity="0.9">
            <circle cx="100" cy="135" r="7" strokeDasharray="3 2" />
            <path d="M100 125 L100 145" />
            <path d="M92 135 L108 135" />
          </g>
        )}

        {app.pattern === 'divine_crest' && (
          <g filter={`url(#${gradId}-glow)`}>
            <circle cx="100" cy="135" r="8" fill="#fde047" stroke="#b45309" strokeWidth="1.5" />
            <polygon points="100,123 103,135 100,147 97,135" fill="#ef4444" />
            <polygon points="88,135 100,138 112,135 100,132" fill="#ef4444" />
          </g>
        )}

        {app.pattern === 'lightning_circuit' && (
          <g stroke="#22d3ee" strokeWidth="1.5" filter={`url(#${gradId}-glow)`}>
            <path d="M80 125 L88 125 L92 132 L92 142" />
            <path d="M120 125 L112 125 L108 132 L108 142" />
            <circle cx="92" cy="142" r="2" fill="#22d3ee" />
            <circle cx="108" cy="142" r="2" fill="#22d3ee" />
          </g>
        )}

        {app.pattern === 'cosmic_nebula' && (
          <g opacity="0.85">
            <circle cx="90" cy="130" r="1.5" fill="#f43f5e" filter={`url(#${gradId}-glow)`} />
            <circle cx="110" cy="128" r="1.5" fill="#38bdf8" filter={`url(#${gradId}-glow)`} />
            <circle cx="100" cy="142" r="2" fill="#facc15" filter={`url(#${gradId}-glow)`} />
          </g>
        )}

        {app.pattern === 'scales' && (
          <g fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.4">
            <path d="M90 125 C95 130 105 130 110 125" />
            <path d="M85 135 C92 142 108 142 115 135" />
          </g>
        )}

        {/* --- HEAD BASE ARCHETYPES --- */}
        {(app.archetype === 'dragon' || app.archetype === 'ancient_dragon') && (
          <g>
            <path
              d="M60 70 C50 45 75 35 100 40 C125 35 150 45 140 70 C145 95 125 105 100 105 C75 105 55 95 60 70 Z"
              fill={`url(#${gradId}-body)`}
              stroke="#0f172a"
              strokeWidth="3"
            />
            {app.archetype === 'ancient_dragon' && (
              /* Ancient Dragon Whiskers and Chin Spikes */
              <g stroke="#facc15" strokeWidth="2" fill="none">
                <path d="M72 82 Q55 90 40 105" />
                <path d="M128 82 Q145 90 160 105" />
              </g>
            )}
          </g>
        )}

        {app.archetype === 'divine_lion' && (
          <g>
            {/* Imperial Lion Radiant Mane */}
            <circle cx="100" cy="68" r="44" fill="#d97706" stroke="#b45309" strokeWidth="2.5" />
            <circle cx="100" cy="68" r="34" fill={`url(#${gradId}-body)`} stroke="#0f172a" strokeWidth="2.5" />
            {/* Small lion ears */}
            <circle cx="68" cy="38" r="10" fill="#f59e0b" stroke="#0f172a" strokeWidth="2" />
            <circle cx="132" cy="38" r="10" fill="#f59e0b" stroke="#0f172a" strokeWidth="2" />
          </g>
        )}

        {app.archetype === 'wolf' && (
          <g>
            <polygon points="65,55 45,20 75,35" fill={app.primaryColor} stroke="#0f172a" strokeWidth="2.5" />
            <polygon points="135,55 155,20 125,35" fill={app.primaryColor} stroke="#0f172a" strokeWidth="2.5" />
            <polygon points="63,50 50,26 71,37" fill="#fda4af" />
            <polygon points="137,50 150,26 129,37" fill="#fda4af" />
            <path
              d="M65 65 C55 45 75 40 100 42 C125 40 145 45 135 65 C145 85 125 100 100 102 C75 100 55 85 65 65 Z"
              fill={`url(#${gradId}-body)`}
              stroke="#0f172a"
              strokeWidth="3"
            />
          </g>
        )}

        {(app.archetype === 'phoenix' || app.archetype === 'shadow_phoenix') && (
          <g>
            <path d="M100 35 C95 15 80 10 75 15 C85 25 90 30 100 35 Z" fill={app.secondaryColor} stroke="#0f172a" strokeWidth="2" />
            <path d="M100 35 C105 10 115 5 120 12 C115 22 108 30 100 35 Z" fill={app.archetype === 'shadow_phoenix' ? '#c084fc' : '#fde047'} stroke="#0f172a" strokeWidth="2" />
            <circle cx="100" cy="65" r="32" fill={`url(#${gradId}-body)`} stroke="#0f172a" strokeWidth="3" />
          </g>
        )}

        {app.archetype === 'tiger' && (
          <g>
            <circle cx="65" cy="40" r="14" fill={app.primaryColor} stroke="#0f172a" strokeWidth="2.5" />
            <circle cx="65" cy="40" r="7" fill="#ffffff" />
            <circle cx="135" cy="40" r="14" fill={app.primaryColor} stroke="#0f172a" strokeWidth="2.5" />
            <circle cx="135" cy="40" r="7" fill="#ffffff" />
            <ellipse cx="100" cy="70" rx="38" ry="32" fill={`url(#${gradId}-body)`} stroke="#0f172a" strokeWidth="3" />
          </g>
        )}

        {app.archetype === 'kitsune' && (
          <g>
            <polygon points="65,55 40,15 80,35" fill={app.primaryColor} stroke="#0f172a" strokeWidth="2.5" />
            <polygon points="135,55 160,15 120,35" fill={app.primaryColor} stroke="#0f172a" strokeWidth="2.5" />
            <polygon points="63,50 46,22 75,37" fill="#ffffff" />
            <polygon points="137,50 154,22 125,37" fill="#ffffff" />
            <path
              d="M60 65 C55 45 75 40 100 42 C125 40 145 45 140 65 C145 90 125 105 100 105 C75 105 55 90 60 65 Z"
              fill={`url(#${gradId}-body)`}
              stroke="#0f172a"
              strokeWidth="3"
            />
            <polygon points="100,48 105,55 100,62 95,55" fill="#facc15" stroke="#0f172a" strokeWidth="1" filter={`url(#${gradId}-glow)`} />
          </g>
        )}

        {app.archetype === 'pegasus' && (
          <g>
            {/* Equine Ears */}
            <polygon points="75,45 65,15 85,32" fill={app.primaryColor} stroke="#0f172a" strokeWidth="2" />
            <polygon points="125,45 135,15 115,32" fill={app.primaryColor} stroke="#0f172a" strokeWidth="2" />
            {/* Golden Unicorn Horn */}
            <polygon points="98,35 102,35 100,5" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" filter={`url(#${gradId}-glow)`} />
            <ellipse cx="100" cy="65" rx="32" ry="34" fill={`url(#${gradId}-body)`} stroke="#0f172a" strokeWidth="3" />
          </g>
        )}

        {app.archetype === 'leviathan' && (
          <g>
            {/* Sea Monster Side Frills */}
            <path d="M60 65 C40 50 40 80 58 75 Z" fill={app.secondaryColor} stroke="#0f172a" strokeWidth="1.5" />
            <path d="M140 65 C160 50 160 80 142 75 Z" fill={app.secondaryColor} stroke="#0f172a" strokeWidth="1.5" />
            <ellipse cx="100" cy="65" rx="36" ry="30" fill={`url(#${gradId}-body)`} stroke="#0f172a" strokeWidth="3" />
            {/* Angler Lure Node */}
            <path d="M100 40 Q100 15 120 18" stroke="#38bdf8" strokeWidth="2" fill="none" />
            <circle cx="120" cy="18" r="4" fill="#38bdf8" filter={`url(#${gradId}-glow)`} />
          </g>
        )}

        {app.archetype === 'behemoth' && (
          <g>
            {/* Armored Skull Plate & Tusks */}
            <ellipse cx="100" cy="65" rx="38" ry="32" fill={`url(#${gradId}-body)`} stroke="#0f172a" strokeWidth="3" />
            <path d="M70 82 Q55 95 62 105 Q75 95 78 82" fill="#e2e8f0" stroke="#0f172a" strokeWidth="2" />
            <path d="M130 82 Q145 95 138 105 Q125 95 122 82" fill="#e2e8f0" stroke="#0f172a" strokeWidth="2" />
          </g>
        )}

        {(app.archetype === 'turtle' || app.archetype === 'serpent' || app.archetype === 'mecha' || app.archetype === 'celestial') && (
          <ellipse cx="100" cy="65" rx="35" ry="30" fill={`url(#${gradId}-body)`} stroke="#0f172a" strokeWidth="3" />
        )}

        {/* --- FRONT-VIEW FACE & CUSTOM EYE GLOW --- */}
        {facing === 'front' ? (
          <g>
            {/* Left Eye */}
            <ellipse cx="80" cy="65" rx="7" ry="10" fill="#0f172a" />
            <circle cx="80" cy="66" r="4.5" fill={app.eyeGlowColor || app.secondaryColor} filter={`url(#${gradId}-glow)`} />
            <circle cx="78" cy="62" r="2.5" fill="#ffffff" />

            {/* Right Eye */}
            <ellipse cx="120" cy="65" rx="7" ry="10" fill="#0f172a" />
            <circle cx="120" cy="66" r="4.5" fill={app.eyeGlowColor || app.secondaryColor} filter={`url(#${gradId}-glow)`} />
            <circle cx="118" cy="62" r="2.5" fill="#ffffff" />

            {/* Cute Cheeks */}
            <circle cx="70" cy="74" r="5" fill="#fda4af" opacity="0.6" />
            <circle cx="130" cy="74" r="5" fill="#fda4af" opacity="0.6" />

            {/* Snout / Nose */}
            <polygon points="100,74 96,70 104,70" fill="#0f172a" />
            {/* Mouth */}
            <path d="M95 78 Q100 83 105 78" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" fill="none" />
          </g>
        ) : (
          /* Back-view dorsal scales */
          <g>
            <path d="M96 50 L100 42 L104 50 Z" fill={app.secondaryColor} stroke="#0f172a" strokeWidth="1.5" />
            <path d="M95 65 L100 56 L105 65 Z" fill={app.secondaryColor} stroke="#0f172a" strokeWidth="1.5" />
            <path d="M95 80 L100 71 L105 80 Z" fill={app.secondaryColor} stroke="#0f172a" strokeWidth="1.5" />
            <path d="M94 95 L100 86 L106 95 Z" fill={app.secondaryColor} stroke="#0f172a" strokeWidth="1.5" />
          </g>
        )}

        {/* --- HEAD ACCESSORIES --- */}
        {app.headAccessory === 'crown' && (
          <g filter={`url(#${gradId}-glow)`}>
            <polygon points="80,35 85,15 93,25 100,10 107,25 115,15 120,35" fill="#facc15" stroke="#ca8a04" strokeWidth="2" />
            <circle cx="100" cy="20" r="2.5" fill="#ef4444" />
            <circle cx="85" cy="24" r="2" fill="#3b82f6" />
            <circle cx="115" cy="24" r="2" fill="#3b82f6" />
          </g>
        )}

        {app.headAccessory === 'dragon_horns' && (
          <g filter={`url(#${gradId}-glow)`}>
            <path d="M68 45 C50 20 30 15 25 18 C32 30 48 45 68 45 Z" fill="#fde047" stroke="#ca8a04" strokeWidth="2" />
            <path d="M132 45 C150 20 170 15 175 18 C168 30 152 45 132 45 Z" fill="#fde047" stroke="#ca8a04" strokeWidth="2" />
            {/* Glowing gold ring on horn */}
            <ellipse cx="45" cy="28" rx="4" ry="7" fill="none" stroke="#ffffff" strokeWidth="2" />
            <ellipse cx="155" cy="28" rx="4" ry="7" fill="none" stroke="#ffffff" strokeWidth="2" />
          </g>
        )}

        {app.headAccessory === 'horns' && (
          <g>
            <path d="M68 45 C60 25 45 20 40 22 C45 35 55 45 68 45 Z" fill="#fde047" stroke="#0f172a" strokeWidth="2" />
            <path d="M132 45 C140 25 155 20 160 22 C155 35 145 45 132 45 Z" fill="#fde047" stroke="#0f172a" strokeWidth="2" />
          </g>
        )}

        {app.headAccessory === 'valkyrie_helm' && (
          <g filter={`url(#${gradId}-glow)`}>
            {/* Silver battle crown with side wings */}
            <path d="M72 45 Q100 32 128 45 L120 54 Q100 46 80 54 Z" fill="#e2e8f0" stroke="#475569" strokeWidth="2" />
            <polygon points="62,48 40,25 65,36" fill="#ffffff" stroke="#38bdf8" strokeWidth="1.5" />
            <polygon points="138,48 160,25 135,36" fill="#ffffff" stroke="#38bdf8" strokeWidth="1.5" />
            <circle cx="100" cy="42" r="3.5" fill="#38bdf8" />
          </g>
        )}

        {app.headAccessory === 'pharaoh_crown' && (
          <g filter={`url(#${gradId}-glow)`}>
            {/* Golden Nemes Crown */}
            <polygon points="75,40 60,18 100,5 140,18 125,40" fill="#facc15" stroke="#b45309" strokeWidth="2" />
            <circle cx="100" cy="18" r="4" fill="#0284c7" />
          </g>
        )}

        {app.headAccessory === 'flame_tiara' && (
          <g filter={`url(#${gradId}-glow)`}>
            <polygon points="80,40 85,22 92,30 100,12 108,30 115,22 120,40" fill="#ea580c" stroke="#facc15" strokeWidth="1.5" />
            <circle cx="100" cy="24" r="3" fill="#fde047" />
          </g>
        )}

        {app.headAccessory === 'fox_mask' && (
          <g filter={`url(#${gradId}-glow)`} transform="translate(15, -10) rotate(15 100 50)">
            <ellipse cx="100" cy="50" rx="16" ry="20" fill="#ffffff" stroke="#0f172a" strokeWidth="1.5" />
            <polygon points="90,34 85,20 96,30" fill="#ffffff" stroke="#0f172a" strokeWidth="1.5" />
            <polygon points="110,34 115,20 104,30" fill="#ffffff" stroke="#0f172a" strokeWidth="1.5" />
            <path d="M92 48 Q96 42 100 48" stroke="#ef4444" strokeWidth="2" fill="none" />
            <path d="M100 48 Q104 42 108 48" stroke="#ef4444" strokeWidth="2" fill="none" />
          </g>
        )}

        {app.headAccessory === 'cyber_headset' && (
          <g filter={`url(#${gradId}-glow)`}>
            <path d="M60 65 C60 30 140 30 140 65" stroke="#38bdf8" strokeWidth="3" fill="none" />
            <rect x="52" y="58" width="12" height="18" rx="4" fill="#0284c7" stroke="#ffffff" strokeWidth="1.5" />
            <rect x="136" y="58" width="12" height="18" rx="4" fill="#0284c7" stroke="#ffffff" strokeWidth="1.5" />
          </g>
        )}

        {app.headAccessory === 'ninja_band' && (
          <g>
            <rect x="62" y="52" width="76" height="12" rx="3" fill="#dc2626" stroke="#0f172a" strokeWidth="2" />
            <rect x="88" y="54" width="24" height="8" rx="2" fill="#e2e8f0" stroke="#475569" strokeWidth="1" />
            <path d="M138 58 Q155 60 165 72" stroke="#dc2626" strokeWidth="3" strokeLinecap="round" />
            <path d="M138 60 Q150 72 160 82" stroke="#dc2626" strokeWidth="3" strokeLinecap="round" />
          </g>
        )}

        {app.headAccessory === 'wizard_hat' && (
          <g>
            <ellipse cx="100" cy="40" rx="36" ry="10" fill="#4338ca" stroke="#312e81" strokeWidth="2" />
            <polygon points="75,38 100,-2 125,38" fill="#4f46e5" stroke="#312e81" strokeWidth="2" />
            <circle cx="100" cy="0" r="4" fill="#fde047" />
          </g>
        )}

        {app.headAccessory === 'cyber_visor' && facing === 'front' && (
          <g filter={`url(#${gradId}-glow)`}>
            <polygon points="68,60 132,60 126,72 74,72" fill="#06b6d4" stroke="#ffffff" strokeWidth="1.5" opacity="0.9" />
            <line x1="72" y1="66" x2="128" y2="66" stroke="#ffffff" strokeWidth="1.5" />
          </g>
        )}

        {app.headAccessory === 'halo' && (
          <ellipse
            cx="100"
            cy="20"
            rx="32"
            ry="10"
            fill="none"
            stroke="#facc15"
            strokeWidth="3.5"
            filter={`url(#${gradId}-glow)`}
          />
        )}

        {app.headAccessory === 'flower_wreath' && (
          <g>
            <path d="M68 45 Q100 35 132 45" stroke="#10b981" strokeWidth="3" fill="none" />
            <circle cx="75" cy="42" r="4" fill="#f43f5e" />
            <circle cx="90" cy="38" r="4" fill="#f59e0b" />
            <circle cx="105" cy="38" r="4" fill="#ec4899" />
            <circle cx="120" cy="42" r="4" fill="#38bdf8" />
          </g>
        )}
      </svg>
    </div>
  );
};

// Simple fast string hasher for deterministic IDs
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

export const PokemonPetVisual = React.memo(PokemonPetVisualComponent);
export const PetVisual = PokemonPetVisual;
