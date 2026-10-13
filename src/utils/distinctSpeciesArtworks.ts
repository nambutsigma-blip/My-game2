// 18 High-Definition Photographic CGI Artworks
import wolfImg from '../assets/images/fantasy_wolf_pet_1790256249406.jpg';
import tigerImg from '../assets/images/royal_tiger_beast_1790256266034.jpg';
import kitsuneImg from '../assets/images/nine_tailed_fox_pet_1790255355171.jpg';
import eagleImg from '../assets/images/celestial_eagle_pet_1790256280158.jpg';
import unicornImg from '../assets/images/holy_unicorn_deer_1790256325994.jpg';
import turtleImg from '../assets/images/mystic_turtle_beast_1790255473611.jpg';
import bearImg from '../assets/images/armored_bear_pet_1790256342471.jpg';
import megalodonImg from '../assets/images/megalodon_beast_1790256309474.jpg';
import leviathanImg from '../assets/images/leviathan_serpent_art_1790255419184.jpg';
import dinosaurImg from '../assets/images/apex_dinosaur_pet_1790256293107.jpg';
import phoenixImg from '../assets/images/flame_phoenix_pet_1790255341848.jpg';
import dragonImg from '../assets/images/divine_dragon_pet_1790255326523.jpg';
import pegasusImg from '../assets/images/celestial_pegasus_art_1790255404000.jpg';
import crystalGolemImg from '../assets/images/crystal_titan_golem_1790255389852.jpg';
import voidDemonImg from '../assets/images/abyss_void_demon_1790255375556.jpg';
import mechaImg from '../assets/images/cyber_mecha_beast_1790255435624.jpg';
import celestialGodImg from '../assets/images/golden_celestial_god_1790255452779.jpg';
import voidOverlordImg from '../assets/images/void_overlord_god_1790256356064.jpg';

// Helper to encode SVG into valid Data URI
function svgUri(svgString: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString.trim())}`;
}

// 1. Desert Sand Cat (pet-cat-common)
const sandCatSvg = svgUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#451a03"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </radialGradient>
    <linearGradient id="fur" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fde68a"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>
  </defs>
  <circle cx="128" cy="128" r="128" fill="url(#bg)"/>
  <!-- Dune silhouette -->
  <path d="M0 200 Q80 160 160 210 Q220 180 256 220 L256 256 L0 256 Z" fill="#b45309" opacity="0.4"/>
  <!-- Cat Ears -->
  <polygon points="50,90 20,20 95,55" fill="#d97706" stroke="#78350f" stroke-width="3"/>
  <polygon points="50,85 30,30 85,60" fill="#fbcfe8"/>
  <polygon points="206,90 236,20 161,55" fill="#d97706" stroke="#78350f" stroke-width="3"/>
  <polygon points="206,85 226,30 171,60" fill="#fbcfe8"/>
  <!-- Body & Paws -->
  <ellipse cx="128" cy="180" rx="65" ry="55" fill="url(#fur)" stroke="#78350f" stroke-width="4"/>
  <ellipse cx="95" cy="220" rx="22" ry="16" fill="#fef3c7" stroke="#78350f" stroke-width="3"/>
  <ellipse cx="161" cy="220" rx="22" ry="16" fill="#fef3c7" stroke="#78350f" stroke-width="3"/>
  <!-- Head -->
  <circle cx="128" cy="115" r="58" fill="url(#fur)" stroke="#78350f" stroke-width="4"/>
  <!-- Cheeks Fluff -->
  <polygon points="70,120 50,135 72,145" fill="#fde68a"/>
  <polygon points="186,120 206,135 184,145" fill="#fde68a"/>
  <!-- Forehead sand markings -->
  <path d="M128 75 L128 95 M118 78 L122 92 M138 78 L134 92" stroke="#92400e" stroke-width="3" stroke-linecap="round"/>
  <!-- Big Amber Eyes -->
  <ellipse cx="102" cy="110" rx="14" ry="18" fill="#fbbf24" stroke="#78350f" stroke-width="2"/>
  <ellipse cx="102" cy="110" rx="6" ry="15" fill="#0f172a"/>
  <circle cx="98" cy="104" r="4" fill="#ffffff"/>
  <ellipse cx="154" cy="110" rx="14" ry="18" fill="#fbbf24" stroke="#78350f" stroke-width="2"/>
  <ellipse cx="154" cy="110" rx="6" ry="15" fill="#0f172a"/>
  <circle cx="150" cy="104" r="4" fill="#ffffff"/>
  <!-- Nose & Mouth -->
  <polygon points="128,126 122,120 134,120" fill="#f43f5e"/>
  <path d="M128 126 L128 134 C124 138 116 138 114 134 M128 134 C132 138 140 138 142 134" stroke="#78350f" stroke-width="2.5" fill="none"/>
  <!-- Whiskers -->
  <path d="M85 130 L45 125 M85 135 L45 138 M85 140 L48 150" stroke="#fef08a" stroke-width="2" stroke-linecap="round"/>
  <path d="M171 130 L211 125 M171 135 L211 138 M171 140 L208 150" stroke="#fef08a" stroke-width="2" stroke-linecap="round"/>
</svg>`);

// 2. Barn Owl (pet-owl-common)
const barnOwlSvg = svgUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#1e1b4b"/>
      <stop offset="100%" stop-color="#020617"/>
    </radialGradient>
  </defs>
  <circle cx="128" cy="128" r="128" fill="url(#bg)"/>
  <!-- Moon -->
  <circle cx="200" cy="50" r="30" fill="#fef08a" opacity="0.3"/>
  <!-- Body -->
  <ellipse cx="128" cy="170" rx="55" ry="65" fill="#9a3412" stroke="#431407" stroke-width="4"/>
  <!-- Chest Feathers with Speckles -->
  <path d="M90 140 C90 220 166 220 166 140 C166 120 90 120 90 140 Z" fill="#fef3c7" stroke="#431407" stroke-width="2"/>
  <circle cx="115" cy="165" r="2" fill="#78350f"/>
  <circle cx="140" cy="170" r="2" fill="#78350f"/>
  <circle cx="128" cy="185" r="2" fill="#78350f"/>
  <!-- Wings -->
  <path d="M75 140 Q40 180 60 215 Q80 190 85 150 Z" fill="#78350f" stroke="#431407" stroke-width="2"/>
  <path d="M181 140 Q216 180 196 215 Q176 190 171 150 Z" fill="#78350f" stroke="#431407" stroke-width="2"/>
  <!-- Heart-Shaped Face Disc -->
  <path d="M128 85 C100 50 60 70 70 105 C78 135 128 150 128 150 C128 150 178 135 186 105 C196 70 156 50 128 85 Z" fill="#ffffff" stroke="#d97706" stroke-width="4"/>
  <!-- Deep Owl Eyes -->
  <circle cx="102" cy="100" r="14" fill="#0f172a" stroke="#d97706" stroke-width="2"/>
  <circle cx="102" cy="100" r="11" fill="#f59e0b"/>
  <circle cx="102" cy="100" r="6" fill="#000000"/>
  <circle cx="99" cy="97" r="3" fill="#ffffff"/>
  <circle cx="154" cy="100" r="14" fill="#0f172a" stroke="#d97706" stroke-width="2"/>
  <circle cx="154" cy="100" r="11" fill="#f59e0b"/>
  <circle cx="154" cy="100" r="6" fill="#000000"/>
  <circle cx="151" cy="97" r="3" fill="#ffffff"/>
  <!-- Sharp Hooked Beak -->
  <path d="M128 102 Q124 125 128 132 Q132 125 128 102 Z" fill="#f59e0b" stroke="#78350f" stroke-width="1.5"/>
  <!-- Perch Branch & Talons -->
  <path d="M30 235 Q128 220 226 235" stroke="#78350f" stroke-width="10" stroke-linecap="round"/>
  <circle cx="110" cy="226" r="6" fill="#f59e0b"/>
  <circle cx="120" cy="226" r="6" fill="#f59e0b"/>
  <circle cx="136" cy="226" r="6" fill="#f59e0b"/>
  <circle cx="146" cy="226" r="6" fill="#f59e0b"/>
