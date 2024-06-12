package com.tutorials.spring_react.datarepo;

import java.util.Date;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DataUpdateController {

      @Autowired
   DataUpdateService dataUpdateService;

   // TODO: Put this behind authentication
   // TODO: Return whether it was a success or a failure
   @GetMapping("/api/v1/update")
   public String hello() {
      dataUpdateService.getData();
      dataUpdateService.importDataset();
      
      return "Data update completed";      
   }


}
