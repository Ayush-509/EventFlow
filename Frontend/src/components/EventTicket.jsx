import { useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function EventTicket({ registration, onDownload, onReady }) {
  const ticketRef = useRef(null);

  const downloadTicket = async () => {
    if (!ticketRef.current) return;

    try {
      const canvas = await html2canvas(ticketRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: null,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4');

      const pageWidth = 297;
      const margin = 10;
      const contentWidth = pageWidth - margin * 2;

      const imgHeight = Math.min(
  190,
  (canvas.height * contentWidth) /
  canvas.width
);

      pdf.addImage(imgData, 'PNG', margin, margin, contentWidth, imgHeight);

      const fileName = `${registration.event?.title?.replace(/[^a-zA-Z0-9]/g, '_')}_ticket.pdf`;
      pdf.save(fileName);

      onDownload?.();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (typeof onReady === 'function') onReady(downloadTicket);
  }, [onReady]);

  const event = registration.event;
  const date = new Date(event?.date);

  return (
    <div className="flex justify-center py-6">

      {/* ANIMATED WRAPPER */}
      <div className="relative group animate-float">

        {/* Glow background */}
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-3xl blur-xl opacity-40 group-hover:opacity-70 transition" />

        {/* TICKET */}
        <div
  ref={ticketRef}
  className="relative w-full max-w-[980px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl backdrop-blur-xl bg-white/10 dark:bg-slate-900/40"
>

          {/* SHINE ANIMATION */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -left-[60%] top-0 h-full w-[40%] bg-gradient-to-r from-transparent via-white/20 to-transparent rotate-12 animate-shine" />
          </div>

          <div className="flex min-h-[360px]">

            {/* LEFT */}
            <div className="flex-1 p-8 text-white bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950">

              {/* HEADER */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <img
  src="/logo.png"
  alt="logo"
  className="h-10 mb-2"
/>
                  <div className="text-xs tracking-[0.35em] text-cyan-300 uppercase">
                    EventFlow Wallet Pass
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Tap / Scan for entry
                  </div>
                </div>

                <div className="px-3 py-1 text-xs rounded-full bg-white/10 border border-white/20">
                  LIVE PASS
                </div>
              </div>

              {/* TITLE */}
              <h1 className="text-4xl font-extrabold tracking-tight">
                {event?.title}
              </h1>

              <div className="mt-2 text-cyan-300 uppercase tracking-wider text-sm">
                {event?.category} EVENT
              </div>
              <div className="mt-4 inline-block px-4 py-2 rounded-full bg-white/10 border border-cyan-400 text-cyan-300 text-sm">
  {registration.ticketType}
</div>
<div className="mt-3 text-pink-300 font-semibold text-lg">
 ₹ {registration.price}
</div>

              {/* DATE BLOCK */}
              <div className="mt-7 flex gap-10">
                <div>
                  <div className="text-2xl font-bold">
                    {date.toLocaleDateString('en-GB')}
                  </div>
                  <div className="text-xs text-slate-400">DATE</div>
                </div>

                <div>
                  <div className="text-2xl font-bold">
                    {date.toLocaleTimeString('en-GB', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                  <div className="text-xs text-slate-400">TIME</div>
                </div>
              </div>

              {/* LOCATION */}
              <div className="mt-5 text-sm text-slate-300">
                📍 {event?.location}
              </div>
              <div className="mt-4 text-xs text-slate-400">
 Ticket ID
</div>

<div className="text-sm text-slate-200">
 {registration.ticketId}
</div>

              {/* BARCODE STRIP */}
              {registration.barcodeDataUrl && (
  <img
    src={registration.barcodeDataUrl}
    alt="Barcode"
    className="mt-8 h-16 w-full object-contain bg-white rounded-lg p-2"
  />
)}
            </div>

            {/* DIVIDER */}
            <div className="w-px bg-white/10" />

            {/* RIGHT */}
            <div className="w-64 p-6 bg-gradient-to-b from-black/40 via-indigo-950 to-black/60 flex flex-col">

              {/* QR */}
              <div className="bg-white/10 border border-white/10 rounded-2xl p-3 text-center backdrop-blur-md">
                <div className="text-xs text-slate-300 mb-2 tracking-widest">
                  ENTRY QR
                </div>

                {registration.qrCodeDataUrl && (
                  <img
                    src={registration.qrCodeDataUrl}
                    alt="QR"
                    className="mx-auto w-44 h-44 rounded-xl bg-white p-2"
                  />
                )}
              </div>

              {/* STATUS */}
              <div className="mt-4 text-center">
                <div className="text-xs text-emerald-300 animate-pulse">
                  ● ACTIVE PASS
                </div>
              </div>

              {/* FOOTER */}
              <div className="mt-auto text-center text-[10px] text-slate-400">
                <div className="text-slate-200 font-semibold">EventFlow</div>
                <div>Secure Digital Wallet Pass</div>
                <div className="opacity-60">© 2025</div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ANIMATIONS */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
          100% { transform: translateY(0px); }
        }

        .animate-float {
          animation: float 4s ease-in-out infinite;
        }

        @keyframes shine {
          0% { transform: translateX(-200%) rotate(12deg); }
          100% { transform: translateX(300%) rotate(12deg); }
        }

        .animate-shine {
          animation: shine 3.5s infinite;
        }
      `}</style>

    </div>
  );
}