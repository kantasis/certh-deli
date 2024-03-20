package com.example.demo2;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.example.demo2.services.OrdersBusinessService;
import com.example.demo2.services.OrdersBusinessServiceInterface;

@Configuration
public class SpringConfig {

    @Bean(name="ordersBusinessService")
    public OrdersBusinessServiceInterface getOrderBusinessServiceInterface(){
        return new OrdersBusinessService();
    }

}
