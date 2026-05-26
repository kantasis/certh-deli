package com.tutorials.spring_react.security;

import org.springframework.stereotype.Component;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

@Component
public class TokenBlacklistService {
    private final Set<String> blacklist = Collections.synchronizedSet(new HashSet<>());

    public void blacklist(String token) {
        blacklist.add(token);
    }

    public boolean isBlacklisted(String token) {
        return blacklist.contains(token);
    }
}
