package com.ensa.backEnd.models;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.util.Date;
@Component
public class JwtUtils {
    private static final String JWT_SECRET = "MyVeryLongSecretKeyForMyTypescriptReactApplication";
    private int expiresIn = 86400000;

    public String generateToken(User user) {
        return Jwts.builder().setSubject(user.getUserName())
                .claim("id", user.getId())
                .claim("email", user.getEmail())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiresIn))
                .signWith(Keys.hmacShaKeyFor(JWT_SECRET.getBytes()))
                .compact();
    }
}
