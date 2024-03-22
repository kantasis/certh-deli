package com.example.demo2;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.annotation.RequestScope;
import org.springframework.web.context.annotation.SessionScope;

import com.example.demo2.data.OrdersDataAccessInterface;
import com.example.demo2.data.OrdersDataService;
import com.example.demo2.services.OrdersBusinessService;
import com.example.demo2.services.OrdersBusinessServiceInterface;

@Configuration
public class SpringConfig {

   @Bean(name="ordersBusinessService", initMethod="init", destroyMethod = "destroy")
   @RequestScope
   // @SessionScope
   public OrdersBusinessServiceInterface getOrderBusinessServiceInterface(){
      return new OrdersBusinessService();
   }

   @Bean(name="ordersDAO")
   @RequestScope
   // @SessionScope
   public OrdersDataAccessInterface getOrdersDataAccessInterface(){
      return new OrdersDataService();
   }

}
