const db = require("../../config/db");
const fs = require("fs");
const { update } = require("./Chef");

module.exports = {
  create(data) {
    try {
      const query = `

      INSERT INTO files (
        name,
        path
      ) 
      
      VALUES ($1, $2)

      RETURNING id

      `;

      const values = [data.filename, data.path];

      return db.query(query, values);
    } catch (err) {
      throw new Error(`Database Error! => ${err}`);
    }
  },
  async delete(fileId) {
    try {
      const result = await db.query(`SELECT * FROM files WHERE id = $1`, [
        fileId,
      ]);
      const file = result.rows[0];

      fs.unlinkSync(file.path);

      return db.query(`DELETE FROM files WHERE id=$1`, [id]);
    } catch (err) {
      throw new Error(`Database Error! => ${err}`);
    }
  },
  getImagesRecipe(recipeId) {
    try {
      return db.query(
        `
      SELECT 
        files.id,
        files.name, 
        files.path
  
      FROM files
  
      LEFT JOIN recipes_files ON (files.id = recipes_files.file_id)
      LEFT JOIN recipes ON (recipes.id = recipes_files.recipe_id)
  
      WHERE recipes.id = ${recipeId}
  
      `
      );
    } catch (err) {
      throw new Error(`Database Error! => ${err}`);
    }
  },
  getAvatarChef(fileId) {
    try {
      return db.query(` SELECT * from files WHERE id = $1 `, [fileId]);
    } catch (err) {
      throw new Error(`Database Error! => ${err}`);
    }
  },
  // Função abaixo não utilizada
  async createRecipeFiles({ filename, path, recipe_id }) {
    try {
      let query = `

      INSERT INTO files (
        name,
        path
      ) 
      
      VALUES ($1, $2)
      
      RETURNING id
        
      `;

      let values = [filename, path];

      const results = await db.query(query, values);
      const fileId = results.rows[0].id;

      query = `
      
      INSERT INTO recipes_files (
        recipe_id,
        file_id
      ) 
      
      VALUES ($1, $2) 
      
      RETURNING id
      
      `;

      values = [recipe_id, fileId];

      return db.query(query, values);
    } catch (err) {
      throw new Error(`Database Error! => ${err}`);
    }
  },
};
