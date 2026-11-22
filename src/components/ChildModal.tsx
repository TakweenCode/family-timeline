import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Sparkles } from 'lucide-react';
import { Child, Gender } from '../types';
import { calcAge, formatAge, parseDate } from '../utils/calc';

interface ChildModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (child: { id?: string; name: string; gender: Gender; birthDate: string }) => void;
  initialChild?: Child | null;
}

export const ChildModal: React.FC<ChildModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialChild,
}) => {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender>('m');
  const [birthDate, setBirthDate] = useState('');
  const [error, setError] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (initialChild) {
      setName(initialChild.name || '');
      setGender(initialChild.gender || 'm');
      setBirthDate(initialChild.birthDate || '');
    } else {
      setName('');
      setGender('m');
      setBirthDate('');
    }
    setError(null);
  }, [initialChild, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!birthDate) {
      setError('يرجى تحديد تاريخ ميلاد الابن أو الابنة');
      return;
    }

    onSave({
      id: initialChild?.id,
      name: name.trim() || (gender === 'm' ? 'ابن' : 'ابنة'),
      gender,
      birthDate,
    });
    onClose();
  };

  // Preview age
  const parsedDate = parseDate(birthDate);
  const previewAge = parsedDate ? calcAge(parsedDate, new Date()) : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg bg-white dark:bg-stone-900 rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl border-t sm:border border-stone-200 dark:border-stone-800 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] transition-colors max-h-[90vh] overflow-y-auto">
        {/* Drag handle affordance on mobile */}
        <div className="w-10 h-1.5 bg-stone-300 dark:bg-stone-700 rounded-full mx-auto mb-4 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <span className="text-xl">{gender === 'm' ? '👦' : '👧'}</span>
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
              {initialChild ? 'تعديل بيانات الابن / الابنة' : 'إضافة ابن أو ابنة جديدة'}
            </h2>
          </div>
          <button
            onClick={onClose}
            type="button"
            aria-label="إغلاق"
            className="min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
              اسم الابن أو الابنة
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: عمر، مريم، يوسف..."
                autoFocus
                className="w-full h-12 px-3.5 pr-10 text-stone-900 dark:text-stone-100 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-base sm:text-sm font-medium transition-colors"
              />
              <User className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
              الجنس
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setGender('m')}
                className={`min-h-[46px] rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all border ${
                  gender === 'm'
                    ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-700 ring-2 ring-sky-500/20'
                    : 'bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-700'
                }`}
              >
                <span className="text-lg">👦</span>
                <span>ذكر</span>
              </button>
              <button
                type="button"
                onClick={() => setGender('f')}
                className={`min-h-[46px] rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all border ${
                  gender === 'f'
                    ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-700 ring-2 ring-rose-500/20'
                    : 'bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-700'
                }`}
              >
                <span className="text-lg">👧</span>
                <span>أنثى</span>
              </button>
            </div>
          </div>

          {/* Birth Date */}
          <div>
            <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
              تاريخ الميلاد <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={birthDate}
                max={todayStr}
                onChange={(e) => {
                  setBirthDate(e.target.value);
                  setError(null);
                }}
                className="w-full h-12 px-3.5 pr-10 text-stone-900 dark:text-stone-100 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-base sm:text-sm font-medium transition-colors"
                required
              />
              <Calendar className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Live Age Preview */}
            {previewAge && (
              <div className="mt-2 p-2.5 rounded-xl bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200/60 dark:border-teal-800/40 flex items-center gap-2 text-xs text-teal-800 dark:text-teal-200">
                <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                <span>
                  العمر الحالي المحسوب:{' '}
                  <strong className="font-bold">{formatAge(previewAge, true)}</strong>
                </span>
              </div>
            )}
          </div>

          {error && (
            <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="submit"
              className="flex-1 min-h-[46px] rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white font-bold text-sm shadow-md shadow-teal-700/20 transition-all flex items-center justify-center"
            >
              {initialChild ? 'حفظ التعديلات' : 'إضافة الابن'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="min-h-[46px] px-5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 font-semibold text-sm hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
