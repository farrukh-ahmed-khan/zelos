import mongoose, { HydratedDocument, InferSchemaType, Model, Schema } from "mongoose";

const FormSubmissionSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["contact", "school-demo", "scholarship-inquiry", "data-access", "data-deletion"],
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 160 },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    category: { type: String, trim: true, maxlength: 120, default: null },
    message: { type: String, required: true, trim: true, maxlength: 5000 },
    status: {
      type: String,
      enum: ["new", "reviewed", "closed"],
      default: "new",
      index: true,
    },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, versionKey: false },
);

type FormSubmission = InferSchemaType<typeof FormSubmissionSchema>;
export type FormSubmissionDocument = HydratedDocument<FormSubmission>;
type FormSubmissionModel = Model<FormSubmission>;

const FormSubmission =
  (mongoose.models.FormSubmission as FormSubmissionModel | undefined) ||
  mongoose.model<FormSubmission, FormSubmissionModel>(
    "FormSubmission",
    FormSubmissionSchema,
  );

export default FormSubmission;
