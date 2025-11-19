import BookEvent from "@/components/BookEvent";
import AgendaItem from "@/components/EventAgenda";
import EventCard from "@/components/EventCard";
import EventDetailItem from "@/components/EventDetailItem";
import EventDetails from "@/components/EventDEtails";
import EventTags from "@/components/EventTags";
import { EventAttrs } from "@/database";
import { getSimilarEventBySlug } from "@/lib/actions/event.actions";
import { cacheLife } from "next/cache";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";

// Shape of the event returned from the /api/events/[slug] endpoint.

const EventDetailsPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const slug = params.then((p) => p.slug);

  return (
    <main>
      <Suspense fallback={<div>Loading...</div>}>
        <EventDetails params={slug} />
      </Suspense>
    </main>
  );
};

export default EventDetailsPage;
