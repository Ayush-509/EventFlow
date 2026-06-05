import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Pass() {
  const [regs, setRegs] = useState([]);

  useEffect(() => {
    (async () => {
      const r = await axios.get('/api/registrations/me');
      setRegs(r.data.registrations || []);
    })();
  }, []);

  return (
    <div className="space-y-5">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          My Passes
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Offline-ready event passes. Open once while online to cache them.
        </p>
      </div>

      {/* Empty state */}
      {regs.length === 0 && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-center text-slate-500 dark:text-slate-400">
          No passes found yet.
        </div>
      )}

      {/* Pass grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {regs.map((r) => (
          <div
            key={r._id}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-md transition"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold text-slate-800 dark:text-slate-100">
                  {r.event?.title}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {new Date(r.event?.date).toLocaleString()}
                </p>
              </div>

              <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800">
                Active Pass
              </span>
            </div>

            <div className="text-sm text-slate-600 dark:text-slate-300 mt-2">
              {r.event?.location}
            </div>

            {r.qrCodeDataUrl && (
              <div className="mt-4 flex justify-center">
                <img
                  src={r.qrCodeDataUrl}
                  alt="QR Code"
                  className="h-44 w-44 rounded-lg border border-slate-200 dark:border-slate-700 bg-white"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}