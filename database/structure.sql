CREATE TABLE surah(  
    id SMALLSERIAL NOT NULL PRIMARY KEY,
    surahNameAr TEXT NOT NULL UNIQUE,
    verseCount SMALLINT NOT NULL,
    pageNumber SMALLINT NOT NULL
);


CREATE TABLE root (
    id SERIAL NOT NULL PRIMARY KEY,
    latin VARCHAR(5) NOT NULL UNIQUE,
    arabic VARCHAR(5) NOT NULL UNIQUE,
    UNIQUE(latin, arabic)
);

CREATE TABLE verse(  
    id SERIAL NOT NULL PRIMARY KEY,
    verseNumber SMALLINT NOT NULL,
    text VARCHAR(1178) NOT NULL,
    textSimplified VARCHAR(1178) NOT NULL,
    textNoVowel VARCHAR(1178) NOT NULL,
    pageNumber SMALLINT NOT NULL,
    juzNumber SMALLINT NOT NULL,
    surahId SMALLINT NOT NULL,
    Foreign Key (surahId) REFERENCES surahs(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    UNIQUE(verseNumber, surahId)
);



CREATE TABLE word(
    id SERIAL NOT NULL PRIMARY KEY,
    sortNumber SMALLINT,
    text VARCHAR(22) NOT NULL,
    textNoVowel VARCHAR(22) NOT NULL,
    verseid INTEGER NOT NULL,
    rootId INTEGER,
    Foreign Key (rootId) REFERENCES roots(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    Foreign Key (verseId) REFERENCES verses(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    UNIQUE(sortNumber, verseId)
);

CREATE TABLE language (
    id SMALLSERIAL NOT NULL PRIMARY KEY,
    langCode VARCHAR(2) NOT NULL UNIQUE,
    langOwn VARCHAR(20) NOT NULL UNIQUE,
    langEnglish VARCHAR(20) NOT NULL UNIQUE
);

INSERT INTO language (langCode,langOwn,langEnglish) VALUES ('en','English','English');
INSERT INTO language (langCode,langOwn,langEnglish) VALUES ('de','Deutsch','German');
INSERT INTO language (langCode,langOwn,langEnglish) VALUES ('tr','Türkçe','Turkish');

CREATE TABLE translator(
    id SMALLSERIAL NOT NULL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    url VARCHAR(2000),
    langCode VARCHAR(2) NOT NULL,
    Foreign Key (langCode) REFERENCES languages(langCode) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE translation(
    id SMALLSERIAL NOT NULL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    langCode VARCHAR(2),
    prodYear DATE,
    Foreign Key (langCode) REFERENCES languages(langCode) ON DELETE RESTRICT ON UPDATE CASCADE
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
    langCode VARCHAR(2) NOT NULL,
    transliteration VARCHAR(1500) NOT NULL,
    verseid INTEGER NOT NULL,
    Foreign Key (verseId) REFERENCES verses(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE wordMeaning(
    id BIGSERIAL NOT NULL PRIMARY KEY,
    meaning VARCHAR(100) NOT NULL,
    wordId SMALLINT NOT NULL,
    langCode VARCHAR(2) NOT NULL,
    Foreign Key (wordId) REFERENCES words(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    Foreign Key (langCode) REFERENCES languages(langCode) ON DELETE RESTRICT ON UPDATE CASCADE,
    UNIQUE(wordId,meaning,langCode)
)


CREATE TABLE translationText(
    id SERIAL NOT NULL PRIMARY KEY,
    translation TEXT NOT NULL,
    translationId SMALLINT NOT NULL,
    verseid INTEGER NOT NULL,
    Foreign Key (translationId) REFERENCES translation(id) ON DELETE CASCADE ON UPDATE CASCADE,
    Foreign Key (verseId) REFERENCES verses(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    UNIQUE(translation,translationId, verseId)
)

CREATE TABLE footnoteText(
    id SERIAL NOT NULL PRIMARY KEY,
    translationId SMALLINT NOT NULL,
    text TEXT NOT NULL,
);

CREATE UNIQUE INDEX unique_partial_text ON footnoteText (translationId, left(text, 2048));


CREATE TABLE footnote(
    id SERIAL NOT NULL PRIMARY KEY,
    number SMALLINT NOT NULL,
    index SMALLINT NOT NULL,
    translationTextId INT NOT NULL,
    footnoteTextId INT NOT NULL,
    Foreign Key (translationTextId) REFERENCES translationtext(id) ON DELETE CASCADE ON UPDATE CASCADE,
    Foreign Key (footnoteTextId) REFERENCES footnoteText(id) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE(translationTextId, index,footnoteTextId)
)

CREATE TABLE surahMeaning(
    id SERIAL NOT NULL PRIMARY KEY,
    meaning VARCHAR(50),
    surahId SMALLINT NOT NULL,
    langCode VARCHAR(2) NOT NULL,
    Foreign Key (langCode) REFERENCES languages(langCode),
    Foreign Key (surahId) REFERENCES surahs(Id),
    UNIQUE(langCode, surahId)
)

CREATE TABLE session (
    id VARCHAR(100) NOT NULL PRIMARY KEY,   
    expires_at TIMESTAMPTZ,
    userId UUID,
    session JSONB NOT NULL    
);

CREATE TABLE "user"(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(24) UNIQUE NOT NULL,
  name VARCHAR(30) NOT NULL,
  surname VARCHAR(30) NOT NULL,
  gender CHAR(1),
  email VARCHAR(255) UNIQUE NOT NULL,
  email_verified TIMESTAMPTZ,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  last_active TIMESTAMPTZ,
  is_frozen BOOLEAN NOT NULL,
  role_id SMALLINT,
  Foreign Key (role_id) REFERENCES role(id) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE table "role"(
    id SMALLSERIAL PRIMARY KEY,
    role VARCHAR(15) UNIQUE NOT NULL
);

INSERT INTO "role" ("role") VALUES ('admin');
INSERT INTO "role" ("role") VALUES ('verified');

CREATE TABLE collection (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(500) NOT NULL DEFAULT '',
  description VARCHAR(1000),
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

CREATE TABLE collection_verse (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collectionId UUID NOT NULL,
  verseId INTEGER NOT NULL,
  saved_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  note VARCHAR(1000),
  Foreign Key (collectionId) REFERENCES collection(id) ON DELETE CASCADE ON UPDATE CASCADE,
  Foreign Key (verseId) REFERENCES verse(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  UNIQUE(collectionId, verseid)
);

CREATE table cache(
    id BIGSERIAL PRIMARY KEY,
    cache_key VARCHAR(255) NOT NULL UNIQUE,
    data JSONB NOT NULL
);


CREATE table notes(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    userId UUID NOT NULL,
    text VARCHAR(5000),
    verseId INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ,
    Foreign Key (verseId) REFERENCES verse(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    Foreign Key (userId) REFERENCES "user"(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE FUNCTION check_user_note_limit()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT COUNT(*) FROM notes 
        WHERE userId = NEW.userId 
          AND verseId = NEW.verseId) >= 5 THEN --Since a user it is possible to create 5 notes per verse.
        RETURN NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_user_note_limit_trigger
BEFORE INSERT ON notes
FOR EACH ROW EXECUTE FUNCTION check_user_note_limit();
