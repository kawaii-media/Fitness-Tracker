/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { TrackerData } from '../types';
import { Download, Upload, RotateCcw, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';

interface DataBackupProps {
  data: TrackerData;
  onImportData: (data: TrackerData) => void;
  onResetData: () => void;
  onExportHTML?: () => void;
}

export default function DataBackup({ data, onImportData, onResetData, onExportHTML }: DataBackupProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Custom double-confirmation state for reset to bypass iframe prompt limits
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetInput, setResetInput] = useState('');

  // Handle data export to JSON file
  const handleExportJSON = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
      const downloadAnchor = document.createElement('a');
      const timestamp = new Date().toISOString().slice(0, 10);
      
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `fitness_tracker_backup_${timestamp}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setSuccessMsg('Data sukses diekspor ke file JSON! 📂');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (e) {
      setErrorMsg('Gagal mengekspor data.');
    }
  };

  // Handle data import from JSON file
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg('');
    setSuccessMsg('');
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        
        // Strict Validation to ensure data is not corrupt
        if (!parsed.profile || !parsed.workouts || !parsed.meals || !parsed.weightHistory) {
          setErrorMsg('Struktur backup tidak valid! Pastikan file JSON berisi data profil, latihan, makan, dan berat badan.');
          return;
        }

        // Apply data
        onImportData(parsed);
        setSuccessMsg('Sukses mengimpor data! Dashboard Anda telah diperbarui. 🔄');
        setTimeout(() => setSuccessMsg(''), 5000);
      } catch (err) {
        setErrorMsg('Gagal membaca file JSON. Pastikan format file benar.');
      }
    };
    reader.readAsText(file);
    
    // Clear input so same file can be re-uploaded if modified
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleTriggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleResetConfirm = () => {
    if (resetInput.toUpperCase() === 'HAPUS') {
      onResetData();
      setShowResetConfirm(false);
      setResetInput('');
      setSuccessMsg('Semua data berhasil di-reset ke kondisi semula.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } else {
      setErrorMsg('Ketik kata "HAPUS" dengan benar untuk melakukan reset data.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Intro card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs animate-fade-in">
        <h3 className="text-lg font-black tracking-tight text-slate-900">Pencadangan & Pengaturan Data Lokal</h3>
        <p className="text-sm text-slate-500 mt-1">
          Semua data Anda disimpan 100% secara lokal di browser perangkat Anda menggunakan <strong>LocalStorage</strong>. Untuk menjaga keamanan data Anda dari pembersihan cache browser otomatis, lakukan pencadangan data secara berkala.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Box Ekspor & Impor JSON */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between animate-fade-in">
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Download className="w-5 h-5 text-indigo-500" />
              Backup JSON
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Unduh file backup berupa data terstruktur JSON untuk disimpan di komputer atau pindahkan ke perangkat lain secara instan.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleExportJSON}
              id="btn-export-json"
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold py-2.5 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <Download className="w-4 h-4" />
              Unduh Backup JSON
            </button>

            <button
              onClick={handleTriggerFileInput}
              id="btn-import-trigger"
              className="flex-1 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-semibold py-2.5 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Unggah Backup JSON
            </button>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleImportJSON}
              accept=".json" 
              className="hidden" 
            />
          </div>
        </div>

        {/* Box Ekspor Offline HTML */}
        {onExportHTML && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between animate-fade-in">
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Download className="w-5 h-5 text-emerald-500" />
                Aplikasi Standalone
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Unduh seluruh kode aplikasi ke dalam file tunggal berukuran ringan. Anda dapat membukanya langsung di perangkat manapun secara offline tanpa koneksi internet!
              </p>
            </div>

            <button
              onClick={onExportHTML}
              id="btn-export-html"
              className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold py-2.5 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <Download className="w-4 h-4" />
              Unduh Aplikasi
            </button>
          </div>
        )}
      </div>

      {/* Messages Feedbacks */}
      {successMsg && (
        <div className="flex items-center gap-3 text-emerald-700 bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-xs font-semibold shadow-xs">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-3 text-rose-700 bg-rose-50 border border-rose-100 p-4 rounded-xl text-xs font-semibold shadow-xs">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Dangerous Reset Box */}
      <div className="bg-rose-50/50 p-6 rounded-3xl border border-rose-200 shadow-xs space-y-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-rose-500 uppercase tracking-widest">Hapus & Bersihkan Seluruh Data</h4>
            <p className="text-xs text-rose-600 mt-1 leading-relaxed">
              Tindakan ini akan menghapus semua entri profil, data olahraga harian, konsumsi makan, dan catatan berat badan secara permanen dari penyimpanan browser Anda. Tindakan ini tidak dapat dibatalkan!
            </p>
          </div>
        </div>

        {showResetConfirm ? (
          <div className="bg-white p-4 rounded-xl border border-rose-200 space-y-3 max-w-md">
            <p className="text-xs font-semibold text-slate-700">
              Ketik kata <span className="text-rose-600 font-mono font-bold bg-rose-50 px-1 rounded">HAPUS</span> di bawah untuk mengonfirmasi reset total:
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={resetInput}
                onChange={(e) => setResetInput(e.target.value)}
                placeholder="HAPUS"
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-1.5 text-xs text-slate-800 placeholder:text-slate-300 focus:outline-hidden focus:ring-1 focus:ring-rose-500 focus:border-rose-500"
              />
              <button
                onClick={handleResetConfirm}
                id="btn-confirm-reset-now"
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-1.5 px-4 rounded-xl text-xs transition-colors"
              >
                Konfirmasi
              </button>
              <button
                onClick={() => { setShowResetConfirm(false); setResetInput(''); }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold py-1.5 px-4 rounded-xl text-xs"
              >
                Batal
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowResetConfirm(true)}
            id="btn-trigger-reset"
            className="bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold py-2 px-5 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 border border-rose-200"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Data Sekarang
          </button>
        )}
      </div>
    </div>
  );
}
