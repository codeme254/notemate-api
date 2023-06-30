import {
  createFavorite,
  getFavoritesForUser,
  deleteFavorite,
} from "../controllers/favoritesController.js";

const favoritesRoutes = (app) => {
  app.route("/favorites/:username/all").get(getFavoritesForUser);
  app.route("/:username/:notes_id/favorites/new").post(createFavorite);
  app.route("/favorites/:favorite_id/delete").delete(deleteFavorite);
};

export default favoritesRoutes;
