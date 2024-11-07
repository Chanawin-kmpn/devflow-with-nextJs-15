import { model, models, Schema, Types } from "mongoose";

export interface IQuestion {
  title: string;
  detail: string;
  author: Types.ObjectId;
  createdAt: Date;
  answers: number;
  tags: Types.ObjectId;
  upvotes: number;
  downvotes: number;
  views: number;
}

const QuestionSchema = new Schema<IQuestion>({
  title: { type: String, require: true },
  detail: { type: String, require: true },
  author: { type: Schema.Types.ObjectId, ref: "User", require: true },
  createdAt: { type: Date, default: new Date() },
  answers: { type: Number, default: 0 },
  tags: { type: Schema.Types.ObjectId, ref: "Tag" },
  upvotes: { type: Number, default: 0 },
  downvotes: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
});

const Question =
  models?.question || model<IQuestion>("question", QuestionSchema);

export default Question;
