CREATE TABLE chapter(  
    id SMALLSERIAL NOT NULL PRIMARY KEY,
    chapterName TEXT NOT NULL UNIQUE,
    verseCount SMALLINT NOT NULL,
    pageNumber SMALLINT NOT NULL
);


CREATE TABLE root (
    id SERIAL NOT NULL PRIMARY KEY,
    latin VARCHAR(5) NOT NULL UNIQUE,
    own VARCHAR(5) NOT NULL UNIQUE,
    UNIQUE(latin, own)
);

CREATE TABLE verse(
    id SERIAL NOT NULL PRIMARY KEY,
    verseNumber SMALLINT NOT NULL,
    text VARCHAR(1178) NOT NULL,
    textSimplified VARCHAR(1178) NOT NULL,
    textNoVowel VARCHAR(1178) NOT NULL,
    pageNumber SMALLINT NOT NULL,
    chapterId SMALLINT NOT NULL,
    Foreign Key (chapterId) REFERENCES chapter(Id) ON DELETE RESTRICT ON UPDATE CASCADE,
    UNIQUE(chapterId, verseNumber)
);

CREATE TABLE word(
    id SERIAL NOT NULL PRIMARY KEY,
    sequenceNumber SMALLINT,
    text VARCHAR(22) NOT NULL,
    textNoVowel VARCHAR(22) NOT NULL,
    verseid INTEGER NOT NULL,
    rootId INTEGER,
    Foreign Key (rootId) REFERENCES "root"(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    Foreign Key (verseId) REFERENCES verse(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    UNIQUE(sequenceNumber, verseId)
);

CREATE TABLE language (
    id SMALLSERIAL NOT NULL PRIMARY KEY,
    langCode VARCHAR(2) NOT NULL UNIQUE,
    langOwn VARCHAR(20) NOT NULL,
    langEnglish VARCHAR(20) NOT NULL
);

INSERT INTO language (langCode,langOwn,langEnglish) VALUES ('en','English','English');
INSERT INTO language (langCode,langOwn,langEnglish) VALUES ('de','Deutsch','German');
INSERT INTO language (langCode,langOwn,langEnglish) VALUES ('tr','Türkçe','Turkish');

CREATE TABLE translator(
    id SMALLSERIAL NOT NULL PRIMARY KEY,
    fullName VARCHAR(100) NOT NULL,
    url VARCHAR(2000),
    langId SMALLINT NOT NULL,
    Foreign Key (langId) REFERENCES "language"(Id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE translation(
    id SMALLSERIAL NOT NULL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    langId SMALLINT NOT NULL DEFAULT 1,
    prodYear DATE,
    Foreign Key (lang) REFERENCES "language"(Id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE translator_translation(
       id SMALLSERIAL NOT NULL PRIMARY KEY,
       translatorId SMALLSERIAL NOT NULL,
       translationId SMALLSERIAL NOT NULL,
       Foreign Key (translatorId) REFERENCES translator(id) ON DELETE CASCADE ON UPDATE CASCADE,
       Foreign Key (translationId) REFERENCES translation(id) ON DELETE CASCADE ON UPDATE CASCADE,
       UNIQUE(translationId, translatorId)
);

CREATE TABLE transliteration(
    id SERIAL PRIMARY KEY NOT NULL,
    langId SMALLINT NOT NULL,
    transliteration VARCHAR(1500) NOT NULL,
    verseid INTEGER NOT NULL,
    Foreign Key (verseId) REFERENCES verse(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    Foreign Key (langId) REFERENCES "language"(Id)
);

CREATE TABLE wordMeaning(
    id BIGSERIAL NOT NULL PRIMARY KEY,
    meaning VARCHAR(100) NOT NULL,
    wordId SMALLINT NOT NULL,
    langId SMALLINT NOT NULL,
    Foreign Key (wordId) REFERENCES word(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    Foreign Key (langId) REFERENCES "language"(Id) ON DELETE RESTRICT ON UPDATE CASCADE,
    UNIQUE(wordId, langId)
);

CREATE TABLE translationText(
    id SERIAL NOT NULL PRIMARY KEY,
    translation TEXT NOT NULL,
    translationId SMALLINT NOT NULL,
    verseid INTEGER NOT NULL,
    Foreign Key (translationId) REFERENCES translation(id) ON DELETE CASCADE ON UPDATE CASCADE,
    Foreign Key (verseId) REFERENCES verse(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    UNIQUE(translation,translationId, verseId)
);

CREATE TABLE footnoteText(
    id SERIAL NOT NULL PRIMARY KEY,
    text TEXT NOT NULL
);
-- Since some footnotes extremely long, UNIQUE constrain doesn't work correctly that long texts. So, it is better to have an temporary solution like this:.
CREATE UNIQUE INDEX unique_partial_text ON footnoteText (translationId, left(text, 2048));


CREATE TABLE footnote(
    id SERIAL NOT NULL PRIMARY KEY,
    number SMALLINT NOT NULL,
    index SMALLINT NOT NULL,
    translationTextId INT NOT NULL,
    footnoteTextId INT NOT NULL,
    Foreign Key (translationTextId) REFERENCES translationText(id) ON DELETE CASCADE ON UPDATE CASCADE,
    Foreign Key (footnoteTextId) REFERENCES footnoteText(id) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE(translationTextId, index,footnoteTextId)
)

CREATE TABLE chapterMeaning(
    id SERIAL NOT NULL PRIMARY KEY,
    meaning VARCHAR(50),
    chapterId SMALLINT NOT NULL,
    langId SMALLINT NOT NULL,
    Foreign Key (langId) REFERENCES "language"(Id),
    Foreign Key (chapterId) REFERENCES chapter(Id),
    UNIQUE(langId, chapterId)
)

CREATE TABLE session (
    id VARCHAR(100) NOT NULL PRIMARY KEY,   
    expires_at TIMESTAMPTZ,
    session JSONB NOT NULL    
);

CREATE TABLE "user"(
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
  Foreign Key (role_id) REFERENCES "role"(id) ON DELETE SET NULL ON UPDATE CASCADE,
  Foreign Key (preferred_languageId) REFERENCES "language"(Id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Create a unique index on LOWER(username) to enforce case-insensitive uniqueness.
CREATE UNIQUE INDEX unique_username_ci ON "user" (LOWER(username));

CREATE table "role"(
    id SMALLSERIAL PRIMARY KEY,
    role VARCHAR(15) UNIQUE NOT NULL,
    description VARCHAR(250),
);

INSERT INTO "role" ("role") VALUES ('admin');
INSERT INTO "role" ("role") VALUES ('verified');

CREATE TABLE collection (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL DEFAULT '',
  description VARCHAR(250),
  userId UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  Foreign Key (userId) REFERENCES "user"(id) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE(userId, name)
);


-- Thanks to this trigger function, each user will automatically have a default collection labeled ''.
CREATE FUNCTION create_default_collection()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO collection (name, userId, created_at)
    VALUES ('', NEW.id, CURRENT_TIMESTAMP);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_user_insert
AFTER INSERT ON "user"
FOR EACH ROW
EXECUTE FUNCTION create_default_collection();

CREATE FUNCTION check_user_collection_limit()
RETURNS TRIGGER AS $$
BEGIN
        IF (SELECT COUNT(*) FROM collection
        WHERE userId = NEW.userId) > 50 THEN --A user maximum own 50 collections.
        RETURN NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_user_collection_limit_trigger
AFTER INSERT ON "user"
FOR EACH ROW
EXECUTE FUNCTION check_user_collection_limit();

CREATE TABLE collection_verse (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collectionId UUID NOT NULL,
  verseId INTEGER NOT NULL,
  saved_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  note VARCHAR(250),
  Foreign Key (collectionId) REFERENCES collection(id) ON DELETE CASCADE ON UPDATE CASCADE,
  Foreign Key (verseId) REFERENCES verse(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  UNIQUE(collectionId, verseid)
);

CREATE table cache(
    key VARCHAR(255) NOT NULL UNIQUE,
    data JSONB NOT NULL
);


CREATE table note(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    userId UUID NOT NULL,
    text TEXT NOT NULL, --since there is a length constraints for this field. There is no possible way to devour server storage for malicious users.
    verseId INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ,
    Foreign Key (verseId) REFERENCES verse(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    Foreign Key (userId) REFERENCES "user"(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_note_userid_verseid ON note(userId, verseId);


CREATE FUNCTION check_user_note_limit()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT COUNT(*) FROM note
        WHERE userId = NEW.userId 
          AND verseId = NEW.verseId) > 5 OR (SELECT COUNT(*) FROM note WHERE userId = NEW.userId > 100) THEN --A user maximum has 5 note per verse and 100 independent from verses.
        RETURN NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_user_note_limit_trigger
BEFORE INSERT ON note
FOR EACH ROW EXECUTE FUNCTION check_user_note_limit();

CREATE table "comment"(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    userId UUID NOT NULL,
    text VARCHAR(500) NOT NULL, --Same as note.text. Since there is a length constraints for this field. There is no possible way to devour server storage.
    verseId INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ,
    Foreign Key (verseId) REFERENCES verse(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    Foreign Key (userId) REFERENCES "user"(id) ON DELETE CASCADE ON UPDATE CASCADE
)


CREATE FUNCTION check_user_comment_limit()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT COUNT(*) FROM note
        WHERE userId = NEW.userId 
          AND verseId = NEW.verseId) > 25 THEN --A user maximum has 25 comment per verse. This storage can be increased by enhancement of storage of sever.
        RETURN NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_user_comment_limit_trigger
AFTER INSERT ON "comment"
FOR EACH ROW
EXECUTE FUNCTION check_user_comment_limit()

--Nested comments.
CREATE table comment_comment( 
    id BIGSERIAL PRIMARY KEY,
    parent_comment_id UUID,
    child_comment_id UUID NOT NULL,
    Foreign Key (parent_comment_id) REFERENCES "comment"(id) ON DELETE CASCADE ON UPDATE CASCADE,
    Foreign Key (child_comment_id) REFERENCES "comment"(id) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE(parent_comment_id,child_comment_id)
);

CREATE INDEX idx_comment_comment_parent ON comment_comment(parent_comment_id);


CREATE TYPE FOLLOW_STATUS AS ENUM ('pending', 'accepted');

CREATE TABLE "follow" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL,
  followed_id UUID NOT NULL,
  status FOLLOW_STATUS NOT NULL DEFAULT 'accepted',
  followed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (follower_id) REFERENCES "user"(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (followed_id) REFERENCES "user"(id) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE (follower_id, followed_id)
);

-- This function and trigger ensure that when a user switches their account from private to public, all pending follow requests for that user are automatically accepted. The trigger listens for changes to the user's account visibility (is_private property of that user), and if the account is made public, the function updates the status of all pending follow requests to "accepted."
CREATE FUNCTION accept_pending_follows()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.is_private IS NOT NULL AND NEW.is_private IS NULL THEN
    UPDATE follow
    SET status = 'accepted', followed_at = CURRENT_TIMESTAMP
    WHERE followed_id = NEW.id AND status = 'pending';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_accept_pending_follows
AFTER UPDATE OF is_private ON "user"
FOR EACH ROW
WHEN (OLD.is_private IS DISTINCT FROM NEW.is_private)
EXECUTE FUNCTION accept_pending_follows();


CREATE TABLE "block" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocker_id UUID NOT NULL,
    blocked_id UUID NOT NULL,
    blocked_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    reason VARCHAR(100),
    FOREIGN KEY (blocker_id) REFERENCES "user"(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (blocked_id) REFERENCES "user"(id) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE (blocker_id, blocked_id)
);


-- By this function, blocked users cannot follow or send request to follow users which has blocked/ignore them.
CREATE FUNCTION handle_follow_block() 
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM block 
        WHERE blocker_id = NEW.followed_id 
        AND blocked_id = NEW.follower_id
    ) THEN
        DELETE FROM follow 
        WHERE id = NEW.id;
        
        RETURN NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_follow_block
AFTER INSERT ON follow
FOR EACH ROW
EXECUTE FUNCTION handle_follow_block();

-- Thanks to this function, the case has been completely handled which whenever user blocks another whom send request or follow the user, following request will be automatically canceled or deleted.
CREATE FUNCTION delete_follow_after_block()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM follow
    WHERE follower_id = NEW.blocked_id
    AND followed_id = NEW.blocker_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_follow_block_on_insert
AFTER INSERT ON block
FOR EACH ROW
EXECUTE FUNCTION delete_follow_after_block();
