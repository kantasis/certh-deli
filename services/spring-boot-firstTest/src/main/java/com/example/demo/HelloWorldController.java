package com.example.demo;

import java.util.ArrayList;
import java.util.List;
import com.example.models.Person;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class HelloWorldController { 

    @GetMapping("/test1")
    @ResponseBody
    public String printHello(){
        return "Hello world";
    }
    
    @GetMapping("/test2")
    public String showHello(Model model){
        // Model
        model.addAttribute("message", "asdfaqwer");
        // the filename (with or without the ext) in the resources/templates directory
        return "HelloPage";
    }

    @GetMapping("/test3")
    public String requestHello(
        @RequestParam("message") String message, 
        Model model
    ){
        // the filename (with or without the ext) in the resources/templates directory
        model.addAttribute("message",message);
        return "HelloPage";
    }

    @GetMapping("/people")
    public String showFriends(Model model){
        List<Person> friends = new ArrayList<Person>();
        friends.add(new Person(0,"A",23,100f));
        friends.add(new Person(1,"B",23,100f));
        friends.add(new Person(2,"C",23,100f));
        friends.add(new Person(3,"D",23,100f));
        friends.add(new Person(4,"E",23,100f));
        friends.add(new Person(5,"F",23,100f));
        friends.add(new Person(6,"G",23,100f));
        friends.add(new Person(7,"H",23,100f));
        // model.addAttribute("report", "asdfaqwer");
        System.out.println(friends);
        model.addAttribute("people", friends);
        return "showFriends.html";
    }

    @GetMapping("/peopleJSON")
    @ResponseBody
    public List<Person> showFriendsJSON(Model model){
        List<Person> friends = new ArrayList<Person>();
        friends.add(new Person(0,"A",23,100f));
        friends.add(new Person(1,"B",23,100f));
        friends.add(new Person(2,"C",23,100f));
        friends.add(new Person(3,"D",23,100f));
        friends.add(new Person(4,"E",23,100f));
        friends.add(new Person(5,"F",23,100f));
        friends.add(new Person(6,"G",23,100f));
        friends.add(new Person(7,"H",23,100f));

        return friends;
    }

}
