package com.ruoyi.framework.web.service;

/**
 * 登录校验方法
 * 
 * @author ruoyi
 */
public interface SysLoginService {
    
    /**
     * 登录验证
     * 
     * @param username 用户名
     * @param password 密码
     * @param code 验证码
     * @param uuid 唯一标识
     * @return 结果
     */
    public String login(String username, String password, String code, String uuid);

    /**
     * 手机验证码登录
     * 
     * @param phone 手机号
     * @param code 验证码
     * @return 结果
     */
    public String smsLogin(String phone, String code);

    /**
     * 发送短信验证码
     * 
     * @param phone 手机号
     * @return 结果
     */
    public boolean sendSmsCode(String phone);

    /**
     * 校验验证码
     * 
     * @param username 用户名
     * @param code 验证码
     * @param uuid 唯一标识
     * @return 结果
     */
    public void validateCaptcha(String username, String code, String uuid);

    /**
     * 记录登录信息
     * 
     * @param userId 用户ID
     */
    public void recordLoginInfo(Long userId);
} 