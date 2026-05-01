# Campus Guild TaskFlow 🎮

面向校园碎片化需求的"公会制"任务调度与信息管理系统。

将 RPG 冒险者公会模式引入校园互助场景：发布悬赏 → 接取任务 → 结算积分，让互助变得有趣且有回报。

## 技术栈

| 层级 | 技术 |
|------|------|
| 后端 | Java 17 + Spring Boot 3.2 + Spring Data JPA |
| 数据库 | H2（开发） / MySQL（生产） |
| 前端 | Qt / C++（进行中） |
| 构建 | Maven |

## 项目结构

```
server/               # 后端服务
├── api.md            # 前端接口文档
├── pom.xml           # Maven 依赖配置
├── mvnw.cmd          # Maven Wrapper（无需全局安装Maven）
└── src/main/java/com/campusguild/server/
    ├── CampusGuildApplication.java   # 启动入口
    ├── controller/                    # REST API 层
    ├── service/                       # 业务逻辑层
    ├── repository/                    # 数据访问层
    ├── model/                         # 实体、DTO、枚举
    ├── common/                        # 统一响应格式
    ├── config/                        # 跨域等配置
    └── exception/                     # 全局异常处理

sql/                  # 数据库建表脚本
docs/                 # 项目文档
```

## 快速开始

```bash
# 1. 启动后端
cd server
./mvnw.cmd spring-boot:run

# 2. 访问 API（服务运行在 localhost:8080）
curl http://localhost:8080/api/tasks
```

H2 控制台：`http://localhost:8080/h2-console`

## API 一览

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/register` | 注册 |
| POST | `/api/auth/login` | 登录 |
| POST | `/api/tasks` | 发布悬赏 |
| GET | `/api/tasks` | 浏览看板 |
| POST | `/api/tasks/{id}/accept` | 接取任务 |
| POST | `/api/tasks/{id}/complete` | 确认完成 |

详细接口文档见 [server/api.md](server/api.md)

## 开发团队

- 后端：刘同学
- 前端：（待补充）
- 数据库：（待补充）
