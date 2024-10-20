export type GetCollectionType = Record<string, Collection>;

export type GetCollectionIdType = {
  collection_id?: number;
};

type Collection = {
  description: string;
  verse: { text: string; withoutVowel: string; note: string };
};
