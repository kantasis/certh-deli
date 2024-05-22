package com.tutorials.spring_react.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tutorials.spring_react.models.UserModel;

@Repository
public interface UserRepository extends JpaRepository<UserModel, Long> {

   Optional<UserModel> findByUsername(String username);
   Boolean existsByUsername(String username);
   Boolean existsByEmail(String email);

}
