package com.tutorials.spring_react.datarepo;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
public class DataSourceConfig {

   // @Bean
   // @Qualifier("postgres")
   // // @Primary
   // @ConfigurationProperties(prefix = "postgres.datasource")
   // public DataSource postgresDataSource(){
   //    return DataSourceBuilder.create().build();
   // }

   // @Bean
   // @Qualifier("postgresJdbcTemplate")
   // JdbcTemplate postgresJdbcTemplate(
   //    @Qualifier("postgres") 
   //    DataSource postgresDataSource
   // ) {
   //    return new JdbcTemplate(postgresDataSource);
   // }


}
