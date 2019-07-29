-- creating ig_location table -- location
CREATE TABLE ig_location (
    id BIGINT NOT NULL,
    location_id BIGINT NOT NULL,
    payload JSONB NOT NULL,
    created_at timestamp with time zone default date_trunc('second', now())
);

CREATE SEQUENCE ig_location_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE ig_location_id_seq OWNED BY ig_location.id;
ALTER TABLE ONLY ig_location ALTER COLUMN id SET DEFAULT nextval('ig_location_id_seq'::regclass);
ALTER TABLE ONLY ig_location ADD CONSTRAINT ig_location_pkey PRIMARY KEY (id);
-- CREATE UNIQUE INDEX ig_location_location_id_idx ON ig_location USING btree (location_id);
-- CREATE INDEX ig_location_location_name_idx ON ig_location USING btree (location_name) TABLESPACE instagram;

