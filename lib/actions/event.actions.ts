"use server";

import { Event } from "@/database";
import connectToDatabase from "../mongodb";

export const getSimilarEventBySlug = async (slug: string) => {
  try {
    await connectToDatabase();

    const event = await Event.findOne({ slug });
    if (!event) return [];

    // Split comma-separated tags into individual strings
    const eventTags = event.tags[0]
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (eventTags.length === 0) return [];

    // Use regex to match any of the tags in other events
    const similarEvents = await Event.find({
      _id: { $ne: event._id },
      $or: eventTags.map((tag) => ({
        tags: { $regex: new RegExp(`\\b${tag}\\b`, "i") },
      })),
    }).lean();

    return similarEvents;
  } catch (e) {
    console.error("Error fetching similar events:", e);
    return [];
  }
};
