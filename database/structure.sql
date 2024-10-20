--#region Core tables.

-- Tables related to the core text data (chapters, verses, words, etc.)

CREATE TABLE language (
    id SMALLSERIAL NOT NULL PRIMARY KEY,
    lang_code VARCHAR(2) NOT NULL UNIQUE,
    lang_own VARCHAR(20) NOT NULL,
    lang_english VARCHAR(20) NOT NULL
);

-- Sample language entries
INSERT INTO language (lang_code, lang_own, lang_english) VALUES
('en', 'English', 'English'),
('de', 'Deutsch', 'German'),
('tr', 'Türkçe', 'Turkish');

CREATE TABLE scripture(
    id SMALLSERIAL PRIMARY KEY,
    scripture_name VARCHAR(50) NOT NULL UNIQUE,
    scripture_code VARCHAR(1) NOT NULL UNIQUE,
    section_count SMALLINT NOT NULL
);

CREATE TABLE scripture_meaning(
    id SERIAL NOT NULL PRIMARY KEY,
    meaning VARCHAR(50),
    scripture_id SMALLINT NOT NULL,
    lang_id SMALLINT NOT NULL,
    FOREIGN KEY (lang_id) REFERENCES language(id),
    FOREIGN KEY (scripture_id) REFERENCES scripture(id),
    UNIQUE(lang_id, scripture_id)
);

CREATE TABLE section(
    id SERIAL PRIMARY KEY,
    section_name VARCHAR(100) NOT NULL UNIQUE,
    section_number SMALLINT NOT NULL,
    chapter_count SMALLINT NOT NULL,
    scripture_id SMALLINT NOT NULL,
    Foreign Key (scripture_id) REFERENCES scripture(Id) ON DELETE RESTRICT ON UPDATE CASCADE,
    UNIQUE(scripture_id, section_number)
);

CREATE TABLE section_meaning(
    id SERIAL NOT NULL PRIMARY KEY,
    meaning VARCHAR(50),
    section_id SMALLINT NOT NULL,
    lang_id SMALLINT NOT NULL,
    FOREIGN KEY (lang_id) REFERENCES language(id),
    FOREIGN KEY (section_id) REFERENCES section(id),
    UNIQUE(lang_id, section_id)
);

