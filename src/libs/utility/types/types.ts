import { FastifyRequest, RouteGenericInterface } from "fastify";

/**
 *  A comprehensive type for regular negative responses.
 */
export type NegativeResponse = {
  err: string;
  code: number;
  [key: string]: unknown;
};

/**
 *  A comprehensive type for regular positive responses.
 */
export type PositiveResponse = {
  msg: string;
  code?: number;
  [key: string]: unknown;
};

/**
 *
 * @param T is an object.
 * @returns Returns a type which guarantees that at least one of the properties that the object has you have passed is not undefined.
 */

export type AtLeastOneKeyGeneric<T> = Partial<T> &
  { [K in keyof T]: Pick<T, K> }[keyof T];
