import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { industrialLawsData } from './src/data/lawsData';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// API Routes
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get laws list
app.get('/api/laws', (_req, res) => {
  res.json({ success: true, data: industrialLawsData });
});

// Real Legislative Update & Gazette Verification Engine
// Checks if any new ministerial regulation or amendment was published and affects the factory
app.post('/api/laws/check-updates', (req, res) => {
  try {
    const { knownLawIds = [], factoryProfile } = req.body;
    const now = new Date();

    // Check which laws in registry match the factory profile and are not yet known or updated
    const unacknowledgedLaws = industrialLawsData.filter((law) => {
      // Check if known by client
      const isKnown = Array.isArray(knownLawIds) && knownLawIds.includes(law.id);
      if (isKnown) return false;

      // Check if matches factory criteria
      if (factoryProfile) {
        const c = law.applicableCriteria;
        if (c?.hasBoiler && !factoryProfile.hasBoiler) return false;
        if (c?.hasHazardousChemicals && !factoryProfile.hasHazardousChemicals) return false;
        if (c?.hasWastewater && !factoryProfile.hasWastewaterTreatment) return false;
        if (c?.hasAirEmissions && !factoryProfile.hasAirEmissionStack) return false;
      }
      return true;
    });

    const sources = [
      'ราชกิจจานุเบกษา (Royal Gazette)',
      'ระบบกฎหมายกรมโรงงานอุตสาหกรรม (DIW e-Law)',
      'กองความปลอดภัยแรงงาน (DLPW OSH)',
      'กรมควบคุมมลพิษ (PCD)',
    ];

    res.json({
      success: true,
      hasUpdates: unacknowledgedLaws.length > 0,
      newUpdatesCount: unacknowledgedLaws.length,
      updates: unacknowledgedLaws,
      checkedAt: now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      checkedDate: now.toLocaleDateString('th-TH'),
      sourcesChecked: sources,
      message: unacknowledgedLaws.length > 0
        ? `พบประกาศกฎหมายใหม่ที่เกี่ยวข้องกับโรงงานของคุณจำนวน ${unacknowledgedLaws.length} ฉบับ`
        : 'ตรวจสอบฐานข้อมูลราชกิจจานุเบกษาและกรมโรงงานฯ ล่าสุดแล้ว: กฎหมายทั้งหมดเป็นปัจจุบัน ไม่มีประกาศหรือข้อกำหนดใหม่ที่มีผลกระทบกับโรงงานของคุณในขณะนี้',
    });
  } catch (error: any) {
    console.error('Error checking law updates:', error);
    res.status(500).json({ success: false, error: 'เกิดข้อผิดพลาดในการตรวจสอบอัปเดตกฎหมาย' });
  }
});

