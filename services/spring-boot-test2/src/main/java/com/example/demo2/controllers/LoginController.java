package com.example.demo2.controllers;

import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;

import javax.validation.Valid;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.example.demo2.models.LoginModel;


@Controller
@RequestMapping("/login")
public class LoginController {

    @GetMapping("/")
    // @ResponseBody
    public String displayModelForm(Model model){
        model.addAttribute("loginModel", new LoginModel());
        return "loginForm.html";
    }

    @PostMapping("/processLogin")
    public String processLogin(@Valid LoginModel loginModel, BindingResult bindingResult, Model model ){
        if (bindingResult.hasErrors()){
            model.addAttribute("loginModel", loginModel);
            // System.out.println("GK> Invalid " + loginModel);
            return "loginForm.html";
        }
        model.addAttribute("loginModel", loginModel);
        // System.out.println("GK> processing " + loginModel);
        return "loginResults.html";
    }
}
