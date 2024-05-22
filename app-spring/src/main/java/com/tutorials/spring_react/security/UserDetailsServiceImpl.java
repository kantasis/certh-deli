package com.tutorials.spring_react.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.tutorials.spring_react.models.UserModel;
import com.tutorials.spring_react.repositories.UserRepository;

import jakarta.transaction.Transactional;

@Service
public class UserDetailsServiceImpl implements UserDetailsService{

   @Autowired
   private UserRepository userRepository;

   @Override
   @Transactional
   public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException{
      // So: We query the repository for the user
      // We put the data in a UserModel instance
      // Then we put that data in a UserDetailsImpl instance
      // Which will be passed as a UserDetails reference
      UserModel user = userRepository.findByUsername(username)
         .orElseThrow( () -> new UsernameNotFoundException("User not found with username:" + username));
      return UserDetailsImpl.build(user);
   }


}
