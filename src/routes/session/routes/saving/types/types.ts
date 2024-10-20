type InsertData = { code: number; collectionName: string; message: string };

export type InsertSavingType = {
  success: boolean;
  data: { result: InsertData[] };
};
