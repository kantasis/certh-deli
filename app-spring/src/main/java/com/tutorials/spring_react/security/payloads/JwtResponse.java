package com.tutorials.spring_react.security.payloads;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class JwtResponse {

   private String token;
   private String type = "Bearer";
   private String id;
   private String username;
   private String email;
   private String name;
   private String surname;
   private List<String> roles;

   public JwtResponse(String token, String id, String username, String email, String name, String surname,
         List<String> roles) {
      this.token = token;
      this.id = id;
      this.username = username;
      this.email = email;
      this.name = name;
      this.surname = surname;
      this.roles = roles;
   }

}
