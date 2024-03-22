package com.example.demo2.data;

import java.util.List;

public interface OrdersDataAccessInterface <T>{
   public T getById(long id);
   public List<T> getOrders();
   public List<T> searchOrders(String searchTerm);
   public long addOne(T newOrder);
   public boolean deleteOne(long id);
   public T updateOne(long idToUpdate, T updatedModel);
}
