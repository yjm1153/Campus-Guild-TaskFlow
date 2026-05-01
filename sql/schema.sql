-- =============================================
-- Campus Guild TaskFlow - 数据库建表脚本
-- 适用数据库: MySQL 8.0+
-- =============================================

CREATE DATABASE IF NOT EXISTS campus_guild
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE campus_guild;

-- ----------------------------
-- 用户表
-- ----------------------------
CREATE TABLE IF NOT EXISTS users (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    username     VARCHAR(50)  NOT NULL UNIQUE COMMENT '登录名',
    password_hash VARCHAR(255) NOT NULL COMMENT '格式: salt$hashedPassword',
    nickname     VARCHAR(20)  NOT NULL COMMENT '公会昵称',
    guild_level  INT          NOT NULL DEFAULT 1 COMMENT '公会等级',
    points       INT          NOT NULL DEFAULT 0 COMMENT '积分余额',
    experience   INT          NOT NULL DEFAULT 0 COMMENT '经验值',
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- ----------------------------
-- 任务表
-- ----------------------------
CREATE TABLE IF NOT EXISTS tasks (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    title        VARCHAR(100) NOT NULL COMMENT '任务标题',
    description  TEXT         COMMENT '任务描述',
    reward       INT          NOT NULL COMMENT '悬赏积分',
    status       VARCHAR(20)  NOT NULL DEFAULT 'PENDING' COMMENT '状态: PENDING/IN_PROGRESS/COMPLETED',
    publisher_id BIGINT       NOT NULL COMMENT '发布者ID',
    accepter_id  BIGINT       COMMENT '接单者ID',
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_status (status),
    INDEX idx_publisher (publisher_id),
    INDEX idx_accepter (accepter_id),

    CONSTRAINT fk_task_publisher FOREIGN KEY (publisher_id) REFERENCES users(id),
    CONSTRAINT fk_task_accepter  FOREIGN KEY (accepter_id)  REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='任务表';
