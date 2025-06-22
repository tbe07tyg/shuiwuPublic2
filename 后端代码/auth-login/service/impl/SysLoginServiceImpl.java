package com.ruoyi.framework.web.service.impl;

import java.util.concurrent.TimeUnit;
import javax.annotation.Resource;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import com.ruoyi.common.constant.CacheConstants;
import com.ruoyi.common.constant.Constants;
import com.ruoyi.common.core.domain.entity.SysUser;
import com.ruoyi.common.core.domain.model.LoginUser;
import com.ruoyi.common.core.redis.RedisCache;
import com.ruoyi.common.exception.ServiceException;
import com.ruoyi.common.exception.user.CaptchaException;
import com.ruoyi.common.exception.user.CaptchaExpireException;
import com.ruoyi.common.exception.user.UserPasswordNotMatchException;
import com.ruoyi.common.utils.DateUtils;
import com.ruoyi.common.utils.MessageUtils;
import com.ruoyi.common.utils.StringUtils;
import com.ruoyi.common.utils.ip.IpUtils;
import com.ruoyi.common.utils.RegexUtils;
import com.ruoyi.common.utils.RandomUtil;
import com.ruoyi.framework.manager.AsyncManager;
import com.ruoyi.framework.manager.factory.AsyncFactory;
import com.ruoyi.framework.security.context.AuthContextHolder;
import com.ruoyi.framework.web.service.SysLoginService;
import com.ruoyi.framework.web.service.TokenService;
import com.ruoyi.framework.web.service.SmsService;
import com.ruoyi.system.service.ISysConfigService;
import com.ruoyi.system.service.ISysUserService;

/**
 * 登录校验方法
 * 
 * @author ruoyi
 */
@Component
public class SysLoginServiceImpl implements SysLoginService {
    
    @Autowired
    private TokenService tokenService;

    @Resource
    private AuthenticationManager authenticationManager;

    @Autowired
    private RedisCache redisCache;
    
    @Autowired
    private ISysUserService userService;
    
    @Autowired
    private ISysConfigService configService;
    
    @Autowired
    private SmsService smsService;

    /**
     * 登录验证
     */
    @Override
    public String login(String username, String password, String code, String uuid) {
        // 验证码校验
        validateCaptcha(username, code, uuid);
        
        // 登录前置校验
        loginPreCheck(username, password);
        
        // 用户验证
        Authentication authentication = null;
        try {
            UsernamePasswordAuthenticationToken authenticationToken = 
                new UsernamePasswordAuthenticationToken(username, password);
            AuthContextHolder.setContext(authenticationToken);
            // 该方法会去调用UserDetailsServiceImpl.loadUserByUsername
            authentication = authenticationManager.authenticate(authenticationToken);
        } catch (Exception e) {
            if (e instanceof BadCredentialsException) {
                AsyncManager.me().execute(AsyncFactory.recordLogininfor(
                    username, Constants.LOGIN_FAIL, MessageUtils.message("user.password.not.match")));
                throw new UserPasswordNotMatchException();
            } else {
                AsyncManager.me().execute(AsyncFactory.recordLogininfor(
                    username, Constants.LOGIN_FAIL, e.getMessage()));
                throw new ServiceException(e.getMessage());
            }
        } finally {
            AuthContextHolder.clearContext();
        }
        
        AsyncManager.me().execute(AsyncFactory.recordLogininfor(
            username, Constants.LOGIN_SUCCESS, MessageUtils.message("user.login.success")));
        
        LoginUser loginUser = (LoginUser) authentication.getPrincipal();
        recordLoginInfo(loginUser.getUserId());
        
        // 生成token
        return tokenService.createToken(loginUser);
    }

    /**
     * 手机验证码登录
     */
    @Override
    public String smsLogin(String phone, String code) {
        // 手机号格式验证
        if (!RegexUtils.isPhoneNumber(phone)) {
            throw new ServiceException("手机号格式不正确");
        }
        
        // 验证码校验
        String verifyKey = CacheConstants.SMS_CODE_KEY + phone;
        String smsCode = redisCache.getCacheObject(verifyKey);
        
        if (StringUtils.isEmpty(smsCode)) {
            throw new ServiceException("验证码已过期，请重新获取");
        }
        
        if (!code.equals(smsCode)) {
            throw new ServiceException("验证码错误");
        }
        
        // 根据手机号查找用户
        SysUser user = userService.selectUserByPhonenumber(phone);
        if (StringUtils.isNull(user)) {
            throw new ServiceException("该手机号未绑定用户");
        }
        
        // 检查用户状态
        if (UserStatus.DISABLE.getCode().equals(user.getStatus())) {
            throw new ServiceException("用户已被停用，请联系管理员");
        }
        
        // 生成token
        LoginUser loginUser = new LoginUser(user.getUserId(), user.getDeptId(), user, null);
        String token = tokenService.createToken(loginUser);
        
        // 删除验证码
        redisCache.deleteObject(verifyKey);
        
        // 记录登录日志
        AsyncManager.me().execute(AsyncFactory.recordLogininfor(
            user.getUserName(), Constants.LOGIN_SUCCESS, "手机验证码登录成功"));
        
        // 更新登录信息
        recordLoginInfo(user.getUserId());
        
        return token;
    }

