package com.example.demo2.services;

import java.util.ArrayList;
import java.util.List;

import com.example.demo2.models.OrderModel;
import org.springframework.stereotype.Service;

// @Service
public class OrdersBusinessService implements OrdersBusinessServiceInterface{
    @Override
    public void test(){
        System.out.println("OrderBusinessService is working");
    }

    @Override
    public List<OrderModel> getOrders(){
        List<OrderModel> orders = new ArrayList<>();
        for(int i=0; i<10; i++){
            OrderModel x = new OrderModel(0L+i,"Order #"+i,"asdasd",12f,2);
            // System.out.println(x);
            orders.add(x);
        }
        return orders;
    }

}
