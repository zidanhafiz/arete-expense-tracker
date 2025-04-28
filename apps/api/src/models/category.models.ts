import { Schema, model, Types } from "mongoose";

export interface CategoryDoc {
  user: Types.ObjectId;
  icon: string;
  name: string;
}

const categorySchema = new Schema<CategoryDoc>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    icon: { type: String, required: true },
    name: { type: String, required: true },
  },
  { timestamps: true }
);

categorySchema.index({ user: 1, name: 1 }, { unique: true });

export default model<CategoryDoc>("Category", categorySchema);
