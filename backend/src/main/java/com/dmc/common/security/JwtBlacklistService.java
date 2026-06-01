package com.dmc.common.security;

import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Iterator;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Service
public class JwtBlacklistService {

    private final Map<String, Instant> blacklist = new ConcurrentHashMap<>();
    
    public JwtBlacklistService() {
        ScheduledExecutorService executor = Executors.newSingleThreadScheduledExecutor(r -> {
            Thread t = new Thread(r, "jwt-blacklist-cleanup");
            t.setDaemon(true);
            return t;
        });
        
        executor.scheduleAtFixedRate(() -> {
            Instant now = Instant.now();
            blacklist.values().removeIf(expiry -> expiry.isBefore(now));
        }, 15, 15, TimeUnit.MINUTES);
    }

    public void blacklist(String jti, Duration ttl) {
        if (jti == null || jti.isBlank()) {
            return;
        }
        blacklist.put(jti, Instant.now().plus(ttl));
    }

    public boolean isBlacklisted(String jti) {
        if (jti == null || jti.isBlank()) {
            return false;
        }
        Instant expiry = blacklist.get(jti);
        if (expiry == null) {
            return false;
        }
        if (expiry.isBefore(Instant.now())) {
            blacklist.remove(jti);
            return false;
        }
        return true;
    }
}
