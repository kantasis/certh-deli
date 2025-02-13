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
   private List<String> roles;

}
