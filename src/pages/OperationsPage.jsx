// src/pages/OperationsPage.jsx
import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { PageHeader } from '../components/common/PageHeader';
import { DataTable } from '../components/common/DataTable';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Tabs } from '../components/common/Tabs';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  Box,
  Users2,
  Bell,
  Calendar,
  Award,
  Plus,
  Send
} from 'lucide-react';

export const OperationsPage = () => {
  const { showToast } = useAuth();
  const [activeTab, setActiveTab] = useState('inventory');
  const [inventory, setInventory] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [graduates, setGraduates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Broadcast Announcement Modal
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [newNotice, setNewNotice] = useState({
    title: '',
    content: '',
    audience: 'All',
    priority: 'Normal',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchOperationsData = async () => {
    setLoading(true);
    try {
      const [invRes, empRes, annRes, evRes, gradRes] = await Promise.all([
        api.get('/inventory'),
        api.get('/hr/employees'),
        api.get('/announcements'),
        api.get('/events'),
        api.get('/graduation'),
      ]);
      if (invRes.success) setInventory(invRes.data);
      if (empRes.success) setEmployees(empRes.data);
      if (annRes.success) setAnnouncements(annRes.data);
      if (evRes.success) setEvents(evRes.data);
      if (gradRes.success) setGraduates(gradRes.data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOperationsData();
  }, []);

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/announcements', newNotice);
      if (res.success) {
        showToast('University announcement broadcasted successfully!', 'success');
        setBroadcastOpen(false);
        fetchOperationsData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const inventoryColumns = [
    {
      header: 'Asset Tag',
      accessor: 'asset_tag',
      render: (row) => <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{row.asset_tag}</span>,
    },
    {
      header: 'Item Description',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900 dark:text-white">{row.item_name}</p>
          <p className="text-[11px] text-slate-400">{row.category} • {row.quantity} {row.unit}</p>
        </div>
      ),
    },
    {
      header: 'Assigned Location',
      accessor: 'location',
    },
    {
      header: 'Condition Status',
      render: (row) => (
        <Badge variant={row.condition_status === 'Good' ? 'success' : 'warning'}>
          {row.condition_status}
        </Badge>
      ),
    },
    {
      header: 'Unit Cost',
      render: (row) => <span className="font-bold">₱{Number(row.unit_cost).toLocaleString()}</span>,
    },
  ];

  const employeeColumns = [
    {
      header: 'Employee ID',
      accessor: 'employee_id',
      render: (row) => <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{row.employee_id}</span>,
    },
    {
      header: 'Staff Member',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900 dark:text-white">{row.first_name} {row.last_name}</p>
          <p className="text-xs text-slate-400">{row.position}</p>
        </div>
      ),
    },
    {
      header: 'Department',
      accessor: 'department',
    },
    {
      header: 'Employment Type',
      accessor: 'employment_type',
    },
    {
      header: 'Status',
      render: (row) => <Badge variant={row.status === 'Active' ? 'success' : 'default'}>{row.status}</Badge>,
    },
  ];

  const announcementColumns = [
    {
      header: 'Notice Title',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900 dark:text-white">{row.title}</p>
          <p className="text-xs text-slate-500 line-clamp-1">{row.content}</p>
        </div>
      ),
    },
    {
      header: 'Target Audience',
      render: (row) => <Badge variant="purple">{row.audience}</Badge>,
    },
    {
      header: 'Priority',
      render: (row) => (
        <Badge variant={row.priority === 'Urgent' ? 'danger' : (row.priority === 'Important' ? 'warning' : 'default')}>
          {row.priority}
        </Badge>
      ),
    },
    {
      header: 'Author & Date',
      render: (row) => (
        <div>
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{row.author_name}</p>
          <p className="text-[10px] text-slate-400">{new Date(row.created_at).toLocaleDateString()}</p>
        </div>
      ),
    },
  ];

  const graduateColumns = [
    {
      header: 'Student',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900 dark:text-white">{row.last_name}, {row.first_name}</p>
          <p className="text-[11px] font-mono text-slate-400">{row.student_number} • {row.program_code}</p>
        </div>
      ),
    },
    {
      header: 'Cumulative GPA',
      render: (row) => <span className="font-extrabold text-base text-indigo-600 dark:text-indigo-400">{row.gpa}</span>,
    },
    {
      header: 'Academic Honors Distinction',
      render: (row) => (
        row.academic_distinction !== 'None' ? (
          <Badge variant="success" className="font-extrabold">🏆 {row.academic_distinction}</Badge>
        ) : <span className="text-slate-400 text-xs">Standard Conferment</span>
      ),
    },
    {
      header: 'Clearance Status',
      render: (row) => (
        <Badge variant={row.clearance_status === 'Cleared' ? 'success' : 'warning'}>
          {row.clearance_status}
        </Badge>
      ),
    },
    {
      header: 'Graduation Standing',
      render: (row) => <Badge variant="purple">{row.status}</Badge>,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Institutional Operations & Administration"
        subtitle="School inventory assets, HR employee management, campus-wide announcements, and graduation Latin Honors evaluation"
        actions={
          activeTab === 'announcements' && (
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => setBroadcastOpen(true)}
            >
              Broadcast Notice
            </Button>
          )
        }
      />

      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: 'inventory', label: 'Inventory & Assets', icon: Box, count: inventory.length },
          { id: 'hr', label: 'HR Personnel', icon: Users2, count: employees.length },
          { id: 'announcements', label: 'Announcements', icon: Bell, count: announcements.length },
          { id: 'graduation', label: 'Graduation & Latin Honors', icon: Award, count: graduates.length },
        ]}
      />

      {activeTab === 'inventory' && (
        <DataTable
          columns={inventoryColumns}
          data={inventory}
          loading={loading}
          searchPlaceholder="Search assets by tag or equipment name..."
        />
      )}

      {activeTab === 'hr' && (
        <DataTable
          columns={employeeColumns}
          data={employees}
          loading={loading}
          searchPlaceholder="Search employees by name or position..."
        />
      )}

      {activeTab === 'announcements' && (
        <DataTable
          columns={announcementColumns}
          data={announcements}
          loading={loading}
          searchPlaceholder="Search notices by title or content..."
        />
      )}

      {activeTab === 'graduation' && (
        <DataTable
          columns={graduateColumns}
          data={graduates}
          loading={loading}
          searchPlaceholder="Search graduation candidates..."
        />
      )}

      {/* Broadcast Announcement Modal */}
      <Modal
        isOpen={broadcastOpen}
        onClose={() => setBroadcastOpen(false)}
        title="Broadcast Campus-Wide Announcement"
        subtitle="Publish notices to students, faculty, or all stakeholders"
      >
        <form onSubmit={handlePostAnnouncement} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Headline Title *</label>
            <input
              type="text"
              required
              value={newNotice.title}
              onChange={e => setNewNotice({ ...newNotice, title: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Target Audience</label>
              <select
                value={newNotice.audience}
                onChange={e => setNewNotice({ ...newNotice, audience: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="All">All University Community</option>
                <option value="Students">Students Only</option>
                <option value="Faculty">Faculty Only</option>
                <option value="Parents">Parents Only</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Urgency Priority</label>
              <select
                value={newNotice.priority}
                onChange={e => setNewNotice({ ...newNotice, priority: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="Normal">Normal Notification</option>
                <option value="Important">Important Memorandum</option>
                <option value="Urgent">Urgent Campus Alert</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Notice Body Content *</label>
            <textarea
              rows="4"
              required
              value={newNotice.content}
              onChange={e => setNewNotice({ ...newNotice, content: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button variant="secondary" onClick={() => setBroadcastOpen(false)}>Cancel</Button>
            <Button type="submit" loading={submitting}>Publish Broadcast</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
