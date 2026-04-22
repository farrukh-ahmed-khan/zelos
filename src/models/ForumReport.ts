import mongoose, { HydratedDocument, InferSchemaType, Model, Schema } from "mongoose";

const ForumReportSchema = new Schema(
  {
    targetType: {
      type: String,
      enum: ["thread", "reply"],
      required: true,
      index: true,
    },
    targetId: {
      type: String,
      required: true,
      index: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    reporterId: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["open", "resolved", "dismissed"],
      default: "open",
      index: true,
    },
    resolvedBy: {
      type: String,
      default: null,
      index: true,
    },
    resolvedAt: {
      type: Date,
      default: null,
      index: true,
    },
    resolutionNote: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

ForumReportSchema.index({ targetType: 1, targetId: 1, reporterId: 1 });

type ForumReport = InferSchemaType<typeof ForumReportSchema>;
export type ForumReportDocument = HydratedDocument<ForumReport>;
type ForumReportModel = Model<ForumReport>;

const ForumReport =
  (mongoose.models.ForumReport as ForumReportModel | undefined) ||
  mongoose.model<ForumReport, ForumReportModel>("ForumReport", ForumReportSchema);

export default ForumReport;
