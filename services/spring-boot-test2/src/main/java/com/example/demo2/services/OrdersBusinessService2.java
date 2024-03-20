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

    @Override
    public List<OrderModel> getOrders(){
        List<OrderModel> orders = new ArrayList<>();
        for(int i=0; i<3; i++){
            OrderModel x = new OrderModel(0L+i,"Big mac #"+i,"asdasd",12f,2);
            // System.out.println(x);
            orders.add(x);
        }
        return orders;
    }

}
