package com.ensa.backEnd.service;

import com.ensa.backEnd.DTO.SignInRequestDTO;
import com.ensa.backEnd.models.User;
import com.ensa.backEnd.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    private List<User> users;

    public List<User> getAllUsers(){
        users = userRepository.findAll();
        return users;
    }

    public boolean signUser(SignInRequestDTO userRequestDTO) {
        User user = new User();
        user.setEmail(userRequestDTO.getEmail());
        user.setPassword(userRequestDTO.getPassword());
        user.setUserName(userRequestDTO.getUserName());
        user.setRole("USER");
        if(userRepository.findByUserName(user.getUserName()).isPresent()){
            System.out.println("User already exists");
            return false;
        }
        System.out.println(user.getUserName());
        userRepository.save(user);
        return true;
    }

    public User loginUser(String username, String password){
        Optional<User> searched = userRepository.findByUserName(username);
        if(searched.isPresent()){
            if(searched.get().getPassword().equals(password)){
                return searched.get();
            }
        }
        return null;
    }
}