</svg>`);

// 3. Arctic Snow Hare (pet-hare-common)
const snowHareSvg = svgUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#0c4a6e"/>
      <stop offset="100%" stop-color="#020617"/>
    </radialGradient>
  </defs>
  <circle cx="128" cy="128" r="128" fill="url(#bg)"/>
  <!-- Snow Flakes -->
  <circle cx="40" cy="60" r="2" fill="#e0f2fe"/><circle cx="220" cy="90" r="3" fill="#e0f2fe"/><circle cx="180" cy="30" r="2" fill="#e0f2fe"/>
  <!-- Giant Long Ears -->
  <ellipse cx="90" cy="60" rx="16" ry="55" transform="rotate(-15 90 60)" fill="#ffffff" stroke="#94a3b8" stroke-width="3"/>
  <ellipse cx="90" cy="60" rx="8" ry="42" transform="rotate(-15 90 60)" fill="#fbcfe8"/>
  <ellipse cx="166" cy="60" rx="16" ry="55" transform="rotate(15 166 60)" fill="#ffffff" stroke="#94a3b8" stroke-width="3"/>
  <ellipse cx="166" cy="60" rx="8" ry="42" transform="rotate(15 166 60)" fill="#fbcfe8"/>
  <!-- Fluffy Body -->
  <circle cx="128" cy="180" r="60" fill="#f8fafc" stroke="#94a3b8" stroke-width="4"/>
  <!-- Fluffy Paws -->
  <ellipse cx="85" cy="220" rx="20" ry="14" fill="#ffffff" stroke="#94a3b8" stroke-width="2.5"/>
  <ellipse cx="171" cy="220" rx="20" ry="14" fill="#ffffff" stroke="#94a3b8" stroke-width="2.5"/>
  <!-- Round Head -->
  <circle cx="128" cy="125" r="48" fill="#ffffff" stroke="#94a3b8" stroke-width="4"/>
  <!-- Frost Blue Big Eyes -->
  <circle cx="106" cy="120" r="12" fill="#38bdf8" stroke="#0284c7" stroke-width="2"/>
  <circle cx="106" cy="120" r="7" fill="#0f172a"/>
  <circle cx="103" cy="116" r="3.5" fill="#ffffff"/>
  <circle cx="150" cy="120" r="12" fill="#38bdf8" stroke="#0284c7" stroke-width="2"/>
  <circle cx="150" cy="120" r="7" fill="#0f172a"/>
  <circle cx="147" cy="116" r="3.5" fill="#ffffff"/>
  <!-- Pink Nose & Twitching Mouth -->
  <polygon points="128,135 123,130 133,130" fill="#f472b6"/>
  <path d="M128 135 L128 142 C125 146 118 146 116 142 M128 142 C131 146 138 146 140 142" stroke="#64748b" stroke-width="2" fill="none"/>
  <!-- Ice Whiskers -->
  <path d="M85 138 L40 135 M85 142 L42 146" stroke="#bae6fd" stroke-width="2" stroke-linecap="round"/>
  <path d="M171 138 L216 135 M171 142 L214 146" stroke="#bae6fd" stroke-width="2" stroke-linecap="round"/>
</svg>`);

// 4. Sika Forest Deer (pet-deer-uncommon)
const forestDeerSvg = svgUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#064e3b"/>
      <stop offset="100%" stop-color="#022c22"/>
    </radialGradient>
  </defs>
  <circle cx="128" cy="128" r="128" fill="url(#bg)"/>
  <!-- Branching Golden Antlers -->
  <path d="M100 70 Q70 40 45 35 M65 40 Q55 20 60 10 M55 35 Q40 25 35 30" stroke="#facc15" stroke-width="6" stroke-linecap="round" fill="none"/>
  <path d="M156 70 Q186 40 211 35 M191 40 Q201 20 196 10 M201 35 Q216 25 221 30" stroke="#facc15" stroke-width="6" stroke-linecap="round" fill="none"/>
  <!-- Deer Ears -->
  <ellipse cx="75" cy="90" rx="14" ry="32" transform="rotate(-35 75 90)" fill="#b45309" stroke="#78350f" stroke-width="2"/>
  <ellipse cx="75" cy="90" rx="7" ry="22" transform="rotate(-35 75 90)" fill="#fef3c7"/>
  <ellipse cx="181" cy="90" rx="14" ry="32" transform="rotate(35 181 90)" fill="#b45309" stroke="#78350f" stroke-width="2"/>
  <ellipse cx="181" cy="90" rx="7" ry="22" transform="rotate(35 181 90)" fill="#fef3c7"/>
  <!-- Deer Body with Dapples -->
  <ellipse cx="128" cy="190" rx="60" ry="50" fill="#b45309" stroke="#78350f" stroke-width="3"/>
  <circle cx="110" cy="180" r="4" fill="#ffffff" opacity="0.8"/>
  <circle cx="146" cy="185" r="4" fill="#ffffff" opacity="0.8"/>
  <circle cx="128" cy="200" r="3.5" fill="#ffffff" opacity="0.8"/>
  <!-- Slender Neck & Head -->
  <path d="M110 160 L115 110 L141 110 L146 160 Z" fill="#d97706"/>
  <ellipse cx="128" cy="105" rx="36" ry="42" fill="#d97706" stroke="#78350f" stroke-width="3"/>
  <!-- Gentle Doe Eyes -->
  <ellipse cx="106" cy="100" rx="10" ry="14" fill="#0f172a"/>
  <circle cx="103" cy="96" r="4" fill="#ffffff"/>
  <ellipse cx="150" cy="100" rx="10" ry="14" fill="#0f172a"/>
  <circle cx="147" cy="96" r="4" fill="#ffffff"/>
  <!-- Muzzle -->
  <ellipse cx="128" cy="130" rx="20" ry="15" fill="#fef3c7"/>
  <ellipse cx="128" cy="126" rx="8" ry="5" fill="#0f172a"/>
</svg>`);

// 5. Snow Leopard (pet-leopard-rare)
const snowLeopardSvg = svgUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#020617"/>
    </radialGradient>
  </defs>
  <circle cx="128" cy="128" r="128" fill="url(#bg)"/>
  <!-- Rounded Leopard Ears -->
  <circle cx="75" cy="65" r="22" fill="#cbd5e1" stroke="#334155" stroke-width="3"/>
  <circle cx="75" cy="65" r="12" fill="#0f172a"/>
  <circle cx="181" cy="65" r="22" fill="#cbd5e1" stroke="#334155" stroke-width="3"/>
  <circle cx="181" cy="65" r="12" fill="#0f172a"/>
  <!-- Muscular Body -->
  <ellipse cx="128" cy="180" rx="65" ry="55" fill="#e2e8f0" stroke="#334155" stroke-width="4"/>
  <!-- Leopard Rosettes -->
  <path d="M100 160 C95 155 90 165 95 170 C100 175 105 165 100 160" stroke="#334155" stroke-width="4" fill="none"/>
  <path d="M150 165 C145 160 140 170 145 175 C150 180 155 170 150 165" stroke="#334155" stroke-width="4" fill="none"/>
  <path d="M125 190 C120 185 115 195 120 200 C125 205 130 195 125 190" stroke="#334155" stroke-width="4" fill="none"/>
  <!-- Broad Feline Head -->
  <ellipse cx="128" cy="110" rx="55" ry="46" fill="#f1f5f9" stroke="#334155" stroke-width="4"/>
  <!-- Rosettes on Brow -->
  <circle cx="128" cy="80" r="3" fill="#334155"/><circle cx="118" cy="74" r="2.5" fill="#334155"/><circle cx="138" cy="74" r="2.5" fill="#334155"/>
  <!-- Piercing Ice Turquoise Eyes -->
  <ellipse cx="102" cy="106" rx="14" ry="16" fill="#2dd4bf" stroke="#0f172a" stroke-width="2.5"/>
  <ellipse cx="102" cy="106" rx="5" ry="14" fill="#0f172a"/>
  <circle cx="98" cy="100" r="3.5" fill="#ffffff"/>
  <ellipse cx="154" cy="106" rx="14" ry="16" fill="#2dd4bf" stroke="#0f172a" stroke-width="2.5"/>
  <ellipse cx="154" cy="106" rx="5" ry="14" fill="#0f172a"/>
  <circle cx="150" cy="100" r="3.5" fill="#ffffff"/>
  <!-- Leopard Muzzle -->
  <ellipse cx="128" cy="130" rx="22" ry="16" fill="#ffffff" stroke="#334155" stroke-width="2"/>
  <polygon points="128,124 120,118 136,118" fill="#fda4af"/>
  <path d="M128 124 L128 133 C122 136 112 136 110 133 M128 133 C134 136 144 136 146 133" stroke="#334155" stroke-width="2.5" fill="none"/>
</svg>`);

