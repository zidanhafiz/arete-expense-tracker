import { Model, Schema, Types, model } from "mongoose";

type IIncome = {
  user: Types.ObjectId;
  icon: string;
  name: string;
  description: string;
  amount: number;
  source: Types.ObjectId;
  date: Date;
  images: string[];
};

type IIncomeMethods = {};

type IncomeModel = Model<IIncome, {}, IIncomeMethods>;

const incomeSchema = new Schema<IIncome, IncomeModel, IIncomeMethods>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    icon: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    source: { type: Schema.Types.ObjectId, ref: "Source", required: true },
    date: { type: Date, required: true },
    images: { type: [String], required: false },
  },
  { timestamps: true }
);

const Income = model<IIncome, IncomeModel>("Income", incomeSchema);

export default Income;
