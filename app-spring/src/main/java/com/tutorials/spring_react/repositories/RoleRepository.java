package com.tutorials.spring_react.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tutorials.spring_react.models.ERole;
import com.tutorials.spring_react.models.RoleModel;

@Repository
public interface RoleRepository extends JpaRepository<RoleModel, Long> {

   Optional<RoleModel> findByLabel(ERole label);

}
