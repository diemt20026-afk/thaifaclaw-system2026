import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Flame, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ArrowRight,
  TrendingDown,
  Info,
  DollarSign
} from 'lucide-react';
import { IndustrialLaw, FactoryProfile } from '../types/law';
import { isLawMatchedWithFactory } from '../utils/notifications';

interface RiskMatrixViewProps {
  laws: IndustrialLaw[];
  factoryProfile: FactoryProfile;
  onSelectLaw: (law: IndustrialLaw) => void;
}

export const RiskMatrixView: React.FC<RiskMatrixViewProps> = ({
  laws,
  factoryProfile,
  onSelectLaw,
}) => {
  // Store compliance status for each law in local state: 'compliant' | 'in_progress' | 'non_compliant'
  const [complianceMap, setComplianceMap] = useState<Record<string, 'compliant' | 'in_progress' | 'non_compliant'>>({
    'law-diw-waste-2566': 'in_progress',
    'law-diw-cems-2567': 'non_compliant',
    'law-dlpw-boiler-2567': 'in_progress',
    'law-pcd-prtr-2567': 'compliant',
    'law-diw-water-2567': 'non_compliant',
    'law-dlpw-fire-2566': 'compliant',
    'law-diw-license-2568': 'in_progress',
    'law-dede-carbon-2568': 'in_progress',
  });

  const matchedLaws = laws.filter((law) => isLawMatchedWithFactory(law, factoryProfile));

  const setStatus = (lawId: string, status: 'compliant' | 'in_progress' | 'non_compliant') => {
    setComplianceMap((prev) => ({ ...prev, [lawId]: status }));
  };

  // Calculate dynamic factory risk
  const nonCompliantCount = matchedLaws.filter((l) => complianceMap[l.id] === 'non_compliant').length;
  const inProgressCount = matchedLaws.filter((l) => complianceMap[l.id] === 'in_progress').length;
  const compliantCount = matchedLaws.filter((l) => complianceMap[l.id] === 'compliant').length;

  const totalCalculatedScore = matchedLaws.length > 0 
    ? Math.round(
        matchedLaws.reduce((acc, curr) => {
          const status = complianceMap[curr.id] || 'in_progress';
          const multiplier = status === 'non_compliant' ? 1.0 : status === 'in_progress' ? 0.45 : 0.05;
          return acc + curr.riskAssessment.riskScore * multiplier;
        }, 0) / matchedLaws.length
      )
    : 0;

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Risk Gauge Card */}
        <div className="lg:col-span-1 p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border border-slate-700/80 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                ระดับความเสี่ยงของโรงงานคุณ
              </span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                totalCalculatedScore > 65
                  ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                  : totalCalculatedScore > 35
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                {totalCalculatedScore > 65 ? 'ความเสี่ยงสูงมาก' : totalCalculatedScore > 35 ? 'ความเสี่ยงปานกลาง' : 'ความเสี่ยงต่ำ'}
              </span>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className={`text-5xl font-black font-mono ${
                totalCalculatedScore > 65 ? 'text-red-400' : totalCalculatedScore > 35 ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {totalCalculatedScore}
              </span>
              <span className="text-sm text-slate-400 font-semibold">/ 100</span>
            </div>

            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              คำนวณจากกฎหมายที่เกี่ยวข้อง {matchedLaws.length} ฉบับ และสถานะการปฏิบัติตามของโรงงาน ณ ปัจจุบัน
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-red-400 flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5" />
                <span>ยังไม่ปฏิบัติ (Non-Compliant)</span>
              </span>
              <span className="font-bold text-red-400 font-mono">{nonCompliantCount} ฉบับ</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-amber-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>กำลังดำเนินการปรับปรุง</span>
              </span>
              <span className="font-bold text-amber-400 font-mono">{inProgressCount} ฉบับ</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>ปฏิบัติตามครบถ้วน</span>
              </span>
              <span className="font-bold text-emerald-400 font-mono">{compliantCount} ฉบับ</span>
            </div>
          </div>
        </div>

        {/* Penalty & Legal Disruption Summary */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ShieldAlert className="w-5 h-5 text-red-400" />
              <h3 className="text-base font-bold text-white">
                การประเมินผลกระทบทางกฎหมายและการดำเนินคดี (Legal Exposure)
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              หากโรงงานไม่ดำเนินการตามประกาศกระทรวงอุตสาหกรรม และกฎหมายความปลอดภัย อาชีวอนามัย อาจเผชิญมาตรการบังคับใช้กฎหมาย 3 ระดับ:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
              
              <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-500/20">
                <div className="text-xs font-bold text-red-300">1. โทษปรับทางอาญา</div>
                <div className="text-sm font-extrabold text-white mt-1">200K - 500K ฿</div>
                <div className="text-[11px] text-slate-400 mt-1">
                  ปรับรายวันเพิ่มวันละ 5,000 บ. จนกว่าจะแก้ไขเสร็จ
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-orange-950/30 border border-orange-500/20">
                <div className="text-xs font-bold text-orange-300">2. คำสั่ง ม.37 / ม.39</div>
                <div className="text-sm font-extrabold text-white mt-1">สั่งหยุดเครื่องจักร</div>
                <div className="text-[11px] text-slate-400 mt-1">
                  หยุดสายการผลิตชั่วคราว หรือสั่งปิดโรงงาน
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-500/20">
                <div className="text-xs font-bold text-blue-300">3. ใบอนุญาต รง.4</div>
                <div className="text-sm font-extrabold text-white mt-1">พักใช้ / เพิกถอน</div>
                <div className="text-[11px] text-slate-400 mt-1">
                  กระทบสัญญาคู่ค้า และใบรับรอง ISO 14001
                </div>
              </div>

            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs text-slate-300">
            <span className="flex items-center gap-1.5 text-amber-300 font-medium">
              <Info className="w-4 h-4 shrink-0" />
              <span>คลิกเปลี่ยนสถานะด้านล่างเพื่อประเมินความเสี่ยงจำลองของโรงงาน</span>
            </span>
          </div>
        </div>

      </div>

      {/* Interactive Compliance Matrix Table */}
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" />
              <span>ตารางประเมินความเสี่ยงและสถานะความสอดคล้องรายกฎหมาย</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              ตรวจสอบว่าโรงงานของคุณดำเนินการตามข้อกำหนดของแต่ละฉบับแล้วหรือยัง
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800 text-slate-300 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-700">
              <tr>
                <th className="py-3 px-3.5">กฎหมาย / ประกาศ</th>
                <th className="py-3 px-3">หมวดหมู่</th>
                <th className="py-3 px-3">วันมีผล</th>
                <th className="py-3 px-3">บทลงโทษหากละเลย</th>
                <th className="py-3 px-3 text-center">สถานะโรงงาน</th>
                <th className="py-3 px-3 text-right">ดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {matchedLaws.map((law) => {
                const currentStatus = complianceMap[law.id] || 'in_progress';
                return (
                  <tr key={law.id} className="hover:bg-slate-850/60 transition">
                    <td className="py-3.5 px-3.5">
                      <div className="font-bold text-slate-100 line-clamp-1 max-w-[280px]">
                        {law.title}
                      </div>
                      <div className="text-[11px] text-amber-400 font-mono mt-0.5">
                        {law.code}
                      </div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {law.categoryThai}
                      </span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap font-mono text-slate-400">
                      {law.effectiveDate}
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-red-300 font-semibold line-clamp-1 max-w-[220px]">
                        {law.riskAssessment.criminalFine}
                      </div>
                      <div className="text-[10px] text-slate-400 line-clamp-1">
                        {law.riskAssessment.administrativeSanction}
                      </div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap text-center">
                      <div className="inline-flex rounded-lg border border-slate-700 p-0.5 bg-slate-800">
                        <button
                          onClick={() => setStatus(law.id, 'compliant')}
                          className={`px-2 py-1 rounded text-[10px] font-bold transition cursor-pointer ${
                            currentStatus === 'compliant'
                              ? 'bg-emerald-600 text-white shadow'
                              : 'text-slate-400 hover:text-white'
                          }`}
                          title="ทำแล้ว ถูกต้องครบถ้วน"
                        >
                          ผ่าน
                        </button>
                        <button
                          onClick={() => setStatus(law.id, 'in_progress')}
                          className={`px-2 py-1 rounded text-[10px] font-bold transition cursor-pointer ${
                            currentStatus === 'in_progress'
                              ? 'bg-amber-600 text-white shadow'
                              : 'text-slate-400 hover:text-white'
                          }`}
                          title="กำลังปรับปรุง"
                        >
                          กำลังทำ
                        </button>
                        <button
                          onClick={() => setStatus(law.id, 'non_compliant')}
                          className={`px-2 py-1 rounded text-[10px] font-bold transition cursor-pointer ${
                            currentStatus === 'non_compliant'
                              ? 'bg-red-600 text-white shadow'
                              : 'text-slate-400 hover:text-white'
                          }`}
                          title="ยังไม่ได้เริ่ม เสี่ยงโดนสั่งหยุดงาน"
                        >
                          ยังไม่ทำ
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap text-right">
                      <button
                        onClick={() => onSelectLaw(law)}
                        className="inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
                      >
                        <span>ดูแผนแก้</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
