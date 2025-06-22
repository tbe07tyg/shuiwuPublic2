package com.ruoyi.web.controller.auth;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ruoyi.common.annotation.Log;
import com.ruoyi.common.core.controller.BaseController;
import com.ruoyi.common.core.domain.AjaxResult;
import com.ruoyi.common.core.domain.entity.SysUser;
import com.ruoyi.common.core.domain.model.LoginBody;
import com.ruoyi.common.core.domain.model.SmsLoginBody;
import com.ruoyi.common.core.domain.model.ChangePasswordBody;
import com.ruoyi.common.core.page.TableDataInfo;
import com.ruoyi.common.enums.BusinessType;
import com.ruoyi.common.utils.ServletUtils;
import com.ruoyi.common.utils.StringUtils;
import com.ruoyi.common.utils.SecurityUtils;
import com.ruoyi.framework.web.service.SysLoginService;
import com.ruoyi.framework.web.service.TokenService;
import com.ruoyi.framework.web.service.SysPermissionService;
import com.ruoyi.system.domain.SysLogininfor;
import com.ruoyi.system.service.ISysUserService;
import com.ruoyi.system.service.ISysLogininforService;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;

/**
 * 登录认证控制器
 * 
 * @author ruoyi
 * @date 2025-01-17
 */
@RestController
@RequestMapping("/auth")
@Api(tags = "登录认证接口")
public class SysLoginController extends BaseController {
    
    @Autowired
    private SysLoginService loginService;
    
    @Autowired
    private ISysUserService userService;
    
    @Autowired
    private SysPermissionService permissionService;
    
    @Autowired
    private TokenService tokenService;
    
    @Autowired
    private ISysLogininforService logininforService;

    /**
     * 账号密码登录
     */
    @PostMapping("/login")
    @ApiOperation("用户登录")
    public AjaxResult login(@RequestBody LoginBody loginBody) {
        AjaxResult ajax = AjaxResult.success();
        
        // 生成令牌
        String token = loginService.login(loginBody.getUsername(), 
                                         loginBody.getPassword(), 
                                         loginBody.getCode(), 
                                         loginBody.getUuid());
        ajax.put(Constants.TOKEN, token);
        
        // 获取用户信息
        LoginUser loginUser = tokenService.getLoginUser(ServletUtils.getRequest());
        SysUser user = loginUser.getUser();
        ajax.put("user", user);
        
        return ajax;
    }

    /**
     * 手机验证码登录
     */
    @PostMapping("/smsLogin")
    @ApiOperation("手机验证码登录")
    public AjaxResult smsLogin(@RequestBody SmsLoginBody smsLoginBody) {
        AjaxResult ajax = AjaxResult.success();
        
        // 验证码校验
        String token = loginService.smsLogin(smsLoginBody.getPhone(), smsLoginBody.getCode());
        ajax.put(Constants.TOKEN, token);
        
        // 获取用户信息
        LoginUser loginUser = tokenService.getLoginUser(ServletUtils.getRequest());
        SysUser user = loginUser.getUser();
        ajax.put("user", user);
        
        return ajax;
    }

    /**
     * 发送短信验证码
     */
    @PostMapping("/sendSms")
    @ApiOperation("发送短信验证码")
    public AjaxResult sendSms(@RequestBody Map<String, String> params) {
        String phone = params.get("phone");
        
        // 发送验证码
        boolean success = loginService.sendSmsCode(phone);
        if (success) {
            return AjaxResult.success("验证码发送成功").put("countdown", 60);
        } else {
            return AjaxResult.error("验证码发送失败");
        }
    }

    /**
     * 退出登录
     */
    @PostMapping("/logout")
    @ApiOperation("退出登录")
    public AjaxResult logout() {
        LoginUser loginUser = tokenService.getLoginUser(ServletUtils.getRequest());
        if (StringUtils.isNotNull(loginUser)) {
            String userName = loginUser.getUsername();
            // 删除用户缓存记录
            tokenService.delLoginUser(loginUser.getToken());
            // 记录用户退出日志
            AsyncManager.me().execute(AsyncFactory.recordLogininfor(
                userName, Constants.LOGOUT, "退出成功"));
        }
        return AjaxResult.success("退出成功");
    }

