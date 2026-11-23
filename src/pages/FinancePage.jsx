// src/pages/FinancePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { PesoSign } from '../components/common/PesoSign';
import api from '../api/client';
import { PageHeader } from '../components/common/PageHeader';
import { DataTable } from '../components/common/DataTable';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Tabs } from '../components/common/Tabs';
import { GlassCard } from '../components/common/GlassCard';
import { useAuth } from '../context/AuthContext';
import {
  Receipt,
  Printer,
  FileText,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Wallet,
  Info
} from 'lucide-react';

export const FinancePage = () => {
  const { user, showToast } = useAuth();
  const isStudent = user?.role === 'Student';
  const isParent = user?.role === 'Parent/Guardian';
  const isAccountant = user?.role === 'Accountant' || user?.role === 'Super Administrator';
  // Students & parents get read-only view; accountants get full cashier terminal
  const [activeTab, setActiveTab] = useState('invoices');
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cashier Drawer Modal
  const [cashierModalOpen, setCashierModalOpen] = useState(false);
  const [payForm, setPayForm] = useState({
    student_id: 1,
    invoice_id: 1,
    amount: 12000,
    payment_method: 'GCash',
    reference_no: 'GC-99238411',
    remarks: 'Tuition installment collection',
  });
  const [submitting, setSubmitting] = useState(false);

  // Official Receipt Print Modal
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const fetchFinanceData = useCallback(async () => {
    setLoading(true);
    try {
      const [invRes, payRes] = await Promise.all([
        api.get('/finance/invoices'),
        api.get('/finance/payments'),
      ]);
      if (invRes.success) setInvoices(invRes.data);
      if (payRes.success) setPayments(payRes.data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchFinanceData();
  }, [fetchFinanceData]);

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/finance/payments', payForm);
      if (res.success) {
        showToast(`Official Receipt #${res.data.or_number} generated!`, 'success');
        setCashierModalOpen(false);
        fetchFinanceData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const invoiceColumns = [
    {
      header: 'Invoice No.',
      accessor: 'invoice_no',
      render: (row) => <span className="font-mono font-bold text-navy-700 dark:text-navy-400">{row.invoice_no}</span>,
    },
    {
      header: 'Student',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900 dark:text-white">{row.last_name}, {row.first_name}</p>
          <p className="text-[11px] font-mono text-slate-400">{row.student_number} â€¢ {row.program_code}</p>
        </div>
      ),
    },
    {
      header: 'Assessment Description',
      accessor: 'title',
    },
    {
      header: 'Total Amount',
      render: (row) => <span className="font-bold text-slate-900 dark:text-white">PHP {Number(row.amount).toLocaleString()}</span>,
    },
    {
      header: 'Outstanding Balance',
      render: (row) => (
        <span className={`font-bold ${Number(row.balance) > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
          PHP {Number(row.balance).toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Status',
      render: (row) => (
        <Badge variant={row.status === 'Paid' ? 'success' : (row.status === 'Partially Paid' ? 'warning' : 'danger')}>
          {row.status}
        </Badge>
      ),
    },
    {
      header: 'Action',
      className: 'text-right',
      render: (row) => (
        isAccountant ? (
        <Button
          size="sm"
          variant="primary"
          onClick={() => {
            setPayForm({
              student_id: row.student_id,
              invoice_id: row.id,
              amount: Number(row.balance) || 5000,
              payment_method: 'GCash',
              reference_no: 'GC-' + Math.floor(100000000 + Math.random() * 900000000),
              remarks: `Payment for ${row.invoice_no}`,
            });
            setCashierModalOpen(true);
          }}
        >
          Accept Payment
        </Button>
        ) : (
          <span className={`text-xs font-bold ${Number(row.balance) > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
            {Number(row.balance) > 0 ? 'Balance Due' : 'âœ“ Settled'}
          </span>
        )
      ),
    },
  ];

  const paymentColumns = [
    {
      header: 'OR Number',
      accessor: 'or_number',
      render: (row) => <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{row.or_number}</span>,
    },
    {
      header: 'Student',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900 dark:text-white">{row.last_name}, {row.first_name}</p>
          <p className="text-[11px] font-mono text-slate-400">{row.student_number}</p>
        </div>
      ),
    },
    {
      header: 'Amount Paid',
      render: (row) => <span className="font-extrabold text-slate-900 dark:text-white">PHP {Number(row.amount).toLocaleString()}</span>,
    },
    {
      header: 'Payment Method',
      render: (row) => (
        <span className="font-semibold text-slate-700 dark:text-slate-300">
          {row.payment_method}
        </span>
      ),
    },
    {
      header: 'Reference No.',
      accessor: 'reference_no',
      render: (row) => row.reference_no || 'Cash In Hand',
    },
    {
      header: 'Date & Cashier',
      render: (row) => (
        <div>
          <p className="text-xs text-slate-800 dark:text-slate-200">{new Date(row.payment_date).toLocaleDateString()}</p>
          <p className="text-[10px] text-slate-400">{row.cashier_name}</p>
        </div>
      ),
    },
    {
      header: 'Receipt',
      className: 'text-right',
      render: (row) => (
        <Button
          size="sm"
          variant="glass"
          icon={Printer}
          onClick={() => setSelectedReceipt(row)}
        >
          Print OR
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          isStudent ? 'My Tuition & Statement of Account' :
          isParent ? "Ward's Tuition & Billing Statement" :
          'Student Accounting & Cashier Collection'
        }
        subtitle={
          isStudent ? 'View your billing assessments, outstanding balances, and official payment receipts for this academic term' :
          isParent ? "Monitor your ward's tuition assessments and payment history" :
          'Manage billing statements, multi-channel payment acceptance (Cash, GCash, Maya, Bank Transfer), and Official Receipt (OR) generation'
        }
        actions={
          isAccountant ? (
            <Button
              variant="primary"
              icon={PesoSign}
              onClick={() => setCashierModalOpen(true)}
            >
              Open Cashier Drawer
            </Button>
          ) : null
        }
      />

      {/* Student / Parent: Summary cards */}
      {(isStudent || isParent) && !loading && invoices.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: 'Total Assessment',
              value: `PHP ${invoices.reduce((s, r) => s + Number(r.amount), 0).toLocaleString()}`,
              icon: FileText,
              color: 'navy',
              sub: `${invoices.length} billing item${invoices.length > 1 ? 's' : ''}`
            },
            {
              label: 'Total Paid',
              value: `PHP ${payments.reduce((s, r) => s + Number(r.amount), 0).toLocaleString()}`,
              icon: CheckCircle2,
              color: 'emerald',
              sub: `${payments.length} official receipt${payments.length > 1 ? 's' : ''}`
            },
            {
              label: 'Outstanding Balance',
              value: `PHP ${invoices.reduce((s, r) => s + Number(r.balance), 0).toLocaleString()}`,
              icon: TrendingDown,
              color: 'rose',
              sub: invoices.some(r => Number(r.balance) > 0) ? 'Has unpaid balance' : 'Fully paid âœ“'
            },
          ].map(({ label, value, icon: Icon, color, sub }) => (
            <GlassCard key={label} className={`p-5 border border-${color}-100 dark:border-${color}-900/40 bg-${color}-50/20 dark:bg-${color}-950/20`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</p>
                  <p className={`text-2xl font-extrabold text-${color}-600 dark:text-${color}-400 mt-1 tracking-tight`}>{value}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
                </div>
                <div className={`w-11 h-11 rounded-2xl bg-${color}-100 dark:bg-${color}-950/50 flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 text-${color}-600 dark:text-${color}-400`} />
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Payment notice banner for students */}
      {isStudent && invoices.some(r => Number(r.balance) > 0) && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-800 dark:text-amber-200">Outstanding Balance Reminder</p>
            <p className="text-amber-700 dark:text-amber-300 mt-0.5">
              You have an outstanding balance. Please proceed to the Cashier's Office or use GCash/Maya to settle your account.
              Clearance will not be issued until full payment or approved installment agreement is on file.
            </p>
          </div>
        </div>
      )}

      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: 'invoices', label: 'Billing Invoices & Assessments', icon: FileText, count: invoices.length },
          { id: 'payments', label: 'Official Receipts Collection Log', icon: Receipt, count: payments.length },
        ]}
      />

      {activeTab === 'invoices' ? (
        <DataTable
          columns={invoiceColumns}
          data={invoices}
          loading={loading}
          searchPlaceholder="Search invoices by invoice no or student name..."
        />
      ) : (
        <DataTable
          columns={paymentColumns}
          data={payments}
          loading={loading}
          searchPlaceholder="Search payment receipts by OR number or student name..."
        />
      )}

      {/* Cashier Payment Drawer Modal - Accountant only */}
      {isAccountant && (
      <Modal
        isOpen={cashierModalOpen}
        onClose={() => setCashierModalOpen(false)}
        title="Campus Cashier Collection Terminal"
        subtitle="Issue official receipt and reconcile student accounts"
      >
        <form onSubmit={handleProcessPayment} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Student Account *</label>
              <select
                value={payForm.student_id}
                onChange={e => setPayForm({ ...payForm, student_id: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="1">2026-10001 - Reyes, Keno (BSCS)</option>
                <option value="2">2026-10002 - Santos, Sophia (BSCS)</option>
                <option value="3">2026-10003 - Tan, Liam (BSCS)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Payment Method *</label>
              <select
                value={payForm.payment_method}
                onChange={e => setPayForm({ ...payForm, payment_method: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="Cash">Cash (Counter)</option>
                <option value="GCash">GCash E-Wallet</option>
                <option value="Maya">Maya E-Wallet</option>
                <option value="Bank Transfer">Bank Transfer / OTC Deposit</option>
                <option value="Check">Manager's Check</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Amount to Tender (PHP) *</label>
              <input
                type="number"
                step="100"
                required
                value={payForm.amount}
                onChange={e => setPayForm({ ...payForm, amount: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-sm font-extrabold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Transaction Ref No.</label>
              <input
                type="text"
                value={payForm.reference_no}
                onChange={e => setPayForm({ ...payForm, reference_no: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                placeholder="e.g. GC-88291039"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Cashier Remarks</label>
            <input
              type="text"
              value={payForm.remarks}
              onChange={e => setPayForm({ ...payForm, remarks: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button variant="secondary" onClick={() => setCashierModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={submitting}>Issue Official Receipt</Button>
          </div>
        </form>
      </Modal>
      )}

      {/* Official Receipt Print Preview Modal */}
      <Modal
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        title="Official Receipt (OR) Print Preview"
        subtitle="Republic of the Philippines â€¢ Bureau of Internal Revenue Registered"
        maxWidth="max-w-xl"
      >
        {selectedReceipt && (
          <div className="space-y-6">
            <div className="p-6 bg-white text-slate-900 rounded-2xl border-2 border-slate-900 print-card font-mono text-xs space-y-4 shadow-sm">
              {/* Receipt Header */}
              <div className="text-center pb-3 border-b border-dashed border-slate-400">
                <h3 className="text-base font-extrabold uppercase tracking-tight">
                  APEX STATE UNIVERSITY
                </h3>
                <p className="text-[10px] text-slate-600">
                  TIN: 009-847-210-000 â€¢ VAT-Registered
                </p>
                <p className="text-[10px] text-slate-600">
                  100 University Boulevard, Metro Manila
                </p>
                <p className="text-sm font-bold mt-2 text-navy-700">
                  OFFICIAL RECEIPT
                </p>
                <p className="text-xs font-bold text-rose-600">
                  NO: {selectedReceipt.or_number}
                </p>
              </div>

              {/* Transaction Metadata */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>DATE:</span>
                  <span>{selectedReceipt.payment_date}</span>
                </div>
                <div className="flex justify-between">
                  <span>RECEIVED FROM:</span>
                  <span className="font-bold">{selectedReceipt.last_name}, {selectedReceipt.first_name}</span>
                </div>
                <div className="flex justify-between">
                  <span>STUDENT NO:</span>
                  <span>{selectedReceipt.student_number}</span>
                </div>
                <div className="flex justify-between">
                  <span>PAYMENT METHOD:</span>
                  <span className="font-bold">{selectedReceipt.payment_method}</span>
                </div>
                <div className="flex justify-between">
                  <span>REFERENCE NO:</span>
                  <span>{selectedReceipt.reference_no || 'CASH'}</span>
                </div>
              </div>

              {/* Items Breakdown */}
              <div className="py-2 border-t border-b border-dashed border-slate-400 space-y-1">
                <div className="flex justify-between font-bold">
                  <span>PARTICULARS</span>
                  <span>AMOUNT</span>
                </div>
                <div className="flex justify-between">
                  <span>{selectedReceipt.remarks || 'Tuition & Academic Fees'}</span>
                  <span>PHP {Number(selectedReceipt.amount).toLocaleString()}</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between text-sm font-extrabold pt-1">
                <span>TOTAL AMOUNT PAID:</span>
                <span className="text-navy-700">PHP {Number(selectedReceipt.amount).toLocaleString()}</span>
              </div>

              {/* Cashier Footer */}
              <div className="pt-4 text-center border-t border-dashed border-slate-400 text-[10px]">
                <p>CASHIER IN CHARGE: <strong>{selectedReceipt.cashier_name}</strong></p>
                <p className="text-slate-500 mt-1">Thank you for your payment!</p>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="primary" icon={Printer} onClick={() => window.print()}>
                Print Official Receipt
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};



