package com.example.demo2.controllers;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import com.example.demo2.models.OrderModel;
import com.example.demo2.services.OrdersBusinessService;
import com.example.demo2.services.OrdersBusinessServiceInterface;

@Controller
@RequestMapping("/orders")
public class OrderController {

    OrdersBusinessServiceInterface service;
    
    @Autowired
    public OrderController(OrdersBusinessServiceInterface service) {
        this.service = service;
    }

    @GetMapping
    public String showAllOrders(Model model){

        List<OrderModel> orders = service.getOrders();

        model.addAttribute("title", "here is what I want to do this summer");
        model.addAttribute("orders", orders);

        return "orders.html";
    }

}
