import { EventsPageHeader } from "@/components/components/events-page-header";
import { EventsList } from "@/components/screens/event-list";

export default function EventsPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <EventsPageHeader />
      <EventsList />
    </div>
  );
}