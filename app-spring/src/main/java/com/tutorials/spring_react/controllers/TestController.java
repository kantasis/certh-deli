package com.tutorials.spring_react.controllers;

import java.util.Date;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tutorials.spring_react.datarepo.DataUpdateService;
import com.tutorials.spring_react.security.JwtUtils;

@RestController
public class TestController {


   @Autowired
   DataUpdateService dataUpdateService;

   // TODO: The port should be referenced here: HOST_NODE_PORT
   // @CrossOrigin(origins = "http://localhost:9080")
   
   @GetMapping("/hello")
   public String hello() {

      // String jwt_str = dataUpdateService.getTemp();
      // String jwt_str = dataUpdateService.getData();
      dataUpdateService.login();
      
      return "Hello, Spring Boot!!!! "+new Date();
   }

}
