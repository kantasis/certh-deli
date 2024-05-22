package com.tutorials.spring_react.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

// Class annotation for a row/document of a db
@Entity
@Table(name="roles_tbl")
@NoArgsConstructor
// Add setters and getters
@Data
public class RoleModel {

   @Id
   @GeneratedValue(strategy=GenerationType.IDENTITY)
   private Long id;

   @Enumerated(EnumType.STRING)
   @Column(length=20)
   private ERole label;

   public RoleModel(ERole role_name) {
      this.label = role_name;
   }

}
