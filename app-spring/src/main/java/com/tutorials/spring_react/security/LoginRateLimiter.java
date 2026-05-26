package com.tutorials.spring_react.security;

import org.springframework.stereotype.Component;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class LoginRateLimiter {
    private static final int MAX_ATTEMPTS = 10;
    private static final long WINDOW_MS = 60_000;

    private final ConcurrentHashMap<String, long[]> attempts = new ConcurrentHashMap<>();

    public boolean isAllowed(String ip) {
        long now = System.currentTimeMillis();
        attempts.compute(ip, (key, val) -> {
            if (val == null || now - val[1] > WINDOW_MS) return new long[]{1, now};
            val[0]++;
            return val;
        });
        return attempts.get(ip)[0] <= MAX_ATTEMPTS;
    }
}
