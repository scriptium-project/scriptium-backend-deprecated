import DOMPurify from "dompurify";
import type { z } from "zod";
import { JSDOM } from "jsdom";

export const MAX_LENGTH_FOR_NOTE = 500;

//TODO: Integrate this section with frontend package.
//#region
export const noteCheckFunction = (
  data: string,
  ctx: z.RefinementCtx
): string | HTMLElement | DocumentFragment => {
  const dom = new JSDOM(data);

  const Purify = DOMPurify(dom.window);

  //Styles Validation
  Purify.addHook("uponSanitizeAttribute", (node) => {
    const styleAttribute = node.getAttribute("style");
    if (styleAttribute) {
      const sanitizedStyles = styleAttribute
        .split(";")
        .map((s) => s.trim())
        .filter((s) => {
          const [prop] = s.split(":").map((str) => str.trim());
          return allowedStyles.includes(prop);
        })
        .join("; ");

      node.setAttribute("style", sanitizedStyles);
    }
  });

  const textLength = dom.window.document.body.textContent?.length ?? 0;
  if (textLength > MAX_LENGTH_FOR_NOTE)
    ctx.addIssue({
      code: "too_big",
      maximum: MAX_LENGTH_FOR_NOTE,
      inclusive: true,
      type: "string",
      message: `Note is too long; maximum length is ${MAX_LENGTH_FOR_NOTE} characters.`,
      path: ["note"],
    });

  return Purify.sanitize(dom.window.document.body.innerHTML, purifyOptions);
};

export const allowedStyles = ["background-color", "color"];

// Configuration for DOMPurify
export const purifyOptions: DOMPurify.Config = {
  ALLOWED_TAGS: ["p", "b", "i", "u", "strong", "em", "a", "span"],
  ALLOWED_ATTR: ["href", "title", "style"],
};
//#endregion

export const REQUEST_COUNT_FOR_NOTE_ROUTE = 50;

/*
 * NOTE:
 *
 * **Caution:** This rate limit value(s) is/are higher than typical for a new backend system given corresponding process(es). It is currently set this way to allow for extensive testing and initial usage monitoring.
 *
 * For detailed guidelines and best practices on implementing and configuring rate limiting, please refer to the `index.ts` file.
 */
