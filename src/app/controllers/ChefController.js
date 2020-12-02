const Chef = require("../models/Chef");
const File = require("../models/File");
const { date } = require("../lib/utils");
const { version } = require("../../../package.json");
const currentYear = date(Date()).year;
const paramsDefault = {
  currentYear,
  version,
};

module.exports = {
  async index(req, res) {
    try {
      let results = await Chef.all();
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
      throw `Database Error! => ${err}`;
    }
  },
  create(req, res) {
    return res.render("admin/chefs/create");
  },
  async post(req, res) {
    const keys = Object.keys(req.body);

    for (key of keys) {
      if (req.body[key] == "") {
        return res.send("Please, fill all fields");
      }
    }

    if (req.files.length == 0) {
      return res.send("Please, send an image");
    }

    try {
      let results = await File.create(req.files[0]);
      const fileId = results.rows[0].id;

      results = await Chef.create(req.body, fileId);
      const chefId = results.rows[0].id;

      return res.redirect(`/admin/chefs/${chefId}`);
    } catch (err) {
      throw `Database Error! => ${err}`;
    }
  },
  async show(req, res) {
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

      results = await Chef.recipes(chefId);
      const recipes = results.rows[0];

      return res.render("admin/chefs/show", { chef, file, recipes });
    } catch (err) {
      throw `Database Error! => ${err}`;
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
      throw `Database Error! => ${err}`;
    }
  },
  async put(req, res) {
    const keys = Object.keys(req.body);

    for (key of keys) {
      if (req.body[key] == "" && key != "removed_files") {
        return res.send("Por favor, preencha todos os campos!");
      }
    }

    try {
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
      throw `Database Error! => ${err}`;
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
      throw `Database Error! => ${err}`;
    }
  },
};
