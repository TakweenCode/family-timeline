import { FamilyState } from '../types';

const STORAGE_KEY = 'family_data_mobile_v2';
const THEME_KEY = 'family_app_theme';

export const EMPTY_FAMILY_STATE: FamilyState = {
  fatherName: '',
  fatherBirth: '',
  motherName: '',
  motherBirth: '',
  weddingDate: '',
  children: [],
  selectedYear: new Date().getFullYear(),
};

/**
 * Realistic Arabic family sample dataset for quick testing and preview
 */
export const SAMPLE_FAMILY_STATE: FamilyState = {
  fatherName: 'عبدالرحمن المحمد',
  fatherBirth: '1985-04-12',
  motherName: 'فاطمة العلي',
  motherBirth: '1988-09-23',
  weddingDate: '2012-07-14',
  children: [
    {
      id: 'demo-1',
      name: 'عمر',
      gender: 'm',
      birthDate: '2013-11-05',
    },
    {
      id: 'demo-2',
      name: 'مريم',
      gender: 'f',
      birthDate: '2016-04-18',
    },
    {
      id: 'demo-3',
      name: 'يوسف',
      gender: 'm',
      birthDate: '2019-10-30',
    },
    {
      id: 'demo-4',
      name: 'سارة',
      gender: 'f',
      birthDate: '2023-02-14',
    },
  ],
  selectedYear: new Date().getFullYear(),
};

export function loadFamilyState(): FamilyState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_FAMILY_STATE;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return {
        fatherName: typeof parsed.fatherName === 'string' ? parsed.fatherName : '',
        fatherBirth: typeof parsed.fatherBirth === 'string' ? parsed.fatherBirth : '',
        motherName: typeof parsed.motherName === 'string' ? parsed.motherName : '',
        motherBirth: typeof parsed.motherBirth === 'string' ? parsed.motherBirth : '',
        weddingDate: typeof parsed.weddingDate === 'string' ? parsed.weddingDate : '',
        children: Array.isArray(parsed.children)
          ? parsed.children.map((c: any, idx: number) => ({
              id: typeof c.id === 'string' ? c.id : `child-${idx}-${Date.now()}`,
              name: typeof c.name === 'string' ? c.name : '',
              gender: c.gender === 'f' ? 'f' : 'm',
              birthDate: typeof c.birthDate === 'string' ? c.birthDate : '',
            }))
          : [],
        selectedYear: typeof parsed.selectedYear === 'number' ? parsed.selectedYear : new Date().getFullYear(),
      };
    }
  } catch (err) {
    console.error('Failed to load family state from localStorage', err);
  }
  return EMPTY_FAMILY_STATE;
}

export function saveFamilyState(state: FamilyState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save family state to localStorage', err);
  }
}

export function exportBackupJSON(state: FamilyState): string {
  return JSON.stringify(
    {
      app: 'family-data-mobile',
      version: 2,
      exportedAt: new Date().toISOString(),
      data: state,
    },
    null,
    2
  );
}

export function importBackupJSON(jsonStr: string): FamilyState {
  const parsed = JSON.parse(jsonStr.trim());
  const data = parsed.data || parsed; // support both structured and direct
  if (!data || typeof data !== 'object') {
    throw new Error('صيغة النسخة الاحتياطية غير صالحة');
  }

  const clean: FamilyState = {
    fatherName: typeof data.fatherName === 'string' ? data.fatherName.slice(0, 80) : '',
    fatherBirth: typeof data.fatherBirth === 'string' ? data.fatherBirth.slice(0, 10) : '',
    motherName: typeof data.motherName === 'string' ? data.motherName.slice(0, 80) : '',
    motherBirth: typeof data.motherBirth === 'string' ? data.motherBirth.slice(0, 10) : '',
    weddingDate: typeof data.weddingDate === 'string' ? data.weddingDate.slice(0, 10) : '',
    children: Array.isArray(data.children)
      ? data.children.map((c: any, idx: number) => ({
          id: typeof c.id === 'string' ? c.id : `restored-${idx}-${Date.now()}`,
          name: typeof c.name === 'string' ? c.name.slice(0, 80) : '',
          gender: c.gender === 'f' ? 'f' : 'm',
          birthDate: typeof c.birthDate === 'string' ? c.birthDate.slice(0, 10) : '',
        }))
      : [],
    selectedYear: typeof data.selectedYear === 'number' ? data.selectedYear : new Date().getFullYear(),
  };

  return clean;
}

export function downloadFile(filename: string, content: string, mimeType = 'application/json'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function getStoredTheme(): 'light' | 'dark' {
  try {
    const t = localStorage.getItem(THEME_KEY);
    if (t === 'light' || t === 'dark') return t;
  } catch (e) {}
  if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

export function setStoredTheme(theme: 'light' | 'dark'): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (e) {}
}
