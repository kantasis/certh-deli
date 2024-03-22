package com.example.demo2.data;

import java.util.ArrayList;
import java.util.List;
import javax.sql.DataSource;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.example.demo2.models.OrderEntity;
import com.example.demo2.models.OrderModel;

@Repository
@Primary
public class OrdersDataServiceForRepository implements OrdersDataAccessInterface<OrderModel>{

   @Autowired
   OrdersRepositoryInterface ordersRepository; 

   private JdbcTemplate jdbcTemplate;

   ModelMapper modelMapper = new ModelMapper();

   public OrdersDataServiceForRepository(DataSource dataSource){
      this.jdbcTemplate = new JdbcTemplate(dataSource);
   }

   @Override
   public boolean deleteOne(long id) {
      ordersRepository.deleteById(id);
      return true;
   }

   @Override
   public OrderModel getById(long id) {
      OrderEntity entity = ordersRepository.findById(id).orElse(null);
      // return new OrderModel(
      //    entity.getId(),
      //    entity.getOrderNo(),
      //    entity.getProductName(),
      //    entity.getPrice(),
      //    entity.getQuantity()
      // );
      OrderModel model = modelMapper.map(entity, OrderModel.class);
      return model;
   }

   @Override
   public List<OrderModel> getOrders() {
      Iterable <OrderEntity> orderEntity_lst = ordersRepository.findAll();
      List <OrderModel> orderModel_lst = new ArrayList<OrderModel>();
      for (OrderEntity item: orderEntity_lst){
         orderModel_lst.add(modelMapper.map(item,OrderModel.class));
      }
      return orderModel_lst;
   }

   @Override
   public List<OrderModel> searchOrders(String searchTerm) {
      Iterable<OrderEntity> orderEntity_lst = ordersRepository.findByProductNameContainingIgnoreCase(searchTerm);
      List <OrderModel> orderModel_lst = new ArrayList<OrderModel>();
      for (OrderEntity order_entity: orderEntity_lst){
         orderModel_lst.add(modelMapper.map(order_entity, OrderModel.class));
      }
      return orderModel_lst;
   }

   @Override
   public OrderModel updateOne(long idToUpdate, OrderModel updatedModel) {
      OrderEntity updated_OrderEntity = modelMapper.map(updatedModel, OrderEntity.class);
      OrderEntity result_OrderEntity = ordersRepository.save(updated_OrderEntity);
      OrderModel result_OrderModel = modelMapper.map(result_OrderEntity,OrderModel.class);
      return result_OrderModel;
   }
   
   @Override
   public long addOne(OrderModel new_OrderModel) {
      OrderEntity new_orderEntity = modelMapper.map(new_OrderModel,OrderEntity.class);
      OrderEntity result_orderEntity = ordersRepository.save(new_orderEntity);
      return result_orderEntity==null?0:result_orderEntity.getId();
   }


}
