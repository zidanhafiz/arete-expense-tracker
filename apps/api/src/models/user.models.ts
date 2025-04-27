import { Model, Schema, model } from "mongoose";
import bcrypt from "bcrypt";

type IUser = {
  first_name: string;
  last_name: string;
  nickname: string;
  email: string;
  password: string;
  avatar: string;
  created_at: Date;
  updated_at: Date;
};

type IUserMethods = {
  comparePassword: (candidatePassword: string) => Promise<boolean>;
};

type UserModel = Model<IUser, {}, IUserMethods>;

// User schema
const userSchema = new Schema<IUser, UserModel, IUserMethods>({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  nickname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password
userSchema.method(
  "comparePassword",
  async function (candidatePassword: string): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, this.password);
  }
);

const User = model<IUser, UserModel>("User", userSchema);

export default User;
