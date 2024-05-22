package com.tutorials.spring_react.security;


import java.io.IOException;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

public class AuthTokenFilter extends OncePerRequestFilter{

   @Autowired
   private JwtUtils jwtUtils;

   @Autowired
   private UserDetailsServiceImpl userDetailsService;

   private static final Logger logger = LoggerFactory.getLogger(AuthTokenFilter.class);

   @Override
   protected void doFilterInternal(
      HttpServletRequest request,
      HttpServletResponse response,
      FilterChain filterChain
   ) throws ServletException, IOException{
      try {
         String jwt = parseJwt(request);
         System.out.println("--- GK> Trying to authorize: "+ jwt);
         if (jwt == null || !jwtUtils.validateJwtToken(jwt)){
            filterChain.doFilter(request, response);
            return;
         }

         // TODO: Fix this dumb name
         String username = jwtUtils.getUsernameFromJwtToken(jwt);
         // At this point, I don't know which classes or functions
         // I've implemented myself and which ones are from libraries
         UserDetails userDetails = userDetailsService.loadUserByUsername(username);

         UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
            userDetails, 
            null,
            userDetails.getAuthorities()
         );

         authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
         SecurityContextHolder.getContext().setAuthentication(authentication);

      }catch (Exception e){
         // Based exception handling
         logger.error("Cannot set user authentication {}",e);
      }

      filterChain.doFilter(request, response);

   }

   // Dumbest use of a function I've seen here!
   private String parseJwt(HttpServletRequest request){
      String headerAuth = request.getHeader("Authorization");
      if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer "))
         return headerAuth.substring(7, headerAuth.length());
      return null;
   }

}
