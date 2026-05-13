package com.campusguild.server.repository;

import com.campusguild.server.model.entity.Task;
import com.campusguild.server.model.entity.User;
import com.campusguild.server.model.enums.TaskStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    Page<Task> findByStatusOrderByCreatedAtDesc(TaskStatus status, Pageable pageable);

    Page<Task> findByTitleContainingIgnoreCaseOrderByCreatedAtDesc(String keyword, Pageable pageable);

    Page<Task> findByCategoryAndStatusOrderByCreatedAtDesc(String category, TaskStatus status, Pageable pageable);

    Page<Task> findByPublisherIdOrderByCreatedAtDesc(Long publisherId, Pageable pageable);

    Page<Task> findByAccepterIdOrderByCreatedAtDesc(Long accepterId, Pageable pageable);

    @Query("SELECT t FROM Task t WHERE t.status = :status AND t.deadline < :deadline")
    List<Task> findExpiredTasks(TaskStatus status, java.time.LocalDateTime deadline);

    Page<Task> findAllByOrderByCreatedAtDesc(Pageable pageable);

    long countByStatus(TaskStatus status);

    @Modifying(clearAutomatically = true)
    @Query("UPDATE Task t SET t.status = :status, t.accepter = :accepter WHERE t.id = :taskId AND t.status = :expectedStatus")
    int tryAccept(@Param("taskId") Long taskId, @Param("accepter") User accepter,
                  @Param("status") TaskStatus status, @Param("expectedStatus") TaskStatus expectedStatus);
}