    /**
     * 发送短信验证码
     */
    @Override
    public boolean sendSmsCode(String phone) {
        // 手机号格式验证
        if (!RegexUtils.isPhoneNumber(phone)) {
            throw new ServiceException("手机号格式不正确");
        }
        
        // 检查发送频率限制
        String rateKey = CacheConstants.SMS_RATE_KEY + phone;
        String lastSendTime = redisCache.getCacheObject(rateKey);
        if (StringUtils.isNotEmpty(lastSendTime)) {
            throw new ServiceException("验证码发送过于频繁，请稍后再试");
        }
        
        // 生成6位数字验证码
        String code = RandomUtil.randomNumbers(6);
        
        // 发送短信
        try {
            boolean success = smsService.sendLoginCode(phone, code);
            if (!success) {
                throw new ServiceException("验证码发送失败，请稍后重试");
            }
            
            // 缓存验证码，5分钟有效
            redisCache.setCacheObject(CacheConstants.SMS_CODE_KEY + phone, code, 5, TimeUnit.MINUTES);
            
            // 设置发送频率限制，60秒内不可重复发送
            redisCache.setCacheObject(rateKey, String.valueOf(System.currentTimeMillis()), 60, TimeUnit.SECONDS);
            
            return true;
            
        } catch (Exception e) {
            logger.error("发送短信验证码异常", e);
            throw new ServiceException("验证码发送失败");
        }
    }

    /**
     * 校验验证码
     */
    @Override
    public void validateCaptcha(String username, String code, String uuid) {
        // 如果关闭了验证码功能，则跳过验证
        boolean captchaEnabled = configService.selectCaptchaEnabled();
        if (!captchaEnabled) {
            return;
        }
        
        String verifyKey = CacheConstants.CAPTCHA_CODE_KEY + StringUtils.nvl(uuid, "");
        String captcha = redisCache.getCacheObject(verifyKey);
        redisCache.deleteObject(verifyKey);
        
        if (captcha == null) {
            AsyncManager.me().execute(AsyncFactory.recordLogininfor(
                username, Constants.LOGIN_FAIL, MessageUtils.message("user.jcaptcha.expire")));
            throw new CaptchaExpireException();
        }
        
        if (!code.equalsIgnoreCase(captcha)) {
            AsyncManager.me().execute(AsyncFactory.recordLogininfor(
                username, Constants.LOGIN_FAIL, MessageUtils.message("user.jcaptcha.error")));
            throw new CaptchaException();
        }
    }

    /**
     * 登录前置校验
     */
    public void loginPreCheck(String username, String password) {
        // 用户名或密码为空 错误
        if (StringUtils.isEmpty(username) || StringUtils.isEmpty(password)) {
            AsyncManager.me().execute(AsyncFactory.recordLogininfor(
                username, Constants.LOGIN_FAIL, MessageUtils.message("not.null")));
            throw new UserPasswordNotMatchException();
        }
        
        // 密码如果不在指定范围内 错误
        if (password.length() < UserConstants.PASSWORD_MIN_LENGTH 
            || password.length() > UserConstants.PASSWORD_MAX_LENGTH) {
            AsyncManager.me().execute(AsyncFactory.recordLogininfor(
                username, Constants.LOGIN_FAIL, MessageUtils.message("user.password.not.match")));
            throw new UserPasswordNotMatchException();
        }
        
        // 用户名不在指定范围内 错误
        if (username.length() < UserConstants.USERNAME_MIN_LENGTH 
            || username.length() > UserConstants.USERNAME_MAX_LENGTH) {
            AsyncManager.me().execute(AsyncFactory.recordLogininfor(
                username, Constants.LOGIN_FAIL, MessageUtils.message("user.password.not.match")));
            throw new UserPasswordNotMatchException();
        }
        
        // IP锁定校验
        String blackStr = configService.selectConfigByKey("sys.login.blackIPList");
        if (IpUtils.isMatchedIp(blackStr, IpUtils.getIpAddr())) {
            AsyncManager.me().execute(AsyncFactory.recordLogininfor(
                username, Constants.LOGIN_FAIL, MessageUtils.message("login.blocked")));
            throw new ServiceException(MessageUtils.message("login.blocked"));
        }
    }

    /**
     * 记录登录信息
     */
    @Override
    public void recordLoginInfo(Long userId) {
        SysUser sysUser = new SysUser();
        sysUser.setUserId(userId);
        sysUser.setLoginIp(IpUtils.getIpAddr());
        sysUser.setLoginDate(DateUtils.getNowDate());
        userService.updateUserProfile(sysUser);
    }
} 