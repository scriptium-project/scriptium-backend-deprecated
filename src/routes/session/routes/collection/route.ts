import type { FastifyInstance, HookHandlerDoneFunction } from "fastify";
import { validateFunction } from "../../../../libs/utility/function/validateFunction";
import { createCollection } from "./function/createCollection";
import { deleteCollection } from "./function/deleteCollection";
import { getCollection } from "./function/getCollection";
import { updateCollection } from "./function/updateCollection";
import { createCollectionSchema } from "./types/createCollectionSchema";
import { deleteCollectionSchema } from "./types/deleteCollectionSchema";
import { getCollectionSchema } from "./types/getCollectionSchema";
import { updateCollectionSchema } from "./types/updateCollectionSchema";
import { rateLimitCreatorFunction } from "../../../../libs/utility/function/rateLimiterFunction";
import { REQUEST_COUNT_FOR_COLLECTION_ROUTE } from "./types/utility";

const collectionRouteRateLimiterConfigProperty = rateLimitCreatorFunction(
  REQUEST_COUNT_FOR_COLLECTION_ROUTE
);

export default function collectionRoute(
  server: FastifyInstance,
  _opts: unknown,
  done: HookHandlerDoneFunction
): void {
  //Collections

  //Prefix: /collection

  server.get("", {
    config: { rateLimit: collectionRouteRateLimiterConfigProperty },
    preValidation: validateFunction({ BodyParams: getCollectionSchema }),
    handler: getCollection,
  });

  server.post("/create", {
    config: { rateLimit: collectionRouteRateLimiterConfigProperty },
    preValidation: validateFunction({ BodyParams: createCollectionSchema }),
    handler: createCollection,
  });

  server.put("/update", {
    config: { rateLimit: collectionRouteRateLimiterConfigProperty },
    preValidation: validateFunction({ BodyParams: updateCollectionSchema }),
    handler: updateCollection,
  });

  server.delete("/delete", {
    config: { rateLimit: collectionRouteRateLimiterConfigProperty },
    preValidation: validateFunction({ BodyParams: deleteCollectionSchema }),
    handler: deleteCollection,
  });

  done();
}
