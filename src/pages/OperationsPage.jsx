// src/pages/OperationsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import { PageHeader } from '../components/common/PageHeader';
import { DataTable } from '../components/common/DataTable';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Tabs } from '../components/common/Tabs';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Users2,
  Bell,
  Calendar,
  Award,
  Plus
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

  // Schedule Event Modal
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    venue: '',
    start_date: '',
    end_date: '',
    organizer: '',
    category: 'Academic',
  });

  // Register Asset Modal
  const [assetModalOpen, setAssetModalOpen] = useState(false);
  const [newAsset, setNewAsset] = useState({
    item_name: '',
    category: 'Equipment',
    quantity: 1,
    unit: 'pcs',
    location: '',
    condition_status: 'Good',
    unit_cost: 0,
  });

  const [submitting, setSubmitting] = useState(false);

  const fetchOperationsData = useCallback(async () => {
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
  }, [showToast]);

  useEffect(() => {
    fetchOperationsData();
  }, [fetchOperationsData]);

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/announcements', newNotice);
      if (res.success) {
        showToast('University announcement broadcasted successfully!', 'success');
        setBroadcastOpen(false);
        setNewNotice({ title: '', content: '', audience: 'All', priority: 'Normal' });
        fetchOperationsData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/events', newEvent);
      if (res.success) {
        showToast('Campus event scheduled successfully!', 'success');
        setEventModalOpen(false);
        setNewEvent({
          title: '',
          description: '',
          venue: '',
          start_date: '',
          end_date: '',
          organizer: '',
          category: 'Academic',
        });
        fetchOperationsData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateAsset = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/inventory', newAsset);
      if (res.success) {
        showToast('Inventory item registered successfully!', 'success');
        setAssetModalOpen(false);
        setNewAsset({
          item_name: '',
          category: 'Equipment',
          quantity: 1,
          unit: 'pcs',
          location: '',
          condition_status: 'Good',
          unit_cost: 0,
        });
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

  const eventColumns = [
    {
      header: 'Event Activity',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900 dark:text-white">{row.title}</p>
          <p className="text-xs text-slate-400 line-clamp-1">{row.description}</p>
        </div>
      ),
    },
    {
      header: 'Category',
      render: (row) => <Badge variant="purple">{row.category}</Badge>,
    },
    {
      header: 'Venue',
      accessor: 'venue',
      render: (row) => <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{row.venue}</span>,
    },
    {
      header: 'Schedule Range',
      render: (row) => (
        <div>
          <p className="text-xs font-mono font-medium text-slate-800 dark:text-slate-200">
            {new Date(row.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
          <p className="text-[11px] text-slate-400">
            {new Date(row.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(row.end_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      ),
    },
    {
      header: 'Organizer',
      accessor: 'organizer',
      render: (row) => <span className="text-xs text-slate-600 dark:text-slate-400">{row.organizer}</span>,
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
        subtitle="School inventory assets, HR employee management, campus events calendar, announcements, and graduation Latin Honors evaluation"
        actions={
          <div className="flex gap-2">
            {activeTab === 'inventory' && (
              <Button variant="primary" icon={Plus} onClick={() => setAssetModalOpen(true)}>
                Add Asset Item
              </Button>
            )}
            {activeTab === 'events' && (
              <Button variant="primary" icon={Plus} onClick={() => setEventModalOpen(true)}>
                Schedule Event
              </Button>
            )}
            {activeTab === 'announcements' && (
              <Button variant="primary" icon={Plus} onClick={() => setBroadcastOpen(true)}>
                Broadcast Notice
              </Button>
            )}
          </div>
        }
      />

      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: 'inventory', label: 'Inventory & Assets', icon: Box, count: inventory.length },
          { id: 'hr', label: 'HR Personnel', icon: Users2, count: employees.length },
          { id: 'events', label: 'Events & Activities', icon: Calendar, count: events.length },
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

      {activeTab === 'events' && (
        <DataTable
          columns={eventColumns}
          data={events}
          loading={loading}
          searchPlaceholder="Search events by title, venue, or organizer..."
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

      {/* Schedule Event Modal */}
      <Modal
        isOpen={eventModalOpen}
        onClose={() => setEventModalOpen(false)}
        title="Schedule University Event"
        subtitle="Plan ceremonies, seminars, sports, or academic activities"
      >
        <form onSubmit={handleCreateEvent} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Event Title *</label>
            <input
              type="text"
              required
              value={newEvent.title}
              onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              placeholder="e.g. 50th University Foundation Day"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
              <select
                value={newEvent.category}
                onChange={e => setNewEvent({ ...newEvent, category: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="Academic">Academic</option>
                <option value="Institutional">Institutional</option>
                <option value="Cultural">Cultural</option>
                <option value="Sports">Sports</option>
                <option value="Student Life">Student Life</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Venue Location</label>
              <input
                type="text"
                required
                value={newEvent.venue}
                onChange={e => setNewEvent({ ...newEvent, venue: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                placeholder="e.g. University Grand Gymnasium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Start Date & Time</label>
              <input
                type="datetime-local"
                required
                value={newEvent.start_date}
                onChange={e => setNewEvent({ ...newEvent, start_date: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">End Date & Time</label>
              <input
                type="datetime-local"
                required
                value={newEvent.end_date}
                onChange={e => setNewEvent({ ...newEvent, end_date: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Lead Organizer</label>
            <input
              type="text"
              required
              value={newEvent.organizer}
              onChange={e => setNewEvent({ ...newEvent, organizer: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              placeholder="e.g. Supreme Student Council / Office of Student Affairs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Brief Description</label>
            <textarea
              rows="3"
              value={newEvent.description}
              onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              placeholder="Enter activity highlights and agenda..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button variant="secondary" onClick={() => setEventModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={submitting}>Schedule Event</Button>
          </div>
        </form>
      </Modal>

      {/* Register Asset Modal */}
      <Modal
        isOpen={assetModalOpen}
        onClose={() => setAssetModalOpen(false)}
        title="Register Inventory Asset"
        subtitle="Log fixed equipment, lab apparatus, or IT facilities"
      >
        <form onSubmit={handleCreateAsset} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Item Name *</label>
            <input
              type="text"
              required
              value={newAsset.item_name}
              onChange={e => setNewAsset({ ...newAsset, item_name: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              placeholder="e.g. Dell PowerEdge Server Rack 42U"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Asset Category</label>
              <select
                value={newAsset.category}
                onChange={e => setNewAsset({ ...newAsset, category: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="IT Equipment">IT Equipment</option>
                <option value="Laboratory">Laboratory</option>
                <option value="Furniture">Furniture</option>
                <option value="AV & Multimedia">AV & Multimedia</option>
                <option value="Clinic">Clinic</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Assigned Location</label>
              <input
                type="text"
                required
                value={newAsset.location}
                onChange={e => setNewAsset({ ...newAsset, location: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                placeholder="e.g. IT Computer Lab 402"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Quantity</label>
              <input
                type="number"
                min="1"
                required
                value={newAsset.quantity}
                onChange={e => setNewAsset({ ...newAsset, quantity: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Unit</label>
              <input
                type="text"
                required
                value={newAsset.unit}
                onChange={e => setNewAsset({ ...newAsset, unit: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Unit Cost (₱)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={newAsset.unit_cost}
                onChange={e => setNewAsset({ ...newAsset, unit_cost: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button variant="secondary" onClick={() => setAssetModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={submitting}>Register Item</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
