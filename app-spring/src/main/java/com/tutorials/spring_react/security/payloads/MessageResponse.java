package com.tutorials.spring_react.security.payloads;

public class MessageResponse {
   private String message;

   public String getMessage() {
      return message;
   }

   public void setMessage(String message) {
      this.message = message;
   }

   public MessageResponse(String message) {
      this.message = message;
   }
   
}
