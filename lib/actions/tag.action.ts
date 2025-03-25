import { FilterQuery, TagSet } from "mongoose";

import { Question, Tag } from "@/database";

import action from "../handler/action";
import handleError from "../handler/error";
import {
  GetTagQuestionSchema,
  PaginatedSearchParamsSchema,
} from "../validations";

export const getTags = async (
  params: PaginatedSearchParams
): Promise<ActionResponse<{ tags: Tag[]; isNext: boolean }>> => {
  const validationResult = await action({
    params,
    schema: PaginatedSearchParamsSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }
  const { page = 1, pageSize = 10, query, filter } = params;

  const skip = (Number(page) - 1) * pageSize; //* Skip คือจำนวนที่ต้องการข้ามการ Render item ในหน้าต่อไป เช่น ถ้า page = 2 และ page size 10 ก็จะข้าม item ไป 10 อัน เพื่อต่อจากหน้าที่แล้ว
  const limit = Number(pageSize);

  const filterQuery: FilterQuery<typeof Tag> = {};

  if (query) {
    filterQuery.$or = [
      {
        name: {
          $regex: query,
          $options: "i",
        },
      },
    ];
  }

  let sortCriteria = {};
  switch (filter) {
    case "popular":
      sortCriteria = { questions: -1 };
      break;
    case "recent":
      sortCriteria = { createdAt: -1 };
      break;
    case "oldest":
      sortCriteria = { createdAt: 1 };
      break;
    case "name":
      sortCriteria = { name: 1 };
      break;
    default:
      sortCriteria = { questions: -1 };
      break;
  }

  try {
    const totalTags = await Tag.countDocuments(filterQuery);

    const tags = await Tag.find(filterQuery)
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit);

    const isNext = totalTags > skip + tags.length;

    return {
      success: true,
      data: { tags: JSON.parse(JSON.stringify(tags)), isNext },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
};

export const getTagQuestion = async (
  params: GetTagQuestionsParams
): Promise<
  ActionResponse<{ tag: TagSet; questions: Question[]; isNext: boolean }>
> => {
  const validationResult = await action({
    params,
    schema: GetTagQuestionSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }
  const { tagId, page = 1, pageSize = 10, query } = params;

  const skip = (Number(page) - 1) * pageSize; //* Skip คือจำนวนที่ต้องการข้ามการ Render item ในหน้าต่อไป เช่น ถ้า page = 2 และ page size 10 ก็จะข้าม item ไป 10 อัน เพื่อต่อจากหน้าที่แล้ว
  const limit = Number(pageSize);

  try {
    const tag = await Tag.findById(tagId);
    if (!tag) throw new Error("Tag not found");

    const filterQuery: FilterQuery<typeof Question> = {
      tags: { $in: [tagId] },
    };

    if (query) {
      filterQuery.title = {
        $regex: query,
        $options: "i",
      };
    }
    const totalQuestions = await Question.countDocuments(filterQuery);

    const questions = await Question.find(filterQuery)
      .select("_id title views answers upvotes downvotes author createdAt")
      .populate([
        { path: "author", select: "name image" },
        { path: "tags", select: "name" },
      ])
      .skip(skip)
      .limit(limit);

    const isNext = totalQuestions > skip + questions.length;

    return {
      success: true,
      data: {
        tag: JSON.parse(JSON.stringify(tag)),
        questions: JSON.parse(JSON.stringify(questions)),
        isNext,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
};
