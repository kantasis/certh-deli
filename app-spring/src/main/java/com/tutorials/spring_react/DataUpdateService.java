package com.tutorials.spring_react;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.ClientResponse;
import org.springframework.web.reactive.function.client.WebClient;

import reactor.core.publisher.Mono;

@Service
public class DataUpdateService {

   private static final String login_endpoint="v1/services/login/";
   private static final String data_endpoint="v1/retrospective/fused_european_only_new/";
   private static final String test_endpoint="/api/v1/content/all";
   

   @Value("${custom.app.datarepo_host}")
   public String _datarepo_host;

   @Value("${custom.app.datarepo_port}")
   public String _datarepo_port;

   @Value("${custom.app.datarepo_user}")
   private String _datarepo_user;

   @Value("${custom.app.datarepo_pass}")
   private String _datarepo_pass;

   private WebClient webClient = WebClient.create(_datarepo_host+":"+_datarepo_port+"/");

   public String getTemp(){
      return _datarepo_host+":"+_datarepo_port+"/";
   }

   public String login(){

      String response = webClient
         .get()
         .uri(test_endpoint)
         .retrieve()
         .bodyToMono(String.class) // Returns a Mono<String> object
         .block() // Gets the String from the Mono
      ;
         

         // .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
         // .body(Mono.just(employee), Employee.class)
         // .bodyToMono(Employee.class);



      
      System.out.println("Someone entered the service: "+ response);
      return response;
   }

   public void getDataset(String collection_name){

   }

}
