二、系统设计.md
# 校园公会任务流系统 系统设计
## 一、系统架构
本系统采用**前后端分离架构**，整体分为三层，各层职责清晰、低耦合，确保系统可扩展性与可维护性：
1.  前端层：基于HTML/JavaScript/CSS实现用户交互界面，通过esbuild进行打包优化，减小资源体积、提升加载速度，最终部署于GitHub Pages，支持PC端与移动端双适配。
2.  后端服务层：基于Spring Boot开发RESTful接口，采用Controller/Service/Mapper分层架构，Controller层负责接收前端请求、返回响应结果，Service层封装核心业务逻辑，Mapper层负责与数据库交互，实现前后端解耦。
3.  数据持久层：通过MyBatis操作MySQL数据库，负责用户信息、公会信息、任务信息等数据的持久化存储，简化SQL编写，提升数据库操作效率。
## 二、项目整体目录结构
```plaintext
Campus-Guild-TaskFlow/
├── server/ \# Spring Boot 后端项目
│ ├── config/ \# 全局配置类（权限、数据库、JWT等）
│ ├── controller/ \# 接口控制层
│ ├── service/ \# 业务逻辑层
│ ├── model/ \# 实体类（User、Guild、Task等）
│ ├── mapper/ \# 数据库交互层
│ └── resources/ \# 配置文件与SQL文件
├── ui/ \# 前端项目
│ ├── index.html \# 系统首页入口
│ ├── css/ \# 全局样式文件
│ ├── js/ \# 前端交互逻辑
│ └── bundle.js \# esbuild打包压缩文件
├── sql/ \# 数据库建表脚本
├── .github/workflows/ \# 自动化部署配置文件
└── README.md \# 项目说明文档
```
## 三、模块设计
系统按功能划分为6个核心模块，模块间职责清晰、低耦合，便于开发与维护：
| 模块名称 | 核心职责 |
|----------|----------|
| 用户与权限管理模块 | 用户注册/登录、角色管理、公会成员管理、JWT权限校验 |
| 任务管理模块 | 任务CRUD、任务分配、状态流转、提交与审核功能 |
| 数据统计模块 | 任务进度统计、成员完成率统计、任务状态分布统计 |
| 前端交互模块 | 页面渲染、用户交互、与后端接口通信、静态资源构建与部署 |
| 数据库模块 | 数据持久化、数据表管理、SQL脚本维护 |
| 自动化部署模块 | 代码提交检测、前端自动打包、静态资源自动发布上线 |
## 四、数据库设计
### （一）E-R图
核心实体：用户（User）、公会（Guild）、任务（Task）
- 用户与公会：多对多关系（一个用户可加入多个公会，一个公会包含多个用户）
- 用户与任务：一对多关系（一个用户可接收多个任务，一个任务对应一个负责人）
- 公会与任务：一对多关系（一个公会可创建多个任务，一个任务属于一个公会）
### （二）主要数据表设计
#### 1. 用户表（user）
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | BIGINT | 主键，用户ID |
| username | VARCHAR(50) | 用户名，唯一 |
| password | VARCHAR(100) | 加密后的密码 |
| real_name | VARCHAR(30) | 用户真实姓名 |
| role | VARCHAR(20) | 角色（admin/member） |
| create_time | DATETIME | 创建时间 |
#### 2. 公会表（guild）
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | BIGINT | 主键，公会ID |
| name | VARCHAR(100) | 公会名称 |
| admin_id | BIGINT | 管理员ID，关联user.id |
| guild_desc | TEXT | 公会简介描述 |
| create_time | DATETIME | 创建时间 |
#### 3. 任务表（task）
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | BIGINT | 主键，任务ID |
| guild_id | BIGINT | 所属公会ID，关联guild.id |
| title | VARCHAR(100) | 任务标题 |
| description | TEXT | 任务描述 |
| assigner_id | BIGINT | 分配人ID，关联user.id |
| receiver_id | BIGINT | 接收人ID，关联user.id |
| status | VARCHAR(20) | 任务状态（待分配/执行中/已提交/已审核/已驳回） |
| deadline | DATETIME | 截止时间 |
| submit_time | DATETIME | 提交时间 |
| audit_opinion | TEXT | 管理员审核驳回意见 |