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

-- creating ig_country table -- city
CREATE TABLE ig_country (
    id BIGINT NOT NULL,
    country_id character varying(5) NOT NULL,
    payload JSONB NOT NULL,
    created_at timestamp with time zone default date_trunc('second', now())
);

CREATE SEQUENCE ig_country_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE ig_country_id_seq OWNED BY ig_country.id;
ALTER TABLE ONLY ig_country ALTER COLUMN id SET DEFAULT nextval('ig_country_id_seq'::regclass);
ALTER TABLE ONLY ig_country ADD CONSTRAINT ig_country_pkey PRIMARY KEY (id);
-- CREATE UNIQUE INDEX ig_country_city_id_idx ON ig_country USING btree (city_id);

-- creating ig_city table -- city
CREATE TABLE ig_city (
    id BIGINT NOT NULL,
    city_id character varying(50) NOT NULL,
    payload JSONB NOT NULL, 
    created_at timestamp with time zone default date_trunc('second', now())
);

CREATE SEQUENCE ig_city_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE ig_city_id_seq OWNED BY ig_city.id;
ALTER TABLE ONLY ig_city ALTER COLUMN id SET DEFAULT nextval('ig_city_id_seq'::regclass);
ALTER TABLE ONLY ig_city ADD CONSTRAINT ig_city_pkey PRIMARY KEY (id);
-- CREATE UNIQUE INDEX ig_city_city_id_idx ON ig_city USING btree (city_id) TABLESPACE instagram;

