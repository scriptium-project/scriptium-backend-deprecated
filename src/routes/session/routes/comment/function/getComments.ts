import type { FastifyReply, FastifyRequest } from "fastify";
import type { z } from "zod";
import {
  HTTP_FORBIDDEN_CODE,
  HTTP_INTERNAL_SERVER_ERROR_CODE,
  HTTP_OK_CODE,
  InternalServerErrorResponse,
} from "../../../../../libs/utility/types/utility";
import db from "../../../../../libs/db/db";
import type { User } from "../../../../../libs/session/passport/type";
import type { getCommentsSchema } from "../types/getCommentsSchema";

/**
The Writings project has an unusual comment system in line with the project purpose. With the purpose of represent, you can see the diagram that capital letters represent users and prefixed "c" ones symbols the comment made my corresponding users. Besides that capital letters with sign ~ indicates that his users account is private. Finally, the parenthesis rightmost side represent if external user is able to see relevant comment.

For instance, let suppose that external user is A and comment schema looks like this:

cA(+)
     cB~(+)

Implies that there is top comment which is cA, and a comment whom wants to reply that one which is cB with private account, and external user which is user A can see both.

In Writings comment system grounds that statements:
1. Users can see the comment made by ones they follow.
2. Users can see their comments.
3. Users cannot see replies to their comments unless the replier’s account is private and the user does not follow the replier.
4. Users can reply comments whichsoever they see.

For demonstrating the comments system the writings project has, there are 2 state following.

State 1.

Lets suppose that external user is X and user V followed by user K and Z. User X follows user V and Z.

cV(+) 1*
     cX(+) 2*
     cK(-) 3*
          cV(-) 4*
     cZ(+) 5*
          cV(+) 6*

1*: User X can see this comment because he/she follows user V.
2*: User X can see this comment as it is his/her comment.
3*: User X cannot see this comment because he/she does NOT follow user K.
4*: User X cannot see this comment despite to following user V, since this comment attached the comment belongs to user V does not follow.
5*: User X can see this comment because user Z is followed by user X.
6*: Reason mentioned in footnote 1.

State 2:

Let's assume that user X is the external user. And user X follows no one.

cX(+) 1*
     cK(+) 2*
          cK(-) 3*
          cX(+) 4*
    cV(+) 5*
          cX(+) 6*
     cS~(-) 7*
           cV(-) 8*

1*: User X can see this comment as this comment belongs to his/herself
2*: User X can see this comment even if he/she does NOT follow user K. Because this comment attached on his own comment and user K does not have private account.
3*: User X cannot see this comment. Because of not following the user K, it does not matter that user X can see comment number 2.
4*: User X can see this comment because the reason mentioned for comment number 1.
5*: User X can see this comment because of following the user V.
6*: User X can see this comment because the reason mentioned for comment number 1.
7*: User X cannot see this comment even if this comment replies his comment. Because user S has private account and relevant user does not follow user S.
8*: User X cannot see this comment because he does not follow user S.

As for notes. Notes considered top comment for user whoever belongs to.
 */

