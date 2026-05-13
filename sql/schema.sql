-- ======================================================
-- Campus Guild TaskFlow 数据库建表脚本
-- 生成日期: 2026-05-04
-- 兼容: H2 (开发) / MySQL (生产)
-- ======================================================

-- -------------------------
-- 1. 用户表
-- -------------------------
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nickname VARCHAR(20) NOT NULL,
    guild_level INT NOT NULL DEFAULT 1,
    points INT NOT NULL DEFAULT 0,
    experience INT NOT NULL DEFAULT 0,
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    banned BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uk_users_username UNIQUE (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------
-- 2. 任务表
-- -------------------------
CREATE TABLE IF NOT EXISTS tasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(20),
    reward INT NOT NULL,
    views INT NOT NULL DEFAULT 0,
    deadline TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    publisher_id BIGINT NOT NULL,
    accepter_id BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_tasks_publisher FOREIGN KEY (publisher_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_tasks_accepter FOREIGN KEY (accepter_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_tasks_status CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------
-- 3. 索引优化
-- -------------------------
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_publisher ON tasks(publisher_id);
CREATE INDEX idx_tasks_accepter ON tasks(accepter_id);
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);
CREATE INDEX idx_tasks_deadline ON tasks(deadline);
CREATE INDEX idx_users_guild_level ON users(guild_level);

-- ======================================================
-- H2 兼容版本 (去除AUTO_INCREMENT和ENGINE)
-- ======================================================
-- DROP TABLE IF EXISTS tasks;
-- DROP TABLE IF EXISTS users;
--
-- CREATE TABLE users (
--     id BIGINT AUTO_INCREMENT PRIMARY KEY,
--     username VARCHAR(50) NOT NULL UNIQUE,
--     password_hash VARCHAR(255) NOT NULL,
--     nickname VARCHAR(20) NOT NULL,
--     guild_level INT NOT NULL DEFAULT 1,
--     points INT NOT NULL DEFAULT 0,
--     experience INT NOT NULL DEFAULT 0,
--     role VARCHAR(20) NOT NULL DEFAULT 'USER',
--     banned BOOLEAN NOT NULL DEFAULT FALSE,
--     created_at TIMESTAMP NOT NULL,
--     updated_at TIMESTAMP NOT NULL
-- );
--
-- CREATE TABLE tasks (
--     id BIGINT AUTO_INCREMENT PRIMARY KEY,
--     title VARCHAR(100) NOT NULL,
--     description TEXT,
--     reward INT NOT NULL,
--     status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
--     publisher_id BIGINT NOT NULL,
--     accepter_id BIGINT,
--     created_at TIMESTAMP NOT NULL,
--     updated_at TIMESTAMP NOT NULL,
--     FOREIGN KEY (publisher_id) REFERENCES users(id),
--     FOREIGN KEY (accepter_id) REFERENCES users(id)
-- );