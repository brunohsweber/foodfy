const Recipe = require("../models/Recipe");
const Chef = require("../models/Chef");
const { date } = require("../lib/utils");
const { version } = require("../../../package.json");
const currentYear = date(Date()).year;
const info = {
  currentYear,
  version,
};

module.exports = {
  async index(req, res) {
    const highlights = 6;

    let results = await Recipe.index(highlights);
    const recipes = results.rows;

    return res.render("site/index", { recipes });
  },
  about(req, res) {
    return res.render("site/about");
  },
  async recipes(req, res) {
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
  },
  async recipe(req, res) {
    const id = req.params.index;

    let results = await Recipe.find(id);
    const recipe = results.rows[0];

    if (!recipe) return res.render("site/not-found");

    return res.render("site/recipe", { recipe });
  },
  async chefs(req, res) {
    let results = await Chef.all();
    const chefs = results.rows;

    if (chefs == "") {
      return res.render("site/chefs", {
        error: "Nenhum registro encontrado",
      });
    }

    chefs.forEach((chef) => {
      chef.created_at = date(chef.created_at).format;
    });

    return res.render("site/chefs", { chefs });
  },
};
