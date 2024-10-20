export const LIKEABLE_CONTENT = ["comment", "note"] as const;

export const REQUEST_COUNT_FOR_LIKE_ROUTE = 500;
export const TIME_WINDOW_FOR_LIKE_RATE_LIMIT = 36e4;

/*
 * NOTE:
 *
 * **Caution:** This rate limit value(s) is/are higher than typical for a new backend system given corresponding process(es). It is currently set this way to allow for extensive testing and initial usage monitoring.
 *
 * For detailed guidelines and best practices on implementing and configuring rate limiting, please refer to the `index.ts` file.
 */
