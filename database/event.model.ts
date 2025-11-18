import { Schema, model, models, Document, Model } from "mongoose";

// Strongly-typed Event document shape
export interface EventAttrs {
  title: string;
  slug?: string; // generated from title
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string; // stored as ISO date string (YYYY-MM-DD)
  time: string; // stored as HH:MM (24h) string
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
}

export interface EventDoc extends EventAttrs, Document {
  createdAt: Date;
  updatedAt: Date;
}

export type EventModel = Model<EventDoc>;

// Helper to slugify event titles into URL-safe slugs
const slugify = (value: string): string =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // remove invalid chars
    .replace(/\s+/g, "-") // spaces to dashes
    .replace(/-+/g, "-") // collapse duplicate dashes
    .replace(/^-|-$/g, ""); // trim leading/trailing dashes

// Helper to ensure date is always stored as ISO (YYYY-MM-DD)
const normalizeDate = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid event date");
  }
  return date.toISOString().slice(0, 10); // YYYY-MM-DD
};

// Helper to normalize times to 24h HH:MM format
const normalizeTime = (value: string): string => {
  const trimmed = value.trim();

  // Support simple HH:MM or H:MM (24h) inputs
  const match = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) {
    throw new Error("Invalid event time format. Expected HH:MM (24h).");
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new Error("Invalid event time value.");
  }

  const hh = hours.toString().padStart(2, "0");
  const mm = minutes.toString().padStart(2, "0");
  return `${hh}:${mm}`;
};

const EventSchema = new Schema<EventDoc, EventModel>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    description: { type: String, required: true, trim: true },
    overview: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },
    venue: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    mode: { type: String, required: true, trim: true },
    audience: { type: String, required: true, trim: true },
    agenda: { type: [String], required: true, default: [] },
    organizer: { type: String, required: true, trim: true },
    tags: { type: [String], required: true, default: [] },
  },
  {
    // Automatically manage createdAt / updatedAt fields
    timestamps: true,
    // Disallow unknown fields for safer writes
    strict: "throw",
  }
);

// Pre-save hook: validate required fields, generate slug, and normalize date/time
EventSchema.pre<EventDoc>("save", function preSave(next) {
  try {
    // Basic non-empty validation for required string fields
    const requiredStringFields: Array<keyof EventAttrs> = [
      "title",
      "description",
      "overview",
      "image",
      "venue",
      "location",
      "date",
      "time",
      "mode",
      "audience",
      "organizer",
    ];

    for (const field of requiredStringFields) {
      const value = this[field];
      if (typeof value !== "string" || value.trim().length === 0) {
        throw new Error(
          `Field "${String(field)}" is required and cannot be empty.`
        );
      }
      // Persist trimmed values
      this[field] = value.trim();
    }

    // Validate that agenda and tags arrays are not empty and contain strings
    if (!Array.isArray(this.agenda) || this.agenda.length === 0) {
      throw new Error(
        'Field "agenda" is required and must contain at least one item.'
      );
    }
    if (!Array.isArray(this.tags) || this.tags.length === 0) {
      throw new Error(
        'Field "tags" is required and must contain at least one item.'
      );
    }

    // Normalize date and time to consistent formats
    this.date = normalizeDate(this.date);
    this.time = normalizeTime(this.time);

    // Only regenerate slug when the title changes
    if (this.isModified("title") || !this.slug) {
      this.slug = slugify(this.title);
    }

    next();
  } catch (err) {
    next(err as Error);
  }
});

export const Event: EventModel =
  models.Event || model<EventDoc, EventModel>("Event", EventSchema);

export default Event;