// 6. Killer Whale / Orca (pet-orca-rare)
const orcaSvg = svgUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#0284c7"/>
      <stop offset="100%" stop-color="#020617"/>
    </radialGradient>
  </defs>
  <circle cx="128" cy="128" r="128" fill="url(#bg)"/>
  <!-- Ocean Swirl -->
  <path d="M0 220 Q60 190 128 220 Q196 250 256 210 L256 256 L0 256 Z" fill="#38bdf8" opacity="0.3"/>
  <!-- Tall Dorsal Fin -->
  <polygon points="128,110 115,20 155,95" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
  <!-- Orca Body -->
  <path d="M40 160 C50 100 130 95 200 120 C230 135 240 160 210 185 C160 210 80 210 40 160 Z" fill="#0f172a" stroke="#1e293b" stroke-width="4"/>
  <!-- White Belly Patch -->
  <path d="M70 170 C100 160 160 165 190 185 C160 205 90 205 70 170 Z" fill="#ffffff"/>
  <!-- White Oval Eye Patch -->
  <ellipse cx="175" cy="132" rx="18" ry="10" transform="rotate(-15 175 132)" fill="#ffffff"/>
  <!-- Whale Eye -->
  <circle cx="195" cy="145" r="4.5" fill="#ffffff"/>
  <circle cx="195" cy="145" r="3" fill="#0f172a"/>
  <!-- Pectoral Fin -->
  <ellipse cx="120" cy="175" rx="30" ry="14" transform="rotate(35 120 175)" fill="#0f172a" stroke="#38bdf8" stroke-width="1.5"/>
</svg>`);

// 7. Peregrine Falcon (pet-falcon-rare)
const falconSvg = svgUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#0369a1"/>
      <stop offset="100%" stop-color="#082f49"/>
    </radialGradient>
  </defs>
  <circle cx="128" cy="128" r="128" fill="url(#bg)"/>
  <!-- Swept Back Speed Wings -->
  <path d="M128 120 L20 40 L60 130 Z" fill="#334155" stroke="#0f172a" stroke-width="3"/>
  <path d="M128 120 L236 40 L196 130 Z" fill="#334155" stroke="#0f172a" stroke-width="3"/>
  <!-- Falcon Body with Barred Feathers -->
  <ellipse cx="128" cy="165" rx="42" ry="55" fill="#f8fafc" stroke="#0f172a" stroke-width="3"/>
  <path d="M100 160 L156 160 M105 175 L151 175 M112 190 L144 190" stroke="#475569" stroke-width="2.5" stroke-linecap="round"/>
  <!-- Falcon Head with Dark Hood -->
  <ellipse cx="128" cy="100" rx="35" ry="32" fill="#1e293b" stroke="#0f172a" stroke-width="3"/>
  <!-- White Cheek & Black Mustache Stripe -->
  <polygon points="105,100 95,125 110,120" fill="#ffffff"/>
  <polygon points="151,100 161,125 146,120" fill="#ffffff"/>
  <path d="M112 105 L116 128 M144 105 L140 128" stroke="#0f172a" stroke-width="5" stroke-linecap="round"/>
  <!-- Fierce Eyes with Yellow Ring -->
  <circle cx="112" cy="96" r="9" fill="#facc15"/><circle cx="112" cy="96" r="5" fill="#000000"/><circle cx="110" cy="94" r="2" fill="#ffffff"/>
  <circle cx="144" cy="96" r="9" fill="#facc15"/><circle cx="144" cy="96" r="5" fill="#000000"/><circle cx="142" cy="94" r="2" fill="#ffffff"/>
  <!-- Hooked Beak with Yellow Cere -->
  <ellipse cx="128" cy="98" rx="8" ry="5" fill="#facc15"/>
  <path d="M124 102 Q128 122 134 116 Q128 108 124 102" fill="#0f172a"/>
</svg>`);

// 8. Colossal Blue Whale (pet-whale-epic)
const blueWhaleSvg = svgUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#1e3a8a"/>
      <stop offset="100%" stop-color="#020617"/>
    </radialGradient>
  </defs>
  <circle cx="128" cy="128" r="128" fill="url(#bg)"/>
  <!-- Water Spout -->
  <path d="M170 85 Q175 40 160 30 M170 85 Q185 45 195 35" stroke="#bae6fd" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  <!-- Massive Whale Silhouette -->
  <path d="M30 145 C60 110 150 90 220 120 C240 130 235 160 200 175 C140 200 60 185 30 145 Z" fill="#2563eb" stroke="#1d4ed8" stroke-width="4"/>
  <!-- Throat Pleats (Baleen Grooves) -->
  <path d="M130 145 Q170 155 210 150 M120 155 Q160 165 200 160 M110 165 Q150 175 190 170" stroke="#93c5fd" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <!-- Tail Flukes in Distance -->
  <path d="M30 145 L5 125 L18 145 L5 165 Z" fill="#1d4ed8"/>
  <!-- Gentle Whale Eye -->
  <circle cx="195" cy="130" r="5" fill="#0f172a" stroke="#60a5fa" stroke-width="1.5"/>
  <circle cx="194" cy="128" r="1.5" fill="#ffffff"/>
</svg>`);

// 9. Royal King Cobra (pet-cobra-epic)
const kingCobraSvg = svgUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#701a75"/>
      <stop offset="100%" stop-color="#020617"/>
    </radialGradient>
  </defs>
  <circle cx="128" cy="128" r="128" fill="url(#bg)"/>
  <!-- Coiled Snake Body -->
  <ellipse cx="128" cy="205" rx="75" ry="30" fill="#4d7c0f" stroke="#14532d" stroke-width="4"/>
  <ellipse cx="128" cy="195" rx="55" ry="22" fill="#3f6212" stroke="#14532d" stroke-width="3"/>
  <!-- Flared Royal Hood -->
  <path d="M128 75 C60 85 45 140 85 165 L171 165 C211 140 196 85 128 75 Z" fill="#65a30d" stroke="#14532d" stroke-width="4"/>
  <!-- Golden Hood Chevron Markings -->
  <path d="M100 115 Q128 135 156 115 M105 130 Q128 150 151 130" stroke="#facc15" stroke-width="4" fill="none" stroke-linecap="round"/>
  <!-- Serpent Head -->
  <ellipse cx="128" cy="85" rx="25" ry="22" fill="#4d7c0f" stroke="#14532d" stroke-width="3"/>
  <!-- Menacing Slit Eyes -->
  <ellipse cx="115" cy="80" rx="6" ry="7" fill="#facc15"/><line x1="115" y1="74" x2="115" y2="86" stroke="#000000" stroke-width="2.5"/>
  <ellipse cx="141" cy="80" rx="6" ry="7" fill="#facc15"/><line x1="141" y1="74" x2="141" y2="86" stroke="#000000" stroke-width="2.5"/>
  <!-- Flickering Forked Tongue -->
  <path d="M128 105 L128 125 L120 135 M128 125 L136 135" stroke="#ef4444" stroke-width="2.5" fill="none" stroke-linecap="round"/>
</svg>`);

