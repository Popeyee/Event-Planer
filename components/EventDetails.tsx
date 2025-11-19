import { EventAttrs } from "@/database";
import { getSimilarEventBySlug } from "@/lib/actions/event.actions";
import Image from "next/image";
import { notFound } from "next/navigation";
import EventDetailItem from "./EventDetailItem";
import AgendaItem from "./EventAgenda";
import EventTags from "./EventTags";
import BookEvent from "./BookEvent";
import EventCard from "./EventCard";
import { cacheLife } from "next/cache";

const EventDetails = async ({ params }: { params: Promise<string> }) => {
  "use cache";
  cacheLife("minutes");
  const slug = await params;
  let eventData: EventData | null = null;
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  type EventData = {
    _id: string;
    description: string;
    title: string;
    image: string;
    overview: string;
    date: string;
    time: string;
    location: string;
    mode: string;
    agenda: string[];
    audience: string;
    organizer: string;
    tags: string[];
  };

  try {
    const response = await fetch(`${BASE_URL}/api/events/${slug}`);

    if (!response.ok) {
      return notFound();
    }

    const data = (await response.json()) as { event: EventData };
    // const data = await response.json();

    if (!data || !data.event) {
      return notFound();
    }

    eventData = data.event;
  } catch (error) {
    console.error("Failed to fetch event data", error);
    return notFound();
  }

  if (!eventData) {
    return notFound();
  }

  const {
    _id,
    description,
    title,
    image,
    overview,
    date,
    time,
    location,
    mode,
    agenda,
    audience,
    organizer,
    tags,
  } = eventData;

  // -----------   Or this way by fetching directly from db   -----------
  // await connectToDatabase();
  // const event = await Event.findOne({ slug }).lean();

  if (!description) {
    return notFound();
  }

  const bookings = 10;

  const similarEvents: EventAttrs[] = await getSimilarEventBySlug(slug);

  return (
    <section id="event">
      <div className="header">
        <h1>{title}</h1>
        <p> {description} </p>
      </div>

      <div className="details ">
        {/* left side */}
        <div className="content">
          <Image
            src={image}
            alt="event banner"
            // Wider intrinsic size and 16:9 ratio for better quality on desktops
            width={1200}
            height={675}
            className="banner"
            quality={85}
            sizes="(min-width: 1024px) 66vw, 100vw"
            priority
          />

          <section className="flex-col-gap-2">
            <h2>Overview</h2>
            <p>{overview}</p>
          </section>

          <section className="flex-col-gap-2">
            <h2>Event Details</h2>

            <EventDetailItem
              icon="/icons/calendar.svg"
              alt="calendar"
              label={date}
            />
            <EventDetailItem icon="/icons/clock.svg" alt="clock" label={time} />
            <EventDetailItem icon="/icons/pin.svg" alt="pin" label={location} />
            <EventDetailItem icon="/icons/mode.svg" alt="mode" label={mode} />
            <EventDetailItem
              icon="/icons/audience.svg"
              alt="audience"
              label={audience}
            />
          </section>

          <section className="flex-col-gap-2">
            <h2>Agenda</h2>
            <AgendaItem agenda={agenda} />
          </section>

          <section className="flex-col-gap-2">
            <h2>About The Organizer</h2>
            <p className="mt-2"> {organizer} </p>
          </section>

          <section>
            <EventTags tags={tags} />
          </section>
        </div>

        {/* right side */}

        <aside className="booking">
          <div className="signup-card">
            <h2>Book Your Spot</h2>
            {bookings > 0 ? (
              <p className="text-sm">
                Join {bookings} people who have already booked their spot
              </p>
            ) : (
              <p className="text-sm">Be the first to book your spot</p>
            )}
            <BookEvent eventId={_id} slug={slug} />
          </div>
        </aside>
      </div>

      <div className="flex w-full flex-col gap-4 pt-20">
        <h2>Similar Events</h2>
        <div className="events">
          {similarEvents.length > 0 &&
            similarEvents.map((similarEvent: EventAttrs) => (
              <EventCard key={similarEvent.title} {...similarEvent} />
            ))}
        </div>
      </div>
    </section>
  );
};

export default EventDetails;
