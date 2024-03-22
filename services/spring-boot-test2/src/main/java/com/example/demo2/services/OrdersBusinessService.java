package com.example.demo2.services;

import java.util.ArrayList;
import java.util.List;

import com.example.demo2.data.OrdersDataAccessInterface;
import com.example.demo2.models.OrderModel;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

// @Service
public class OrdersBusinessService implements OrdersBusinessServiceInterface{

    @Autowired
    OrdersDataAccessInterface<OrderModel> ordersDAO;

    @Override
    public void test(){
        System.out.println("OrderBusinessService is working");
    }

    @Override
    public List<OrderModel> getOrders(){
        return ordersDAO.getOrders();
    }

    @Override
    public void init(){
        System.out.println("Initializing: " + this.getClass());
    }

    @Override
    public void destroy(){
        System.out.println("Destroying: " + this.getClass());
    }

    @Override
    public long addOne(OrderModel newOrder) {
        return ordersDAO.addOne(newOrder);
    }

    @Override
    public boolean deleteOne(long id) {
        return ordersDAO.deleteOne(id);
    }

    @Override
    public OrderModel getById(long id) {
        return ordersDAO.getById(id);
    }

    @Override
    public List<OrderModel> searchOrders(String searchTerm) {
        return ordersDAO.searchOrders(searchTerm);
    }

    @Override
    public OrderModel updateOne(long idToUpdate, OrderModel updatedModel) {
        return ordersDAO.updateOne(idToUpdate, updatedModel);
    }

}
