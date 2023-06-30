import crypto from "crypto";
import sql from "mssql";
import { config } from "../db/config.js";
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
// console.log(await checkIfUserExists("gracebaker"))
// console.log(await checkIfUserExists("sdlfksdlfjdlskjfdl"))

export const getNotes = async (req, res) => {
  try {
    const notes = await pool
      .request()
      .query("SELECT * FROM notes ORDER BY dateCreated DESC");
    if (notes.recordset.length == 0) {
      res.status(204).json({ message: "No notes were found at this time" });
    } else {
      res.status(200).json(notes.recordset);
    }
  } catch (error) {
    res.status(400).json({
      message: "An error was encountered while attempting this operation",
    });
  }
};

export const getNote = async (req, res) => {
  let { notesID } = req.params;
  try {
    const note = await pool
      .request()
      .input("noteID", sql.VarChar, notesID)
      .query("SELECT * FROM notes WHERE notes_id = @noteID");
    if (note.recordset.length === 0) {
      res.status(404).json({ message: "Notes not found" });
    } else {
      res.status(200).json(note.recordset[0]);
    }
  } catch (error) {
    res.status(400).json({
      message: "An error was encountered while trying to retrieve that note",
    });
  }
};

export const createNote = async (req, res) => {
  const { username } = req.params;
  const userExists = await checkIfUserExists(username);
  if (userExists) {
    const notes_id = crypto.randomUUID();
    try {
      const { title, synopsis, body } = req.body;
      const newNote = await pool
        .request()
        .input("notes_id", sql.VarChar, notes_id)
        .input("username", sql.VarChar, username)
        .input("title", sql.VarChar, title)
        .input("synopsis", sql.VarChar, synopsis)
        .input("body", sql.VarChar, body)
        .query(
          "INSERT INTO notes (notes_id, username, title, synopsis, body) VALUES (@notes_id, @username, @title, @synopsis, @body)"
        );

      res.status(200).json({ message: "New note created successfuly" });
    } catch (error) {
      res.status(400).json({ message: `${error.message}` });
    }
  } else {
    res.status(403).json({ message: `${username} does not exist` });
  }
};

export const updateNote = async (req, res) => {
  const { username, noteId } = req.params;

  const userExists = await checkIfUserExists(username);
  if (userExists) {
    try {
      const note = await pool
        .request()
        .input("noteId", sql.VarChar, noteId)
        .query("SELECT * FROM notes WHERE notes_id = @noteID");
      if (note.recordset.length === 0)
        return res.status(404).json({ message: "Not found" });
      const { title, synopsis, body } = req.body;
      const updateNote = await pool
        .request()
        .input("noteId", sql.VarChar, noteId)
        .input("title", sql.VarChar, title)
        .input("synopsis", sql.VarChar, synopsis)
        .input("body", sql.VarChar, body)
        .query(
          "UPDATE notes SET title = @title, synopsis = @synopsis, body = @body, lastUpdated = CURRENT_TIMESTAMP WHERE notes_id = @noteId"
        );
      res.status(200).json({ message: "Notes updated successful" });
    } catch (e) {
      res.json(e.message);
    }
  } else {
    return res.status(404).json({ message: "User does not exist" });
  }
};

export const deleteNote = async (req, res) => {
  const { username, noteId } = req.params;
  const userExists = await checkIfUserExists(username);
  if (!userExists)
    return res.status(404).json({ message: "User does not exist" });
  try {
    const deleteNotes = await pool
      .request()
      .input("username", sql.VarChar, username)
      .input("notes_id", sql.VarChar, noteId)
      .query(
        "DELETE FROM notes WHERE username = @username AND notes_id = @notes_id"
      );
    res.status(200).json({ message: "Delete done successfully" });
  } catch (e) {
    res.status(500).json(e.message);
  }
};

export const getNotesByUser = async (req, res) => {
  const { username } = req.params;
  if (await checkIfUserExists(username)) {
    try {
      const notesForUser = await pool
        .request()
        .input("username", sql.VarChar, username)
        .query("SELECT * FROM notes WHERE username = @username");
      if (notesForUser.recordset.length === 0) {
        res.status(404).json([]);
      } else {
        res.status(200).json(notesForUser.recordset);
      }
    } catch (e) {
      res.json(e.message);
    }
  } else {
    res.status(404).json({ message: `User does not exist` });
  }
};

export const getSpecificNoteByUser = (req, res) => {
  // res.send("Get a single note by a user");
  // 4fd9e500-83ec-4171-96ac-e34f9ae7dbf3
};
