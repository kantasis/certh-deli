package com.example.demo2.data;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Repository;

import com.example.demo2.models.OrderModel;

@Repository
public class OrdersFakeDAO implements OrdersDataAccessInterface{

   List<OrderModel> orders = new ArrayList<OrderModel>();

   public OrdersFakeDAO() {
      for(int i=0; i<10; i++){
          OrderModel x = new OrderModel(0L+i,"Order #"+i,"asdasd"+(i%5),12f,2);
          // System.out.println(x);
          orders.add(x);
      }
   }

   @Override
   public long addOne(OrderModel newOrder) {
      boolean success = orders.add(newOrder);
      return success?1:0;
   }

   @Override
   public boolean deleteOne(long id) {
      return orders.remove(
         this.getById(id)
      );
   }

   @Override
   public OrderModel getById(long id) {
      for(int i=0; i < orders.size(); i++){
         OrderModel current = orders.get(i);
         if (current.getId() == id)
            return current;
      }
      return null;
   }

   @Override
   public List<OrderModel> getOrders() {
      return orders;
   }

   @Override
   public List<OrderModel> searchOrders(String searchTerm) {
      // List<OrderModel> foundItems = new ArrayList<OrderModel>();
      // for(int i=0; i<orders.size(); i++){
      //    OrderModel current = orders.get(i);
      //    if (current.getProductName().toLowerCase().contains(searchTerm.toLowerCase())){
      //       foundItems.add(current);
      //    }
      // }
      // return foundItems;

      // A Better Implementation
      return orders.stream().filter(order -> 
         order.getProductName().toLowerCase().contains(
            searchTerm.toLowerCase()
         )
      ).collect(Collectors.toList());
   }

   @Override
   public OrderModel updateOne(long idToUpdate, OrderModel updatedModel) {
      
      for(int i=0; i<orders.size();i++){
         OrderModel current = orders.get(i);
         if (current.getId() == idToUpdate){
            orders.set(i,updatedModel);
            return current;
         }
      }

      return null;
   }

}
