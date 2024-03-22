package com.example.demo2.controllers;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import com.example.demo2.models.OrderModel;
import com.example.demo2.models.SearchModel;
import com.example.demo2.services.OrdersBusinessService;
import com.example.demo2.services.OrdersBusinessServiceInterface;

import jakarta.validation.Valid;

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

    @GetMapping("/showNewOrderForm")
    public String showNewForm(Model model){
        // Pass a new empty OrderModel to the webpage for the form to populate it with data
        model.addAttribute("blank_orderModel", new OrderModel());
        return "addNewOrderForm.html";
    }

    @PostMapping("/addNew")
    public String addNew(
        @Valid
        OrderModel new_OrderModel,
        BindingResult bindingResult,
        Model model
    ){
        // processing here
        new_OrderModel.setId(null);
        // add to the db
        service.addOne(new_OrderModel);
        // get all orders from db
        List <OrderModel> orders = service.getOrders();

        // display them all in the orders page
        model.addAttribute("orders", orders);
        return "orders.html";
    }

    @GetMapping("/showSearchForm")
    public String showSearchForm(Model model){
        model.addAttribute("searchModel", new SearchModel());
        return "searchForm.html";
    }

    @PostMapping("/search")
    public String search(
        @Valid
        SearchModel searchModel,
        BindingResult bindingResult,
        Model model
    ){

        String searchTerm = searchModel.getSearchTerm();
        List <OrderModel> orders = service.searchOrders(searchTerm);

        model.addAttribute("orders", orders);
        return "orders.html";
    }

    @GetMapping("/admin")
    public String showAdminPage(Model model){

        List<OrderModel> orders = service.getOrders();
        model.addAttribute("title", "here is what I want to do this summer");
        model.addAttribute("orders", orders);
        return "ordersAdmin.html";
    }

    @PostMapping("/doUpdate")
    public String doUpdate(
        @Valid
        OrderModel orderModel,
        BindingResult bindingResult,
        Model model
    ){

        System.out.println("GK> " + orderModel);
        service.updateOne(orderModel.getId(), orderModel);
        List <OrderModel> orders = service.getOrders();

        model.addAttribute("orders", orders);
        return "ordersAdmin.html";
    }


    @PostMapping("/editForm")
    public String displayEditForm(
        @Valid
        OrderModel orderModel,
        BindingResult bindingResult,
        Model model
    ){
        model.addAttribute("title", "Edit Order");
        model.addAttribute("orderModel", orderModel);
        return "editForm.html";
    }

    @PostMapping("/delete")
    public String deleteOrder(
        @Valid
        OrderModel orderModel,
        BindingResult bindingResult,
        Model model
    ){
        service.deleteOne(orderModel.getId());

        List <OrderModel> orders = service.getOrders();
        model.addAttribute("orders", orders);
        return "ordersAdmin.html";
    }


}
