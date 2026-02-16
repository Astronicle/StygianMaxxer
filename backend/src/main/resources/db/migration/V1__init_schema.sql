-- Static Lookup Tables
CREATE TABLE element (
    element_id SMALLINT PRIMARY KEY,
    element_slug TEXT NOT NULL UNIQUE,
    element_name TEXT NOT NULL UNIQUE
);

CREATE TABLE wep_type (
    wep_type_id SMALLINT PRIMARY KEY,
    wep_type_slug TEXT NOT NULL UNIQUE,
    wep_type_name TEXT NOT NULL UNIQUE
);

CREATE TABLE boss (
    boss_id SMALLINT PRIMARY KEY,
    boss_slug TEXT NOT NULL UNIQUE,
    boss_name TEXT NOT NULL
);

CREATE TABLE stygian (
    stygian_id SMALLINT PRIMARY KEY,
    stygian_name TEXT NOT NULL UNIQUE,
    version TEXT NOT NULL UNIQUE
);

-- Character
CREATE TABLE character (
    char_id SMALLINT PRIMARY KEY,
    char_slug TEXT NOT NULL UNIQUE,
    char_name TEXT NOT NULL UNIQUE,
    rarity SMALLINT NOT NULL,
    wep_type_id SMALLINT NOT NULL,
    element_id SMALLINT NOT NULL,
    CONSTRAINT fk_character_weptype FOREIGN KEY (wep_type_id) REFERENCES wep_type(wep_type_id),
    CONSTRAINT fk_character_element FOREIGN KEY (element_id) REFERENCES element(element_id)
);

-- Account
CREATE TABLE account (
    account_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    avatar_char_id SMALLINT,
    creation_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_account_avatar FOREIGN KEY (avatar_char_id) REFERENCES character(char_id) ON DELETE
    SET
        NULL
);

-- StygianBoss
CREATE TABLE stygian_boss (
    stygian_id SMALLINT NOT NULL,
    boss_id SMALLINT NOT NULL,
    slot SMALLINT NOT NULL CHECK (
        slot BETWEEN 1
        AND 3
    ),
    PRIMARY KEY (stygian_id, boss_id),
    CONSTRAINT fk_stygianboss_stygian FOREIGN KEY (stygian_id) REFERENCES stygian(stygian_id),
    CONSTRAINT fk_stygianboss_boss FOREIGN KEY (boss_id) REFERENCES boss(boss_id)
);

-- Post
CREATE TABLE post (
    post_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    account_id INT NOT NULL,
    stygian_id SMALLINT NOT NULL,
    post_title TEXT NOT NULL,
    post_desc TEXT NOT NULL,
    video_link TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_post_account FOREIGN KEY (account_id) REFERENCES account(account_id) ON DELETE CASCADE,
    CONSTRAINT fk_post_stygian FOREIGN KEY (stygian_id) REFERENCES stygian(stygian_id)
);

-- PostBoss
CREATE TABLE post_boss (
    post_boss_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    post_id INT NOT NULL,
    boss_id SMALLINT NOT NULL,
    build_info TEXT NOT NULL,
    UNIQUE (post_id, boss_id),
    CONSTRAINT fk_postboss_post FOREIGN KEY (post_id) REFERENCES post(post_id) ON DELETE CASCADE,
    CONSTRAINT fk_postboss_boss FOREIGN KEY (boss_id) REFERENCES boss(boss_id)
);

-- PostBossCharacter
CREATE TABLE post_boss_character (
    post_boss_id BIGINT NOT NULL,
    char_id SMALLINT NOT NULL,
    slot SMALLINT NOT NULL CHECK (
        slot BETWEEN 1
        AND 4
    ),
    has_sig BOOLEAN NOT NULL,
    cons SMALLINT NOT NULL CHECK (
        cons BETWEEN 0
        AND 6
    ),
    PRIMARY KEY (post_boss_id, slot),
    UNIQUE (post_boss_id, char_id),
    CONSTRAINT fk_pbc_postboss FOREIGN KEY (post_boss_id) REFERENCES post_boss(post_boss_id) ON DELETE CASCADE,
    CONSTRAINT fk_pbc_character FOREIGN KEY (char_id) REFERENCES character(char_id)
);

-- PostRating
CREATE TABLE post_rating (
    post_id INT NOT NULL,
    account_id INT NOT NULL,
    rating SMALLINT NOT NULL CHECK (
        rating BETWEEN 1
        AND 5
    ),
    PRIMARY KEY (post_id, account_id),
    CONSTRAINT fk_rating_post FOREIGN KEY (post_id) REFERENCES post(post_id) ON DELETE CASCADE,
    CONSTRAINT fk_rating_account FOREIGN KEY (account_id) REFERENCES account(account_id) ON DELETE CASCADE
);

CREATE INDEX idx_post_account ON post(account_id);

CREATE INDEX idx_post_stygian ON post(stygian_id);

CREATE INDEX idx_postboss_post ON post_boss(post_id);

CREATE INDEX idx_pbc_postboss ON post_boss_character(post_boss_id);

CREATE INDEX idx_rating_post ON post_rating(post_id);