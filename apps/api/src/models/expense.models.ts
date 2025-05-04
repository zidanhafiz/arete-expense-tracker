import { Model, Schema, Types, model } from "mongoose";

type IExpense = {
  user: Types.ObjectId;
  icon: string;
  name: string;
  description: string;
  amount: number;
  category: Types.ObjectId;
  date: Date;
  images: string[];
};

type IExpenseMethods = {};

type ExpenseModel = Model<IExpense, {}, IExpenseMethods>;

// Expense schema
const expenseSchema = new Schema<IExpense, ExpenseModel, IExpenseMethods>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    icon: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    date: { type: Date, required: true },
    images: { type: [String], required: false },
  },
  { timestamps: true }
);

const Expense = model<IExpense, ExpenseModel>("Expense", expenseSchema);

export default Expense;
