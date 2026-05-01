package com.campusguild.server.model.dto;

import com.campusguild.server.model.entity.Task;
import com.campusguild.server.model.enums.TaskStatus;
import java.time.LocalDateTime;

public class TaskDTO {

    private Long id;
    private String title;
    private String description;
    private int reward;
    private String status;
    private Long publisherId;
    private String publisherNickname;
    private Long accepterId;
    private String accepterNickname;
    private LocalDateTime createdAt;

    public static TaskDTO fromEntity(Task task) {
        TaskDTO dto = new TaskDTO();
        dto.setId(task.getId());
        dto.setTitle(task.getTitle());
        dto.setDescription(task.getDescription());
        dto.setReward(task.getReward());
        dto.setStatus(task.getStatus().getDisplayName());
        dto.setPublisherId(task.getPublisher().getId());
        dto.setPublisherNickname(task.getPublisher().getNickname());
        if (task.getAccepter() != null) {
            dto.setAccepterId(task.getAccepter().getId());
            dto.setAccepterNickname(task.getAccepter().getNickname());
        }
        dto.setCreatedAt(task.getCreatedAt());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public int getReward() { return reward; }
    public void setReward(int reward) { this.reward = reward; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Long getPublisherId() { return publisherId; }
    public void setPublisherId(Long publisherId) { this.publisherId = publisherId; }

    public String getPublisherNickname() { return publisherNickname; }
    public void setPublisherNickname(String publisherNickname) { this.publisherNickname = publisherNickname; }

    public Long getAccepterId() { return accepterId; }
    public void setAccepterId(Long accepterId) { this.accepterId = accepterId; }

    public String getAccepterNickname() { return accepterNickname; }
    public void setAccepterNickname(String accepterNickname) { this.accepterNickname = accepterNickname; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
