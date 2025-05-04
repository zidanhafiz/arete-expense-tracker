import { Schema, model, Types } from "mongoose";

export interface SourceDoc {
  user: Types.ObjectId;
  icon: string;
  name: string;
}

const sourceSchema = new Schema<SourceDoc>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    icon: { type: String, required: true },
    name: { type: String, required: true },
  },
  { timestamps: true }
);

sourceSchema.index({ user: 1, name: 1 }, { unique: true });

export default model<SourceDoc>("Source", sourceSchema);
