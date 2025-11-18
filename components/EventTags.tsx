import Link from "next/link";

const EventTags = ({ tags }: { tags: string[] }) => {
  const items = tags
    .flatMap((str) => str.split(",")) // split each string by comma
    .map((item) => item.trim());
  return (
    <div className="flex flex-row gap-1.5 flex-wrap">
      {items.map((tag) => (
        <div className="pill" key={tag}>
          <Link href=""> {tag} </Link>
        </div>
      ))}
    </div>
  );
};

export default EventTags;
