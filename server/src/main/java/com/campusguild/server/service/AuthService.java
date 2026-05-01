package com.campusguild.server.service;

import com.campusguild.server.exception.BusinessException;
import com.campusguild.server.model.dto.LoginRequest;
import com.campusguild.server.model.dto.RegisterRequest;
import com.campusguild.server.model.dto.UserDTO;
import com.campusguild.server.model.entity.User;
import com.campusguild.server.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;

@Service
public class AuthService {

    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserDTO register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BusinessException("用户名已存在");
        }

        String salt = generateSalt();
        String passwordHash = hashPassword(request.getPassword(), salt);

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPasswordHash(salt + "$" + passwordHash);
        user.setNickname(request.getNickname());
        user.setGuildLevel(1);
        user.setPoints(0);
        user.setExperience(0);

        user = userRepository.save(user);
        return UserDTO.fromEntity(user);
    }

    public UserDTO login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BusinessException("用户名或密码错误"));

        String[] parts = user.getPasswordHash().split("\\$");
        if (parts.length != 2) {
            throw new BusinessException("账号数据异常");
        }

        String inputHash = hashPassword(request.getPassword(), parts[0]);
        if (!inputHash.equals(parts[1])) {
            throw new BusinessException("用户名或密码错误");
        }

        return UserDTO.fromEntity(user);
    }

    private String generateSalt() {
        SecureRandom random = new SecureRandom();
        byte[] salt = new byte[16];
        random.nextBytes(salt);
        return Base64.getEncoder().encodeToString(salt);
    }

    private String hashPassword(String password, String salt) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            md.update(salt.getBytes());
            byte[] hashed = md.digest(password.getBytes());
            return Base64.getEncoder().encodeToString(hashed);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }
}
