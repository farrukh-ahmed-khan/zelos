import mongoose, { HydratedDocument, InferSchemaType, Model, Schema } from "mongoose";

const EventSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 180,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    coverImageUrl: {
      type: String,
      trim: true,
      maxlength: 2048,
      default: null,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },
    type: {
      type: String,
      enum: ["online", "physical"],
      required: true,
      index: true,
    },
    meetingLink: {
      type: String,
      trim: true,
      maxlength: 2048,
      default: null,
      select: false,
    },
    status: {
      type: String,
      enum: ["scheduled", "updated", "cancelled"],
      required: true,
      default: "scheduled",
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

EventSchema.index({ date: 1, createdAt: -1 });

type Event = InferSchemaType<typeof EventSchema>;
export type EventDocument = HydratedDocument<Event>;
type EventModel = Model<Event>;

const Event =
  (mongoose.models.Event as EventModel | undefined) ||
  mongoose.model<Event, EventModel>("Event", EventSchema);

export default Event;
