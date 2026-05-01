package com.campusguild.server.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

public class TaskPublishRequest {

    @NotBlank(message = "任务标题不能为空")
    private String title;

    private String description;

    @Positive(message = "悬赏积分必须大于 0")
    private int reward;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public int getReward() { return reward; }
    public void setReward(int reward) { this.reward = reward; }
}
