import { AgeObject, Child, ChildCalculation, FamilyCalculations, FamilyState } from '../types';

/**
 * Parses YYYY-MM-DD string to local Date object at midnight
 */
export function parseDate(dateStr?: string): Date | null {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

/**
 * Calculates exact age/duration between two dates (years, months, days)
 */
export function calcAge(start: Date, end: Date): AgeObject {
  if (end < start) {
    const rev = calcAge(end, start);
    return { ...rev, neg: true };
  }

  let y = end.getFullYear() - start.getFullYear();
  let m = end.getMonth() - start.getMonth();
  let d = end.getDate() - start.getDate();

  if (d < 0) {
    m--;
    // Get last day of previous month
    const prevMonthLastDay = new Date(end.getFullYear(), end.getMonth(), 0).getDate();
    d += prevMonthLastDay;
  }

  if (m < 0) {
    y--;
    m += 12;
  }

  return { y, m, d, neg: false };
}

/**
 * Formats an AgeObject into natural Arabic text
 */
export function formatAge(age: AgeObject | null | undefined, showDays = false): string {
  if (!age) return '—';
  if (age.neg) return 'لم يولد بعد';

  const parts: string[] = [];

  if (age.y > 0) {
    if (age.y === 1) parts.push('سنة واحدة');
    else if (age.y === 2) parts.push('سنتان');
    else if (age.y >= 3 && age.y <= 10) parts.push(`${age.y} سنوات`);
    else parts.push(`${age.y} سنة`);
  }

  if (age.m > 0) {
    if (age.m === 1) parts.push('شهر واحد');
    else if (age.m === 2) parts.push('شهران');
    else if (age.m >= 3 && age.m <= 10) parts.push(`${age.m} أشهر`);
    else parts.push(`${age.m} شهر`);
  }

  if ((showDays || parts.length === 0) && age.d > 0) {
    if (age.d === 1) parts.push('يوم واحد');
    else if (age.d === 2) parts.push('يومان');
    else if (age.d >= 3 && age.d <= 10) parts.push(`${age.d} أيام`);
    else parts.push(`${age.d} يوم`);
  }

  if (parts.length === 0) {
    return 'حديث الولادة';
  }

  return parts.join(' و ');
}

/**
 * Returns age in fractional decimal years (e.g. 24.5)
 */
export function ageInYears(age: AgeObject | null | undefined): number | null {
  if (!age || age.neg) return null;
  return age.y + age.m / 12 + age.d / 365.25;
}

/**
 * Rounds a number to one decimal place
 */
export function round1(num: number): number {
  return Math.round(num * 10) / 10;
}

/**
 * Formats fractional years as text (e.g. "2.4 سنة")
 */
export function formatYearsDecimal(years: number | null | undefined): string {
  if (years === null || years === undefined || isNaN(years)) return '—';
  return `${round1(years)} سنة`;
}

/**
 * Formats date into Arabic weekday name
 */
export function formatWeekday(d: Date): string {
  return d.toLocaleDateString('ar-u-ca-gregory-nu-latn', { weekday: 'long' });
}

/**
 * Formats date into Arabic full Gregorian date (e.g. "15 مارس 2018")
 */
export function formatDateArabic(d: Date): string {
  return d.toLocaleDateString('ar-u-ca-gregory-nu-latn', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Calculate full family calculations
 */
export function calculateFamily(state: FamilyState): FamilyCalculations {
  const realNow = new Date();
  const now = new Date(realNow.getFullYear(), realNow.getMonth(), realNow.getDate(), 0, 0, 0, 0);

  const fatherDate = parseDate(state.fatherBirth);
  const motherDate = parseDate(state.motherBirth);
  const weddingDate = parseDate(state.weddingDate);

  const fatherAge = fatherDate ? calcAge(fatherDate, now) : null;
  const motherAge = motherDate ? calcAge(motherDate, now) : null;
  const marriageDuration = weddingDate ? calcAge(weddingDate, now) : null;

  // Next wedding anniversary
  let nextAnniversary: Date | null = null;
  let daysUntilAnniversary: number | null = null;
  if (weddingDate) {
    let nx = new Date(now.getFullYear(), weddingDate.getMonth(), weddingDate.getDate(), 0, 0, 0, 0);
    if (nx < now) {
      nx = new Date(now.getFullYear() + 1, weddingDate.getMonth(), weddingDate.getDate(), 0, 0, 0, 0);
    }
    nextAnniversary = nx;
    daysUntilAnniversary = Math.round((nx.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  // Parents age difference
  let parentsAgeDiff: { diff: AgeObject; elder: 'father' | 'mother' | 'same' } | null = null;
  if (fatherDate && motherDate) {
    if (fatherDate.getTime() < motherDate.getTime()) {
      parentsAgeDiff = {
        diff: calcAge(fatherDate, motherDate),
        elder: 'father',
      };
    } else if (motherDate.getTime() < fatherDate.getTime()) {
      parentsAgeDiff = {
        diff: calcAge(motherDate, fatherDate),
        elder: 'mother',
      };
    } else {
      parentsAgeDiff = {
        diff: { y: 0, m: 0, d: 0, neg: false },
        elder: 'same',
      };
    }
  }

  // Parents age at marriage
  const fatherAgeAtMarriage = fatherDate && weddingDate ? calcAge(fatherDate, weddingDate) : null;
  const motherAgeAtMarriage = motherDate && weddingDate ? calcAge(motherDate, weddingDate) : null;

  // Process and sort children by birthdate
  const validChildren = (state.children || [])
    .filter((k) => !!k.birthDate && !!parseDate(k.birthDate))
    .map((k) => ({
      ...k,
      birthDateObj: parseDate(k.birthDate)!,
    }))
    .sort((a, b) => a.birthDateObj.getTime() - b.birthDateObj.getTime());

  const fatherAgesAtBirthYears: number[] = [];
  const motherAgesAtBirthYears: number[] = [];
  const spacingGapsYears: number[] = [];

  const children: ChildCalculation[] = validChildren.map((k, idx) => {
    const currentAge = calcAge(k.birthDateObj, now);
    const fatherAgeAtBirth = fatherDate ? calcAge(fatherDate, k.birthDateObj) : null;
    const motherAgeAtBirth = motherDate ? calcAge(motherDate, k.birthDateObj) : null;
    const timeSinceWedding = weddingDate ? calcAge(weddingDate, k.birthDateObj) : null;

    if (fatherAgeAtBirth && !fatherAgeAtBirth.neg) {
      const fYears = ageInYears(fatherAgeAtBirth);
      if (fYears !== null) fatherAgesAtBirthYears.push(fYears);
    }

    if (motherAgeAtBirth && !motherAgeAtBirth.neg) {
      const mYears = ageInYears(motherAgeAtBirth);
      if (mYears !== null) motherAgesAtBirthYears.push(mYears);
    }

    let gapFromElderSibling: AgeObject | null = null;
    let elderSiblingName: string | undefined = undefined;

    if (idx > 0) {
      const elder = validChildren[idx - 1];
      gapFromElderSibling = calcAge(elder.birthDateObj, k.birthDateObj);
      elderSiblingName = elder.name || `الابن ${idx}`;
      const gapYears = ageInYears(gapFromElderSibling);
      if (gapYears !== null && gapYears >= 0) {
        spacingGapsYears.push(gapYears);
      }
    }

    return {
      id: k.id,
      name: k.name || `ابن ${idx + 1}`,
      gender: k.gender,
      birthDate: k.birthDate,
      birthDateObj: k.birthDateObj,
      weekdayName: formatWeekday(k.birthDateObj),
      formattedDate: formatDateArabic(k.birthDateObj),
      currentAge,
      fatherAgeAtBirth,
      motherAgeAtBirth,
      timeSinceWedding,
      gapFromElderSibling,
      elderSiblingName,
    };
  });

  const boysCount = children.filter((c) => c.gender === 'm').length;
  const girlsCount = children.filter((c) => c.gender === 'f').length;

  const avgFatherAgeAtChild =
    fatherAgesAtBirthYears.length > 0
      ? fatherAgesAtBirthYears.reduce((a, b) => a + b, 0) / fatherAgesAtBirthYears.length
      : null;

  const avgMotherAgeAtChild =
    motherAgesAtBirthYears.length > 0
      ? motherAgesAtBirthYears.reduce((a, b) => a + b, 0) / motherAgesAtBirthYears.length
      : null;

  const avgChildSpacing =
    spacingGapsYears.length > 0
      ? spacingGapsYears.reduce((a, b) => a + b, 0) / spacingGapsYears.length
      : null;

  const maxChildSpacing =
    spacingGapsYears.length > 0 ? Math.max(...spacingGapsYears) : null;

  const minChildSpacing =
    spacingGapsYears.length > 0 ? Math.min(...spacingGapsYears) : null;

  const oldestToYoungestGap =
    children.length > 1
      ? calcAge(children[0].birthDateObj, children[children.length - 1].birthDateObj)
      : null;

  // Timeline year bounds
  const allYears: number[] = [];
  if (fatherDate) allYears.push(fatherDate.getFullYear());
  if (motherDate) allYears.push(motherDate.getFullYear());
  if (weddingDate) allYears.push(weddingDate.getFullYear());
  children.forEach((c) => allYears.push(c.birthDateObj.getFullYear()));

  const currentYear = now.getFullYear();
  const timelineMinYear = allYears.length > 0 ? Math.min(...allYears) : currentYear - 30;
  const timelineMaxYear = Math.max(2050, currentYear + 24, timelineMinYear + 25);

  return {
    now,
    fatherDate,
    motherDate,
    weddingDate,
    fatherAge,
    motherAge,
    marriageDuration,
    nextAnniversary,
    daysUntilAnniversary,
    parentsAgeDiff,
    fatherAgeAtMarriage,
    motherAgeAtMarriage,
    children,
    boysCount,
    girlsCount,
    avgFatherAgeAtChild,
    avgMotherAgeAtChild,
    avgChildSpacing,
    maxChildSpacing,
    minChildSpacing,
    oldestToYoungestGap,
    timelineMinYear,
    timelineMaxYear,
  };
}

/**
 * Builds formatted text report ready for sharing, WhatsApp or copying
 */
export function generateTextReport(state: FamilyState, c: FamilyCalculations): string {
  const lines: string[] = [];
  lines.push('📋 تقرير بيانات الأسرة');
  lines.push(`📅 التاريخ: ${formatDateArabic(c.now)}`);
  lines.push('────────────────────────');

  if (state.fatherName || c.fatherDate) {
    const fAge = c.fatherAge ? ` (العمر الحالي: ${formatAge(c.fatherAge, true)})` : '';
    const fDate = c.fatherDate ? ` - ميلاده: ${formatDateArabic(c.fatherDate)}` : '';
    lines.push(`👨 الأب: ${state.fatherName || 'بدون اسم'}${fAge}${fDate}`);
  }

  if (state.motherName || c.motherDate) {
    const mAge = c.motherAge ? ` (العمر الحالي: ${formatAge(c.motherAge, true)})` : '';
    const mDate = c.motherDate ? ` - ميلادها: ${formatDateArabic(c.motherDate)}` : '';
    lines.push(`👩 الأم: ${state.motherName || 'بدون اسم'}${mAge}${mDate}`);
  }

  if (c.parentsAgeDiff && c.parentsAgeDiff.diff) {
    const who =
      c.parentsAgeDiff.elder === 'father'
        ? 'الأب أكبر'
        : c.parentsAgeDiff.elder === 'mother'
        ? 'الأم أكبر'
        : 'متطابقان في العمر';
    lines.push(`⚖️ فارق العمر بين الزوجين: ${formatAge(c.parentsAgeDiff.diff)} (${who})`);
  }

  if (c.weddingDate) {
    lines.push('────────────────────────');
    lines.push(`💍 تاريخ الزواج: ${formatDateArabic(c.weddingDate)} (${formatWeekday(c.weddingDate)})`);
    if (c.marriageDuration && !c.marriageDuration.neg) {
      lines.push(`⏳ مدة الزواج: ${formatAge(c.marriageDuration, true)}`);
    }
    if (c.daysUntilAnniversary !== null) {
      if (c.daysUntilAnniversary === 0) {
        lines.push('🎉 اليوم هو ذكرى الزواج السنوية!');
      } else {
        lines.push(`🎈 الذكرى السنوية القادمة بعد: ${c.daysUntilAnniversary} يوماً (${formatDateArabic(c.nextAnniversary!)})`);
      }
    }
    if (c.fatherAgeAtMarriage) {
      lines.push(`• عمر الأب عند الزواج: ${formatAge(c.fatherAgeAtMarriage)}`);
    }
    if (c.motherAgeAtMarriage) {
      lines.push(`• عمر الأم عند الزواج: ${formatAge(c.motherAgeAtMarriage)}`);
    }
  }

  if (c.children.length > 0) {
    lines.push('────────────────────────');
    lines.push(`👶 الأبناء (${c.children.length}) [${c.boysCount} ذكور · ${c.girlsCount} إناث]:`);

    c.children.forEach((k, idx) => {
      const genderIcon = k.gender === 'm' ? '👦' : '👧';
      const order = `${idx + 1}.`;
      lines.push(`\n${order} ${genderIcon} ${k.name} (${formatAge(k.currentAge, true)})`);
      lines.push(`   • وُلد يوم ${k.weekdayName} الموافق ${k.formattedDate}`);

      if (k.fatherAgeAtBirth) {
        lines.push(`   • عمر الأب عند ولادته: ${formatAge(k.fatherAgeAtBirth)}`);
      }
      if (k.motherAgeAtBirth) {
        lines.push(`   • عمر الأم عند ولادتها: ${formatAge(k.motherAgeAtBirth)}`);
      }
      if (k.timeSinceWedding) {
        if (k.timeSinceWedding.neg) {
          lines.push(`   • قبل الزواج`);
        } else {
          lines.push(`   • بعد الزواج بـ: ${formatAge(k.timeSinceWedding)}`);
        }
      }
      if (k.gapFromElderSibling && k.elderSiblingName) {
        lines.push(`   • الفارق عن ${k.elderSiblingName}: ${formatAge(k.gapFromElderSibling)}`);
      }
    });

    lines.push('\n📊 إحصائيات الإنجاب والمباعدة:');
    if (c.avgFatherAgeAtChild) {
      lines.push(`• متوسط عمر الأب عند الإنجاب: ${formatYearsDecimal(c.avgFatherAgeAtChild)}`);
    }
    if (c.avgMotherAgeAtChild) {
      lines.push(`• متوسط عمر الأم عند الإنجاب: ${formatYearsDecimal(c.avgMotherAgeAtChild)}`);
    }
    if (c.avgChildSpacing) {
      lines.push(`• متوسط المباعدة بين الولادات: ${formatYearsDecimal(c.avgChildSpacing)}`);
    }
    if (c.maxChildSpacing) {
      lines.push(`• أكبر فارق بين ولادتين: ${formatYearsDecimal(c.maxChildSpacing)}`);
    }
    if (c.minChildSpacing) {
      lines.push(`• أصغر فارق بين ولادتين: ${formatYearsDecimal(c.minChildSpacing)}`);
    }
    if (c.oldestToYoungestGap) {
      lines.push(`• الفارق بين الابن الأكبر والأصغر: ${formatAge(c.oldestToYoungestGap)}`);
    }
  }

  lines.push('────────────────────────');
  lines.push('🔒 تم إنشاؤه عبر تطبيق بيانات الأسرة للجوال (بياناتك محفوظة على جهازك فقط)');
  return lines.join('\n');
}