// 10. Ancient War Elephant (pet-elephant-epic)
const warElephantSvg = svgUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#854d0e"/>
      <stop offset="100%" stop-color="#020617"/>
    </radialGradient>
  </defs>
  <circle cx="128" cy="128" r="128" fill="url(#bg)"/>
  <!-- Massive Elephant Ears -->
  <ellipse cx="65" cy="115" rx="35" ry="50" fill="#64748b" stroke="#334155" stroke-width="3"/>
  <ellipse cx="191" cy="115" rx="35" ry="50" fill="#64748b" stroke="#334155" stroke-width="3"/>
  <!-- Elephant Body -->
  <ellipse cx="128" cy="175" rx="65" ry="55" fill="#475569" stroke="#1e293b" stroke-width="4"/>
  <!-- Grand Head -->
  <circle cx="128" cy="110" r="48" fill="#64748b" stroke="#334155" stroke-width="3"/>
  <!-- Ornate Golden Battle Headpiece -->
  <polygon points="128,70 100,95 156,95" fill="#facc15" stroke="#ca8a04" stroke-width="2"/>
  <circle cx="128" cy="88" r="5" fill="#ef4444"/>
  <!-- Curved Ivory Tusks -->
  <path d="M105 135 Q75 160 55 130" stroke="#fef08a" stroke-width="7" fill="none" stroke-linecap="round"/>
  <path d="M151 135 Q181 160 201 130" stroke="#fef08a" stroke-width="7" fill="none" stroke-linecap="round"/>
  <!-- Curled Trunk -->
  <path d="M128 125 Q128 190 145 185 Q155 180 145 170" stroke="#64748b" stroke-width="16" fill="none" stroke-linecap="round"/>
  <!-- Eyes -->
  <circle cx="106" cy="105" r="4" fill="#0f172a"/><circle cx="150" cy="105" r="4" fill="#0f172a"/>
</svg>`);

// 11. Woolly Mammoth (pet-mammoth-legendary)
const mammothSvg = svgUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#451a03"/>
      <stop offset="100%" stop-color="#020617"/>
    </radialGradient>
  </defs>
  <circle cx="128" cy="128" r="128" fill="url(#bg)"/>
  <!-- Mammoth Giant Curved Tusks -->
  <path d="M100 135 Q50 190 35 120" stroke="#fef9c3" stroke-width="10" fill="none" stroke-linecap="round"/>
  <path d="M156 135 Q206 190 221 120" stroke="#fef9c3" stroke-width="10" fill="none" stroke-linecap="round"/>
  <!-- Shaggy Mammoth Body -->
  <ellipse cx="128" cy="170" rx="68" ry="58" fill="#78350f" stroke="#451a03" stroke-width="4"/>
  <!-- Shaggy Fur Fringe -->
  <path d="M65 190 L75 210 L85 190 L95 210 L105 190 L115 210 L125 190 L135 210 L145 190 L155 210 L165 190 L175 210 L185 190" stroke="#451a03" stroke-width="4" fill="none"/>
  <!-- Domed Head & Trunk -->
  <circle cx="128" cy="105" r="45" fill="#92400e" stroke="#451a03" stroke-width="3"/>
  <path d="M128 120 Q128 185 110 180 Q100 175 110 165" stroke="#78350f" stroke-width="14" fill="none" stroke-linecap="round"/>
  <!-- Eyes -->
  <circle cx="112" cy="100" r="4" fill="#000000"/><circle cx="144" cy="100" r="4" fill="#000000"/>
</svg>`);

// 12. Saber-Toothed Smilodon (pet-smilodon-legendary)
const smilodonSvg = svgUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#7c2d12"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </radialGradient>
  </defs>
  <circle cx="128" cy="128" r="128" fill="url(#bg)"/>
  <!-- Muscular Feline Ears -->
  <polygon points="70,70 50,30 90,50" fill="#ea580c" stroke="#7c2d12" stroke-width="3"/>
  <polygon points="186,70 206,30 166,50" fill="#ea580c" stroke="#7c2d12" stroke-width="3"/>
  <!-- Heavy Jawed Head -->
  <ellipse cx="128" cy="115" rx="55" ry="48" fill="#f97316" stroke="#7c2d12" stroke-width="4"/>
  <!-- Amber Eyes -->
  <circle cx="104" cy="105" r="10" fill="#facc15" stroke="#000"/><circle cx="104" cy="105" r="5" fill="#000"/>
  <circle cx="152" cy="105" r="10" fill="#facc15" stroke="#000"/><circle cx="152" cy="105" r="5" fill="#000"/>
  <!-- Giant Curved Saber Canines -->
  <polygon points="108,135 100,195 115,135" fill="#fef08a" stroke="#ca8a04" stroke-width="2"/>
  <polygon points="148,135 156,195 141,135" fill="#fef08a" stroke="#ca8a04" stroke-width="2"/>
  <polygon points="128,130 120,122 136,122" fill="#000000"/>
</svg>`);

// 13. Resurrected Dodo (pet-dodo-legendary)
const dodoSvg = svgUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#047857"/>
      <stop offset="100%" stop-color="#022c22"/>
    </radialGradient>
  </defs>
  <circle cx="128" cy="128" r="128" fill="url(#bg)"/>
  <!-- Plump Dodo Body & Curly Tail -->
  <circle cx="120" cy="165" r="60" fill="#64748b" stroke="#334155" stroke-width="4"/>
  <path d="M60 160 Q40 145 45 130 Q55 145 65 150" stroke="#f1f5f9" stroke-width="5" fill="none"/>
  <!-- Yellow Legs -->
  <line x1="105" y1="220" x2="105" y2="245" stroke="#facc15" stroke-width="6"/>
  <line x1="135" y1="220" x2="135" y2="245" stroke="#facc15" stroke-width="6"/>
  <!-- Dodo Head with Giant Hooked Beak -->
  <circle cx="155" cy="110" r="32" fill="#94a3b8" stroke="#334155" stroke-width="3"/>
  <path d="M165 105 C195 105 225 115 220 145 C205 145 180 130 165 125 Z" fill="#38bdf8" stroke="#0284c7" stroke-width="3"/>
  <path d="M205 115 Q225 120 220 145" stroke="#f97316" stroke-width="8" fill="none"/>
  <!-- Curious Dodo Eye -->
  <circle cx="145" cy="105" r="7" fill="#facc15"/><circle cx="145" cy="105" r="4" fill="#000000"/>
</svg>`);

// 14. Irish Great Elk (pet-elk-legendary)
const greatElkSvg = svgUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#14532d"/>
      <stop offset="100%" stop-color="#020617"/>
    </radialGradient>
  </defs>
  <circle cx="128" cy="128" r="128" fill="url(#bg)"/>
  <!-- Giant Palmated Antlers -->
  <path d="M110 70 Q50 30 20 50 Q10 20 45 15 Q75 10 110 65" fill="#eab308" stroke="#a16207" stroke-width="2.5"/>
  <path d="M146 70 Q206 30 236 50 Q246 20 211 15 Q181 10 146 65" fill="#eab308" stroke="#a16207" stroke-width="2.5"/>
  <!-- Elk Body & Head -->
  <ellipse cx="128" cy="180" rx="58" ry="48" fill="#78350f" stroke="#451a03" stroke-width="4"/>
  <ellipse cx="128" cy="105" rx="32" ry="40" fill="#92400e" stroke="#451a03" stroke-width="3"/>
  <!-- Gentle Eyes -->
  <circle cx="112" cy="100" r="5" fill="#000"/><circle cx="144" cy="100" r="5" fill="#000"/>
  <ellipse cx="128" cy="130" rx="14" ry="10" fill="#fde68a"/>
