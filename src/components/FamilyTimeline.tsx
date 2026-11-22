import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Play,
  Pause,
  Share2,
  Sparkles,
  Users,
  Calendar,
  ArrowUpLeft,
  FastForward,
  Maximize2,
  X,
  List,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { FamilyCalculations, FamilyState } from '../types';
import { calcAge, formatAge } from '../utils/calc';

interface FamilyTimelineProps {
  state: FamilyState;
  calc: FamilyCalculations;
  selectedYear: number;
  onUpdateTimelineYear: (year: number) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

type TimelineRole = 'father' | 'mother' | 'son' | 'daughter';

interface TimelinePerson {
  id: string;
  name: string;
  date: Date;
  role: TimelineRole;
  roleLabel: string;
  emoji: string;
  isFemale: boolean;
}

interface MilestoneChip {
  id: string;
  year: number;
  label: string;
  emoji: string;
  kind: 'today' | 'wedding' | 'birth' | 'anniversary' | 'grad';
}

function getLifeStage(ageYears: number): string {
  if (ageYears === 0) return 'حديث الولادة';
  if (ageYears <= 5) return 'طفولة مبكرة';
  if (ageYears <= 11) return 'المرحلة الابتدائية';
  if (ageYears <= 14) return 'المرحلة المتوسطة';
  if (ageYears <= 17) return 'المرحلة الثانوية';
  if (ageYears <= 22) return 'المرحلة الجامعية';
  if (ageYears <= 39) return 'مرحلة الشباب';
  if (ageYears <= 59) return 'مرحلة النضج';
  return 'مرحلة الحكمة';
}

function getAnniversaryName(years: number): string | null {
  switch (years) {
    case 5:
      return 'اليوبيل الخشبي';
    case 10:
      return 'اليوبيل البرونزي';
    case 15:
      return 'اليوبيل البلوري';
    case 20:
      return 'اليوبيل الصيني';
    case 25:
      return 'اليوبيل الفضي';
    case 30:
      return 'اليوبيل اللؤلؤي';
    case 40:
      return 'اليوبيل الياقوتي';
    case 50:
      return 'اليوبيل الذهبي';
    default:
      return null;
  }
}

export const FamilyTimeline: React.FC<FamilyTimelineProps> = ({
  state,
  calc,
  selectedYear: rawSelectedYear,
  onUpdateTimelineYear,
  onShowToast,
}) => {
  const currentYear = calc.now.getFullYear();
  const minYear = calc.timelineMinYear;
  const maxYear = calc.timelineMaxYear;
  const selectedYear = Math.min(maxYear, Math.max(minYear, rawSelectedYear || currentYear));
  const span = Math.max(1, maxYear - minYear);

  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<1 | 2>(1);
  const [mirrorChildIdx, setMirrorChildIdx] = useState(0);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [compactOverride, setCompactOverride] = useState<boolean | null>(null);
  const [mirrorOpenOverride, setMirrorOpenOverride] = useState<boolean | null>(null);
  const isFirstRender = useRef(true);

  const getPos = (date: Date): number => {
    const val = date.getFullYear() + date.getMonth() / 12;
    return Math.max(0, Math.min(100, ((val - minYear) / span) * 100));
  };

  const getYearPos = (year: number): number => {
    return Math.max(0, Math.min(100, ((year - minYear) / span) * 100));
  };

  const currentYearPos = getYearPos(selectedYear);
  const weddingPos = calc.weddingDate ? getPos(calc.weddingDate) : null;
  const weddingYear = calc.weddingDate ? calc.weddingDate.getFullYear() : null;

  // Build timeline people
  const timelinePeople: TimelinePerson[] = useMemo(() => {
    const list: TimelinePerson[] = [];
    if (calc.fatherDate) {
      list.push({
        id: 'f',
        name: state.fatherName.trim(),
        date: calc.fatherDate,
        role: 'father',
        roleLabel: 'الأب',
        emoji: '👨',
        isFemale: false,
      });
    }
    if (calc.motherDate) {
      list.push({
        id: 'm',
        name: state.motherName.trim(),
        date: calc.motherDate,
        role: 'mother',
        roleLabel: 'الأم',
        emoji: '👩',
        isFemale: true,
      });
    }
    calc.children.forEach((c) => {
      const isDaughter = c.gender === 'f';
      list.push({
        id: c.id,
        name: c.name.trim(),
        date: c.birthDateObj,
        role: isDaughter ? 'daughter' : 'son',
        roleLabel: isDaughter ? 'ابنة' : 'ابن',
        emoji: isDaughter ? '👧' : '👦',
        isFemale: isDaughter,
      });
    });
    return list;
  }, [calc.fatherDate, calc.motherDate, calc.children, state.fatherName, state.motherName]);

  // Auto-enable compact mode for larger families (>= 6 members, e.g. parents + 4+ children) or inside Theater Mode
  const isLargeFamily = timelinePeople.length >= 6;
  const isCompact =
    compactOverride !== null ? compactOverride : isTheaterMode || isLargeFamily;
  const isMirrorOpen =
    mirrorOpenOverride !== null ? mirrorOpenOverride : !isLargeFamily;

  // Lock background scroll & handle Escape in Theater Mode
  useEffect(() => {
    if (!isTheaterMode) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsTheaterMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isTheaterMode]);

  // Build milestone chips & key years set
  const { milestoneChips, milestoneYearSet } = useMemo(() => {
    const chips: MilestoneChip[] = [];
    const keyYears = new Set<number>();

    chips.push({
      id: 'today',
      year: currentYear,
      label: `اليوم (${currentYear})`,
      emoji: '📍',
      kind: 'today',
    });

    if (weddingYear !== null) {
      keyYears.add(weddingYear);
      chips.push({
        id: 'wedding',
        year: weddingYear,
        label: `الزواج (${weddingYear})`,
        emoji: '💍',
        kind: 'wedding',
      });

      [10, 25, 50].forEach((anniv) => {
        const y = weddingYear + anniv;
        if (y >= minYear && y <= maxYear) {
          keyYears.add(y);
          const title = anniv === 25 ? 'الفضي' : anniv === 50 ? 'الذهبي' : `${anniv} سنوات`;
          chips.push({
            id: `anniv-${anniv}`,
            year: y,
            label: `${title} (${y})`,
            emoji: '💐',
            kind: 'anniversary',
          });
        }
      });
    }

    calc.children.forEach((c) => {
      const by = c.birthDateObj.getFullYear();
      keyYears.add(by);
      chips.push({
        id: `birth-${c.id}`,
        year: by,
        label: `${c.name} (${by})`,
        emoji: c.gender === 'f' ? '👧' : '👦',
        kind: 'birth',
      });
    });

    if (calc.children.length > 0) {
      const oldest = calc.children[0];
      const gradYear = oldest.birthDateObj.getFullYear() + 18;
      if (gradYear >= minYear && gradYear <= maxYear && !keyYears.has(gradYear)) {
        keyYears.add(gradYear);
        chips.push({
          id: `grad-${oldest.id}`,
          year: gradYear,
          label: `${oldest.name} 18 سنة (${gradYear})`,
          emoji: '🎓',
          kind: 'grad',
        });
      }
    }

    const [todayChip, ...rest] = chips;
    rest.sort((a, b) => a.year - b.year);
    return {
      milestoneChips: [todayChip, ...rest],
      milestoneYearSet: keyYears,
    };
  }, [calc.children, weddingYear, currentYear, minYear, maxYear]);

  const isMilestoneYear = milestoneYearSet.has(selectedYear);

  // Smart Pause Play loop
  useEffect(() => {
    if (!isPlaying) return;
    const baseDelay = speed === 1 ? 550 : 260;
    const milestoneDelay = speed === 1 ? 1500 : 800;
    const delay = isMilestoneYear ? milestoneDelay : baseDelay;

    const timer = window.setTimeout(() => {
      const next = selectedYear >= maxYear ? minYear : selectedYear + 1;
      onUpdateTimelineYear(next);
    }, delay);

    return () => clearTimeout(timer);
  }, [isPlaying, speed, selectedYear, maxYear, minYear, isMilestoneYear, onUpdateTimelineYear]);

  // Subtle mobile haptic pulse on milestone years
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (isMilestoneYear) {
      try {
        if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
          navigator.vibrate(14);
        }
      } catch {
        // Ignore if unsupported
      }
    }
  }, [selectedYear, isMilestoneYear]);

  // Story Banner, Combined Age & Marriage Duration in selectedYear
  const yearSnapshot = useMemo(() => {
    const testDate = new Date(selectedYear, calc.now.getMonth(), calc.now.getDate());
    let totalCombinedYears = 0;
    let aliveCount = 0;
    const events: string[] = [];

    if (calc.fatherDate && calc.fatherDate.getFullYear() === selectedYear) {
      events.push(`👶 ميلاد الأب${state.fatherName ? ` (${state.fatherName.trim()})` : ''}`);
    }
    if (calc.motherDate && calc.motherDate.getFullYear() === selectedYear) {
      events.push(`👶 ميلاد الأم${state.motherName ? ` (${state.motherName.trim()})` : ''}`);
    }

    let marriageYearsInYear: number | null = null;
    if (weddingYear !== null) {
      if (selectedYear === weddingYear) {
        const fAge = calc.fatherDate ? weddingYear - calc.fatherDate.getFullYear() : null;
        const mAge = calc.motherDate ? weddingYear - calc.motherDate.getFullYear() : null;
        const details: string[] = [];
        if (fAge !== null && fAge >= 0) details.push(`عمر الأب ${fAge} سنة`);
        if (mAge !== null && mAge >= 0) details.push(`عمر الأم ${mAge} سنة`);
        events.push(
          `💍 بداية الحياة الزوجية${details.length ? ` (${details.join(' · ')})` : ''}`
        );
        marriageYearsInYear = 0;
      } else if (selectedYear > weddingYear) {
        marriageYearsInYear = selectedYear - weddingYear;
        const annivName = getAnniversaryName(marriageYearsInYear);
        if (annivName) {
          events.push(`💐 ${annivName} للزواج (${marriageYearsInYear} سنة)`);
        }
      }
    }

    const childBirthsThisYear = calc.children.filter(
      (c) => c.birthDateObj.getFullYear() === selectedYear
    );
    childBirthsThisYear.forEach((c) => {
      const fAge = calc.fatherDate ? selectedYear - calc.fatherDate.getFullYear() : null;
      const mAge = calc.motherDate ? selectedYear - calc.motherDate.getFullYear() : null;
      const parentNote =
        fAge !== null && mAge !== null ? ` — الأب ${fAge} سنة والأم ${mAge} سنة` : '';
      events.push(`${c.gender === 'f' ? '👧' : '👦'} ولادة ${c.name}${parentNote}`);
    });

    calc.children.forEach((c) => {
      const ageInSel = selectedYear - c.birthDateObj.getFullYear();
      if (ageInSel === 18) {
        events.push(`🎓 يصل ${c.name} لعمر 18 سنة (سن الجامعة)`);
      } else if (ageInSel === 6 && childBirthsThisYear.length === 0) {
        events.push(`🎒 يدخل ${c.name} سن الدراسة (6 سنوات)`);
      }
    });

    timelinePeople.forEach((p) => {
      if (selectedYear >= p.date.getFullYear()) {
        const a = calcAge(p.date, testDate);
        if (!a.neg) {
          totalCombinedYears += a.y;
          aliveCount += 1;
        } else {
          aliveCount += 1;
        }
      }
    });

    let headline = '';
    let isSpecial = false;
    if (events.length > 0) {
      headline = events.join('  •  ');
      isSpecial = true;
    } else if (selectedYear === currentYear) {
      headline = `السنة الحالية — الأسرة تضم ${aliveCount} أفراد${
        marriageYearsInYear !== null ? ` بعد ${marriageYearsInYear} سنة من الزواج` : ''
      }.`;
    } else if (weddingYear !== null && selectedYear < weddingYear) {
      headline = `ما قبل الزواج بـ ${weddingYear - selectedYear} ${
        weddingYear - selectedYear <= 10 ? 'سنوات' : 'سنة'
      }.`;
    } else if (selectedYear > currentYear) {
      headline = `نظرة مستقبلية للأسرة${
        marriageYearsInYear !== null ? ` في العام ${marriageYearsInYear} للزواج` : ''
      }.`;
    } else {
      headline = `سجل الأسرة في عام ${selectedYear} — ${aliveCount} أفراد.`;
    }

    return {
      headline,
      isSpecial,
      totalCombinedYears,
      aliveCount,
      marriageYearsInYear,
    };
  }, [
    selectedYear,
    currentYear,
    calc.now,
    calc.fatherDate,
    calc.motherDate,
    calc.children,
    state.fatherName,
    state.motherName,
    weddingYear,
    timelinePeople,
  ]);

  // Year Ruler ticks
  const rulerTicks = useMemo(() => {
    const step = span <= 35 ? 5 : 10;
    const ticks: number[] = [];
    const firstTick = Math.ceil(minYear / step) * step;
    for (let y = firstTick; y <= maxYear; y += step) {
      ticks.push(y);
    }
    return ticks;
  }, [minYear, maxYear, span]);

  // Same-Age Generational Mirror
  const safeMirrorIdx = Math.min(mirrorChildIdx, Math.max(0, calc.children.length - 1));
  const mirrorChild = calc.children[safeMirrorIdx] || null;

  const mirrorInsights = useMemo(() => {
    if (!mirrorChild || (!calc.fatherDate && !calc.motherDate)) return null;
    const childBirthYear = mirrorChild.birthDateObj.getFullYear();
    const childAgeInSelected = Math.max(0, selectedYear - childBirthYear);
    const isChildBorn = selectedYear >= childBirthYear;

    const fatherBirthYear = calc.fatherDate ? calc.fatherDate.getFullYear() : null;
    const motherBirthYear = calc.motherDate ? calc.motherDate.getFullYear() : null;

    const fatherSameAgeYear = fatherBirthYear !== null ? fatherBirthYear + childAgeInSelected : null;
    const motherSameAgeYear = motherBirthYear !== null ? motherBirthYear + childAgeInSelected : null;

    const fatherMarriageAge =
      fatherBirthYear !== null && weddingYear !== null && weddingYear >= fatherBirthYear
        ? weddingYear - fatherBirthYear
        : null;
    const childAtFatherMarriageYear =
      fatherMarriageAge !== null ? childBirthYear + fatherMarriageAge : null;

    return {
      isChildBorn,
      childAgeInSelected,
      fatherSameAgeYear,
      motherSameAgeYear,
      fatherMarriageAge,
      childAtFatherMarriageYear,
    };
  }, [mirrorChild, calc.fatherDate, calc.motherDate, weddingYear, selectedYear]);

  // Share Snapshot
  const handleShareYearSnapshot = async () => {
    const testDate = new Date(selectedYear, calc.now.getMonth(), calc.now.getDate());
    const lines: string[] = [];
    lines.push(`🕰️ لقطة الأسرة في عام ${selectedYear}`);
    lines.push('────────────────────');

    if (yearSnapshot.isSpecial) {
      lines.push(yearSnapshot.headline);
      lines.push('');
    }

    timelinePeople.forEach((p) => {
      const born = selectedYear >= p.date.getFullYear();
      const ageObj = calcAge(p.date, testDate);
      const label = p.name && p.name !== p.roleLabel ? `${p.roleLabel} (${p.name})` : p.roleLabel;
      if (!born) {
        lines.push(`${p.emoji} ${label}: ${p.isFemale ? 'لم تُولد بعد' : 'لم يولد بعد'}`);
      } else if (ageObj.neg) {
        lines.push(`${p.emoji} ${label}: سنة الميلاد (${p.date.getFullYear()})`);
      } else {
        lines.push(`${p.emoji} ${label}: ${formatAge(ageObj)}`);
      }
    });

    lines.push('');
    lines.push(`✨ مجموع أعمار الأسرة: ${yearSnapshot.totalCombinedYears} سنة`);
    if (yearSnapshot.marriageYearsInYear !== null) {
      lines.push(
        yearSnapshot.marriageYearsInYear === 0
          ? `💍 سنة الزواج المبارك`
          : `💍 مدة الزواج: ${yearSnapshot.marriageYearsInYear} سنة`
      );
    }

    const shareText = lines.join('\n');

    if (navigator.share) {
      try {
        await navigator.share({
          title: `لقطة الأسرة لعام ${selectedYear}`,
          text: shareText,
        });
        onShowToast('تمت مشاركة لقطة السنة بنجاح', 'success');
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(shareText);
      onShowToast(`تم نسخ لقطة عام ${selectedYear} للمشاركة`, 'success');
    } catch {
      onShowToast('تعذّر النسخ التلقائي على هذا المتصفح', 'error');
    }
  };

  // Shared Renderer: Timeline People Lifespan Bars + Year Ruler
  const renderBarsAndRuler = (compact: boolean) => (
    <div className={compact ? 'space-y-1.5' : 'space-y-3 pt-1'}>
      {timelinePeople.map((person) => {
        const birthYear = person.date.getFullYear();
        const testDate = new Date(selectedYear, calc.now.getMonth(), calc.now.getDate());
        const personAge = calcAge(person.date, testDate);
        const birthPos = getPos(person.date);
        const isBorn = selectedYear >= birthYear;
        const reachedWedding = Boolean(
          (person.role === 'father' || person.role === 'mother') &&
            weddingYear !== null &&
            weddingPos !== null &&
            selectedYear >= weddingYear
        );

        const roleStyles: Record<
          TimelineRole,
          {
            badgeBg: string;
            roleText: string;
            ageText: string;
            barBg: string;
          }
        > = {
          father: {
            badgeBg:
              'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200/80 dark:border-emerald-800/60',
            roleText: 'text-emerald-700 dark:text-emerald-300',
            ageText: 'text-emerald-800 dark:text-emerald-300',
            barBg: 'bg-emerald-600 dark:bg-emerald-500',
          },
          mother: {
            badgeBg:
              'bg-amber-50 dark:bg-amber-950/60 border-amber-200/80 dark:border-amber-800/60',
            roleText: 'text-amber-700 dark:text-amber-300',
            ageText: 'text-amber-700 dark:text-amber-300',
            barBg: 'bg-amber-500 dark:bg-amber-400',
          },
          son: {
            badgeBg: 'bg-sky-50 dark:bg-sky-950/60 border-sky-200/80 dark:border-sky-800/60',
            roleText: 'text-sky-700 dark:text-sky-300',
            ageText: 'text-sky-700 dark:text-sky-400',
            barBg: 'bg-sky-500 dark:bg-sky-400',
          },
          daughter: {
            badgeBg: 'bg-rose-50 dark:bg-rose-950/60 border-rose-200/80 dark:border-rose-800/60',
            roleText: 'text-rose-700 dark:text-rose-300',
            ageText: 'text-rose-700 dark:text-rose-400',
            barBg: 'bg-rose-500 dark:bg-rose-400',
          },
        };

        const st = roleStyles[person.role];
        const showCustomName = Boolean(person.name && person.name !== person.roleLabel);
        const stageLabel =
          isBorn && !personAge.neg ? getLifeStage(personAge.y) : null;

        const safeWeddingStyle: React.CSSProperties | undefined =
          reachedWedding && weddingPos !== null
            ? weddingPos - birthPos < 16
              ? { right: `${Math.min(84, birthPos + 16)}%` }
              : weddingPos < 10
              ? { right: `${weddingPos}%` }
              : weddingPos > 88
              ? { left: '4px' }
              : { right: `${weddingPos}%`, transform: 'translateX(50%)' }
            : undefined;

        return (
          <div key={person.id} className={compact ? 'space-y-1' : 'space-y-1.5'}>
            <div className="flex justify-between items-center gap-2 text-xs">
              {/* Icon + Explicit Role + Name (+ Stage) */}
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <span
                  aria-hidden="true"
                  className={`${
                    compact ? 'w-5 h-5 text-[11px] rounded-md' : 'w-7 h-7 text-sm rounded-lg'
                  } border flex items-center justify-center leading-none shrink-0 select-none ${
                    st.badgeBg
                  }`}
                >
                  {person.emoji}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 min-w-0">
                    <span className={`text-[11px] font-bold shrink-0 ${st.roleText}`}>
                      {person.roleLabel}
                    </span>
                    {showCustomName && (
                      <>
                        <span
                          className="text-stone-300 dark:text-stone-600 shrink-0"
                          aria-hidden="true"
                        >
                          ·
                        </span>
                        <span className="font-semibold text-[11px] sm:text-xs text-stone-800 dark:text-stone-200 truncate">
                          {person.name}
                        </span>
                      </>
                    )}
                    {compact && stageLabel && (
                      <span className="hidden sm:inline text-[10px] text-stone-400 dark:text-stone-500 truncate">
                        · {stageLabel}
                      </span>
                    )}
                  </div>
                  {!compact && stageLabel && (
                    <div className="text-[10px] text-stone-500 dark:text-stone-400 leading-tight truncate">
                      {stageLabel}
                    </div>
                  )}
                </div>
              </div>

              {/* Calculated Age (+ compact inline stage when concise) */}
              <div className="flex items-center gap-1.5 shrink-0">
                {compact && stageLabel && (
                  <span className="sm:hidden text-[9px] text-stone-400 dark:text-stone-500">
                    {stageLabel} ·
                  </span>
                )}
                <span
                  className={`font-bold tabular-nums shrink-0 ${
                    compact ? 'text-[11px]' : 'text-xs'
                  } ${
                    !isBorn || personAge.neg
                      ? 'text-stone-400 dark:text-stone-500 font-normal italic'
                      : st.ageText
                  }`}
                >
                  {!isBorn
                    ? person.isFemale
                      ? 'لم تُولد بعد'
                      : 'لم يولد بعد'
                    : personAge.neg
                    ? `ميلاد (${birthYear})`
                    : formatAge(personAge)}
                </span>
              </div>
            </div>

            {/* Progress Track */}
            <div
              className={`relative ${
                compact ? 'h-5' : 'h-7'
              } bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden border border-stone-200/70 dark:border-stone-700/70`}
            >
              {weddingPos !== null && (
                <div
                  style={{ right: `${weddingPos}%` }}
                  className="absolute top-0 bottom-0 w-0.5 bg-violet-500/50 dark:bg-violet-400/50 z-10"
                  title={weddingYear ? `سنة الزواج: ${weddingYear}` : 'سنة الزواج'}
                />
              )}

              <div
                style={{ right: `${currentYearPos}%` }}
                className="absolute top-0 bottom-0 w-0.5 bg-stone-900 dark:bg-white z-10"
                title={`السنة المختارة: ${selectedYear}`}
              />

              {isBorn && (
                <div
                  style={{
                    right: `${Math.min(birthPos, 86)}%`,
                    width: `${Math.max(0, currentYearPos - birthPos)}%`,
                    minWidth: compact ? '38px' : '42px',
                    maxWidth: `${Math.max(14, 100 - Math.min(birthPos, 86))}%`,
                  }}
                  className={`absolute top-0 bottom-0 rounded-full transition-colors flex items-center justify-start ${
                    compact ? 'px-1.5' : 'px-2'
                  } ${st.barBg}`}
                >
                  <span
                    className={`${
                      compact ? 'text-[10px]' : 'text-[11px]'
                    } font-extrabold text-white tabular-nums leading-none drop-shadow-xs select-none`}
                  >
                    {birthYear}
                  </span>
                </div>
              )}

              {reachedWedding && weddingYear !== null && safeWeddingStyle && (
                <div
                  style={safeWeddingStyle}
                  className={`absolute top-1/2 -translate-y-1/2 z-20 ${
                    compact ? 'px-1 py-0.5 text-[9px]' : 'px-1.5 py-0.5 text-[10px]'
                  } rounded-full bg-violet-600 dark:bg-violet-500 text-white font-extrabold tabular-nums leading-none shadow-sm border border-white/80 dark:border-stone-900/80 flex items-center gap-0.5 whitespace-nowrap`}
                  title={`سنة الزواج: ${weddingYear}`}
                >
                  <span aria-hidden="true" className={compact ? 'text-[8px]' : 'text-[9px]'}>
                    💍
                  </span>
                  <span>{weddingYear}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Decade / 5-Year Calibration Ruler */}
      <div className="relative h-5 pt-1 border-t border-stone-200/70 dark:border-stone-800 select-none">
        {rulerTicks.map((yr) => {
          const pos = getYearPos(yr);
          if (pos < 4 || pos > 96) return null;
          return (
            <div
              key={yr}
              style={{ right: `${pos}%`, transform: 'translateX(50%)' }}
              className="absolute top-0 flex flex-col items-center"
            >
              <span className="w-px h-1.5 bg-stone-300 dark:bg-stone-600" />
              <span className="text-[9px] font-medium text-stone-400 dark:text-stone-500 tabular-nums leading-none mt-0.5">
                {yr}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Shared Renderer: Color Legend
  const renderLegend = () => (
    <div className="text-[11px] text-stone-500 dark:text-stone-400 pt-2 flex flex-wrap items-center gap-x-3.5 gap-y-1.5 border-t border-stone-100 dark:border-stone-800">
      {calc.fatherDate && (
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600 dark:bg-emerald-500 inline-block" />
          <span>الأب</span>
        </span>
      )}
      {calc.motherDate && (
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 dark:bg-amber-400 inline-block" />
          <span>الأم</span>
        </span>
      )}
      <span className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-sm bg-sky-500 dark:bg-sky-400 inline-block" />
        <span>الأولاد</span>
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 dark:bg-rose-400 inline-block" />
        <span>البنات</span>
      </span>
      {weddingPos !== null && (
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-violet-600 dark:bg-violet-400 inline-block" />
          <span>سنة الزواج (💍)</span>
        </span>
      )}
      <span className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-sm bg-stone-900 dark:bg-white inline-block" />
        <span>السنة المختارة</span>
      </span>
    </div>
  );

  // Shared Renderer: Scrubber Control Box
  const renderScrubberBox = (tight = false) => (
    <div
      className={`bg-stone-50 dark:bg-stone-800/60 ${
        tight ? 'p-2.5 space-y-1.5' : 'p-3 space-y-2.5'
      } rounded-xl border border-stone-200/60 dark:border-stone-800`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-400">
          <Calendar className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          <span>السنة المختارة:</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsPlaying(false);
              onUpdateTimelineYear(Math.max(minYear, selectedYear - 1));
            }}
            type="button"
            aria-label="السنة السابقة"
            className={`${
              tight ? 'min-w-[40px] min-h-[38px]' : 'min-w-[44px] min-h-[44px]'
            } rounded-xl bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-200 flex items-center justify-center border border-stone-200 dark:border-stone-600 shadow-sm active:scale-95 text-xs font-bold`}
          >
            -1
          </button>
          <span
            className={`${
              tight ? 'text-xl' : 'text-2xl'
            } font-black text-teal-700 dark:text-teal-400 tabular-nums px-1.5`}
          >
            {selectedYear}
          </span>
          <button
            onClick={() => {
              setIsPlaying(false);
              onUpdateTimelineYear(Math.min(maxYear, selectedYear + 1));
            }}
            type="button"
            aria-label="السنة التالية"
            className={`${
              tight ? 'min-w-[40px] min-h-[38px]' : 'min-w-[44px] min-h-[44px]'
            } rounded-xl bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-200 flex items-center justify-center border border-stone-200 dark:border-stone-600 shadow-sm active:scale-95 text-xs font-bold`}
          >
            +1
          </button>
        </div>
      </div>

      <div>
        <input
          type="range"
          min={minYear}
          max={maxYear}
          step={1}
          value={selectedYear}
          onChange={(e) => {
            setIsPlaying(false);
            onUpdateTimelineYear(parseInt(e.target.value, 10));
          }}
          aria-label="اختيار السنة على الخط الزمني"
          className="w-full h-2.5 bg-stone-200 dark:bg-stone-700 rounded-lg appearance-none cursor-pointer accent-teal-600 focus:outline-none"
        />
        <div className="flex justify-between text-[10px] text-stone-400 pt-0.5">
          <span className="tabular-nums">{minYear}</span>
          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              onUpdateTimelineYear(currentYear);
            }}
            className="font-semibold text-teal-700 dark:text-teal-400 hover:underline tabular-nums"
          >
            اليوم ({currentYear})
          </button>
          <span className="tabular-nums">{maxYear}</span>
        </div>
      </div>
    </div>
  );

  // Shared Renderer: Story Banner
  const renderStoryBanner = (tight = false) => (
    <div
      className={`rounded-2xl ${
        tight ? 'p-2.5 space-y-1.5' : 'p-3.5 space-y-2.5'
      } border transition-colors ${
        yearSnapshot.isSpecial
          ? 'bg-teal-50/90 dark:bg-teal-950/50 border-teal-300/80 dark:border-teal-700/70'
          : 'bg-stone-50 dark:bg-stone-800/40 border-stone-200/80 dark:border-stone-800'
      }`}
    >
      <div className="flex items-start gap-2">
        <Sparkles
          className={`w-4 h-4 shrink-0 mt-0.5 ${
            yearSnapshot.isSpecial
              ? 'text-teal-600 dark:text-teal-400'
              : 'text-stone-400 dark:text-stone-500'
          }`}
        />
        <p className="text-xs font-semibold text-stone-800 dark:text-stone-200 leading-relaxed">
          {yearSnapshot.headline}
        </p>
      </div>

      <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-stone-200/60 dark:border-stone-700/60 text-[11px]">
        <div className="flex items-center gap-2.5 text-stone-600 dark:text-stone-300 flex-wrap">
          <span className="flex items-center gap-1 tabular-nums">
            <Users className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>مجموع الأعمار:</span>
            <strong className="font-extrabold text-stone-900 dark:text-stone-100">
              {yearSnapshot.totalCombinedYears} سنة
            </strong>
          </span>
          {yearSnapshot.marriageYearsInYear !== null && (
            <span className="tabular-nums text-violet-700 dark:text-violet-300 font-semibold">
              · 💍 {yearSnapshot.marriageYearsInYear} سنة زواج
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleShareYearSnapshot}
          className="min-h-[34px] px-2.5 py-1 rounded-lg bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-teal-700 dark:text-teal-300 font-bold text-[11px] border border-stone-200 dark:border-stone-700 flex items-center gap-1 shrink-0 active:scale-95 transition-colors shadow-2xs"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>مشاركة اللقطة</span>
        </button>
      </div>
    </div>
  );

  // Shared Renderer: Milestone Jump Chips
  const renderMilestoneChips = () => (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
      {milestoneChips.map((chip) => {
        const isActive = selectedYear === chip.year;
        return (
          <button
            key={chip.id}
            type="button"
            onClick={() => {
              setIsPlaying(false);
              onUpdateTimelineYear(chip.year);
            }}
            className={`min-h-[36px] px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap shrink-0 flex items-center gap-1 transition-all active:scale-95 border ${
              isActive
                ? 'bg-teal-600 text-white border-teal-600 shadow-sm shadow-teal-700/20'
                : 'bg-stone-50 dark:bg-stone-800/80 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <span aria-hidden="true" className="text-xs leading-none">
              {chip.emoji}
            </span>
            <span className="tabular-nums">{chip.label}</span>
          </button>
        );
      })}
    </div>
  );

  return (
    <>
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 border border-stone-200 dark:border-stone-800 shadow-sm transition-colors space-y-3.5">
        {/* Header & Play + Speed + Compact + Theater Controls */}
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">
              الخط الزمني التفاعلي للأسرة
            </h2>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              حرّك الزمن من {minYear} حتى {maxYear}
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setCompactOverride(!isCompact)}
              type="button"
              title={isCompact ? 'التبديل للعرض الموسّع' : 'التبديل إلى تصغير العرض'}
              aria-label={isCompact ? 'التبديل للعرض الموسّع' : 'التبديل إلى تصغير العرض'}
              className={`min-w-[40px] min-h-[40px] px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors active:scale-95 border ${
                isCompact
                  ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800/70'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-200'
              }`}
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">{isCompact ? 'تصغير' : 'موسّع'}</span>
            </button>

            <button
              onClick={() => setIsTheaterMode(true)}
              type="button"
              title="فتح وضع المشاهدة الكامل للجوال"
              aria-label="فتح وضع المشاهدة الكامل"
              className="min-w-[40px] min-h-[40px] px-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 text-xs font-bold flex items-center justify-center gap-1 transition-colors active:scale-95"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>مشاهدة</span>
            </button>

            <button
              onClick={() => setSpeed((s) => (s === 1 ? 2 : 1))}
              type="button"
              aria-label="تغيير سرعة العرض"
              className="min-w-[40px] min-h-[40px] px-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 text-xs font-bold flex items-center justify-center gap-0.5 transition-colors active:scale-95 tabular-nums"
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>{speed}x</span>
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              type="button"
              className={`min-h-[40px] px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors active:scale-95 ${
                isPlaying
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                  : 'bg-teal-600 text-white hover:bg-teal-700 shadow-sm shadow-teal-700/20'
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlaying ? 'إيقاف' : 'تشغيل'}</span>
            </button>
          </div>
        </div>

        {/* Milestone Chips */}
        {renderMilestoneChips()}

        {/* Year Scrubber */}
        {renderScrubberBox(false)}

        {/* Story Banner */}
        {renderStoryBanner(false)}

        {/* Bars & Ruler */}
        {renderBarsAndRuler(isCompact)}

        {/* Collapsible Same-Age Generational Mirror */}
        {mirrorChild && mirrorInsights && (
          <div className="rounded-2xl bg-amber-50/60 dark:bg-amber-950/25 border border-amber-200/70 dark:border-amber-900/50 overflow-hidden">
            <button
              type="button"
              onClick={() => setMirrorOpenOverride(!isMirrorOpen)}
              className="w-full min-h-[44px] px-3.5 py-2 flex items-center justify-between gap-2 text-right active:bg-amber-100/40 dark:active:bg-amber-950/40 transition-colors"
            >
              <span className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                <span>🪞</span>
                <span>مرآة الأجيال · عندما كنتُ في عمرك</span>
              </span>
              {isMirrorOpen ? (
                <ChevronUp className="w-4 h-4 text-amber-700 dark:text-amber-300 shrink-0" />
              ) : (
                <ChevronDown className="w-4 h-4 text-amber-700 dark:text-amber-300 shrink-0" />
              )}
            </button>

            {isMirrorOpen && (
              <div className="px-3.5 pb-3.5 pt-1 space-y-2.5 border-t border-amber-200/50 dark:border-amber-900/40">
                {calc.children.length > 1 && (
                  <div className="flex items-center gap-1 overflow-x-auto pt-1">
                    {calc.children.map((ch, idx) => (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => setMirrorChildIdx(idx)}
                        className={`min-h-[32px] px-2.5 rounded-lg text-[11px] font-bold transition-colors whitespace-nowrap shrink-0 ${
                          safeMirrorIdx === idx
                            ? 'bg-amber-600 text-white'
                            : 'bg-white/80 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-amber-200/70 dark:border-stone-700'
                        }`}
                      >
                        {ch.name}
                      </button>
                    ))}
                  </div>
                )}

                <div className="text-xs text-stone-700 dark:text-stone-300 space-y-1.5 leading-relaxed">
                  {mirrorInsights.isChildBorn ? (
                    <div>
                      • في عام <strong className="tabular-nums">{selectedYear}</strong> عمر{' '}
                      <strong>{mirrorChild.name}</strong> ({mirrorInsights.childAgeInSelected} سنة)
                      {mirrorInsights.fatherSameAgeYear !== null && (
                        <>
                          {' '}
                          — كان الأب في هذا العمر عام{' '}
                          <strong className="text-emerald-700 dark:text-emerald-400 tabular-nums">
                            {mirrorInsights.fatherSameAgeYear}
                          </strong>
                        </>
                      )}
                      {mirrorInsights.motherSameAgeYear !== null && (
                        <>
                          {mirrorInsights.fatherSameAgeYear !== null
                            ? ' والأم عام '
                            : ' — كانت الأم في هذا العمر عام '}
                          <strong className="text-amber-700 dark:text-amber-400 tabular-nums">
                            {mirrorInsights.motherSameAgeYear}
                          </strong>
                        </>
                      )}
                      .
                    </div>
                  ) : (
                    <div>
                      • لم يولد <strong>{mirrorChild.name}</strong> بعد في عام{' '}
                      <strong className="tabular-nums">{selectedYear}</strong> (تاريخ الميلاد{' '}
                      <strong className="tabular-nums">
                        {mirrorChild.birthDateObj.getFullYear()}
                      </strong>
                      ).
                    </div>
                  )}

                  {mirrorInsights.childAtFatherMarriageYear !== null &&
                    mirrorInsights.fatherMarriageAge !== null && (
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span>
                          • سيصل <strong>{mirrorChild.name}</strong> إلى عمر الأب يوم زواجه (
                          {mirrorInsights.fatherMarriageAge} سنة) في عام{' '}
                          <strong className="text-violet-700 dark:text-violet-300 tabular-nums">
                            {mirrorInsights.childAtFatherMarriageYear}
                          </strong>
                        </span>
                        {mirrorInsights.childAtFatherMarriageYear >= minYear &&
                          mirrorInsights.childAtFatherMarriageYear <= maxYear &&
                          selectedYear !== mirrorInsights.childAtFatherMarriageYear && (
                            <button
                              type="button"
                              onClick={() => {
                                setIsPlaying(false);
                                onUpdateTimelineYear(mirrorInsights.childAtFatherMarriageYear!);
                              }}
                              className="min-h-[34px] px-2.5 rounded-lg bg-white dark:bg-stone-800 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800/70 text-[11px] font-bold flex items-center gap-1 active:scale-95 transition-colors shrink-0"
                            >
                              <span>اعرض {mirrorInsights.childAtFatherMarriageYear}</span>
                              <ArrowUpLeft className="w-3 h-3" />
                            </button>
                          )}
                      </div>
                    )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Color Legend */}
        {renderLegend()}
      </div>

      {/* Fullscreen Focus / Theater Mode for Mobile Watching */}
      {isTheaterMode && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="وضع المشاهدة الكامل للخط الزمني"
          className="fixed inset-0 z-50 flex flex-col bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)] animate-in fade-in duration-150"
        >
          {/* Sticky Top HUD (Controls + Scrubber + Story Banner never scroll off-screen) */}
          <div className="shrink-0 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 shadow-sm px-3 py-2.5 space-y-2">
            {/* Top Bar */}
            <div className="max-w-2xl mx-auto flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-base leading-none">🕰️</span>
                <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 truncate">
                  وضع مشاهدة الخط الزمني
                </h2>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => setCompactOverride(!isCompact)}
                  type="button"
                  title={isCompact ? 'عرض موسّع' : 'تصغير'}
                  aria-label={isCompact ? 'عرض موسّع' : 'تصغير'}
                  className={`min-w-[40px] min-h-[40px] px-2 rounded-xl text-xs font-bold flex items-center justify-center border transition-colors ${
                    isCompact
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800/70'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setSpeed((s) => (s === 1 ? 2 : 1))}
                  type="button"
                  className="min-w-[40px] min-h-[40px] px-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-bold flex items-center justify-center gap-0.5 tabular-nums"
                >
                  <FastForward className="w-3.5 h-3.5" />
                  <span>{speed}x</span>
                </button>

                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  type="button"
                  className={`min-h-[40px] px-3 rounded-xl text-xs font-bold flex items-center gap-1 active:scale-95 transition-colors ${
                    isPlaying
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                      : 'bg-teal-600 text-white hover:bg-teal-700'
                  }`}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isPlaying ? 'إيقاف' : 'تشغيل'}</span>
                </button>

                <button
                  onClick={() => setIsTheaterMode(false)}
                  type="button"
                  aria-label="إغلاق وضع المشاهدة"
                  className="min-w-[40px] min-h-[40px] rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Pinned Scrubber & Story Banner */}
            <div className="max-w-2xl mx-auto space-y-2">
              {renderScrubberBox(true)}
              {renderStoryBanner(true)}
            </div>
          </div>

          {/* Scrollable Family Bars Canvas */}
          <div className="flex-1 overflow-y-auto px-3 py-3">
            <div className="max-w-2xl mx-auto space-y-3">
              {renderMilestoneChips()}
              <div className="bg-white dark:bg-stone-900 rounded-2xl p-3 border border-stone-200 dark:border-stone-800 shadow-xs space-y-2.5">
                {renderBarsAndRuler(isCompact)}
                {renderLegend()}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
