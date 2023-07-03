import {
  getAllUsers,
  getUser,
  createUser,
  editUserInformation,
  deleteUserInformation,
  login,
  profile,
  logout
} from "../controllers/usersController.js";
const userRoutes = (app) => {
  app.route("/users").get(getAllUsers).post(createUser);

  app
    .route("/users/:username")
    .get(getUser)
    .put(editUserInformation)
    .delete(deleteUserInformation);

  app.route("/users/auth/login").post(login);
  app.route("/users/auth/logout").post(logout);

  app.route("/profile").get(profile);
};

export default userRoutes;
