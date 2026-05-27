-- Create the etodo database
CREATE DATABASE IF NOT EXISTS etodo;
USE etodo;

-- Create user table
CREATE TABLE IF NOT EXISTS user (
  id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  firstname VARCHAR(100) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create todo table
CREATE TABLE IF NOT EXISTS todo (
  id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  due_time DATETIME NOT NULL,
  status ENUM('not started', 'todo', 'in progress', 'done') DEFAULT 'not started' NOT NULL,
  user_id INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);