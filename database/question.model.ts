import { model, models, Schema, Types } from "mongoose";

export interface IQuestion {
  title: string;
  content: string;
  author: Types.ObjectId;
  answers: number;
  tags: Types.ObjectId[];
  upvotes: number;
  downvotes: number;
  views: number;
}

export interface IQuestionDoc extends IQuestion, Document {}
const QuestionSchema = new Schema<IQuestion>({
  title: { type: String, require: true },
  content: { type: String, require: true },
  tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
  views: { type: Number, default: 0 },
  answers: { type: Number, default: 0 },
  upvotes: { type: Number, default: 0 },
  downvotes: { type: Number, default: 0 },
  author: { type: Schema.Types.ObjectId, ref: "User", require: true },
});

const Question =
  models?.Question || model<IQuestion>("Question", QuestionSchema);

export default Question;
