package com.example.demo2.services;

import java.util.ArrayList;
import java.util.List;

import com.example.demo2.models.OrderModel;

import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

// @Service
// @Primary
public class OrdersBusinessService2 implements OrdersBusinessServiceInterface{
    @Override
    public void test(){
        System.out.println("OrderBusinessService is working");
    }

    List<OrderModel> orders;



    @Override
    public List<OrderModel> getOrders(){
        
        for(int i=0; i<3; i++){
            OrderModel x = new OrderModel(0L+i,"Big mac #"+i,"asdasd",12f,2);
            // System.out.println(x);
            orders.add(x);
        }
        return orders;
    }

    @Override
    public void init(){
        System.out.println("Initializing: " + this.getClass());
        orders = new ArrayList<>();
    }

    @Override
    public void destroy(){
        System.out.println("Destroying: " + this.getClass());
    }

}
