// API route for fetching a single event by its slug with basic validation.
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Event } from "@/database";

// Basic slug validation: non-empty, URL-friendly (alphanumeric + dashes)
const isValidSlug = (slug: string): boolean => {
  // Reject if slug is missing or not a string.
  if (!slug || typeof slug !== "string") return false;
  const trimmed = slug.trim();
  if (!trimmed) return false;
  // Only allow letters, numbers and dashes in the slug.
  return /^[a-zA-Z0-9-]+$/.test(trimmed);
};

// GET /api/events/[slug]
export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> } // async params in latest Next
) {
  // Read the slug from the dynamic route params.
  const { slug } = await context.params;

  // Validate the slug before hitting the database.
  if (!isValidSlug(slug)) {
    return NextResponse.json(
      {
        message: "Invalid slug. Slug must be a non-empty, URL-friendly string.",
      },
      { status: 400 }
    );
  }

  try {
    // Ensure we are connected to MongoDB.
    await connectToDatabase();

    // Look up a single event document by its slug.
    const event = await Event.findOne({ slug }).lean();

    // If no event exists for this slug, return a 404 to the client.
    if (!event) {
      return NextResponse.json(
        { message: "Event not found for the provided slug." },
        { status: 404 }
      );
    }

    // Return the found event as JSON.
    return NextResponse.json(
      { message: "Event fetched successfully", event },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching event by slug:", error);

    // Handle any unexpected server/database errors.
    return NextResponse.json(
      { message: "Unexpected error while fetching event." },
      { status: 500 }
    );
  }
}
