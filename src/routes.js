const express = require("express");

const routes = express.Router();
const multer = require("./app/middlewares/multer");
const ClientController = require("./app/controllers/ClientController");
const RecipeController = require("./app/controllers/RecipeController");
const ChefController = require("./app/controllers/ChefController");

// **** SITE **** //
routes.get("/", ClientController.index);
routes.get("/about", ClientController.about);
routes.get("/recipes", ClientController.recipes);
routes.get("/recipes/:index", ClientController.recipe);
routes.get("/chefs", ClientController.chefs);

// **** ADMIN **** //
routes.get("/admin", (req, res) => res.redirect(`/admin/recipes`));

// **** ADMIN => Recipes **** //
routes.get("/admin/recipes", RecipeController.index);
routes.get("/admin/recipes/create", RecipeController.create);
routes.get("/admin/recipes/:id", RecipeController.show);
routes.get("/admin/recipes/:id/edit", RecipeController.edit);
routes.post("/admin/recipes", multer.array("photos", 5), RecipeController.post);
routes.put("/admin/recipes", multer.array("photos", 5), RecipeController.put);
routes.delete("/admin/recipes", RecipeController.delete);

// **** ADMIN => Chefs **** //
routes.get("/admin/chefs", ChefController.index);
routes.get("/admin/chefs/create", ChefController.create);
routes.get("/admin/chefs/:id", ChefController.show);
routes.get("/admin/chefs/:id/edit", ChefController.edit);
routes.post("/admin/chefs", multer.array("photos", 1), ChefController.post);
routes.put("/admin/chefs", multer.array("photos", 1), ChefController.put);
routes.delete("/admin/chefs", ChefController.delete);

// **** NOT-FOUND **** //

routes.use("/admin/chefs", (req, res) =>
  res.status(404).send("Chefs Page Not Found!")
);

routes.use("/admin/recipes", (req, res) =>
  res.status(404).send("Recipes Page Not Found!")
);

routes.use("/admin", (req, res) =>
  res.status(404).send("Admin Page Not Found!")
);

routes.use("/", (req, res) => res.status(404).send("Page Not Found!"));

module.exports = routes;
