const db = require("../../config/db");
const { date } = require("../lib/utils");

module.exports = {
  // Buscar todos os chefs
  all() {
    return db.query(
      `
    SELECT chefs.*,
    count(recipes) as total_recipes,
    files.path as avatar_src
    FROM chefs
    LEFT JOIN recipes ON (chefs.id = recipes.chef_id)
    LEFT JOIN files ON (chefs.file_id = files.id)
    GROUP BY chefs.id, files.id
    `
    );
  },

  // Select de chefs para cadastrar receitas
  selectOptions() {
    return db.query(`SELECT id, name FROM chefs`);
  },

  // Encontrar um chef
  find(id) {
    return db.query(
      `
    SELECT chefs.*,
    count(recipes) as total_recipes
    FROM chefs
    LEFT JOIN recipes ON (chefs.id = recipes.chef_id)
    WHERE chefs.id= $1
    GROUP BY chefs.id`,
      [id]
    );
  },

  // Encontrar o avatar do chef
  files(id) {
    return db.query(` SELECT * from files WHERE id = $1 `, [id]);
  },

  // Encontrar as receitas do chef
  recipes(id) {
    return db.query(
      `
    SELECT recipes.*,
    chefs.name AS chef_name
    FROM recipes
    LEFT JOIN chefs ON (chefs.id = recipes.chef_id)
    WHERE recipes.chef_id=$1`,
      [id]
    );
  },

  // Criar o chef
  create(data, fileId) {
    const query = `
      INSERT INTO chefs (
        file_id,
        name,
        created_at
      ) VALUES ($1, $2, $3)
      RETURNING id`;

    const values = [fileId, data.name, date(Date.now()).iso];

    return db.query(query, values);
  },

  // Atualizar o chef
  update(data, fileId) {
    const query = `
    UPDATE chefs 
    SET
      
      file_id=($1),
      name=($2)

    WHERE id = $3
    `;

    const values = [fileId, data.name, data.id];

    return db.query(query, values);
  },

  // Deletar o chef
  delete(id) {
    return db.query(`DELETE FROM chefs WHERE id= $1`, [id]);
  },
};
