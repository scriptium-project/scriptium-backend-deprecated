CREATE TABLE surahs(  
    id SMALLSERIAL NOT NULL PRIMARY KEY,
    surahNameAr TEXT NOT NULL UNIQUE,
    verseCount SMALLINT NOT NULL,
    pageNumber SMALLINT NOT NULL
);


CREATE TABLE roots (
    id SMALLSERIAL NOT NULL PRIMARY KEY,
    latin VARCHAR(5) NOT NULL UNIQUE,
    arabic VARCHAR(5) NOT NULL UNIQUE,
    UNIQUE(latin, arabic)
);

CREATE TABLE verses(  
    id SMALLSERIAL NOT NULL PRIMARY KEY,
    verseNumber SMALLINT NOT NULL,
    text VARCHAR(1178) NOT NULL,
    textSimplified VARCHAR(1178) NOT NULL,
    textNoVowel VARCHAR(1178) NOT NULL,
    pageNumber SMALLINT NOT NULL,
    juzNumber SMALLINT NOT NULL,
    surahId SMALLINT NOT NULL,
    Foreign Key (surahId) REFERENCES surahs(id) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE(verseNumber, surahId)
);



CREATE TABLE words(
    id SERIAL NOT NULL PRIMARY KEY,
    sortNumber SMALLINT,
    text VARCHAR(22) NOT NULL,
    textNoVowel VARCHAR(22) NOT NULL,
    verseId SMALLINT NOT NULL,
    rootId SMALLINT,
    Foreign Key (rootId) REFERENCES roots(id) ON DELETE CASCADE ON UPDATE CASCADE,
    Foreign Key (verseId) REFERENCES verses(id) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE(sortNumber, verseId)
);

CREATE TABLE languages (
    id SMALLSERIAL NOT NULL PRIMARY KEY,
    langCode VARCHAR(2) NOT NULL UNIQUE,
    langOwn VARCHAR(20) NOT NULL UNIQUE,
    langEnglish VARCHAR(20) NOT NULL UNIQUE
);

INSERT INTO languages (langCode,langOwn,langEnglish) VALUES ('en','English','English');
INSERT INTO languages (langCode,langOwn,langEnglish) VALUES ('de','Deutsch','German');
INSERT INTO languages (langCode,langOwn,langEnglish) VALUES ('tr','Türkçe','Turkish');

CREATE TABLE translator(
    id SMALLSERIAL NOT NULL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    url VARCHAR(2000),
    langCode VARCHAR(2) NOT NULL,
    Foreign Key (langCode) REFERENCES languages(langCode) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE translation(
    id SMALLSERIAL NOT NULL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    langCode VARCHAR(2),
    prodYear DATE,
    Foreign Key (langCode) REFERENCES languages(langCode) ON DELETE CASCADE ON UPDATE CASCADE
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
    verseId SMALLSERIAL NOT NULL,
    Foreign Key (verseId) REFERENCES verses(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE wordMeaning(
    id BIGSERIAL NOT NULL PRIMARY KEY,
    meaning VARCHAR(100) NOT NULL,
    wordId SMALLINT NOT NULL,
    langCode VARCHAR(2) NOT NULL,
    Foreign Key (wordId) REFERENCES words(id) ON DELETE CASCADE ON UPDATE CASCADE,
    Foreign Key (langCode) REFERENCES languages(langCode) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE(wordId,meaning,langCode)
)


CREATE TABLE translationText(
    id SERIAL NOT NULL PRIMARY KEY,
    translation TEXT NOT NULL,
    translationId SMALLINT NOT NULL,
    verseId SMALLINT NOT NULL,
    Foreign Key (translationId) REFERENCES translation(id) ON DELETE CASCADE ON UPDATE CASCADE,
    Foreign Key (verseId) REFERENCES verses(id) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE(translation,translationId, verseId)
)

CREATE TABLE footnotesText(
    id SERIAL NOT NULL PRIMARY KEY,
    translationId SMALLINT NOT NULL,
    text TEXT NOT NULL,
);

CREATE UNIQUE INDEX unique_partial_text ON footnotesText (translationId, left(text, 2048));


CREATE TABLE footnotes(
    id SERIAL NOT NULL PRIMARY KEY,
    number SMALLINT NOT NULL,
    index SMALLINT NOT NULL,
    translationTextId INT NOT NULL,
    footnoteTextId INT NOT NULL,
    Foreign Key (translationTextId) REFERENCES translationtext(id) ON DELETE CASCADE ON UPDATE CASCADE,
    Foreign Key (footnoteTextId) REFERENCES footnotesText(id) ON DELETE CASCADE ON UPDATE CASCADE,
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