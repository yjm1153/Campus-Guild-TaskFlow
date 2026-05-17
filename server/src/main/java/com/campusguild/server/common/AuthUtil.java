package com.campusguild.server.common;

import com.campusguild.server.exception.BusinessException;
import jakarta.servlet.http.HttpServletRequest;

public class AuthUtil {

    public static Long requireUserId(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            throw new BusinessException(401, "未登录或登录已过期");
        }
        return userId;
    }
}