export const getComments = async (
  request: FastifyRequest<{
    Params: z.infer<typeof getCommentsSchema>;
  }>,
  response: FastifyReply
): Promise<FastifyReply> => {
  const { type } = request.params;

  const user = request.user as User;

  if (type === "note") {
    const {
      rows: [{ isOwner, isAccepted } = {}],
    } = await db.query<{ isOwner: boolean; isAccepted: boolean }>(
      `SELECT 
          COALESCE(n.user_id = $1, false) as "isOwner", 
          COALESCE(f.status = 'accepted', false) as "isAccepted"
       FROM note n
       LEFT JOIN follow f ON f.follower_id = $1 AND f.followed_id = n.user_id
       WHERE n.id = $2`,
      [user.id, request.params.noteId]
    );

    // If the user is neither the owner nor following the note's owner
    if (!isOwner && !isAccepted) {
      return response.code(HTTP_FORBIDDEN_CODE).send({
        message: "You are not allowed to see that note.",
        code: HTTP_FORBIDDEN_CODE,
      });
    }
  }

  const whereConditionRecord: Record<string, string> = {
    note: `LEFT JOIN comment_note cn ON cn.comment_id = cm.Id WHERE cn.note_id = $2`,
    verse: `LEFT JOIN comment_verse cv ON cv.comment_id = cm.Id WHERE cv.verse_id = (
        SELECT id 
        FROM verse 
        WHERE chapter_id = $2 
          AND verse_number = $3
    )`,
  } as const;

  const params: unknown[] = [user.id];

  const whereCondition = whereConditionRecord[type];

  const queryString = `WITH RECURSIVE comment_hierarchy AS (
    -- Base case: Select top-level comments
    SELECT
        c.id,
        c.user_id,
        u.username,
        (u.is_private IS NOT NULL) AS is_private, 
        c.text,
        c.created_at,
        c.updated_at,
        c.parent_comment_id,
        (SELECT COUNT(*) FROM like_comment WHERE comment_id = c.Id) as like_count,
        1 AS depth,
        ARRAY[c.id] AS path
    FROM
        comment c
    ${
      type === "note" ? "LEFT JOIN comment_note cn ON cn.comment_id = c.Id" : ""
    }
    LEFT JOIN "user" u ON c.user_id = u.id
    WHERE
        c.parent_comment_id IS NULL
        AND (
            c.user_id = $1
            ${type === "note" ? " OR cn.note_id = $2 " : ""}
            OR EXISTS (
                SELECT 1 
                FROM follow f
                WHERE f.follower_id = $1 
                  AND f.followed_id = c.user_id 
                  AND f.status = 'accepted'
            )
        )

    UNION ALL

    -- Recursive case: Select child comments
    SELECT
        c.id,
        c.user_id,
        u.username,
        (u.is_private IS NOT NULL) AS is_private,
        c.text,
        c.created_at,
        c.updated_at,
        c.parent_comment_id,
        (SELECT COUNT(*) FROM like_comment WHERE comment_id = c.Id) as like_count,
        ch.depth + 1 AS depth,
        path || c.id
    FROM
        comment c
    INNER JOIN comment_hierarchy ch ON c.parent_comment_id = ch.id
    LEFT JOIN "user" u ON c.user_id = u.id
    WHERE
        NOT c.id = ANY(path)
        AND (
            -- Condition 1: Comments by the user
            (
                ch.user_id = $1 
                AND (
                    u.is_private IS NULL
                    OR (
                        u.is_private IS NOT NULL 
                        AND EXISTS (
                            SELECT 1 
                            FROM follow f 
                            WHERE f.follower_id = $1 
                              AND f.followed_id = c.user_id 
                              AND f.status = 'accepted'
                        )
                    )
                )
                AND (
                    SELECT is_frozen IS NULL FROM "user" WHERE "user".id = ch.user_id
                )
            )
            OR
            -- Condition 2: Comments on followed users' comments
            (
                ch.user_id != $1
                AND EXISTS (
                    SELECT 1 
                    FROM follow f
                    WHERE f.follower_id = $1 
                      AND f.followed_id = ch.user_id 
                      AND f.status = 'accepted'
                )
                AND EXISTS (
                    SELECT 1
                    FROM follow f2
                    WHERE f2.follower_id = $1
                      AND f2.followed_id = c.user_id
                      AND f2.status = 'accepted'
                )
            )
            OR
            -- Condition 3: User's own reply
            (
                ch.id = c.parent_comment_id 
                AND c.user_id = $1
            )
        )
)
SELECT
    id,
    user_id,
    username,
    is_private,
    text,
    created_at,
    updated_at,
    parent_comment_id,
    like_count,
    depth,
    path
FROM
    comment_hierarchy cm
  ${whereCondition}
ORDER BY
    array_length(path, 1),
    created_at;
`;

  try {
    if (type === "verse")
      params.push(request.params.chapterNumber, request.params.verseNumber);
    else if (type === "note") params.push(request.params.noteId);

    const { rows, rowCount: count } = await db.query<Comment[]>(
      queryString,
      params
    );

    return response.code(HTTP_OK_CODE).send({
      data: {
        count,
        rows,
      },
    });
  } catch (error) {
    console.error(error);
    return response
      .code(HTTP_INTERNAL_SERVER_ERROR_CODE)
      .send(InternalServerErrorResponse);
  }
};
