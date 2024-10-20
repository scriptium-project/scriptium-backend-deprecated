import { z } from "zod";
import { createCollectionSchema } from "./createCollectionSchema";

const collectionNameShape = createCollectionSchema.shape.collectionName;

export const updateCollectionSchema = z.object({
  collectionName: collectionNameShape,
  collectionNewName: collectionNameShape,
  collectionNewDescription: createCollectionSchema.shape.description,
});
