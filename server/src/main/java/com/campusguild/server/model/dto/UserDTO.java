package com.campusguild.server.model.dto;

import com.campusguild.server.model.entity.User;

public class UserDTO {

    private Long id;
    private String username;
    private String nickname;
    private Integer guildLevel;
    private Integer points;
    private Integer experience;

    public static UserDTO fromEntity(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setNickname(user.getNickname());
        dto.setGuildLevel(user.getGuildLevel());
        dto.setPoints(user.getPoints());
        dto.setExperience(user.getExperience());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getNickname() { return nickname; }
    public void setNickname(String nickname) { this.nickname = nickname; }

    public Integer getGuildLevel() { return guildLevel; }
    public void setGuildLevel(Integer guildLevel) { this.guildLevel = guildLevel; }

    public Integer getPoints() { return points; }
    public void setPoints(Integer points) { this.points = points; }

    public Integer getExperience() { return experience; }
    public void setExperience(Integer experience) { this.experience = experience; }
}
