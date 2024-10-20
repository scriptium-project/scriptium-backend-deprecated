import { z } from "zod";
import { langCodeRefineFunction } from "../../../libs/utility/types/utility";
import { chapterVerseValidateFunction } from "../../../libs/utility/function/chapterVerseValidateFunction";

import { zScriptureSectionChapterVerseQuerySchema } from "../../../libs/utility/types/types";

export const getVerseSchema = z
  .object({
    ...zScriptureSectionChapterVerseQuerySchema,
    langCode: z.string().min(1).optional().refine(
      langCodeRefineFunction,

      {
        message: "Invalid language code.",
      }
    ),
  })
  .superRefine(chapterVerseValidateFunction);
