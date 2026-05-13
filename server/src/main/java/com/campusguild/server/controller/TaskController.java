package com.campusguild.server.controller;

import com.campusguild.server.common.PageResult;
import com.campusguild.server.common.Result;
import com.campusguild.server.model.dto.TaskDTO;
import com.campusguild.server.model.dto.TaskPublishRequest;
import com.campusguild.server.service.TaskService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @PostMapping
    public Result<TaskDTO> publish(HttpServletRequest request,
                                   @Valid @RequestBody TaskPublishRequest req) {
        Long userId = (Long) request.getAttribute("userId");
        return Result.success(taskService.publishTask(userId, req));
    }

    @GetMapping
    public Result<PageResult<TaskDTO>> browse(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category) {
        return Result.success(taskService.browseTasks(page, pageSize, keyword, category));
    }

    @GetMapping("/{taskId}")
    public Result<TaskDTO> detail(@PathVariable Long taskId) {
        return Result.success(taskService.getTaskDetail(taskId));
    }

    @PostMapping("/{taskId}/views")
    public Result<TaskDTO> incrementViews(@PathVariable Long taskId) {
        return Result.success(taskService.incrementViews(taskId));
    }

    @PostMapping("/{taskId}/accept")
    public Result<TaskDTO> accept(@PathVariable Long taskId, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return Result.success(taskService.acceptTask(taskId, userId));
    }

    @PostMapping("/{taskId}/complete")
    public Result<TaskDTO> complete(@PathVariable Long taskId, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return Result.success(taskService.confirmComplete(taskId, userId));
    }

    @PostMapping("/{taskId}/cancel")
    public Result<TaskDTO> cancel(@PathVariable Long taskId, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return Result.success(taskService.cancelTask(taskId, userId));
    }

    @GetMapping("/my/published")
    public Result<PageResult<TaskDTO>> myPublished(
            HttpServletRequest request,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int pageSize) {
        Long userId = (Long) request.getAttribute("userId");
        return Result.success(taskService.getMyPublishedTasks(userId, page, pageSize));
    }

    @GetMapping("/my/accepted")
    public Result<PageResult<TaskDTO>> myAccepted(
            HttpServletRequest request,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int pageSize) {
        Long userId = (Long) request.getAttribute("userId");
        return Result.success(taskService.getMyAcceptedTasks(userId, page, pageSize));
    }
}