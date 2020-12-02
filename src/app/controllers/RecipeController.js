const Recipe = require("../models/Recipe");
const File = require("../models/File");
const RecipeFiles = require("../models/RecipeFiles");
const { date } = require("../lib/utils");
const { version } = require("../../../package.json");
const currentYear = date(Date()).year;
const paramsDefault = {
  currentYear,
  version,
};

module.exports = {
  async index(req, res) {
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
    let recipes = results.rows;

    if (recipes == "") {
      return res.render("admin/recipes/index", {
        filter,
        error: "Nenhum registro encontrado",
        results: 0,
      });
    }

    const pagination = {
      total: Math.ceil(recipes.total / limit),
      page,
    };

    return res.render("admin/recipes/index", {
      recipes,
      pagination,
      filter,
      results: recipes.total,
    });
  },
  async show(req, res) {
    const id = req.params.id;

    let results = await Recipe.find(id);
    const recipe = results.rows[0];

    if (!recipe) return res.send("Receita não encontrada!");

    // Get Recipe Images
    results = await Recipe.getAllImagesFiles(recipe.id);
    let files = results.rows;
    files = files.map((file) => ({
      id: file.id,
      name: file.name,
      src: `${req.protocol}://${req.headers.host}${file.path.replace(
        "public",
        ""
      )}`,
    }));

    return res.render("admin/recipes/show", { recipe, files });
  },
  async create(req, res) {
    try {
      let results = await Recipe.chefsSelectOptions();
      const chefOptions = results.rows;

      return res.render("admin/recipes/create", { chefOptions });
    } catch (err) {
      throw new Error(err);
    }
  },
  async post(req, res) {
    const keys = Object.keys(req.body);

    for (key of keys) {
      if (req.body[key] == "") {
        return res.send("Por favor, preencha todos os campos!");
      }
    }

    if (req.files.length == 0) {
      return res.send("Por favor, envie pelo menos uma imagem!");
    }

    let results = await Recipe.create(req.body);
    const recipeId = results.rows[0].id;

    const filesPromise = req.files.map((file) => File.create(file));

    await Promise.all(filesPromise).then((files) => {
      for (n = 0; n < files.lenght; n++) {
        let filesArray = files[n].rows;
        for (file of filesArray) {
          console.log(file.id);
          RecipeFiles.create(recipeId, file.id);
        }
      }
    });

    return res.redirect(`/admin/recipes/${recipeId}`);
  },
  async edit(req, res) {
    let results = await Recipe.find(req.params.id);
    const recipe = results.rows[0];

    if (!recipe) return res.send("Recipe not found!");

    // Get Chefs Options
    results = await Recipe.chefsSelectOptions();
    const chefOptions = results.rows;

    // Get Recipe Images
    results = await Recipe.getImages(recipe.id);
    let files = results.rows;
    files = files.map((file) => ({
      ...file,
      src: `${req.protocol}://${req.headers.host}${file.path.replace(
        "public",
        ""
      )}`,
    }));

    return res.render("admin/recipes/edit", {
      recipe,
      chefOptions,
      files,
    });
  },
  async put(req, res) {
    const keys = Object.keys(req.body);

    for (key of keys) {
      if (req.body[key] == "" && key != "removed_files") {
        return res.send("Please, fill all fields");
      }
    }

    if (req.files.length != 0) {
      const newFilesPromise = req.files.map((file) =>
        File.create({ ...file, product_id: req.body.id })
      );

      await Promise.all(newFilesPromise);
    }

    if (req.body.removed_files) {
      // 1,2,3,
      const removedFiles = req.body.removed_files.split(","); // [1,2,3,]
      const lastIndex = removedFiles.length - 1;
      removedFiles.splice(lastIndex, 1); // [1,2,3]

      const removedFilesPromise = removedFiles.map((id) => File.delete(id));

      await Promise.all(removedFilesPromise);
    }

    await Recipe.update(req.body);

    return res.redirect(`/admin/recipes/${req.body.id}`);
  },
  async delete(req, res) {
    await Recipe.delete(req.body.id);

    return res.redirect(`/admin/recipes`);
  },
};
