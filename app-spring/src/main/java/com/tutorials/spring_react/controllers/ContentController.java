package com.tutorials.spring_react.controllers;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin(
   origins = "*",
   maxAge = 3600
)
@RestController
@RequestMapping("/api/v1/content")
public class ContentController {

   @GetMapping("/all")
   public String publicContent(){
      return "Public Content";
   }

   @GetMapping("/user")
   @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
   public String userContent(){
      return "User Content";
   }

   @GetMapping("/mod")
   @PreAuthorize("hasRole('MODERATOR') or hasRole('ADMIN')")
   public String modContent(){
      return "Moderator Content";
   }

   @GetMapping("/admin")
   @PreAuthorize("hasRole('ADMIN')")
   public String adminContent(){
      return "Admin Content";
   }

}
