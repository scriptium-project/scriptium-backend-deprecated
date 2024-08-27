export type NotFoundResponseSchema = {
  err: string;
  code: number;
};

export type InternalServerErrorSchema = {
  err: string;
  code: number;
};

export type AtLeastOneKeyGeneric<T> = Partial<T> &
  { [K in keyof T]: Pick<T, K> }[keyof T];
