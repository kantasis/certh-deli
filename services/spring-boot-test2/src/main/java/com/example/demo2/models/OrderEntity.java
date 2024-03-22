package com.example.demo2.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

@Table("orders_tbl")
public class OrderEntity {

    @Id
    @Column("id")
    Long id = 0L;
    
    @Column("orderNo")
    String orderNo = "";

    @Column("productName")
    String productName = "";

    @Column("price")
    float price = 0;

    @Column("quantity")
    int quantity = 0;
    
    @Override
    public String toString() {
        return "OrderEntity [id=" + id + ", orderNo=" + orderNo + ", productName=" + productName + ", price=" + price
            + ", quantity=" + quantity + "]";
    }

    public OrderEntity() {
    }

    public OrderEntity(Long id, String orderNo, String productName, float price, int quantity) {
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
