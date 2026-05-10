-- ======================================================
-- Campus Guild TaskFlow 初始化数据脚本
-- 适配 H2 数据库，完全匹配项目自动生成的表结构
-- ======================================================

-- 清空旧数据（可选，开发环境使用）
DELETE FROM tasks;
DELETE FROM users;

-- 插入用户数据
INSERT INTO users (username, password_hash, nickname, guild_level, points, experience, created_at, updated_at)
VALUES
('admin', '123456', '系统管理员', 10, 9999, 9999, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('student01', '123456', '张三', 3, 520, 360, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('student02', '123456', '李四', 2, 380, 210, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('student03', '123456', '王五', 4, 690, 550, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 插入任务数据
INSERT INTO tasks (title, description, category, reward, views, status, publisher_id, created_at, updated_at)
VALUES
('代取快递送到宿舍', '南门快递站取件，送到1栋宿舍楼下', '代拿代送', 30, 12, 'PENDING', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Java面向对象作业辅导', '讲解继承、多态、接口知识点', '学习辅导', 50, 8, 'PENDING', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('求借一本计算机网络教材', '借用一周，可付积分', '物品借用', 20, 25, 'IN_PROGRESS', 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('帮忙组装电脑主机', '会装机即可，积分重谢', '技术求助', 80, 16, 'COMPLETED', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);