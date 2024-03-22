package com.example.demo2.data;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.simple.SimpleJdbcInsert;
import org.springframework.stereotype.Repository;
import com.example.demo2.models.OrderModel;

@Repository
public class OrdersDataService implements OrdersDataAccessInterface {

   @Autowired
   DataSource dataSource;

   @Autowired
   JdbcTemplate jdbcTemplate;

   @Override
   public long addOne(OrderModel newOrder) {
      
      String query_str = """
         INSERT INTO orders_tbl
            (orderNo, productName, price, quantity)
         VALUES
            (?,?,?,?);
      """;

      // int affectedRows_int = jdbcTemplate.update(
      //    query_str,
      //    newOrder.getOrderNo(),
      //    newOrder.getProductName(),
      //    newOrder.getPrice(),
      //    newOrder.getQuantity()
      // );
      
      // instead of the above, try this one to return the key of the inserted row
      SimpleJdbcInsert simpleJdbcInsert = new SimpleJdbcInsert(jdbcTemplate);
      simpleJdbcInsert.withTableName("orders_tbl").usingGeneratedKeyColumns("id");

      // create a map of the column names
      Map <String, Object> parameters_map = new HashMap<String,Object>();
      parameters_map.put("orderNo",newOrder.getOrderNo());
      parameters_map.put("productName",newOrder.getProductName());
      parameters_map.put("price",newOrder.getPrice());
      parameters_map.put("quantity",newOrder.getQuantity());

      Number result = simpleJdbcInsert.executeAndReturnKey(parameters_map);
      System.out.println("GK>  " + result);
      return result.longValue(); 
   }

   @Override
   public boolean deleteOne(long id) {
      String query_str = """
         DELETE FROM orders_tbl
         WHERE id = ?
      """;

      int affectedRows_int = jdbcTemplate.update(
         query_str,
         id
      );
      
      return affectedRows_int > 0;
   }

   @Override
   public OrderModel getById(long id) {
      
      String query_str = """
         SELECT
            *
         FROM orders_tbl
         WHERE id=?;
      """;

      List <OrderModel> result = jdbcTemplate.query(
         query_str,
         new OrdersMapper(),
         id
      );

      return result.size()==0?null:result.get(0);
   }

   @Override
   public List<OrderModel> getOrders() {
      List<OrderModel> results = jdbcTemplate.query("SELECT * FROM orders_tbl;", new OrdersMapper());
      return results;
   }

   @Override
   public List<OrderModel> searchOrders(String searchTerm) {
      String query_str = """
         SELECT
            *
         FROM orders_tbl
         WHERE productName like ?;
      """;

      List <OrderModel> result = jdbcTemplate.query(
         query_str,
         new OrdersMapper(),
         "%"+searchTerm+"%"
      );

      return result;
   }

   @Override
   public OrderModel updateOne(long idToUpdate, OrderModel updatedModel) {
      String query_str = """
         UPDATE orders_tbl
         SET
         id = ?,
         orderNo = ?,
         productName = ?,
         price = ?,
         quantity = ?
         WHERE id = ?
      """;

      int affectedRows_int = jdbcTemplate.update(
         query_str,
         updatedModel.getId(),
         updatedModel.getOrderNo(),
         updatedModel.getProductName(),
         updatedModel.getPrice(),
         updatedModel.getQuantity(),
         idToUpdate
      );
      
      return affectedRows_int>0?updatedModel:null;
   }

}
