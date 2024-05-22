package com.tutorials.spring_react.controllers;

import java.util.Date;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

   
   // TODO: The port should be referenced here: HOST_NODE_PORT
   // @CrossOrigin(origins = "http://localhost:9080")
   
   @GetMapping("/hello")
   public String hello() {
      System.out.println("--- GK> Someone said hi!");
      return "Hello, Spring Boot!!!! "+new Date();
   }

}
