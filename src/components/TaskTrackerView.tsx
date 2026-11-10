import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Plus, 
  Trash2, 
  Calendar, 
  User, 
  FileCheck2,
  Check,
  Filter
} from 'lucide-react';
import { ComplianceTask } from '../types/law';

interface TaskTrackerViewProps {
  tasks: ComplianceTask[];
  onToggleStatus: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onAddTaskManually: (task: Omit<ComplianceTask, 'id' | 'createdDate'>) => void;
}

export const TaskTrackerView: React.FC<TaskTrackerViewProps> = ({
  tasks,
  onToggleStatus,
  onDeleteTask,
  onAddTaskManually,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [isAdding, setIsAdding] = useState(false);
  
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newLawTitle, setNewLawTitle] = useState('');
  const [newPerson, setNewPerson] = useState('จป.วิชาชีพ');
  const [newDueDate, setNewDueDate] = useState('');
  const [newRiskLevel, setNewRiskLevel] = useState<'critical' | 'high' | 'medium'>('high');

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'all') return true;
    return t.status === filter;
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    onAddTaskManually({
      lawId: 'custom-task',
      lawTitle: newLawTitle || 'ข้อกำหนดความปลอดภัยภายในโรงงาน',
      taskTitle: newTaskTitle,
      responsiblePerson: newPerson,
      dueDate: newDueDate || 'ภายใน 30 วัน',
      status: 'pending',
      riskLevel: newRiskLevel,
    });

    setNewTaskTitle('');
    setNewLawTitle('');
    setIsAdding(false);
  };

  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length;
  const pendingCount = tasks.filter((t) => t.status === 'pending').length;

  return (
    <div className="space-y-6">
      
      {/* Top Header & Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-700 shadow flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">รายการงานทั้งหมด</div>
            <div className="text-2xl font-bold text-white font-mono mt-1">{tasks.length}</div>
          </div>
          <FileCheck2 className="w-8 h-8 text-blue-400 opacity-80" />
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-700 shadow flex items-center justify-between">
          <div>
            <div className="text-xs text-amber-400">กำลังดำเนินการ</div>
            <div className="text-2xl font-bold text-amber-300 font-mono mt-1">{inProgressCount}</div>
          </div>
          <Clock className="w-8 h-8 text-amber-400 opacity-80" />
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-700 shadow flex items-center justify-between">
          <div>
            <div className="text-xs text-red-400">รอดำเนินการ (Pending)</div>
            <div className="text-2xl font-bold text-red-300 font-mono mt-1">{pendingCount}</div>
          </div>
          <AlertCircle className="w-8 h-8 text-red-400 opacity-80" />
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-700 shadow flex items-center justify-between">
          <div>
            <div className="text-xs text-emerald-400">เสร็จสมบูรณ์แล้ว</div>
            <div className="text-2xl font-bold text-emerald-300 font-mono mt-1">{completedCount}</div>
          </div>
          <CheckCircle2 className="w-8 h-8 text-emerald-400 opacity-80" />
        </div>
      </div>

      {/* Main Task List Box */}
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-amber-400" />
              <span>รายการติดตามการปรับปรุงโรงงานให้ถูกต้องตามกฎหมาย</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              มอบหมายหน้าที่และติดตามกำหนดการส่งรายงานต่อเจ้าหน้าที่รัฐ
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-lg border border-slate-700 p-0.5 bg-slate-800 text-xs">
              <button
                onClick={() => setFilter('all')}
                className={`px-2.5 py-1 rounded font-medium transition cursor-pointer ${filter === 'all' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                ทั้งหมด
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-2.5 py-1 rounded font-medium transition cursor-pointer ${filter === 'pending' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                รอทำ
              </button>
              <button
                onClick={() => setFilter('in_progress')}
                className={`px-2.5 py-1 rounded font-medium transition cursor-pointer ${filter === 'in_progress' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                กำลังทำ
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-2.5 py-1 rounded font-medium transition cursor-pointer ${filter === 'completed' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                เสร็จแล้ว
              </button>
            </div>

            <button
              onClick={() => setIsAdding(!isAdding)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มงานใหม่</span>
            </button>
          </div>
        </div>

        {/* Add Task Form Drawer */}
        {isAdding && (
          <form onSubmit={handleCreateTask} className="p-4 rounded-xl bg-slate-850 border border-slate-700 space-y-3 animate-in fade-in">
            <h4 className="text-xs font-bold text-amber-300">เพิ่มแผนงานปฏิบัติตามกฎหมายใหม่</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">หัวข้องานที่ต้องทำ</label>
                <input
                  type="text"
                  placeholder="เช่น ตรวจทดสอบ Safety Valve หม้อน้ำประจำปี"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">กฎหมาย / ข้อกำหนดที่เกี่ยวข้อง</label>
                <input
                  type="text"
                  placeholder="เช่น กฎกระทรวงหม้อน้ำ 2567 หรือ ประกาศ WMS"
                  value={newLawTitle}
                  onChange={(e) => setNewLawTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">ผู้รับผิดชอบ / แผนก</label>
                <input
                  type="text"
                  value={newPerson}
                  onChange={(e) => setNewPerson(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">กำหนดส่ง / Due Date</label>
                <input
                  type="text"
                  placeholder="เช่น ภายใน 15 พ.ค. หรือ ก่อนสิ้นเดือน"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">ระดับความเร่งด่วน</label>
                <select
                  value={newRiskLevel}
                  onChange={(e) => setNewRiskLevel(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                >
                  <option value="critical">วิกฤต (เสี่ยงโดนสั่งหยุดงาน)</option>
                  <option value="high">สูง (มีกำหนดเวลาชัดเจน)</option>
                  <option value="medium">ปานกลาง</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950"
              >
                บันทึกงาน
              </button>
            </div>
          </form>
        )}

        {/* Task List items */}
        <div className="space-y-2.5">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              ไม่มีรายการงานในหมวดหมู่นี้
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div 
                key={task.id}
                className={`p-3.5 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  task.status === 'completed'
                    ? 'bg-slate-950/40 border-slate-800/80 opacity-70'
                    : 'bg-slate-850 border-slate-700/80 hover:border-slate-600'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => onToggleStatus(task.id)}
                    className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 cursor-pointer transition ${
                      task.status === 'completed'
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : task.status === 'in_progress'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                        : 'border-slate-600 hover:border-slate-400 text-transparent'
                    }`}
                    title="คลิกเพื่อเปลี่ยนสถานะ"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>

                  <div>
                    <h4 className={`text-sm font-bold text-white ${task.status === 'completed' ? 'line-through text-slate-400' : ''}`}>
                      {task.taskTitle}
                    </h4>
                    <div className="text-xs text-amber-400/90 font-medium mt-0.5">
                      อ้างอิง: {task.lawTitle}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1.5 flex-wrap">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        {task.responsiblePerson}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        ครบกำหนด: {task.dueDate}
                      </span>
                      <span>•</span>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                        task.riskLevel === 'critical' ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {task.riskLevel === 'critical' ? 'ความเสี่ยงวิกฤต' : 'ความเสี่ยงสูง'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => onToggleStatus(task.id)}
                    className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                  >
                    {task.status === 'completed' ? 'ทำซ้ำ' : task.status === 'in_progress' ? 'มาร์กเสร็จ' : 'เริ่มทำ'}
                  </button>
                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 rounded transition"
                    title="ลบงานนี้"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
