package com.tutorials.spring_react.security.payloads;

import jakarta.validation.constraints.NotBlank;

public class NameUpdateRequest {

    @NotBlank
    private String name;

    @NotBlank
    private String surname; // lowercase matches UserModel field

    public NameUpdateRequest() {
    }

    public NameUpdateRequest(String name, String surname) {
        this.name = name;
        this.surname = surname;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSurname() {
        return surname;
    }

    public void setSurname(String surname) {
        this.surname = surname;
    }
}