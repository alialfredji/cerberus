-- creating ig_post table
CREATE TABLE ig_post (
    id BIGINT NOT NULL,
    profile_id BIGINT NOT NULL,
    post_id character varying(20) NOT NULL,
    payload JSONB NOT NULL,
    created_at timestamp with time zone default date_trunc('second', now())
);

CREATE SEQUENCE ig_post_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE ig_post_id_seq OWNED BY ig_post.id;
ALTER TABLE ONLY ig_post ALTER COLUMN id SET DEFAULT nextval('ig_post_id_seq'::regclass);
ALTER TABLE ONLY ig_post ADD CONSTRAINT ig_post_pkey PRIMARY KEY (id);
-- CREATE UNIQUE INDEX ig_post_profile_id_idx ON ig_post USING btree (post_id, created_at);

