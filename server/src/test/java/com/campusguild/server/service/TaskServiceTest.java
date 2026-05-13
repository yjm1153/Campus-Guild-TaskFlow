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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PointsService pointsService;

    @InjectMocks
    private TaskService taskService;

    private User publisher;
    private User accepter;
    private Task testTask;
    private TaskPublishRequest publishRequest;

    @BeforeEach
    void setUp() {
        publisher = new User();
        publisher.setId(1L);
        publisher.setUsername("publisher");
        publisher.setNickname("发布者");
        publisher.setPoints(100);

        accepter = new User();
        accepter.setId(2L);
        accepter.setUsername("accepter");
        accepter.setNickname("接单者");
        accepter.setPoints(50);

        testTask = new Task();
        testTask.setId(1L);
        testTask.setTitle("测试任务");
        testTask.setDescription("任务描述");
        testTask.setCategory("跑腿");
        testTask.setReward(50);
        testTask.setStatus(TaskStatus.PENDING);
        testTask.setPublisher(publisher);
        testTask.setViews(0);

        publishRequest = new TaskPublishRequest();
        publishRequest.setTitle("测试任务");
        publishRequest.setDescription("任务描述");
        publishRequest.setCategory("跑腿");
        publishRequest.setReward(50);
    }

    @Test
    void publishTask_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(publisher));
        when(taskRepository.save(any(Task.class))).thenAnswer(invocation -> {
            Task saved = invocation.getArgument(0);
            saved.setId(1L);
            saved.setStatus(TaskStatus.PENDING);
            return saved;
        });

        TaskDTO result = taskService.publishTask(1L, publishRequest);

        assertNotNull(result);
        assertEquals("测试任务", result.getTitle());
        assertEquals("待接取", result.getStatus());
        verify(pointsService).deductPoints(publisher, 50);
    }

    @Test
    void publishTask_InsufficientPoints_ThrowsException() {
        publisher.setPoints(30);
        when(userRepository.findById(1L)).thenReturn(Optional.of(publisher));

        BusinessException exception = assertThrows(BusinessException.class, () -> {
            taskService.publishTask(1L, publishRequest);
        });

        assertTrue(exception.getMessage().contains("积分不足"));
    }

    @Test
    void browseTasks_ByKeyword() {
        Pageable pageable = PageRequest.of(0, 10);
        when(taskRepository.findByTitleContainingIgnoreCaseOrderByCreatedAtDesc(anyString(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(testTask), pageable, 1));

        PageResult<TaskDTO> result = taskService.browseTasks(0, 10, "测试", null);

        assertEquals(1, result.getItems().size());
        assertEquals("测试任务", result.getItems().get(0).getTitle());
    }

    @Test
    void browseTasks_ByCategory() {
        Pageable pageable = PageRequest.of(0, 10);
        when(taskRepository.findByCategoryAndStatusOrderByCreatedAtDesc(eq("跑腿"), eq(TaskStatus.PENDING), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(testTask), pageable, 1));

        PageResult<TaskDTO> result = taskService.browseTasks(0, 10, null, "跑腿");

        assertEquals(1, result.getItems().size());
        assertEquals("跑腿", result.getItems().get(0).getCategory());
    }

    @Test
    void acceptTask_Success() {
        testTask.setStatus(TaskStatus.PENDING);
        // 第二次 findById 应返回已接取状态
        Task acceptedTask = new Task();
        acceptedTask.setId(1L);
        acceptedTask.setTitle("测试任务");
        acceptedTask.setDescription("任务描述");
        acceptedTask.setCategory("跑腿");
        acceptedTask.setReward(50);
        acceptedTask.setStatus(TaskStatus.IN_PROGRESS);
        acceptedTask.setPublisher(publisher);
        acceptedTask.setAccepter(accepter);
        acceptedTask.setViews(0);

        when(taskRepository.findById(1L))
                .thenReturn(Optional.of(testTask))
                .thenReturn(Optional.of(acceptedTask));
        when(userRepository.findById(2L)).thenReturn(Optional.of(accepter));
        when(taskRepository.tryAccept(1L, accepter, TaskStatus.IN_PROGRESS, TaskStatus.PENDING)).thenReturn(1);

        TaskDTO result = taskService.acceptTask(1L, 2L);

        assertNotNull(result);
        assertEquals("进行中", result.getStatus());
    }

    @Test
    void acceptTask_AlreadyTaken_ThrowsException() {
        testTask.setStatus(TaskStatus.IN_PROGRESS);
        when(taskRepository.findById(1L)).thenReturn(Optional.of(testTask));

        BusinessException exception = assertThrows(BusinessException.class, () -> {
            taskService.acceptTask(1L, 2L);
        });

        assertEquals("该任务已被接取", exception.getMessage());
    }

    @Test
    void acceptTask_ConcurrentTake_ThrowsException() {
        testTask.setStatus(TaskStatus.PENDING);
        when(taskRepository.findById(1L)).thenReturn(Optional.of(testTask));
        when(userRepository.findById(2L)).thenReturn(Optional.of(accepter));
        when(taskRepository.tryAccept(1L, accepter, TaskStatus.IN_PROGRESS, TaskStatus.PENDING)).thenReturn(0);

        BusinessException exception = assertThrows(BusinessException.class, () -> {
            taskService.acceptTask(1L, 2L);
        });

        assertEquals("该任务已被其他用户接取", exception.getMessage());
    }

    @Test
    void acceptTask_SelfTask_ThrowsException() {
        when(taskRepository.findById(1L)).thenReturn(Optional.of(testTask));

        BusinessException exception = assertThrows(BusinessException.class, () -> {
            taskService.acceptTask(1L, 1L);
        });

        assertEquals("不能接取自己发布的任务", exception.getMessage());
    }

    @Test
    void confirmComplete_Success() {
        testTask.setStatus(TaskStatus.IN_PROGRESS);
        testTask.setAccepter(accepter);
        when(taskRepository.findById(1L)).thenReturn(Optional.of(testTask));
        when(taskRepository.save(any(Task.class))).thenAnswer(inv -> {
            Task t = inv.getArgument(0);
            t.setStatus(TaskStatus.COMPLETED);
            return t;
        });

        TaskDTO result = taskService.confirmComplete(1L, 1L);

        assertNotNull(result);
        assertEquals("已完成", result.getStatus());
        verify(pointsService).settleReward(accepter, 50);
    }

    @Test
    void confirmComplete_NotPublisher_ThrowsException() {
        testTask.setStatus(TaskStatus.IN_PROGRESS);
        testTask.setAccepter(accepter);
        when(taskRepository.findById(1L)).thenReturn(Optional.of(testTask));

        BusinessException exception = assertThrows(BusinessException.class, () -> {
            taskService.confirmComplete(1L, 2L);
        });

        assertEquals("只有发布者可以确认任务完成", exception.getMessage());
    }

    @Test
    void cancelTask_Success() {
        when(taskRepository.findById(1L)).thenReturn(Optional.of(testTask));
        when(taskRepository.save(any(Task.class))).thenAnswer(inv -> {
            Task t = inv.getArgument(0);
            t.setStatus(TaskStatus.CANCELLED);
            return t;
        });

        TaskDTO result = taskService.cancelTask(1L, 1L);

        assertNotNull(result);
        assertEquals("已取消", result.getStatus());
        verify(pointsService).refundPoints(publisher, 50);
    }

    @Test
    void cancelTask_NotPublisher_ThrowsException() {
        when(taskRepository.findById(1L)).thenReturn(Optional.of(testTask));

        BusinessException exception = assertThrows(BusinessException.class, () -> {
            taskService.cancelTask(1L, 2L);
        });

        assertEquals("只有发布者可以取消任务", exception.getMessage());
    }

    @Test
    void cancelTask_AlreadyCompleted_ThrowsException() {
        testTask.setStatus(TaskStatus.COMPLETED);
        when(taskRepository.findById(1L)).thenReturn(Optional.of(testTask));

        BusinessException exception = assertThrows(BusinessException.class, () -> {
            taskService.cancelTask(1L, 1L);
        });

        assertEquals("已完成任务无法取消", exception.getMessage());
    }

    @Test
    void getTaskDetail_Success() {
        when(taskRepository.findById(1L)).thenReturn(Optional.of(testTask));

        TaskDTO result = taskService.getTaskDetail(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("测试任务", result.getTitle());
    }

    @Test
    void getTaskDetail_NotFound_ThrowsException() {
        when(taskRepository.findById(1L)).thenReturn(Optional.empty());

        BusinessException exception = assertThrows(BusinessException.class, () -> {
            taskService.getTaskDetail(1L);
        });

        assertEquals("任务不存在", exception.getMessage());
    }

    @Test
    void incrementViews_Success() {
        testTask.setViews(5);
        when(taskRepository.findById(1L)).thenReturn(Optional.of(testTask));
        when(taskRepository.save(any(Task.class))).thenReturn(testTask);

        TaskDTO result = taskService.incrementViews(1L);

        assertNotNull(result);
        assertEquals(6, result.getViews());
    }
}