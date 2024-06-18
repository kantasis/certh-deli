package com.tutorials.spring_react.datarepo;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

   @Value("${custom.app.datarepo_host}")
   public String _datarepo_host;

   @Value("${custom.app.datarepo_port}")
   public String _datarepo_port;

   @Bean
   public WebClient webClient() {
      String base_url = "http://" + _datarepo_host + ":" + _datarepo_port + "/";
      return WebClient.builder()
         .baseUrl(base_url)
         .build();
   }
}
