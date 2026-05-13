package com.campusguild.server.service;

import com.campusguild.server.config.JwtTokenProvider;
import com.campusguild.server.exception.BusinessException;
import com.campusguild.server.model.dto.LoginRequest;
import com.campusguild.server.model.dto.LoginResponse;
import com.campusguild.server.model.dto.RegisterRequest;
import com.campusguild.server.model.dto.UserDTO;
import com.campusguild.server.model.entity.User;
import com.campusguild.server.repository.UserRepository;
import org.springframework.stereotype.Service;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.jwtTokenProvider = jwtTokenProvider;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    public UserDTO register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BusinessException("用户名已存在");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setNickname(request.getNickname());
        user.setGuildLevel(1);
        user.setPoints(100);
        user.setExperience(0);
        user.setRole("USER");

        user = userRepository.save(user);
        return UserDTO.fromEntity(user);
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BusinessException("用户名或密码错误"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BusinessException("用户名或密码错误");
        }

        if (user.getBanned()) {
            throw new BusinessException("账号已被封禁");
        }

        String token = jwtTokenProvider.generateToken(user.getId(), user.getUsername(), user.getRole());
        return new LoginResponse(token, UserDTO.fromEntity(user));
    }

    public UserDTO getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("用户不存在"));
        return UserDTO.fromEntity(user);
    }
}
