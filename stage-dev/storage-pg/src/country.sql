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

