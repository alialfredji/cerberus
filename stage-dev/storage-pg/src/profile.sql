-- creating ig_profile table
CREATE TABLE ig_profile (
    id BIGINT NOT NULL,
    profile_id BIGINT NOT NULL,
    payload JSONB NOT NULL,
    created_at timestamp with time zone default date_trunc('second', now())
);

CREATE SEQUENCE ig_profile_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE ig_profile_id_seq OWNED BY ig_profile.id;
ALTER TABLE ONLY ig_profile ALTER COLUMN id SET DEFAULT nextval('ig_profile_id_seq'::regclass);
ALTER TABLE ONLY ig_profile ADD CONSTRAINT ig_profile_pkey PRIMARY KEY (id);
-- CREATE UNIQUE INDEX ig_profile_profile_id_idx ON ig_profile USING btree (profile_id, created_at);

