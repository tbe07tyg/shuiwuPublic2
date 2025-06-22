# 🔐 登录认证模块

## 📋 模块概述

本模块基于RuoYi-Vue框架开发，提供完整的用户登录认证功能，包括账号密码登录、手机验证码登录、Token管理、安全验证等核心功能。

## 🚀 主要功能

### 1. 多种登录方式
- **账号密码登录**: 支持用户名/工号 + 密码登录
- **手机验证码登录**: 支持手机号 + 短信验证码登录
- **图形验证码**: 防止恶意登录攻击
- **记住我功能**: 延长登录有效期

### 2. 安全特性
- **JWT Token认证**: 无状态的Token认证机制
- **密码加密**: BCrypt强散列加密
- **登录限制**: IP黑名单、频率限制
- **异常检测**: 异常IP、异常地点检测

### 3. 用户管理
- **首次登录强制修改密码**: 提高账户安全
- **密码强度校验**: 8-20位字母数字组合
- **登录历史记录**: 详细的登录日志
- **用户状态管理**: 启用/停用账户

## 📁 目录结构

```
auth-login/
├── API接口文档.md                    # API接口文档
├── controller/                       # 控制器层
│   └── SysLoginController.java      # 登录认证控制器
├── service/                         # 服务层
│   ├── SysLoginService.java         # 服务接口
│   └── impl/
│       └── SysLoginServiceImpl.java # 服务实现
├── domain/                          # 实体类
│   ├── LoginBody.java               # 登录请求体
│   ├── SmsLoginBody.java            # 短信登录请求体
│   └── ChangePasswordBody.java      # 修改密码请求体
├── mapper/                          # 数据访问层
│   └── SysUserMapper.java           # 用户数据访问
├── config/                          # 配置类
│   ├── SecurityConfig.java          # 安全配置
│   └── application.yml              # 应用配置
├── utils/                           # 工具类
│   └── TokenService.java            # Token服务
├── 数据库建表SQL.sql                 # 数据库脚本
└── README.md                        # 本文档
```

## 🔧 技术栈

- **后端框架**: Spring Boot 2.5+
- **安全框架**: Spring Security 5.5+
- **数据库**: MySQL 8.0+
- **缓存**: Redis 6.0+
- **Token**: JWT (JSON Web Token)
- **密码加密**: BCrypt
- **短信服务**: 阿里云短信服务

## 📦 依赖配置

### Maven依赖 (pom.xml)

```xml
<dependencies>
    <!-- Spring Boot Starter -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    
    <!-- Spring Security -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    
    <!-- JWT -->
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt</artifactId>
        <version>0.9.1</version>
    </dependency>
    
    <!-- Redis -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-redis</artifactId>
    </dependency>
    
    <!-- MySQL -->
    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
    </dependency>
    
    <!-- MyBatis Plus -->
    <dependency>
        <groupId>com.baomidou</groupId>
        <artifactId>mybatis-plus-boot-starter</artifactId>
        <version>3.4.3</version>
    </dependency>
    
    <!-- 阿里云短信 -->
    <dependency>
        <groupId>com.aliyun</groupId>
        <artifactId>dysmsapi20170525</artifactId>
        <version>2.0.22</version>
    </dependency>
</dependencies>
```

## ⚙️ 配置说明

### 应用配置 (application.yml)

```yaml
# Token配置
token:
  header: Authorization        # Token请求头名称
  secret: your_secret_key     # JWT签名密钥
  expireTime: 30              # Token有效期(分钟)

# 短信配置
sms:
  aliyun:
    accessKeyId: your_key_id
    accessKeySecret: your_key_secret
    signName: 科研管理系统
    templateCode: SMS_LOGIN_CODE
  expireTime: 5               # 验证码有效期(分钟)
  rateLimit: 60               # 发送频率限制(秒)
```

### 数据库配置

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/ruoyi?useUnicode=true&characterEncoding=utf8&zeroDateTimeBehavior=convertToNull&useSSL=true&serverTimezone=GMT%2B8
    username: root
    password: password
    driver-class-name: com.mysql.cj.jdbc.Driver
```

### Redis配置

```yaml
spring:
  redis:
    host: localhost
    port: 6379
    database: 0
    timeout: 10s
    lettuce:
      pool:
        max-active: 8
        max-wait: -1ms
        max-idle: 8
        min-idle: 0
