import EventCard from "@/components/EventCard";
import ExploreBtn from "@/components/ExploreBtn";
import { cacheLife } from "next/cache";
import events, { EventItem } from "@/lib/constants";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
// export const revalidate = 10; // cache homepage for up to 10 seconds
const Homepage = async () => {
  "use cache";
  cacheLife("minutes");
  if (!BASE_URL) {
    console.error("NEXT_PUBLIC_BASE_URL is not defined");
    return (
      <section>
        <h1>Configuration Error</h1>
      </section>
    );
  }

  // let events = [];

  try {
    // const response = await fetch(`${BASE_URL}/api/events`);
    // if (!response.ok) {
    //   throw new Error(`Failed to fetch events: ${response.status}`);
    // }
    // const data = await response.json();
    // events = data.events || [];
  } catch (error) {
    console.error("Error fetching events:", error);
    // Handle error appropriately - maybe show an error message
  }

  return (
    <section>
      <h1 className="text-center">
        The Hub for Every Dev <br /> Event You Can Not Miss
      </h1>
      <p className="text-center mt-5">
        {" "}
        Hackathons, Meetups and Conferences. All in One Place
      </p>
      <ExploreBtn />

      <div className="mt-20 space-y-7">
        <h3>Featured Events</h3>
        <ul className="events list-none">
          {events &&
            events.length > 0 &&
            events.map((event: EventItem) => (
              <li key={event.title}>
                <EventCard {...event} />
              </li>
            ))}
        </ul>
      </div>
    </section>
  );
};

export default Homepage;
