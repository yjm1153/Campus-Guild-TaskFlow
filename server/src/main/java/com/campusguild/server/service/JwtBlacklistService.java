package com.campusguild.server.service;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class JwtBlacklistService {

    private final ConcurrentHashMap<String, Long> blacklist = new ConcurrentHashMap<>();

    public void addToBlacklist(String token, long expiryTimestamp) {
        blacklist.put(token, expiryTimestamp);
    }

    public boolean isBlacklisted(String token) {
        Long expiry = blacklist.get(token);
        if (expiry == null) {
            return false;
        }
        if (Instant.now().toEpochMilli() > expiry) {
            blacklist.remove(token);
            return false;
        }
        return true;
    }

    public void cleanup() {
        long now = Instant.now().toEpochMilli();
        blacklist.entrySet().removeIf(entry -> entry.getValue() < now);
    }
}