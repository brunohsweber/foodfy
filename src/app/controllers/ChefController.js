const Chef = require("../models/Chef");
const Recipe = require("../models/Recipe");
const File = require("../models/File");
const { date } = require("../lib/utils");

module.exports = {
  async index(req, res) {
    try {
      let results = await Chef.getAll();
      const chefs = results.rows;

      if (!chefs) {
        return res.send("Chefs not found");
      }

      // Tratamento do path do avatar
      chefs.forEach((chef) => {
        chef.avatar_src === null
          ? chef.avatar_src === null
          : (chef.avatar_src = `${req.protocol}://${
              req.headers.host
            }${chef.avatar_src.replace("public", "")}`);
      });

      return res.render("admin/chefs/index", { chefs });
    } catch (err) {
      throw new Error(err);
    }
  },
  create(req, res) {
    try {
      return res.render("admin/chefs/create");
    } catch (err) {
      throw new Error(err);
    }
  },
  async post(req, res) {
    try {
      const keys = Object.keys(req.body);

      for (key of keys) {
        if (req.body[key] == "") {
          return res.send("Please, fill all fields");
        }
      }

      if (req.files.length == 0) {
        return res.send("Please, send an image");
      }

      let results = await File.create(req.files[0]);
      const fileId = results.rows[0].id;

      results = await Chef.create(req.body, fileId);
      const chefId = results.rows[0].id;

      return res.redirect(`/admin/chefs/${chefId}`);
    } catch (err) {
      throw new Error(err);
    }
  },
  async show(req, res) {
    try {
      const chefId = req.params.id;
      let results = await Chef.findOne(chefId);
      const chef = results.rows[0];

      if (!chef) return res.send("Chef não encontrado!");

      results = await File.getAvatarChef(chef.file_id);
      let file = results.rows[0];

      file = {
        ...file,
        src: file.path,
      };

      file.src === null
        ? file.src === null
        : (file.src = `${req.protocol}://${req.headers.host}${file.src.replace(
            "public",
            ""
          )}`);

      results = await Recipe.getRecipesChef(chefId);
      const recipes = results.rows[0];

      return res.render("admin/chefs/show", { chef, file, recipes });
    } catch (err) {
      throw new Error(err);
    }
  },
  async edit(req, res) {
    try {
      const chefId = req.params.id;
      let results = await Chef.find(chefId);
      const chef = results.rows[0];

      if (!chef) return res.send("Chef não encontrado!");

      results = await Chef.files(chef.file_id);
      const file = results.rows.map((file) => ({
        ...file,
        src: `${req.protocol}://${req.headers.host}${file.path.replace(
          "public",
          ""
        )}`,
      }));

      return res.render("admin/chefs/edit", { chef, file });
    } catch (err) {
      throw new Error(err);
    }
  },
  async put(req, res) {
    try {
      const keys = Object.keys(req.body);

      for (key of keys) {
        if (req.body[key] == "" && key != "removed_files") {
          return res.send("Por favor, preencha todos os campos!");
        }
      }
      const chefId = req.body.id;
      let results = await Chef.find(chefId);
      const chef = results.rows[0];

      if (req.files.length !== 0) {
        await File.delete(chef.file_id);

        results = await File.create(req.files[0]);
        const newFileId = results.rows[0].id;

        await Chef.update(req.body, newFileId);
      } else {
        await Chef.update(req.body, chef.file_id);
      }

      return res.redirect(`/admin/chefs/${chefId}`);
    } catch (err) {
      throw new Error(err);
    }
  },
  async delete(req, res) {
    try {
      const chefId = req.body.id;

      let results = await Chef.find(chefId);
      const chef = results.rows[0];
      const fileId = results.rows[0].file_id;

      if (chef.total_recipes > 0) {
        return res.send(
          "Chefs com receitas cadastradas não podem ser deletados"
        );
      }

      await Chef.delete(chefId);
      await File.delete(fileId);

      return res.redirect(`/admin/chefs`);
    } catch (err) {
      throw new Error(err);
    }
  },
};
