"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  Calendar,
  MapPin,
  Mountain,
  Shield,
  Sparkles,
  Star,
  Sunrise,
  TreePine,
  Users,
} from "lucide-react";

import { Footer } from "@/components/layout/Footer";
import { NavBar } from "@/components/layout/NavBar";
import { useListPublicEvents } from "@/hooks/api/publicAPIs";
import { cn } from "@/lib/utils";
import { PublicEventListItem } from "@/types/bookingConstants";

interface CategoryOption {
  id: string;
  name: string;
}

function deriveCategories(items: PublicEventListItem[]): CategoryOption[] {
  const map = new Map<string, string>();
  for (const e of items) {
    if (e.categories?.length) {
      for (const c of e.categories) {
        if (c.category_id && !map.has(c.category_id)) {
          map.set(c.category_id, c.name);
        }
      }
      continue;
    }
    if (e.category_id && !map.has(e.category_id)) {
      map.set(e.category_id, "Category");
    }
  }
  return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
}

function eventBelongsToCategory(
  event: PublicEventListItem,
  categoryId: string,
): boolean {
  if (event.category_id === categoryId) return true;
  return Boolean(event.categories?.some((c) => c.category_id === categoryId));
}

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const {
    data: eventsPage,
    isLoading: eventsLoading,
    isError: eventsError,
    error,
  } = useListPublicEvents({
    page: 1,
    per_page: 50,
    category_id: selectedCategory ?? undefined,
  });

  const events = useMemo(() => eventsPage?.items ?? [], [eventsPage]);

  const categories = useMemo(() => deriveCategories(events), [events]);

  const filtered = selectedCategory
    ? events.filter((e) => eventBelongsToCategory(e, selectedCategory))
    : events;

  return (
    <div className="min-h-screen bg-stone-50">
      <NavBar activePath="/" />

      <section className="relative min-h-[90vh] flex items-center overflow-hidden hero-gradient">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl animate-pulse-glow" />
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-600/8 rounded-full blur-3xl animate-pulse-glow"
          style={{ animationDelay: "1.5s" }}
        />
        <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-teal-500/5 rounded-full blur-2xl animate-float-slow" />

        <div className="absolute bottom-0 left-0 right-0 h-64 opacity-20">
          <svg
            viewBox="0 0 1440 320"
            className="absolute bottom-0 w-full"
            preserveAspectRatio="none"
          >
            <path
              d="M0,320 L80,280 L200,180 L320,240 L440,120 L560,200 L680,80 L800,160 L920,60 L1040,140 L1160,40 L1280,120 L1360,70 L1440,100 L1440,320 Z"
              fill="url(#mountainGrad)"
            />
            <defs>
              <linearGradient id="mountainGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#059669" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#064e3b" stopOpacity="0.2" />
              </linearGradient>
            </defs>
          </svg>
          <svg
            viewBox="0 0 1440 320"
            className="absolute bottom-0 w-full"
            preserveAspectRatio="none"
            style={{ opacity: 0.5 }}
          >
            <path
              d="M0,320 L100,260 L220,300 L360,200 L480,280 L600,150 L720,220 L840,100 L960,180 L1080,90 L1200,170 L1320,110 L1440,160 L1440,320 Z"
              fill="url(#mountainGrad2)"
            />
            <defs>
              <linearGradient id="mountainGrad2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#047857" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#064e3b" stopOpacity="0.1" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="absolute top-28 right-20 animate-float hidden xl:block">
          <div className="glass rounded-2xl px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <TreePine className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-white text-xs font-semibold">50+ Trails</p>
              <p className="text-stone-400 text-[10px]">Across India</p>
            </div>
          </div>
        </div>

        <div className="absolute top-72 right-32 animate-float-delay hidden xl:block">
          <div className="glass rounded-2xl px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center">
              <Star className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <p className="text-white text-xs font-semibold">4.9 Rating</p>
              <p className="text-stone-400 text-[10px]">1000+ Reviews</p>
            </div>
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-24 w-full">
          <div className="max-w-3xl">
            <div className="animate-fade-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-8">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 text-sm font-medium">
                  Curated Adventures Since 2020
                </span>
              </div>
            </div>

            <h2 className="animate-fade-up-delay-1 text-5xl md:text-7xl font-extrabold text-white mb-6 leading-[1.1] tracking-tight">
              Your next <br />
              <span className="text-gradient">great adventure</span>
              <br />
              starts here
            </h2>

            <p className="animate-fade-up-delay-2 text-stone-400 text-lg md:text-xl max-w-xl leading-relaxed mb-10">
              From the misty peaks of the Western Ghats to the rugged Himalayas
              — handpicked treks designed for unforgettable memories.
            </p>

            <div className="animate-fade-up-delay-3 flex flex-col sm:flex-row gap-4">
              <a
                href="#treks"
                className="btn-primary inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-white font-semibold text-base"
              >
                Explore Treks <ArrowRight className="w-5 h-5" />
              </a>
              <Link
                href="/contact-us"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-white font-semibold text-base border border-white/15 hover:bg-white/5 transition-all"
              >
                Get in Touch
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-stone-50 to-transparent" />
      </section>

      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              icon: MapPin,
              label: "50+ Trails",
              sub: "Curated Routes",
              color: "emerald",
            },
            {
              icon: Users,
              label: "Expert Guides",
              sub: "Certified Leaders",
              color: "blue",
            },
            {
              icon: Shield,
              label: "Safe Treks",
              sub: "Safety First",
              color: "purple",
            },
            {
              icon: Sunrise,
              label: "Scenic Views",
              sub: "Breathtaking",
              color: "amber",
            },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="stat-card rounded-2xl p-5 shadow-lg shadow-stone-200/50 border border-stone-100 animate-fade-up"
              style={{ animationDelay: `${0.1 * i}s` }}
            >
              <div
                className={cn(
                  "w-11 h-11 rounded-xl flex items-center justify-center mb-3",
                  stat.color === "emerald" && "bg-emerald-100 text-emerald-600",
                  stat.color === "blue" && "bg-blue-100 text-blue-600",
                  stat.color === "purple" && "bg-purple-100 text-purple-600",
                  stat.color === "amber" && "bg-amber-100 text-amber-600",
                )}
              >
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="font-bold text-stone-900 text-sm">{stat.label}</p>
              <p className="text-stone-400 text-xs mt-0.5">{stat.sub}</p>
            </div>
          ))}
        </div>
      </section>

      <main id="treks" className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-12">
          <h3 className="text-3xl md:text-4xl font-extrabold text-stone-900 mb-3">
            Upcoming <span className="text-gradient">Treks</span>
          </h3>
          <p className="text-stone-500 max-w-lg mx-auto">
            Choose from our carefully curated collection of treks and outdoor
            experiences.
          </p>
        </div>

        {categories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className={cn(
                "px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300",
                !selectedCategory
                  ? "btn-primary text-white"
                  : "bg-white text-stone-600 border border-stone-200 hover:border-emerald-300 hover:text-emerald-700 shadow-sm",
              )}
            >
              All Treks
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300",
                  selectedCategory === cat.id
                    ? "btn-primary text-white"
                    : "bg-white text-stone-600 border border-stone-200 hover:border-emerald-300 hover:text-emerald-700 shadow-sm",
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {eventsLoading ? (
          <EventListSkeleton />
        ) : eventsError ? (
          <ErrorBlock
            message={
              error instanceof Error
                ? error.message
                : "Could not load events right now."
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyEvents />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((event, i) => (
              <EventCard key={event.event_id} event={event} index={i} />
            ))}
          </div>
        )}
      </main>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-24 text-center">
          <h3 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            Ready for your next adventure?
          </h3>
          <p className="text-stone-400 text-lg mb-8 max-w-xl mx-auto">
            Join thousands of trekkers who have experienced the beauty of nature
            with us.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/contact-us"
              className="btn-primary inline-flex items-center gap-2 px-8 py-4 rounded-xl text-white font-semibold"
            >
              Contact Us <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function EventCard({
  event,
  index,
}: {
  event: PublicEventListItem;
  index: number;
}): React.ReactElement {
  return (
    <Link
      href={`/events/${event.event_id}`}
      className="group bg-white rounded-2xl overflow-hidden card-hover shadow-sm border border-stone-100 text-left w-full block"
      style={{ animationDelay: `${0.08 * index}s` }}
      aria-label={`View details for ${event.name}`}
    >
      <div className="h-56 relative overflow-hidden">
        {event.cover_image_url ? (
          <img
            src={event.cover_image_url}
            alt={event.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-emerald-500 via-emerald-600 to-teal-700 flex items-center justify-center">
            <Mountain className="w-16 h-16 text-white/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />
        {event.on_sale && (
          <span
            className="absolute top-4 left-4 bg-linear-to-r from-orange-500 to-rose-500 text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-lg shadow-orange-500/30 animate-shimmer"
            style={{
              backgroundImage:
                "linear-gradient(90deg, #f97316, #ef4444, #f97316)",
              backgroundSize: "200% auto",
            }}
          >
            On Sale
          </span>
        )}
        {event.next_date ? (
          <div className="absolute bottom-4 left-4 flex items-center gap-1.5 text-white/90 text-xs font-medium bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <Calendar className="w-3 h-3" />
            {new Date(event.next_date).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
            })}
            {event.dates_count > 1 && (
              <span className="text-white/60">+{event.dates_count - 1}</span>
            )}
          </div>
        ) : (
          <div className="absolute bottom-4 left-4 flex items-center gap-1.5 text-amber-300 text-xs font-medium bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <Calendar className="w-3 h-3" />
            Dates coming soon
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-bold text-lg text-stone-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
          {event.name}
        </h3>
        {event.description && (
          <p className="text-stone-500 text-sm mt-2 line-clamp-2 leading-relaxed">
            {event.description}
          </p>
        )}
        <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            {event.strike_price != null && (
              <span className="text-stone-400 line-through text-sm">
                ₹{event.strike_price.toLocaleString()}
              </span>
            )}
            {event.display_price != null ? (
              <span className="text-emerald-700 font-extrabold text-xl">
                ₹{event.display_price.toLocaleString()}
              </span>
            ) : (
              <span className="text-stone-400 text-sm">Price TBA</span>
            )}
          </div>
          <span className="inline-flex items-center gap-1 text-emerald-600 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
            View <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function EventListSkeleton(): React.ReactElement {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse"
        >
          <div className="h-56 bg-stone-200" />
          <div className="p-6 space-y-3">
            <div className="h-5 bg-stone-200 rounded w-3/4" />
            <div className="h-4 bg-stone-100 rounded w-full" />
            <div className="h-4 bg-stone-100 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyEvents(): React.ReactElement {
  return (
    <div className="text-center py-20">
      <div className="w-24 h-24 bg-linear-to-br from-emerald-100 to-stone-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
        <Mountain className="w-12 h-12 text-emerald-400" />
      </div>
      <p className="text-stone-800 text-xl font-bold mb-2">
        No events available right now
      </p>
      <p className="text-stone-400 max-w-md mx-auto">
        We&apos;re planning some amazing treks. Check back soon or sign up to
        get notified!
      </p>
    </div>
  );
}

function ErrorBlock({ message }: { message: string }): React.ReactElement {
  return (
    <div className="text-center py-20">
      <div className="w-24 h-24 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
        <Mountain className="w-12 h-12 text-rose-400" />
      </div>
      <p className="text-stone-800 text-xl font-bold mb-2">
        Something went wrong
      </p>
      <p className="text-stone-500 max-w-md mx-auto text-sm">{message}</p>
    </div>
  );
}
