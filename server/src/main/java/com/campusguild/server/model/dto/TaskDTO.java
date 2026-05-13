package com.campusguild.server.model.dto;

import com.campusguild.server.model.entity.Task;
import com.campusguild.server.model.enums.TaskStatus;
import java.time.LocalDateTime;

public class TaskDTO {

    private Long id;
    private String title;
    private String description;
    private String category;
    private int reward;
    private int views;
    private String status;
    private Long publisherId;
    private String publisherNickname;
    private Integer publisherGuildLevel;
    private Long accepterId;
    private String accepterNickname;
    private LocalDateTime createdAt;
    private LocalDateTime deadline;

    public static TaskDTO fromEntity(Task task) {
        TaskDTO dto = new TaskDTO();
        dto.setId(task.getId());
        dto.setTitle(task.getTitle());
        dto.setDescription(task.getDescription());
        dto.setCategory(task.getCategory());
        dto.setReward(task.getReward());
        dto.setViews(task.getViews());
        dto.setStatus(task.getStatus().getDisplayName());
        dto.setPublisherId(task.getPublisher().getId());
        dto.setPublisherNickname(task.getPublisher().getNickname());
        dto.setPublisherGuildLevel(task.getPublisher().getGuildLevel());
        if (task.getAccepter() != null) {
            dto.setAccepterId(task.getAccepter().getId());
            dto.setAccepterNickname(task.getAccepter().getNickname());
        }
        dto.setCreatedAt(task.getCreatedAt());
        dto.setDeadline(task.getDeadline());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public int getReward() { return reward; }
    public void setReward(int reward) { this.reward = reward; }

    public int getViews() { return views; }
    public void setViews(int views) { this.views = views; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Long getPublisherId() { return publisherId; }
    public void setPublisherId(Long publisherId) { this.publisherId = publisherId; }

    public String getPublisherNickname() { return publisherNickname; }
    public void setPublisherNickname(String publisherNickname) { this.publisherNickname = publisherNickname; }

    public Integer getPublisherGuildLevel() { return publisherGuildLevel; }
    public void setPublisherGuildLevel(Integer publisherGuildLevel) { this.publisherGuildLevel = publisherGuildLevel; }

    public Long getAccepterId() { return accepterId; }
    public void setAccepterId(Long accepterId) { this.accepterId = accepterId; }

    public String getAccepterNickname() { return accepterNickname; }
    public void setAccepterNickname(String accepterNickname) { this.accepterNickname = accepterNickname; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getDeadline() { return deadline; }
    public void setDeadline(LocalDateTime deadline) { this.deadline = deadline; }
}
