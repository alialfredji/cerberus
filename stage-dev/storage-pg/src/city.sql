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

