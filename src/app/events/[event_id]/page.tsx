"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Backpack,
  CheckCircle,
  Clock,
  Compass,
  FileText,
  MapPin,
  Mountain,
  XCircle,
} from "lucide-react";

import { EventBookingSidebar } from "@/components/sections/event-booking-sidebar";
import { EventImageCarousel } from "@/components/sections/event-image-carousel";
import { getEventGalleryUrls } from "@/lib/event-photos";
import { EventItineraryDownloadDialog } from "@/components/sections/event-itinerary-download-dialog";
import {
  useGetPublicEvent,
  useGetPublicEventPickupPoints,
} from "@/hooks/api/publicAPIs";
import { PublicEventDetail } from "@/types/bookingConstants";
import { PickupPoint } from "@/types/eventSubConstants";

export default function EventDetailPage(): React.ReactElement {
  const params = useParams();
  const eventId = params.event_id as string;

  const {
    data: event,
    isLoading,
    isError,
    error,
  } = useGetPublicEvent(eventId);
  const { data: pickupPoints = [] } = useGetPublicEventPickupPoints(
    event?.event_id,
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-stone-500">
        Loading…
      </div>
    );
  }
  if (isError || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center text-stone-500">
        {error instanceof Error ? error.message : "Event not found"}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <SiteHeader />

      <Hero event={event} />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <MobilePriceBar event={event} />

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {event.description && (
              <ContentCard
                icon={<Compass className="w-5 h-5 text-emerald-600" />}
                title="About this trek"
                body={event.description}
              />
            )}

            {event.pdf_url && (
              <EventItineraryDownloadDialog
                eventId={event.event_id}
                eventName={event.name}
              />
            )}

            {pickupPoints.length > 0 && (
              <PickupPointsCard points={pickupPoints} />
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {event.inclusions && (
                <ContentCard
                  icon={<CheckCircle className="w-5 h-5 text-emerald-600" />}
                  title="Inclusions"
                  body={event.inclusions}
                />
              )}
              {event.exclusions && (
                <ContentCard
                  icon={<XCircle className="w-5 h-5 text-rose-500" />}
                  title="Exclusions"
                  body={event.exclusions}
                />
              )}
            </div>

            {event.things_to_carry && (
              <ContentCard
                icon={<Backpack className="w-5 h-5 text-amber-600" />}
                title="Things to carry"
                body={event.things_to_carry}
              />
            )}

            {event.policy && (
              <ContentCard
                icon={<FileText className="w-5 h-5 text-stone-600" />}
                title="Terms & conditions"
                body={event.policy}
              />
            )}
          </div>

          <aside className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <EventBookingSidebar event={event} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function SiteHeader(): React.ReactElement {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-stone-900/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-linear-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/30 group-hover:shadow-emerald-500/30 transition-shadow">
            <Mountain className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white">
              Karnataka Hikes
            </span>
            <p className="text-emerald-400 text-[9px] uppercase tracking-[0.2em] font-semibold">
              Treks & Adventures
            </p>
          </div>
        </Link>
        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className="px-4 py-2 text-sm text-stone-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
          >
            Home
          </Link>
          <Link
            href="/about-us"
            className="px-4 py-2 text-sm text-stone-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
          >
            About Us
          </Link>
          <Link
            href="/contact-us"
            className="px-4 py-2 text-sm text-stone-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
          >
            Contact Us
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Hero({ event }: { event: PublicEventDetail }): React.ReactElement {
  const galleryUrls = getEventGalleryUrls(event);

  return (
    <div className="relative pt-16">
      <div className="h-72 md:h-96 relative overflow-hidden">
        {galleryUrls.length > 0 ? (
          <EventImageCarousel
            images={galleryUrls}
            alt={event.name}
            className="h-full"
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-emerald-600 via-emerald-800 to-stone-900 flex items-center justify-center">
            <Mountain className="w-32 h-32 text-emerald-400/30" />
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-stone-900/80 via-stone-900/20 to-transparent" />
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 max-w-6xl mx-auto px-4 pb-8">
          <div className="flex items-end justify-between gap-4">
            <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg">
              {event.name}
            </h1>
            <div className="text-right shrink-0 hidden md:block">
              {event.strike_price != null && (
                <span className="text-stone-300 line-through text-lg block">
                  ₹{event.strike_price.toLocaleString()}
                </span>
              )}
              {event.display_price != null && (
                <span className="text-white font-bold text-4xl drop-shadow-lg">
                  ₹{event.display_price.toLocaleString()}
                </span>
              )}
              <span className="text-stone-300 text-sm block">per person</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MobilePriceBar({
  event,
}: {
  event: PublicEventDetail;
}): React.ReactElement {
  return (
    <div className="md:hidden mb-6 flex items-center justify-between bg-white rounded-xl p-4 shadow-sm border border-stone-100">
      <div>
        {event.strike_price != null && (
          <span className="text-stone-400 line-through text-sm block">
            ₹{event.strike_price.toLocaleString()}
          </span>
        )}
        {event.display_price != null && (
          <span className="text-emerald-700 font-bold text-2xl">
            ₹{event.display_price.toLocaleString()}
          </span>
        )}
        <span className="text-stone-400 text-xs block">per person</span>
      </div>
    </div>
  );
}

function ContentCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}): React.ReactElement {
  return (
    <section className="bg-white rounded-2xl shadow-sm p-6 border border-stone-100">
      <h2 className="text-lg font-bold text-stone-900 mb-3 flex items-center gap-2">
        {icon} {title}
      </h2>
      <p className="text-stone-600 leading-relaxed whitespace-pre-line text-sm">
        {body}
      </p>
    </section>
  );
}

function PickupPointsCard({
  points,
}: {
  points: PickupPoint[];
}): React.ReactElement {
  const active = points.filter((p) => p.is_active);
  if (active.length === 0) return <></>;
  return (
    <section className="bg-white rounded-2xl shadow-sm p-6 border border-stone-100">
      <h2 className="text-lg font-bold text-stone-900 mb-4 flex items-center gap-2">
        <MapPin className="w-5 h-5 text-emerald-600" /> Pickup points
      </h2>
      <div className="space-y-3">
        {active.map((p) => (
          <div
            key={p.event_pickup_point_id}
            className="flex items-center justify-between p-4 bg-stone-50 rounded-xl"
          >
            <div>
              <span className="font-medium text-stone-800">{p.name}</span>
              {p.google_map_link && (
                <a
                  href={p.google_map_link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-600 text-sm ml-2 hover:underline"
                >
                  View map
                </a>
              )}
            </div>
            <div className="text-sm text-stone-500 flex gap-4">
              {p.arrival_time && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Arr: {p.arrival_time}
                </span>
              )}
              {p.departure_time && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Dep: {p.departure_time}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