</svg>`);

// 15. Quetzalcoatlus Sky Monarch (pet-quetzal-mythical)
const quetzalSvg = svgUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#831843"/>
      <stop offset="100%" stop-color="#020617"/>
    </radialGradient>
  </defs>
  <circle cx="128" cy="128" r="128" fill="url(#bg)"/>
  <!-- Giant Pterosaur Wings -->
  <path d="M128 140 Q40 50 10 110 Q50 170 128 160" fill="#be185d" stroke="#831843" stroke-width="3"/>
  <path d="M128 140 Q216 50 246 110 Q206 170 128 160" fill="#be185d" stroke="#831843" stroke-width="3"/>
  <!-- Head with Towering Crest & Beak -->
  <polygon points="128,40 115,10 141,10" fill="#f43f5e" stroke="#831843" stroke-width="2"/>
  <ellipse cx="128" cy="95" rx="22" ry="30" fill="#db2777" stroke="#831843" stroke-width="3"/>
  <polygon points="128,95 120,170 136,170" fill="#facc15" stroke="#ca8a04" stroke-width="2"/>
  <!-- Eye -->
  <circle cx="128" cy="80" r="5" fill="#fbbf24"/><circle cx="128" cy="80" r="2.5" fill="#000"/>
</svg>`);

// 16. Ankylosaurus Iron Fortress (pet-ankylosaurus-mythical)
const ankyloSvg = svgUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#374151"/>
      <stop offset="100%" stop-color="#030712"/>
    </radialGradient>
  </defs>
  <circle cx="128" cy="128" r="128" fill="url(#bg)"/>
  <!-- Tail Club -->
  <path d="M128 180 L70 230" stroke="#4b5563" stroke-width="12" stroke-linecap="round"/>
  <ellipse cx="65" cy="235" rx="20" ry="14" fill="#9ca3af" stroke="#1f2937" stroke-width="3"/>
  <!-- Armored Carapace with Spikes -->
  <ellipse cx="135" cy="150" rx="65" ry="50" fill="#4b5563" stroke="#111827" stroke-width="4"/>
  <!-- Bony Triangular Spikes -->
  <polygon points="80,120 60,110 80,135" fill="#d1d5db" stroke="#374151"/>
  <polygon points="190,120 210,110 190,135" fill="#d1d5db" stroke="#374151"/>
  <polygon points="100,105 100,90 115,105" fill="#d1d5db"/>
  <polygon points="170,105 170,90 155,105" fill="#d1d5db"/>
  <!-- Armored Head -->
  <polygon points="135,95 110,125 160,125" fill="#6b7280" stroke="#1f2937" stroke-width="3"/>
  <!-- Small Dinosaur Eye -->
  <circle cx="135" cy="110" r="4" fill="#f59e0b"/>
</svg>`);

// 17. Terror Bird Titanis (pet-titanis-mythical)
const titanisSvg = svgUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#7f1d1d"/>
      <stop offset="100%" stop-color="#020617"/>
    </radialGradient>
  </defs>
  <circle cx="128" cy="128" r="128" fill="url(#bg)"/>
  <!-- Powerful Raptor Legs -->
  <line x1="110" y1="190" x2="100" y2="245" stroke="#f59e0b" stroke-width="6"/>
  <line x1="146" y1="190" x2="156" y2="245" stroke="#f59e0b" stroke-width="6"/>
  <!-- Body -->
  <ellipse cx="128" cy="160" rx="45" ry="40" fill="#991b1b" stroke="#450a0a" stroke-width="3"/>
  <!-- Long Neck -->
  <path d="M120 140 L135 80 L150 80 L140 140 Z" fill="#b91c1c"/>
  <!-- Massive Axe-like Predatory Beak -->
  <ellipse cx="140" cy="80" rx="25" ry="20" fill="#7f1d1d"/>
  <path d="M145 70 Q190 70 195 95 Q175 115 145 100 Z" fill="#fbbf24" stroke="#78350f" stroke-width="3"/>
  <!-- Raptor Eye -->
  <circle cx="135" cy="78" r="6" fill="#ef4444"/><circle cx="135" cy="78" r="3" fill="#000"/>
</svg>`);

// 18. Spinosaurus River Sovereign (pet-spinosaurus-ultimate)
const spinosaurusSvg = svgUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#065f46"/>
      <stop offset="100%" stop-color="#022c22"/>
    </radialGradient>
  </defs>
  <circle cx="128" cy="128" r="128" fill="url(#bg)"/>
  <!-- Massive Spinal Sail -->
  <path d="M80 140 Q130 30 180 140 Z" fill="#059669" stroke="#34d399" stroke-width="4"/>
  <line x1="105" y1="140" x2="115" y2="60" stroke="#34d399" stroke-width="3"/>
  <line x1="130" y1="140" x2="130" y2="40" stroke="#34d399" stroke-width="3"/>
  <line x1="155" y1="140" x2="145" y2="60" stroke="#34d399" stroke-width="3"/>
  <!-- Aquatic Dinosaur Body -->
  <ellipse cx="130" cy="165" rx="60" ry="40" fill="#047857" stroke="#064e3b" stroke-width="4"/>
  <!-- Crocodilian Snout -->
  <path d="M165 145 L230 155 L230 170 L165 175 Z" fill="#065f46" stroke="#064e3b" stroke-width="3"/>
  <circle cx="175" cy="148" r="4.5" fill="#facc15"/><circle cx="175" cy="148" r="2.5" fill="#000"/>
</svg>`);

// 19. Argentinosaurus Earth Shaker (pet-argentino-ultimate)
const argentinoSvg = svgUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#78350f"/>
      <stop offset="100%" stop-color="#020617"/>
    </radialGradient>
  </defs>
  <circle cx="128" cy="128" r="128" fill="url(#bg)"/>
  <!-- Towering Sauropod Neck -->
  <path d="M90 180 Q110 50 135 30 L155 35 Q135 60 145 180 Z" fill="#92400e" stroke="#451a03" stroke-width="3"/>
  <!-- Tiny Head in the Clouds -->
  <ellipse cx="140" cy="30" rx="14" ry="10" fill="#b45309"/>
  <!-- Mountain Body -->
  <ellipse cx="128" cy="195" rx="75" ry="50" fill="#78350f" stroke="#451a03" stroke-width="4"/>
</svg>`);

// 20. Jaekelopterus Sea Scorpion (pet-jaekelopterus-ultimate)
const jaekelopterusSvg = svgUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#0284c7"/>
      <stop offset="100%" stop-color="#082f49"/>
    </radialGradient>
  </defs>
  <circle cx="128" cy="128" r="128" fill="url(#bg)"/>
  <!-- Segmented Eurypterid Carapace -->
  <ellipse cx="128" cy="140" rx="40" ry="60" fill="#0369a1" stroke="#082f49" stroke-width="3"/>
  <line x1="95" y1="120" x2="161" y2="120" stroke="#38bdf8" stroke-width="2"/>
  <line x1="95" y1="145" x2="161" y2="145" stroke="#38bdf8" stroke-width="2"/>
  <line x1="100" y1="170" x2="156" y2="170" stroke="#38bdf8" stroke-width="2"/>
  <!-- Giant Pincer Claws -->
  <path d="M100 90 Q60 50 50 80 Q65 75 75 90" stroke="#38bdf8" stroke-width="5" fill="none"/>
  <path d="M156 90 Q196 50 206 80 Q191 75 181 90" stroke="#38bdf8" stroke-width="5" fill="none"/>
</svg>`);

// 21. Supernova Star Sovereign (pet-supernova-cosmic)
const supernovaSvg = svgUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <defs>
    <radialGradient id="sun" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="40%" stop-color="#facc15"/>
      <stop offset="70%" stop-color="#ea580c"/>
      <stop offset="100%" stop-color="#7c2d12"/>
    </radialGradient>
  </defs>
  <circle cx="128" cy="128" r="128" fill="#0f172a"/>
  <!-- Coronal Flare Rings -->
  <circle cx="128" cy="128" r="90" fill="none" stroke="#f59e0b" stroke-width="4" stroke-dasharray="10 5" opacity="0.6"/>
  <circle cx="128" cy="128" r="110" fill="none" stroke="#f43f5e" stroke-width="2" stroke-dasharray="15 10" opacity="0.4"/>
  <!-- Blazing Core -->
  <circle cx="128" cy="128" r="60" fill="url(#sun)"/>
  <!-- Cosmic Starburst Rays -->
  <polygon points="128,10 135,100 128,128 121,100" fill="#fef08a"/>
  <polygon points="128,246 135,156 128,128 121,156" fill="#fef08a"/>
  <polygon points="10,128 100,135 128,128 100,121" fill="#fef08a"/>
  <polygon points="246,128 156,135 128,128 156,121" fill="#fef08a"/>
</svg>`);

