package com.campusguild.server.controller;

import com.campusguild.server.common.Result;
import com.campusguild.server.model.dto.LoginRequest;
import com.campusguild.server.model.dto.RegisterRequest;
import com.campusguild.server.model.dto.UserDTO;
import com.campusguild.server.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public Result<UserDTO> register(@Valid @RequestBody RegisterRequest request) {
        UserDTO user = authService.register(request);
        return Result.success(user);
    }

    @PostMapping("/login")
    public Result<UserDTO> login(@Valid @RequestBody LoginRequest request) {
        UserDTO user = authService.login(request);
        return Result.success(user);
    }
}
