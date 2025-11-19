import EventCard from "@/components/EventCard";
import { Event, EventAttrs } from "@/database";
import connectToDatabase from "@/lib/mongodb";
import React from "react";

// Server component that fetches events directly from MongoDB.
const EventsPage = async () => {
  // Ensure we have a DB connection on the server.
  await connectToDatabase();

  // Get all events, newest first.
  const events = (await Event.find()
    .sort({ createdAt: -1 })
    .lean()) as EventAttrs[];

  return (
    <section id="events" className="mt-24">
      {/* Hero Header */}
      <div className="flex flex-col gap-4 items-center text-center mb-16">
        <h3 className="text-4xl font-bold tracking-tight">All Events</h3>
        <p className="text-light-200 max-w-2xl text-sm leading-relaxed">
          Browse through our curated selection of tech events spanning AI,
          Cloud, FinTech, Blockchain, Security, and more.
        </p>

        <div className="h-px w-24 bg-primary/40 rounded-full mt-4"></div>
      </div>

      {/* Grid */}
      <div
        className="
          grid 
          gap-12 
          md:grid-cols-2 
          xl:grid-cols-3 
          transition-all
        "
      >
        {events.map((event) => (
          <div
            key={event.slug ?? event.title}
            className="
              group 
              transform 
              hover:-translate-y-1 
              transition-all 
              duration-300
            "
          >
            <EventCard {...event} />
          </div>
        ))}
      </div>

      {/* Bottom Fade Divider */}
      <div className="flex-center mt-20">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </div>
    </section>
  );
};

export default EventsPage;
