import EventCard from "@/components/EventCard";
import { Event, EventAttrs } from "@/database";
import connectToDatabase from "@/lib/mongodb";
import React from "react";

// Server component that fetches events directly from MongoDB.
const EventsPage = async () => {
  // Ensure we have a DB connection on the server.
  await connectToDatabase();

  // Get all events, newest first.
  const events = (await Event.find().sort({ createdAt: -1 }).lean()) as EventAttrs[];

  return (
    <section className="mt-20 space-y-7" id="events">
      <h3>Featured Events</h3>
      <ul className="events list-none">
        {events &&
          events.length > 0 &&
          events.map((event) => (
            <li key={event.slug ?? event.title}>
              <EventCard {...event} />
            </li>
          ))}
      </ul>
    </section>
  );
};

export default EventsPage;
