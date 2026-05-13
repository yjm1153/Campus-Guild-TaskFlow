package com.campusguild.server.config;

import com.campusguild.server.model.enums.TaskStatus;
import com.campusguild.server.repository.TaskRepository;
import com.campusguild.server.service.PointsService;
import com.campusguild.server.model.entity.Task;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class TaskExpirationScheduler {

    private static final Logger logger = LoggerFactory.getLogger(TaskExpirationScheduler.class);

    private final TaskRepository taskRepository;
    private final PointsService pointsService;

    public TaskExpirationScheduler(TaskRepository taskRepository, PointsService pointsService) {
        this.taskRepository = taskRepository;
        this.pointsService = pointsService;
    }

    @Scheduled(cron = "0 0 * * * ?")
    @Transactional
    public void checkExpiredTasks() {
        List<Task> expiredTasks = taskRepository.findExpiredTasks(
                TaskStatus.IN_PROGRESS,
                LocalDateTime.now()
        );

        for (Task task : expiredTasks) {
            logger.info("任务 {} 超时未完成，已自动取消", task.getId());
            pointsService.refundPoints(task.getPublisher(), task.getReward());
            task.setStatus(TaskStatus.CANCELLED);
            taskRepository.save(task);
        }
    }
}