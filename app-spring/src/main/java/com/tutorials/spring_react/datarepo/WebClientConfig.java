package com.tutorials.spring_react.datarepo;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

@Configuration
public class WebClientConfig {

   
   @Value("${custom.app.datarepo_host}")
   public String _datarepo_host;
   // public String _datarepo_host = "localhost";

   @Value("${custom.app.datarepo_port}")
   public String _datarepo_port;
   // public String _datarepo_port = "8080";

   @Bean
   public WebClient webClient() {

      String base_url = "http://" + _datarepo_host + ":" + _datarepo_port + "/";

      return WebClient.builder()
         .baseUrl(base_url)
         .build();
   }
}
