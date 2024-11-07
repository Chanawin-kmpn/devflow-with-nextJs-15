import { model, models, Schema } from "mongoose";

export interface IUser {
  name: string;
  username: string;
  email: string;
  bio?: string;
  image: string;
  location?: string;
  portfolio?: string;
  reputation?: number;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, require: true },
    username: { type: String, require: true },
    email: { type: String, require: true, unique: true },
    bio: { type: String },
    image: { type: String, require: true },
    location: { type: String },
    portfolio: { type: String },
    reputation: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const User = models?.user || model<IUser>("User", UserSchema);

export default User;
