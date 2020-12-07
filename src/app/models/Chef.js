const db = require("../../config/db");
const { date } = require("../lib/utils");

module.exports = {
  getAll() {
    try {
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
    } catch (err) {
      throw new Error(`Database Error! => ${err}`);
    }
  },
  selectOptions() {
    try {
      return db.query(`SELECT id, name FROM chefs`);
    } catch (err) {
      throw new Error(`Database Error! => ${err}`);
    }
  },
  findOne(chefId) {
    try {
      return db.query(
        `
      SELECT chefs.*,
      count(recipes) as total_recipes,
      files.path as avatar_src
      FROM chefs
      LEFT JOIN recipes ON (chefs.id = recipes.chef_id)
      LEFT JOIN files ON (chefs.file_id = files.id)
      WHERE chefs.id= $1
      GROUP BY chefs.id, files.id`,
        [chefId]
      );
    } catch (err) {
      throw new Error(`Database Error! => ${err}`);
    }
  },
  create(data, fileId) {
    try {
      const query = `
      INSERT INTO chefs (
        file_id,
        name,
        created_at
      ) VALUES ($1, $2, $3)
      RETURNING id`;

      const values = [fileId, data.name, date(Date.now()).iso];

      return db.query(query, values);
    } catch (err) {
      throw new Error(`Database Error! => ${err}`);
    }
  },
  update(data, fileId) {
    try {
      const query = `
      UPDATE chefs 
      SET
        
        file_id=($1),
        name=($2)
  
      WHERE id = $3
      `;

      const values = [fileId, data.name, data.id];

      return db.query(query, values);
    } catch (err) {
      throw new Error(`Database Error! => ${err}`);
    }
  },
  delete(chefId) {
    try {
      return db.query(`DELETE FROM chefs WHERE id= $1`, [chefId]);
    } catch (err) {
      throw new Error(`Database Error! => ${err}`);
    }
  },
};
