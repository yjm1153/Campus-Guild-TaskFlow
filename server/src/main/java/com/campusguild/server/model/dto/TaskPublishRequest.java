package com.campusguild.server.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

public class TaskPublishRequest {

    @NotBlank(message = "任务标题不能为空")
    private String title;

    private String description;

    private String category;

    @Positive(message = "悬赏积分必须大于 0")
    private int reward;

    private Integer deadlineDays;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public int getReward() { return reward; }
    public void setReward(int reward) { this.reward = reward; }

    public Integer getDeadlineDays() { return deadlineDays; }
    public void setDeadlineDays(Integer deadlineDays) { this.deadlineDays = deadlineDays; }
}
