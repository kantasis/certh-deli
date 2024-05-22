package com.tutorials.spring_react.controllers;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tutorials.spring_react.models.ERole;
import com.tutorials.spring_react.models.RoleModel;
import com.tutorials.spring_react.models.UserModel;
import com.tutorials.spring_react.repositories.RoleRepository;
import com.tutorials.spring_react.repositories.UserRepository;
import com.tutorials.spring_react.security.JwtUtils;
import com.tutorials.spring_react.security.UserDetailsImpl;
import com.tutorials.spring_react.security.payloads.JwtResponse;
import com.tutorials.spring_react.security.payloads.LoginRequest;
import com.tutorials.spring_react.security.payloads.MessageResponse;
import com.tutorials.spring_react.security.payloads.SignupRequest;
import com.tutorials.spring_react.security.payloads.UserInfoResponse;

import jakarta.validation.Valid;

@CrossOrigin(
   origins = "*",
   maxAge = 3600
)
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

   @Autowired
   AuthenticationManager authenticationManager;

   @Autowired
   UserRepository userRepository;

   @Autowired
   RoleRepository roleRepository;

   @Autowired
   PasswordEncoder passwordEncoder;

   @Autowired
   JwtUtils jwtUtils;

   @PostMapping("/login")
   public ResponseEntity<?> authenticateUser(
      @Valid
      @RequestBody
      LoginRequest loginRequest
   ) {

      UsernamePasswordAuthenticationToken userpass = new UsernamePasswordAuthenticationToken(
         loginRequest.getUsername(), 
         loginRequest.getPassword()
      );

      Authentication authentication = authenticationManager
         .authenticate(userpass);

      SecurityContextHolder
         .getContext()
         .setAuthentication(authentication);
      
      String jwt = jwtUtils.generateJwtToken(authentication);
      
      UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
      
      // ResponseCookie jwtCookie = jwtUtils.generateJwtCookie(userDetails);

      List<String> roles = userDetails
         .getAuthorities()
         .stream()
         .map( item ->
            item.getAuthority()
         )
         .collect(Collectors.toList());

      // UserInfoResponse userInfoResponse = new UserInfoResponse(
      //    userDetails.getId(),
      //    userDetails.getUsername(),
      //    userDetails.getEmail(),
      //    roles
      // );

      JwtResponse jwtResponse = new JwtResponse(
         jwt, 
         "Bearer",
         userDetails.getId(), 
         userDetails.getUsername(), 
         userDetails.getEmail(), 
         roles
      );

      return ResponseEntity
         .ok(jwtResponse);

      // return ResponseEntity
      //    .ok()
      //    .header(
      //       HttpHeaders.SET_COOKIE, jwtCookie.toString()
      //    )
      //    .body(userInfoResponse);
   }

   @PostMapping("/register")
   public ResponseEntity<?> registerUser(
      @Valid
      @RequestBody
      SignupRequest signupRequest
   ) {
      if (userRepository.existsByUsername(signupRequest.getUsername()))
         return ResponseEntity
            .badRequest()
            .body(new MessageResponse("Error: Username is already taken!"))
         ;

      if (userRepository.existsByEmail(signupRequest.getEmail()))
         return ResponseEntity
            .badRequest()
            .body(new MessageResponse("Error: Email is already in use!"))
         ;


      // Create new user's account
      UserModel user = new UserModel(
         signupRequest.getUsername(),
         signupRequest.getEmail(),
         passwordEncoder.encode(signupRequest.getPassword())
      );


      // This entire section if hurtful to watch
      Set<String> roles_strLst = signupRequest.getRoles();
      Set<RoleModel> roles_lst = new HashSet<>();

      if (roles_strLst==null){
         RoleModel userRole = roleRepository
            .findByLabel(ERole.ROLE_USER)
            .orElseThrow( () ->
               new RuntimeException("Error: Role is not found")
            )
         ;
         roles_lst.add(userRole);
      } else {
         roles_strLst
            .forEach( role_str -> {
               ERole roleEnum;
               if ( role_str == "admin" )
                  roleEnum = ERole.ROLE_ADMIN;
               else if ( role_str == "mod" )
                  roleEnum = ERole.ROLE_MODERATOR;
               else
                  // TODO: This one should not be the default case
                  roleEnum = ERole.ROLE_USER;

               RoleModel roleModel = roleRepository
                  .findByLabel(roleEnum)
                  .orElseThrow( () -> new RuntimeException("Error: Role is not found") );

                  roles_lst.add(roleModel);
            })
         ;
      }
      user.setRoles(roles_lst);
      userRepository.save(user);
      return ResponseEntity
         .ok(
            new MessageResponse("User registered successfully")
         )
      ;
   }

   // @PostMapping("/logout")
   // public ResponseEntity<?> logoutUser() {
   //    ResponseCookie cookie = jwtUtils.getCleanJwtCookie();
   //    return ResponseEntity
   //       .ok()
   //       .header(
   //          HttpHeaders.SET_COOKIE, 
   //          cookie.toString()
   //       )
   //       .body(
   //          new MessageResponse("You've been signed out")
   //       )
   //    ;
   // }

}
