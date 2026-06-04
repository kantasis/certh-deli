package com.tutorials.spring_react.controllers;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.tutorials.spring_react.models.ERole;
import com.tutorials.spring_react.models.RoleModel;
import com.tutorials.spring_react.models.UserModel;
import com.tutorials.spring_react.repositories.RoleRepository;
import com.tutorials.spring_react.repositories.UserRepository;
import com.tutorials.spring_react.models.AuditLogModel;
import com.tutorials.spring_react.repositories.AuditLogRepository;
import com.tutorials.spring_react.security.payloads.AdminPasswordResetRequest;
import com.tutorials.spring_react.security.payloads.MessageResponse;
import com.tutorials.spring_react.security.payloads.NameUpdateRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuditLogRepository auditLogRepository;

    private String currentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null ? auth.getName() : "unknown";
    }

    // 🔹 Get all users (Moderator or Admin)
    @GetMapping
    @PreAuthorize("hasRole('MODERATOR')")
    public List<UserModel> getAllUsers() {
        return userRepository.findAll();
    }

    // 🔹 Get pending users (approved = false)
    @GetMapping("/pending")
    @PreAuthorize("hasRole('MODERATOR')")
    public List<UserModel> getPendingUsers() {
        return userRepository.findAll().stream()
                .filter(u -> Boolean.FALSE.equals(u.getApproved()))
                .collect(java.util.stream.Collectors.toList());
    }

    // 🔹 Approve a user
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    public MessageResponse approveUser(@PathVariable String id) {
        UserModel user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: User not found with id " + id));
        user.setApproved(true);
        userRepository.save(user);
        auditLogRepository.save(new AuditLogModel("USER_APPROVED", currentUsername(), user.getUsername(), null));
        return new MessageResponse("User approved successfully");
    }

    // 🔹 Reject (delete) a pending user
    @DeleteMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    public MessageResponse rejectUser(@PathVariable String id) {
        userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: User not found with id " + id));
        String rejUsername = userRepository.findById(id).map(UserModel::getUsername).orElse(id);
        userRepository.deleteById(id);
        auditLogRepository.save(new AuditLogModel("USER_REJECTED", currentUsername(), rejUsername, null));
        return new MessageResponse("User rejected and removed");
    }

    // 🔹 Delete a user
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('MODERATOR')")
    public MessageResponse deleteUser(@PathVariable String id) {
        userRepository.findById(id).orElseThrow(() -> new RuntimeException("Error: User not found with id " + id));

        String username = userRepository.findById(id).map(UserModel::getUsername).orElse(id);
        userRepository.deleteById(id);
        auditLogRepository.save(new AuditLogModel("USER_DELETED", currentUsername(), username, null));
        return new MessageResponse("User deleted successfully");
    }

    // Update user's name and surname
    @PutMapping("/{id}/name")
    @PreAuthorize("hasRole('MODERATOR')")
    public MessageResponse updateUserNames(
            @PathVariable String id,
            @RequestBody NameUpdateRequest request) {

        UserModel user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: User not found with id " + id));

        user.setName(request.getName());
        user.setSurname(request.getSurname());

        userRepository.save(user);

        return new MessageResponse("User name and surname updated successfully");
    }

    // 🔹 Reset a user's password (admin only — no old password required)
    @PutMapping("/{id}/password")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    public MessageResponse resetUserPassword(@PathVariable String id,
                                             @RequestBody AdminPasswordResetRequest request) {
        UserModel user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: User not found with id " + id));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        auditLogRepository.save(new AuditLogModel("PASSWORD_RESET", currentUsername(), user.getUsername(), null));
        return new MessageResponse("Password updated successfully");
    }

    // 🔹 Update user roles
    @PutMapping("/{id}/roles")
    @PreAuthorize("hasRole('MODERATOR')")
    public MessageResponse updateUserRoles(@PathVariable String id, @RequestBody Set<String> rolesStr) {
        UserModel user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: User not found with id " + id));

        Set<RoleModel> newRoles = new HashSet<>();
        for (String roleName : rolesStr) {
            ERole roleEnum;
            switch (roleName.toUpperCase()) {
                case "ADMIN":
                case "ROLE_ADMIN":
                    roleEnum = ERole.ROLE_ADMIN;
                    break;
                case "MODERATOR":
                case "ROLE_MODERATOR":
                    roleEnum = ERole.ROLE_MODERATOR;
                    break;
                case "USER":
                case "ROLE_USER":
                default:
                    roleEnum = ERole.ROLE_USER;
                    break;
            }

            RoleModel roleModel = roleRepository.findByLabel(roleEnum)
                    .orElseThrow(() -> new RuntimeException("Error: Role not found: " + roleEnum));

            newRoles.add(roleModel);
        }

        String oldRoles = user.getRoles().stream()
                .map(r -> r.getLabel().name())
                .collect(java.util.stream.Collectors.joining(", "));
        user.setRoles(newRoles);
        userRepository.save(user);
        String newRolesList = String.join(", ", rolesStr);
        String details = oldRoles + " -> " + newRolesList;
        auditLogRepository.save(new AuditLogModel("ROLE_CHANGED", currentUsername(), user.getUsername(), details));
        return new MessageResponse("User roles updated successfully");
    }
}