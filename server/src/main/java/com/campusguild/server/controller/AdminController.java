package com.campusguild.server.controller;

import com.campusguild.server.common.PageResult;
import com.campusguild.server.common.Result;
import com.campusguild.server.model.dto.TaskDTO;
import com.campusguild.server.model.dto.UserDTO;
import com.campusguild.server.service.AdminService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/users")
    public Result<PageResult<UserDTO>> getAllUsers(
            HttpServletRequest request,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int pageSize) {
        Long userId = (Long) request.getAttribute("userId");
        adminService.checkAdmin(userId);
        return Result.success(adminService.getAllUsers(page, pageSize));
    }

    @PutMapping("/users/{id}/ban")
    public Result<Void> banUser(HttpServletRequest request, @PathVariable Long id) {
        Long userId = (Long) request.getAttribute("userId");
        adminService.checkAdmin(userId);
        adminService.banUser(id);
        return Result.success();
    }

    @PutMapping("/users/{id}/unban")
    public Result<Void> unbanUser(HttpServletRequest request, @PathVariable Long id) {
        Long userId = (Long) request.getAttribute("userId");
        adminService.checkAdmin(userId);
        adminService.unbanUser(id);
        return Result.success();
    }

    @GetMapping("/tasks")
    public Result<PageResult<TaskDTO>> getAllTasks(
            HttpServletRequest request,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String status) {
        Long userId = (Long) request.getAttribute("userId");
        adminService.checkAdmin(userId);
        return Result.success(adminService.getAllTasks(page, pageSize, status));
    }

    @DeleteMapping("/tasks/{id}")
    public Result<Void> deleteTask(HttpServletRequest request, @PathVariable Long id) {
        Long userId = (Long) request.getAttribute("userId");
        adminService.checkAdmin(userId);
        adminService.deleteTask(id);
        return Result.success();
    }

    @GetMapping("/stats")
    public Result<Map<String, Object>> getStats(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        adminService.checkAdmin(userId);
        return Result.success(adminService.getStats());
    }
}
