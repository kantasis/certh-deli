package com.example.demo2;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.annotation.RequestScope;
import org.springframework.web.context.annotation.SessionScope;

import com.example.demo2.services.OrdersBusinessService;
import com.example.demo2.services.OrdersBusinessService2;
import com.example.demo2.services.OrdersBusinessServiceInterface;

@Configuration
public class SpringConfig {

    @Bean(name="ordersBusinessService", initMethod="init", destroyMethod = "destroy")
    @RequestScope
    // @SessionScope
    public OrdersBusinessServiceInterface getOrderBusinessServiceInterface(){
        return new OrdersBusinessService2();
    }

}
