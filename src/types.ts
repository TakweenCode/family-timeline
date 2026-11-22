export type Gender = 'm' | 'f';

export interface Child {
  id: string;
  name: string;
  gender: Gender;
  birthDate: string; // YYYY-MM-DD
}

export interface FamilyState {
  fatherName: string;
  fatherBirth: string; // YYYY-MM-DD
  motherName: string;
  motherBirth: string; // YYYY-MM-DD
  weddingDate: string; // YYYY-MM-DD
  children: Child[];
  selectedYear?: number;
}

export interface AgeObject {
  y: number;
  m: number;
  d: number;
  neg: boolean;
}

export interface ChildCalculation {
  id: string;
  name: string;
  gender: Gender;
  birthDate: string;
  birthDateObj: Date;
  weekdayName: string;
  formattedDate: string;
  currentAge: AgeObject;
  fatherAgeAtBirth: AgeObject | null;
  motherAgeAtBirth: AgeObject | null;
  timeSinceWedding: AgeObject | null;
  gapFromElderSibling: AgeObject | null;
  elderSiblingName?: string;
}

export interface FamilyCalculations {
  now: Date;
  fatherDate: Date | null;
  motherDate: Date | null;
  weddingDate: Date | null;
  fatherAge: AgeObject | null;
  motherAge: AgeObject | null;
  marriageDuration: AgeObject | null;
  nextAnniversary: Date | null;
  daysUntilAnniversary: number | null;
  parentsAgeDiff: {
    diff: AgeObject;
    elder: 'father' | 'mother' | 'same';
  } | null;
  fatherAgeAtMarriage: AgeObject | null;
  motherAgeAtMarriage: AgeObject | null;
  children: ChildCalculation[];
  boysCount: number;
  girlsCount: number;
  avgFatherAgeAtChild: number | null;
  avgMotherAgeAtChild: number | null;
  avgChildSpacing: number | null;
  maxChildSpacing: number | null;
  minChildSpacing: number | null;
  oldestToYoungestGap: AgeObject | null;
  timelineMinYear: number;
  timelineMaxYear: number;
}

export type TabType = 'home' | 'analytics' | 'entry' | 'report';
