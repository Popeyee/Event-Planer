"use server";

import { Booking } from "@/database";
import { connectToDatabase } from "../mongodb";

export const createBooking = async (
  eventId: string,
  email: string,
  slug: string
) => {
  try {
    await connectToDatabase();
    await Booking.create({ eventId, email, slug });
    return { success: true };
  } catch (error) {
    console.error("Error creating booking", error);
    return { success: false };
  }
};
