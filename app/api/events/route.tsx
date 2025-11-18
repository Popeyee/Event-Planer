// API route for creating events with image upload and listing all events.
import { Event } from "@/database/event.model";
import connectToDatabase from "@/lib/mongodb";
import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Open a connection to MongoDB before doing anything else.
    await connectToDatabase();

    // Read the incoming multipart/form-data from the request.
    const formData = await req.formData();

    let event;

    try {
      // Convert form fields to a plain object we can store in MongoDB.
      event = Object.fromEntries(formData.entries());
    } catch (e) {
      return NextResponse.json(
        { message: "invalid json data format" },
        { status: 400 }
      );
    }

    // Extract the uploaded image file from the form data.
    const file = formData.get("image") as File | null;

    // Reject the request if no file was provided.
    if (!file)
      return NextResponse.json(
        { message: "Image file is required" },
        { status: 400 }
      );

    // Validate the image MIME type so we only accept supported image formats.
    const mimeType = file.type?.trim().toLowerCase();
    const allowedMimeTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

    if (!mimeType || !allowedMimeTypes.includes(mimeType)) {
      return NextResponse.json(
        { message: "Invalid file type: image required" },
        { status: 400 }
      );
    }

    // Convert the file to a buffer so it can be streamed to Cloudinary.
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload the image to Cloudinary and wait for the secure URL.
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { resource_type: "image", folder: "DevEvent" },
          (error, results) => {
            if (error) return reject(error);

            resolve(results);
          }
        )
        .end(buffer);
    });

    // Store the Cloudinary image URL on the event payload before saving.
    event.image = (uploadResult as { secure_url: string }).secure_url;

    // Create and persist the event document in MongoDB.
    const createdEvent = await Event.create(event);

    // Respond with the newly created event.
    return NextResponse.json(
      { message: "event created successfully", event: createdEvent },
      { status: 201 }
    );
  } catch (e) {
    // Catch any unexpected errors (DB, Cloudinary, etc.) and return 500.
    return NextResponse.json(
      {
        message: "Event creation failed",
        error: e instanceof Error ? e.message : "unknown",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Connect to the database before querying events.
    await connectToDatabase();

    // Fetch all events, sorted by newest first.
    const events = await Event.find().sort({ createdAt: -1 });

    // Return the list of events to the client.
    return NextResponse.json(
      { message: "event fetched successfully", events: events },
      { status: 200 }
    );
  } catch (error) {
    // If anything goes wrong (DB connection/query), send a 500 error.
    return NextResponse.json(
      { message: "event fetching failed", error: error },
      { status: 500 }
    );
  }
}
