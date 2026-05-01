package com.campusguild.server.repository;

import com.campusguild.server.model.entity.Task;
import com.campusguild.server.model.enums.TaskStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    Page<Task> findByStatusOrderByCreatedAtDesc(TaskStatus status, Pageable pageable);

    Page<Task> findByTitleContainingIgnoreCaseOrderByCreatedAtDesc(String keyword, Pageable pageable);

    long countByStatus(TaskStatus status);

    @Modifying
    @Query("UPDATE Task t SET t.status = :status, t.accepter = null WHERE t.id = :id AND t.status = 'PENDING'")
    int resetTaskStatus(Long id, TaskStatus status);
}
