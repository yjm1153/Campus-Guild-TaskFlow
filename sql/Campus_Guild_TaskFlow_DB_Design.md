# Campus Guild TaskFlow 数据库设计文档

> **生成日期**: 2026-05-11  
> **兼容环境**: H2 (开发) / MySQL (生产)  
> **文档版本**: v1.0

---

## 目录

- [一、用户表 (users)](#一用户表-users)
- [二、任务表 (tasks)](#二任务表-tasks)
- [三、数据库兼容性说明](#三数据库兼容性说明)
- [四、ER 关系图](#四er-关系图)
- [五、索引设计说明](#五索引设计说明)

---

## 一、用户表 (users)

存储系统注册用户的基本信息、等级积分及权限角色。

### 1.1 字段定义

| 字段名 | 数据类型 | 约束条件 | 默认值 | 字段说明 |
|:---|:---|:---|:---|:---|
| `id` | `BIGINT` | `PRIMARY KEY`, `AUTO_INCREMENT` | 自增 | 用户唯一标识，系统内部主键 |
| `username` | `VARCHAR(50)` | `NOT NULL`, `UNIQUE` | - | 用户名，登录账号，全局唯一 |
| `password_hash` | `VARCHAR(255)` | `NOT NULL` | - | 密码哈希值，存储加密后的密码 |
| `nickname` | `VARCHAR(20)` | `NOT NULL` | - | 用户昵称，显示名称 |
| `guild_level` | `INT` | `NOT NULL` | `1` | 公会等级，影响权限和任务接取范围 |
| `points` | `INT` | `NOT NULL` | `0` | 积分，可用于兑换奖励或发布任务 |
| `experience` | `INT` | `NOT NULL` | `0` | 经验值，累计完成任务获得，用于升级 |
| `role` | `VARCHAR(20)` | `NOT NULL` | `'USER'` | 角色权限，枚举值：USER / ADMIN / MODERATOR |
| `banned` | `BOOLEAN` | `NOT NULL` | `FALSE` | 封禁状态，TRUE 表示账号被禁用 |
| `created_at` | `TIMESTAMP` | `NOT NULL` | `CURRENT_TIMESTAMP` | 账号创建时间，自动记录 |
| `updated_at` | `TIMESTAMP` | `NOT NULL` | `CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP` | 最后更新时间，自动维护 |

### 1.2 约束与索引

| 类型 | 名称 | 字段 | 说明 |
|:---|:---|:---|:---|
| 主键 | `PRIMARY` | `id` | 用户唯一标识 |
| 唯一键 | `uk_users_username` | `username` | 用户名全局唯一，防止重复注册 |
| 普通索引 | `idx_users_guild_level` | `guild_level` | 加速按公会等级的查询和排序 |

### 1.3 字段详细说明

#### `guild_level` — 公会等级

| 等级值 | 含义 | 任务权限 |
|:---|:---|:---|
| `1` | 新手 | 只能接取 1 级任务 |
| `2-5` | 普通成员 | 可接取对应等级及以下的任务 |
| `6-10` | 资深成员 | 可发布任务，无等级限制接取 |
| `10+` | 核心成员 | 可审核任务，拥有管理权限 |

#### `role` — 角色权限

| 角色值 | 权限说明 |
|:---|:---|
| `USER` | 普通用户，可接取和发布任务 |
| `MODERATOR` | 版主，可审核任务和处理举报 |
| `ADMIN` | 管理员，拥有全部系统权限 |

---

## 二、任务表 (tasks)

存储用户发布的任务信息，包含任务内容、奖励、状态及关联人员。

### 2.1 字段定义

| 字段名 | 数据类型 | 约束条件 | 默认值 | 字段说明 |
|:---|:---|:---|:---|:---|
| `id` | `BIGINT` | `PRIMARY KEY`, `AUTO_INCREMENT` | 自增 | 任务唯一标识 |
| `title` | `VARCHAR(100)` | `NOT NULL` | - | 任务标题，简明描述任务内容 |
| `description` | `TEXT` | 可空 | - | 任务详细描述，支持长文本 |
| `category` | `VARCHAR(20)` | 可空 | - | 任务分类，如：学习/生活/技术/活动 |
| `reward` | `INT` | `NOT NULL` | - | 任务奖励积分，完成后发放给接受者 |
| `views` | `INT` | `NOT NULL` | `0` | 浏览次数，每被查看一次累加 |
| `deadline` | `TIMESTAMP` | 可空 | - | 任务截止时间，过期后自动失效 |
| `status` | `VARCHAR(20)` | `NOT NULL`, `CHECK` | `'PENDING'` | 任务状态，受 CHECK 约束限制枚举值 |
| `publisher_id` | `BIGINT` | `NOT NULL`, `FOREIGN KEY` | - | 发布者 ID，关联 users.id |
| `accepter_id` | `BIGINT` | 可空, `FOREIGN KEY` | `NULL` | 接受者 ID，关联 users.id，未接受时为 NULL |
| `created_at` | `TIMESTAMP` | `NOT NULL` | `CURRENT_TIMESTAMP` | 任务创建时间 |
| `updated_at` | `TIMESTAMP` | `NOT NULL` | `CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP` | 任务最后更新时间 |

### 2.2 状态枚举值

| 状态值 | 说明 | 可转移状态 |
|:---|:---|:---|
| `PENDING` | 待接受，已发布但无人接取 | `IN_PROGRESS`, `CANCELLED` |
| `IN_PROGRESS` | 进行中，已被用户接取 | `COMPLETED`, `CANCELLED` |
| `COMPLETED` | 已完成，奖励已结算 | -（终态） |
| `CANCELLED` | 已取消，发布者主动撤销或超时 | -（终态） |

### 2.3 外键关系

| 字段名 | 关联表 | 关联字段 | 删除行为 | 说明 |
|:---|:---|:---|:---|:---|
| `publisher_id` | `users` | `id` | `ON DELETE RESTRICT` | 禁止删除仍有任务发布的用户 |
| `accepter_id` | `users` | `id` | `ON DELETE SET NULL` | 接受者注销账号时，任务回归待接受状态 |

### 2.4 索引设计

| 索引名 | 字段 | 索引类型 | 用途说明 |
|:---|:---|:---|:---|
| `idx_tasks_status` | `status` | 普通索引 | 按状态筛选任务（如查询所有待接受任务） |
| `idx_tasks_publisher` | `publisher_id` | 普通索引 | 查询某用户发布的所有任务 |
| `idx_tasks_accepter` | `accepter_id` | 普通索引 | 查询某用户接受的所有任务 |
| `idx_tasks_created_at` | `created_at DESC` | 普通索引（降序） | 按发布时间倒序展示任务列表 |
| `idx_tasks_deadline` | `deadline` | 普通索引 | 查询即将截止的任务，用于超时提醒 |

---

## 三、数据库兼容性说明

### 3.1 MySQL（生产环境）

```sql
-- 完整语法，支持所有特性
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ...
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

| 特性 | 支持情况 | 版本要求 |
|:---|:---|:---|
| `AUTO_INCREMENT` | ✅ 完全支持 | 所有版本 |
| `ENGINE=InnoDB` | ✅ 完全支持 | 所有版本 |
| `CHARSET=utf8mb4` | ✅ 完全支持 | 5.5.3+ |
| `ON UPDATE CURRENT_TIMESTAMP` | ✅ 完全支持 | 5.6.5+ |
| `CHECK` 约束 | ⚠️ 语法支持但忽略 | < 8.0.16 |
| `CHECK` 约束 | ✅ 强制执行 | ≥ 8.0.16 |
| `BOOLEAN` 类型 | ✅ 映射为 `TINYINT(1)` | 所有版本 |

### 3.2 H2（开发环境）

```sql
-- 简化语法，去除 MySQL 特有语法
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ...
);
```

| 特性 | 支持情况 | 替代方案 |
|:---|:---|:---|
| `AUTO_INCREMENT` | ✅ 支持 | - |
| `ENGINE=InnoDB` | ❌ 不支持 | 直接省略 |
| `CHARSET=utf8mb4` | ❌ 不支持 | 直接省略 |
| `ON UPDATE CURRENT_TIMESTAMP` | ❌ 不支持 | 应用层更新或使用触发器 |
| `CHECK` 约束 | ✅ 支持 | - |
| `BOOLEAN` | ✅ 支持 | - |
| `ON DELETE RESTRICT` | ✅ 支持 | - |
| `ON DELETE SET NULL` | ✅ 支持 | - |

### 3.3 迁移注意事项

1. **时间戳自动更新**：H2 不支持 `ON UPDATE CURRENT_TIMESTAMP`，需在应用层或触发器中实现
2. **字符集**：H2 默认使用 UTF-8，无需显式指定 `utf8mb4`
3. **CHECK 约束**：若使用 MySQL < 8.0.16，建议在应用层校验 `status` 枚举值
4. **存储引擎**：H2 无存储引擎概念，建表时去除 `ENGINE=InnoDB`

---

## 四、ER 关系图

```
┌─────────────────────┐         ┌─────────────────────┐
│       users         │         │       tasks         │
├─────────────────────┤         ├─────────────────────┤
│ PK  id              │◄────────┤ FK  publisher_id    │
│     username        │    1:N  │     title           │
│     password_hash   │         │     description     │
│     nickname        │         │     category        │
│     guild_level     │◄────────┤ FK  accepter_id     │
│     points          │    1:1  │     reward          │
│     experience      │  (可空) │     views           │
│     role            │         │     deadline        │
│     banned          │         │     status          │
│     created_at      │         │     created_at      │
│     updated_at      │         │     updated_at      │
└─────────────────────┘         └─────────────────────┘
```

### 关系说明

| 关系 | 类型 | 说明 |
|:---|:---|:---|
| `users` → `tasks` (publisher) | 一对多 (1:N) | 一个用户可以发布多个任务 |
| `users` → `tasks` (accepter) | 一对一 (1:1，可空) | 一个任务同一时间只能被一个用户接受 |

---

## 五、索引设计说明

### 5.1 索引选择原则

| 原则 | 应用 |
|:---|:---|
| **WHERE 条件字段** | `status`、`publisher_id`、`accepter_id` 经常用于筛选 |
| **ORDER BY 字段** | `created_at DESC` 用于任务列表排序 |
| **时间范围查询** | `deadline` 用于截止提醒和超时处理 |
| **外键字段** | 自动建议加索引，加速关联查询 |

### 5.2 查询场景覆盖

| 业务场景 | SQL 条件 | 使用索引 |
|:---|:---|:---|
| 查看任务广场 | `WHERE status = 'PENDING' ORDER BY created_at DESC` | `idx_tasks_status` + `idx_tasks_created_at` |
| 我的发布 | `WHERE publisher_id = ?` | `idx_tasks_publisher` |
| 我的接取 | `WHERE accepter_id = ?` | `idx_tasks_accepter` |
| 即将截止 | `WHERE deadline < NOW() AND status != 'COMPLETED'` | `idx_tasks_deadline` + `idx_tasks_status` |
| 同等级用户 | `WHERE guild_level = ?` | `idx_users_guild_level` |

---

## 六、建表脚本

### 6.1 MySQL 版本（生产）

```sql
-- ======================================================
-- Campus Guild TaskFlow - MySQL 建表脚本
-- ======================================================

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
    CONSTRAINT chk_tasks_status CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 索引
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_publisher ON tasks(publisher_id);
CREATE INDEX idx_tasks_accepter ON tasks(accepter_id);
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);
CREATE INDEX idx_tasks_deadline ON tasks(deadline);
CREATE INDEX idx_users_guild_level ON users(guild_level);
```

### 6.2 H2 版本（开发）

```sql
-- ======================================================
-- Campus Guild TaskFlow - H2 建表脚本
-- ======================================================

DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
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
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tasks (
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
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (publisher_id) REFERENCES users(id),
    FOREIGN KEY (accepter_id) REFERENCES users(id)
);


-- 索引
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_publisher ON tasks(publisher_id);
CREATE INDEX idx_tasks_accepter ON tasks(accepter_id);
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);
CREATE INDEX idx_tasks_deadline ON tasks(deadline);
CREATE INDEX idx_users_guild_level ON users(guild_level);
```

---

## 附录：字段变更记录

| 版本 | 日期 | 变更内容 | 变更人 |
|:---|:---|:---|:---|
| v1.0 | 2026-05-11 | 初始版本，创建 users 和 tasks 表 | - |

---