// 22. Ouroboros Infinity Dragon (pet-ouroboros-secret)
const ouroborosSvg = svgUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8b5cf6"/>
      <stop offset="50%" stop-color="#ec4899"/>
      <stop offset="100%" stop-color="#3b82f6"/>
    </linearGradient>
  </defs>
  <circle cx="128" cy="128" r="128" fill="#030712"/>
  <!-- Ouroboros Circular Dragon eating its tail -->
  <circle cx="128" cy="128" r="75" fill="none" stroke="url(#g)" stroke-width="26"/>
  <!-- Head with Dragon Horns swallowing tail -->
  <circle cx="128" cy="53" r="18" fill="#c084fc"/>
  <polygon points="120,40 110,15 130,30" fill="#facc15"/>
  <polygon points="136,40 146,15 126,30" fill="#facc15"/>
  <!-- Glowing eye -->
  <circle cx="134" cy="50" r="4" fill="#ffffff"/>
</svg>`);

// 23. Chronos Temporal Warden (pet-chronos-secret)
const chronosSecretSvg = svgUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <circle cx="128" cy="128" r="128" fill="#09090b"/>
  <!-- Astrolabe Clock Gear -->
  <circle cx="128" cy="128" r="85" fill="none" stroke="#eab308" stroke-width="6"/>
  <circle cx="128" cy="128" r="75" fill="none" stroke="#eab308" stroke-width="2" stroke-dasharray="8 6"/>
  <!-- Clock Hands -->
  <line x1="128" y1="128" x2="128" y2="60" stroke="#facc15" stroke-width="4" stroke-linecap="round"/>
  <line x1="128" y1="128" x2="175" y2="128" stroke="#facc15" stroke-width="4" stroke-linecap="round"/>
  <!-- Glowing Hourglass at center -->
  <polygon points="115,105 141,105 128,128" fill="#38bdf8"/>
  <polygon points="115,151 141,151 128,128" fill="#38bdf8"/>
</svg>`);

// 24. Mythic Chimera Sovereign (pet-chimera-secret)
const chimeraSvg = svgUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <circle cx="128" cy="128" r="128" fill="#18181b"/>
  <!-- Lion Body -->
  <ellipse cx="128" cy="165" rx="60" ry="45" fill="#d97706" stroke="#92400e" stroke-width="4"/>
  <!-- Goat Horns on Back -->
  <path d="M100 125 Q80 80 95 65" stroke="#f8fafc" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path d="M125 125 Q145 80 130 65" stroke="#f8fafc" stroke-width="6" fill="none" stroke-linecap="round"/>
  <!-- Lion Mane & Face -->
  <circle cx="140" cy="120" r="38" fill="#b45309"/>
  <circle cx="140" cy="120" r="26" fill="#f59e0b"/>
  <!-- Serpent Tail with glowing eyes -->
  <path d="M70 170 Q40 130 50 100 Q60 115 55 130" stroke="#10b981" stroke-width="8" fill="none" stroke-linecap="round"/>
</svg>`);

// 25. Blazing Monarch Ignis (pet-king-ignis)
const kingIgnisSvg = svgUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <defs>
    <radialGradient id="fire" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="60%" stop-color="#ea580c"/>
      <stop offset="100%" stop-color="#7c2d12"/>
    </radialGradient>
  </defs>
  <circle cx="128" cy="128" r="128" fill="#450a0a"/>
  <!-- Crown of Living Fire -->
  <polygon points="80,90 95,30 115,70 128,15 141,70 161,30 176,90" fill="#facc15" stroke="#ea580c" stroke-width="3"/>
  <!-- Magma Monarch Body -->
  <ellipse cx="128" cy="165" rx="55" ry="50" fill="url(#fire)" stroke="#facc15" stroke-width="4"/>
  <!-- Burning Eyes -->
  <circle cx="108" cy="130" r="7" fill="#ffffff"/><circle cx="148" cy="130" r="7" fill="#ffffff"/>
</svg>`);

// 26. Nine-Headed Hydra Sovereign (pet-king-hydra)
const hydraSvg = svgUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <circle cx="128" cy="128" r="128" fill="#1e1b4b"/>
  <!-- Multiple Rearing Serpent Necks -->
  <path d="M128 190 Q90 120 70 80" stroke="#059669" stroke-width="8" fill="none" stroke-linecap="round"/>
  <path d="M128 190 Q110 110 100 65" stroke="#059669" stroke-width="8" fill="none" stroke-linecap="round"/>
  <path d="M128 190 Q128 100 128 50" stroke="#10b981" stroke-width="10" fill="none" stroke-linecap="round"/>
  <path d="M128 190 Q146 110 156 65" stroke="#059669" stroke-width="8" fill="none" stroke-linecap="round"/>
  <path d="M128 190 Q166 120 186 80" stroke="#059669" stroke-width="8" fill="none" stroke-linecap="round"/>
  <!-- Heads with glowing fangs -->
  <circle cx="70" cy="80" r="10" fill="#34d399"/><circle cx="100" cy="65" r="10" fill="#34d399"/>
  <circle cx="128" cy="50" r="14" fill="#6ee7b7"/><circle cx="156" cy="65" r="10" fill="#34d399"/>
  <circle cx="186" cy="80" r="10" fill="#34d399"/>
</svg>`);

// 27. Sky Sovereign Royal Griffin (pet-king-griffin)
const griffinSvg = svgUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <circle cx="128" cy="128" r="128" fill="#1e293b"/>
  <!-- Golden Wings -->
  <path d="M128 130 Q50 30 20 90 Q70 120 128 140" fill="#facc15" stroke="#ca8a04" stroke-width="3"/>
  <path d="M128 130 Q206 30 236 90 Q186 120 128 140" fill="#facc15" stroke="#ca8a04" stroke-width="3"/>
  <!-- Lion Body -->
  <ellipse cx="128" cy="175" rx="55" ry="45" fill="#d97706" stroke="#92400e" stroke-width="3"/>
  <!-- Eagle Head & Golden Crown -->
  <circle cx="128" cy="100" r="32" fill="#ffffff" stroke="#e2e8f0" stroke-width="3"/>
  <polygon points="115,70 128,50 141,70" fill="#facc15"/>
  <path d="M128 95 Q145 98 142 120 Q130 115 128 95" fill="#facc15" stroke="#a16207" stroke-width="2"/>
  <circle cx="120" cy="95" r="4" fill="#000"/>
</svg>`);

// 28. Golden Pride King Lion (pet-king-lion)
const kingLionSvg = svgUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <defs>
    <radialGradient id="sunburst" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="70%" stop-color="#b45309"/>
      <stop offset="100%" stop-color="#78350f"/>
    </radialGradient>
  </defs>
  <circle cx="128" cy="128" r="128" fill="#451a03"/>
  <!-- Grand Sunburst Mane -->
  <circle cx="128" cy="125" r="70" fill="url(#sunburst)"/>
  <!-- Diamond Royal Crown -->
  <polygon points="100,55 110,25 128,45 146,25 156,55" fill="#facc15" stroke="#eab308" stroke-width="2"/>
  <!-- Lion Face -->
  <circle cx="128" cy="125" r="40" fill="#fde68a" stroke="#d97706" stroke-width="3"/>
  <circle cx="112" cy="115" r="6" fill="#78350f"/><circle cx="144" cy="115" r="6" fill="#78350f"/>
  <polygon points="128,135 120,126 136,126" fill="#78350f"/>
