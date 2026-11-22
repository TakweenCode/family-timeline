import React, { useState } from 'react';
import {
  User,
  Calendar,
  Heart,
  Plus,
  Trash2,
  Edit2,
  Copy,
  Download,
  Upload,
  AlertTriangle,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Child, FamilyCalculations, FamilyState, Gender } from '../types';
import { formatAge } from '../utils/calc';
import { exportBackupJSON, downloadFile } from '../utils/storage';

interface EntryTabProps {
  state: FamilyState;
  calc: FamilyCalculations;
  onUpdateField: (field: keyof FamilyState, value: any) => void;
  onOpenAddChild: (childToEdit?: Child) => void;
  onDeleteChild: (id: string) => void;
  onRestoreBackup: (jsonStr: string) => void;
  onWipeAll: () => void;
  onLoadSample: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const EntryTab: React.FC<EntryTabProps> = ({
  state,
  calc,
  onUpdateField,
  onOpenAddChild,
  onDeleteChild,
  onRestoreBackup,
  onWipeAll,
  onLoadSample,
  onShowToast,
}) => {
  const [restoreText, setRestoreText] = useState('');
  const [showWipeConfirm, setShowWipeConfirm] = useState(false);
  const [childToDelete, setChildToDelete] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const handleCopyBackup = async () => {
    const json = exportBackupJSON(state);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(json);
        onShowToast('تم نسخ النسخة الاحتياطية للحافظة بنجاح', 'success');
      } else {
        onShowToast('تعذّر النسخ التلقائي، يمكنك نسخ النص يدوياً', 'info');
      }
    } catch {
      onShowToast('تعذّر النسخ التلقائي، يمكنك تحميل ملف النسخة', 'error');
    }
  };

  const handleDownloadBackup = () => {
    const json = exportBackupJSON(state);
    const dateStr = new Date().toISOString().split('T')[0];
    downloadFile(`family-backup-${dateStr}.json`, json, 'application/json');
    onShowToast('تم تنزيل ملف النسخة الاحتياطية', 'success');
  };

  const handleRestoreFromText = () => {
    if (!restoreText.trim()) {
      onShowToast('يرجى لصق نص النسخة الاحتياطية أولاً', 'error');
      return;
    }
    try {
      onRestoreBackup(restoreText);
      setRestoreText('');
      onShowToast('تمت استعادة البيانات بنجاح!', 'success');
    } catch (e: any) {
      onShowToast(e.message || 'النص غير صالح كنسخة احتياطية', 'error');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        onRestoreBackup(text);
        onShowToast('تمت استعادة البيانات من الملف بنجاح!', 'success');
      } catch (err: any) {
        onShowToast(err.message || 'الملف غير صالح كنسخة احتياطية', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-5 pb-24">
      {/* Parents & Marriage Section */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 border border-stone-200 dark:border-stone-800 shadow-sm transition-colors space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
          <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
            <span>الأبوان وعقد الزواج</span>
          </h2>
          <span className="text-[11px] text-stone-400">البيانات تُحفظ تلقائياً</span>
        </div>

        {/* Father fields */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1">
              <span>👨</span>
              <span>بيانات الأب</span>
            </label>
            {calc.fatherAge && !calc.fatherAge.neg && (
              <span className="text-[11px] font-bold text-teal-700 dark:text-teal-400">
                العمر: {formatAge(calc.fatherAge, true)}
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="relative">
              <input
                type="text"
                value={state.fatherName}
                onChange={(e) => onUpdateField('fatherName', e.target.value)}
                placeholder="اسم الأب..."
                className="w-full h-12 px-3 pr-9 text-base sm:text-sm font-medium text-stone-900 dark:text-stone-100 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <User className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <div className="relative">
              <input
                type="date"
                value={state.fatherBirth}
                max={todayStr}
                onChange={(e) => onUpdateField('fatherBirth', e.target.value)}
                className="w-full h-12 px-3 pr-9 text-base sm:text-sm font-medium text-stone-900 dark:text-stone-100 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <Calendar className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Mother fields */}
        <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1">
              <span>👩</span>
              <span>بيانات الأم</span>
            </label>
            {calc.motherAge && !calc.motherAge.neg && (
              <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400">
                العمر: {formatAge(calc.motherAge, true)}
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="relative">
              <input
                type="text"
                value={state.motherName}
                onChange={(e) => onUpdateField('motherName', e.target.value)}
                placeholder="اسم الأم..."
                className="w-full h-12 px-3 pr-9 text-base sm:text-sm font-medium text-stone-900 dark:text-stone-100 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <User className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <div className="relative">
              <input
                type="date"
                value={state.motherBirth}
                max={todayStr}
                onChange={(e) => onUpdateField('motherBirth', e.target.value)}
                className="w-full h-12 px-3 pr-9 text-base sm:text-sm font-medium text-stone-900 dark:text-stone-100 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <Calendar className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Marriage Date */}
        <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              <span>تاريخ الزواج</span>
            </label>
            {calc.marriageDuration && !calc.marriageDuration.neg && (
              <span className="text-[11px] font-bold text-teal-700 dark:text-teal-400">
                المدة: {formatAge(calc.marriageDuration)}
              </span>
            )}
          </div>
          <div className="relative max-w-sm">
            <input
              type="date"
              value={state.weddingDate}
              max={todayStr}
              onChange={(e) => onUpdateField('weddingDate', e.target.value)}
              className="w-full h-12 px-3 pr-9 text-base sm:text-sm font-medium text-stone-900 dark:text-stone-100 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <Calendar className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Children List Management */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 border border-stone-200 dark:border-stone-800 shadow-sm transition-colors space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
          <div>
            <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">
              قائمة الأبناء ({state.children?.length || 0})
            </h2>
            <span className="text-[11px] text-stone-400">
              يتم ترتيبهم تلقائياً حسب تاريخ الميلاد في شاشات الحساب
            </span>
          </div>
          <button
            onClick={() => onOpenAddChild()}
            type="button"
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-xs font-bold transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة ابن</span>
          </button>
        </div>

        {/* Children Rows */}
        {(!state.children || state.children.length === 0) ? (
          <div className="py-6 text-center space-y-2">
            <div className="text-2xl">👶</div>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              لم تتم إضافة أي ابن أو ابنة حتى الآن.
            </p>
            <button
              onClick={() => onOpenAddChild()}
              type="button"
              className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 dark:text-teal-400"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة الابن الأول</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {state.children.map((child, idx) => (
              <div
                key={child.id}
                className="flex items-center justify-between p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/70 dark:border-stone-800 transition-colors"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className="text-lg shrink-0">
                    {child.gender === 'f' ? '👧' : '👦'}
                  </span>
                  <div className="truncate">
                    <div className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
                      {child.name || `ابن ${idx + 1}`}
                    </div>
                    <div className="text-[11px] text-stone-500 dark:text-stone-400">
                      {child.birthDate || 'لم يحدد تاريخ الميلاد'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onOpenAddChild(child)}
                    type="button"
                    className="min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors active:scale-95"
                    title="تعديل بيانات الابن"
                    aria-label="تعديل بيانات الابن"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setChildToDelete(child.id)}
                    type="button"
                    className="min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors active:scale-95"
                    title="حذف الابن"
                    aria-label="حذف الابن"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Backup, Restore & Data Management */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 border border-stone-200 dark:border-stone-800 shadow-sm transition-colors space-y-4">
        <div>
          <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">
            النسخ الاحتياطي والاستعادة
          </h2>
          <p className="text-[11px] text-stone-500 dark:text-stone-400">
            بياناتك محفوظة على هذا الجهاز فقط. احفظ نسخة لتنقلها إلى جهاز آخر أو لاستعادتها.
          </p>
        </div>

        {/* Backup Actions */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleCopyBackup}
            type="button"
            className="min-h-[42px] px-3 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 active:scale-95 text-stone-800 dark:text-stone-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-stone-200 dark:border-stone-700"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>نسخ البيانات</span>
          </button>
          <button
            onClick={handleDownloadBackup}
            type="button"
            className="min-h-[42px] px-3 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 active:scale-95 text-stone-800 dark:text-stone-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-stone-200 dark:border-stone-700"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تنزيل ملف .json</span>
          </button>
        </div>

        {/* Restore Section */}
        <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800">
          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
            استعادة من نص النسخة الاحتياطية
          </label>
          <textarea
            value={restoreText}
            onChange={(e) => setRestoreText(e.target.value)}
            placeholder="الصق نص النسخة الاحتياطية هنا لاستعادة البيانات..."
            rows={2}
            className="w-full p-2.5 text-base sm:text-xs text-stone-900 dark:text-stone-100 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
          />
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleRestoreFromText}
              type="button"
              className="min-h-[44px] px-4 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-xs font-bold transition-all"
            >
              استعادة من النص
            </button>
            <label className="min-h-[44px] px-3 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer border border-stone-200 dark:border-stone-700 transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>أو اختر ملف .json</span>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-900/40 flex items-start gap-2.5 text-xs text-emerald-900 dark:text-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <span>
            <strong>خصوصية كاملة:</strong> جميع التواريخ والأسماء مخزنة محلياً في متصفح هاتفك فقط
            ولا يتم إرسالها إلى أي خادم خارجي.
          </span>
        </div>

        {/* Wipe Data Danger Zone */}
        <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <button
            onClick={() => setShowWipeConfirm(true)}
            type="button"
            className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline min-h-[36px] flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>حذف كل البيانات من هذا الجهاز</span>
          </button>
          <button
            onClick={onLoadSample}
            type="button"
            className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline min-h-[36px] flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>استعادة بيانات نموذجية</span>
          </button>
        </div>
      </div>

      {/* Delete Child Confirmation Dialog */}
      {childToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white dark:bg-stone-900 rounded-2xl p-5 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-3">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
              تأكيد حذف الابن
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400">
              هل أنت متأكد من رغبتك في حذف هذا الابن من قائمة الأسرة؟
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  onDeleteChild(childToDelete);
                  setChildToDelete(null);
                  onShowToast('تم حذف الابن من القائمة', 'info');
                }}
                type="button"
                className="flex-1 min-h-[42px] rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 active:scale-95"
              >
                تأكيد الحذف
              </button>
              <button
                onClick={() => setChildToDelete(null)}
                type="button"
                className="flex-1 min-h-[42px] rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 text-xs font-semibold hover:bg-stone-50"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wipe All Data Confirmation Dialog */}
      {showWipeConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white dark:bg-stone-900 rounded-2xl p-5 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-3">
            <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-center text-stone-900 dark:text-stone-100">
              حذف كافة بيانات الأسرة؟
            </h3>
            <p className="text-xs text-center text-stone-600 dark:text-stone-400 leading-relaxed">
              سيتم مسح جميع الأسماء وتواريخ الميلاد والزواج نهائياً من متصفح هذا الجهاز. لا يمكن
              التراجع عن هذا الإجراء إلا إذا كنت تمتلك نسخة احتياطية.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  onWipeAll();
                  setShowWipeConfirm(false);
                  onShowToast('تم مسح جميع البيانات', 'info');
                }}
                type="button"
                className="flex-1 min-h-[42px] rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 active:scale-95"
              >
                نعم، احذف كل شيء
              </button>
              <button
                onClick={() => setShowWipeConfirm(false)}
                type="button"
                className="flex-1 min-h-[42px] rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 text-xs font-semibold hover:bg-stone-50"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
