const db = require("../../config/db");
const fs = require("fs");

module.exports = {
  create(recipeId, fileId) {
    const query = `

    INSERT INTO recipes_files (
      recipe_id,
      file_id
    ) 
    VALUES ($1, $2)

    `;

    const values = [recipeId, fileId];

    return db.query(query, values);
  },
  async delete(id) {
    try {
      const result = await db.query(
        `SELECT * FROM recipes_files WHERE id = $1`,
        [id]
      );
      const file = result.rows[0];

      fs.unlinkSync(file.path);

      return db.query(`DELETE FROM recipes_files WHERE id=$1`, [id]);
    } catch (err) {
      console.error(err);
    }
  },
};
