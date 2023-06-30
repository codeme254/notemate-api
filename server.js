import express from "express";
import { config } from "./db/config.js";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import notesRoutes from "./routes/notesRoutes.js";
import favoritesRoutes from "./routes/favoritesRoutes.js";

const app = express();

app.use(bodyParser.json());
// app.use((req, res, next) => {
//   res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
//   res.setHeader('Access-Control-Allow-Credentials', 'true');
//   next();
// });

app.use(
  cors({
    credentials: true,
    origin: "https://thankful-river-084704d0f.3.azurestaticapps.net",
  })
);
app.use(cookieParser());

// ROUTES
// User routes
userRoutes(app);
notesRoutes(app);
favoritesRoutes(app);

const _PORT = config.port || 5000
app.listen(_PORT, () => {
  console.log(`Server is running on port ${_PORT}`);
});
