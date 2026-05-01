package com.campusguild.server.model.enums;

public enum TaskStatus {
    PENDING("待接取"),
    IN_PROGRESS("进行中"),
    COMPLETED("已完成");

    private final String displayName;

    TaskStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
