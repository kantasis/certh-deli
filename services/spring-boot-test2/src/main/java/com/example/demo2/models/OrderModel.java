package com.example.demo2.models;

public class OrderModel {
    Long id = 0L;
    String orderNo = "";
    String productName = "";
    float price = 0;
    int quantity = 0;
    
    @Override
    public String toString() {
        return "OrderModel [id=" + id + ", orderNo=" + orderNo + ", productName=" + productName + ", price=" + price
                + ", quantity=" + quantity + "]";
    }

    public OrderModel() {
    }

    public OrderModel(Long id, String orderNo, String productName, float price, int quantity) {
        this.id = id;
        this.orderNo = orderNo;
        this.productName = productName;
        this.price = price;
        this.quantity = quantity;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getOrderNo() {
        return orderNo;
    }

    public void setOrderNo(String orderNo) {
        this.orderNo = orderNo;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public float getPrice() {
        return price;
    }

    public void setPrice(float price) {
        this.price = price;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    
}
