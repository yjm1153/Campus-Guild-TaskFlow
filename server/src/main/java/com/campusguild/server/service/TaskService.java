package com.campusguild.server.service;

import com.campusguild.server.common.PageResult;
import com.campusguild.server.exception.BusinessException;
import com.campusguild.server.model.dto.TaskDTO;
import com.campusguild.server.model.dto.TaskPublishRequest;
import com.campusguild.server.model.entity.Task;
import com.campusguild.server.model.entity.User;
import com.campusguild.server.model.enums.TaskStatus;
import com.campusguild.server.repository.TaskRepository;
import com.campusguild.server.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final PointsService pointsService;

    public TaskService(TaskRepository taskRepository,
                       UserRepository userRepository,
                       PointsService pointsService) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.pointsService = pointsService;
    }

    @Transactional
    public TaskDTO publishTask(Long userId, TaskPublishRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("用户不存在"));

        // 检查余额是否足够
        if (user.getPoints() < request.getReward()) {
            throw new BusinessException("积分不足，当前余额: " + user.getPoints());
        }

        Task task = new Task();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setReward(request.getReward());
        task.setStatus(TaskStatus.PENDING);
        task.setPublisher(user);

        task = taskRepository.save(task);

        // 发布时冻结赏金（扣除发布者积分）
        pointsService.deductPoints(user, request.getReward());

        return TaskDTO.fromEntity(task);
    }

    public PageResult<TaskDTO> browseTasks(int page, int pageSize, String keyword) {
        Pageable pageable = PageRequest.of(page, pageSize);
        Page<Task> taskPage;

        if (keyword != null && !keyword.isBlank()) {
            taskPage = taskRepository.findByTitleContainingIgnoreCaseOrderByCreatedAtDesc(keyword, pageable);
        } else {
            taskPage = taskRepository.findByStatusOrderByCreatedAtDesc(TaskStatus.PENDING, pageable);
        }

        return new PageResult<>(
                taskPage.getContent().stream().map(TaskDTO::fromEntity).toList(),
                page, pageSize, taskPage.getTotalElements()
        );
    }

    @Transactional
    public TaskDTO acceptTask(Long taskId, Long userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new BusinessException("任务不存在"));

        if (task.getStatus() != TaskStatus.PENDING) {
            throw new BusinessException("该任务已被接取");
        }

        User accepter = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("用户不存在"));

        if (task.getPublisher().getId().equals(userId)) {
            throw new BusinessException("不能接取自己发布的任务");
        }

        // 乐观锁：仅在状态仍为PENDING时更新
        task.setStatus(TaskStatus.IN_PROGRESS);
        task.setAccepter(accepter);
        task = taskRepository.save(task);

        return TaskDTO.fromEntity(task);
    }

    @Transactional
    public TaskDTO confirmComplete(Long taskId, Long userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new BusinessException("任务不存在"));

        if (task.getStatus() != TaskStatus.IN_PROGRESS) {
            throw new BusinessException("任务状态不正确");
        }

        // 仅发布者可确认完成
        if (!task.getPublisher().getId().equals(userId)) {
            throw new BusinessException("只有发布者可以确认任务完成");
        }

        task.setStatus(TaskStatus.COMPLETED);
        task = taskRepository.save(task);

        // 结算：接单者获得赏金和经验值
        pointsService.settleReward(task.getAccepter(), task.getReward());

        return TaskDTO.fromEntity(task);
    }
}
