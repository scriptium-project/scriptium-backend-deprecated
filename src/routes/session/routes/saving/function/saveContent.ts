import type { FastifyRequest, FastifyReply } from "fastify";
import type { z } from "zod";
import db from "../../../../../libs/db/db";
import type { User } from "../../../../../libs/session/passport/type";
import {
  HTTP_ACCEPTED_CODE,
  HTTP_INTERNAL_SERVER_ERROR_CODE,
  InternalServerErrorResponse,
} from "../../../../../libs/utility/types/utility";
import type { saveContentSchema } from "../types/saveContentSchema";
import type { InsertSavingType } from "../types/types";

/**
    Implementation of function named insert_into_collection()

    CREATE OR REPLACE FUNCTION insert_into_collection(
        p_user_id UUID,
        p_chapterNumber INT,
        p_verse_number INT,
        p_collectionNames VARCHAR(100)[],
        p_note VARCHAR(500)
    )
    RETURNS TABLE(success BOOLEAN, data JSONB) AS $$
    DECLARE
        verse_id SMALLINT;
        data JSONB := jsonb_build_object('succeed', '[]'::jsonb, 'fail', '[]'::jsonb);
        success BOOLEAN := FALSE;
        collectionId UUID;
        collectionName TEXT;
        affected_rows INTEGER;
    BEGIN
        SELECT id INTO verse_id
        FROM verse
        WHERE chapter_id = p_chapterNumber AND verse_number = p_verse_number;

        IF verse_id IS NULL THEN
            RETURN QUERY
            SELECT
                FALSE AS success,
                data;  -- Return immediately if verse not found
            RETURN;
        END IF;

        FOREACH collectionName IN ARRAY p_collectionNames LOOP
            SELECT id INTO collectionId
            FROM collection
            WHERE name = collectionName AND user_id = p_user_id;

            IF collectionId IS NULL THEN
                data := jsonb_set(
                    data,
                    '{fail}',
                    data->'fail' || to_jsonb(jsonb_build_object(
                        'collectionName', collectionName,
                        'code', 404,
                        'message', 'Collection named ' || collectionName || ' not found.'
                    )),
                    TRUE
                );
            ELSE
                BEGIN
                    INSERT INTO collection_verse (collectionId, verse_id, note)
                    VALUES (collectionId, verse_id, p_note);

                    GET DIAGNOSTICS affected_rows := ROW_COUNT;

                    IF affected_rows > 0 THEN
                        success := TRUE;
                        data := jsonb_set(
                            data,
                            '{succeed}',
                            data->'succeed' || to_jsonb(jsonb_build_object(
                                'collectionName', collectionName,
                                'code', 200,
                                'message', 'Succeed! Created on ' || collectionName
                            )),
                            TRUE
                        );
                    END IF;
                EXCEPTION
                    WHEN unique_violation THEN
                        data := jsonb_set(
                            data,
                            '{fail}',
                            data->'fail' || to_jsonb(jsonb_build_object(
                                'collectionName', collectionName,
                                'code', 409,
                                'message', 'Verse already saved in collection ' || collectionName || '.'
                            )),
                            TRUE
                        );
                END;
            END IF;
        END LOOP;

        RETURN QUERY
        SELECT success, data;
    END;
    $$ LANGUAGE plpgsql;
 */

export const saveContent = async (
  request: FastifyRequest<{
    Body: z.infer<typeof saveContentSchema>;
  }>,
  response: FastifyReply
): Promise<FastifyReply> => {
  const { chapterNumber, verseNumber, collectionNames, note } = request.body;

  const user = request.user as User;

  const queryString: string =
    "SELECT success, data FROM insert_into_collection($1,$2,$3,$4,$5)";

  try {
    const {
      rows: [{ success, data }],
    } = await db.query<InsertSavingType>(queryString, [
      user.id,
      chapterNumber,
      verseNumber,
      collectionNames,
      note,
    ]);

    return response.code(HTTP_ACCEPTED_CODE).send({
      success,
      data,
    });
  } catch (error) {
    console.error(error);
    return response
      .status(HTTP_INTERNAL_SERVER_ERROR_CODE)
      .send(InternalServerErrorResponse);
  }
};
