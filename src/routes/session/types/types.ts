export type RowCountType = {
  row_count: number;
};

export type GetCollectionIdType = {
  collection_id?: number;
};

export type GetVerseIdType = {
  verse_id: number;
};

export type GetCollectionType = {
  [collectionName: string]: {
    description: string;
    verse: { text: string; withoutVowel: string; note: string };
  };
};
