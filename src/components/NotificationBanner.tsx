import React from 'react';
import { AlertTriangle, ArrowRight, X, ShieldAlert } from 'lucide-react';
import { LawAlertNotification } from '../types/law';

interface NotificationBannerProps {
  latestAlert: LawAlertNotification | null;
  onViewLaw: (lawId: string) => void;
  onDismiss: () => void;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  latestAlert,
  onViewLaw,
  onDismiss,
}) => {
  if (!latestAlert) return null;

  return (
    <div className="bg-gradient-to-r from-red-950 via-slate-900 to-amber-950 border-b border-red-500/40 text-white shadow-xl animate-in slide-in-from-top duration-300">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5 animate-pulse text-red-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-red-600 text-white tracking-wide">
                  ประกาศด่วน ({latestAlert.agency})
                </span>
                <span className="text-xs font-semibold text-amber-300">
                  {latestAlert.title}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 line-clamp-1 sm:line-clamp-none">
                {latestAlert.message} • <span className="text-red-300 font-medium">{latestAlert.penaltyWarning}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              onClick={() => onViewLaw(latestAlert.lawId)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition active:scale-95 cursor-pointer"
            >
              <span>ดูแนวทางแก้ไข & ความเสี่ยง</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onDismiss}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              title="ปิดการแจ้งเตือนนี้"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
