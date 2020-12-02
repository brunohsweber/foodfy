const db = require("../../config/db");
const { date } = require("../lib/utils");

module.exports = {
  // CREATE

  create(data) {
    const query = `
      INSERT INTO recipes (
        chef_id,
        title,
        ingredients,
        preparation,
        information,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `;

    const values = [
      data.chef,
      data.title,
      data.ingredients,
      data.preparation,
      data.information,
      date(Date.now()).iso,
    ];

    return db.query(query, values);
  },

  // READ
  all(hightlights) {
    if (hightlights) {
      return db.query(`
      SELECT recipes.*, 
      chefs.name AS chef_name
      FROM recipes
      LEFT JOIN chefs ON (chefs.id = recipes.chef_id)
      FETCH FIRST ${highlights} ROWS ONLY
      `);
    } else {
      return db.query(`
      SELECT recipes.*, 
      chefs.name AS chef_name
      FROM recipes
      LEFT JOIN chefs ON (chefs.id = recipes.chef_id)
      ORDER BY recipes.title ASC
      `);
    }
  },
  paginate(params) {
    const { filter, limit, offset } = params;

    let query = "",
      filterQuery = "",
      totalQuery = `
        (SELECT count(*) FROM recipes) AS total
        `;

    if (filter) {
      filterQuery = `
      WHERE (recipes.title ILIKE '%${filter}%')
      `;

      totalQuery = `(
        SELECT count(*) FROM recipes
        ${filterQuery}
      ) AS total`;
    }

    query = `
    SELECT recipes.*, 
    chefs.name AS chef_name,
    ${totalQuery}
    FROM recipes
    LEFT JOIN chefs ON (chefs.id = recipes.chef_id)
    ${filterQuery}
    ORDER BY recipes.id ASC
    LIMIT $1 OFFSET $2
    `;

    return db.query(query, [limit, offset]);
  },
  find(id) {
    return db.query(
      `
    SELECT recipes.*,
    chefs.name AS chef_name
    FROM recipes
    LEFT JOIN chefs ON (chefs.id = recipes.chef_id)
    WHERE recipes.id= $1`,
      [id]
    );
  },
  // UPDATE
  update(data) {
    const query = `
    UPDATE recipes
      
    SET
      
      chef_id=($1),
      title=($2),
      ingredients=($3),
      preparation=($4),
      information=($5)

    WHERE id = $6`;

    const values = [
      data.chef,
      data.title,
      data.ingredients,
      data.preparation,
      data.information,
      data.id,
    ];

    return db.query(query, values);
  },
  // DELETE
  delete(id) {
    return db.query(`DELETE FROM recipes WHERE id= $1`, [id]);
  },

  getImagesFiles(recipeId) {
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
  },
};
