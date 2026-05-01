package com.campusguild.server.controller;

import com.campusguild.server.common.PageResult;
import com.campusguild.server.common.Result;
import com.campusguild.server.model.dto.TaskDTO;
import com.campusguild.server.model.dto.TaskPublishRequest;
import com.campusguild.server.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    /**
     * 发布悬赏
     */
    @PostMapping
    public Result<TaskDTO> publish(@RequestParam Long userId,
                                   @Valid @RequestBody TaskPublishRequest request) {
        return Result.success(taskService.publishTask(userId, request));
    }

    /**
     * 浏览任务看板（分页）
     */
    @GetMapping
    public Result<PageResult<TaskDTO>> browse(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String keyword) {
        return Result.success(taskService.browseTasks(page, pageSize, keyword));
    }

    /**
     * 接取任务
     */
    @PostMapping("/{taskId}/accept")
    public Result<TaskDTO> accept(@PathVariable Long taskId,
                                  @RequestParam Long userId) {
        return Result.success(taskService.acceptTask(taskId, userId));
    }

    /**
     * 确认完成任务
     */
    @PostMapping("/{taskId}/complete")
    public Result<TaskDTO> complete(@PathVariable Long taskId,
                                    @RequestParam Long userId) {
        return Result.success(taskService.confirmComplete(taskId, userId));
    }
}
