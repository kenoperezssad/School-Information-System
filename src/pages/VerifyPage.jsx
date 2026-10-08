// src/pages/VerifyPage.jsx
import React, { useState } from 'react';
import api from '../api/client';
import { PageHeader } from '../components/common/PageHeader';
import { GlassCard } from '../components/common/GlassCard';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';
import {
  QrCode,
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  FileCheck,
  GraduationCap,
  Calendar,
  Lock
} from 'lucide-react';

export const VerifyPage = () => {
  const { showToast } = useAuth();
  const [tokenInput, setTokenInput] = useState('TOKEN-STUDENT-2026-10001');
  const [loading, setLoading] = useState(false);
  const [verifiedRecord, setVerifiedRecord] = useState(null);
  const [error, setError] = useState('');

  const sampleTokens = [
    { label: 'Student ID: Keno Reyes', token: 'TOKEN-STUDENT-2026-10001' },
    { label: 'Student Number: 2026-10001', token: '2026-10001' },
    { label: 'Official TOR Document Seal', token: 'DOC-VERIFY-TOR-10001' },
  ];

  const handleVerify = async (tokenToTest) => {
    const token = tokenToTest || tokenInput;
    if (!token.trim()) return;

    setLoading(true);
    setError('');
    setVerifiedRecord(null);

    try {
      const res = await api.get(`/verify/${token.trim()}`);
      if (res.success) {
        setVerifiedRecord(res.data);
        showToast('Credential verified and validated!', 'success');
      }
    } catch (err) {
      setError(err.message || 'Credential verification token is invalid or expired.');
      showToast('Validation failed: Token not found', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Public QR Credential Verification Portal"
        subtitle="Cryptographic verification service for official University Student IDs, Transcripts of Record, and Certifications"
      />

      {/* Verification Input Box */}
      <GlassCard className="p-6 sm:p-8 max-w-2xl mx-auto space-y-5">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-2">
            <QrCode className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Scan or Enter Credential Token
          </h3>
          <p className="text-xs text-slate-500">
            Paste the alphanumeric token from any official university document or QR code
          </p>
        </div>

        {/* Quick sample chips */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
          {sampleTokens.map((s) => (
            <button
              key={s.token}
              type="button"
              onClick={() => {
                setTokenInput(s.token);
                handleVerify(s.token);
              }}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-100 dark:hover:bg-indigo-950/60 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              Verify {s.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Enter QR token or reference number..."
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>
          <Button
            variant="primary"
            loading={loading}
            onClick={() => handleVerify(tokenInput)}
          >
            Authenticate
          </Button>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
            <XCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Verification Result Card */}
        {verifiedRecord && (
          <div className="p-6 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border-2 border-emerald-500/40 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-emerald-950 dark:text-emerald-200">
                    Official Authenticated Credential
                  </h4>
                  <p className="text-xs text-emerald-800 dark:text-emerald-400 font-mono">
                    Token: {verifiedRecord.token}
                  </p>
                </div>
              </div>
              <Badge variant="success" className="px-3 py-1 font-bold">
                {verifiedRecord.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-emerald-100 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block">Credential Type</span>
                <span className="font-bold text-slate-900 dark:text-white">{verifiedRecord.verification_type}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Authorized Holder</span>
                <span className="font-bold text-slate-900 dark:text-white">{verifiedRecord.holder_name}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Reference Identifier</span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{verifiedRecord.reference_id}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Digital Verification Date</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{new Date(verifiedRecord.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            {verifiedRecord.details && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-mono text-xs space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Decrypted Metadata Payload:</span>
                {Object.entries(verifiedRecord.details).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-slate-700 dark:text-slate-300">
                    <span className="text-slate-400">{k}:</span>
                    <span className="font-bold">{String(v)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </GlassCard>
    </div>
  );
};
