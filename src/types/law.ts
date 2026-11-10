export type RegulatoryAgency = 'DIW' | 'DLPW' | 'PCD' | 'IEAT' | 'DDC' | 'DEDE';

export type LawCategory = 
  | 'environment' 
  | 'safety' 
  | 'hazardous' 
  | 'machinery' 
  | 'wastewater' 
  | 'air_pollution' 
  | 'fire_protection' 
  | 'energy_carbon';

export type LawStatus = 'active' | 'upcoming' | 'draft';
export type UrgencyLevel = 'critical' | 'high' | 'medium' | 'low';

export interface ActionPlanStep {
  step: number;
  title: string;
  description: string;
  responsibleRole: string; // e.g. "จป.วิชาชีพ", "วิศวกรผู้ควบคุม", "ผู้จัดการโรงงาน"
  deadlineInfo: string;
  requiredDocuments: string[];
}

export interface RiskAssessment {
  criminalFine: string; // e.g. "ปรับสูงสุด 200,000 บาท หรือปรับรายวันวันละ 5,000 บาท"
  imprisonment: string; // e.g. "จำคุกไม่เกิน 1 ปี"
  administrativeSanction: string; // e.g. "คำสั่งหยุดประกอบกิจการชั่วคราวตาม ม.37 หรือสั่งปิดโรงงานตาม ม.39 พ.ร.บ.โรงงาน"
  businessImpact: string; // e.g. "กระทบต่อใบอนุญาต รง.4, สูญเสียสัญญาคู่ค้า, ผิดมาตรฐาน ISO 14001/45001"
  riskScore: number; // 0 - 100
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
}

export interface LawComparison {
  originalRequirement: string;
  updatedRequirement: string;
  keyChanges: string[];
}

export interface IndustrialLaw {
  id: string;
  code: string; // e.g. "ประกาศ อก. 2566/กากอุตสาหกรรม"
  title: string;
  agency: RegulatoryAgency;
  agencyFullName: string;
  category: LawCategory;
  categoryThai: string;
  publicationDate: string; // e.g. "2566-06-01"
  effectiveDate: string; // e.g. "2566-11-01"
  status: LawStatus;
  urgency: UrgencyLevel;
  summary: string;
  comparison: LawComparison;
  actionPlan: ActionPlanStep[];
  riskAssessment: RiskAssessment;
  applicableCriteria: {
    factoryTypes: string[]; // e.g. ["โรงงานประเภทที่ 3", "ลำดับที่ 105", "อุตสาหกรรมเคมี", "โรงงานทั่วไปที่มีบอยเลอร์"]
    hasBoiler?: boolean;
    hasHazardousChemicals?: boolean;
    hasWastewater?: boolean;
    hasAirEmissions?: boolean;
    minHorsepower?: number;
    minEmployees?: number;
  };
  officialLink?: string;
  downloadUrl?: string;
  tags: string[];
}

export interface FactoryProfile {
  factoryName: string;
  factoryLicenseNo: string; // รง.4
  factoryTypeDescription: string; // e.g. "ผลิตชิ้นส่วนยานยนต์และเคลือบสี"
  categoryCode: string; // e.g. "ลำดับที่ 64, 70"
  horsepower: number;
  employeeCount: number;
  province: string;
  hasBoiler: boolean;
  hasHazardousChemicals: boolean;
  hasWastewaterTreatment: boolean;
  hasAirEmissionStack: boolean;
  hasConfinedSpace: boolean;
  hasHeavyMachinery: boolean;
  notificationEnabled: boolean;
  soundAlertEnabled: boolean;
}

export interface LawAlertNotification {
  id: string;
  lawId: string;
  title: string;
  category: LawCategory;
  urgency: UrgencyLevel;
  agency: RegulatoryAgency;
  effectiveDate: string;
  message: string;
  actionRequired: string;
  penaltyWarning: string;
  timestamp: string;
  isRead: boolean;
  isDirectlyMatched: boolean;
}

export interface ComplianceTask {
  id: string;
  lawId: string;
  lawTitle: string;
  taskTitle: string;
  responsiblePerson: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed';
  riskLevel: UrgencyLevel;
  notes?: string;
  createdDate: string;
}
