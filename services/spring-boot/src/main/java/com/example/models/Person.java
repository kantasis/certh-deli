package com.example.models;

public class Person {

    private int id;
    private String name;
    private int age;
    private float weight;

    @Override
    public String toString() {
        return "Person [id=" + id + ", name=" + name + ", age=" + age + ", weight=" + weight + "]";
    }
    public int getId() {
        return id;
    }
    public String getName() {
        return name;
    }
    public int getAge() {
        return age;
    }
    public float getWeight() {
        return weight;
    }
    public Person(int id, String name, int age, float weight) {
        this.id = id;
        this.name = name;
        this.age = age;
        this.weight = weight;
    }

}
