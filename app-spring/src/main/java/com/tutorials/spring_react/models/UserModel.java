package com.tutorials.spring_react.models;

import java.util.HashSet;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.HashSet;
import java.util.Set;

import org.hibernate.annotations.GenericGenerator;

// Class annotation for a row/document of a db
@Entity
@Table(name = "users_tbl", uniqueConstraints = {
      @UniqueConstraint(columnNames = "username"),
      @UniqueConstraint(columnNames = "email")
})
@NoArgsConstructor
// Add setters and getters

@Data
public class UserModel {

   @Id
   // @GeneratedValue(strategy = GenerationType.IDENTITY)
   @GeneratedValue(generator = "uuid")
   @GenericGenerator(name = "uuid", strategy = "uuid2")
   @Column(name = "id")
   private String id;

   @NotBlank
   @Size(min = 3, max = 50)
   private String username;

   @NotBlank
   @Size(max = 50)
   @Email
   private String email;

   @NotBlank
   @Size(max = 120)
   private String password;

   @NotBlank
   @Size(max = 100) // You can adjust the max length as needed
   private String name;

   @NotBlank
   @Size(max = 100) // You can adjust the max length as needed
   private String surname;

   @ManyToMany(fetch = FetchType.EAGER)
   @JoinTable(name = "user_roles_tbl", joinColumns = @JoinColumn(name = "user_id"), inverseJoinColumns = @JoinColumn(name = "role_id"))

   private Set<RoleModel> roles = new HashSet<>();

   public UserModel(String username, String email, String password, String name, String surname) {
      this.username = username;
      this.email = email;
      this.password = password;
      this.name = name;
      this.surname = surname;
   }

}
