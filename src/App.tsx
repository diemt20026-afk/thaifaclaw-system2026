import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Search, 
  Filter, 
  Flame, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Radio, 
  Bell, 
  Factory, 
  SlidersHorizontal,
  RefreshCw,
  FileCheck2,
  Calendar,
  AlertTriangle,
  Zap,
  ArrowRight
} from 'lucide-react';
import { 
  IndustrialLaw, 
  LawAlertNotification, 
  FactoryProfile, 
  ComplianceTask, 
  RegulatoryAgency, 
  LawCategory 
} from './types/law';
import { 
  industrialLawsData, 
  initialAlertNotifications, 
  initialFactoryProfile 
} from './data/lawsData';
import { Header } from './components/Header';
import { NotificationBanner } from './components/NotificationBanner';
import { LawCard } from './components/LawCard';
import { LawDetailModal } from './components/LawDetailModal';
import { RiskMatrixView } from './components/RiskMatrixView';
import { AiComplianceAdvisor } from './components/AiComplianceAdvisor';
import { FactoryProfileModal } from './components/FactoryProfileModal';
import { TaskTrackerView } from './components/TaskTrackerView';
import { 
  requestNotificationPermission, 
  sendBrowserNotification, 
  isLawMatchedWithFactory 
} from './utils/notifications';
import { playAlertSound } from './utils/sound';