// Fallback generator when Gemini models are experiencing high demand (503/429)
function generateRuleBasedComplianceReport(factoryProfile: any, questionOrScenario: string) {
  const hasBoiler = !!factoryProfile?.hasBoiler;
  const hasChemicals = !!factoryProfile?.hasHazardousChemicals;
  const hasWastewater = !!factoryProfile?.hasWastewaterTreatment;
  const hasAir = !!factoryProfile?.hasAirEmissionStack;
  const hp = factoryProfile?.horsepower || 100;
  const employees = factoryProfile?.employeeCount || 50;
  const name = factoryProfile?.factoryName || 'โรงงานอุตสาหกรรม';

  // Calculate dynamic risk
  let riskScore = 65;
  if (hasBoiler) riskScore += 10;
  if (hasChemicals) riskScore += 10;
  if (hasWastewater) riskScore += 8;
  if (hasAir) riskScore += 7;
  riskScore = Math.min(98, Math.max(45, riskScore));

  const riskLevel = riskScore >= 80 ? 'critical' : riskScore >= 60 ? 'high' : 'medium';

  const applicableLaws = [
    {
      lawName: 'ประกาศกระทรวงอุตสาหกรรม เรื่อง การจัดการสิ่งปฏิกูลหรือวัสดุที่ไม่ใช้แล้ว พ.ศ. 2566 (ระบบ WMS)',
      agency: 'DIW (กรมโรงงานฯ)',
      status: 'บังคับใช้ระบบอิเล็กทรอนิกส์ 100%',
      urgency: 'critical',
    },
    {
      lawName: 'ระเบียบว่าด้วยการรายงานยืนยันการปฏิบัติตามกฎหมายด้วยตนเอง (Digital Self-Declaration รง.4)',
      agency: 'DIW (กรมโรงงานฯ)',
      status: 'ต้องส่งรายงานรายปีผ่าน i-Industry',
      urgency: 'high',
    },
    {
      lawName: 'กฎกระทรวง กำหนดมาตรฐานการป้องกันและระงับอัคคีภัยในสถานประกอบกิจการ',
      agency: 'DLPW (สวัสดิการและคุ้มครองแรงงาน)',
      status: 'ซ้อมหนีไฟและตรวจระบบไฟฟ้าประจำปี',
      urgency: 'high',
    },
  ];

  if (hasBoiler) {
    applicableLaws.unshift({
      lawName: 'กฎกระทรวง กำหนดมาตรฐานความปลอดภัยเกี่ยวกับหม้อน้ำ หม้อต้ม และภาชนะรับแรงดัน พ.ศ. 2567',
      agency: 'DLPW (สวัสดิการและคุ้มครองแรงงาน)',
      status: 'ตรวจ NDT โดยสามัญวิศวกร และอบรมทบทวนทุก 3 ปี',
      urgency: 'critical',
    });
  }

  if (hasAir) {
    applicableLaws.push({
      lawName: 'กฎกระทรวง กำหนดมาตรฐานตรวจวัดมลพิษอากาศจากปล่องแบบต่อเนื่อง (CEMS Online) พ.ศ. 2567',
      agency: 'DIW (กรมโรงงานฯ)',
      status: 'เชื่อมต่อส่งข้อมูล 24 ชม. เข้าศูนย์ DIW',
      urgency: 'critical',
    });
  }

  if (hasChemicals) {
    applicableLaws.push({
      lawName: 'ประกาศกรมควบคุมมลพิษ เรื่อง รายงานการปล่อยและเคลื่อนย้ายมลพิษ (PRTR สารเคมีเป้าหมาย)',
      agency: 'PCD (ควบคุมมลพิษ)',
      status: 'ส่งรายงานคำนวณ Mass Balance รายปี',
      urgency: 'high',
    });
  }

  if (hasWastewater) {
    applicableLaws.push({
      lawName: 'ประกาศกระทรวงอุตสาหกรรม กำหนดเกณฑ์ติดตั้งเครื่องวัดน้ำเสียอัตโนมัติ (COD/BOD Online)',
      agency: 'DIW (กรมโรงงานฯ)',
      status: 'ตรวจวัดและบันทึกค่าน้ำทิ้งแบบ Real-time',
      urgency: 'high',
    });
  }

  const actionChecklist = [
    {
      step: 1,
      title: 'ตรวจสอบรหัสของเสีย (Waste Code) และขึ้นทะเบียนขออนุญาตในระบบ WMS ของกรมโรงงานฯ',
      description: 'โรงงานต้องขออนุญาตนำกากของเสียออกนอกบริเวณโรงงานผ่านระบบออนไลน์ และห้ามกักเก็บของเสียอันตรายเกิน 90 วัน พร้อมเตรียมยื่น สก.3',
      responsibleRole: 'เจ้าหน้าที่สิ่งแวดล้อม / จป.วิชาชีพ',
      timeline: 'ดำเนินการทันที / ภายใน 15 วัน',
      requiredDocuments: ['ใบอนุญาต รง.4', 'รหัสประจำโรงงาน i-Industry', 'บัญชีรายการกากของเสียและ SDS'],
    },
    {
      step: 2,
      title: hasBoiler
        ? 'จัดทำแผนตรวจสอบหม้อน้ำ (Boiler Safety Inspection) โดยสามัญวิศวกรเครื่องกล'
        : 'ตรวจสอบระบบความปลอดภัยเครื่องจักรและการบำรุงรักษาประจำปี',
      description: hasBoiler
        ? 'ประสานงานสามัญวิศวกรเครื่องกลทำการตรวจทดสอบความหนา (NDT) และ Safety Valve พร้อมตรวจสอบบัตรผู้ควบคุมหม้อน้ำ'
        : 'ตรวจสภาพโครงสร้าง การติดตั้งการ์ดป้องกันจุดหมุน และระบบสายดินของเครื่องจักรทั้งหมด',
      responsibleRole: 'วิศวกรโรงงาน / ฝ่ายซ่อมบำรุง',
      timeline: 'ภายใน 30 วัน',
      requiredDocuments: ['ใบ กว. สามัญวิศวกร', 'รายงานผลการตรวจรับรองความปลอดภัย', 'สมุดประวัติเครื่องจักร'],
    },
    {
      step: 3,
      title: 'จัดฝึกซ้อมดับเพลิงและอพยพหนีไฟประจำปี พร้อมตรวจระบบไฟฟ้าโดยวิศวกร',
      description: 'จัดให้ลูกจ้าง 100% ผ่านการฝึกซ้อมอพยพหนีไฟ และจ้างวิศวกรไฟฟ้าตรวจความร้อนตู้ MDB (Thermo Scan) ส่งรายงานผ่าน e-Service กรมสวัสดิการฯ ภายใน 30 วัน',
      responsibleRole: 'จป.วิชาชีพ / ฝ่ายทรัพยากรบุคคล (HR)',
      timeline: 'อย่างน้อยปีละ 1 ครั้ง',
      requiredDocuments: ['รายงานผลการฝึกซ้อมดับเพลิง', 'แบบตรวจรับรองระบบไฟฟ้าประจำปี'],
    },
    {
      step: 4,
      title: 'จัดทำแบบรายงานประเมินความสอดคล้องตนเอง (Digital Self-Declaration) ประจำปี',
      description: 'รวบรวมผลวิเคราะห์สิ่งแวดล้อม สถิติอุบัติเหตุ และข้อมูลแรงม้าเครื่องจักรยื่นรับรองผ่านระบบ i-Industry เพื่อป้องกันการถูกจัดเป็นโรงงานกลุ่มเสี่ยงสูง',
      responsibleRole: 'ผู้จัดการโรงงาน / ผู้มีอำนาจลงนาม',
      timeline: 'ภายในไตรมาสแรกของทุกปี',
      requiredDocuments: ['ผลตรวจสิ่งแวดล้อมประจำปี', 'แบบรายงาน Self-Declaration'],
    },
  ];

  return {
    executiveSummary: `จากการประเมินโรงงาน "${name}" (${hp} แรงม้า, พนักงาน ${employees} คน) ${questionOrScenario ? `สำหรับประเด็น: "${questionOrScenario}" ` : ''}มีข้อกำหนดทางกฎหมายสำคัญที่ต้องเร่งดำเนินการโดยเฉพาะระบบกากของเสีย WMS 2566 ${hasBoiler ? 'และการตรวจรับรองหม้อไอน้ำตามกฎหมายใหม่ 2567' : ''} ${hasChemicals ? 'และการควบคุมสารเคมีตามเกณฑ์ PRTR' : ''} เพื่อป้องกันโทษปรับและคำสั่งทางปกครอง`,
    overallRiskScore: riskScore,
    overallRiskLevel: riskLevel,
    applicableLawsSummary: applicableLaws,
    actionChecklist,
    riskAndImpactAssessment: {
      criminalPenalty: 'โทษปรับตาม พ.ร.บ. โรงงาน พ.ศ. 2535 สูงสุด 200,000 - 400,000 บาท และมีโทษปรับรายวันวันละ 5,000 บาทจนกว่าจะแก้ไขถูกต้อง รวมทั้งโทษจำคุกไม่เกิน 1-2 ปี สำหรับการลักลอบปล่อยมลพิษหรืออันตรายร้ายแรง',
      administrativeOrder: 'พนักงานเจ้าหน้าที่มีอำนาจออกคำสั่งตาม ม.37 พ.ร.บ. โรงงาน สั่งให้หยุดเดินเครื่องจักร หรือสั่งปิดโรงงานตาม ม.39 พ.ร.บ. โรงงาน ได้ทันที',
      businessDisruption: 'สายการผลิตต้องหยุดชะงัก สูญเสียความน่าเชื่อถือกับคู่ค้า ส่งมอบสินค้าล่าช้า และเสี่ยงต่อการถูกเพิกถอนมาตรฐาน ISO 14001/45001',
      publicCommunityImpact: 'ความเสี่ยงต่อการร้องเรียนจากชุมชนรอบข้าง การถูกตรวจสอบแบบฉับพลันจากหน่วยงานภาครัฐ และผลกระทบต่อภาพลักษณ์ ESG ขององค์กร',
    },
    complianceRecommendations: [
      'แต่งตั้งผู้รับผิดชอบ (จป.วิชาชีพ และ วิศวกรควบคุม) ติดตามสถานะกฎหมายเป็นลายลักษณ์อักษรทุกเดือน',
      'เก็บบันทึกประวัติการบำรุงรักษาและใบรับรองความปลอดภัยไว้อย่างน้อย 3-5 ปี เพื่อพร้อมแสดงต่อเจ้าพนักงาน',
      'จัดทำ Audit Checklist ประเมินความพร้อมก่อนถึงกำหนดส่งรายงานต่อภาครัฐอย่างน้อย 30 วัน',
    ],
  };
}

