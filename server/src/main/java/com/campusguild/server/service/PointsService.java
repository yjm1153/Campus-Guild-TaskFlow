package com.campusguild.server.service;

import com.campusguild.server.model.entity.User;
import com.campusguild.server.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PointsService {

    private final UserRepository userRepository;

    public PointsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * 扣除积分（发布任务时冻结赏金）
     */
    @Transactional
    public void deductPoints(User user, int amount) {
        user.setPoints(user.getPoints() - amount);
        userRepository.save(user);
    }

    /**
     * 结算赏金（任务完成后接单者获得积分和经验值）
     */
    @Transactional
    public void settleReward(User accepter, int reward) {
        accepter.setPoints(accepter.getPoints() + reward);

        // 经验值 = 赏金 * 10
        int expGain = reward * 10;
        accepter.setExperience(accepter.getExperience() + expGain);

        // 等级提升：每 100 经验升 1 级
        int newLevel = (accepter.getExperience() / 100) + 1;
        if (newLevel > accepter.getGuildLevel()) {
            accepter.setGuildLevel(newLevel);
        }

        userRepository.save(accepter);
    }

    /**
     * 查询用户信息（含积分/等级）
     */
    public User getUserInfo(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
    }
}
