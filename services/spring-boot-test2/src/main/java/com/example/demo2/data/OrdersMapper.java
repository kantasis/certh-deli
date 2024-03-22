package com.example.demo2.data;

import java.sql.ResultSet;
import java.sql.SQLException;

import org.springframework.jdbc.core.RowMapper;
import org.springframework.lang.Nullable;

import com.example.demo2.models.OrderModel;

public class OrdersMapper implements RowMapper<OrderModel>{

   @Override
   @Nullable
   public OrderModel mapRow(ResultSet rs, int rowNum) throws SQLException {
      return new OrderModel(
         rs.getLong("id"), 
         rs.getString("orderNo"), 
         rs.getString("productName"),
         rs.getFloat("price"),
         rs.getInt("quantity")
      );
   }

}
