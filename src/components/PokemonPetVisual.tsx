import React from 'react';
import { PetCompanion, PetAppearance, PetArchetype } from '../types';

interface PokemonPetVisualProps {
  pet: PetCompanion;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'giant' | 'battle-front' | 'battle-back';
  facing?: 'front' | 'back';
  combatState?: 'idle' | 'attack' | 'hit' | 'special' | 'victory' | 'faint';
  overrideAppearance?: PetAppearance;
  className?: string;
  showAura?: boolean;
  showShadow?: boolean;
}

// Default appearance derivation based on pet element and name
export const getDefaultAppearance = (pet: PetCompanion): PetAppearance => {
  const nameLower = (pet.name + ' ' + (pet.description || '')).toLowerCase();
  
  let archetype: PetArchetype = 'dragon';
  if (nameLower.includes('wolf') || nameLower.includes('sói') || nameLower.includes('hound') || nameLower.includes('chó')) {
    archetype = 'wolf';
  } else if (nameLower.includes('fox') || nameLower.includes('cáo') || nameLower.includes('kitsune')) {
    archetype = 'kitsune';
  } else if (nameLower.includes('tiger') || nameLower.includes('hổ') || nameLower.includes('báo') || nameLower.includes('cat')) {
    archetype = 'tiger';
  } else if (nameLower.includes('bird') || nameLower.includes('phoenix') || nameLower.includes('phượng') || nameLower.includes('chim') || nameLower.includes('eagle')) {
    archetype = 'phoenix';
  } else if (nameLower.includes('serpent') || nameLower.includes('snake') || nameLower.includes('rắn') || nameLower.includes('leviathan')) {
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
  let auraEffect: PetAppearance['auraEffect'] = 'flames';

  switch (pet.element) {
    case 'fire':
      primaryColor = '#ef4444';
      secondaryColor = '#f97316';
      auraEffect = 'flames';
      break;
    case 'frost':
      primaryColor = '#06b6d4';
      secondaryColor = '#38bdf8';
      auraEffect = 'frost';
      break;
    case 'thunder':
      primaryColor = '#eab308';
      secondaryColor = '#facc15';
      auraEffect = 'sparks';
      break;
    case 'shadow':
    case 'void':
      primaryColor = '#7c3aed';
      secondaryColor = '#c084fc';
      auraEffect = 'void';
      break;
    case 'nature':
      primaryColor = '#10b981';
      secondaryColor = '#34d399';
      auraEffect = 'nature_leaves';
      break;
    case 'wind':
      primaryColor = '#0d9488';
      secondaryColor = '#2dd4bf';
      auraEffect = 'sparks';
      break;
    case 'gold':
    case 'divine':
      primaryColor = '#f59e0b';
      secondaryColor = '#fde047';
      auraEffect = 'starlight';
      break;
    case 'cosmic':
    default:
      primaryColor = '#8b5cf6';
      secondaryColor = '#ec4899';
      auraEffect = 'starlight';
      break;
  }

  const isHighTier = (pet.tierRank || 1) >= 10 || (pet.enchantmentLevel || 0) >= 4;

  return {
    archetype,
    primaryColor,
    secondaryColor,
    pattern: isHighTier ? 'runes' : 'none',
    headAccessory: isHighTier ? 'crown' : (pet.enchantmentLevel && pet.enchantmentLevel >= 2 ? 'horns' : 'none'),
    backWing: isHighTier ? 'dragon_wings' : (pet.enchantmentLevel && pet.enchantmentLevel >= 3 ? 'angel_feathers' : 'none'),
    auraEffect: isHighTier ? auraEffect : 'none',
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
}) => {
  const app = overrideAppearance || pet.appearance || getDefaultAppearance(pet);
  const gradId = `pet-art-${pet.id || 'preview'}-${facing}`;

  // Dimensions
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
  if (combatState === 'attack') animClass = facing === 'back' ? 'animate-lunge-back' : 'animate-lunge-front';
  else if (combatState === 'hit') animClass = 'animate-hit-shake';
  else if (combatState === 'special') animClass = 'animate-cast-glow';
  else if (combatState === 'victory') animClass = 'animate-bounce';
  else if (combatState === 'faint') animClass = 'opacity-40 translate-y-6 grayscale transition-all duration-700';

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${animClass} ${className}`}
      style={{ width: boxPx, height: boxPx }}
    >
      {/* 1. Ground Shadow (Pokemon Platform Style) */}
      {showShadow && (
        <div
          className="absolute bottom-1 w-[70%] h-3 bg-black/40 rounded-full blur-sm pointer-events-none -z-20"
          style={{ transform: 'scaleY(0.5)' }}
        />
      )}

      {/* 2. Elemental Ambient Aura */}
      {showAura && app.auraEffect && app.auraEffect !== 'none' && (
        <div
          className="absolute inset-0 rounded-full pointer-events-none -z-10 animate-pulse"
          style={{
            background: `radial-gradient(circle, ${app.secondaryColor}40 0%, ${app.primaryColor}20 50%, transparent 75%)`,
            transform: 'scale(1.35)',
            filter: 'blur(8px)',
          }}
        />
      )}

      {/* 3. Orbiting Elemental Sparks or Particles */}
      {showAura && app.auraEffect === 'sparks' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10 animate-spin" style={{ animationDuration: '6s' }}>
          <div className="absolute -top-1 w-2.5 h-2.5 rounded-full bg-amber-300 shadow-[0_0_8px_#facc15] animate-ping" />
          <div className="absolute -bottom-1 w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_8px_#38bdf8]" />
        </div>
      )}

      {showAura && app.auraEffect === 'flames' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
          <div className="absolute -top-3 w-3 h-3 rounded-full bg-rose-500 blur-[1px] animate-bounce" />
          <div className="absolute -top-1 right-2 w-2 h-2 rounded-full bg-amber-400 blur-[1px] animate-pulse" />
        </div>
      )}

      {showAura && app.auraEffect === 'frost' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
          <div className="absolute -top-2 left-2 text-[10px] animate-spin" style={{ animationDuration: '10s' }}>❄️</div>
          <div className="absolute -bottom-1 right-1 text-[10px] animate-pulse">✨</div>
        </div>
      )}

      {/* 4. MAIN SVG PET CREATURE GRAPHIC */}
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

          <filter id={`${gradId}-glow`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* --- BACK WINGS LAYER (BEHIND BODY) --- */}
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

        {app.backWing === 'angel_feathers' && (
          <g className="animate-wing-flap">
            {/* Left Angel Wing */}
            <path
              d="M95 100 C60 40 25 35 15 65 C10 85 45 115 95 110 Z"
              fill="#ffffff"
              stroke={app.secondaryColor}
              strokeWidth="2"
            />
            <path d="M45 60 C35 75 40 95 65 105" stroke={app.primaryColor} strokeWidth="1.5" />
            {/* Right Angel Wing */}
            <path
              d="M105 100 C140 40 175 35 185 65 C190 85 155 115 105 110 Z"
              fill="#ffffff"
              stroke={app.secondaryColor}
              strokeWidth="2"
            />
            <path d="M155 60 C165 75 160 95 135 105" stroke={app.primaryColor} strokeWidth="1.5" />
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
          <path
            d="M130 145 C165 145 185 120 180 95 C175 75 160 85 165 100 C170 115 150 130 120 138 Z"
            fill={`url(#${gradId}-body)`}
            stroke="#0f172a"
            strokeWidth="2"
          />
        ) : (
          /* Back view: Tail prominently centered extending upward/sideways */
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

        {/* Body Pattern (Stripes, Scales, Runes, Stars) */}
        {app.pattern === 'stripes' && (
          <g stroke="#0f172a" strokeWidth="2.5" opacity="0.6">
            <path d="M68 120 L85 125" />
            <path d="M66 135 L88 138" />
            <path d="M132 120 L115 125" />
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

        {app.pattern === 'scales' && (
          <g fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.4">
            <path d="M90 125 C95 130 105 130 110 125" />
            <path d="M85 135 C92 142 108 142 115 135" />
          </g>
        )}

        {/* --- HEAD BASE --- */}
        {app.archetype === 'dragon' && (
          <path
            d="M60 70 C50 45 75 35 100 40 C125 35 150 45 140 70 C145 95 125 105 100 105 C75 105 55 95 60 70 Z"
            fill={`url(#${gradId}-body)`}
            stroke="#0f172a"
            strokeWidth="3"
          />
        )}

        {app.archetype === 'wolf' && (
          <g>
            {/* Wolf Ears */}
            <polygon points="65,55 45,20 75,35" fill={app.primaryColor} stroke="#0f172a" strokeWidth="2.5" />
            <polygon points="135,55 155,20 125,35" fill={app.primaryColor} stroke="#0f172a" strokeWidth="2.5" />
            {/* Inner Ears */}
            <polygon points="63,50 50,26 71,37" fill="#fda4af" />
            <polygon points="137,50 150,26 129,37" fill="#fda4af" />
            {/* Wolf Head */}
            <path
              d="M65 65 C55 45 75 40 100 42 C125 40 145 45 135 65 C145 85 125 100 100 102 C75 100 55 85 65 65 Z"
              fill={`url(#${gradId}-body)`}
              stroke="#0f172a"
              strokeWidth="3"
            />
          </g>
        )}

        {app.archetype === 'phoenix' && (
          <g>
            {/* Bird Crest Feathers */}
            <path d="M100 35 C95 15 80 10 75 15 C85 25 90 30 100 35 Z" fill={app.secondaryColor} stroke="#0f172a" strokeWidth="2" />
            <path d="M100 35 C105 10 115 5 120 12 C115 22 108 30 100 35 Z" fill="#fde047" stroke="#0f172a" strokeWidth="2" />
            {/* Head */}
            <circle cx="100" cy="65" r="32" fill={`url(#${gradId}-body)`} stroke="#0f172a" strokeWidth="3" />
          </g>
        )}

        {app.archetype === 'tiger' && (
          <g>
            {/* Rounded Tiger Ears */}
            <circle cx="65" cy="40" r="14" fill={app.primaryColor} stroke="#0f172a" strokeWidth="2.5" />
            <circle cx="65" cy="40" r="7" fill="#ffffff" />
            <circle cx="135" cy="40" r="14" fill={app.primaryColor} stroke="#0f172a" strokeWidth="2.5" />
            <circle cx="135" cy="40" r="7" fill="#ffffff" />
            {/* Tiger Face */}
            <ellipse cx="100" cy="70" rx="38" ry="32" fill={`url(#${gradId}-body)`} stroke="#0f172a" strokeWidth="3" />
          </g>
        )}

        {app.archetype === 'kitsune' && (
          <g>
            {/* Big Fox Ears */}
            <polygon points="65,55 40,15 80,35" fill={app.primaryColor} stroke="#0f172a" strokeWidth="2.5" />
            <polygon points="135,55 160,15 120,35" fill={app.primaryColor} stroke="#0f172a" strokeWidth="2.5" />
            <polygon points="63,50 46,22 75,37" fill="#ffffff" />
            <polygon points="137,50 154,22 125,37" fill="#ffffff" />
            {/* Fox Mask Head */}
            <path
              d="M60 65 C55 45 75 40 100 42 C125 40 145 45 140 65 C145 90 125 105 100 105 C75 105 55 90 60 65 Z"
              fill={`url(#${gradId}-body)`}
              stroke="#0f172a"
              strokeWidth="3"
            />
            {/* Forehead Jewel */}
            <polygon points="100,48 105,55 100,62 95,55" fill="#facc15" stroke="#0f172a" strokeWidth="1" filter={`url(#${gradId}-glow)`} />
          </g>
        )}

        {(app.archetype === 'turtle' || app.archetype === 'serpent' || app.archetype === 'mecha' || app.archetype === 'celestial') && (
          <ellipse cx="100" cy="65" rx="35" ry="30" fill={`url(#${gradId}-body)`} stroke="#0f172a" strokeWidth="3" />
        )}

        {/* --- FRONT-VIEW FACE (EYES, SNOUT, MOUTH) --- */}
        {facing === 'front' ? (
          <g>
            {/* Left Eye */}
            <ellipse cx="80" cy="65" rx="7" ry="10" fill="#0f172a" />
            <circle cx="78" cy="62" r="3" fill="#ffffff" />
            <circle cx="82" cy="68" r="1.5" fill={app.secondaryColor} />

            {/* Right Eye */}
            <ellipse cx="120" cy="65" rx="7" ry="10" fill="#0f172a" />
            <circle cx="118" cy="62" r="3" fill="#ffffff" />
            <circle cx="122" cy="68" r="1.5" fill={app.secondaryColor} />

            {/* Cute Cheeks */}
            <circle cx="70" cy="74" r="5" fill="#fda4af" opacity="0.6" />
            <circle cx="130" cy="74" r="5" fill="#fda4af" opacity="0.6" />

            {/* Snout / Nose */}
            <polygon points="100,74 96,70 104,70" fill="#0f172a" />
            {/* Mouth */}
            <path d="M95 78 Q100 83 105 78" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" fill="none" />
          </g>
        ) : (
          /* BACK-VIEW HEAD DETAILS (Classic Pokemon Trainer perspective) */
          <g>
            {/* Back neck ridges or dorsal scales */}
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

        {app.headAccessory === 'horns' && (
          <g>
            <path d="M68 45 C60 25 45 20 40 22 C45 35 55 45 68 45 Z" fill="#fde047" stroke="#0f172a" strokeWidth="2" />
            <path d="M132 45 C140 25 155 20 160 22 C155 35 145 45 132 45 Z" fill="#fde047" stroke="#0f172a" strokeWidth="2" />
          </g>
        )}

        {app.headAccessory === 'ninja_band' && (
          <g>
            <rect x="62" y="52" width="76" height="12" rx="3" fill="#dc2626" stroke="#0f172a" strokeWidth="2" />
            <rect x="88" y="54" width="24" height="8" rx="2" fill="#e2e8f0" stroke="#475569" strokeWidth="1" />
            {/* Trailing band ribbons */}
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

export const PokemonPetVisual = React.memo(PokemonPetVisualComponent);
export const PetVisual = PokemonPetVisual;

