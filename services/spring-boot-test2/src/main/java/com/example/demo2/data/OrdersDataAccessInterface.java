package com.example.demo2.data;

import java.util.List;

import com.example.demo2.models.OrderModel;

public interface OrdersDataAccessInterface {
   public OrderModel getById(long id);
   public List<OrderModel> getOrders();
   public List<OrderModel> searchOrders(String searchTerm);
   public long addOne(OrderModel newOrder);
   public boolean deleteOne(long id);
   public OrderModel updateOne(long idToUpdate, OrderModel updatedModel);
}
