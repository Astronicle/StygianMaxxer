-- Post-wide tags (Mine/Not Mine, No Builds, FPS tags, Ping tags).
CREATE TABLE post_tag (
    post_id INTEGER NOT NULL REFERENCES post(post_id) ON DELETE CASCADE,
    tag VARCHAR(32) NOT NULL,
    PRIMARY KEY (post_id, tag)
);

-- Boss-specific tags (Ping Dependent, tool/execution tags, Cheese, Over Level).
CREATE TABLE post_boss_tag (
    post_boss_id BIGINT NOT NULL REFERENCES post_boss(post_boss_id) ON DELETE CASCADE,
    tag VARCHAR(32) NOT NULL,
    PRIMARY KEY (post_boss_id, tag)
);

CREATE INDEX idx_post_tag_tag ON post_tag(tag);
CREATE INDEX idx_post_boss_tag_tag ON post_boss_tag(tag);
