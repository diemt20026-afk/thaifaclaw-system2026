import React, { useState } from 'react';
import { 
  X, 
  Factory, 
  Check, 
  SlidersHorizontal, 
  Flame, 
  Droplet, 
  Wind, 
  Skull, 
  Wrench, 
  Bell, 
  Volume2 
} from 'lucide-react';
import { FactoryProfile } from '../types/law';

interface FactoryProfileModalProps {
  currentProfile: FactoryProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (newProfile: FactoryProfile) => void;
}

export const FactoryProfileModal: React.FC<FactoryProfileModalProps> = ({
  currentProfile,
  isOpen,
  onClose,
  onSave,
}) => {
  const [profile, setProfile] = useState<FactoryProfile>(currentProfile);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(profile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-850 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Factory className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white">
                ตั้งค่าข้อมูลและโปรไฟล์โรงงาน (Factory Profile)
              </h3>
              <p className="text-xs text-slate-400">
                ระบบจะใช้ข้อมูลนี้เพื่อคัดกรองกฎหมายที่เกี่ยวข้องและแจ้งเตือนเฉพาะฉบับที่บังคับใช้กับคุณ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-5 flex-1">
          
          {/* Basic Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              ข้อมูลทั่วไปตามใบอนุญาต รง.4
            </h4>
            
            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1">ชื่อโรงงาน / สถานประกอบการ</label>
              <input
                type="text"
                value={profile.factoryName}
                onChange={(e) => setProfile({ ...profile, factoryName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">เลขทะเบียนโรงงาน (รง.4)</label>
                <input
                  type="text"
                  value={profile.factoryLicenseNo}
                  onChange={(e) => setProfile({ ...profile, factoryLicenseNo: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">จังหวัดที่ตั้งโรงงาน</label>
                <input
                  type="text"
                  value={profile.province}
                  onChange={(e) => setProfile({ ...profile, province: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1">ลักษณะการประกอบกิจการ / ผลิตภัณฑ์</label>
              <input
                type="text"
                value={profile.factoryTypeDescription}
                onChange={(e) => setProfile({ ...profile, factoryTypeDescription: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">กำลังเครื่องจักร (แรงม้า: HP)</label>
                <input
                  type="number"
                  value={profile.horsepower}
                  onChange={(e) => setProfile({ ...profile, horsepower: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">จำนวนลูกจ้าง / พนักงาน (คน)</label>
                <input
                  type="number"
                  value={profile.employeeCount}
                  onChange={(e) => setProfile({ ...profile, employeeCount: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Equipment & Process Toggles */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              ลักษณะกระบวนการผลิตและอุปกรณ์เสี่ยง (เพื่อจับคู่กฎหมาย)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 cursor-pointer">
                <span className="flex items-center gap-2 text-xs text-slate-200">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span>มีหม้อน้ำ / บอยเลอร์ (Boiler)</span>
                </span>
                <input
                  type="checkbox"
                  checked={profile.hasBoiler}
                  onChange={(e) => setProfile({ ...profile, hasBoiler: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-0 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 cursor-pointer">
                <span className="flex items-center gap-2 text-xs text-slate-200">
                  <Skull className="w-4 h-4 text-purple-400" />
                  <span>มีสารเคมีอันตราย / วัตถุอันตราย</span>
                </span>
                <input
                  type="checkbox"
                  checked={profile.hasHazardousChemicals}
                  onChange={(e) => setProfile({ ...profile, hasHazardousChemicals: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-0 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 cursor-pointer">
                <span className="flex items-center gap-2 text-xs text-slate-200">
                  <Droplet className="w-4 h-4 text-blue-400" />
                  <span>มีระบบบำบัดน้ำเสีย / ระบายน้ำทิ้ง</span>
                </span>
                <input
                  type="checkbox"
                  checked={profile.hasWastewaterTreatment}
                  onChange={(e) => setProfile({ ...profile, hasWastewaterTreatment: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-0 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 cursor-pointer">
                <span className="flex items-center gap-2 text-xs text-slate-200">
                  <Wind className="w-4 h-4 text-emerald-400" />
                  <span>มีปล่องระบายมลพิษทางอากาศ</span>
                </span>
                <input
                  type="checkbox"
                  checked={profile.hasAirEmissionStack}
                  onChange={(e) => setProfile({ ...profile, hasAirEmissionStack: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-0 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 cursor-pointer">
                <span className="flex items-center gap-2 text-xs text-slate-200">
                  <Wrench className="w-4 h-4 text-yellow-400" />
                  <span>มีพื้นที่อับอากาศ (Confined Space)</span>
                </span>
                <input
                  type="checkbox"
                  checked={profile.hasConfinedSpace}
                  onChange={(e) => setProfile({ ...profile, hasConfinedSpace: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-0 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 cursor-pointer">
                <span className="flex items-center gap-2 text-xs text-slate-200">
                  <Factory className="w-4 h-4 text-slate-400" />
                  <span>เครื่องจักรหนัก / ปั้นจั่นเครน</span>
                </span>
                <input
                  type="checkbox"
                  checked={profile.hasHeavyMachinery}
                  onChange={(e) => setProfile({ ...profile, hasHeavyMachinery: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-0 cursor-pointer"
                />
              </label>

            </div>
          </div>

          {/* Notification settings */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              การตั้งค่าการแจ้งเตือน
            </h4>

            <div className="space-y-2">
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="flex items-center gap-2 text-xs text-slate-200">
                  <Bell className="w-4 h-4 text-amber-400" />
                  <span>แจ้งเตือนทันทีเมื่อมีกฎหมายใหม่ที่ตรงกับโรงงาน</span>
                </span>
                <input
                  type="checkbox"
                  checked={profile.notificationEnabled}
                  onChange={(e) => setProfile({ ...profile, notificationEnabled: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="flex items-center gap-2 text-xs text-slate-200">
                  <Volume2 className="w-4 h-4 text-amber-400" />
                  <span>เปิดเสียงสัญญาณแจ้งเตือนฉุกเฉิน (Alert Sound)</span>
                </span>
                <input
                  type="checkbox"
                  checked={profile.soundAlertEnabled}
                  onChange={(e) => setProfile({ ...profile, soundAlertEnabled: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-0"
                />
              </label>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>บันทึกข้อมูลโรงงาน</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
