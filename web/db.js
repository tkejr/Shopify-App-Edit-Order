import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";
dotenv.config();
console.log("process.env.DATABASE_URL", process.env.DATABASE_URL);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const getUserPreferences = async (userId) => {
  try {
    const query = {
      text: `SELECT * FROM custom_preferences WHERE user_id = $1`,
      values: [userId],
    };

    const result = await pool.query(query);

    if (result.rows.length === 0) {
      return null; // User ID not found
    }

    return result.rows[0];
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    throw error;
  }
};

const updateUserPreference = async (userId, timeToEdit, enable) => {
  try {
    let updateQuery = "";
    let queryParams = [];
    let returningColumns = "*";

    if (timeToEdit !== undefined) {
      updateQuery += "time_to_edit = $1";
      queryParams.push(timeToEdit);
    }

    if (enable !== undefined) {
      if (queryParams.length > 0) updateQuery += ", ";
      updateQuery += "enable = $" + (queryParams.length + 1);
      queryParams.push(enable);
    }

    if (queryParams.length === 0) {
      return null; // No valid update data provided
    }

    const query = {
      text: `UPDATE custom_preferences SET ${updateQuery} WHERE user_id = $${
        queryParams.length + 1
      } RETURNING ${returningColumns}`,
      values: [...queryParams, userId],
    };

    const result = await pool.query(query);

    if (result.rows.length === 0) {
      return null; // User ID not found
    }

    return result.rows[0];
  } catch (error) {
    console.error("Error updating preference:", error);
    throw error;
  }
};

const getUserIdByUrl = async (userUrl) => {
  try {
    const query = {
      text: "SELECT id FROM users WHERE url = $1",
      values: [userUrl],
    };

    const result = await pool.query(query);

    if (result.rows.length === 0) {
      return null; // User with given URL not found
    }

    return result.rows[0].id;
  } catch (error) {
    console.error("Error getting user ID by URL:", error);
    throw error;
  }
};

const addUser = async (url, accessToken) => {
  try {
    const query = {
      text: "INSERT INTO users (url, access_token) VALUES ($1, $2) RETURNING id",
      values: [url, accessToken],
    };

    const result = await pool.query(query);

    if (result.rows.length === 0) {
      return null; // Error occurred while adding user
    }
    const userId = result.rows[0].id;

    await addUserPreference(userId, 900, false);

    return result.rows[0].id;
  } catch (error) {
    console.error("Error adding user:", error);
    throw error;
  }
};

const addUserPreference = async (userId, timeToEdit, enable) => {
  try {
    const query = {
      text: "INSERT INTO custom_preferences (user_id, time_to_edit, enable) VALUES ($1, $2, $3) RETURNING *",
      values: [userId, timeToEdit, enable],
    };

    const result = await pool.query(query);

    if (result.rows.length === 0) {
      return null; // Error occurred while adding user preference
    }

    return result.rows[0];
  } catch (error) {
    console.error("Error adding user preference:", error);
    throw error;
  }
};

export {
  updateUserPreference,
  getUserIdByUrl,
  addUser,
  addUserPreference,
  getUserPreferences,
};
