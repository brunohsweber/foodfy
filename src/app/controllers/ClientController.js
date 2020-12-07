const Chef = require("../models/Chef");
const Recipe = require("../models/Recipe");
const File = require("../models/File");
const { date } = require("../lib/utils");

module.exports = {
  async index(req, res) {
    try {
      const highlights = 6;

      let results = await Recipe.getAll(highlights);
      const recipes = results.rows;

      return res.render("site/index", { recipes });
    } catch (err) {
      throw new Error(err);
    }
  },
  about(req, res) {
    try {
      return res.render("site/about");
    } catch (err) {
      throw new Error(err);
    }
  },
  async recipes(req, res) {
    try {
      let { filter, page, limit } = req.query;

      page = page || 1;
      limit = limit || 6;

      let offset = limit * (page - 1);

      const params = {
        filter,
        page,
        limit,
        offset,
      };

      let results = await Recipe.paginate(params);
      const recipes = results.rows;

      if (recipes == "") {
        return res.render("site/recipes", {
          recipes,
          filter,
          error: "Nenhum registro encontrado",
          results: 0,
        });
      }

      const pagination = {
        total: Math.ceil(recipes.total / limit),
        page,
      };

      return res.render("site/recipes", {
        recipes,
        pagination,
        filter,
        results: recipes.total,
      });
    } catch (err) {
      throw new Error(err);
    }
  },
  async recipe(req, res) {
    try {
      const id = req.params.id;

      let results = await Recipe.findOne(id);
      const recipe = results.rows[0];

      if (!recipe) return res.render("site/not-found");

      results = await File.getImagesRecipe(recipe.id);
      let files = results.rows;

      files = files.map((file) => ({
        id: file.id,
        name: file.name,
        src: `${req.protocol}://${req.headers.host}${file.path.replace(
          "public",
          ""
        )}`,
      }));

      return res.render("site/recipe", { recipe, files });
    } catch (err) {
      throw new Error(err);
    }
  },
  async chefs(req, res) {
    try {
      let results = await Chef.getAll();
      const chefs = results.rows;

      if (chefs == "") {
        return res.render("site/chefs", {
          error: "Nenhum registro encontrado",
        });
      }

      chefs.forEach((chef) => {
        chef.created_at = date(chef.created_at).format;

        chef.avatar_src === null
          ? chef.avatar_src === null
          : (chef.avatar_src = `${req.protocol}://${
              req.headers.host
            }${chef.avatar_src.replace("public", "")}`);
      });

      return res.render("site/chefs", { chefs });
    } catch (err) {
      throw new Error(err);
    }
  },
};
