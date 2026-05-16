-- ======================================================
-- Campus Guild TaskFlow 完整初始化脚本
-- 适配 H2 数据库，包含：初始化数据 + 增删改查示例
-- ======================================================

-- 1. 清空旧数据（安全顺序，避免外键冲突）
DELETE FROM tasks;
DELETE FROM users;

-- 初始化用户数据
INSERT INTO USERS (ID, USERNAME, NICKNAME, PASSWORD_HASH, POINTS, EXPERIENCE, GUILD_LEVEL, CREATED_AT, UPDATED_AT)
VALUES
(1, 'admin', '管理员', '21232f297a57a5a743894a0e4a801fc3', 1000, 500, 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'user2', '张三', 'e10adc3949ba59abbe56e057f20f883e', 300, 150, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'user3', '李四', 'e10adc3949ba59abbe56e057f20f883e', 250, 120, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 'user4', '王五', 'e10adc3949ba59abbe56e057f20f883e', 400, 200, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 'user5', '赵六', 'e10adc3949ba59abbe56e057f20f883e', 180, 90, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(6, 'user6', '孙七', 'e10adc3949ba59abbe56e057f20f883e', 150, 70, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 初始化任务数据（完全匹配你的 TASKS 表结构）
INSERT INTO TASKS (
    TITLE, DESCRIPTION, CATEGORY, REWARD, VIEWS, STATUS,
    PUBLISHER_ID, ACCEPTER_ID, DEADLINE, CREATED_AT, UPDATED_AT
)
VALUES
-- 代拿代送
('代取快递送到宿舍', '南门快递站取件，送到1栋宿舍楼下', '代拿代送', 30, 12, 'PENDING', 2, NULL, DATEADD(DAY, 1, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('帮忙买早餐送到教室', '豆浆+包子，7:30前送到教学楼', '代拿代送', 20, 18, 'PENDING', 3, NULL, DATEADD(HOUR, 12, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('代买奶茶送到图书馆', '指定店铺，常温少糖', '代拿代送', 15, 24, 'PENDING', 1, NULL, DATEADD(HOUR, 6, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- 学习辅导
('Java面向对象作业辅导', '讲解继承、多态、接口知识点', '学习辅导', 50, 8, 'PENDING', 3, NULL, DATEADD(DAY, 3, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('数据库SQL语句讲解', '增删改查基础与练习', '学习辅导', 45, 14, 'IN_PROGRESS', 4, 1, DATEADD(DAY, 2, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Python爬虫基础答疑', '新手入门指导', '学习辅导', 60, 22, 'PENDING', 5, NULL, DATEADD(DAY, 4, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- 物品借用
('求借计算机网络教材', '借用一周，可付积分', '物品借用', 20, 25, 'IN_PROGRESS', 4, 2, DATEADD(DAY, 7, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('求借充电宝', '借用两小时', '物品借用', 10, 30, 'COMPLETED', 2, 3, DATEADD(HOUR, 2, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- 技术求助
('帮忙组装电脑主机', '会装机即可，积分重谢', '技术求助', 80, 16, 'COMPLETED', 2, 4, DATEADD(DAY, 5, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('PS图片简单处理', '裁剪+调色', '技术求助', 35, 9, 'PENDING', 6, NULL, DATEADD(HOUR, 24, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('安装开发环境配置', 'JDK+IDEA+MySQL配置', '技术求助', 70, 11, 'PENDING', 3, NULL, DATEADD(DAY, 3, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ======================================================
-- 以下是 增删改查 示例语句（可单独运行）
-- ======================================================

-- ====================== 查询 ======================
-- 查询所有用户
SELECT * FROM users;

-- 查询所有任务
SELECT * FROM tasks;

-- 根据状态查询任务（待处理）
SELECT * FROM tasks WHERE status = 'PENDING';

-- 根据分类查询
SELECT * FROM tasks WHERE category = '学习辅导';

-- 查询积分大于500的用户
SELECT * FROM users WHERE points > 500;

-- ====================== 新增（已修复：补全非空字段） ======================
-- 新增用户（必须带 created_at、updated_at）
INSERT INTO users (username, password_hash, nickname, guild_level, points, experience, created_at, updated_at)
VALUES ('test', '123456', '测试用户', 1, 100, 50, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 新增任务（必须带 created_at、updated_at）
INSERT INTO tasks (title, description, category, reward, status, publisher_id, created_at, updated_at)
VALUES ('测试任务', '这是一条测试任务', '其他', 15, 'PENDING', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ====================== 修改 ======================
-- 修改用户积分
UPDATE users SET points = 666 WHERE id = 2;

-- 修改任务状态
UPDATE tasks SET status = 'COMPLETED' WHERE id = 1;

-- 修改任务奖励
UPDATE tasks SET reward = 40 WHERE title = '代取快递送到宿舍';

-- ====================== 删除 ======================
-- 删除指定任务（如果不存在不会报错）
DELETE FROM tasks WHERE id = 99;

-- 删除状态为已完成的任务
DELETE FROM tasks WHERE status = 'COMPLETED';

-- 删除指定用户
DELETE FROM users WHERE username = 'test';