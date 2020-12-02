/* CREATE DATABASE */

CREATE DATABASE foodfy

/* CREATE TABLES */

CREATE TABLE "chefs"
(
  "id" SERIAL PRIMARY KEY,
  "file_id" int UNIQUE NOT NULL,
  "name" text NOT NULL,
  "created_at" timestamp DEFAULT 'now()',
  "updated_at" timestamp
);

CREATE TABLE "recipes"
(
  "id" SERIAL PRIMARY KEY,
  "chef_id" int NOT NULL,
  "title" text NOT NULL,
  "ingredients" text
  [],
  "preparation" text[],
  "information" text,
  "created_at" timestamp DEFAULT 'now()'
);

  CREATE TABLE "files"
  (
    "id" SERIAL PRIMARY KEY,
    "name" text,
    "path" text NOT NULL
  );

  CREATE TABLE "recipes_files"
  (
    "id" SERIAL PRIMARY KEY,
    "recipe_id" int NOT NULL,
    "file_id" int UNIQUE NOT NULL
  );

  ALTER TABLE "recipes" ADD FOREIGN KEY ("chef_id") REFERENCES "chefs" ("id");

  ALTER TABLE "recipes_files" ADD FOREIGN KEY ("recipe_id") REFERENCES "recipes" ("id");

  ALTER TABLE "recipes_files" ADD FOREIGN KEY ("file_id") REFERENCES "files" ("id");

  ALTER TABLE "chefs" ADD FOREIGN KEY ("file_id") REFERENCES "files" ("id");
