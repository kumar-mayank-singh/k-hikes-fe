import Link from "next/link";

interface ConfirmationShellProps {
  eventName?: string;
  children: React.ReactNode;
}

export function ConfirmationShell({
  eventName,
  children,
}: ConfirmationShellProps): React.ReactElement {
  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-stone-900/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-linear-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center">
              <img src="/logo.png" alt="Karnataka Hikes" className="w-10 h-10" />
            </div>
            <span className="text-lg font-bold text-white">Karnataka Hikes</span>
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10">
        {eventName ? (
          <p className="text-stone-500 text-sm mb-6">{eventName}</p>
        ) : null}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 sm:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
