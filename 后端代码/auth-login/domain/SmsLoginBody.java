package com.ruoyi.common.core.domain.model;

/**
 * 手机验证码登录对象
 * 
 * @author ruoyi
 */
public class SmsLoginBody {
    /**
     * 手机号
     */
    private String phone;

    /**
     * 验证码
     */
    private String code;

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }
} 