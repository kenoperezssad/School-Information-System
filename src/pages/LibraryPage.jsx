// src/pages/LibraryPage.jsx
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
  BookOpen,
  BookmarkCheck,
  RotateCcw,
  Plus,
  AlertTriangle,
  Library,
  DollarSign
} from 'lucide-react';

export const LibraryPage = () => {
  const { showToast } = useAuth();
  const [activeTab, setActiveTab] = useState('catalog');
  const [books, setBooks] = useState([]);
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Issue Book Modal
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [issueForm, setIssueForm] = useState({
    book_id: 1,
    student_id: 1,
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchLibraryData = async () => {
    setLoading(true);
    try {
      const [bRes, lRes] = await Promise.all([
        api.get('/library/books'),
        api.get('/library/borrowings'),
      ]);
      if (bRes.success) setBooks(bRes.data);
      if (lRes.success) setBorrowings(lRes.data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibraryData();
  }, []);

  const handleIssueBook = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/library/borrow', issueForm);
      if (res.success) {
        showToast(`Book issued! Due date: ${res.data.due_date}`, 'success');
        setIssueModalOpen(false);
        fetchLibraryData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReturnBook = async (borrowingId) => {
    try {
      const res = await api.post('/library/return', { borrowing_id: borrowingId });
      if (res.success) {
        if (res.data.fine_amount > 0) {
          showToast(`Book returned! Overdue fine assessed: ₱${res.data.fine_amount}`, 'warning');
        } else {
          showToast('Book returned on time without fines.', 'success');
        }
        fetchLibraryData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const bookColumns = [
    {
      header: 'ISBN',
      accessor: 'isbn',
      render: (row) => <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{row.isbn}</span>,
    },
    {
      header: 'Book Title',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900 dark:text-white">{row.title}</p>
          <p className="text-xs text-slate-400">by {row.author} ({row.year_published})</p>
        </div>
      ),
    },
    {
      header: 'Category',
      render: (row) => <Badge variant="default">{row.category}</Badge>,
    },
    {
      header: 'Shelf Location',
      accessor: 'shelf_location',
    },
    {
      header: 'Availability',
      render: (row) => (
        <span className={`font-bold ${row.available_copies > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
          {row.available_copies} of {row.total_copies} Copies
        </span>
      ),
    },
  ];

  const borrowingColumns = [
    {
      header: 'Book Title',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900 dark:text-white">{row.book_title}</p>
          <p className="text-[11px] font-mono text-slate-400">ISBN: {row.isbn}</p>
        </div>
      ),
    },
    {
      header: 'Borrower',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900 dark:text-white">{row.last_name}, {row.first_name}</p>
          <p className="text-[11px] font-mono text-slate-400">{row.student_number}</p>
        </div>
      ),
    },
    {
      header: 'Borrowed Date',
      accessor: 'borrow_date',
    },
    {
      header: 'Due Date',
      render: (row) => <span className="font-semibold text-slate-800 dark:text-slate-200">{row.due_date}</span>,
    },
    {
      header: 'Status',
      render: (row) => (
        <Badge variant={row.status === 'Returned' ? 'success' : (row.status === 'Overdue' ? 'danger' : 'warning')}>
          {row.status}
        </Badge>
      ),
    },
    {
      header: 'Fine',
      render: (row) => (
        Number(row.fine_amount) > 0 ? (
          <span className="font-bold text-rose-600 dark:text-rose-400">₱{row.fine_amount}</span>
        ) : <span className="text-slate-400">—</span>
      ),
    },
    {
      header: 'Action',
      className: 'text-right',
      render: (row) => (
        row.status !== 'Returned' && (
          <Button
            size="sm"
            variant="glass"
            icon={RotateCcw}
            onClick={() => handleReturnBook(row.id)}
          >
            Mark Return
          </Button>
        )
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Library Information & Circulation"
        subtitle="Catalog discovery, inventory shelf tracking, student loans, and automated overdue fine calculations"
        actions={
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setIssueModalOpen(true)}
          >
            Issue Book Loan
          </Button>
        }
      />

      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: 'catalog', label: 'Book Collection Catalog', icon: BookOpen, count: books.length },
          { id: 'borrowings', label: 'Circulation & Borrowings', icon: BookmarkCheck, count: borrowings.length },
        ]}
      />

      {activeTab === 'catalog' ? (
        <DataTable
          columns={bookColumns}
          data={books}
          loading={loading}
          searchPlaceholder="Search catalog by title, author, or ISBN..."
        />
      ) : (
        <DataTable
          columns={borrowingColumns}
          data={borrowings}
          loading={loading}
          searchPlaceholder="Search loans by book title or borrower..."
        />
      )}

      {/* Issue Book Modal */}
      <Modal
        isOpen={issueModalOpen}
        onClose={() => setIssueModalOpen(false)}
        title="Issue Library Book Loan"
        subtitle="Standard loan duration is 14 calendar days"
      >
        <form onSubmit={handleIssueBook} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Select Book *</label>
            <select
              value={issueForm.book_id}
              onChange={e => setIssueForm({ ...issueForm, book_id: Number(e.target.value) })}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              {books.map(b => (
                <option key={b.id} value={b.id} disabled={b.available_copies <= 0}>
                  {b.title} ({b.available_copies} available)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Borrower Student *</label>
            <select
              value={issueForm.student_id}
              onChange={e => setIssueForm({ ...issueForm, student_id: Number(e.target.value) })}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              <option value="1">2026-10001 - Reyes, Keno (BSCS)</option>
              <option value="2">2026-10002 - Santos, Sophia (BSCS)</option>
              <option value="3">2026-10003 - Tan, Liam (BSCS)</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button variant="secondary" onClick={() => setIssueModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={submitting}>Confirm Loan</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
