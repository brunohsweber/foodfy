const db = require("../../config/db");
const { date } = require("../lib/utils");

module.exports = {
  create(data) {
    try {
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
    } catch (err) {
      throw new Error(`Database Error! => ${err}`);
    }
  },
  getAll(highlights) {
    try {
      if (highlights) {
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
    } catch (err) {
      throw new Error(`Database Error! => ${err}`);
    }
  },
  paginate(params) {
    try {
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
    } catch (err) {
      throw new Error(`Database Error! => ${err}`);
    }
  },
  findOne(recipeId) {
    try {
      return db.query(
        `
      SELECT recipes.*,
      chefs.name AS chef_name
      FROM recipes
      LEFT JOIN chefs ON (chefs.id = recipes.chef_id)
      WHERE recipes.id= $1`,
        [recipeId]
      );
    } catch (err) {
      throw new Error(`Database Error! => ${err}`);
    }
  },
  getRecipesChef(chefId) {
    try {
      return db.query(
        `
      SELECT recipes.*,
      chefs.name AS chef_name
      FROM recipes
      LEFT JOIN chefs ON (chefs.id = recipes.chef_id)
      WHERE recipes.chef_id=$1`,
        [chefId]
      );
    } catch (err) {
      throw new Error(`Database Error! => ${err}`);
    }
  },
  update(data) {
    try {
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
    } catch (err) {
      throw new Error(`Database Error! => ${err}`);
    }
  },
  delete(recipeId) {
    try {
      return db.query(`DELETE FROM recipes WHERE id= $1`, [recipeId]);
    } catch (err) {
      throw new Error(`Database Error! => ${err}`);
    }
  },
};
