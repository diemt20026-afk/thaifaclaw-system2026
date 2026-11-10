import React, { useState } from 'react';
import { 
  Bell, 
  ShieldAlert, 
  Factory, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  CheckCheck,
  ChevronRight,
  SlidersHorizontal,
  Flame,
  Radio
} from 'lucide-react';
import { FactoryProfile, LawAlertNotification } from '../types/law';

interface HeaderProps {
  factoryProfile: FactoryProfile;
  unreadCount: number;
  alerts: LawAlertNotification[];
  onSelectLawById: (lawId: string) => void;
  onMarkAllAlertsRead: () => void;
  onOpenProfile: () => void;
  onCheckRealUpdates: () => void;
  isCheckingUpdates: boolean;
  lastCheckedTime: string;
  onRequestNotificationPermission: () => void;
  notificationPermission: NotificationPermission;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  factoryProfile,
  unreadCount,
  alerts,
  onSelectLawById,
  onMarkAllAlertsRead,
  onOpenProfile,
  onCheckRealUpdates,
  isCheckingUpdates,
  lastCheckedTime,
  onRequestNotificationPermission,
  notificationPermission,
  soundEnabled,
  onToggleSound,
}) => {
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & System Brand */}
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-600 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/20 ring-2 ring-orange-400/30">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-amber-200 bg-clip-text text-transparent">
                  Thai Factory Law Radar
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live DIW Radar
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                ระบบตรวจสอบ & แจ้งเตือนกฎหมายโรงงานอุตสาหกรรมในประเทศไทย พร้อมแนวทางแก้ไขและประเมินความเสี่ยง
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Official Update Sync Check Button */}
            <button
              onClick={onCheckRealUpdates}
              disabled={isCheckingUpdates}
              title="ตรวจสอบประกาศกฎหมายใหม่จากราชกิจจานุเบกษาและกรมโรงงานอุตสาหกรรม"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 shadow-sm transition active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Radio className={`w-3.5 h-3.5 ${isCheckingUpdates ? 'animate-spin text-amber-400' : 'text-emerald-400'}`} />
              <span>{isCheckingUpdates ? 'กำลังเชื่อมต่อตรวจประกาศ...' : 'ตรวจอัปเดตกฎหมาย'}</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={onToggleSound}
              className={`p-2 rounded-lg border text-xs transition cursor-pointer ${
                soundEnabled 
                  ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700' 
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-500 hover:text-slate-400'
              }`}
              title={soundEnabled ? 'ปิดเสียงแจ้งเตือน' : 'เปิดเสียงแจ้งเตือน'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Browser Push Permission Button */}
            {notificationPermission !== 'granted' && (
              <button
                onClick={onRequestNotificationPermission}
                className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
                title="เปิดการแจ้งเตือนบนเบราว์เซอร์"
              >
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                <span>เปิดแจ้งเตือนบนจอ</span>
              </button>
            )}

            {/* Factory Profile Button */}
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition cursor-pointer group"
              title="ตั้งค่าข้อมูลโรงงาน เพื่อคัดกรองกฎหมายที่เกี่ยวข้อง"
            >
              <div className="w-7 h-7 rounded-md bg-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-105 transition">
                <Factory className="w-4 h-4" />
              </div>
              <div className="hidden sm:block">
                <div className="text-[11px] font-semibold text-slate-200 max-w-[140px] truncate">
                  {factoryProfile.factoryName}
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <span>{factoryProfile.horsepower} แรงม้า</span>
                  <span>•</span>
                  <span>{factoryProfile.employeeCount} คน</span>
                </div>
              </div>
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 ml-1 hidden sm:block" />
            </button>

            {/* Notification Bell with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                className={`relative p-2.5 rounded-xl border transition cursor-pointer ${
                  unreadCount > 0 
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30' 
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
                title="ศูนย์การแจ้งเตือนกฎหมาย"
              >
                <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'animate-bounce' : ''}`} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-md shadow-red-500/50">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {showNotificationDropdown && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-4 z-50 text-slate-100 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-orange-400" />
                      <h4 className="font-bold text-sm text-white">การแจ้งเตือนกฎหมายโรงงาน</h4>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-red-500/20 text-red-300 border border-red-500/30">
                          ใหม่ {unreadCount}
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={onMarkAllAlertsRead}
                        className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>อ่านทั้งหมด</span>
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60 my-2 space-y-1">
                    {alerts.length === 0 ? (
                      <div className="text-center py-8 text-slate-400 text-xs">
                        ยังไม่มีการแจ้งเตือนใหม่
                      </div>
                    ) : (
                      alerts.slice(0, 6).map((alert) => (
                        <div
                          key={alert.id}
                          onClick={() => {
                            onSelectLawById(alert.lawId);
                            setShowNotificationDropdown(false);
                          }}
                          className={`p-2.5 rounded-xl transition cursor-pointer hover:bg-slate-800/80 ${
                            !alert.isRead ? 'bg-amber-950/30 border-l-2 border-amber-500' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase ${
                              alert.urgency === 'critical'
                                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}>
                              {alert.urgency === 'critical' ? 'ด่วนที่สุด' : 'สำคัญ'}
                            </span>
                            <span className="text-[10px] text-slate-400">{alert.timestamp}</span>
                          </div>
                          <p className="text-xs font-semibold text-slate-100 mt-1 line-clamp-1">
                            {alert.title}
                          </p>
                          <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-2">
                            {alert.message}
                          </p>
                          <div className="mt-1 flex items-center justify-between text-[10px] text-amber-400 font-medium">
                            <span className="truncate max-w-[200px]">โทษ: {alert.penaltyWarning}</span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span className="truncate max-w-[200px]">ตรวจล่าสุด: {lastCheckedTime || 'เมื่อสักครู่'}</span>
                    <button
                      onClick={onCheckRealUpdates}
                      disabled={isCheckingUpdates}
                      className="text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <span>{isCheckingUpdates ? 'กำลังตรวจ...' : 'ตรวจอัปเดตเดี๋ยวนี้'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
