import { Schema, model, models, Document, Model, Types } from "mongoose";
import { Event, EventDoc } from "./event.model";

// Attributes required to create a Booking
export interface BookingAttrs {
  eventId: Types.ObjectId;
  email: string;
}

// Booking document as stored in MongoDB
export interface BookingDoc extends BookingAttrs, Document {
  createdAt: Date;
  updatedAt: Date;
}

export type BookingModel = Model<BookingDoc>;

// Simple RFC 5322–style email validation (good enough for most cases)
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const BookingSchema = new Schema<BookingDoc, BookingModel>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true, // index for faster lookups by event
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
  },
  {
    timestamps: true,
    strict: "throw",
  }
);

// Pre-save hook: validate email format and ensure referenced event exists
BookingSchema.pre<BookingDoc>("save", async function preSave(next) {
  try {
    // Validate email format early to avoid unnecessary DB round-trips
    if (!this.email || !emailRegex.test(this.email)) {
      throw new Error("A valid email address is required.");
    }
    this.email = this.email.trim().toLowerCase();

    // Ensure the referenced event exists before creating a booking
    // We don't care about the full document here, just whether it exists.
    const event = await Event.findById(this.eventId).select("_id").lean();
    if (!event) {
      throw new Error(
        "Cannot create booking: referenced event does not exist."
      );
    }

    next();
  } catch (err) {
    next(err as Error);
  }
});

export const Booking: BookingModel =
  models.Booking || model<BookingDoc, BookingModel>("Booking", BookingSchema);

export default Booking;