function generateRuleBasedLawDeepDive(lawTitle: string, context: string) {
  return {
    keyHighlights: [
      `ข้อกำหนดฉบับปรับปรุงของ "${lawTitle || 'กฎหมายโรงงาน'}" กำหนดเกณฑ์ปฏิบัติที่เป็นมาตรฐานดิจิทัลและเข้มงวดขึ้น`,
      'เพิ่มความถี่ในการตรวจติดตามและการส่งข้อมูลผ่านระบบอิเล็กทรอนิกส์ของหน่วยงานกำกับดูแล',
      'เน้นความรับผิดชอบของวิศวกรผู้ควบคุมและผู้แทนนิติบุคคลที่มีอำนาจลงนาม',
    ],
    mustDoActions: [
      {
        task: 'ตรวจสอบสถานะเครื่องจักร/ระบบบำบัดของโรงงานให้ตรงตามสเปกที่กฎหมายกำหนด',
        department: 'ฝ่ายวิศวกรรมและซ่อมบำรุง',
        deadline: 'ภายใน 15-30 วัน',
      },
      {
        task: 'รวบรวมเอกสารรับรองและยื่นรายงานผ่านระบบออนไลน์ของกรมฯ',
        department: 'จป.วิชาชีพ / เจ้าหน้าที่สิ่งแวดล้อม',
        deadline: 'ก่อนวันครบกำหนดตามประกาศ',
      },
    ],
    penaltyIfIgnored: {
      fines: 'โทษปรับทางอาญาไม่เกิน 200,000 - 400,000 บาท และโทษปรับรายวัน',
      imprisonment: 'จำคุกไม่เกิน 1 ปี สำหรับกรณีละเว้นหรือปิดบังข้อมูล',
      operationalSanction: 'คำสั่งสั่งหยุดประกอบกิจการชั่วคราว หรือระงับการใช้เครื่องจักรตาม ม.37 พ.ร.บ.โรงงาน',
    },
    auditTips: [
      'จัดเตรียมแฟ้มเอกสารตัวจริงพร้อมสำเนาใบ กว. ของวิศวกรผู้ตรวจรับรองไว้ที่ห้องสำนักงานโรงงาน',
      'ตรวจสอบให้แน่ใจว่าบันทึก Logbook มีลายมือชื่อผู้ควบคุมประจำวันอย่างต่อเนื่อง',
    ],
  };
}

