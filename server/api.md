# Campus Guild TaskFlow — API 接口文档

**基础地址：** `http://localhost:8080`  
**请求头：** `Content-Type: application/json`

---

## 1. 注册

```
POST /api/auth/register
```

**请求体：**
```json
{
  "username": "alice",
  "password": "123456",
  "nickname": "爱丽丝"
}
```

**响应：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "username": "alice",
    "nickname": "爱丽丝",
    "guildLevel": 1,
    "points": 0,
    "experience": 0
  }
}
```

---

## 2. 登录

```
POST /api/auth/login
```

**请求体：**
```json
{
  "username": "alice",
  "password": "123456"
}
```

**响应：** 同上，返回用户信息。

---

## 3. 发布任务

```
POST /api/tasks?userId=1
```

**请求体：**
```json
{
  "title": "代拿快递到宿舍",
  "description": "菜鸟驿站取件",
  "reward": 20
}
```

**响应：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "title": "代拿快递到宿舍",
    "description": "菜鸟驿站取件",
    "reward": 20,
    "status": "待接取",
    "publisherId": 1,
    "publisherNickname": "爱丽丝",
    "accepterId": null,
    "accepterNickname": null,
    "createdAt": "2026-04-29T19:30:00"
  }
}
```

---

## 4. 浏览任务看板

```
GET /api/tasks?page=0&pageSize=10&keyword=快递
```

| 参数 | 说明 | 默认值 |
|------|------|--------|
| page | 页码（从 0 开始） | 0 |
| pageSize | 每页条数 | 10 |
| keyword | 关键词搜索（可选） | — |

**响应：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [ ...任务列表... ],
    "page": 0,
    "pageSize": 10,
    "total": 1
  }
}
```

---

## 5. 接取任务

```
POST /api/tasks/{taskId}/accept?userId=2
```

**说明：** 不能接自己发布的任务，已被接取的任务不能再接。

---

## 6. 确认完成任务

```
POST /api/tasks/{taskId}/complete?userId=1
```

**说明：** 仅**发布者**可以确认完成。确认后接单者获得积分+经验。

---

## 通用响应格式

**成功：**
```json
{ "code": 200, "message": "success", "data": ... }
```

**失败：**
```json
{ "code": 400, "message": "错误描述", "data": null }
```

| code | 说明 |
|------|------|
| 200 | 成功 |
| 400 | 业务错误（积分不足、任务已接取等） |
| 500 | 服务器内部错误 |
