import mongoose, { HydratedDocument, InferSchemaType, Model, Schema } from "mongoose";

const EventRsvpSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    eventId: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

EventRsvpSchema.index({ userId: 1, eventId: 1 }, { unique: true });

type EventRsvp = InferSchemaType<typeof EventRsvpSchema>;
export type EventRsvpDocument = HydratedDocument<EventRsvp>;
type EventRsvpModel = Model<EventRsvp>;

const EventRsvp =
  (mongoose.models.EventRsvp as EventRsvpModel | undefined) ||
  mongoose.model<EventRsvp, EventRsvpModel>("EventRsvp", EventRsvpSchema);

export default EventRsvp;