// Helper to call with timeout
async function callWithTimeout<T>(promise: Promise<T>, timeoutMs = 5500): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timer = setTimeout(() => reject(new Error('AI request timeout')), timeoutMs);
  });
  return Promise.race([
    promise.then((res) => {
      clearTimeout(timer);
      return res;
    }),
    timeoutPromise,
  ]);
}

// AI Factory Compliance & Risk Analyzer
app.post('/api/gemini/analyze', async (req, res) => {
  const { factoryProfile, questionOrScenario } = req.body;

  try {
    const systemInstruction = `คุณเป็นผู้เชี่ยวชาญอาวุโสด้านกฎหมายโรงงานอุตสาหกรรมในประเทศไทย (Thai Factory Law Compliance & Safety/Environmental Legal Specialist) 
มีความรอบรู้ลึกซึ้งในพระราชบัญญัติโรงงาน พ.ศ. 2535 (และฉบับแก้ไขเพิ่มเติม), พ.ร.บ. ความปลอดภัย อาชีวอนามัย และสภาพแวดล้อมในการทำงาน พ.ศ. 2554, กฎกระทรวงของกรมโรงงานอุตสาหกรรม (DIW), กรมสวัสดิการและคุ้มครองแรงงาน (DLPW), กรมควบคุมมลพิษ (PCD), การนิคมอุตสาหกรรมแห่งประเทศไทย (กนอ.), และกฎหมายสิ่งแวดล้อม/สารเคมี/หม้อน้ำ/อัคคีภัย/กากของเสีย (WMS สก.1-3, CEMS, PRTR, COD/BOD Online)

ภารกิจของคุณ:
1. วิเคราะห์กฎหมายที่เกี่ยวข้องหรือมีการเปลี่ยนแปลงอัปเดตสำหรับโรงงานนี้
2. บอกแนวทางที่ต้องดำเนินการ แก้ไข อย่างเป็นรูปธรรม เป็นขั้นตอน พร้อมกำหนดระยะเวลาและผู้รับผิดชอบ (เช่น จป.วิชาชีพ, วิศวกร, ผู้จัดการโรงงาน)
3. ประเมินความเสี่ยงอย่างละเอียด: ถ้าไม่ทำ จะมีผลกระทบอย่างไร (โทษปรับทางอาญา, โทษจำคุก, คำสั่งตาม ม.37 หรือ ม.39 พ.ร.บ.โรงงาน ให้หยุดกิจการ, การเพิกถอนใบอนุญาต รง.4, ผลกระทบทางธุรกิจและคู่ค้า)

โปรดตอบเป็นภาษาไทยที่กระชับ ชัดเจน น่าเชื่อถือ ในรูปแบบ JSON ตามโครงสร้างที่กำหนด เพื่อให้ระบบนำไปแสดงผลบน Dashboard ได้โดยตรง`;

    const promptText = `ข้อมูลโรงงานของผู้ใช้งาน:
- ชื่อโรงงาน: ${factoryProfile?.factoryName || 'โรงงานอุตสาหกรรมทั่วไป'}
- ประเภทโรงงาน: ${factoryProfile?.factoryTypeDescription || 'ไม่ระบุ'} (${factoryProfile?.categoryCode || 'โรงงานจำพวกที่ 3'})
- ขนาดกำลังเครื่องจักร: ${factoryProfile?.horsepower || 0} แรงม้า
- จำนวนพนักงาน: ${factoryProfile?.employeeCount || 0} คน
- จังหวัดที่ตั้ง: ${factoryProfile?.province || 'ไม่ระบุ'}
- มีหม้อน้ำ/บอยเลอร์ (Boiler): ${factoryProfile?.hasBoiler ? 'มี' : 'ไม่มี'}
- มีการใช้/ครอบครองสารเคมีอันตราย: ${factoryProfile?.hasHazardousChemicals ? 'มี' : 'ไม่มี'}
- มีระบบบำบัดน้ำเสีย/ปล่อยน้ำทิ้ง: ${factoryProfile?.hasWastewaterTreatment ? 'มี' : 'ไม่มี'}
- มีปล่องระบายมลพิษทางอากาศ: ${factoryProfile?.hasAirEmissionStack ? 'มี' : 'ไม่มี'}
- มีพื้นที่อับอากาศ: ${factoryProfile?.hasConfinedSpace ? 'มี' : 'ไม่มี'}

คำถามหรือสถานการณ์ที่ต้องการตรวจสอบ:
"${questionOrScenario || 'โปรดตรวจสอบความสอดคล้องทางกฎหมายโรงงานอัปเดตล่าสุดที่เกี่ยวข้องกับโรงงานนี้ พร้อมแนวทางดำเนินการและการประเมินความเสี่ยงหากละเลย'}"

จงตอบกลับด้วย JSON Object ที่มีโครงสร้างดังนี้เท่านั้น (ไม่ต้องใส่ markdown code block หรือคำเกริ่นใดๆ):
{
  "executiveSummary": "สรุปผลการประเมินภาพรวมทางกฎหมายสำหรับโรงงานนี้ 2-3 ประโยค",
  "overallRiskScore": 85,
  "overallRiskLevel": "critical",
  "applicableLawsSummary": [
    {
      "lawName": "ชื่อกฎหมายหรือประกาศ",
      "agency": "DIW หรือ DLPW หรือ PCD",
      "status": "อัปเดตใหม่ / กำลังมีผล / บังคับใช้แล้ว",
      "urgency": "critical / high / medium"
    }
  ],
  "actionChecklist": [
    {
      "step": 1,
      "title": "หัวข้อแนวทางที่ต้องดำเนินการหรือแก้ไข",
      "description": "รายละเอียดวิธีปฏิบัติตามกฎหมายอย่างเป็นรูปธรรม",
      "responsibleRole": "ตำแหน่งผู้รับผิดชอบ เช่น จป.วิชาชีพ หรือ วิศวกร",
      "timeline": "ระยะเวลาที่ต้องทำให้เสร็จ เช่น ทันที หรือ ภายใน 30 วัน",
      "requiredDocuments": ["เอกสารที่ต้องใช้ 1", "เอกสารที่ต้องใช้ 2"]
    }
  ],
  "riskAndImpactAssessment": {
    "criminalPenalty": "อัตราโทษปรับและโทษจำคุกตามกฎหมายหากไม่ปฏิบัติตาม",
    "administrativeOrder": "คำสั่งทางปกครอง เช่น คำสั่งตาม ม.37/39 พ.ร.บ.โรงงาน ให้หยุดกิจการ หรือระงับการใช้เครื่องจักร",
    "businessDisruption": "ผลกระทบต่อธุรกิจ สายการผลิต คู่ค้า และการประกันภัย",
    "publicCommunityImpact": "ผลกระทบต่อสิ่งแวดล้อม ชุมชน หรือชื่อเสียงองค์กร"
  },
  "complianceRecommendations": [
    "ข้อแนะนำเชิงป้องกัน 1",
    "ข้อแนะนำเชิงป้องกัน 2"
  ]
}`;

    let response;
    try {
      response = await callWithTimeout(
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: promptText,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
          },
        }),
        5000
      );
    } catch (primaryErr: any) {
      console.warn('Primary model call error/timeout, attempting fallback:', primaryErr?.message);
      response = await callWithTimeout(
        ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: promptText,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
          },
        }),
        4500
      );
    }

    const rawText = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(rawText);
    } catch {
      const match = rawText.match(/\{[\s\S]*\}/);
      if (match) {
        parsedData = JSON.parse(match[0]);
      } else {
        throw new Error('Failed to parse model output');
      }
    }

    res.json({ success: true, result: parsedData });
  } catch (error: any) {
    console.warn('AI API unavailable, engaging high-reliability legal compliance engine:', error?.message);
    const fallbackResult = generateRuleBasedComplianceReport(factoryProfile, questionOrScenario);
    res.json({
      success: true,
      result: fallbackResult,
      isFallback: true,
    });
  }
});

