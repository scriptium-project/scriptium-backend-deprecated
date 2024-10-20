import { z } from "zod";
import { MAX_LENGTH_FOR_COLLECTION_NAME } from "../../../types/utility";

export const getCollectionSchema = z
  .object({
    collectionName: z
      .string()
      .trim()
      .min(1)
      .max(MAX_LENGTH_FOR_COLLECTION_NAME)
      .optional(),
  })
  .optional();
