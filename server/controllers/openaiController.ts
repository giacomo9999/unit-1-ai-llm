import { RequestHandler } from 'express';
import { ServerError } from '../types';
// import { SCHEMA } from '../../schema';

export const queryOpenAI: RequestHandler = async (_req, res, next) => {
  const { naturalLanguageQuery } = res.locals;
  if (!naturalLanguageQuery) {
    const error: ServerError = {
      log: 'OpenAI query middleware did not receive a query',
      status: 500,
      message: { err: 'An error occurred before querying OpenAI' },
    };
    return next(error);
  }

  const schema = `
  CREATE TABLE public.people (
	"_id" serial NOT NULL,
	"name" varchar NOT NULL,
	"mass" varchar,
	"hair_color" varchar,
	"skin_color" varchar,
	"eye_color" varchar,
	"birth_year" varchar,
	"gender" varchar,
	"species_id" bigint,
	"homeworld_id" bigint,
	"height" integer,
	CONSTRAINT "people_pk" PRIMARY KEY ("_id")
) WITH (
  OIDS=FALSE
);

CREATE TABLE  public.films (
	"_id" serial NOT NULL,
	"title" varchar NOT NULL,
	"episode_id" integer NOT NULL,
	"opening_crawl" varchar NOT NULL,
	"director" varchar NOT NULL,
	"producer" varchar NOT NULL,
	"release_date" DATE NOT NULL,
	CONSTRAINT "films_pk" PRIMARY KEY ("_id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE  public.people_in_films (
	"_id" serial NOT NULL,
	"person_id" bigint NOT NULL,
	"film_id" bigint NOT NULL,
	CONSTRAINT "people_in_films_pk" PRIMARY KEY ("_id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE  public.planets (
	"_id" serial NOT NULL,
	"name" varchar,
	"rotation_period" integer,
	"orbital_period" integer,
	"diameter" integer,
	"climate" varchar,
	"gravity" varchar,
	"terrain" varchar,
	"surface_water" varchar,
	"population" bigint,
	CONSTRAINT "planets_pk" PRIMARY KEY ("_id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE  public.species (
	"_id" serial NOT NULL,
	"name" varchar NOT NULL,
	"classification" varchar,
	"average_height" varchar,
	"average_lifespan" varchar,
	"hair_colors" varchar,
	"skin_colors" varchar,
	"eye_colors" varchar,
	"language" varchar,
	"homeworld_id" bigint,
	CONSTRAINT "species_pk" PRIMARY KEY ("_id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE  public.vessels (
	"_id" serial NOT NULL,
	"name" varchar NOT NULL,
	"manufacturer" varchar,
	"model" varchar,
	"vessel_type" varchar NOT NULL,
	"vessel_class" varchar NOT NULL,
	"cost_in_credits" bigint,
	"length" varchar,
	"max_atmosphering_speed" varchar,
	"crew" integer,
	"passengers" integer,
	"cargo_capacity" varchar,
	"consumables" varchar,
	CONSTRAINT "vessels_pk" PRIMARY KEY ("_id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE  public.species_in_films (
	"_id" serial NOT NULL,
	"film_id" bigint NOT NULL,
	"species_id" bigint NOT NULL,
	CONSTRAINT "species_in_films_pk" PRIMARY KEY ("_id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE  public.planets_in_films (
	"_id" serial NOT NULL,
	"film_id" bigint NOT NULL,
	"planet_id" bigint NOT NULL,
	CONSTRAINT "planets_in_films_pk" PRIMARY KEY ("_id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE  public.pilots (
	"_id" serial NOT NULL,
	"person_id" bigint NOT NULL,
	"vessel_id" bigint NOT NULL,
	CONSTRAINT "pilots_pk" PRIMARY KEY ("_id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE  public.vessels_in_films (
	"_id" serial NOT NULL,
	"vessel_id" bigint NOT NULL,
	"film_id" bigint NOT NULL,
	CONSTRAINT "vessels_in_films_pk" PRIMARY KEY ("_id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE  public.starship_specs (
	"_id" serial NOT NULL,
	"hyperdrive_rating" varchar,
	"MGLT" varchar,
	"vessel_id" bigint NOT NULL,
	CONSTRAINT "starship_specs_pk" PRIMARY KEY ("_id")
) WITH (
  OIDS=FALSE
);
`;

  try {
    const openaiResponse = await fetch(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'user',
              content: `You are a SQL query generator. Using the schema: ${schema} and my prompt: ${naturalLanguageQuery}, come up with a raw SQL query.
              
              Only return the raw sql query. When you return it, return it in a single line
              `,
            },
          ],
          temperature: 0.7,
        }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const responseData = await openaiResponse.json();
    console.log('responseDataMessage', responseData.choices[0].message);
    res.locals.databaseQuery = responseData.choices[0].message.content;
    return next();
  } catch (error) {
    return next({
      log: `OpenAI query failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      status: 500,
      message: { err: 'An error occurred while querying OpenAI' },
    });
  }
};
