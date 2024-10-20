import { z } from "zod";
import { MAX_LENGTH_FOR_COLLECTION_NAME } from "../../../types/utility";

export const deleteCollectionSchema = z.object({
  collectionName: z.string().min(1).max(MAX_LENGTH_FOR_COLLECTION_NAME),
});
