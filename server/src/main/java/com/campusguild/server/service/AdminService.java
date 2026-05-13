package com.campusguild.server.service;

import com.campusguild.server.common.PageResult;
import com.campusguild.server.exception.BusinessException;
import com.campusguild.server.model.dto.TaskDTO;
import com.campusguild.server.model.dto.UserDTO;
import com.campusguild.server.model.entity.Task;
import com.campusguild.server.model.entity.User;
import com.campusguild.server.model.enums.TaskStatus;
import com.campusguild.server.repository.TaskRepository;
import com.campusguild.server.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final TaskRepository taskRepository;

    public AdminService(UserRepository userRepository, TaskRepository taskRepository) {
        this.userRepository = userRepository;
        this.taskRepository = taskRepository;
    }

    @PostConstruct
    @Transactional
    public void initAdmin() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        Optional<User> existingAdmin = userRepository.findByUsername("admin");

        if (existingAdmin.isEmpty()) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPasswordHash(encoder.encode("admin123"));
            admin.setNickname("系统管理员");
            admin.setRole("ADMIN");
            admin.setGuildLevel(1);
            admin.setPoints(0);
            admin.setExperience(0);
            userRepository.save(admin);
        } else {
            User admin = existingAdmin.get();
            if (!admin.getPasswordHash().startsWith("$2a$")) {
                admin.setPasswordHash(encoder.encode("admin123"));
                userRepository.save(admin);
            }
        }
    }

    public void checkAdmin(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("用户不存在"));
        if (!"ADMIN".equals(user.getRole())) {
            throw new BusinessException("无管理员权限");
        }
    }

    public PageResult<UserDTO> getAllUsers(int page, int pageSize) {
        Pageable pageable = PageRequest.of(page, pageSize);
        Page<User> userPage = userRepository.findAll(pageable);
        return new PageResult<>(
                userPage.getContent().stream().map(UserDTO::fromEntity).toList(),
                page, pageSize, userPage.getTotalElements()
        );
    }

    @Transactional
    public void banUser(Long targetUserId) {
        User user = userRepository.findById(targetUserId)
                .orElseThrow(() -> new BusinessException("用户不存在"));
        if ("ADMIN".equals(user.getRole())) {
            throw new BusinessException("不能封禁管理员");
        }
        user.setBanned(true);
        userRepository.save(user);
    }

    @Transactional
    public void unbanUser(Long targetUserId) {
        User user = userRepository.findById(targetUserId)
                .orElseThrow(() -> new BusinessException("用户不存在"));
        user.setBanned(false);
        userRepository.save(user);
    }

    public PageResult<TaskDTO> getAllTasks(int page, int pageSize, String status) {
        Pageable pageable = PageRequest.of(page, pageSize);
        Page<Task> taskPage;

        if (status != null && !status.isBlank()) {
            TaskStatus taskStatus = TaskStatus.valueOf(status);
            taskPage = taskRepository.findByStatusOrderByCreatedAtDesc(taskStatus, pageable);
        } else {
            taskPage = taskRepository.findAllByOrderByCreatedAtDesc(pageable);
        }

        return new PageResult<>(
                taskPage.getContent().stream().map(TaskDTO::fromEntity).toList(),
                page, pageSize, taskPage.getTotalElements()
        );
    }

    @Transactional
    public void deleteTask(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new BusinessException("任务不存在"));

        if (task.getStatus() == TaskStatus.IN_PROGRESS) {
            throw new BusinessException("进行中的任务无法删除，请先取消");
        }

        taskRepository.delete(task);
    }

    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalTasks", taskRepository.count());
        stats.put("pendingTasks", taskRepository.countByStatus(TaskStatus.PENDING));
        stats.put("inProgressTasks", taskRepository.countByStatus(TaskStatus.IN_PROGRESS));
        stats.put("completedTasks", taskRepository.countByStatus(TaskStatus.COMPLETED));
        stats.put("cancelledTasks", taskRepository.countByStatus(TaskStatus.CANCELLED));
        return stats;
    }
}