</svg>`);

// 29. Frost Giant Titan Ymir (pet-titan-ymir)
const titanYmirSvg = svgUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <circle cx="128" cy="128" r="128" fill="#082f49"/>
  <!-- Giant Glacial Horns -->
  <polygon points="90,70 40,20 110,40" fill="#38bdf8" stroke="#bae6fd" stroke-width="3"/>
  <polygon points="166,70 216,20 146,40" fill="#38bdf8" stroke="#bae6fd" stroke-width="3"/>
  <!-- Frost Giant Face & Icicle Beard -->
  <polygon points="80,80 176,80 156,160 100,160" fill="#0284c7" stroke="#38bdf8" stroke-width="4"/>
  <!-- Icicle Beard -->
  <polygon points="100,160 110,210 120,160" fill="#e0f2fe"/>
  <polygon points="120,160 128,230 136,160" fill="#e0f2fe"/>
  <polygon points="136,160 146,210 156,160" fill="#e0f2fe"/>
  <!-- Glowing Ice Rune Eyes -->
  <circle cx="110" cy="110" r="8" fill="#ffffff"/><circle cx="146" cy="110" r="8" fill="#ffffff"/>
</svg>`);

// 30. Behemoth Earth-Crusher (pet-titan-behemoth)
const titanBehemothSvg = svgUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <circle cx="128" cy="128" r="128" fill="#292524"/>
  <!-- Mountain Shoulders & Magma Fissures -->
  <path d="M40 210 L70 120 L128 80 L186 120 L216 210 Z" fill="#44403c" stroke="#1c1917" stroke-width="6"/>
  <!-- Magma veins -->
  <path d="M128 90 L120 140 L135 160 L128 200" stroke="#f97316" stroke-width="5" fill="none" stroke-linecap="round"/>
  <!-- Heavy Stone Fists -->
  <circle cx="65" cy="210" r="25" fill="#57534e" stroke="#f97316" stroke-width="3"/>
  <circle cx="191" cy="210" r="25" fill="#57534e" stroke="#f97316" stroke-width="3"/>
</svg>`);

// 31. Fire-Bringer Titan Prometheus (pet-titan-prometheus)
const prometheusSvg = svgUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <circle cx="128" cy="128" r="128" fill="#1c1917"/>
  <!-- Chained Bronze Arms holding Immortal Fire -->
  <circle cx="128" cy="100" r="45" fill="#ea580c"/>
  <circle cx="128" cy="100" r="30" fill="#facc15"/>
  <circle cx="128" cy="100" r="15" fill="#ffffff"/>
  <!-- Bronze Gauntlet Hands -->
  <path d="M80 180 Q128 150 176 180" stroke="#d97706" stroke-width="12" fill="none" stroke-linecap="round"/>
</svg>`);

// 32. Dragon God Bahamut (pet-deity-bahamut)
const bahamutSvg = svgUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <circle cx="128" cy="128" r="128" fill="#020617"/>
  <!-- Triple Wings of Divine Light -->
  <path d="M128 120 Q30 30 10 90 Q60 110 128 130" fill="#f8fafc" stroke="#38bdf8" stroke-width="2"/>
  <path d="M128 120 Q226 30 246 90 Q196 110 128 130" fill="#f8fafc" stroke="#38bdf8" stroke-width="2"/>
  <!-- Platinum Dragon Head with Halo -->
  <circle cx="128" cy="85" r="45" fill="none" stroke="#facc15" stroke-width="3"/>
  <polygon points="128,45 105,100 151,100" fill="#e2e8f0" stroke="#38bdf8" stroke-width="2"/>
  <!-- Divine Platinum Eyes -->
  <circle cx="118" cy="85" r="4" fill="#38bdf8"/><circle cx="138" cy="85" r="4" fill="#38bdf8"/>
</svg>`);

// 33. Seraphina Dawn Archangel (pet-deity-seraphina)
const seraphinaSvg = svgUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <defs>
    <radialGradient id="dawn" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#fff1f2"/>
      <stop offset="60%" stop-color="#fda4af"/>
      <stop offset="100%" stop-color="#4c0519"/>
    </radialGradient>
  </defs>
  <circle cx="128" cy="128" r="128" fill="url(#dawn)"/>
  <!-- 6 Golden Seraph Wings -->
  <path d="M128 120 Q40 40 20 80 Q60 110 128 130" fill="#fef08a" stroke="#ca8a04" stroke-width="2"/>
  <path d="M128 120 Q216 40 236 80 Q196 110 128 130" fill="#fef08a" stroke="#ca8a04" stroke-width="2"/>
  <!-- Halo of Dawn -->
  <circle cx="128" cy="70" r="30" fill="none" stroke="#ffffff" stroke-width="3"/>
  <circle cx="128" cy="100" r="18" fill="#ffffff"/>
</svg>`);

// 34. Underworld Sovereign Osiris (pet-deity-osiris)
const osirisSvg = svgUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <circle cx="128" cy="128" r="128" fill="#064e3b"/>
  <!-- Egyptian Atef Crown -->
  <polygon points="128,20 110,90 146,90" fill="#fef08a" stroke="#ca8a04" stroke-width="2"/>
  <!-- Emerald Divine Skin -->
  <ellipse cx="128" cy="120" rx="30" ry="38" fill="#10b981" stroke="#047857" stroke-width="3"/>
  <!-- Crossed Crook & Flail -->
  <line x1="100" y1="180" x2="156" y2="130" stroke="#facc15" stroke-width="5"/>
  <line x1="156" y1="180" x2="100" y2="130" stroke="#facc15" stroke-width="5"/>
</svg>`);

// 35. Star-Weaver Astraea (pet-deity-astraea)
const astraeaSvg = svgUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <circle cx="128" cy="128" r="128" fill="#1e1b4b"/>
  <!-- Constellation Gown -->
  <polygon points="128,80 80,220 176,220" fill="#4338ca"/>
  <!-- Balance Scales of Justice -->
  <line x1="80" y1="95" x2="176" y2="95" stroke="#facc15" stroke-width="3"/>
  <circle cx="80" cy="115" r="12" fill="none" stroke="#facc15" stroke-width="2"/>
  <circle cx="176" cy="115" r="12" fill="none" stroke="#facc15" stroke-width="2"/>
  <!-- Starlight Crown -->
  <circle cx="128" cy="65" r="15" fill="#fdf4ff"/>
</svg>`);

// 36. Supreme Creator Deus (pet-god-deus)
const godDeusSvg = svgUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <circle cx="128" cy="128" r="128" fill="#0a0a0a"/>
  <!-- Concentric Golden Halo Rings of Creation -->
  <circle cx="128" cy="128" r="100" fill="none" stroke="#facc15" stroke-width="2" stroke-dasharray="10 5"/>
  <circle cx="128" cy="128" r="75" fill="none" stroke="#fde047" stroke-width="4"/>
  <circle cx="128" cy="128" r="45" fill="none" stroke="#ffffff" stroke-width="6"/>
  <!-- Core Light -->
  <circle cx="128" cy="128" r="25" fill="#ffffff"/>
</svg>`);

// 37. Celestial Light God Aether (pet-god-aether)
const godAetherSvg = svgUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <circle cx="128" cy="128" r="128" fill="#0369a1"/>
  <!-- Prismatic Diamond Body -->
  <polygon points="128,40 188,128 128,216 68,128" fill="#bae6fd" stroke="#ffffff" stroke-width="4"/>
  <polygon points="128,65 168,128 128,191 88,128" fill="#ffffff" opacity="0.75"/>
</svg>`);

// 38. Endless Time God Chronos (pet-god-chronos)
const godChronosSvg = svgUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <circle cx="128" cy="128" r="128" fill="#18181b"/>
  <!-- Infinite Cosmic Clockwheel -->
  <circle cx="128" cy="128" r="95" fill="none" stroke="#ca8a04" stroke-width="5"/>
  <circle cx="128" cy="128" r="85" fill="none" stroke="#facc15" stroke-width="2" stroke-dasharray="6 3"/>
  <!-- Temporal Scythe -->
  <path d="M70 70 Q130 30 180 70" stroke="#fef08a" stroke-width="7" fill="none" stroke-linecap="round"/>
