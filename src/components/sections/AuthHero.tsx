import Image from "next/image"
import { Mountain } from "lucide-react"

export function AuthHero() {
  return (
    <div className="relative hidden lg:flex lg:w-1/2 h-full items-center justify-center p-12 bg-slate-900 overflow-hidden">

      <Image
        src="/loginBanner.jpg"
        alt="Mountain trekking"
        fill
        priority
        className="object-cover opacity-40"
      />

      <div className="absolute inset-0 bg-linear-to-br from-slate-700/10 to-slate-800/8" />

      <div className="relative z-10 text-white max-w-sm">
        <div className="flex items-center gap-3 mb-6">
          <Mountain className="w-10 h-10 text-emerald-500" />
          <h1 className="text-3xl font-semibold">Karnataka hikes</h1>
        </div>

        <p className="text-gray-300">
          Admin panel for managing trekking events, bookings, guides and outdoor adventures across India.
        </p>
      </div>

    </div>
  )
}