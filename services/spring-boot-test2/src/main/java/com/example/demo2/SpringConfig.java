package com.example.demo2;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.annotation.RequestScope;
import org.springframework.web.context.annotation.SessionScope;

import com.example.demo2.data.OrdersDataAccessInterface;
import com.example.demo2.data.OrdersDataService;
import com.example.demo2.data.OrdersDataServiceForRepository;
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

   @Autowired
   DataSource dataSource;

   @Bean(name="ordersDAO")
   @RequestScope
   public OrdersDataAccessInterface getOrdersDataAccessInterface(){
      return new OrdersDataServiceForRepository(dataSource);
      // return new OrdersDataService();
   }

}
