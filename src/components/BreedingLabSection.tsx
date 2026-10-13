import React, { useState } from 'react';
import {
  Sparkles,
  Heart,
  Dna,
  Zap,
  ArrowRight,
  Shield,
  Search,
  CheckCircle2,
  Crown,
  Flame,
  Info,
  ChevronRight,
  Lock,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PetCompanion, StolenEgg, EggTierType, CreatureRarity } from '../types';
import { getRarityConfig, getClassificationConfig } from '../data/creaturesData';
import { calculatePetStats } from '../data/arenaData';
import { playEnchantSound, playMythicFanfare, playLaser } from '../utils/soundEffects';
import {
  analyzeBreedingPair,
  executeBreedingPair,
  BreedingAnalysis,
} from '../utils/petBreeding';
import { EggVisualGraphic, getEggConfig } from './HatcheryModal';
import { getExclusiveArtworkForCreature } from '../utils/petArtworks';

interface BreedingLabSectionProps {
  hatchedPets: PetCompanion[];
  dragonCrystals: number;
  hatchBonusRate?: number;
  hatchRebate?: number;
  onAddDragonCrystals?: (amount: number) => void;
  onAddStolenEgg?: (egg: StolenEgg) => void;
  onGoToEggsTab: (targetEgg?: StolenEgg) => void;
}

