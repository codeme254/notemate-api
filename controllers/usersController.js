// import the sql object from the 'mssql' module/library
import sql from "mssql";
import { config } from "../db/config.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const pool = new sql.ConnectionPool(config.sql);
await pool.connect();
const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSalt = config.jwtSalt;

export const getAllUsers = async (req, res) => {
  try {
    // establishing a connection to the sql server using the sql object and configuration provided in config.sql
    // config object holds a property named sql qhich holds neccessary details for connecting sql server db
    // let pool = await sql.connect(config.sql);
    const users = await pool.request().query("SELECT * FROM users");
    if (users.recordsets[0].length === 0) {
      res.status(404).json({ error: "No users found." });
    } else {
      res.status(200).json(users.recordsets[0]);
    }
  } catch (e) {
    res
      .status(400)
      .json({ error: "an error occured while trying this operaton" });
  } finally {
    sql.close();
  }
};

export const getUser = async (req, res) => {
  try {
    // get the username
    const { username } = req.params;
    // let pool = await sql.connect(config.sql);
    const user = await pool
      .request()
      .input("username", sql.VarChar, username)
      .query("SELECT * FROM users WHERE username = @username");
    if (user.recordset.length === 0) {
      res
        .status(400)
        .json({ message: `there is no user with the username ${username}` });
    } else {
      res.status(200).json(user.recordset[0]);
      return user.recordset[0];
    }
  } catch (e) {
    res.status(400).json({
      error: "an error occured while trying to get the user, please try again",
    });
  } finally {
    sql.close();
  }
};

const checkIfUserExists = async (username) => {
  try {
    // let pool = await sql.connect(config.sql);
    const user = await pool
      .request()
      .input("username", sql.VarChar, username)
      .query("SELECT * FROM users WHERE username = @username");
    if (user.recordset.length === 0) {
      return false;
    } else {
      return true;
    }
  } finally {
    sql.close();
  }
};

// console.log(await checkIfUserExists("avawhite"))
// console.log(await checkIfUserExists("avawhitessssss"))

const checkIfEmailIsTaken = async (emailAddress) => {
  try {
    // let pool = await sql.connect(config.sql);
    const user = await pool
      .request()
      .input("emailAddress", sql.VarChar, emailAddress)
      .query("SELECT * FROM users WHERE emailAddress = @emailAddress");
    if (user.recordset.length === 0) {
      console.log(`${emailAddress} is not taken`);
      return false;
    } else {
      console.log(`${emailAddress} is already taken`);
      return true;
    }
  } finally {
    sql.close();
  }
};

// console.log(await checkIfEmailIsTaken("ava.white@example.com"))
// console.log(await checkIfEmailIsTaken("ava.sssssssswhite@example.com"))

export const createUser = async (req, res) => {
  try {
    let { firstName, lastName, emailAddress, username, password } = req.body;
    const userExists = await checkIfUserExists(username);
    const emailExists = await checkIfEmailIsTaken(emailAddress);
    if (userExists) {
      res.status(400).json({
        message: "Username already taken, please try a different one",
      });
    } else if (emailExists) {
      res.status(400).json({
        message: `${emailAddress} is already taken, please try a different email address`,
      });
    } else {
      // let pool = await sql.connect(config.sql);
      password = bcrypt.hashSync(password, bcryptSalt);
      const creatUser = pool
        .request()
        .input("firstName", sql.VarChar, firstName)
        .input("lastName", sql.VarChar, lastName)
        .input("emailAddress", sql.VarChar, emailAddress)
        .input("username", sql.VarChar, username)
        .input("password", sql.VarChar, password)
        .query(
          "INSERT INTO users (firstName, lastName, emailAddress, username, password) VALUES (@firstName, @lastName, @emailAddress, @username, @password)"
        );
      res
        .status(201)
        .json({ message: `Account for ${firstName} created successfuly` });
    }
  } catch (e) {
    res
      .status(400)
      .json({ message: "an error occured when creating the user" });
  } finally {
    sql.close();
  }
};

