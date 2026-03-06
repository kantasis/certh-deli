package com.tutorials.spring_react.controllers;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.tutorials.spring_react.models.ERole;
import com.tutorials.spring_react.models.RoleModel;
import com.tutorials.spring_react.models.UserModel;
import com.tutorials.spring_react.repositories.RoleRepository;
import com.tutorials.spring_react.repositories.UserRepository;
import com.tutorials.spring_react.security.payloads.MessageResponse;
import com.tutorials.spring_react.security.payloads.NameUpdateRequest;

@RestController
@RequestMapping("/api/v1/users")
@CrossOrigin(origins = "*", maxAge = 3600)
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    // 🔹 Get all users (Moderator or Admin)
    @GetMapping
    @PreAuthorize("hasRole('MODERATOR')")
    public List<UserModel> getAllUsers() {
        // Fetch all users, roles will be EAGER loaded
        return userRepository.findAll();
    }

    // 🔹 Delete a user
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('MODERATOR')")
    public MessageResponse deleteUser(@PathVariable String id) {
        userRepository.findById(id).orElseThrow(() -> new RuntimeException("Error: User not found with id " + id));

        userRepository.deleteById(id);
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

        user.setRoles(newRoles);
        userRepository.save(user);

        return new MessageResponse("User roles updated successfully");
    }
}