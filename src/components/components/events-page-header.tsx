"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEventsUIStore } from "@/store/events-store";

export function EventsPageHeader() {
  const { toggleCreateForm, isCreateFormOpen } = useEventsUIStore();

  return (
    <div className="mb-6 flex shrink-0 items-center justify-between">
      <h1 className="text-2xl font-bold text-gray-900">My Events</h1>
      <Button
        onClick={toggleCreateForm}
        className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white text-sm font-medium"
      >
        <Plus className="w-4 h-4" />
        {isCreateFormOpen ? "Cancel" : "Create Event"}
      </Button>
    </div>
  );
}