export default function App() {
  // Navigation tab
  const [activeTab, setActiveTab] = useState<'laws' | 'risk' | 'ai' | 'tasks' | 'alerts'>('laws');

  // Core Data
  const [laws, setLaws] = useState<IndustrialLaw[]>(industrialLawsData);
  const [alerts, setAlerts] = useState<LawAlertNotification[]>(() => {
    const saved = localStorage.getItem('thai_factory_alerts');
    return saved ? JSON.parse(saved) : initialAlertNotifications;
  });
  const [factoryProfile, setFactoryProfile] = useState<FactoryProfile>(() => {
    const saved = localStorage.getItem('thai_factory_profile');
    return saved ? JSON.parse(saved) : initialFactoryProfile;
  });

  // Compliance Tasks
  const [tasks, setTasks] = useState<ComplianceTask[]>(() => {
    const saved = localStorage.getItem('thai_factory_tasks');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'task-1',
        lawId: 'law-diw-waste-2566',
        lawTitle: 'ประกาศกระทรวงอุตสาหกรรม (กากของเสีย WMS 2566)',
        taskTitle: 'ตรวจสอบรหัสของเสีย (Waste Code) และยื่น สก.3 ผ่านระบบ WMS',
        responsiblePerson: 'เจ้าหน้าที่สิ่งแวดล้อม',
        dueDate: 'ก่อนวันที่ 1 เมษายน',
        status: 'in_progress',
        riskLevel: 'critical',
        createdDate: '2567-03-10',
      },
      {
        id: 'task-2',
        lawId: 'law-dlpw-boiler-2567',
        lawTitle: 'กฎกระทรวงหม้อน้ำ 2567 (DLPW)',
        taskTitle: 'นัดหมายสามัญวิศวกรเครื่องกลเข้าตรวจ NDT ความหนาหม้อไอน้ำ',
        responsiblePerson: 'วิศวกรโรงงาน',
        dueDate: 'ภายใน 30 วัน',
        status: 'pending',
        riskLevel: 'critical',
        createdDate: '2567-04-02',
      },
      {
        id: 'task-3',
        lawId: 'law-dlpw-fire-2566',
        lawTitle: 'กฎกระทรวงการป้องกันและระงับอัคคีภัย',
        taskTitle: 'ซักซ้อมดับเพลิงและฝึกซ้อมอพยพหนีไฟประจำปี 100% พนักงาน',
        responsiblePerson: 'จป.วิชาชีพ / HR',
        dueDate: 'ไตรมาส 3',
        status: 'completed',
        riskLevel: 'high',
        createdDate: '2567-01-15',
      },
    ];
  });

  // Selected law modal
  const [selectedLaw, setSelectedLaw] = useState<IndustrialLaw | null>(null);

  // Profile modal
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgency, setSelectedAgency] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterOnlyMatched, setFilterOnlyMatched] = useState(true);

  // Banner
  const [dismissedBannerAlertId, setDismissedBannerAlertId] = useState<string | null>(null);

  // Notification Permission state
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('thai_factory_alerts', JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem('thai_factory_profile', JSON.stringify(factoryProfile));
  }, [factoryProfile]);

  useEffect(() => {
    localStorage.setItem('thai_factory_tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Request browser notification
  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    if (typeof Notification !== 'undefined') {
      setNotificationPermission(Notification.permission);
    }
    if (granted && soundEnabled) {
      playAlertSound('success');
    }
  };

  // Mark all alerts as read
  const handleMarkAllAlertsRead = () => {
    setAlerts(alerts.map((a) => ({ ...a, isRead: true })));
  };

  // Open law by ID from notification
  const handleSelectLawById = (lawId: string) => {
    const found = laws.find((l) => l.id === lawId);
    if (found) {
      setSelectedLaw(found);
      // mark notification as read
      setAlerts(alerts.map((a) => (a.lawId === lawId ? { ...a, isRead: true } : a)));
    }
  };

  // Real Legislative Update & Gazette Verification State
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false);
  const [lastCheckedTime, setLastCheckedTime] = useState<string>('');
  const [checkStatusNotification, setCheckStatusNotification] = useState<{
    type: 'clean' | 'updated';
    message: string;
  } | null>(null);

  // Real Automated Update Checker
  const handleCheckRealUpdates = async (silent = false) => {
    setIsCheckingUpdates(true);
    try {
      const res = await fetch('/api/laws/check-updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          knownLawIds: laws.map((l) => l.id),
          factoryProfile,
        }),
      });

      const data = await res.json();
      const timeStr = data.checkedAt || new Date().toLocaleTimeString('th-TH');
      setLastCheckedTime(timeStr);

      if (data.hasUpdates && Array.isArray(data.updates) && data.updates.length > 0) {
        // True new laws or amendments found
        const newLaws: IndustrialLaw[] = data.updates;
        const newAlertsList: LawAlertNotification[] = newLaws.map((law) => ({
          id: `alert-real-${law.id}-${Date.now()}`,
          lawId: law.id,
          title: `ประกาศกฎหมายใหม่: ${law.title}`,
          category: law.category,
          urgency: law.urgency,
          agency: law.agency,
          effectiveDate: law.effectiveDate,
          message: law.summary,
          actionRequired: law.actionPlan?.[0]?.title || 'ตรวจสอบแนวทางปฏิบัติตามข้อกำหนดใหม่',
          penaltyWarning: law.riskAssessment?.criminalFine || 'มีบทลงโทษตาม พ.ร.บ.โรงงาน',
          timestamp: `ประกาศล่าสุด (${timeStr})`,
          isRead: false,
          isDirectlyMatched: true,
        }));

        setAlerts((prev) => [...newAlertsList, ...prev]);
        setLaws((prev) => [...newLaws, ...prev]);
        setDismissedBannerAlertId(null);

        // Sound & Browser notification only when there's an actual update
        if (newAlertsList.length > 0) {
          sendBrowserNotification(newAlertsList[0], soundEnabled);
        }

        setCheckStatusNotification({
          type: 'updated',
          message: `พบการแก้ไข/ประกาศกฎหมายใหม่ ${newLaws.length} ฉบับ ที่เกี่ยวข้องกับโรงงานคุณ`,
        });
      } else {
        // NO updates: Do not alert, show calm confirmation
        if (!silent) {
          setCheckStatusNotification({
            type: 'clean',
            message: 'ตรวจสอบฐานข้อมูลราชกิจจานุเบกษาและกรมโรงงานฯ แล้ว: กฎหมายทั้งหมดเป็นปัจจุบัน ไม่มีประกาศใหม่ที่กระทบโรงงานของคุณ',
          });
          setTimeout(() => {
            setCheckStatusNotification(null);
          }, 6000);
        }
      }
    } catch (err) {
      console.error('Failed to check real law updates:', err);
      if (!silent) {
        setCheckStatusNotification({
          type: 'clean',
          message: 'เชื่อมต่อฐานข้อมูลกรมโรงงานฯ ไม่สำเร็จ โปรดตรวจสอบการเชื่อมต่ออินเทอร์เน็ต',
        });
      }
    } finally {
      setIsCheckingUpdates(false);
    }
  };

  // Automated background surveillance check on mount & periodically
  useEffect(() => {
    // Initial silent check on load
    handleCheckRealUpdates(true);

    // Auto-check every 5 minutes in background
    const interval = setInterval(() => {
      handleCheckRealUpdates(true);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [factoryProfile]);

  // Add task helper
  const handleAddTask = (law: IndustrialLaw, stepTitle: string, role: string) => {
    const newTask: ComplianceTask = {
      id: `task-${Date.now()}`,
      lawId: law.id,
      lawTitle: law.title,
      taskTitle: stepTitle,
      responsiblePerson: role,
      dueDate: 'ภายใน 30 วัน',
      status: 'pending',
      riskLevel: law.urgency,
      createdDate: new Date().toLocaleDateString('th-TH'),
    };
    setTasks([newTask, ...tasks]);
    setCheckStatusNotification({
      type: 'clean',
      message: `✓ บันทึก "${stepTitle}" ลงในรายการติดตามงาน (Action Plan) เรียบร้อยแล้ว`,
    });
    setTimeout(() => setCheckStatusNotification(null), 4000);
  };

  const handleAddTaskFromAi = (title: string, role: string, dueDate: string) => {
    const newTask: ComplianceTask = {
      id: `task-${Date.now()}`,
      lawId: 'ai-recommendation',
      lawTitle: 'ข้อเสนอแนะจากการประเมินด้วย AI',
      taskTitle: title,
      responsiblePerson: role,
      dueDate: dueDate || 'ภายในกำหนด',
      status: 'pending',
      riskLevel: 'high',
      createdDate: new Date().toLocaleDateString('th-TH'),
    };
    setTasks([newTask, ...tasks]);
    setCheckStatusNotification({
      type: 'clean',
      message: `✓ บันทึกข้อเสนอแนะ "${title}" ลงในรายการติดตามงานเรียบร้อยแล้ว`,
    });
    setTimeout(() => setCheckStatusNotification(null), 4000);
  };

  const handleToggleTaskStatus = (taskId: string) => {
    setTasks(
      tasks.map((t) => {
        if (t.id === taskId) {
          const nextStatus = t.status === 'pending' ? 'in_progress' : t.status === 'in_progress' ? 'completed' : 'pending';
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter((t) => t.id !== taskId));
  };

  const handleAddTaskManually = (taskData: Omit<ComplianceTask, 'id' | 'createdDate'>) => {
    const newTask: ComplianceTask = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdDate: new Date().toLocaleDateString('th-TH'),
    };
    setTasks([newTask, ...tasks]);
  };

  // Filtered laws list
  const filteredLaws = laws.filter((law) => {
    // text search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = 
        law.title.toLowerCase().includes(q) ||
        law.code.toLowerCase().includes(q) ||
        law.summary.toLowerCase().includes(q) ||
        law.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchText) return false;
    }

    // agency filter
    if (selectedAgency !== 'all' && law.agency !== selectedAgency) {
      return false;
    }

    // category filter
    if (selectedCategory !== 'all' && law.category !== selectedCategory) {
      return false;
    }

    // factory matched filter
    if (filterOnlyMatched && !isLawMatchedWithFactory(law, factoryProfile)) {
      return false;
    }

    return true;
  });

  const unreadAlerts = alerts.filter((a) => !a.isRead);
  const latestAlert = alerts.length > 0 && alerts[0].id !== dismissedBannerAlertId ? alerts[0] : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Sarabun','Plus_Jakarta_Sans',sans-serif]">
      
      {/* Top Header */}
      <Header
        factoryProfile={factoryProfile}
        unreadCount={unreadAlerts.length}
        alerts={alerts}
        onSelectLawById={handleSelectLawById}
        onMarkAllAlertsRead={handleMarkAllAlertsRead}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onCheckRealUpdates={() => handleCheckRealUpdates(false)}
        isCheckingUpdates={isCheckingUpdates}
        lastCheckedTime={lastCheckedTime}
        onRequestNotificationPermission={handleRequestPermission}
        notificationPermission={notificationPermission}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
      />

      {/* Real-time Status Confirmation (Shown when no updates or after checking) */}
      {checkStatusNotification && (
        <div className={`border-b text-xs py-2.5 px-4 text-center transition animate-in slide-in-from-top duration-200 flex items-center justify-center gap-2 ${
          checkStatusNotification.type === 'clean'
            ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300'
            : 'bg-amber-950/60 border-amber-500/30 text-amber-300'
        }`}>
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{checkStatusNotification.message}</span>
        </div>
      )}

      {/* Urgent Notification Banner */}
      <NotificationBanner
        latestAlert={latestAlert}
        onViewLaw={handleSelectLawById}
        onDismiss={() => {
          if (latestAlert) setDismissedBannerAlertId(latestAlert.id);
        }}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Navigation Tabs Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveTab('laws')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'laws'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
              }`}
            >
              <Radio className="w-4 h-4 text-slate-900 shrink-0" />
              <span>เรดาร์ & อัปเดตกฎหมาย ({filteredLaws.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('risk')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'risk'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
              }`}
            >
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>ประเมินความเสี่ยง & โทษปรับ</span>
            </button>

            <button
              onClick={() => setActiveTab('ai')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'ai'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
              }`}
            >
              <Sparkles className="w-4 h-4 text-purple-300 shrink-0" />
              <span>AI ตรวจสอบความสอดคล้อง</span>
            </button>

            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'tasks'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
              }`}
            >
              <FileCheck2 className="w-4 h-4 shrink-0" />
              <span>แผนงานแก้ไข ({tasks.filter(t => t.status !== 'completed').length})</span>
            </button>

            <button
              onClick={() => setActiveTab('alerts')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'alerts'
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
              }`}
            >
              <Bell className="w-4 h-4 shrink-0" />
              <span>ศูนย์แจ้งเตือน ({unreadAlerts.length})</span>
            </button>
          </div>

          {/* Official Update Check Action */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => handleCheckRealUpdates(false)}
              disabled={isCheckingUpdates}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition cursor-pointer disabled:opacity-50"
              title="ตรวจสอบฐานข้อมูลราชกิจจานุเบกษาและกรมโรงงานฯ ล่าสุด"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isCheckingUpdates ? 'animate-spin text-amber-400' : 'text-emerald-400'}`} />
              <span>{isCheckingUpdates ? 'กำลังเชื่อมต่อตรวจประกาศ...' : 'ตรวจอัปเดตกฎหมายตอนนี้'}</span>
            </button>
          </div>

        </div>

        {/* TAB 1: LAWS FEED & RADAR */}
        {activeTab === 'laws' && (
          <div className="space-y-6">
            
            {/* Filter & Search Bar */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                
                {/* Search text */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ค้นหาชื่อกฎหมาย, รหัสประกาศ, คำสำคัญ เช่น 'WMS', 'หม้อน้ำ', 'น้ำเสีย', 'รง.4', 'CEMS'..."
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                    >
                      ล้าง
                    </button>
                  )}
                </div>

                {/* Filter matched with factory toggle */}
                <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={filterOnlyMatched}
                    onChange={(e) => setFilterOnlyMatched(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-0 cursor-pointer"
                  />
                  <Factory className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-semibold">เฉพาะที่เกี่ยวข้องกับโรงงานคุณ</span>
                </label>
              </div>

              {/* Tag filters */}
              <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
                
                <span className="text-slate-400 font-semibold flex items-center gap-1 text-[11px] mr-1">
                  <Filter className="w-3 h-3" />
                  <span>หน่วยงาน:</span>
                </span>
                
                {['all', 'DIW', 'DLPW', 'PCD', 'DEDE'].map((agency) => (
                  <button
                    key={agency}
                    onClick={() => setSelectedAgency(agency)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                      selectedAgency === agency
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-750'
                    }`}
                  >
                    {agency === 'all' ? 'ทุกหน่วยงาน' : agency === 'DIW' ? 'กรมโรงงาน (DIW)' : agency === 'DLPW' ? 'กรมสวัสดิการฯ (DLPW)' : agency === 'PCD' ? 'ควบคุมมลพิษ (PCD)' : 'กรมพัฒนาพลังงาน'}
                  </button>
                ))}

                <span className="text-slate-400 font-semibold text-[11px] ml-2 mr-1">
                  หมวดหมู่:
                </span>
                
                {[
                  { key: 'all', label: 'ทั้งหมด' },
                  { key: 'environment', label: 'กากของเสีย' },
                  { key: 'machinery', label: 'หม้อน้ำ/เครื่องจักร' },
                  { key: 'air_pollution', label: 'มลพิษทางอากาศ' },
                  { key: 'wastewater', label: 'น้ำเสีย' },
                  { key: 'hazardous', label: 'สารเคมี' },
                  { key: 'fire_protection', label: 'อัคคีภัย' },
                ].map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => setSelectedCategory(cat.key)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                      selectedCategory === cat.key
                        ? 'bg-purple-600 text-white font-bold'
                        : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-750'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}

              </div>
            </div>

            {/* Laws Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredLaws.length === 0 ? (
                <div className="col-span-2 py-16 text-center text-slate-400 bg-slate-900/50 rounded-2xl border border-slate-800">
                  <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2 opacity-80" />
                  <p className="font-semibold text-white">ไม่พบกฎหมายตามเงื่อนไขที่ค้นหา</p>
                  <p className="text-xs text-slate-500 mt-1">ลองปิดตัวกรอง "เฉพาะที่เกี่ยวข้องกับโรงงานคุณ" หรือล้างคำค้นหา</p>
                </div>
              ) : (
                filteredLaws.map((law) => (
                  <LawCard
                    key={law.id}
                    law={law}
                    factoryProfile={factoryProfile}
                    onSelectLaw={(selected) => setSelectedLaw(selected)}
                    onAddToTaskTracker={(l) => {
                      if (l.actionPlan.length > 0) {
                        handleAddTask(l, l.actionPlan[0].title, l.actionPlan[0].responsibleRole);
                      }
                    }}
                  />
                ))
              )}
            </div>

          </div>
        )}

        {/* TAB 2: RISK MATRIX & FINES */}
        {activeTab === 'risk' && (
          <RiskMatrixView
            laws={laws}
            factoryProfile={factoryProfile}
            onSelectLaw={(selected) => setSelectedLaw(selected)}
          />
        )}

        {/* TAB 3: AI COMPLIANCE ADVISOR */}
        {activeTab === 'ai' && (
          <AiComplianceAdvisor
            factoryProfile={factoryProfile}
            onAddTask={handleAddTaskFromAi}
          />
        )}

        {/* TAB 4: TASKS TRACKER */}
        {activeTab === 'tasks' && (
          <TaskTrackerView
            tasks={tasks}
            onToggleStatus={handleToggleTaskStatus}
            onDeleteTask={handleDeleteTask}
            onAddTaskManually={handleAddTaskManually}
          />
        )}

        {/* TAB 5: ALERTS & NOTIFICATIONS CENTER */}
        {activeTab === 'alerts' && (
          <div className="space-y-6">
            
            {/* Surveillance Status Bar */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-slate-300 font-medium">
                  สถานะการเฝ้าระวังอัตโนมัติ: เชื่อมต่อฐานข้อมูลราชกิจจานุเบกษา และกรมโรงงานอุตสาหกรรม (DIW)
                </span>
              </div>
              <span className="text-slate-400 font-mono text-[11px]">
                ตรวจสอบล่าสุด: {lastCheckedTime || 'วันนี้'}
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Bell className="w-5 h-5 text-amber-400" />
                  <span>ศูนย์การแจ้งเตือนกฎหมายอุตสาหกรรม (เฉพาะเมื่อมีประกาศใหม่)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  ระบบจะแจ้งเตือนทันทีเฉพาะเมื่อตรวจพบการประกาศหรือแก้ไขกฎหมายใหม่ที่เกี่ยวข้องกับโรงงานของคุณ หากไม่มีการเปลี่ยนแปลงจะไม่มีการแจ้งเตือน
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCheckRealUpdates(false)}
                  disabled={isCheckingUpdates}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition cursor-pointer disabled:opacity-50"
                  title="ตรวจสอบฐานข้อมูลประกาศราชกิจจานุเบกษาล่าสุด"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isCheckingUpdates ? 'animate-spin text-amber-400' : 'text-emerald-400'}`} />
                  <span>{isCheckingUpdates ? 'กำลังเชื่อมต่อตรวจ...' : 'ตรวจอัปเดตเดี๋ยวนี้'}</span>
                </button>
                <button
                  onClick={handleMarkAllAlertsRead}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
                >
                  อ่านทั้งหมด
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  onClick={() => handleSelectLawById(alert.lawId)}
                  className={`p-4 rounded-xl border transition cursor-pointer hover:border-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    !alert.isRead ? 'bg-amber-950/20 border-amber-500/40' : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        alert.urgency === 'critical' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {alert.urgency === 'critical' ? 'วิกฤต' : 'สำคัญ'}
                      </span>
                      <span className="text-xs font-bold text-white">
                        {alert.title}
                      </span>
                      {!alert.isRead && (
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                      )}
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {alert.message}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1 flex-wrap">
                      <span className="text-red-400 font-medium">โทษ: {alert.penaltyWarning}</span>
                      <span>•</span>
                      <span>แนวทางแก้ไข: {alert.actionRequired}</span>
                      <span>•</span>
                      <span className="font-mono text-slate-500">{alert.timestamp}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button className="inline-flex items-center gap-1 text-xs text-amber-400 font-semibold hover:text-amber-300">
                      <span>เปิดอ่านรายละเอียด</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 bg-slate-900/60 py-6 text-xs text-slate-400 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span className="font-semibold text-slate-200">Thai Factory Law Radar & Compliance System</span>
            <span className="mx-2">•</span>
            <span>ระบบเฝ้าระวังและประเมินความเสี่ยงกฎหมายโรงงานอุตสาหกรรมในประเทศไทย</span>
          </div>
          <div className="text-slate-500">
            ฐานข้อมูลอ้างอิง: กรมโรงงานอุตสาหกรรม (DIW) | กรมสวัสดิการและคุ้มครองแรงงาน (DLPW) | กรมควบคุมมลพิษ (PCD)
          </div>
        </div>
      </footer>

      {/* Modals */}
      {selectedLaw && (
        <LawDetailModal
          law={selectedLaw}
          factoryProfile={factoryProfile}
          onClose={() => setSelectedLaw(null)}
          onAddTask={handleAddTask}
        />
      )}

      {isProfileModalOpen && (
        <FactoryProfileModal
          currentProfile={factoryProfile}
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          onSave={(newProfile) => setFactoryProfile(newProfile)}
        />
      )}

    </div>
  );
}
