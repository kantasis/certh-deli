package com.example.demo2.services;

import com.example.demo2.models.OrderModel;
import java.util.List;

public interface OrdersBusinessServiceInterface {
    public void test();
    public List<OrderModel> getOrders();

    public void init();

    public void destroy();

    public OrderModel getById(long id);
    public List<OrderModel> searchOrders(String searchTerm);
    public long addOne(OrderModel newOrder);
    public boolean deleteOne(long id);
    public OrderModel updateOne(long idToUpdate, OrderModel updatedModel);
 }