CREATE TABLE chapter (  
    id SERIAL NOT NULL PRIMARY KEY,
    chapter_name TEXT NOT NULL UNIQUE,
    chapter_number SMALLINT NOT NULL,
    verse_count SMALLINT NOT NULL,
    page_number SMALLINT NOT NULL,
    section_id INT NOT NULL,
    Foreign Key (section_id) REFERENCES section(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    UNIQUE(section_id, id)
);


CREATE TABLE chapter_meaning(
    id SERIAL NOT NULL PRIMARY KEY,
    meaning VARCHAR(50),
    chapter_id SMALLINT NOT NULL,
    lang_id SMALLINT NOT NULL,
    FOREIGN KEY (lang_id) REFERENCES language(id),
    FOREIGN KEY (chapter_id) REFERENCES chapter(id),
    UNIQUE(lang_id, chapter_id)
);

CREATE TABLE root (
    id SERIAL NOT NULL PRIMARY KEY,
    latin VARCHAR(5) NOT NULL,
    own VARCHAR(5) NOT NULL,
    scripture_id SMALLINT NOT NULL,
    Foreign Key (scripture_id) REFERENCES scripture(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    UNIQUE(latin, own, scripture_id)
);

CREATE TABLE verse(
    id SERIAL NOT NULL PRIMARY KEY,
    verse_number SMALLINT NOT NULL,
    text VARCHAR(1178) NOT NULL,
    text_simplified VARCHAR(1178) NOT NULL,
    text_no_vowel VARCHAR(1178) NOT NULL,
    page_number SMALLINT NOT NULL,
    chapter_id INT NOT NULL,
    FOREIGN KEY (chapter_id) REFERENCES chapter(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    UNIQUE(chapter_id, verse_number)
);

CREATE TABLE word(
    id SERIAL NOT NULL PRIMARY KEY,
    sequence_number SMALLINT,
    text VARCHAR(22) NOT NULL,
    text_no_vowel VARCHAR(22) NOT NULL,
    verse_id INTEGER NOT NULL,
    root_id INTEGER,
    FOREIGN KEY (root_id) REFERENCES root(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (verse_id) REFERENCES verse(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    UNIQUE(sequence_number, verse_id)
);

CREATE TABLE word_meaning(
    id BIGSERIAL NOT NULL PRIMARY KEY,
    meaning VARCHAR(100) NOT NULL,
    word_id SMALLINT NOT NULL,
    lang_id SMALLINT NOT NULL,
    FOREIGN KEY (word_id) REFERENCES word(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (lang_id) REFERENCES language(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    UNIQUE(word_id, lang_id)
);

CREATE TABLE transliteration(
    id SERIAL PRIMARY KEY NOT NULL,
    lang_id SMALLINT NOT NULL,
    transliteration VARCHAR(1500) NOT NULL,
    verse_id INTEGER NOT NULL,
    FOREIGN KEY (verse_id) REFERENCES verse(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (lang_id) REFERENCES language(id)
);


--#endregion

--#region Language and Translation

-- Tables related to translations, translators, and footnotes


CREATE TABLE translator(
    id SMALLSERIAL NOT NULL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    url VARCHAR(2000),
    lang_id SMALLINT NOT NULL,
    FOREIGN KEY (lang_id) REFERENCES language(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE translation(
    id SMALLSERIAL NOT NULL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    lang_id SMALLINT NOT NULL DEFAULT 1,
    prod_year DATE,
    date_added TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_eager TIMESTAMPTZ DEFAULT NULL,
    FOREIGN KEY (lang_id) REFERENCES language(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE translator_translation(
    id SMALLSERIAL NOT NULL PRIMARY KEY,
    translator_id SMALLSERIAL NOT NULL,
    translation_id SMALLSERIAL NOT NULL,
    FOREIGN KEY (translator_id) REFERENCES translator(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (translation_id) REFERENCES translation(id) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE(translation_id, translator_id)
);

CREATE TABLE translation_text(
    id BIGSERIAL NOT NULL PRIMARY KEY,
    translation TEXT NOT NULL,
    translation_id SMALLINT NOT NULL,
    verse_id INTEGER NOT NULL,
    FOREIGN KEY (translation_id) REFERENCES translation(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (verse_id) REFERENCES verse(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    UNIQUE(translation, translation_id, verse_id)
);

CREATE TABLE footnote_text(
    id SERIAL NOT NULL PRIMARY KEY,
    text TEXT NOT NULL
);

-- Since some footnotes are extremely long, the UNIQUE constraint doesn't work correctly with long texts. Using a partial index as a temporary solution.
CREATE UNIQUE INDEX unique_partial_text ON footnote_text (left(text, 2048));

CREATE TABLE footnote(
    id SERIAL NOT NULL PRIMARY KEY,
    number SMALLINT NOT NULL,
    index SMALLINT NOT NULL,
    translation_text_id BIGINT NOT NULL,
    footnote_text_id INT NOT NULL,
    FOREIGN KEY (translation_text_id) REFERENCES translation_text(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (footnote_text_id) REFERENCES footnote_text(id) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE(translation_text_id, index, footnote_text_id)
);


--#endregion

--#region User and Authentication

-- Tables and functions related to user authentication and roles

CREATE TABLE role (
    id SMALLSERIAL PRIMARY KEY,
    role VARCHAR(15) UNIQUE NOT NULL,
    description VARCHAR(250)
);

-- Sample roles
INSERT INTO role (role) VALUES ('admin'), ('verified');

CREATE TABLE "user" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(24) NOT NULL UNIQUE,
    name VARCHAR(30) NOT NULL,
    surname VARCHAR(30) NOT NULL,
    gender CHAR(1),
    biography VARCHAR(200),
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified TIMESTAMPTZ,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMPTZ,
    is_frozen TIMESTAMPTZ DEFAULT NULL,
    is_private TIMESTAMPTZ,
    role_id SMALLINT,
    preferred_languageId SMALLINT DEFAULT 1,
    FOREIGN KEY (role_id) REFERENCES role(id) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (preferred_languageId) REFERENCES language(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Enforce case-insensitive uniqueness on usernames
CREATE UNIQUE INDEX unique_username_ci ON "user" (LOWER(username));

CREATE TABLE session (
    id VARCHAR(100) NOT NULL PRIMARY KEY,
    user_id UUID,   
    expires_at TIMESTAMPTZ,
    session JSONB NOT NULL    
);

-- Function to set userId from session data
CREATE OR REPLACE FUNCTION set_user_id_from_session()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.session ? 'passport' AND (NEW.session -> 'passport') IS NOT NULL THEN
        NEW.user_id := (NEW.session ->> 'passport')::UUID;
    ELSE
        NEW.user_id := NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_user_id
BEFORE INSERT OR UPDATE ON session
FOR EACH ROW
EXECUTE FUNCTION set_user_id_from_session();


--#endregion

--#region Custom Types and ENUMS

CREATE TYPE process_result AS (
    success BOOLEAN,
    message TEXT,
    code INT
);


--#endregion

--#region Collections and User Content

-- Tables and functions related to user collections, notes, and comments

CREATE TABLE collection (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL DEFAULT '',
    description VARCHAR(250),
    user_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE(user_id, name)
);

-- Trigger function to create a default collection for each new user
CREATE OR REPLACE FUNCTION create_default_collection()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO collection (name, user_id, created_at)
    VALUES ('', NEW.id, CURRENT_TIMESTAMP);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_user_insert
AFTER INSERT ON "user"
FOR EACH ROW
EXECUTE FUNCTION create_default_collection();

-- Function to enforce collection limit per user
CREATE OR REPLACE FUNCTION check_user_collection_limit()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT COUNT(*) FROM collection WHERE user_id = NEW.user_id) > 50 THEN
        RETURN NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_user_collection_limit_trigger
AFTER INSERT ON collection
FOR EACH ROW
EXECUTE FUNCTION check_user_collection_limit();

CREATE TABLE collection_verse (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_id UUID NOT NULL,
    verse_id INTEGER NOT NULL,
    saved_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    note VARCHAR(250),
    FOREIGN KEY (collection_id) REFERENCES collection(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (verse_id) REFERENCES verse(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    UNIQUE(collection_id, verse_id)
);

-- Function to insert verses into collections
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
    v_collection_id UUID := NULL;
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
        SELECT id INTO v_collection_id 
        FROM collection 
        WHERE name = collectionName AND user_id = p_user_id;


        IF v_collection_id IS NULL THEN
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
                INSERT INTO collection_verse (collection_Id, verse_id, note)
                VALUES (v_collection_id, verse_id, p_note);

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

CREATE TABLE note (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    text TEXT NOT NULL,
    verse_id INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ,
    FOREIGN KEY (verse_id) REFERENCES verse(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_note_userId_verse_id ON note(user_id, verse_id);

-- Function to enforce note limits per user
CREATE OR REPLACE FUNCTION check_user_note_limit()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT COUNT(*) FROM note WHERE user_id = NEW.user_id AND verse_id = NEW.verse_id) > 5 OR
       (SELECT COUNT(*) FROM note WHERE user_id = NEW.user_id) > 100 THEN
        RETURN NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_user_note_limit_trigger
BEFORE INSERT ON note
FOR EACH ROW
EXECUTE FUNCTION check_user_note_limit();


CREATE TABLE comment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    text VARCHAR(500) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ,
    parent_comment_id UUID,
    FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (parent_comment_id) REFERENCES comment(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Index on parent_comment_id for performance
CREATE INDEX idx_comment_user_id ON comment(user_id);
CREATE INDEX idx_parent_comment ON comment(parent_comment_id);

CREATE TABLE comment_verse (
    comment_id UUID PRIMARY KEY,
    verse_id INTEGER NOT NULL,
    FOREIGN KEY (comment_id) REFERENCES comment(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (verse_id) REFERENCES verse(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX idx_comment_verse_verse_id ON comment_verse(verse_id);
CREATE INDEX idx_comment_verse_comment_id ON comment_verse(comment_id);

CREATE TABLE comment_note (
    comment_id UUID PRIMARY KEY,
    note_id UUID NOT NULL,
    FOREIGN KEY (comment_id) REFERENCES comment(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (note_id) REFERENCES note(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_comment_note_note_id ON comment_note(note_id);
CREATE INDEX idx_comment_note_comment_id ON comment_note(comment_id);

-- Function to enforce comment rules
CREATE OR REPLACE FUNCTION check_user_comment_limit()
RETURNS TRIGGER AS $$
DECLARE
    parent_user_id UUID;
    is_frozen BOOLEAN;
    parent_is_private BOOLEAN;
BEGIN   

    -- Check if the comment is a reply
        IF NEW.parent_comment_id IS NULL THEN
            RETURN NEW;
        END IF;

        SELECT user_id INTO parent_user_id
        FROM comment 
        WHERE comment.id = NEW.parent_comment_id;
        
    -- Check if the parent_user_id is NULL
        IF parent_user_id IS NULL THEN
            RETURN NULL;
        END IF;
        
        -- Check if the parent user is frozen (suspended)
        SELECT "user".is_frozen INTO is_frozen
        FROM "user" 
        WHERE id = parent_user_id;
        
        IF is_frozen IS NOT NULL THEN
            RETURN NULL;
        END IF;
        
        
        -- Proceed to evaluate the four permission cases
        
        /*
        Permission Cases:
        1. Replying to a comment made by someone the user follows.
        2. Replying to their own comment.
        3. Replying to replies on their own comments.
           - If the original commenter has a private account, the user must be following them.
        */


        -- Case 2: Allow if the user is replying to their own comment
        IF (parent_user_id = NEW.user_id) THEN 
            RETURN NEW;
        END IF;
        
        -- Case 3: Allow if the user is following the parent user with an 'accepted' status
        IF EXISTS (
            SELECT 1 FROM follow 
            WHERE follower_id = NEW.user_id 
              AND followed_id = parent_user_id 
              AND status = 'accepted'
        ) THEN 
            RETURN NEW;
        END IF;



        -- Case 4: Allow if replying to a reply on the user's own comment
        IF EXISTS (
            SELECT 1 
            FROM comment c
            WHERE c.id = (
                SELECT parent_comment_id 
                FROM comment 
                WHERE id = NEW.parent_comment_id
            ) 
            AND c.user_id = NEW.user_id
        ) THEN
            SELECT is_private INTO parent_is_private 
            FROM "user" 
            WHERE id = parent_user_id;
            
            IF (parent_is_private = FALSE) OR EXISTS (
                SELECT 1 FROM follow 
                WHERE follower_id = NEW.user_id 
                  AND followed_id = parent_user_id 
                  AND status = 'accepted'
            ) THEN
                RETURN NEW;
            END IF;
        END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION check_and_handle_user_comment_limit_verse()
RETURNS TRIGGER AS $$
DECLARE
    a_user_id UUID;
    comment_count INT;
    parent_comment_id UUID;
    parent_comment_verse_count INT;
BEGIN
    -- Retrieve the userId associated with the new comment
    SELECT c.user_id, c.parent_comment_id INTO a_user_id, parent_comment_id
    FROM comment c 
    WHERE c.id = NEW.comment_id;

    -- Count the number of comments the user has on the specified verse
    SELECT COUNT(*) INTO comment_count
    FROM comment c
    JOIN comment_verse cv ON c.id = cv.comment_id
    WHERE c.user_id = a_user_id
      AND cv.verse_id = NEW.verse_id;

    -- Check if the user has reached the limit
    IF comment_count >= 25 THEN
        -- Delete the comment from the comment table
        DELETE FROM comment WHERE id = NEW.comment_id;

        -- Prevent the insertion into comment_verse
        RETURN NULL;
    END IF;

    -- If the comment is a reply, validate parent comment's association
    IF parent_comment_id IS NOT NULL THEN
        -- Check if the parent comment is associated with the same verse
        SELECT COUNT(*) INTO parent_comment_verse_count
        FROM comment_verse cv
        WHERE cv.comment_id = parent_comment_id
          AND cv.verse_id = NEW.verse_id;

        IF parent_comment_verse_count = 0 THEN
            -- Parent comment is not associated with this verse
            -- Delete the comment from the comment table
            DELETE FROM comment WHERE id = NEW.comment_id;

            -- Prevent the insertion into comment_verse
            RETURN NULL;
        END IF;
    END IF;

    -- If all checks pass, allow the insertion to proceed
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER trg_handle_comment_limit_verse
BEFORE INSERT ON comment_verse
FOR EACH ROW
EXECUTE FUNCTION check_and_handle_user_comment_limit_verse();


CREATE OR REPLACE FUNCTION check_and_handle_user_comment_limit_note()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
    comment_count INT;
    a_parent_comment_id UUID;
    is_parent_exist_in_same_note BOOLEAN;
    owner_note_user_id UUID;
BEGIN
    -- Retrieve the userId associated with the new comment
    SELECT c.user_id, c.parent_comment_id INTO v_user_id, a_parent_comment_id
    FROM comment c 
    WHERE c.id = NEW.comment_id;

    -- Count the number of comments the user has on the specified note
    SELECT COUNT(*) INTO comment_count
    FROM comment c
    JOIN comment_note cn ON c.id = cn.comment_id
    WHERE c.user_id = v_user_id
      AND cn.note_id = NEW.note_id;

    -- Check if the user has reached the limit
    IF comment_count >= 30 THEN
        -- Delete the comment from the comment table
        DELETE FROM comment WHERE id = NEW.comment_id;

        -- Prevent the insertion into comment_note
        RETURN NULL;
    END IF;

    -- If the comment is a reply, validate parent comment's association
    IF a_parent_comment_id IS NOT NULL THEN
        -- Check if the parent comment is associated with the same note
        SELECT EXISTS (SELECT 1 FROM comment_note cn
        WHERE cn.comment_id = a_parent_comment_id
          AND cn.note_id = NEW.note_id) INTO is_parent_exist_in_same_note;
        

        IF is_parent_exist_in_same_note = FALSE THEN
            -- Delete the comment from the comment table
            DELETE FROM comment WHERE id = NEW.comment_id;

            -- Prevent the insertion into comment_note
            RETURN NULL;
        END IF;
    END IF;

    SELECT user_id INTO owner_note_user_id FROM comment WHERE id = a_parent_comment_id;

    IF v_user_id != owner_note_user_id AND NOT EXISTS (SELECT 1 FROM follow WHERE follower_id = v_user_id AND followed_id = owner_note_user_id AND status = 'accepted') THEN
        RETURN NULL;
    END IF;


    -- If all checks pass, allow the insertion to proceed
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER trg_handle_comment_limit_note
BEFORE INSERT ON comment_note
FOR EACH ROW
EXECUTE FUNCTION check_and_handle_user_comment_limit_note();

CREATE TRIGGER check_user_comment_limit_trigger
BEFORE INSERT ON comment
FOR EACH ROW
EXECUTE FUNCTION check_user_comment_limit();

CREATE OR REPLACE FUNCTION create_comment_on_verse(
    p_user_id UUID,
    p_chapterNumber INT,
    p_verse_number INT,
    p_parent_comment_id UUID,
    p_comment_text VARCHAR(500)
) RETURNS process_result AS $$
DECLARE
    result process_result;
    new_comment_id UUID;
    v_verse_id INTEGER;
    affected_rows INT DEFAULT 0;
    affected_rows_verse INT DEFAULT 0;
BEGIN
    SELECT id INTO v_verse_id FROM verse 
    WHERE verse_number = p_verse_number AND chapter_id = p_chapterNumber;
    
    IF NOT FOUND THEN
        result.success := FALSE;
        result.message := 'Verse does not exist.';
        result.code := 404;
        RETURN result;
    END IF;

    IF p_parent_comment_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM comment WHERE id = p_parent_comment_id) THEN
        result.success := FALSE;
        result.message := 'Parent comment does not exist.';
        result.code := 404; -- Not found.
        RETURN result;
    END IF;

    IF (SELECT comment_verse.verse_id FROM comment_verse WHERE comment_id = p_parent_comment_id) != v_verse_id THEN
        result.success := FALSE;
        result.message := 'Parent comment is situated in another verse.';
        result.code := 418 ; -- I am a teapot. :)
        RETURN result;
    END IF;

    INSERT INTO "comment" (user_id, text, parent_comment_id)
    VALUES (p_user_id, p_comment_text, p_parent_comment_id)
    RETURNING id INTO new_comment_id;

    GET DIAGNOSTICS affected_rows = ROW_COUNT;

    IF affected_rows = 0 THEN
        result.success := FALSE;
        result.message := 'Parent comment might be deleted or not found.';
        result.code = 404; -- Not found.
        RETURN result;
    END IF;

    INSERT INTO comment_verse (comment_id, verse_id)
    VALUES (new_comment_id, v_verse_id);

    GET DIAGNOSTICS affected_rows_verse = ROW_COUNT;

    IF affected_rows_verse = 0 THEN
        result.success := FALSE;
        result.message := 'You have exceeded the comment limit on this verse.';
        result.code := 429; -- Too Many Requests.
        RETURN result;
    END IF;
    
    result.success := TRUE;
    result.message := 'Comment added successfully.';
    result.code := 201; -- Created
    RETURN result;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_comment_on_note(
    p_user_id UUID,
    p_note_id UUID,
    p_parent_comment_id UUID,
    p_comment TEXT
) RETURNS process_result AS $$
DECLARE
    result process_result;
    new_comment_id UUID;
    owner_note_user_id UUID;
    affected_rows_comment INT DEFAULT 0;
    affected_rows_comment_note INT DEFAULT 0;
BEGIN
    -- Check if the note exists
    IF NOT EXISTS (SELECT 1 FROM note WHERE id = p_note_id) THEN
        result.success := FALSE;
        result.message := 'Note does not exist.';
        result.code := 404;
        RETURN result;
    END IF;

    IF p_parent_comment_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM comment WHERE id = p_parent_comment_id) THEN
        result.success := FALSE;
        result.message := 'Parent comment does not exist.';
        result.code := 404; -- Not found.
        RETURN result;
    END IF;

    IF (SELECT note_id FROM comment_note WHERE comment_id = p_parent_comment_id) != p_note_id THEN
        result.success := FALSE;
        result.message := 'Parent note is situated in another verse.';
        result.code := 418 ; -- I am a teapot. :)
        RETURN result;
    END IF;

    SELECT user_id INTO owner_note_user_id FROM note WHERE id = p_note_id;

    IF p_user_id != owner_note_user_id AND NOT EXISTS (SELECT 1 FROM follow WHERE follower_id = p_user_id AND followed_id = owner_note_user_id AND status = 'accepted') THEN
        result.success := FALSE;
        result.message := 'You are not following the owner of this note.';
        result.code := 403;
        RETURN result;
    END IF;
    
    -- Insert into the comment table and capture the new comment ID
    INSERT INTO comment (user_id, "text", parent_comment_id)
    VALUES (p_user_id, p_comment, p_parent_comment_id)
    RETURNING id INTO new_comment_id;

    -- Capture the row count for the comment insert
    GET DIAGNOSTICS affected_rows_comment = ROW_COUNT;

    IF affected_rows_comment = 0 THEN
        result.success := FALSE;
        result.message := 'Parent comment might be deleted or not found.';
        result.code = 404; -- Not found.
        RETURN result;
    END IF;
    
    -- Insert into the comment_note table
    INSERT INTO comment_note (comment_id, note_id)
    VALUES (new_comment_id, p_note_id);
    
    -- Capture the row count for the comment_note insert
    GET DIAGNOSTICS affected_rows_comment_note = ROW_COUNT;
    
    IF affected_rows_comment_note = 0 THEN
        result.success := FALSE;
        result.message := 'You have exceeded the comment limit on this note.';
        result.code := 429; -- Too Many Requests.
        RETURN result;
    END IF;
    
    -- Populate the result with success information and row counts
    result.success := TRUE;
    result.message := 'Comment added successfully.';
    result.code := 201; -- Created
    RETURN result;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION update_comment(
    p_user_id UUID,
    p_comment_id UUID,
    p_updatedComment TEXT
) RETURNS process_result AS $$
DECLARE
    result process_result;
    comment_exists BOOLEAN;
BEGIN
    -- Check if the comment exists and is owned by the user
    SELECT TRUE INTO comment_exists
    FROM comment
    WHERE id = p_comment_id AND user_id = p_user_id;
    
    IF NOT FOUND THEN
        result.success := FALSE;
        result.message := 'Comment not found or you do not have permission to update it.';
        result.code := 404;
        RETURN result;
    END IF;
    
    -- Update the comment
    UPDATE comment
    SET text = p_updatedComment,
        updated_at = NOW()
    WHERE id = p_comment_id AND user_id = p_user_id;
    
    result.success := TRUE;
    result.message := 'Comment updated successfully.';
    result.code := 200; -- OK
    RETURN result;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION delete_comment(
    p_user_id UUID,
    p_comment_id UUID
) RETURNS process_result AS $$
DECLARE
    result process_result;
    comment_exists BOOLEAN;
BEGIN
    SELECT TRUE INTO comment_exists
    FROM comment
    WHERE id = p_comment_id AND user_id = p_user_id;
    
    IF NOT FOUND THEN
        result.success := FALSE;
        result.message := 'Comment not found or you do not have permission to delete it.';
        result.code := 404;
        RETURN result;
    END IF;
    
    DELETE FROM comment
    WHERE id = p_comment_id AND user_id = p_user_id;
    
    result.success := TRUE;
    result.message := 'Comment deleted successfully.';
    result.code := 200; -- OK
    RETURN result;
END;
$$ LANGUAGE plpgsql;




--#endregion

--#region Follow System

-- Tables and functions related to following users and blocking

-- Custom types for follow statuses
CREATE TYPE FOLLOW_STATUS AS ENUM ('pending', 'accepted');
CREATE TYPE FOLLOW_R_STATUS AS ENUM('automatically_accepted', 'accepted', 'pending', 'retrieved', 'rejected', 'unfollowed', 'removed');

CREATE TABLE follow (
    id BIGSERIAL PRIMARY KEY,
    follower_id UUID NOT NULL,
    followed_id UUID NOT NULL,
    status FOLLOW_STATUS NOT NULL DEFAULT 'accepted',
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (follower_id) REFERENCES "user"(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (followed_id) REFERENCES "user"(id) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE(follower_id, followed_id)
);


-- Function to accept pending follows when a user switches from private to public
CREATE OR REPLACE FUNCTION accept_pending_follows()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.is_private IS NOT NULL AND NEW.is_private IS NULL THEN
        UPDATE follow
        SET status = 'accepted', occurred_at = CURRENT_TIMESTAMP
        WHERE followed_id = NEW.id AND status = 'pending';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_accept_pending_follows
AFTER UPDATE OF is_private ON "user"
FOR EACH ROW
WHEN (OLD.is_private IS NOT NULL AND NEW.is_private IS NULL)
EXECUTE FUNCTION accept_pending_follows();

CREATE TABLE block (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocker_id UUID NOT NULL,
    blocked_id UUID NOT NULL,
    blocked_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    reason VARCHAR(100),
    FOREIGN KEY (blocker_id) REFERENCES "user"(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (blocked_id) REFERENCES "user"(id) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE (blocker_id, blocked_id)
);

-- Function to prevent blocked users from following
CREATE OR REPLACE FUNCTION handle_follow_block() 
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM block WHERE blocker_id = NEW.followed_id AND blocked_id = NEW.follower_id
    ) THEN
        DELETE FROM follow WHERE id = NEW.id;
        RETURN NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_follow_block
AFTER INSERT ON follow
FOR EACH ROW
EXECUTE FUNCTION handle_follow_block();

-- Function to delete follow relationships upon blocking
CREATE OR REPLACE FUNCTION delete_follow_after_block()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM follow
    WHERE follower_id = NEW.blocked_id AND followed_id = NEW.blocker_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_follow_block_on_insert
AFTER INSERT ON block
FOR EACH ROW
EXECUTE FUNCTION delete_follow_after_block();

CREATE OR REPLACE FUNCTION delete_comments_and_likes_after_block()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM comment c
    WHERE c.user_id = NEW.blocked_id
      AND c.parent_comment_id IN (
          SELECT id FROM comment
          WHERE user_id = NEW.blocker_id
      );

    -- Delete likes made by blocked user on blocker's comments
    DELETE FROM "like" l
    USING like_comment lc, comment c
    WHERE l.id = lc.likeId
      AND lc.comment_id = c.id
      AND l.user_id = NEW.blocked_id
      AND c.user_id = NEW.blocker_id;

    -- Delete likes made by blocked user on blocker's notes
    DELETE FROM "like" l
    USING like_note ln, note n
    WHERE l.id = ln.likeId
      AND ln.note_id = n.id
      AND l.user_id = NEW.blocked_id
      AND n.user_id = NEW.blocker_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_comments_and_likes_after_block
AFTER INSERT ON block
FOR EACH ROW
EXECUTE FUNCTION delete_comments_and_likes_after_block();

CREATE TABLE follow_r (
    id BIGSERIAL PRIMARY KEY,
    follower_id UUID NOT NULL,
    followed_id UUID NOT NULL,
    status FOLLOW_R_STATUS,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (follower_id) REFERENCES "user"(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (followed_id) REFERENCES "user"(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Function to enforce valid follow events
CREATE OR REPLACE FUNCTION enforce_valid_follow_events()
RETURNS TRIGGER AS $$
DECLARE
  last_status FOLLOW_STATUS;
BEGIN
  SELECT status INTO last_status
  FROM follow_r
  WHERE follower_id = NEW.follower_id AND followed_id = NEW.followed_id
  ORDER BY occurred_at DESC
  LIMIT 1;

 --Handling impossible situations.
  IF last_status IS NULL THEN
    IF NEW.status IN ('pending', 'accepted', 'automatically_accepted') THEN
     RETURN NEW;
    END IF;
  ELSE
    CASE last_status
      WHEN 'pending' THEN
        IF NEW.status IN ('accepted', 'rejected', 'retrieved') THEN
          RETURN NEW;
        END IF;
      WHEN 'accepted' OR 'automatically_accepted' THEN
        IF NEW.status IN ('unfollowed', 'removed') THEN
        RETURN NEW;
        END IF;
      WHEN 'rejected', 'retrieved', 'unfollowed', 'removed' THEN
        IF NEW.status IN ('pending', 'accepted') THEN
        RETURN NEW;
        END IF;
      ELSE
       RETURN NULL;
    END CASE;

  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER follow_events_trigger
BEFORE INSERT ON follow_r
FOR EACH ROW
EXECUTE FUNCTION enforce_valid_follow_events();

-- Functions to handle follow actions

CREATE OR REPLACE FUNCTION accept_follow_request(p_follower_username TEXT, p_followed_id UUID) 
RETURNS process_result AS $$
DECLARE
    affected_rows INT;
    p_follower_id UUID;
    p_occurred_at TIMESTAMP := CURRENT_TIMESTAMP;
    result process_result;
BEGIN
    -- Select follower ID
    SELECT id INTO p_follower_id 
    FROM "user" 
    WHERE "user".username = p_follower_username;

    -- Check if follower or followed ID is NULL
    IF p_follower_id IS NULL THEN
        result.success := FALSE;
        result.message := 'Follower not found, rolling back.';
        result.code := 404;
        RETURN result;
    ELSIF p_followed_id IS NULL THEN
        result.success := FALSE;
        result.message := 'Followed user not found, rolling back.';
        result.code := 404;
        RETURN result;
    END IF;

    UPDATE follow
    SET status = 'accepted', occurred_at = p_occurred_at 
    WHERE follow.follower_id = p_follower_id
      AND follow.followed_id = p_followed_id
      AND follow.status = 'pending';
    
    GET DIAGNOSTICS affected_rows = ROW_COUNT;

    IF affected_rows > 0 THEN
        INSERT INTO follow_r (follower_id, followed_id, status, occurred_at) 
        VALUES (p_follower_id, p_followed_id, 'accepted', p_occurred_at);
        
        GET DIAGNOSTICS affected_rows = ROW_COUNT;
        
        IF affected_rows > 0 THEN
            result.success := TRUE;
            result.message := 'Follow request accepted.';
            result.code := 200;
            RETURN result;
        END IF;

        RAISE EXCEPTION 'Something went unexpectedly wrong.'; --Impossible case. Because there is no situation that would prevent the insertion process in the follow_r table.    
    ELSE
        result.success := FALSE;
        result.message := 'No pending follow request found.';
        result.code := 404;
        RETURN result;
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        result.success := FALSE;
        result.message := 'Transaction failed. Error: ' || SQLERRM;
        result.code := 503;
        RETURN result;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION follow_user(p_follower_id UUID, p_followed_username TEXT)
RETURNS process_result AS $$
DECLARE
    result process_result;
    p_followed_id UUID;
    is_private TIMESTAMP;
    is_blocked BOOLEAN;
    is_already_following BOOLEAN;
    p_occurred_at TIMESTAMP := CURRENT_TIMESTAMP;
    follow_status FOLLOW_STATUS;
    affected_rows INT;
BEGIN
    IF p_follower_id IS NULL OR p_followed_username IS NULL THEN
        result.success := FALSE;
        result.message := 'Invalid input parameters.';
        result.code := 400;
        RETURN result;
    END IF;

    SELECT u.id, u.is_private
    INTO p_followed_id, is_private
    FROM "user" u
    WHERE u.username = p_followed_username;

    IF p_followed_id IS NULL THEN
        result.success := FALSE;
        result.message := 'Followed user not found.';
        result.code := 404;
        RETURN result;
    END IF;

    IF p_follower_id = p_followed_id THEN
        result.success := FALSE;
        result.message := 'You cannot follow yourself.';
        result.code := 409;
        RETURN result;
    END IF;

    -- Check if the follower is blocked by the followed user
    SELECT EXISTS (
        SELECT 1 FROM block
        WHERE blocker_id = p_followed_id AND blocked_id = p_follower_id
    ) INTO is_blocked;

    IF is_blocked THEN
        result.success := FALSE;
        result.message := 'Something went wrong.';
        result.code := 403;
        RETURN result;
    END IF;

    -- Check if the follower is already following the followed user
    SELECT EXISTS (
        SELECT 1 FROM follow
        WHERE follower_id = p_follower_id AND followed_id = p_followed_id
    ) INTO is_already_following;

    IF is_already_following THEN
        result.success := FALSE;
        result.message := 'You are already following this user.';
        result.code := 409;
        RETURN result;
    END IF;

    -- Determine the follow status based on the followed user's privacy setting
    IF is_private IS NOT NULL THEN
        follow_status := 'pending';
    ELSE
        follow_status := 'accepted';
    END IF;

    -- Insert into the follow table
    INSERT INTO follow (follower_id, followed_id, status, occurred_at)
    VALUES (p_follower_id, p_followed_id, follow_status, p_occurred_at);

    GET DIAGNOSTICS affected_rows = ROW_COUNT;

    IF affected_rows > 0 THEN

        BEGIN
            INSERT INTO follow_r (follower_id, followed_id, status, occurred_at)
            VALUES (
                p_follower_id,
                p_followed_id,
                (CASE WHEN follow_status = 'accepted' THEN 'automatically_accepted' ELSE 'pending' END)::FOLLOW_R_STATUS,
                p_occurred_at
            );
            GET DIAGNOSTICS affected_rows = ROW_COUNT;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE EXCEPTION 'Error inserting into follow_r: %', SQLERRM;
        END;
        
        IF affected_rows > 0 THEN
            result.code := 201;
            result.message := CASE WHEN follow_status = 'accepted' THEN 'Followed!' ELSE 'Follow request has been sent!' END;
            result.success := TRUE;
            RETURN result;
        END IF;

        RAISE EXCEPTION 'Something went unexpectedly wrong.';
    ELSE
        result.code := 400;
        result.message := 'Follow process could not be completed for an unknown reason.';
        result.success := FALSE;
        RETURN result;
    END IF;

EXCEPTION
    WHEN unique_violation THEN
        result.success := FALSE;
        result.message := 'A follow request already exists.';
        result.code := 409;
        RETURN result;
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Internal server error: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;



CREATE OR REPLACE FUNCTION reject_follow_request(p_follower_username TEXT, p_followed_id UUID)
RETURNS process_result AS $$
DECLARE
    result process_result;
    p_follower_id UUID;
    is_pending BOOLEAN;
    affected_rows INT;
    p_occurred_at TIMESTAMP := CURRENT_TIMESTAMP;
BEGIN
    -- Validate input parameters
    IF p_follower_username IS NULL OR p_followed_id IS NULL THEN
        result.success := FALSE;
        result.message := 'Invalid input parameters.';
        result.code := 400;  -- Bad Request
        RETURN result;
    END IF;

    -- Get the follower's ID
    SELECT id INTO p_follower_id
    FROM "user"
    WHERE username = p_follower_username;

    IF p_follower_id IS NULL THEN
        result.success := FALSE;
        result.message := 'Follower user not found.';
        result.code := 404;  -- Not Found
        RETURN result;
    END IF;

    -- Check if there is a pending follow request
    SELECT EXISTS (
        SELECT 1 FROM follow
        WHERE follower_id = p_follower_id
          AND followed_id = p_followed_id
          AND status = 'pending'
    ) INTO is_pending;

    IF NOT is_pending THEN
        result.success := FALSE;
        result.message := 'No pending follow request to reject.';
        result.code := 404;  -- Not Found
        RETURN result;
    END IF;

    -- Delete the pending follow request from the follow table
    DELETE FROM follow
    WHERE follower_id = p_follower_id
      AND followed_id = p_followed_id
      AND status = 'pending';

    GET DIAGNOSTICS affected_rows = ROW_COUNT;

    IF affected_rows > 0 THEN
        -- Insert a record into follow_r table with status 'rejected'
        INSERT INTO follow_r (follower_id, followed_id, status, occurred_at)
        VALUES (
            p_follower_id,
            p_followed_id,
            'rejected'::FOLLOW_R_STATUS,
            p_occurred_at
        );

        GET DIAGNOSTICS affected_rows = ROW_COUNT;

        IF affected_rows > 0 THEN
            result.success := TRUE;
            result.message := 'Follow request rejected successfully.';
            result.code := 200;  -- OK
            RETURN result;
        END IF;
        RAISE EXCEPTION 'Something went unexpectedly wrong.'; --Impossible case. Because there is no situation that would prevent the insertion process in the follow_r table.
    ELSE
        result.success := FALSE;
        result.message := 'Failed to reject follow request.';
        result.code := 400;  -- Bad Request
        RETURN result;
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Internal server error: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION unfollow_user(p_follower_id UUID, p_followed_username TEXT)
RETURNS process_result AS $$
DECLARE
    result process_result;
    p_followed_id UUID;
    is_following BOOLEAN;
    affected_rows INT;
    p_occurred_at TIMESTAMP := CURRENT_TIMESTAMP;
BEGIN
    -- Validate input parameters
    IF p_follower_id IS NULL OR p_followed_username IS NULL THEN
        result.success := FALSE;
        result.message := 'Invalid input parameters.';
        result.code := 400;  -- Bad Request
        RETURN result;
    END IF;

    -- Get the followed user's ID
    SELECT id INTO p_followed_id
    FROM "user"
    WHERE username = p_followed_username;

    IF p_followed_id IS NULL THEN
        result.success := FALSE;
        result.message := 'User not found.';
        result.code := 404;  -- Not Found
        RETURN result;
    END IF;

    -- Check if the follower is actually following the followed user with status 'accepted'
    SELECT EXISTS (
        SELECT 1 FROM follow
        WHERE follower_id = p_follower_id
          AND followed_id = p_followed_id
          AND status = 'accepted'
    ) INTO is_following;

    IF NOT is_following THEN
        result.success := FALSE;
        result.message := 'You are not following this user.';
        result.code := 400;  -- Bad Request
        RETURN result;
    END IF;

    -- Delete the follow relationship
    DELETE FROM follow
    WHERE follower_id = p_follower_id
      AND followed_id = p_followed_id
      AND status = 'accepted';

    GET DIAGNOSTICS affected_rows = ROW_COUNT;

    IF affected_rows > 0 THEN
        -- Insert a record into follow_r table with status 'unfollowed'
        INSERT INTO follow_r (follower_id, followed_id, status, occurred_at)
        VALUES (
            p_follower_id,
            p_followed_id,
            'unfollowed'::FOLLOW_R_STATUS,
            p_occurred_at
        );

        GET DIAGNOSTICS affected_rows = ROW_COUNT;

        IF affected_rows > 0 THEN
            result.success := TRUE;
            result.message := 'You have unfollowed the user.';
            result.code := 200;  -- OK
            RETURN result;
        END IF;
            RAISE EXCEPTION 'Something went unexpectedly wrong.'; --Impossible case. Because there is no situation that would prevent the insertion process in the follow_r table. 
    ELSE
        result.success := FALSE;
        result.message := 'Failed to unfollow the user.';
        result.code := 400;  -- Bad Request
        RETURN result;
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Internal server error: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION remove_follower(p_followed_id UUID, p_follower_username TEXT)
RETURNS process_result AS $$
DECLARE
    result process_result;
    p_follower_id UUID;
    is_following BOOLEAN;
    affected_rows INT;
    p_occurred_at TIMESTAMP := CURRENT_TIMESTAMP;
BEGIN
    -- Validate input parameters
    IF p_followed_id IS NULL OR p_follower_username IS NULL THEN
        result.success := FALSE;
        result.message := 'Invalid input parameters.';
        result.code := 400;  -- Bad Request
        RETURN result;
    END IF;

    -- Get the follower's ID
    SELECT id INTO p_follower_id
    FROM "user"
    WHERE username = p_follower_username;

    IF p_follower_id IS NULL THEN
        result.success := FALSE;
        result.message := 'Follower user not found.';
        result.code := 404;  -- Not Found
        RETURN result;
    END IF;

    -- Check if the follower is actually following the followed user with status 'accepted'
    SELECT EXISTS (
        SELECT 1 FROM follow
        WHERE follower_id = p_follower_id
          AND followed_id = p_followed_id
          AND status = 'accepted'
    ) INTO is_following;

    IF NOT is_following THEN
        result.success := FALSE;
        result.message := 'The user is not following you.';
        result.code := 400;  -- Bad Request
        RETURN result;
    END IF;

    -- Delete the follow relationship
    DELETE FROM follow
    WHERE follower_id = p_follower_id
      AND followed_id = p_followed_id
      AND status = 'accepted';

    GET DIAGNOSTICS affected_rows = ROW_COUNT;

    IF affected_rows > 0 THEN
        -- Insert a record into follow_r table with status 'removed'
        INSERT INTO follow_r (follower_id, followed_id, status, occurred_at)
        VALUES (
            p_follower_id,
            p_followed_id,
            'removed'::FOLLOW_R_STATUS,
            p_occurred_at
        );

        GET DIAGNOSTICS affected_rows = ROW_COUNT;

        IF affected_rows > 0 THEN
            result.success := TRUE;
            result.message := 'Follower has been removed successfully.';
            result.code := 200;  -- OK
            RETURN result;
        ELSE
            RAISE EXCEPTION 'Something went unexpectedly wrong.'; --Impossible case. Because there is no situation that would prevent the insertion process in the follow_r table. 
        END IF;
    ELSE
        result.success := FALSE;
        result.message := 'Failed to remove follower.';
        result.code := 400;  -- Bad Request
        RETURN result;
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Internal server error: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION retrieve_follow_request(p_follower_id UUID, p_followed_username TEXT)
RETURNS process_result AS $$
DECLARE
    result process_result;
    p_followed_id UUID;
    is_pending BOOLEAN;
    affected_rows INT;
    p_occurred_at TIMESTAMP := CURRENT_TIMESTAMP;
BEGIN
    -- Validate input parameters
    IF p_follower_id IS NULL OR p_followed_username IS NULL THEN
        result.success := FALSE;
        result.message := 'Invalid input parameters.';
        result.code := 400;  -- Bad Request
        RETURN result;
    END IF;

    -- Get the followed user's ID
    SELECT id INTO p_followed_id
    FROM "user"
    WHERE username = p_followed_username;

    IF p_followed_id IS NULL THEN
        result.success := FALSE;
        result.message := 'User not found.';
        result.code := 404;  -- Not Found
        RETURN result;
    END IF;

    -- Check if there is a pending follow request
    SELECT EXISTS (
        SELECT 1 FROM follow
        WHERE follower_id = p_follower_id
          AND followed_id = p_followed_id
          AND status = 'pending'
    ) INTO is_pending;

    IF NOT is_pending THEN
        result.success := FALSE;
        result.message := 'No pending follow request to retrieve.';
        result.code := 400;  -- Bad Request
        RETURN result;
    END IF;

    -- Delete the pending follow request from the follow table
    DELETE FROM follow
    WHERE follower_id = p_follower_id
      AND followed_id = p_followed_id
      AND status = 'pending';

    GET DIAGNOSTICS affected_rows = ROW_COUNT;

    IF affected_rows > 0 THEN
        -- Insert a record into follow_r table with status 'retrieved'
        INSERT INTO follow_r (follower_id, followed_id, status, occurred_at)
        VALUES (
            p_follower_id,
            p_followed_id,
            'retrieved'::FOLLOW_R_STATUS,
            p_occurred_at
        );

        GET DIAGNOSTICS affected_rows = ROW_COUNT;

        IF affected_rows > 0 THEN
            result.success := TRUE;
            result.message := 'Follow request retrieved successfully.';
            result.code := 200;  -- OK
            RETURN result;
        ELSE
            RAISE EXCEPTION 'Something went unexpectedly wrong.'; --Impossible case. Because there is no situation that would prevent the insertion process in the follow_r table. 
        END IF;
    ELSE
        result.success := FALSE;
        result.message := 'Failed to retrieve follow request.';
        result.code := 400;  -- Bad Request
        RETURN result;
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Internal server error: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;


--#endregion

--#region Account Freezing

-- Tables and functions related to freezing and unfreezing user accounts

-- Custom type for freeze status
CREATE TYPE FREEZE_STATUS AS ENUM ('frozen', 'unfrozen');

CREATE TABLE freeze_r (
    id BIGSERIAL PRIMARY KEY,
    status FREEZE_STATUS NOT NULL,
    user_id UUID NOT NULL,
    proceed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Function to freeze a user account
CREATE OR REPLACE FUNCTION freeze_user_account(p_user_id UUID)
        RETURNS process_result AS $$
        DECLARE
            result process_result;
            last_status FREEZE_STATUS;
            last_freeze TIMESTAMPTZ;
            affected_rows INT;
        BEGIN
            -- Fetch the latest status and proceed_at for the user
            SELECT status, proceed_at INTO last_status, last_freeze
            FROM freeze_r
            WHERE user_id = p_user_id
            ORDER BY proceed_at DESC
            LIMIT 1;

            -- Check for consecutive identical status
            IF last_status = 'frozen' THEN
                result.message := 'You cannot freeze your account again without unfreezing it first.';
                result.success := FALSE;
                result.code := 409; -- Unauthorized.
                RETURN result;
            END IF;

            IF last_freeze IS NOT NULL AND CURRENT_TIMESTAMP < last_freeze + INTERVAL '7 days' THEN
                result.message := 'You cannot freeze your account within 7 days of the last freeze.';
                result.success := FALSE;
                result.code := 409; --Unauthorized.
                RETURN result;
            END IF;

            -- Perform the insert
            INSERT INTO freeze_r (status, user_id) VALUES ('frozen', p_user_id);

            UPDATE "user" SET is_frozen = CURRENT_TIMESTAMP WHERE "user".id = p_user_id;

            GET DIAGNOSTICS affected_rows = ROW_COUNT;

            IF affected_rows = 0 THEN
              RAISE EXCEPTION 'Something went unexpectedly wrong.';
            END IF;

            DELETE FROM session WHERE session.user_id = p_user_id;

            GET DIAGNOSTICS affected_rows = ROW_COUNT;

            IF affected_rows > 0 THEN
                result.message := 'Account frozen successfully.';
                result.code := 200; -- OK
                result.success := TRUE;
                RETURN result;
            END IF;

            RAISE EXCEPTION 'Something went unexpectedly wrong.';

        END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION unfreeze_user_account(p_user_id UUID)
RETURNS process_result AS $$
DECLARE
    result process_result;
    is_frozen TIMESTAMPTZ;
    affected_rows INT;
BEGIN
    -- Validate input parameter
    IF p_user_id IS NULL THEN
        result.success := FALSE;
        result.message := 'Invalid user ID.';
        result.code := 400;  -- Bad Request
        RETURN result;
    END IF;

    -- Check if the user account is frozen
    SELECT "user".is_frozen INTO is_frozen
    FROM "user"
    WHERE id = p_user_id;

    IF is_frozen IS NULL THEN
        result.success := TRUE;
        result.message := 'Account is not frozen.';
        result.code := 200;  -- OK
        RETURN result;
    END IF;

    UPDATE "user"
    SET is_frozen = NULL
    WHERE id = p_user_id;

    GET DIAGNOSTICS affected_rows := ROW_COUNT;

    IF affected_rows > 0 THEN 

    INSERT INTO freeze_r (status, user_id)
    VALUES ('unfrozen', p_user_id);

    GET DIAGNOSTICS affected_rows := ROW_COUNT;

        IF affected_rows > 0 THEN
            result.success := TRUE;
            result.message := 'Account has been unfrozen.';
            result.code := 200;  -- OK
            RETURN result;
        END IF;
    
    RAISE EXCEPTION 'Something went unexpectedly wrong.'; --Impossible case. Because there is no situation that would prevent the insertion process in the freeze_r table.
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Internal Server Error. Error: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

--#endregion

--#region Like

-- Tables and functions related to liking content

-- Custom types for likeable entities and actions
CREATE TYPE LIKEABLE_ENTITY_TYPE AS ENUM ('comment', 'note');
CREATE TYPE LIKE_ACTION AS ENUM ('liked', 'unliked');

CREATE TABLE "like" (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_like_userId ON "like"(user_id);


CREATE TABLE like_comment (
    likeId BIGINT PRIMARY KEY,
    comment_id UUID NOT NULL,
    FOREIGN KEY (likeId) REFERENCES "like"(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (comment_id) REFERENCES "comment"(id) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE (likeId, comment_id)
);

CREATE INDEX idx_like_comment_commentId ON like_comment(comment_id);


CREATE TABLE like_note (
    likeId BIGINT PRIMARY KEY,
    note_id UUID NOT NULL,
    FOREIGN KEY (likeId) REFERENCES "like"(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (note_id) REFERENCES "note"(id) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE (likeId, note_id)
);

CREATE INDEX idx_like_note_note_id ON like_note(note_id);

CREATE OR REPLACE FUNCTION like_comment(
    p_user_id UUID,
    p_comment_id UUID
) RETURNS process_result AS $$
DECLARE
    result process_result;
    new_like_id BIGINT;
    comment_owner_user_id UUID;
    affected_rows_like INT DEFAULT 0;
    affected_rows_comment INT DEFAULT 0;
BEGIN
    -- Check if the comment exists
    IF NOT EXISTS (SELECT 1 FROM "comment" WHERE id = p_comment_id) THEN
        result.success := FALSE;
        result.message := 'Comment does not exist.';
        result.code := 404; -- Not Found
        RETURN result;
    END IF;

    SELECT user_id INTO comment_owner_user_id FROM comment WHERE id = p_comment_id;

    IF (comment_owner_user_id IS NULL OR 
        (NOT EXISTS (SELECT 1 FROM follow WHERE follower_id = p_user_id AND followed_id = comment_owner_user_id AND status = 'accepted')
        AND (SELECT comment.user_id != comment_owner_user_id FROM comment WHERE comment.id = p_comment_id))
        ) THEN
        result.message := 'You do not have the permission to like this comment.';
        result.code := 403; -- Forbidden.
        result.success := FALSE;
        RETURN result;
    END IF;
    
    -- Check if the user has already liked this comment
    IF EXISTS (
        SELECT 1 FROM "like" l
        JOIN like_comment lc ON l.id = lc.likeId
        WHERE l.user_id = p_user_id AND lc.comment_id = p_comment_id
    ) THEN
        result.success := FALSE;
        result.message := 'You have already liked this comment.';
        result.code := 409; -- Conflict
        RETURN result;
    END IF;

    -- Insert into "like" table
    INSERT INTO "like" (user_id)
    VALUES (p_user_id)
    RETURNING id INTO new_like_id;

    GET DIAGNOSTICS affected_rows_like = ROW_COUNT;

    IF affected_rows_like = 0 THEN
        result.success := FALSE;
        result.message := 'Like cannot be inserted.';
        result.code := '404'; -- Not Found.
        RETURN result;
    END IF;

    -- Insert into like_comment table
    INSERT INTO like_comment (likeId, comment_id)
    VALUES (new_like_id, p_comment_id);


    GET DIAGNOSTICS affected_rows_comment = ROW_COUNT;

    IF affected_rows_comment = 0 THEN
        result.success := FALSE;
        result.message := 'You have already liked this comment.';
        result.code := '409'; -- Not Found.
        RETURN result;
    END IF;


    result.success := TRUE;
    result.message := 'Comment liked successfully.';
    result.code := 201; --Created
    RETURN result;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION like_note(
    p_user_id UUID,
    p_note_id UUID
) RETURNS process_result AS $$
DECLARE
    new_like_id BIGINT;
    result process_result;
    note_owner_user_id UUID;
    affected_rows_like INT DEFAULT 0;
    affected_rows_comment INT DEFAULT 0;
BEGIN
    -- Check if the note exists
    IF NOT EXISTS (SELECT 1 FROM note WHERE id = p_note_id) THEN
        result.success := FALSE;
        result.message := 'Note does not exist.';
        result.code := 404; --Not Found
        RETURN result;
    END IF;

    SELECT user_id INTO note_owner_user_id FROM note WHERE id = p_note_id;

    IF (note_owner_user_id IS NULL OR 
        (NOT EXISTS (SELECT 1 FROM follow WHERE follower_id = p_user_id AND followed_id = note_owner_user_id AND status = 'accepted')
        AND (SELECT user_id != note_owner_user_id FROM note WHERE id = p_note_id))
        ) THEN
        result.message := 'You do not have the permission to like this note.';
        result.code := 403; -- Forbidden.
        result.success := FALSE;
        RETURN result;
    END IF;

    -- Check if the user has already liked this note
    IF EXISTS (
        SELECT 1 FROM "like" l
        JOIN like_note ln ON l.id = ln.likeId
        WHERE l.user_id = p_user_id AND ln.note_id = p_note_id
    ) THEN
        result.success := FALSE;
        result.message := 'You have already liked this note.';
        result.code := 409; -- Conflict
        RETURN result;
    END IF;


    -- Insert into "like" table
    INSERT INTO "like" (user_id)
    VALUES (p_user_id)
    RETURNING id INTO new_like_id;

    GET DIAGNOSTICS affected_rows_like = ROW_COUNT;

    IF affected_rows_like = 0 THEN
        result.success := FALSE;
        result.message := 'Like cannot be applied.';
        result.code := '404'; -- Not Found.
        RETURN result;
    END IF;


    -- Insert into like_note table
    INSERT INTO like_note (likeId, note_id)
    VALUES (new_like_id, p_note_id);

    GET DIAGNOSTICS affected_rows_comment = ROW_COUNT;

    IF affected_rows_comment = 0 THEN
        result.success := FALSE;
        result.message := 'You have already liked this note.';
        result.code := '409'; -- Not Found.
        RETURN result;
    END IF;


    result.success := TRUE;
    result.message := 'Note liked successfully.';
    result.code := 201; -- Created
    RETURN result;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION unlike_comment(
    p_user_id UUID,
    p_comment_id UUID
) RETURNS process_result AS $$
DECLARE
    result process_result;
    like_id_to_delete BIGINT;
BEGIN
    -- Find the like to delete
    SELECT l.id INTO like_id_to_delete
    FROM "like" l
    JOIN like_comment lc ON l.id = lc.likeId
    WHERE l.user_id = p_user_id AND lc.comment_id = p_comment_id;

    IF like_id_to_delete IS NULL THEN
        result.success := FALSE;
        result.message := 'Like does not exist.';
        result.code := 404; -- Not Found
        RETURN result;
    END IF;

    -- Delete the like (cascade deletes from like_comment)
    DELETE FROM "like" WHERE id = like_id_to_delete;

    result.success := TRUE;
    result.message := 'Like removed successfully.';
    result.code := 200; -- OK
    RETURN result;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION unlike_note(
    p_user_id UUID,
    p_note_id UUID
) RETURNS process_result AS $$
DECLARE
    result process_result;
    like_id_to_delete BIGINT;
BEGIN
    -- Find the like to delete
    SELECT l.id INTO like_id_to_delete
    FROM "like" l
    JOIN like_note ln ON l.id = ln.likeId
    WHERE l.user_id = p_user_id AND ln.note_id = p_note_id;

    IF like_id_to_delete IS NULL THEN
        result.success := FALSE;
        result.message := 'Like does not exist.';
        result.code := 404; -- Not Found
        RETURN result;
    END IF;

    -- Delete the like (cascade deletes from like_note)
    DELETE FROM "like" WHERE id = like_id_to_delete;

    result.success := TRUE;
    result.message := 'Like removed successfully.';
    result.code := 200; -- OK
    RETURN result;
END;
$$ LANGUAGE plpgsql;


CREATE TABLE like_r (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    action_type LIKE_ACTION NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE like_r_comment (
    like_r_id BIGINT PRIMARY KEY,
    comment_id UUID NOT NULL,
    FOREIGN KEY (like_r_id) REFERENCES like_r(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (comment_id) REFERENCES "comment"(id) ON DELETE CASCADE ON UPDATE CASCADE
);


CREATE TABLE like_r_note (
    like_r_id BIGINT PRIMARY KEY,
    note_id UUID NOT NULL,
    FOREIGN KEY (like_r_id) REFERENCES like_r(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (note_id) REFERENCES "note"(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE OR REPLACE FUNCTION like_comment_after_insert()
RETURNS TRIGGER AS $$
DECLARE
    like_r_id BIGINT;
BEGIN
    -- Insert into like_r with action_type 'liked'
    INSERT INTO like_r (user_id, action_type)
    VALUES ((SELECT user_id FROM "like" WHERE id = NEW.likeId), 'liked')
    RETURNING id INTO like_r_id;

    -- Insert into like_r_comment
    INSERT INTO like_r_comment (like_r_id, comment_id)
    VALUES (like_r_id, NEW.comment_id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION like_before_delete()
RETURNS TRIGGER AS $$
DECLARE
    like_r_id BIGINT;
    v_comment_id UUID;
    v_note_id UUID;
BEGIN
    -- Insert into like_r with action_type 'unliked'
    INSERT INTO like_r (user_id, action_type)
    VALUES (OLD.user_id, 'unliked')
    RETURNING id INTO like_r_id;

    -- Check if this like is for a comment
    SELECT like_comment.comment_id INTO v_comment_id FROM like_comment WHERE likeId = OLD.id;

    IF v_comment_id IS NOT NULL THEN
        -- Insert into like_r_comment
        INSERT INTO like_r_comment (like_r_id, comment_id)
        VALUES (like_r_id, v_comment_id);
    ELSE
        -- Check if this like is for a note
        SELECT like_note.note_id INTO v_note_id FROM like_note WHERE likeId = OLD.id;

        IF v_note_id IS NOT NULL THEN
            -- Insert into like_r_note
            INSERT INTO like_r_note (like_r_id, note_id)
            VALUES (like_r_id, v_note_id);
        END IF;
    END IF;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION like_comment_before_delete()
RETURNS TRIGGER AS $$
DECLARE
    like_r_id BIGINT;
    a_user_id UUID;
BEGIN
    -- Get the userId from the 'like' table before deletion
    SELECT user_id INTO a_user_id FROM "like" WHERE id = OLD.likeId;

    -- Insert into like_r with action_type 'unliked'
    INSERT INTO like_r (user_id, action_type)
    VALUES (a_user_id, 'unliked')
    RETURNING id INTO like_r_id;

    -- Insert into like_r_comment
    INSERT INTO like_r_comment (like_r_id, comment_id)
    VALUES (like_r_id, OLD.comment_id);

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION like_note_after_insert()
RETURNS TRIGGER AS $$
DECLARE
    like_r_id BIGINT;
BEGIN
    -- Insert into like_r with action_type 'liked'
    INSERT INTO like_r (user_id, action_type)
    VALUES ((SELECT user_id FROM "like" WHERE id = NEW.likeId), 'liked')
    RETURNING id INTO like_r_id;

    -- Insert into like_r_note
    INSERT INTO like_r_note (like_r_id, note_id)
    VALUES (like_r_id, NEW.note_id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER like_before_delete_trigger
BEFORE DELETE ON "like"
FOR EACH ROW
EXECUTE FUNCTION like_before_delete();

-- After INSERT trigger on like_comment
CREATE TRIGGER like_comment_after_insert_trigger
AFTER INSERT ON like_comment
FOR EACH ROW
EXECUTE FUNCTION like_comment_after_insert();

-- After INSERT trigger on like_note
CREATE TRIGGER like_note_after_insert_trigger
AFTER INSERT ON like_note
FOR EACH ROW
EXECUTE FUNCTION like_note_after_insert();


--#endregion 

--#region Notification

-- Tables and functions related to notifications

CREATE TYPE ENTITY_TYPE AS ENUM ('comment', 'note', 'user');

CREATE TYPE NOTIFICATION_TYPE AS ENUM ('like', 'follow', 'follow_pending', 'comment', 'reply', 'mention');

CREATE TABLE notification (
    id BIGSERIAL PRIMARY KEY,
    recipient_id UUID NOT NULL,
    actor_id UUID NOT NULL,
    notification_type NOTIFICATION_TYPE NOT NULL,
    entity_type ENTITY_TYPE,  -- Now uses the general ENTITY_TYPE enum
    entity_id UUID,           -- Can be NULL if not applicable
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (recipient_id) REFERENCES "user"(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (actor_id) REFERENCES "user"(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CHECK (recipient_id != actor_id AND ((entity_type IS NOT NULL AND entity_id IS NOT NULL) OR (entity_type IS NULL AND entity_id IS NULL)))
);



CREATE OR REPLACE FUNCTION insert_notification(
    p_recipient_id UUID,
    p_actor_id UUID,
    p_notification_type NOTIFICATION_TYPE,
    p_entity_type ENTITY_TYPE = NULL,
    p_entity_id UUID = NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO notification (
        recipient_id,
        actor_id,
        notification_type,
        entity_type,
        entity_id
    ) VALUES (
        p_recipient_id,
        p_actor_id,
        p_notification_type,
        p_entity_type,
        p_entity_id
    );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION mark_notifications_as_read(
    p_user_id UUID,
    p_notification_ids BIGINT[]
) RETURNS process_result AS $$
DECLARE
    result process_result;
    updated_count INT;
BEGIN
    -- Update the notifications that match the IDs and belong to the user
    UPDATE notification
    SET is_read = TRUE
    WHERE recipient_id = p_user_id
      AND id = ANY(p_notification_ids)
      AND is_read = FALSE;

    -- Get the number of rows updated
    GET DIAGNOSTICS updated_count = ROW_COUNT;

    IF updated_count > 0 THEN
        result.success := TRUE;
        result.message := updated_count || ' notifications marked as read.';
        result.code := 200; -- OK
    ELSE
        result.success := FALSE;
        result.message := 'No notifications were updated.';
        result.code := 404; -- Not Found
    END IF;

    RETURN result;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION validate_notification_entity()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.entity_type IS NOT NULL THEN
        CASE NEW.entity_type
            WHEN 'comment' THEN
                IF NOT EXISTS (SELECT 1 FROM comment WHERE id = NEW.entity_id) THEN
                    RAISE EXCEPTION 'Comment with ID % does not exist.', NEW.entity_id;
                END IF;
            WHEN 'note' THEN
                IF NOT EXISTS (SELECT 1 FROM note WHERE id = NEW.entity_id) THEN
                    RAISE EXCEPTION 'Note with ID % does not exist.', NEW.entity_id;
                END IF;
            WHEN 'user' THEN
                IF NOT EXISTS (SELECT 1 FROM "user" WHERE id = NEW.entity_id) THEN
                    RAISE EXCEPTION 'User with ID % does not exist.', NEW.entity_id;
                END IF;
            ELSE
                RAISE EXCEPTION 'Invalid entity type: %', NEW.entity_type;
        END CASE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_notification_entity_trigger
BEFORE INSERT ON notification
FOR EACH ROW
EXECUTE FUNCTION validate_notification_entity();


-- Trigger function to create like notifications
CREATE OR REPLACE FUNCTION create_like_comment_notification()
RETURNS TRIGGER AS $$
DECLARE
    recipient_user_id UUID;
    actor_user_id UUID;
BEGIN
    -- Get the actor's userId from the "like" table
    SELECT user_id INTO actor_user_id FROM "like" WHERE id = NEW.likeId;

    -- Get the comment author's userId
    SELECT user_id INTO recipient_user_id FROM "comment" WHERE id = NEW.comment_id;

    -- Avoid notifying the actor themselves
    IF recipient_user_id IS NOT NULL AND recipient_user_id = actor_user_id THEN
        RETURN NEW;
    END IF;

    PERFORM insert_notification(
        recipient_user_id,
        actor_user_id,     
        'like',            
        'comment',         
        NEW.comment_id      
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for like_comment
CREATE TRIGGER trigger_create_like_comment_notification
AFTER INSERT ON like_comment
FOR EACH ROW
EXECUTE FUNCTION create_like_comment_notification();

-- Function for like_note
CREATE OR REPLACE FUNCTION create_like_note_notification()
RETURNS TRIGGER AS $$
DECLARE
    recipient_user_id UUID;
    actor_user_id UUID;
BEGIN
    -- Get the actor's userId from the "like" table
    SELECT user_id INTO actor_user_id FROM "like" WHERE id = NEW.likeId;

    -- Get the note author's userId
    SELECT user_id INTO recipient_user_id FROM note WHERE id = NEW.note_id;

    -- Avoid notifying the actor themselves
    IF recipient_user_id IS NOT NULL AND recipient_user_id = actor_user_id THEN
        RETURN NEW;
    END IF;

    -- Insert the notification
    PERFORM insert_notification(
        recipient_user_id, -- Recipient of the notification
        actor_user_id,     -- Actor performing the like
        'like',            -- Type of notification
        'note',            -- Entity type
        NEW.note_id         -- Entity ID
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for like_note
CREATE TRIGGER trigger_create_like_note_notification
AFTER INSERT ON like_note
FOR EACH ROW
EXECUTE FUNCTION create_like_note_notification();


-- Function to notify users of comment replies
CREATE OR REPLACE FUNCTION notify_comment_reply()
RETURNS TRIGGER AS $$
DECLARE
    recipient_user_id UUID;
BEGIN
    -- Proceed only if it's a reply (i.e., has a parent_comment_id)
    IF NEW.parent_comment_id IS NOT NULL THEN
        -- Get the user ID of the parent comment's author
        SELECT user_id INTO recipient_user_id FROM comment WHERE id = NEW.parent_comment_id;

        -- Do not create a notification if the recipient is the same as the actor
        IF recipient_user_id IS NULL OR recipient_user_id = NEW.user_id THEN
            RETURN NEW;
        END IF;

        -- Insert the notification using the consolidated function
        PERFORM insert_notification(
            recipient_user_id, -- Recipient of the notification
            NEW.user_id,        -- Actor replying to the comment
            'reply',   -- Type of notification
            'comment',         -- Type of entity (comment)
            NEW.id             -- ID of the reply comment
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_comment_reply
AFTER INSERT ON comment
FOR EACH ROW
WHEN (NEW.parent_comment_id IS NOT NULL)
EXECUTE FUNCTION notify_comment_reply();

-- Function to handle follow notifications
CREATE OR REPLACE FUNCTION notify_follow()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'pending' THEN
        -- Insert a follow_pending notification for pending follow requests
        PERFORM insert_notification(
            NEW.followed_id,   -- Recipient (user being followed)
            NEW.follower_id,   -- Actor (user who initiated the follow)
            'follow_pending',  -- Type of notification
            NULL,              -- No associated entity type
            NULL               -- No associated entity ID
        );
    ELSIF NEW.status = 'accepted' THEN
        -- Insert a follow notification when a follow request is accepted
        PERFORM insert_notification(
            NEW.followed_id,   -- Recipient (user being followed)
            NEW.follower_id,   -- Actor (user who initiated the follow)
            'follow',          -- Type of notification
            NULL,              -- No associated entity type
            NULL               -- No associated entity ID
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_follow
AFTER INSERT OR UPDATE ON follow
FOR EACH ROW
EXECUTE FUNCTION notify_follow();

-- Function to delete notifications for deleted comments
CREATE OR REPLACE FUNCTION delete_notifications_for_comment()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM notification
    WHERE entity_type = 'comment' AND entity_id = OLD.id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger for comment deletions
CREATE TRIGGER trigger_delete_notifications_for_comment
AFTER DELETE ON comment
FOR EACH ROW
EXECUTE FUNCTION delete_notifications_for_comment();

-- Function to delete notifications for deleted notes
CREATE OR REPLACE FUNCTION delete_notifications_for_note()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM notification
    WHERE entity_type = 'note' AND entity_id = OLD.id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger for note deletions
CREATE TRIGGER trigger_delete_notifications_for_note
AFTER DELETE ON note
FOR EACH ROW
EXECUTE FUNCTION delete_notifications_for_note();

-- Optional: Function to delete notifications for deleted user entities
CREATE OR REPLACE FUNCTION delete_notifications_for_user_entity()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM notification
    WHERE entity_type = 'user' AND entity_id = OLD.id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Optional: Trigger for user deletions
CREATE TRIGGER trigger_delete_notifications_for_user_entity
AFTER DELETE ON "user"
FOR EACH ROW
EXECUTE FUNCTION delete_notifications_for_user_entity();

CREATE OR REPLACE FUNCTION delete_notification_after_follow_delete()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM notification
    WHERE actor_id = OLD.follower_id AND recipient_id = OLD.followed_id AND (notification_type = 'follow' OR notification_type = 'follow_pending');
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_delete_notifications_after_follow_cancel
AFTER DELETE ON "follow"
FOR EACH ROW
EXECUTE FUNCTION delete_notification_after_follow_delete();

-- Function to delete notifications when a like is deleted
CREATE OR REPLACE FUNCTION delete_like_notification()
RETURNS TRIGGER AS $$
DECLARE
    recipient_user_id UUID;
    a_entity_type ENTITY_TYPE;
    a_entity_id UUID;
BEGIN
    -- Determine if the like is on a comment
    IF EXISTS (SELECT 1 FROM like_comment WHERE likeId = OLD.id) THEN
        SELECT c.user_id, 'comment', c.id
        INTO recipient_user_id, a_entity_type, a_entity_id
        FROM like_comment lc
        JOIN "comment" c ON lc.comment_id = c.id
        WHERE lc.likeId = OLD.id;
    -- Determine if the like is on a note
    ELSIF EXISTS (SELECT 1 FROM like_note WHERE likeId = OLD.id) THEN
        SELECT n.user_id, 'note', n.id
        INTO recipient_user_id, a_entity_type, a_entity_id
        FROM like_note ln
        JOIN note n ON ln.note_id = n.id
        WHERE ln.likeId = OLD.id;
    ELSE
        -- If the like is not associated with any entity, exit the function
        RETURN OLD;
    END IF;

    -- Delete the corresponding notification
    DELETE FROM notification
    WHERE notification_type = 'like'
      AND actor_id = OLD.user_id
      AND recipient_id = recipient_user_id
      AND entity_type = a_entity_type
      AND entity_id = a_entity_id;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function before a like is deleted
CREATE TRIGGER trigger_delete_like_notification
BEFORE DELETE ON "like"
FOR EACH ROW
EXECUTE FUNCTION delete_like_notification();




-- Function to retrieve user notifications
CREATE OR REPLACE FUNCTION get_user_notifications(
    p_recipient_id UUID,
    p_limit INT DEFAULT 10
) RETURNS JSON AS $$
DECLARE
    notifications JSON := '[]'::JSON;
BEGIN
    SELECT json_agg(notification_json) INTO notifications
    FROM (
        SELECT json_build_object(
            'id', n.id,
            'recipient_id', n.recipient_id,
            'actor_id', n.actor_id,
            'actor_username', a.username,
            'notification_type', n.notification_type,
            'entity_type', n.entity_type,
            'entity_id', n.entity_id,
            'created_at', n.created_at,
            'is_read', n.is_read,
            'details', 
                CASE 
                    WHEN n.notification_type = 'like' THEN json_build_object(
                        'liked_content', 
                            CASE 
                                WHEN n.entity_type = 'comment' THEN c.text
                                WHEN n.entity_type = 'note' THEN nt.text
                                ELSE NULL
                            END
                    )
                    WHEN n.notification_type = 'reply' THEN json_build_object(
                        'replied_comment_text', parent_c.text
                    )
                    WHEN n.notification_type IN ('follow', 'follow_pending') THEN json_build_object(
                        'follower_username', a.username
                    )
                    ELSE NULL
                END
        ) AS notification_json
        FROM 
            notification n
        JOIN "user" a ON n.actor_id = a.id
        LEFT JOIN "comment" c ON n.entity_type = 'comment' AND n.entity_id = c.id
        LEFT JOIN "note" nt ON n.entity_type = 'note' AND n.entity_id = nt.id
        LEFT JOIN "comment" parent_c ON n.notification_type = 'reply' AND n.entity_id = parent_c.id
        WHERE 
            n.recipient_id = p_recipient_id
        ORDER BY 
            n.created_at DESC
        LIMIT 
            p_limit
    ) AS subquery(notification_json);

    RETURN COALESCE(notifications, '[]'::JSON);
END;
$$ LANGUAGE plpgsql;


--#endregion

--#region Cache

-- Tables and functions related to caching

CREATE TABLE cache (
    id SERIAL PRIMARY KEY,
    key VARCHAR(126) NOT NULL UNIQUE,
    data JSONB NOT NULL
);

CREATE TABLE cache_r (
    id BIGSERIAL PRIMARY KEY,
    cacheId INT NOT NULL,
    fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cacheId) REFERENCES cache(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Trigger function to log cache insertions
CREATE OR REPLACE FUNCTION cache_insert_trigger() RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO cache_r (cacheId) VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cache_after_insert
AFTER INSERT ON cache
FOR EACH ROW
EXECUTE FUNCTION cache_insert_trigger();

CREATE TABLE request_logs (
    id BIGSERIAL PRIMARY KEY,
    identifier VARCHAR(126) NOT NULL,
    endpoint VARCHAR(126) NOT NULL,
    method VARCHAR(10) NOT NULL,
    status_code INTEGER NOT NULL,
    occurred_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- This table will be adjusted.
CREATE TABLE rate_limit (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL,
  expiration BIGINT NOT NULL
);


-- This function will be adjusted.
CREATE OR REPLACE FUNCTION rate_limit_check(
  p_key TEXT,
  p_time_window BIGINT,
  p_max INTEGER,
  p_now BIGINT
) RETURNS TABLE(
  current_count INTEGER,
  ttl BIGINT
) AS $$
DECLARE
  expiration BIGINT;
BEGIN
  LOOP
    UPDATE rate_limit
    SET count = count + 1
    WHERE key = p_key AND expiration > p_now
    RETURNING count, expiration INTO current_count, expiration;

    IF FOUND THEN
      ttl := expiration - p_now;
      RETURN NEXT;
      RETURN;
    END IF;

    DELETE FROM rate_limit WHERE key = p_key AND expiration <= p_now;

    BEGIN
      expiration := p_now + p_time_window;
      INSERT INTO rate_limit (key, count, expiration)
      VALUES (p_key, 1, expiration)
      RETURNING count INTO current_count;
      ttl := expiration - p_now;
      RETURN NEXT;
      RETURN;
    EXCEPTION WHEN unique_violation THEN
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql;


--#endregion

--#region Suggestion

CREATE TABLE suggestion(
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    translation_text_id BIGINT NOT NULL,
    suggestion VARCHAR(500) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    Foreign Key (user_id) REFERENCES "user"(id) ON DELETE CASCADE ON UPDATE CASCADE,
    Foreign Key (translation_text_id) REFERENCES translation_text(id) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE(user_id, translation_text_id)
);

CREATE OR REPLACE FUNCTION create_suggestion(
    p_user_id UUID,
    p_translation_name VARCHAR(100),
    p_suggestion VARCHAR(500),
    p_verse_number INT,
    p_chapter_number INT,
    p_section_number INT,
    p_scripture_number INT
) RETURNS process_result AS $$
DECLARE
    result process_result;
    v_verse_id INT;
    v_affected_rows INT := 0;
    v_translation_text_id BIGINT;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM "user" WHERE id = p_user_id AND "user".is_frozen IS NULL) THEN
        result.success := FALSE;
        result.code := 418; -- I'm a teapot. :)
        result.message := 'There is no user like that?!';
        RETURN result;
    END IF;

    SELECT v.id INTO v_verse_id FROM verse v LEFT JOIN chapter c ON c.id = v.chapter_id LEFT JOIN section s ON s.id = c.section_id
    WHERE v.verse_number = p_verse_number AND c.chapter_number = p_chapter_number AND s.section_number = p_section_number AND s.scripture_id = p_scripture_number;

    IF NOT FOUND THEN
        result.success := FALSE;
        result.message := 'Verse couldn''t found.';
        result.code := 404; -- Not found.
        RETURN result;
    END IF;

    SELECT translation_text.id INTO v_translation_text_id FROM translation_text LEFT JOIN translation ON translation.id = translation_text.translation_id WHERE translation.name = p_translation_name;

    IF NOT FOUND THEN
        result.success := FALSE;
        result.message := 'Translation couldn''t found.';
        result.code := 404; -- Not found.
        RETURN result;
    END IF;

    INSERT INTO suggestion (user_id, translation_text_id, suggestion) VALUES (p_user_id, v_translation_text_id, p_suggestion);

    GET DIAGNOSTICS v_affected_rows = ROW_COUNT;

    IF v_affected_rows = 0 THEN
        result.message := 'This translation is not open to suggestions.';
        result.code := 503; -- Service unavailable.
        result.success := FALSE;
        RETURN result;
    END IF;

    result.message := 'Suggestion has been successfully added!';
    result.code := 201; -- Created.
    result.success := TRUE;
    RETURN result;

EXCEPTION
  WHEN unique_violation THEN
    result.message := 'You already have suggestion attached on this verse and translation.';
    result.code := 409; -- Conflict.
    result.success := FALSE;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION is_translation_valid_to_add_suggestion()
RETURNS TRIGGER AS $$
DECLARE
    v_is_translation_eager BOOLEAN := FALSE;
BEGIN
    SELECT translation.is_eager IS NOT NULL INTO v_is_translation_eager FROM translation_text LEFT JOIN translation ON translation.id = translation_text.translation_id WHERE translation_text.id = NEW.translation_text_id;

    IF v_is_translation_eager = FALSE THEN
        RETURN NULL;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_is_translation_eager
BEFORE INSERT ON suggestion
FOR EACH ROW
EXECUTE FUNCTION is_translation_valid_to_add_suggestion();


CREATE OR REPLACE FUNCTION delete_all_suggestions()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_eager = FALSE THEN
        DELETE FROM suggestion s
        USING translation_text tt, translation t
        WHERE s.translation_text_id = tt.id 
        AND tt.translation_id = t.id 
        AND t.id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER trigger_delete_suggestions
AFTER UPDATE ON translation
FOR EACH ROW
WHEN (OLD.is_eager IS NULL AND NEW.is_eager IS NOT NULL)
EXECUTE FUNCTION delete_all_suggestions();


CREATE OR REPLACE FUNCTION delete_suggestion(
    p_user_id UUID,
    p_translation_name VARCHAR(100),
    p_verse_number INT,
    p_chapter_number INT,
    p_section_number INT,
    p_scripture_number INT
) RETURNS process_result AS $$
DECLARE 
    result process_result;
    v_verse_id INT;
    v_translation_text_id BIGINT;
    v_affected_rows INT := 0;
BEGIN

    IF NOT EXISTS (SELECT 1 FROM "user" WHERE id = p_user_id AND "user".is_frozen IS NULL) THEN
        result.success := FALSE;
        result.code := 418; -- I'm a teapot. :)
        result.message := 'There is no user like that?!';
        RETURN result;
    END IF;

    SELECT v.id INTO v_verse_id FROM verse v LEFT JOIN chapter c ON c.id = v.chapter_id LEFT JOIN section s ON s.id = c.section_id
    WHERE v.verse_number = p_verse_number AND c.chapter_number = p_chapter_number AND s.section_number = p_section_number AND s.scripture_id = p_scripture_number;

    IF NOT FOUND THEN
        result.success := FALSE;
        result.message := 'Verse couldn''t found.';
        result.code := 404; -- Not found.
        RETURN result;
    END IF;

    SELECT translation_text.id INTO v_translation_text_id FROM translation_text LEFT JOIN translation ON translation.id = translation_text.translation_id WHERE translation.name = p_translation_name;

    IF NOT FOUND THEN
        result.success := FALSE;
        result.message := 'Translation couldn''t found.';
        result.code := 404; -- Not found.
        RETURN result;
    END IF;

    DELETE FROM suggestion WHERE suggestion.user_id = p_user_id AND suggestion.translation_text_id = v_translation_text_id;

    GET DIAGNOSTICS v_affected_rows = ROW_COUNT;

    IF v_affected_rows = 0 THEN
        result.success := FALSE;
        result.message := 'You do not have any suggestion attached on both specified verse and translation.';
        result.code := 404; -- Not found.
        RETURN result;
    END IF;

    result.success := TRUE;
    result.message := 'Suggestion on attached both verse and translation you specified successfully has been deleted!';
    result.code := 200; -- Not found.
    RETURN result;
END;
$$ LANGUAGE plpgsql;


--#endregion