export const BreedingLabSection: React.FC<BreedingLabSectionProps> = ({
  hatchedPets,
  dragonCrystals,
  hatchBonusRate = 0,
  hatchRebate = 0,
  onAddDragonCrystals,
  onAddStolenEgg,
  onGoToEggsTab,
}) => {
  // Selected Parents
  const [parent1Id, setParent1Id] = useState<string | null>(hatchedPets[0]?.id || null);
  const [parent2Id, setParent2Id] = useState<string | null>(
    hatchedPets.length > 1 ? hatchedPets[1]?.id : null
  );

  // Companion Picker Modal
  const [pickerSlot, setPickerSlot] = useState<1 | 2 | null>(null);
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Breeding In-Progress & Result Animation
  const [isBreeding, setIsBreeding] = useState(false);
  const [breedingResult, setBreedingResult] = useState<{
    newEgg: StolenEgg;
    isMutated: boolean;
  } | null>(null);

  const parent1 = hatchedPets.find((p) => p.id === parent1Id) || null;
  const parent2 = hatchedPets.find((p) => p.id === parent2Id) || null;

  const analysis: BreedingAnalysis = analyzeBreedingPair(
    parent1,
    parent2,
    hatchBonusRate,
    hatchRebate
  );

  const hasEnoughCrystals = dragonCrystals >= analysis.cost;

  // Handle Initiating Breeding
  const handleStartBreeding = () => {
    if (!parent1 || !parent2 || !analysis.canBreed) return;
    if (!hasEnoughCrystals) return;
    if (isBreeding) return;

    // Deduct Dragon Crystals
    if (onAddDragonCrystals) {
      onAddDragonCrystals(-analysis.cost);
    }

    setIsBreeding(true);
    playEnchantSound();

    // Trigger visual celebration fanfare
    setTimeout(() => {
      playMythicFanfare();
      confetti({
        particleCount: 120,
        spread: 100,
        origin: { y: 0.55 },
        colors: ['#c084fc', '#facc15', '#38bdf8', '#ec4899', '#ffffff'],
      });
    }, 1200);

    // Conclude breeding & produce egg after animation
    setTimeout(() => {
      const result = executeBreedingPair(parent1, parent2, hatchBonusRate, hatchRebate);

      // Add to player's egg inventory
      if (onAddStolenEgg) {
        onAddStolenEgg(result.newEgg);
      }

      setBreedingResult({
        newEgg: result.newEgg,
        isMutated: result.isMutated,
      });
      setIsBreeding(false);
    }, 2000);
  };

  // Filtered companions for the selection drawer
  const filteredCompanions = hatchedPets.filter((p) => {
    if (filterRarity !== 'all' && p.rarity !== filterRarity) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        (p.element || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Top Banner / Explanation */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/80 via-indigo-950/70 to-pink-950/80 border border-purple-500/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-lg relative overflow-hidden">
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/30 border border-purple-400/60 flex items-center justify-center text-2xl shrink-0 shadow-inner">
            🧬
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-pink-200 to-amber-200">
                Phòng Lai Tạo & Dung Hợp Gen (Breeding Lab)
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-pink-500/20 text-pink-300 border border-pink-500/40 animate-pulse">
                GENESIS LAB
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
              Ghép đôi 2 thú cưng để kết hợp gen di truyền. Cấp độ sao (★ Enchantment) và độ hiếm của bố mẹ càng cao thì xác suất sinh trứng{' '}
              <strong className="text-amber-300">Sáng Thế (God)</strong> &{' '}
              <strong className="text-purple-300">Vạn Thần Chi Vương (King of Gods)</strong> càng vượt trội!
            </p>
          </div>
        </div>

        {/* User Balance Display */}
        <div className="px-3.5 py-2 rounded-xl bg-slate-900/90 border border-purple-400/50 flex items-center gap-2.5 shrink-0 relative z-10 shadow-md">
          <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
          <div>
            <div className="text-[10px] text-purple-300 font-bold uppercase tracking-wider">
              Pha Lê Rồng Của Bạn
            </div>
            <div className="text-base font-black text-amber-300 flex items-center gap-1">
              <span>{dragonCrystals}</span>
              <span className="text-xs">💎</span>
            </div>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {hatchedPets.length < 2 ? (
        <div className="text-center py-12 text-slate-400 bg-slate-950/70 rounded-2xl border border-slate-800 p-6">
          <div className="text-5xl mb-3">🥚🐣💤</div>
          <h4 className="font-bold text-base text-slate-200">
            Chưa có đủ 2 thú cưng để thực hiện lai tạo!
          </h4>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Bạn cần sở hữu ít nhất 2 thú cưng đã ấp nở từ tab &quot;Ấp Trứng&quot; để ghép đôi sinh trứng.
          </p>
          <button
            onClick={() => onGoToEggsTab()}
            className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer shadow-md transition-all active:scale-95"
          >
            Quay Lại Tab Ấp Trứng
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* ================= LEFT SECTION: DUAL PARENTS ALTAR ================= */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-black uppercase text-purple-300 tracking-wider flex items-center gap-1.5">
                  <Dna className="w-4 h-4 text-pink-400" />
                  <span>Trụ Giao Phối & Hòa Huyết Bản Nguyên</span>
                </h5>
                <span className="text-[11px] text-slate-400">
                  {analysis.synergyTitle} (+{analysis.synergyBonus}đ)
                </span>
              </div>

              {/* Breeding Chamber Slots */}
              <div className="grid grid-cols-1 sm:grid-cols-11 gap-3 items-center">
                {/* Parent Slot 1 */}
                <div className="sm:col-span-5">
                  <ParentCardSlot
                    slotNumber={1}
                    label="Thú Cưng 1 (Gen Cha)"
                    pet={parent1}
                    onOpenPicker={() => setPickerSlot(1)}
                  />
                </div>

                {/* Center Core: Fusion Vortex & Heart */}
                <div className="sm:col-span-1 flex flex-col items-center justify-center my-2 sm:my-0">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all ${
                    isBreeding
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 animate-spin scale-125 shadow-xl shadow-pink-500/50'
                      : 'bg-slate-900 border border-purple-500/50 text-pink-400 shadow-md'
                  }`}>
                    {isBreeding ? '⚡' : '💖'}
                  </div>
                  <span className="text-[9px] font-black text-purple-300 mt-1 uppercase tracking-tighter">
                    {isBreeding ? 'DUNG HỢP...' : 'KẾT ĐÔI'}
                  </span>
                </div>

                {/* Parent Slot 2 */}
                <div className="sm:col-span-5">
                  <ParentCardSlot
                    slotNumber={2}
                    label="Thú Cưng 2 (Gen Mẹ)"
                    pet={parent2}
                    onOpenPicker={() => setPickerSlot(2)}
                  />
                </div>
              </div>

              {/* Genetic Synergy Breakdown Banner */}
              <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <div className="font-bold text-purple-200">
                    {analysis.synergyTitle}
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {analysis.synergyDescription}
                  </p>
                </div>
              </div>

              {/* Breeding Execution CTA */}
              <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-slate-300">
                  <span>Chi phí tiêu tốn: </span>
                  <strong className="text-amber-300 text-sm font-black">
                    {analysis.cost} 💎
                  </strong>
                  {analysis.rebateDiscount > 0 && (
                    <span className="ml-1 text-[10px] text-emerald-400">
                      (Đã giảm {analysis.rebateDiscount}💎 từ Lò Ấp)
                    </span>
                  )}
                </div>

                <button
                  onClick={handleStartBreeding}
                  disabled={!analysis.canBreed || !hasEnoughCrystals || isBreeding}
                  className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 ${
                    isBreeding
                      ? 'bg-purple-600 text-white animate-pulse'
                      : !hasEnoughCrystals
                      ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:via-pink-500 hover:to-amber-400 text-white shadow-purple-950/60'
                  }`}
                >
                  {isBreeding ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" />
                      <span>Đang Tiến Hành Dung Hợp Gen...</span>
                    </>
                  ) : !hasEnoughCrystals ? (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Thiếu {analysis.cost - dragonCrystals} Pha Lê Rồng</span>
                    </>
                  ) : (
                    <>
                      <span>🧬 BẮT ĐẦU LAI TẠO & SINH TRỨNG</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>
                  Bảo tồn thú cưng: Cả hai thú cưng bố mẹ hoàn toàn <strong>KHÔNG</strong> bị biến mất hay suy giảm chỉ số sau khi sinh trứng!
                </span>
              </div>
            </div>
          </div>

          {/* ================= RIGHT SECTION: PROBABILITY DASHBOARD ================= */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-black uppercase text-amber-300 tracking-wider flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Dự Đoán Tỉ Lệ Độ Hiếm Của Trứng Con</span>
                </h5>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 font-bold border border-purple-500/30">
                  Điểm Gen: {analysis.geneticScore}
                </span>
              </div>

              {/* Mutation Chance Highlight */}
              <div className="p-2.5 rounded-xl bg-gradient-to-r from-pink-950/60 to-purple-950/60 border border-pink-500/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">✨</span>
                  <div>
                    <div className="text-xs font-bold text-pink-200">
                      Tỉ Lệ Đột Biến Huyết Thống
                    </div>
                    <div className="text-[10px] text-slate-300">
                      Đột phá vỏ trứng lên bậc cao cấp hơn dự tính
                    </div>
                  </div>
                </div>
                <div className="text-base font-black text-pink-400">
                  {analysis.mutationChance}%
                </div>
              </div>

              {/* Dynamic Odds Bars */}
              <div className="space-y-2 pt-1">
                {analysis.odds.map((odd) => {
                  const eggMeta = getEggConfig(odd.eggType);
                  return (
                    <div
                      key={odd.eggType}
                      className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 hover:border-slate-700 transition-all"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{eggMeta.emoji.slice(0, 2)}</span>
                          <span className="font-bold text-white">{odd.nameVi}</span>
                        </div>
                        <span className="font-black text-amber-300">
                          {odd.probability}%
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${odd.probability}%`,
                            backgroundColor: odd.color,
                          }}
                        />
                      </div>

                      <div className="text-[10px] text-slate-400 truncate">
                        {eggMeta.oddsHint}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="font-bold text-slate-300 flex items-center gap-1">
                  <Info className="w-3 h-3 text-cyan-400" />
                  <span>Mẹo Nâng Cao Xác Suất Trứng Thần:</span>
                </div>
                <p>
                  • Nâng cấp sao bằng cách <strong className="text-purple-300">Enchant</strong> (mỗi sao tăng mạnh điểm gen).
                </p>
                <p>
                  • Cho thú cưng luyện cấp trong Đấu Trường để tích lũy kinh nghiệm di truyền.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= COMPANION PICKER MODAL / DRAWER ================= */}
      {pickerSlot !== null && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-purple-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-scale-up">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2">
                <Dna className="w-5 h-5 text-purple-400" />
                <h4 className="font-black text-sm text-white">
                  Chọn Thú Cưng Cho Vị Trí {pickerSlot === 1 ? 'Gen Cha' : 'Gen Mẹ'}
                </h4>
              </div>
              <button
                onClick={() => setPickerSlot(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Filters & Search */}
            <div className="p-3 border-b border-slate-800 bg-slate-950/60 flex flex-wrap gap-2 items-center justify-between">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm thú cưng theo tên, nguyên tố..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                />
              </div>

              <select
                value={filterRarity}
                onChange={(e) => setFilterRarity(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-xs text-white rounded-xl px-2.5 py-1.5 focus:outline-none"
              >
                <option value="all">Tất cả độ hiếm</option>
                <option value="king_of_god">King of God</option>
                <option value="god">God</option>
                <option value="deity">Deity</option>
                <option value="titan">Titan</option>
                <option value="king">King</option>
                <option value="secret">Secret</option>
                <option value="cosmic">Cosmic</option>
                <option value="eternal">Eternal</option>
                <option value="ultimate">Ultimate</option>
                <option value="mythical">Mythical</option>
                <option value="legendary">Legendary</option>
                <option value="epic">Epic</option>
                <option value="rare">Rare</option>
              </select>
            </div>

            {/* List */}
            <div className="p-3 overflow-y-auto space-y-2 flex-1 max-h-96">
              {filteredCompanions.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Không tìm thấy thú cưng phù hợp.
                </div>
              ) : (
                filteredCompanions.map((pet) => {
                  const isOtherSlotSelected =
                    pickerSlot === 1 ? pet.id === parent2Id : pet.id === parent1Id;
                  const isCurrentSlotSelected =
                    pickerSlot === 1 ? pet.id === parent1Id : pet.id === parent2Id;
                  const rMeta = getRarityConfig(pet.rarity);
                  const stars = pet.enchantmentLevel || 0;

                  return (
                    <div
                      key={pet.id}
                      onClick={() => {
                        if (isOtherSlotSelected) return;
                        if (pickerSlot === 1) setParent1Id(pet.id);
                        if (pickerSlot === 2) setParent2Id(pet.id);
                        setPickerSlot(null);
                      }}
                      className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                        isOtherSlotSelected
                          ? 'opacity-40 bg-slate-950 border-slate-800 cursor-not-allowed'
                          : isCurrentSlotSelected
                          ? 'bg-purple-950/80 border-purple-400 ring-2 ring-purple-500/40 cursor-pointer'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-900 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden relative shrink-0 shadow">
                          <img
                            src={getExclusiveArtworkForCreature(pet)}
                            alt={pet.name}
                            className="w-full h-full object-cover filter contrast-105"
                          />
                          <span className="absolute bottom-0 right-0 text-[8px] bg-slate-950/85 px-0.5 rounded-tl">
                            {pet.avatarIcon}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-xs text-white truncate">
                              {pet.name}
                            </span>
                            <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full ${rMeta.badgeBg} ${rMeta.badgeText}`}>
                              {rMeta.nameEn}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>Cấp {pet.level || 1}</span>
                            <span>•</span>
                            <span className="text-amber-300 font-semibold">
                              {'★'.repeat(stars)}
                              {'☆'.repeat(Math.max(0, 5 - stars))}
                            </span>
                            <span>•</span>
                            <span className="uppercase text-cyan-300">
                              {pet.element || 'nature'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        {isOtherSlotSelected ? (
                          <span className="text-[10px] text-rose-400 font-semibold">
                            Đã chọn ở vị trí kia
                          </span>
                        ) : isCurrentSlotSelected ? (
                          <span className="text-[10px] text-purple-300 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                            <span>Đang chọn</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg bg-indigo-600/80 hover:bg-indigo-500 text-white text-[11px] font-bold">
                            Chọn
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= SUCCESSFUL EGG LAID MODAL ================= */}
      {breedingResult && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="w-full max-w-md bg-gradient-to-b from-purple-950 via-slate-900 to-slate-950 border-2 border-amber-400 rounded-3xl p-6 text-center space-y-4 shadow-2xl shadow-purple-950/80 relative overflow-hidden animate-scale-up">
            {/* Ambient Top Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-1 relative z-10">
              <span className="text-xs uppercase font-black tracking-widest text-amber-300 bg-amber-950/80 px-3 py-1 rounded-full border border-amber-500/50">
                🎉 LAI TẠO THÀNH CÔNG!
              </span>
              <h3 className="text-xl font-black text-white mt-2">
                Một Quả Trứng Mới Đã Được Sinh Ra!
              </h3>
              {breedingResult.isMutated && (
                <div className="text-xs text-pink-300 font-black animate-pulse flex items-center justify-center gap-1">
                  <span>✨ ĐỘT BIẾN HUYẾT THỐNG THẦN THOẠI! (LUCKY MUTATION) ✨</span>
                </div>
              )}
            </div>

            {/* Egg Visual Display */}
            <div className="py-2 flex justify-center relative z-10">
              <EggVisualGraphic type={breedingResult.newEgg.eggType} size="lg" />
            </div>

            {/* Egg Details */}
            {(() => {
              const eggMeta = getEggConfig(breedingResult.newEgg.eggType);
              return (
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 text-left space-y-2 relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-amber-300">
                      {eggMeta.name}
                    </span>
                    <span className="text-[10px] text-purple-300 font-bold">
                      {eggMeta.tierRank}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {eggMeta.description}
                  </p>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <span>Cha: {breedingResult.newEgg.parent1Avatar}</span>
                      <span>×</span>
                      <span>Mẹ: {breedingResult.newEgg.parent2Avatar}</span>
                    </div>
                    <span className="text-emerald-400 font-semibold">
                      Đã thêm vào Lò Ấp Trứng
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Actions */}
            <div className="space-y-2 pt-2 relative z-10">
              <button
                onClick={() => {
                  const target = breedingResult.newEgg;
                  setBreedingResult(null);
                  onGoToEggsTab(target);
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs cursor-pointer shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <span>ẤP QUẢ TRỨNG NÀY NGAY TRONG LÒ ẤP</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setBreedingResult(null)}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs cursor-pointer transition-colors"
              >
                Tiếp Tục Ở Lại Phòng Lai Tạo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-component for individual parent slot
const ParentCardSlot: React.FC<{
  slotNumber: 1 | 2;
  label: string;
  pet: PetCompanion | null;
  onOpenPicker: () => void;
}> = ({ slotNumber, label, pet, onOpenPicker }) => {
  if (!pet) {
    return (
      <div
        onClick={onOpenPicker}
        className="h-44 rounded-2xl border-2 border-dashed border-purple-500/40 hover:border-purple-400 bg-purple-950/20 hover:bg-purple-950/40 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all p-4 text-center group"
      >
        <div className="w-12 h-12 rounded-full bg-purple-600/20 group-hover:bg-purple-600/40 border border-purple-400/40 flex items-center justify-center text-2xl text-purple-300 transition-all group-hover:scale-110">
          +
        </div>
        <div>
          <div className="text-xs font-bold text-purple-200">
            Chọn {label}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Nhấp để chọn từ danh sách thú cưng
          </p>
        </div>
      </div>
    );
  }

  const rMeta = getRarityConfig(pet.rarity);
  const stars = pet.enchantmentLevel || 0;
  const stats = calculatePetStats(pet);

  return (
    <div className="rounded-2xl border border-purple-500/40 bg-slate-900/90 p-3.5 space-y-2.5 shadow-md relative group">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider">
          {label}
        </span>
        <button
          onClick={onOpenPicker}
          className="text-[10px] text-cyan-300 hover:text-cyan-200 font-bold cursor-pointer underline"
        >
          Thay đổi
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-slate-950 border-2 border-purple-400/50 overflow-hidden relative shrink-0 shadow-inner">
          <img
            src={getExclusiveArtworkForCreature(pet)}
            alt={pet.name}
            className="w-full h-full object-cover filter contrast-105"
          />
          <span className="absolute bottom-0 right-0 text-[10px] bg-slate-950/85 px-1 rounded-tl">
            {pet.avatarIcon}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h6 className="font-extrabold text-sm text-white truncate">
              {pet.name}
            </h6>
          </div>
          <span className={`inline-block text-[9px] font-black px-1.5 py-0.2 rounded-full ${rMeta.badgeBg} ${rMeta.badgeText} mt-0.5`}>
            {rMeta.nameEn} • Cấp {pet.level || 1}
          </span>
          <div className="text-amber-300 font-black text-xs mt-0.5 tracking-wider">
            {'★'.repeat(stars)}
            {'☆'.repeat(Math.max(0, 5 - stars))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-800/80 text-[10px] text-center">
        <div className="bg-slate-950/80 rounded-lg p-1">
          <div className="text-rose-400 font-bold">{stats.maxHp}</div>
          <div className="text-[8px] text-slate-500 uppercase">Máu</div>
        </div>
        <div className="bg-slate-950/80 rounded-lg p-1">
          <div className="text-amber-400 font-bold">{stats.atk}</div>
          <div className="text-[8px] text-slate-500 uppercase">Công</div>
        </div>
        <div className="bg-slate-950/80 rounded-lg p-1">
          <div className="text-cyan-400 font-bold">{stats.def}</div>
          <div className="text-[8px] text-slate-500 uppercase">Thủ</div>
        </div>
      </div>
    </div>
  );
};
