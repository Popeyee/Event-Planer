"use client";

import { createBooking } from "@/lib/actions/booking.actions";
import posthog from "posthog-js";
import React, { useState } from "react";

const BookEvent = ({ eventId, slug }: { eventId: string; slug: string }) => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { success } = await createBooking(eventId, email, slug);
    if (success) {
      setSubmitted(true);
      posthog.capture("booking_created", { eventId, slug, email });
    } else {
      console.error("Error creating booking");
      posthog.captureException("booking_failed");
    }
  };

  return (
    <div id="book-event">
      {submitted ? (
        <p className="text-sm"> Thank you for signing up</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email"> Email Adress</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              name="email"
              id="email"
              placeholder="Enter your email"
            />
          </div>
          <button type="submit" className="button-submit">
            Submit
          </button>
        </form>
      )}
    </div>
  );
};

export default BookEvent;
