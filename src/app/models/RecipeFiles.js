const db = require("../../config/db");
const fs = require("fs");

module.exports = {
  create(recipeId, fileId) {
    try {
      const query = `

      INSERT INTO recipes_files (
        recipe_id,
        file_id
      ) 
      VALUES ($1, $2)
  
      `;

      const values = [recipeId, fileId];

      return db.query(query, values);
    } catch (err) {
      throw new Error(`Database Error! => ${err}`);
    }
  },
  async delete(fileId) {
    try {
      const result = await db.query(
        `SELECT * FROM recipes_files WHERE id = $1`,
        [fileId]
      );
      const file = result.rows[0];

      fs.unlinkSync(file.path);

      return db.query(`DELETE FROM recipes_files WHERE id=$1`, [fileId]);
    } catch (err) {
      throw new Error(`Database Error! => ${err}`);
    }
  },
};
