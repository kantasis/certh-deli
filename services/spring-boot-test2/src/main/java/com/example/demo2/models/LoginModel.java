// package main.java.com.example.demo2.models;
package com.example.demo2.models;

// import jakarta.validation.constraints.Size;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Size;


public class LoginModel {
    
    @NotNull(message="username is required")
    // @NotBlank(message = "Name is mandatory")
    @Size(min=3, max=15, message="Username should be 3-15 characters long")
    private String username;

    @NotNull(message="password is required")
    @Size(min=8, max=15, message="Password should be 8-15 characteres")
    private String password;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public LoginModel(String username, String password) {
        this.username = username;
        this.password = password;
        // System.out.println("Calling constructor for " +username+' '+ password );
    }

    public LoginModel() {
        // System.out.println("Calling default constructor" );
    }

    @Override
    public String toString() {
        return "LoginModel [username=" + username + ", password=" + password + "]";
    }
    
}
