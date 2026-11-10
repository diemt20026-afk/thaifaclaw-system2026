import React from 'react';
import { 
  Building2, 
  Calendar, 
  AlertCircle, 
  ArrowRight, 
  CheckCircle2, 
  Flame, 
  FileText, 
  Factory,
  ShieldAlert,
  Clock
} from 'lucide-react';
import { IndustrialLaw, FactoryProfile } from '../types/law';
import { isLawMatchedWithFactory } from '../utils/notifications';

interface LawCardProps {
  law: IndustrialLaw;
  factoryProfile: FactoryProfile;
  onSelectLaw: (law: IndustrialLaw) => void;
  onAddToTaskTracker: (law: IndustrialLaw) => void;
}

export const LawCard: React.FC<LawCardProps> = ({
  law,
  factoryProfile,
  onSelectLaw,
  onAddToTaskTracker,
}) => {
  const isMatched = isLawMatchedWithFactory(law, factoryProfile);

  // Agency styling
  const getAgencyBadge = (agency: string) => {
    switch (agency) {
      case 'DIW':
        return { label: 'กรมโรงงานฯ (DIW)', bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20' };
      case 'DLPW':
        return { label: 'กรมสวัสดิการฯ (DLPW)', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
      case 'PCD':
        return { label: 'กรมควบคุมมลพิษ (PCD)', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
      case 'DEDE':
        return { label: 'กรมพัฒนาพลังงานฯ', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
      default:
        return { label: agency, bg: 'bg-slate-700/50 text-slate-300 border-slate-600' };
    }
  };

  const agencyStyle = getAgencyBadge(law.agency);

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return { label: 'วิกฤต / โทษหนัก', bg: 'bg-red-500/15 text-red-400 border-red-500/30' };
      case 'high':
        return { label: 'ความสำคัญสูง', bg: 'bg-orange-500/15 text-orange-400 border-orange-500/30' };
      default:
        return { label: 'เฝ้าระวัง', bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30' };
    }
  };

  const urgencyStyle = getUrgencyBadge(law.urgency);

  return (
    <div 
      className={`rounded-2xl border bg-slate-900/80 backdrop-blur-sm p-5 transition-all duration-200 hover:border-slate-600 hover:shadow-xl hover:shadow-slate-950/50 flex flex-col justify-between group ${
        isMatched ? 'border-amber-500/30 ring-1 ring-amber-500/20' : 'border-slate-800'
      }`}
    >
      <div>
        {/* Header badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border ${agencyStyle.bg}`}>
              {agencyStyle.label}
            </span>
            <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border ${urgencyStyle.bg} flex items-center gap-1`}>
              {law.urgency === 'critical' && <Flame className="w-3 h-3 text-red-400" />}
              {urgencyStyle.label}
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-300 border border-slate-700">
              {law.categoryThai}
            </span>
          </div>

          {/* Matched with current factory badge */}
          {isMatched && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30">
              <Factory className="w-3 h-3 text-amber-400" />
              <span>ตรงกับโรงงานคุณ</span>
            </span>
          )}
        </div>

        {/* Law Title */}
        <h3 
          onClick={() => onSelectLaw(law)}
          className="text-base sm:text-lg font-bold text-slate-100 group-hover:text-amber-300 transition cursor-pointer leading-snug line-clamp-2"
        >
          {law.title}
        </h3>

        {/* Code & Dates */}
        <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
          <span className="font-mono text-slate-400 font-medium">{law.code}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            มีผล: {law.effectiveDate}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {law.status === 'active' ? 'มีผลแล้ว' : law.status === 'upcoming' ? 'รอมีผล' : 'ร่างกฎหมาย'}
          </span>
        </div>

        {/* Summary */}
        <p className="text-xs text-slate-300 mt-3 line-clamp-2 leading-relaxed">
          {law.summary}
        </p>

        {/* Key Changes Comparison Box */}
        <div className="mt-3.5 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
          <div className="text-[11px] font-semibold text-amber-400 flex items-center gap-1 mb-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>สาระสำคัญที่แก้ไข / ข้อกำหนดใหม่:</span>
          </div>
          <ul className="space-y-1">
            {law.comparison.keyChanges.slice(0, 2).map((change, idx) => (
              <li key={idx} className="text-xs text-slate-300 flex items-start gap-1.5 leading-snug">
                <span className="text-amber-400 mt-0.5">•</span>
                <span>{change}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Risk Assessment Box */}
        <div className="mt-3 p-3 rounded-xl bg-red-950/20 border border-red-500/20">
          <div className="flex items-center justify-between text-xs font-semibold text-red-300">
            <span className="flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
              <span>ความเสี่ยงหากละเลย:</span>
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 font-mono">
              Risk: {law.riskAssessment.riskScore}/100
            </span>
          </div>
          <p className="text-xs text-red-200/90 mt-1 line-clamp-1">
            {law.riskAssessment.criminalFine}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
            {law.riskAssessment.administrativeSanction}
          </p>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <button
          onClick={() => onAddToTaskTracker(law)}
          className="text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer"
          title="เพิ่มเป็นงานที่ต้องปฏิบัติตามในแผนกของคุณ"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>เพิ่มใน Action Plan</span>
        </button>

        <button
          onClick={() => onSelectLaw(law)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition active:scale-95 cursor-pointer"
        >
          <span>ดูแนวทางแก้ไข</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
        </button>
      </div>
    </div>
  );
};
