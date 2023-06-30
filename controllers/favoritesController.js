import sql from "mssql";
import { config } from "../db/config.js";
import crypto from "crypto";

const pool = new sql.ConnectionPool(config.sql);
await pool.connect();

const checkIfUserExists = async (username) => {
  const user = await pool
    .request()
    .input("username", sql.VarChar, username)
    .query("SELECT * FROM users WHERE username = @username");

  if (user.recordset.length === 0) return false;
  return true;
};

const userOwnsFavoriteAlready = async (notes_id, username) => {
  const favorite = await pool
    .request()
    .input("username", sql.VarChar, username)
    .input("notes_id", sql.VarChar, notes_id)
    .query(
      "SELECT * FROM favorites WHERE notes_id = @notes_id AND username = @username"
    );
  if (favorite.recordset.length > 0) return true;
  return false;
};
// console.log(await userOwnsFavoriteAlready("1d0b6865-40ce-411f-8ba3-a47150ce0a15", "vike"))

export const createFavorite = async (req, res) => {
  const { username, notes_id } = req.params;
  if (await checkIfUserExists(username)) {
    if (await userOwnsFavoriteAlready(notes_id, username))
      return res
        .status(200)
        .json({ message: "You already have these notes in your favorites" });
    try {
      const favoriteId = crypto.randomUUID();
      const createFavorite = await pool
        .request()
        .input("favorite_id", sql.VarChar, favoriteId)
        .input("username", sql.VarChar, username)
        .input("notes_id", sql.VarChar, notes_id)
        .query(
          "INSERT  INTO favorites (favorites_id, username, notes_id) VALUES (@favorite_id, @username, @notes_id)"
        );
      console.log(createFavorite);
      res.status(200).json({ message: "Added to favorites successfully" });
    } catch (e) {
      res.status(500).json(e.message);
    }
  } else {
    res.status(401).json({ message: "Forbidden, user does not exist" });
  }
};

export const getFavoritesForUser = async (req, res) => {
  const { username } = req.params;
  if (await checkIfUserExists(username)) {
    const favorites = await pool
      .request()
      .input("username", sql.VarChar, username)
      .query("SELECT * FROM favorites WHERE username = @username");
    const favoritesArray = favorites.recordset;
    const allFavorites = [];
    for (let i = 0; i < favoritesArray.length; i++) {
      const currentFavorite = await pool
        .request()
        .input("notes_id", sql.VarChar, favoritesArray[i].notes_id)
        .query("SELECT * FROM notes WHERE notes_id = @notes_id");
      const currentFavoriteData = currentFavorite.recordset[0];
      const currentFavoriteId = {
        favorites_id: favoritesArray[i].favorites_id,
      };
      const currentFavoriteFull = Object.assign(
        {},
        currentFavoriteData,
        currentFavoriteId
      );
      allFavorites.push(currentFavoriteFull);
    }
    res.status(200).json(allFavorites);
  } else {
    res.status(401).json({ message: "User does not exist" });
  }
};

export const deleteFavorite = async (req, res) => {
  const { favorite_id } = req.params;
  try {
    const deleteFav = await pool
      .request()
      .input("favorite_id", sql.VarChar, favorite_id)
      .query("DELETE FROM favorites WHERE favorites_id = @favorite_id");
    res.status(200).json({ message: "Removed from favorites successfully" });
  } catch (e) {
    res.status(500).json(e.message);
  }
};
