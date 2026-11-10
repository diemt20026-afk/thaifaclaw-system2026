import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  UserCheck, 
  FileText, 
  Building2,
  RefreshCw,
  Lightbulb,
  Printer
} from 'lucide-react';
import { FactoryProfile } from '../types/law';

interface AiComplianceAdvisorProps {
  factoryProfile: FactoryProfile;
  onAddTask: (taskTitle: string, role: string, dueDate: string) => void;
}

export const AiComplianceAdvisor: React.FC<AiComplianceAdvisorProps> = ({
  factoryProfile,
  onAddTask,
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const presetQueries = [
    'โรงงานกำลังจะติดตั้งบอยเลอร์ขนาด 10 ตัน และมีถังเก็บก๊าซ LPG ต้องปฏิบัติตามกฎหมายและขออนุญาตอะไรบ้าง?',
    'หากไม่ได้ยื่นรายงานกากอุตสาหกรรม สก.3 ผ่านระบบ WMS ภายในกำหนด จะโดนสั่งปิดโรงงานหรือปรับเท่าไร?',
    'โรงงานมีน้ำเสียระบายออกวันละ 600 ลบ.ม. ต้องติดตั้งเครื่องวัด COD/BOD Online ภายในเมื่อไร และมีข้อยกเว้นไหม?',
    'การเตรียมตัวรับการตรวจประเมิน Self-Declaration รง.4 ประจำปี ต้องรวบรวมเอกสารอะไรบ้างเพื่อไม่ให้ติดประเมินความเสี่ยงสูง?',
  ];

  const handleRunAnalysis = async (textToAnalyze?: string) => {
    const prompt = textToAnalyze || query;
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          factoryProfile,
          questionOrScenario: prompt,
        }),
      });

      const data = await res.json();
      if (data.success && data.result) {
        setResult(data.result);
      } else {
        throw new Error(data.error || 'เกิดข้อผิดพลาดในการวิเคราะห์จาก AI');
      }
    } catch (err: any) {
      setError(err.message || 'ไม่สามารถติดต่อ AI Server ได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Intro Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-slate-900 border border-purple-500/30 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">
              <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold text-white">
                  AI ผู้ช่วยประเมินความสอดคล้องทางกฎหมายโรงงาน
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                จำลองการตรวจสอบ วิเคราะห์ข้อพิพาท คำนวณโทษปรับทางอาญา และสร้างขั้นตอนปฏิบัติการ (Action Checklist) ที่ปรับให้เข้ากับโปรไฟล์โรงงาน "{factoryProfile.factoryName}" โดยตรง
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-400 bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-700/80 shrink-0">
            <div className="font-semibold text-slate-200">โรงงานอ้างอิง:</div>
            <div className="text-[11px] text-amber-400">{factoryProfile.factoryTypeDescription}</div>
            <div className="text-[10px] text-slate-400">ขนาด: {factoryProfile.horsepower} HP | คนงาน: {factoryProfile.employeeCount} คน</div>
          </div>
        </div>

        {/* Query Input */}
        <div className="mt-5 space-y-3">
          <div className="relative">
            <textarea
              rows={3}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="พิมพ์คำถาม สถานการณ์ของโรงงาน หรืออุปกรณ์ที่ต้องการตรวจสอบ เช่น 'โรงงานของเรากำลังจะเปลี่ยนระบบบำบัดน้ำเสียและเพิ่มชั่วโมงโอทีพนักงาน ต้องระวังกฎหมายใหม่ข้อไหนบ้าง?'"
              className="w-full rounded-xl bg-slate-950/80 border border-slate-700 p-3.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
            <div className="absolute right-3 bottom-3 flex items-center gap-2">
              <button
                onClick={() => handleRunAnalysis()}
                disabled={loading || !query.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/30 transition disabled:opacity-40 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>กำลังประมวลผล...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>เริ่มตรวจสอบด้วย AI</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick presets */}
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>ตัวอย่างสถานการณ์ที่พบบ่อย (คลิกเพื่อทดสอบ):</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {presetQueries.map((preset, pIdx) => (
                <button
                  key={pIdx}
                  onClick={() => {
                    setQuery(preset);
                    handleRunAnalysis(preset);
                  }}
                  className="text-left text-[11px] px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700/60 transition cursor-pointer"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
          
          {/* Executive Summary & Risk Header */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                  result.overallRiskScore > 75 
                    ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                    : result.overallRiskScore > 40
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  ระดับความเสี่ยง: {result.overallRiskLevel === 'critical' ? 'วิกฤต' : result.overallRiskLevel === 'high' ? 'สูง' : 'ปานกลาง'}
                </span>
                <span className="text-xs text-slate-400">
                  Risk Score: {result.overallRiskScore}/100
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-2">
                บทวิเคราะห์สรุปสำหรับผู้บริหารและ จป.วิชาชีพ:
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {result.executiveSummary}
              </p>
            </div>

            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 shrink-0"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>พิมพ์ผลการตรวจ</span>
            </button>
          </div>

          {/* Action Checklist (แนวทางดำเนินการและแก้ไข) */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">
                  แนวทางที่ต้องดำเนินการ / ปรับปรุงแก้ไข (Action Checklist)
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                {result.actionChecklist?.length || 0} ขั้นตอนสำคัญ
              </span>
            </div>

            <div className="space-y-3">
              {result.actionChecklist?.map((item: any, idx: number) => (
                <div 
                  key={idx}
                  className="p-4 rounded-xl bg-slate-850 border border-slate-700/80 flex flex-col sm:flex-row sm:items-start justify-between gap-3"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold text-[11px] flex items-center justify-center">
                        {item.step || idx + 1}
                      </span>
                      <h4 className="text-sm font-bold text-white">
                        {item.title}
                      </h4>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed pl-7">
                      {item.description}
                    </p>

                    <div className="flex items-center gap-2 pl-7 flex-wrap text-[11px] text-slate-400 pt-1">
                      <span className="text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                        ผู้รับผิดชอบ: {item.responsibleRole}
                      </span>
                      <span className="text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        กำหนดเวลา: {item.timeline}
                      </span>
                    </div>

                    {item.requiredDocuments?.length > 0 && (
                      <div className="pl-7 pt-1.5 flex flex-wrap gap-1">
                        {item.requiredDocuments.map((doc: string, dIdx: number) => (
                          <span key={dIdx} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            📄 {doc}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => onAddTask(item.title, item.responsibleRole, item.timeline)}
                    className="self-end sm:self-center shrink-0 px-2.5 py-1.5 rounded-lg text-xs bg-slate-800 hover:bg-slate-750 text-emerald-300 border border-emerald-500/30 transition cursor-pointer"
                  >
                    + บันทึกลงแผนงาน
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Risk & Impact Analysis (ประเมินความเสี่ยงถ้าไม่ทำ) */}
          {result.riskAndImpactAssessment && (
            <div className="p-5 rounded-2xl bg-slate-900 border border-red-500/30 shadow-xl space-y-4">
              <div className="flex items-center gap-2 text-red-400">
                <ShieldAlert className="w-5 h-5 text-red-400" />
                <h3 className="text-base font-bold text-white">
                  ประเมินความเสี่ยงและผลกระทบหากโรงงานไม่ดำเนินการ (Consequence Matrix)
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/20">
                  <div className="text-xs font-bold text-red-300 mb-1">
                    บทลงโทษทางอาญาและค่าปรับ:
                  </div>
                  <p className="text-xs text-slate-200 font-semibold leading-relaxed">
                    {result.riskAndImpactAssessment.criminalPenalty}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-orange-950/30 border border-orange-500/20">
                  <div className="text-xs font-bold text-orange-300 mb-1">
                    คำสั่งทางปกครอง (ม.37, 39 พ.ร.บ.โรงงาน):
                  </div>
                  <p className="text-xs text-slate-200 font-semibold leading-relaxed">
                    {result.riskAndImpactAssessment.administrativeOrder}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-850 border border-slate-700">
                  <div className="text-xs font-bold text-blue-300 mb-1">
                    ผลกระทบต่อสายการผลิตและธุรกิจ:
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {result.riskAndImpactAssessment.businessDisruption}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-850 border border-slate-700">
                  <div className="text-xs font-bold text-amber-300 mb-1">
                    ผลกระทบต่อชุมชนและภาพลักษณ์ ESG:
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {result.riskAndImpactAssessment.publicCommunityImpact}
                  </p>
                </div>

              </div>
            </div>
          )}

          {/* Compliance Recommendations */}
          {result.complianceRecommendations?.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-850 border border-slate-700 text-xs text-slate-300 space-y-2">
              <div className="font-bold text-slate-200 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <span>คำแนะนำเชิงป้องกันเพิ่มเติม:</span>
              </div>
              <ul className="space-y-1 pl-5 list-disc text-slate-300">
                {result.complianceRecommendations.map((rec: string, rIdx: number) => (
                  <li key={rIdx}>{rec}</li>
                ))}
              </ul>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
