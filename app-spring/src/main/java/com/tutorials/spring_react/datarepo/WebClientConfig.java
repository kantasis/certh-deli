package com.tutorials.spring_react.datarepo;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

   
   // @Value("${custom.app.datarepo_host}")
   // public String _datarepo_host;
   public String _datarepo_host = "localhost";

   // @Value("${custom.app.datarepo_port}")
   // public String _datarepo_port;
   public String _datarepo_port = "8080";

   @Value("${custom.app.datarepo_user}")
   private String _datarepo_user;

   @Value("${custom.app.datarepo_pass}")
   private String _datarepo_pass;

   @Bean
   public WebClient webClient() {

      String base_url = "http://" + _datarepo_host + ":" + _datarepo_port + "/";

      System.out.println("--- GK> Getting a new WebClient from the configuration: "+ base_url);

      return WebClient.builder()
         .baseUrl(base_url)
         .build();
   }

}