const getUserInformation = async (username) => {
  try {
    const user = await pool
      .request()
      .input("username", sql.VarChar, username)
      .query("SELECT * FROM users WHERE username = @username");
    return user.recordset[0];
  } catch (e) {
    console.log(e.message);
  }
};
// console.log(await getUserInformation('vike'))

export const editUserInformation = async (req, res) => {
  const { username } = req.params;
  // return res.send(username)
  try {
    // check if the user to be updated indeed exists
    const userExists = await checkIfUserExists(username);
    if (userExists) {
      const currentUserInformation = await getUserInformation(username);
      const { firstName, lastName, emailAddress, password } = req.body;
      const newEmailExists = await checkIfEmailIsTaken(emailAddress);
      if (newEmailExists) {
        res.status(409).json({ message: "Email address already taken" });
        return;
      }

      const update = pool
        .request()
        .input("firstName", sql.VarChar, firstName)
        .input("lastName", sql.VarChar, lastName)
        .input("emailAddress", sql.VarChar, emailAddress)
        .input("username", sql.VarChar, username)
        .query(
          "UPDATE users SET firstName = @firstName, lastName = @lastName, emailAddress = @emailAddress WHERE username = @username"
        );
      res
        .status(200)
        .json({ message: `Information about ${username} has been updated` });
    } else {
      res
        .status(404)
        .json({ message: `There is no user with the username ${username}` });
    }
  } catch (e) {
    res.status(400).json(e.message);
  } finally {
    sql.close();
  }
};

export const deleteUserInformation = async (req, res) => {
  const { username } = req.params;

  try {
    const userExists = await checkIfUserExists(username);
    if (userExists) {
      const deleteUser = await pool
        .request()
        .input("username", sql.VarChar, username)
        .query("DELETE FROM users WHERE username = @username");
      res.status(200).json({ message: "account deleted successfully" });
    } else {
      res
        .status(404)
        .json({ message: `User with username ${username} does not exist` });
    }
  } catch (e) {
    res
      .json(400)
      .json({ message: "An error occured while attempting to delete" });
  } finally {
    sql.close();
  }
};

export const login = async (req, res) => {
  let { username, password } = req.body;
  const userExists = await checkIfUserExists(username);
  if (userExists) {
    try {
      const user = await pool
        .request()
        .input("username", sql.VarChar, username)
        .input("password", sql.VarChar, password)
        .query("SELECT * FROM users WHERE username = @username");
      // res.send(user.recordset[0])
      if (user.recordset[0]) {
        const userLoggingIn = user.recordset[0];
        const passwordHash = userLoggingIn.password;
        if (bcrypt.compareSync(password, passwordHash)) {
          // sign with jwt
          jwt.sign(
            {
              username,
              firstName: userLoggingIn.firstName,
              lastName: userLoggingIn.lastName,
            },
            jwtSalt,
            {},
            (err, token) => {
              if (err) throw err;
              res.cookie("token", token).json(username);
            }
          );
          // res.status(200).json({ message: "Logged in successfully"})
        } else {
          res.status(404).json({ message: "Wrong username or password" });
        }
      } else {
        res.status(400).json({ message: "Wrong username or password" });
      }
    } catch (e) {
      res.json(e.message);
    }
  } else {
    res.status(400).json({ message: "NO user with that username" });
  }
};

export const profile = async (req, res) => {
  const { token } = req.cookies;
  if (!token) {
    // console.log("No token provided")
    return res.status(401).json({ error: "Token not provided" });
  }
  jwt.verify(token, jwtSalt, {}, (err, info) => {
    if (err) {
      // console.log("Invalid token")
      return res.status(401).json({ error: "Invalid token" });
    }
    // console.log(info);
    res.json(info);
  });
};

export const logout = (req, res) => {
  res.cookie("token", null).json({ message: "Logged out successfully" });
};
