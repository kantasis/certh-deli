package com.tutorials.spring_react.controllers;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.util.StringUtils;

import jakarta.validation.Valid;
import com.tutorials.spring_react.security.payloads.ChangePasswordRequest;

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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tutorials.spring_react.models.AuditLogModel;
import com.tutorials.spring_react.models.ERole;
import com.tutorials.spring_react.models.RoleModel;
import com.tutorials.spring_react.models.UserModel;
import com.tutorials.spring_react.repositories.AuditLogRepository;
import com.tutorials.spring_react.repositories.RoleRepository;
import com.tutorials.spring_react.repositories.UserRepository;
import com.tutorials.spring_react.security.JwtUtils;
import com.tutorials.spring_react.security.LoginRateLimiter;
import com.tutorials.spring_react.security.TokenBlacklistService;
import com.tutorials.spring_react.security.UserDetailsImpl;
import com.tutorials.spring_react.security.payloads.JwtResponse;
import com.tutorials.spring_react.security.payloads.LoginRequest;
import com.tutorials.spring_react.security.payloads.MessageResponse;
import com.tutorials.spring_react.security.payloads.SignupRequest;
import com.tutorials.spring_react.security.payloads.UserInfoResponse;
import lombok.extern.log4j.Log4j2;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/auth")
@Log4j2
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

   @Autowired
   TokenBlacklistService tokenBlacklistService;

   @Autowired
   LoginRateLimiter loginRateLimiter;

   @Autowired
   AuditLogRepository auditLogRepository;

   @PostMapping("/login")
   public ResponseEntity<?> authenticateUser(
      HttpServletRequest request,
      @Valid
      @RequestBody
      LoginRequest loginRequest
   ) {
      if (!loginRateLimiter.isAllowed(request.getRemoteAddr())) {
         return ResponseEntity.status(429).body(new MessageResponse("Too many login attempts. Try again later."));
      }

      UsernamePasswordAuthenticationToken userpass = new UsernamePasswordAuthenticationToken(
         
         loginRequest.getUsername(), 
         loginRequest.getPassword()
      );

      Authentication authentication = authenticationManager
         .authenticate(userpass);

      // Block pending users before issuing a token
      UserModel loginUser = userRepository.findByUsername(loginRequest.getUsername())
         .orElseThrow(() -> new RuntimeException("User not found"));
      if (Boolean.FALSE.equals(loginUser.getApproved())) {
         return ResponseEntity.status(403)
            .body(new MessageResponse("Your account is pending approval by an administrator."));
      }

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
         userDetails.getName(),       
         userDetails.getSurname(),
         roles
      );

      auditLogRepository.save(new AuditLogModel("USER_LOGIN", userDetails.getUsername(), null, null));

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
            // System.out.println("Password for new user: " + signupRequest.getPassword());
            // System.out.println("Encoded password: " + passwordEncoder.encode(signupRequest.getPassword()));
            String rawPassword = signupRequest.getPassword();
            String encodedPassword = passwordEncoder.encode(rawPassword);

        

            // Use this encoded password in your UserModel
            UserModel user = new UserModel(
               signupRequest.getUsername(),
               signupRequest.getEmail(),
               encodedPassword, // Save this exact string!
               signupRequest.getName(),
               signupRequest.getSurname()
            );

      // Create new user's account
      // UserModel user = new UserModel(
      //    signupRequest.getUsername(),
      //    signupRequest.getEmail(),
      //    passwordEncoder.encode(signupRequest.getPassword()),
      //    signupRequest.getName(), // name field
      //    signupRequest.getSurname() // surname field
      // );


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
               if ("admin".equals(role_str))
                  roleEnum = ERole.ROLE_ADMIN;
               else if ("mod".equals(role_str))
                  roleEnum = ERole.ROLE_MODERATOR;
               else
                  roleEnum = ERole.ROLE_USER;

               RoleModel roleModel = roleRepository
                  .findByLabel(roleEnum)
                  .orElseThrow( () -> new RuntimeException("Error: Role is not found") );

                  roles_lst.add(roleModel);
            })
         ;
      }
      user.setRoles(roles_lst);
      user.setApproved(false);
      userRepository.save(user);
      auditLogRepository.save(new AuditLogModel("USER_REGISTER", user.getUsername(), null, "Pending approval"));
      return ResponseEntity
         .ok(
            new MessageResponse("Registration successful. Your account is pending approval by an administrator.")
         )
      ;
   }

   @GetMapping("/whoami")
   public ResponseEntity<?> whoami() {

      Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

      Object principal_obj = authentication.getPrincipal();
      String message_str; 
      if (principal_obj instanceof UserDetailsImpl) {
         message_str = ((UserDetailsImpl) principal_obj).getUsername();
      }else{
         message_str = principal_obj.toString();
      }

      log.info("You are: "+message_str);
      return ResponseEntity
         .ok()
         .body(
            new MessageResponse(message_str)
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

   @PostMapping("/logout")
   public ResponseEntity<?> logoutUser(HttpServletRequest request) {
      String headerAuth = request.getHeader("Authorization");
      if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
         tokenBlacklistService.blacklist(headerAuth.substring(7));
      }
      SecurityContextHolder.clearContext();
      return ResponseEntity.ok().body(new MessageResponse("You've been signed out!"));
   }

   @PostMapping("/refresh")
   public ResponseEntity<?> refreshToken() {
      Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
      if (!(authentication.getPrincipal() instanceof UserDetailsImpl)) {
         return ResponseEntity.status(401).body(new MessageResponse("Not authenticated"));
      }
      UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
      String newJwt = jwtUtils.generateJwtTokenForUser(userDetails);
      List<String> roles = userDetails.getAuthorities().stream()
         .map(item -> item.getAuthority())
         .collect(Collectors.toList());
      return ResponseEntity.ok(new JwtResponse(
         newJwt, "Bearer",
         userDetails.getId(), userDetails.getUsername(),
         userDetails.getEmail(), userDetails.getName(), userDetails.getSurname(),
         roles
      ));
   }

   @PostMapping("/update-password")
   public ResponseEntity<?> updatePassword(
      @Valid @RequestBody ChangePasswordRequest request
   ) {
      Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
      
      if (!(authentication.getPrincipal() instanceof UserDetailsImpl)) {
         return ResponseEntity.badRequest().body(new MessageResponse("Error: User not authenticated"));
      }

      UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
      UserModel user = userRepository.findByUsername(userDetails.getUsername())
         .orElseThrow(() -> new RuntimeException("Error: User not found"));

      // Verify old password
      if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
         return ResponseEntity.badRequest().body(new MessageResponse("Error: Old password is incorrect"));
      }

      // Update password
      user.setPassword(passwordEncoder.encode(request.getNewPassword()));
      userRepository.save(user);

      return ResponseEntity.ok(new MessageResponse("Password updated successfully"));
   }


}
