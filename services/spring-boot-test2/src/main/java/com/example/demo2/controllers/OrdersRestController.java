package com.example.demo2.controllers;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo2.models.OrderModel;
import com.example.demo2.services.OrdersBusinessService;
import com.example.demo2.services.OrdersBusinessServiceInterface;

@RestController
@RequestMapping("/api/v1/orders")
public class OrdersRestController {

   OrdersBusinessServiceInterface service;
   
   @Autowired
   public OrdersRestController(OrdersBusinessServiceInterface service) {
      this.service = service;
   }

   @GetMapping("/")
   public List<OrderModel> showAllOrders(){
      return service.getOrders();
   }

   @GetMapping("/search/{searchTerm}")
   public List<OrderModel> searchOrders(
      @PathVariable(name="searchTerm") 
      String searchTerm
   ){
      return service.searchOrders(searchTerm);
   }

   @PostMapping("/")
   public long addOrder(
      @RequestBody
      OrderModel model
   ){
      return service.addOne(model);
   }

   @GetMapping("/{id}")
   public OrderModel getById(
      @PathVariable(name="id")
      long id
   ){
      return service.getById(id);
   }

   @GetMapping("/delete/{id}")
   public boolean deleteById(
      @PathVariable(name="id")
      long id
   ){
      return service.deleteOne(id);
   }

   @PutMapping("/update/{id}")
   public OrderModel updateOrder(
      @PathVariable(name="id")
      long id,
      @RequestBody
      OrderModel model
   ){
      return service.updateOne(id,model);
   }

}