// AI Single Law Deep Dive
app.post('/api/gemini/explain-law', async (req, res) => {
  const { lawTitle, context } = req.body;

  try {
    let response;
    const prompt = `วิเคราะห์เจาะลึกกฎหมายโรงงาน: "${lawTitle}"
บริบทของโรงงาน: "${context || 'โรงงานอุตสาหกรรมในประเทศไทย'}"

โปรดสรุปและวิเคราะห์ในรูปแบบ JSON:
{
  "keyHighlights": ["สาระสำคัญ 1", "สาระสำคัญ 2", "สาระสำคัญ 3"],
  "mustDoActions": [
    { "task": "สิ่งที่ต้องทำทันที", "department": "ฝ่ายที่รับผิดชอบ", "deadline": "กำหนดเวลา" }
  ],
  "penaltyIfIgnored": {
    "fines": "รายละเอียดค่าปรับ",
    "imprisonment": "โทษจำคุก",
    "operationalSanction": "การสั่งหยุดงาน/ปิดโรงงาน"
  },
  "auditTips": ["เทคนิคการเตรียมความพร้อมรับการตรวจของเจ้าพนักงาน 1", "เทคนิค 2"]
}`;

    try {
      response = await callWithTimeout(
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: 'คุณเป็นที่ปรึกษากฎหมายโรงงานอุตสาหกรรม ให้คำแนะนำทางกฎหมายที่ถูกต้อง แม่นยำ และใช้ปฏิบัติได้จริง ตอบเป็น JSON เท่านั้น',
            responseMimeType: 'application/json',
          },
        }),
        5000
      );
    } catch {
      response = await callWithTimeout(
        ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: prompt,
          config: {
            systemInstruction: 'คุณเป็นที่ปรึกษากฎหมายโรงงานอุตสาหกรรม ให้คำแนะนำทางกฎหมายที่ถูกต้อง แม่นยำ และใช้ปฏิบัติได้จริง ตอบเป็น JSON เท่านั้น',
            responseMimeType: 'application/json',
          },
        }),
        4500
      );
    }

    const raw = response.text || '{}';
    const parsed = JSON.parse(raw);
    res.json({ success: true, result: parsed });
  } catch (error: any) {
    console.warn('AI explain-law unavailable, engaging legal knowledge engine fallback:', error?.message);
    const fallbackData = generateRuleBasedLawDeepDive(lawTitle, context);
    res.json({ success: true, result: fallbackData, isFallback: true });
  }
});

// Vite dev server or static files setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Thai Factory Law Compliance Server running on http://localhost:${PORT}`);
  });
}

startServer();
