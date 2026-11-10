import React, { useState } from 'react';
import { 
  X, 
  ShieldAlert, 
  AlertTriangle, 
  Calendar, 
  Building2, 
  CheckCircle2, 
  FileText, 
  UserCheck, 
  Clock, 
  ExternalLink, 
  Sparkles, 
  Flame, 
  HelpCircle,
  Copy,
  Check,
  Printer
} from 'lucide-react';
import { IndustrialLaw, FactoryProfile } from '../types/law';

interface LawDetailModalProps {
  law: IndustrialLaw;
  factoryProfile: FactoryProfile;
  onClose: () => void;
  onAddTask: (law: IndustrialLaw, stepTitle: string, role: string) => void;
}

export const LawDetailModal: React.FC<LawDetailModalProps> = ({
  law,
  factoryProfile,
  onClose,
  onAddTask,
}) => {
  const [activeTab, setActiveTab] = useState<'action' | 'risk' | 'diff' | 'ai'>('action');
  const [copied, setCopied] = useState(false);
  
  // AI Deep Dive state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiDeepDive, setAiDeepDive] = useState<any>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleCopySummary = () => {
    const textToCopy = `[กฎหมายโรงงาน: ${law.title}]\nรหัส: ${law.code}\nหน่วยงาน: ${law.agencyFullName}\nมีผลบังคับใช้: ${law.effectiveDate}\n\nความเสี่ยงหากละเลย: ${law.riskAssessment.criminalFine} / ${law.riskAssessment.administrativeSanction}\n\nแนวทางปฏิบัติ:\n${law.actionPlan.map(s => `${s.step}. ${s.title} (${s.responsibleRole})`).join('\n')}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFetchAiDeepDive = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch('/api/gemini/explain-law', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lawTitle: law.title,
          context: `โรงงาน: ${factoryProfile.factoryName}, ประเภท: ${factoryProfile.factoryTypeDescription}, มีบอยเลอร์: ${factoryProfile.hasBoiler}, สารเคมี: ${factoryProfile.hasHazardousChemicals}, น้ำเสีย: ${factoryProfile.hasWastewaterTreatment}, ปล่องควัน: ${factoryProfile.hasAirEmissionStack}`,
        }),
      });
      const data = await res.json();
      if (data.success && data.result) {
        setAiDeepDive(data.result);
      } else {
        throw new Error(data.error || 'Failed to fetch AI analysis');
      }
    } catch (err: any) {
      setAiError(err.message || 'ไม่สามารถติดต่อ AI Service ได้');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 sticky top-0 z-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <span className="px-2.5 py-0.5 rounded-md text-xs font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {law.agencyFullName}
                </span>
                <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                  law.urgency === 'critical' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {law.urgency === 'critical' ? 'ระดับวิกฤต' : 'ความสำคัญสูง'}
                </span>
                <span className="px-2 py-0.5 rounded-md text-xs bg-slate-800 text-slate-300 border border-slate-700">
                  {law.categoryThai}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white leading-tight">
                {law.title}
              </h2>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-2 flex-wrap">
                <span className="font-mono text-amber-300 font-semibold">{law.code}</span>
                <span>•</span>
                <span>ประกาศเมื่อ: {law.publicationDate}</span>
                <span>•</span>
                <span className="text-emerald-400 font-semibold">วันที่มีผลบังคับใช้: {law.effectiveDate}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleCopySummary}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                title="คัดลอกสรุปย่อ"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
                title="ปิดหน้าต่าง"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-5 border-b border-slate-800 pb-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab('action')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'action'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>แนวทางที่ต้องดำเนินการ / ปรับปรุงแก้ไข ({law.actionPlan.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('risk')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'risk'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>ประเมินความเสี่ยงหากไม่ทำ (บทลงโทษ & ผลกระทบ)</span>
            </button>

            <button
              onClick={() => setActiveTab('diff')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'diff'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>สิ่งที่เปลี่ยนแปลง (เดิม vs ใหม่)</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('ai');
                if (!aiDeepDive && !aiLoading) {
                  handleFetchAiDeepDive();
                }
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'ai'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'text-purple-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              <span>AI เจาะลึกโรงงานคุณ</span>
            </button>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
          
          {/* TAB 1: ACTION GUIDELINES */}
          {activeTab === 'action' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-amber-300 text-sm">แนวทางปฏิบัติสำหรับโรงงานเพื่อให้สอดคล้องตามกฎหมาย</h4>
                  <p className="mt-0.5 text-slate-300">
                    โปรดมอบหมายงานให้ผู้รับผิดชอบตามขั้นตอนด้านล่าง และจัดเตรียมเอกสารหลักฐานเพื่อพร้อมรับการตรวจสอบของเจ้าพนักงานตรวจโรงงาน
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {law.actionPlan.map((step) => (
                  <div 
                    key={step.step}
                    className="p-4 rounded-xl bg-slate-850 border border-slate-700/80 hover:border-slate-600 transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/60 pb-2.5 mb-2.5">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-extrabold text-xs flex items-center justify-center shrink-0">
                          {step.step}
                        </span>
                        <h4 className="font-bold text-sm sm:text-base text-white">
                          {step.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          <UserCheck className="w-3 h-3" />
                          <span>{step.responsibleRole}</span>
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <Clock className="w-3 h-3" />
                          <span>{step.deadlineInfo}</span>
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {step.description}
                    </p>

                    {/* Required Documents */}
                    {step.requiredDocuments.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-800/80">
                        <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                          เอกสารและหลักฐานที่ต้องจัดทำ/แสดง:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {step.requiredDocuments.map((doc, dIdx) => (
                            <span 
                              key={dIdx} 
                              className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono"
                            >
                              📄 {doc}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Add to internal task button */}
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={() => onAddTask(law, step.title, step.responsibleRole)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs bg-slate-800 hover:bg-slate-750 text-emerald-300 hover:text-emerald-200 border border-emerald-500/30 transition cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>เพิ่มขั้นตอนนี้ในรายการติดตามงาน</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: RISK ASSESSMENT */}
          {activeTab === 'risk' && (
            <div className="space-y-4">
              {/* Risk Score Header */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-red-950/60 to-slate-900 border border-red-500/30 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-red-400 flex items-center gap-1">
                    <Flame className="w-4 h-4 text-red-500 animate-pulse" />
                    <span>ดัชนีความเสี่ยงต่อการถูกดำเนินคดีและการสั่งหยุดกิจการ</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1">
                    ระดับความเสี่ยง: {law.riskAssessment.riskLevel === 'critical' ? 'วิกฤต (Critical)' : 'สูง (High)'}
                  </h3>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-extrabold text-red-400 font-mono">
                    {law.riskAssessment.riskScore}
                    <span className="text-xs text-slate-400 font-normal">/100</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Risk Assessment Index</span>
                </div>
              </div>

              {/* 4 Pillars of Consequences */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 1. Criminal Fines */}
                <div className="p-4 rounded-xl bg-slate-850 border border-slate-700/80">
                  <div className="flex items-center gap-2 text-sm font-bold text-red-400 mb-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                    <span>โทษปรับทางอาญา (Criminal Fines)</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                    {law.riskAssessment.criminalFine}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    บทลงโทษปรับตามพระราชบัญญัติโรงงาน หรือ พ.ร.บ.ความปลอดภัยฯ มีทั้งโทษปรับครั้งแรกและปรับรายวันจนกว่าจะปฏิบัติถูกต้อง
                  </p>
                </div>

                {/* 2. Imprisonment */}
                <div className="p-4 rounded-xl bg-slate-850 border border-slate-700/80">
                  <div className="flex items-center gap-2 text-sm font-bold text-orange-400 mb-1.5">
                    <span className="w-2 h-2 rounded-full bg-orange-400" />
                    <span>โทษจำคุกผู้บริหาร/ผู้แทนโรงงาน</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                    {law.riskAssessment.imprisonment}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    กรรมการผู้จัดการ หรือผู้ได้รับมอบอำนาจอาจต้องรับผิดทางอาญาส่วนบุคคลหากพบการละเว้นหรือเจตนาปกปิด
                  </p>
                </div>

                {/* 3. Administrative Sanctions */}
                <div className="p-4 rounded-xl bg-slate-850 border border-slate-700/80">
                  <div className="flex items-center gap-2 text-sm font-bold text-amber-400 mb-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>คำสั่งทางปกครอง (ม.37, ม.39 พ.ร.บ.โรงงาน)</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                    {law.riskAssessment.administrativeSanction}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    พนักงานเจ้าหน้าที่มีอำนาจสั่งให้หยุดการกระทำ สั่งปรับปรุง หรือสั่งปิดโรงงานได้ทันทีหากอาจเกิดอันตรายร้ายแรง
                  </p>
                </div>

                {/* 4. Business Disruption */}
                <div className="p-4 rounded-xl bg-slate-850 border border-slate-700/80">
                  <div className="flex items-center gap-2 text-sm font-bold text-blue-400 mb-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    <span>ผลกระทบทางธุรกิจและชื่อเสียงองค์กร</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {law.riskAssessment.businessImpact}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    อาจถูกเพิกถอนมาตรฐาน ISO 14001/45001 และกระทบต่อสัญญาการส่งมอบสินค้ากับคู่ค้าระดับโลก
                  </p>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: DIFF (ORIGINAL VS UPDATED) */}
          {activeTab === 'diff' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Original */}
                <div className="p-4 rounded-xl bg-slate-850 border border-slate-700">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-2">
                    <span className="px-2 py-0.5 rounded bg-slate-700 text-slate-300 text-[10px]">เดิม</span>
                    <span>ข้อกำหนดหรือระเบียบเดิมที่เคยใช้</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {law.comparison.originalRequirement}
                  </p>
                </div>

                {/* Updated */}
                <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-300 mb-2">
                    <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-extrabold text-[10px]">ใหม่</span>
                    <span>ข้อกำหนดใหม่ที่ปรับปรุงและมีผลบังคับ</span>
                  </div>
                  <p className="text-xs text-slate-100 leading-relaxed font-medium">
                    {law.comparison.updatedRequirement}
                  </p>
                </div>

              </div>

              {/* Changes bullet list */}
              <div className="p-4 rounded-xl bg-slate-850 border border-slate-700">
                <h4 className="text-xs font-bold text-slate-200 mb-2">
                  สรุปจุดเปลี่ยนสำคัญที่โรงงานต้องปรับตัว:
                </h4>
                <div className="space-y-2">
                  {law.comparison.keyChanges.map((change, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{change}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AI DEEP DIVE */}
          {activeTab === 'ai' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-purple-500/20 text-purple-300">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-purple-200">
                      AI ผู้ช่วยวิเคราะห์ความสอดคล้องเฉพาะโรงงาน
                    </h4>
                    <p className="text-xs text-slate-300">
                      วิเคราะห์เปรียบเทียบกับข้อมูลโรงงาน "{factoryProfile.factoryName}" โดย Gemini 3.8 Flash
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleFetchAiDeepDive}
                  disabled={aiLoading}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition disabled:opacity-50 cursor-pointer"
                >
                  {aiLoading ? 'กำลังวิเคราะห์...' : 'วิเคราะห์ซ้ำ'}
                </button>
              </div>

              {aiLoading && (
                <div className="text-center py-10 space-y-2">
                  <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-slate-400">Gemini กำลังประมวลผลข้อกำหนดกฎหมายกับพิกัดโรงงานของคุณ...</p>
                </div>
              )}

              {aiError && (
                <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/40 text-xs text-red-300">
                  {aiError}
                </div>
              )}

              {aiDeepDive && !aiLoading && (
                <div className="space-y-4">
                  
                  {/* Highlights */}
                  {aiDeepDive.keyHighlights && (
                    <div className="p-4 rounded-xl bg-slate-850 border border-slate-700">
                      <h4 className="text-xs font-bold text-purple-300 mb-2">ประเด็นสำคัญที่โรงงานคุณต้องจับตา:</h4>
                      <ul className="space-y-1.5">
                        {aiDeepDive.keyHighlights.map((hl: string, hIdx: number) => (
                          <li key={hIdx} className="text-xs text-slate-200 flex items-start gap-2">
                            <span className="text-purple-400">✓</span>
                            <span>{hl}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Must do actions */}
                  {aiDeepDive.mustDoActions && (
                    <div className="p-4 rounded-xl bg-slate-850 border border-slate-700">
                      <h4 className="text-xs font-bold text-amber-300 mb-2">สิ่งที่ต้องลงมือทำทันที (Priority Actions):</h4>
                      <div className="space-y-2">
                        {aiDeepDive.mustDoActions.map((act: any, aIdx: number) => (
                          <div key={aIdx} className="p-2.5 rounded-lg bg-slate-800 border border-slate-700/60 text-xs flex items-center justify-between gap-3">
                            <div>
                              <span className="font-semibold text-white">{act.task}</span>
                              <div className="text-[11px] text-slate-400 mt-0.5">
                                แผนก: {act.department} • กำหนด: {act.deadline}
                              </div>
                            </div>
                            <button
                              onClick={() => onAddTask(law, act.task, act.department)}
                              className="text-[11px] px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-amber-300 shrink-0"
                            >
                              + บันทึกงาน
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Audit tips */}
                  {aiDeepDive.auditTips && (
                    <div className="p-4 rounded-xl bg-slate-850 border border-slate-700">
                      <h4 className="text-xs font-bold text-emerald-300 mb-2">เทคนิคการเตรียมความพร้อมรับการตรวจของเจ้าพนักงาน DIW / DLPW:</h4>
                      <ul className="space-y-1.5">
                        {aiDeepDive.auditTips.map((tip: string, tIdx: number) => (
                          <li key={tIdx} className="text-xs text-slate-300 flex items-start gap-2">
                            <span className="text-emerald-400">★</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                </div>
              )}

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/95 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {law.officialLink && (
              <a
                href={law.officialLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition px-2.5 py-1.5 rounded-lg hover:bg-slate-800"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>เปิดเว็บไซต์ราชกิจจานุเบกษา / กรมโรงงานฯ</span>
              </a>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>พิมพ์รายงาน</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition cursor-pointer"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