```

## 🚀 快速开始

### 1. 数据库初始化

执行 `数据库建表SQL.sql` 文件创建所需数据表：

```sql
-- 创建用户表、角色表、登录日志表等
source 数据库建表SQL.sql
```

### 2. 配置文件修改

修改 `application.yml` 中的数据库连接、Redis连接、短信服务等配置。

### 3. 启动应用

```bash
mvn spring-boot:run
```

### 4. 接口测试

使用Postman或其他工具测试接口：

```bash
# 登录接口
POST /auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123",
  "code": "1234",
  "uuid": "verification_uuid"
}
```

## 📚 API文档

详细的API接口文档请参考 [API接口文档.md](./API接口文档.md)

### 主要接口列表

| 接口 | 方法 | 路径 | 描述 |
|------|------|------|------|
| 登录 | POST | `/auth/login` | 账号密码登录 |
| 短信登录 | POST | `/auth/smsLogin` | 手机验证码登录 |
| 发送验证码 | POST | `/auth/sendSms` | 发送短信验证码 |
| 退出登录 | POST | `/auth/logout` | 退出登录 |
| 刷新Token | POST | `/auth/refresh` | 刷新访问令牌 |
| 用户信息 | GET | `/auth/getInfo` | 获取用户信息 |
| 修改密码 | PUT | `/auth/changePassword` | 修改密码 |
| 登录历史 | GET | `/auth/loginHistory` | 登录历史记录 |

## 🔒 安全特性

### 1. 密码安全
- BCrypt加密存储
- 密码强度校验
- 首次登录强制修改

### 2. 登录安全
- 图形验证码防护
- IP黑名单机制
- 登录频率限制
- 异常登录检测

### 3. Token安全
- JWT无状态认证
- Token自动刷新
- Redis缓存管理
- 过期时间控制

## 🛠️ 开发指南

### 1. 自定义验证码
```java
// 实现 CaptchaService 接口
@Service
public class CustomCaptchaService implements CaptchaService {
    @Override
    public String generateCaptcha(String uuid) {
        // 自定义验证码生成逻辑
    }
}
```

### 2. 自定义短信服务
```java
// 实现 SmsService 接口
@Service
public class CustomSmsService implements SmsService {
    @Override
    public boolean sendLoginCode(String phone, String code) {
        // 自定义短信发送逻辑
    }
}
```

### 3. 自定义认证逻辑
```java
// 继承 SysLoginServiceImpl
@Service
public class CustomLoginService extends SysLoginServiceImpl {
    @Override
    public String login(String username, String password, String code, String uuid) {
        // 自定义登录验证逻辑
        return super.login(username, password, code, uuid);
    }
}
```

## 📊 监控指标

### 1. 登录成功率
- 统计时间段内登录成功/失败次数
- 分析登录失败原因

### 2. 异常登录监控
- 异常IP登录告警
- 异常时间登录检测
- 异常地点登录提醒

### 3. 性能监控
- 登录接口响应时间
- Token验证耗时
- 短信发送成功率

## 🚨 常见问题

### 1. Token过期问题
**问题**: 用户频繁提示需要重新登录
**解决**: 检查Token有效期配置，确保自动刷新机制正常工作

### 2. 短信验证码问题
**问题**: 验证码发送失败或延迟
**解决**: 检查短信服务配置，确认余额和模板状态

### 3. 密码加密问题
**问题**: 登录时密码验证失败
**解决**: 确保前后端使用相同的加密方式，检查BCrypt配置

### 4. Redis连接问题
**问题**: Token无法存储或获取
**解决**: 检查Redis连接配置和网络状态

## 📝 更新日志

### v1.0.0 (2025-01-17)
- ✨ 初始版本发布
- 🔐 完整的登录认证功能
- 📱 支持手机验证码登录
- 🛡️ 完善的安全防护机制
- 📊 详细的登录日志记录

## 🤝 贡献指南

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系方式

- 项目维护者: RuoYi团队
- 邮箱: ruoyi@example.com
- 项目地址: https://github.com/yangzongzhuan/RuoYi-Vue

---

**注意**: 本模块是科研管理系统的核心认证模块，请确保在生产环境中正确配置所有安全参数。 