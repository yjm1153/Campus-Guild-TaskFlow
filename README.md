# Campus Guild TaskFlow

校园碎片化需求的"公会制"任务调度与信息管理系统

## 项目简介

Campus Guild TaskFlow 是一个校园任务平台，采用"公会制" gamification 模式：
- 用户注册后成为公会冒险者
- 发布任务需支付积分作为悬赏
- 其他用户接取任务并完成，获得积分奖励
- 积分可升级公会等级（新手→见习→冒险者→精英→勇士→骑士→领主→传奇）

## 技术栈

| 层级 | 技术 |
|------|------|
| 后端 | Spring Boot 3.2.5 (Java 17, Maven) |
| 前端 | 原生 HTML/JS/CSS + esbuild 打包 |
| 数据库 | H2 (开发) / MySQL (生产) |
| 安全 | JWT Token 认证 |
| API文档 | SpringDoc OpenAPI (Swagger) |

## 快速启动

### 前置要求

- Java 17+
- Node.js 18+ (用于前端构建)

### 1. 启动后端

```bash
# Windows
cd server
set JWT_SECRET=your_base64_secret_key_here
.\mvnw.cmd spring-boot:run

# Linux/macOS
cd server
export JWT_SECRET=your_base64_secret_key_here
./mvnw spring-boot:run
```

后端地址：`http://localhost:8080`

### 2. 启动前端

```bash
# 构建 JS bundle
cd ui
npx esbuild js/app.js --outfile=js/bundle.js --minify

# 启动静态服务器
npx serve . -p 3000
```

前端地址：`http://localhost:3000`

### 3. 访问应用

浏览器打开 `http://localhost:3000`

## 功能模块

### 用户系统
- 注册/登录（JWT Token 认证）
- 个人信息（积分、等级、任务统计）
- 登出

### 任务大厅
- 浏览所有待接取任务
- 分类筛选（代拿代送、技术求助、学习辅导、二手交易、其他）
- 关键词搜索
- 分页加载

### 任务详情
- 查看任务信息（标题、描述、分类、悬赏、发布者）
- 接取任务（仅非发布者）
- 确认完成（仅发布者）
- 取消任务（仅发布者，可退还积分）

### 发布悬赏
- 填写任务信息（标题、描述、分类、悬赏积分）
- 发布时扣除积分
- 等待他人接取

### 个人中心
- 查看我发布的任务
- 查看我接取的任务

### 管理员功能
- 系统统计面板（用户总数、任务总数、各状态任务数量）
- 用户管理（分页查看、封禁/解封，管理员不可被封禁）
- 任务管理（分页查看、按状态筛选、删除任务）
- 默认管理员账号：`admin` / `admin123`（首次启动自动创建）

## 任务状态流转

```
待接取 → (有人接取) → 进行中 → (确认完成) → 已完成
                ↘ (取消) → 已取消
```

积分规则：
- 发布任务：扣除悬赏积分
- 完成任务：积分转给接取者
- 取消任务：积分退还给发布者

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/auth/register | 注册 |
| POST | /api/auth/login | 登录 |
| POST | /api/auth/logout | 登出 |
| GET | /api/auth/me | 获取当前用户信息 |
| GET | /api/tasks | 浏览任务列表 |
| GET | /api/tasks/{id} | 任务详情 |
| POST | /api/tasks | 发布任务 |
| POST | /api/tasks/{id}/accept | 接取任务 |
| POST | /api/tasks/{id}/complete | 确认完成 |
| POST | /api/tasks/{id}/cancel | 取消任务 |
| GET | /api/tasks/my/published | 我发布的任务 |
| GET | /api/tasks/my/accepted | 我接取的任务 |
| GET | /api/admin/stats | 系统统计 |
| GET | /api/admin/users | 用户列表（分页） |
| PUT | /api/admin/users/{id}/ban | 封禁用户 |
| PUT | /api/admin/users/{id}/unban | 解封用户 |
| GET | /api/admin/tasks | 任务列表（分页+筛选） |
| DELETE | /api/admin/tasks/{id} | 删除任务 |

## 开发工具

### H2 数据库控制台

访问 `http://localhost:8080/h2-console`

- JDBC URL: `jdbc:h2:file:./data/campusguild`
- 用户名: `sa`
- 密码: (空)

### Swagger API 文档

访问 `http://localhost:8080/swagger-ui.html`

### 运行测试

```bash
cd server
.\mvnw.cmd test
```

## 项目结构

```
Campus-Guild-TaskFlow/
├── server/                    # Spring Boot 后端
│   └── src/main/java/...
│       ├── config/          # 配置类
│       ├── controller/     # REST API
│       ├── service/       # 业务逻辑
│       ├── model/         # 数据模型
│       └── repository/    # 数据访问
│
├── ui/                      # 前端
│   ├── index.html          # 入口页面
│   ├── js/
│   │   ├── app.js        # 主应用代码
│   │   └── bundle.js     # esbuild 输出
│   └── css/
│       └── style.css     # 样式
│
├── data/                    # H2 数据库文件
│   └── campusguild.mv.db
│
└── README.md
```

## 配置说明

### application.yml

```yaml
spring:
  profiles.active: dev    # dev | prod
  datasource:
    url: jdbc:h2:file:./data/campusguild
```

### 生产环境

切换到 MySQL：

1. 修改 `application.yml` 中 `profiles.active: prod`
2. 设置环境变量：
   ```bash
   export DB_PASSWORD=your_password
   export JWT_SECRET=your_secret
   ```

## 常见问题

### 前端构建命令

不要使用 `--bundle` 标志：
```bash
# 错误（会导致函数作用域问题）
npx esbuild js/app.js --bundle --outfile=js/bundle.js --minify

# 正确
npx esbuild js/app.js --outfile=js/bundle.js --minify
```

### 状态值说明

后端返回中文状态值：
- `待接取` - 任务可被接取
- `进行中` - 已被接取，等待确认
- `已完成` - 已完成
- `已取消` - 已取消

### 数据库升级后启动报错

如果出现 `Column "BANNED" not found` 或 `NULL not allowed` 错误，原因是旧数据库缺少新字段。
删除旧的 H2 数据库文件后重启即可：

```bash
del server\data\campusguild.mv.db
del server\data\campusguild.trace.db
```

## 许可证

MIT