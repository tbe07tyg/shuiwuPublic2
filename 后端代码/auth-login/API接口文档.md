# 🔐 登录认证API接口文档

## 📋 接口概览

| 序号 | 接口名称 | 请求方式 | 接口地址 | 说明 |
|------|----------|----------|----------|------|
| 1 | 账号密码登录 | POST | `/auth/login` | 用户名密码登录 |
| 2 | 手机验证码登录 | POST | `/auth/smsLogin` | 手机号验证码登录 |
| 3 | 发送验证码 | POST | `/auth/sendSms` | 发送手机验证码 |
| 4 | 退出登录 | POST | `/auth/logout` | 用户退出登录 |
| 5 | 刷新Token | POST | `/auth/refresh` | 刷新访问令牌 |
| 6 | 获取用户信息 | GET | `/auth/getInfo` | 获取当前用户信息 |
| 7 | 修改密码 | PUT | `/auth/changePassword` | 首次登录修改密码 |
| 8 | 获取登录历史 | GET | `/auth/loginHistory` | 获取用户登录历史记录 |

## 🔑 1. 账号密码登录

### 接口信息
- **接口地址**: `/auth/login`
- **请求方式**: POST
- **接口描述**: 用户使用用户名和密码进行登录认证

### 请求参数

```json
{
  "username": "admin",
  "password": "admin123",
  "code": "1234",
  "uuid": "verification_uuid"
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| username | String | 是 | 用户名/工号 |
| password | String | 是 | 密码(MD5加密) |
| code | String | 否 | 图形验证码 |
| uuid | String | 否 | 验证码UUID |

### 响应参数

**成功响应**:
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "token": "eyJhbGciOiJIUzUxMiJ9...",
    "user": {
      "userId": 1,
      "username": "admin",
      "nickName": "管理员",
      "email": "admin@example.com",
      "phonenumber": "13800138000",
      "sex": "1",
      "avatar": "",
      "deptId": 103,
      "deptName": "研发部门",
      "roleIds": [1],
      "roles": ["admin"],
      "permissions": ["*:*:*"],
      "isFirstLogin": false,
      "lastLoginTime": "2025-01-17 10:30:00",
      "lastLoginIp": "192.168.1.100"
    }
  }
}
```

## 📱 2. 手机验证码登录

### 接口信息
- **接口地址**: `/auth/smsLogin`
- **请求方式**: POST
- **接口描述**: 用户使用手机号和验证码进行登录

### 请求参数

```json
{
  "phone": "13800138000",
  "code": "123456"
}
```

### 响应参数
成功响应: 同账号密码登录

## 📨 3. 发送验证码

### 接口信息
- **接口地址**: `/auth/sendSms`
- **请求方式**: POST
- **接口描述**: 向指定手机号发送登录验证码

### 请求参数

```json
{
  "phone": "13800138000"
}
```

### 响应参数

```json
{
  "code": 200,
  "msg": "验证码发送成功",
  "data": {
    "countdown": 60
  }
}
```

## 🚪 4. 退出登录

### 接口信息
- **接口地址**: `/auth/logout`
- **请求方式**: POST
- **接口描述**: 用户退出登录，清除token

## 🔄 5. 刷新Token

### 接口信息
- **接口地址**: `/auth/refresh`
- **请求方式**: POST
- **接口描述**: 刷新访问令牌，延长登录有效期

## 👤 6. 获取用户信息

### 接口信息
- **接口地址**: `/auth/getInfo`
- **请求方式**: GET
- **接口描述**: 获取当前登录用户的详细信息

## 🔐 7. 修改密码

### 接口信息
- **接口地址**: `/auth/changePassword`
- **请求方式**: PUT
- **接口描述**: 首次登录或用户主动修改密码

### 请求参数

```json
{
  "oldPassword": "admin123",
  "newPassword": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

## 📋 8. 获取登录历史

### 接口信息
- **接口地址**: `/auth/loginHistory`
- **请求方式**: GET
- **接口描述**: 获取用户最近的登录历史记录

## 📊 接口状态码说明

| 状态码 | 说明 | 备注 |
|--------|------|------|
| 200 | 操作成功 | 正常响应 |
| 401 | 认证失败 | 未登录或token过期 |
| 403 | 权限不足 | 已登录但权限不够 |
| 500 | 系统异常 | 服务器内部错误 |
| 5001 | 用户名或密码错误 | 登录凭证错误 |
| 5002 | 验证码错误 | 图形或短信验证码错误 |
| 5003 | 验证码已过期 | 验证码超时 |
| 5004 | 账户已被禁用 | 用户状态异常 |
| 5005 | 密码已过期 | 需要修改密码 | 