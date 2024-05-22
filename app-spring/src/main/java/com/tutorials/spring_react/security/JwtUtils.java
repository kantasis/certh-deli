package com.tutorials.spring_react.security;

import java.security.Key;
import java.util.Date;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtils {
   private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);

   @Value("${custom.app.jwtSecret}")
   private String jwtSecret;

   @Value("${custom.app.jwtExpirationMs}")
   private int jwtExpirationMs;

   public String generateJwtToken(Authentication authentication) {

      UserDetailsImpl userPrincipal = (UserDetailsImpl) authentication.getPrincipal();
      
      Date todayDate = new Date();
      Date expirationDate = new Date(todayDate.getTime() + jwtExpirationMs);

      return Jwts
         .builder()
         .setSubject(userPrincipal.getUsername())
         .setIssuedAt(todayDate)
         .setExpiration(expirationDate)
         .signWith(getKey(), SignatureAlgorithm.HS256)
         .compact();
    }
  
   private Key getKey(){
      return Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
   }

   public String getUsernameFromJwtToken(String token){
      return Jwts
         .parserBuilder()
         .setSigningKey(getKey())
         .build()
         .parseClaimsJws(token)
         .getBody()
         .getSubject();
   }

   public boolean validateJwtToken(String authToken){
      try{
         Jwts
            .parserBuilder()
            .setSigningKey(getKey())
            .build()
            .parse(authToken);
         return true;
      }catch (MalformedJwtException e) {
         logger.error("Invalid JWT token: {}", e.getMessage());
      } catch (ExpiredJwtException e) {
         logger.error("JWT token is expired: {}", e.getMessage());
      } catch (UnsupportedJwtException e) {
         logger.error("JWT token is unsupported: {}", e.getMessage());
      } catch (IllegalArgumentException e) {
         logger.error("JWT claims string is empty: {}", e.getMessage());
      }
      return false;
   }

}