    /**
     * 刷新令牌
     */
    @PostMapping("/refresh")
    @ApiOperation("刷新令牌")
    public AjaxResult refresh(HttpServletRequest request) {
        LoginUser loginUser = tokenService.getLoginUser(request);
        if (StringUtils.isNotNull(loginUser)) {
            // 刷新令牌有效期
            tokenService.refreshToken(loginUser);
            return AjaxResult.success().put("token", loginUser.getToken());
        }
        return AjaxResult.error("令牌已过期");
    }

    /**
     * 获取用户信息
     */
    @GetMapping("/getInfo")
    @ApiOperation("获取用户信息")
    public AjaxResult getInfo() {
        SysUser user = SecurityUtils.getLoginUser().getUser();
        // 角色集合
        Set<String> roles = permissionService.getRolePermission(user);
        // 权限集合
        Set<String> permissions = permissionService.getMenuPermission(user);
        
        AjaxResult ajax = AjaxResult.success();
        ajax.put("user", user);
        ajax.put("roles", roles);
        ajax.put("permissions", permissions);
        return ajax;
    }

    /**
     * 修改密码
     */
    @PutMapping("/changePassword")
    @ApiOperation("修改密码")
    @Log(title = "个人信息", businessType = BusinessType.UPDATE)
    public AjaxResult changePassword(@RequestBody ChangePasswordBody body) {
        LoginUser loginUser = SecurityUtils.getLoginUser();
        SysUser user = loginUser.getUser();
        
        String userName = user.getUserName();
        String password = user.getPassword();
        
        // 非首次登录需要验证原密码
        if (!user.getIsFirstLogin() && StringUtils.isNotEmpty(body.getOldPassword())) {
            if (!SecurityUtils.matchesPassword(body.getOldPassword(), password)) {
                return AjaxResult.error("修改密码失败，旧密码错误");
            }
        }
        
        // 验证新密码
        if (!body.getNewPassword().equals(body.getConfirmPassword())) {
            return AjaxResult.error("新密码和确认密码不一致");
        }
        
        // 密码强度校验
        if (!isValidPassword(body.getNewPassword())) {
            return AjaxResult.error("密码强度不够，请使用8-20位字母数字组合");
        }
        
        // 更新密码
        if (userService.resetUserPwd(userName, SecurityUtils.encryptPassword(body.getNewPassword())) > 0) {
            // 更新首次登录标识
            if (user.getIsFirstLogin()) {
                user.setIsFirstLogin(false);
                userService.updateUser(user);
            }
            
            return AjaxResult.success("密码修改成功");
        }
        return AjaxResult.error("密码修改失败，请联系管理员");
    }

    /**
     * 获取登录历史
     */
    @GetMapping("/loginHistory")
    @ApiOperation("获取登录历史")
    public TableDataInfo loginHistory(SysLogininfor logininfor) {
        SysUser currentUser = SecurityUtils.getLoginUser().getUser();
        logininfor.setUserName(currentUser.getUserName());
        
        startPage();
        List<SysLogininfor> list = logininforService.selectLogininforList(logininfor);
        
        // 标记异常IP
        for (SysLogininfor log : list) {
            log.setAbnormal(isAbnormalIp(log.getIpaddr(), currentUser.getUserName()));
        }
        
        return getDataTable(list);
    }

    /**
     * 密码强度校验
     */
    private boolean isValidPassword(String password) {
        if (StringUtils.isEmpty(password) || password.length() < 8 || password.length() > 20) {
            return false;
        }
        
        // 至少包含字母和数字
        boolean hasLetter = password.matches(".*[a-zA-Z].*");
        boolean hasDigit = password.matches(".*\\d.*");
        
        return hasLetter && hasDigit;
    }

    /**
     * 判断是否为异常IP
     */
    private boolean isAbnormalIp(String ipaddr, String userName) {
        // 获取用户常用IP列表
        List<String> commonIps = userService.getCommonIps(userName);
        
        // 检查是否为常用IP
        if (!commonIps.contains(ipaddr)) {
            // 检查IP地理位置是否异常
            String location = IpUtils.getRealAddressByIP(ipaddr);
            return isAbnormalLocation(location, userName);
        }
        
        return false;
    }

    /**
     * 判断是否为异常登录地点
     */
    private boolean isAbnormalLocation(String location, String userName) {
        // 实现地点异常判断逻辑
        // 例如：检查是否为海外IP、是否与历史登录地点差异过大等
        return false;
    }
} 