# Campus Guild TaskFlow — 前端接口文档

## 后端信息

- **基础地址：** `http://localhost:8080`
- **请求头：** `Content-Type: application/json`
- **当前状态：** 开发阶段，后端正在搭建中

## 接口列表

| 方法 | 路径 | 功能 |
|------|------|------|
| POST | `/api/auth/register` | 注册 |
| POST | `/api/auth/login` | 登录 |
| POST | `/api/tasks?userId={id}` | 发布悬赏 |
| GET | `/api/tasks?page=0&pageSize=10` | 浏览看板 |
| POST | `/api/tasks/{id}/accept?userId={id}` | 接取任务 |
| POST | `/api/tasks/{id}/complete?userId={id}` | 确认完成 |

## 开发建议

1. 先按 `api.md` 的请求/响应格式，在 Qt 中用 `QNetworkAccessManager` 写 HTTP 调用代码
2. 数据可以先写死 Mock，等后端跑通后直接换 URL
3. 有问题随时沟通