</svg>`);

// 39. Primordial Chaos Colossus (pet-kog-chaos-colossus)
const chaosColossusSvg = svgUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <circle cx="128" cy="128" r="128" fill="#020617"/>
  <!-- Swirling Dark Matter Vortex -->
  <circle cx="128" cy="128" r="80" fill="#3b0764"/>
  <circle cx="128" cy="128" r="50" fill="#581c87"/>
  <circle cx="128" cy="128" r="25" fill="#a855f7"/>
  <!-- Reality-breaking Eyes -->
  <ellipse cx="100" cy="100" rx="8" ry="4" fill="#f43f5e"/><ellipse cx="156" cy="100" rx="8" ry="4" fill="#f43f5e"/>
  <ellipse cx="128" cy="150" rx="12" ry="5" fill="#f43f5e"/>
</svg>`);

// 40. Omega Entity of the Multiverse (pet-kog-secret-entity)
const secretEntitySvg = svgUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <circle cx="128" cy="128" r="128" fill="#000000"/>
  <!-- Higher-dimensional Hypercube Tesseract Wireframe -->
  <rect x="78" y="78" width="100" height="100" fill="none" stroke="#06b6d4" stroke-width="3"/>
  <rect x="98" y="98" width="60" height="60" fill="none" stroke="#ec4899" stroke-width="2"/>
  <line x1="78" y1="78" x2="98" y2="98" stroke="#38bdf8" stroke-width="2"/>
  <line x1="178" y1="78" x2="158" y2="98" stroke="#38bdf8" stroke-width="2"/>
  <line x1="78" y1="178" x2="98" y2="158" stroke="#38bdf8" stroke-width="2"/>
  <line x1="178" y1="178" x2="158" y2="158" stroke="#38bdf8" stroke-width="2"/>
  <!-- Omnipresent Cosmic Eye -->
  <ellipse cx="128" cy="128" rx="20" ry="12" fill="#ffffff"/>
  <circle cx="128" cy="128" r="6" fill="#7c3aed"/>
</svg>`);

// 41. Starter Dragon Pyra Junior (starter-dragon-1)
const pyraJuniorSvg = svgUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <defs>
    <radialGradient id="fireBg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#7c2d12"/>
      <stop offset="100%" stop-color="#18181b"/>
    </radialGradient>
  </defs>
  <circle cx="128" cy="128" r="128" fill="url(#fireBg)"/>
  <!-- Little Dragon Wings -->
  <path d="M128 130 Q60 70 30 110 Q70 140 128 140" fill="#dc2626" stroke="#991b1b" stroke-width="3"/>
  <path d="M128 130 Q196 70 226 110 Q186 140 128 140" fill="#dc2626" stroke="#991b1b" stroke-width="3"/>
  <!-- Chubby Young Dragon Body -->
  <ellipse cx="128" cy="175" rx="50" ry="45" fill="#ea580c" stroke="#9a3412" stroke-width="3.5"/>
  <ellipse cx="128" cy="180" rx="30" ry="32" fill="#fef08a"/>
  <!-- Cute Horns -->
  <polygon points="100,75 80,45 110,65" fill="#facc15" stroke="#ca8a04" stroke-width="2"/>
  <polygon points="156,75 176,45 146,65" fill="#facc15" stroke="#ca8a04" stroke-width="2"/>
  <!-- Dragon Head -->
  <circle cx="128" cy="115" r="42" fill="#f97316" stroke="#9a3412" stroke-width="3.5"/>
  <!-- Big Fierce Baby Eyes -->
  <circle cx="110" cy="110" r="12" fill="#facc15" stroke="#7c2d12" stroke-width="2"/>
  <circle cx="110" cy="110" r="6" fill="#000000"/><circle cx="107" cy="106" r="3" fill="#ffffff"/>
  <circle cx="146" cy="110" r="12" fill="#facc15" stroke="#7c2d12" stroke-width="2"/>
  <circle cx="146" cy="110" r="6" fill="#000000"/><circle cx="143" cy="106" r="3" fill="#ffffff"/>
  <!-- Flame Puff from Snout -->
  <circle cx="128" cy="130" r="5" fill="#fef08a"/>
</svg>`);

/**
 * 100% INDIVIDUAL ARTWORK REGISTRY FOR EVERY SINGLE ONE OF THE 59 PETS!
 * No two pets share the same artwork.
 */
export const DISTINCT_PET_ARTWORKS: Record<string, string> = {
  // 1. Common (Tier 1)
  'pet-wolf-common': wolfImg,
  'pet-cat-common': sandCatSvg,
  'pet-owl-common': barnOwlSvg,
  'pet-hare-common': snowHareSvg,

  // 2. Uncommon (Tier 2)
  'pet-eagle-uncommon': eagleImg,
  'pet-fox-uncommon': kitsuneImg,
  'pet-deer-uncommon': forestDeerSvg,
  'pet-turtle-uncommon': turtleImg,

  // 3. Rare (Tier 3)
  'pet-leopard-rare': snowLeopardSvg,
  'pet-bear-rare': bearImg,
  'pet-orca-rare': orcaSvg,
  'pet-falcon-rare': falconSvg,

  // 4. Epic (Tier 4)
  'pet-tiger-epic': tigerImg,
  'pet-whale-epic': blueWhaleSvg,
  'pet-cobra-epic': kingCobraSvg,
  'pet-elephant-epic': warElephantSvg,

  // 5. Legendary (Tier 5)
  'pet-mammoth-legendary': mammothSvg,
  'pet-smilodon-legendary': smilodonSvg,
  'pet-dodo-legendary': dodoSvg,
  'pet-elk-legendary': greatElkSvg,

  // 6. Mythical (Tier 6)
  'pet-trex-mythical': dinosaurImg,
  'pet-quetzal-mythical': quetzalSvg,
  'pet-ankylosaurus-mythical': ankyloSvg,
  'pet-titanis-mythical': titanisSvg,

  // 7. Ultimate (Tier 7)
  'pet-megalodon-ultimate': megalodonImg,
  'pet-spinosaurus-ultimate': spinosaurusSvg,
  'pet-argentino-ultimate': argentinoSvg,
  'pet-jaekelopterus-ultimate': jaekelopterusSvg,

  // 8. Eternal (Tier 8)
  'pet-phoenix-eternal': phoenixImg,
  'pet-unicorn-eternal': unicornImg,
  'pet-azure-eternal': dragonImg,
  'pet-leviathan-eternal': leviathanImg,

  // 9. Cosmic (Tier 9)
  'pet-astral-cosmic': pegasusImg,
  'pet-supernova-cosmic': supernovaSvg,
  'pet-cerberus-cosmic': voidDemonImg,

  // 10. Secret (Tier 10)
  'pet-ouroboros-secret': ouroborosSvg,
  'pet-chronos-secret': chronosSecretSvg,
  'pet-chimera-secret': chimeraSvg,
  'pet-quantum-secret': mechaImg,

  // 11. King (Tier 11)
  'pet-king-ignis': kingIgnisSvg,
  'pet-king-hydra': hydraSvg,
  'pet-king-griffin': griffinSvg,
  'pet-king-lion': kingLionSvg,

  // 12. Titan (Tier 12)
  'pet-titan-atlas': crystalGolemImg,
  'pet-titan-ymir': titanYmirSvg,
  'pet-titan-behemoth': titanBehemothSvg,
  'pet-titan-prometheus': prometheusSvg,

  // 13. Deity (Tier 13)
  'pet-deity-bahamut': bahamutSvg,
  'pet-deity-seraphina': seraphinaSvg,
  'pet-deity-osiris': osirisSvg,
  'pet-deity-astraea': astraeaSvg,

  // 14. God (Tier 14)
  'pet-god-deus': godDeusSvg,
  'pet-god-aether': godAetherSvg,
  'pet-god-chronos': godChronosSvg,
  'pet-god-solaris': celestialGodImg,

  // 15. King of Gods (Tier 15)
  'pet-kog-chaos-colossus': chaosColossusSvg,
  'pet-kog-secret-entity': secretEntitySvg,
  'pet-kog-void-king': voidOverlordImg,

  // Starter Pet
  'starter-dragon-1': pyraJuniorSvg,
};

export function getDistinctArtworkForPet(petIdOrKey?: string): string {
  if (!petIdOrKey) return pyraJuniorSvg;
  return DISTINCT_PET_ARTWORKS[petIdOrKey] || pyraJuniorSvg;
}
