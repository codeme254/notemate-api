CREATE DATABASE notemate;
USE notemate;

-- a table for storing the notes,
-- username, title, synopsis, claps, body, dateCreated, lastUpdated

CREATE TABLE notes (
	notes_id VARCHAR(90) UNIQUE NOT NULL,
	username VARCHAR(50) NOT NULL,
	title VARCHAR(80) NOT NULL,
	synopsis VARCHAR(500) NOT NULL, 
	body VARCHAR(5000) NOT NULL,
	claps INT DEFAULT 2,
	dateCreated DATETIME DEFAULT GETDATE(),
	lastUpdated DATETIME DEFAULT GETDATE(),
	FOREIGN KEY (username) REFERENCES users (username)
);

-- A table for storing all the users
CREATE TABLE users(
	firstName VARCHAR(50) NOT NULL,
	lastName VARCHAR(50) NOT NULL,
	emailAddress VARCHAR(50) NOT NULL,
	username VARCHAR(50) PRIMARY KEY NOT NULL,
	password VARCHAR(20) NOT NULL,
	joinedOn DATETIME DEFAULT GETDATE()
);

INSERT INTO users (firstName, lastName, emailAddress, username, password)


VALUES
    ('John', 'Doe', 'john.doe@example.com', 'johndoe', 'password1'),
    ('Jane', 'Smith', 'jane.smith@example.com', 'janesmith', 'password2'),
    ('Michael', 'Johnson', 'michael.johnson@example.com', 'michaeljohnson', 'password3'),
    ('Emily', 'Brown', 'emily.brown@example.com', 'emilybrown', 'password4'),
    ('William', 'Taylor', 'william.taylor@example.com', 'williamtaylor', 'password5'),
    ('Olivia', 'Miller', 'olivia.miller@example.com', 'oliviamiller', 'password6'),
    ('James', 'Anderson', 'james.anderson@example.com', 'jamesanderson', 'password7'),
    ('Sophia', 'Thomas', 'sophia.thomas@example.com', 'sophiathomas', 'password8'),
    ('Benjamin', 'Jackson', 'benjamin.jackson@example.com', 'benjaminjackson', 'password9'),
    ('Ava', 'White', 'ava.white@example.com', 'avawhite', 'password10'),
    ('Liam', 'Harris', 'liam.harris@example.com', 'liamharris', 'password11'),
    ('Mia', 'Martin', 'mia.martin@example.com', 'miamartin', 'password12'),
    ('Ethan', 'Clark', 'ethan.clark@example.com', 'ethanclark', 'password13'),
    ('Isabella', 'Lewis', 'isabella.lewis@example.com', 'isabellalewis', 'password14'),
    ('Noah', 'Lee', 'noah.lee@example.com', 'noahlee', 'password15'),
    ('Emma', 'Walker', 'emma.walker@example.com', 'emmawalker', 'password16'),
    ('Jacob', 'Turner', 'jacob.turner@example.com', 'jacobturner', 'password17'),
    ('Sophie', 'Hill', 'sophie.hill@example.com', 'sophiehill', 'password18'),
    ('Alexander', 'Wright', 'alexander.wright@example.com', 'alexanderwright', 'password19'),
    ('Grace', 'Baker', 'grace.baker@example.com', 'gracebaker', 'password20');

-- GET ALL USERS
SELECT * FROM users;

use notemate
ALTER TABLE users
ALTER COLUMN password VARCHAR(255);

-- username, title, synopsis, claps, body, dateCreated, lastUpdated



INSERT INTO notes (username, title, synopsis, body) VALUES ('gracebaker', 'running sql in azure', 'explores how to run sql in azure', 'running sql in azure is great');
INSERT INTO notes (username, title, synopsis, body) VALUES ('sophiehill', 'How to fix your bicycle', 'Learning how simple it can be to fix your bicycle', 'Fixing a bicycle is very easy, you will need the follwing equipments');



SELECT * FROM notes;

CREATE TABLE favorites (
  favorites_id VARCHAR(90) UNIQUE NOT NULL,
  username VARCHAR(50),
  notes_id VARCHAR(90),
  FOREIGN KEY (username) REFERENCES users(username),
  FOREIGN KEY (notes_id) REFERENCES notes(notes_id)
);

SELECT * FROM favorites;


