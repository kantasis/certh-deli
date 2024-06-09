package com.tutorials.spring_react.datarepo;

import java.util.Map;

import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;

@Entity
// Add setters and getters
@Data
public class CsvDataEntity {

   @Id
   @GeneratedValue(strategy = GenerationType.IDENTITY)
   private String id;

   @ElementCollection
   private Map<String, String> attributes;

}
