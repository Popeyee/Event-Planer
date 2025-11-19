import { EventAttrs } from "@/database";
import Image from "next/image";
import Link from "next/link";

const EventCard = ({
  title,
  image,
  slug,
  location,
  date,
  time,
}: EventAttrs) => {
  return (
    <Link href={`/events/${slug}`} id="event-card">
      <Image
        src={image}
        alt={title}
        // Use a higher intrinsic resolution so images stay sharp on larger screens
        width={800}
        height={600}
        className="poster"
        quality={85}
        // Responsive sizes so Next.js picks an appropriate size for each viewport
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        loading="lazy"
      />

      <div className="flex gap-2 flex-row">
        <Image src="/icons/pin.svg" alt="location" width={14} height={14} />
        <p>{location}</p>
      </div>

      <p className="title">{title}</p>

      <div className="datetime">
        <div>
          <Image
            src="/icons/calendar.svg"
            alt="calendar"
            width={14}
            height={14}
          />
          <p>{date}</p>
        </div>
        <div>
          <Image src="/icons/clock.svg" alt="clock" width={14} height={14} />
          <p>{time}</p>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
