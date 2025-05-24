package com.ensa.backEnd.controllers;

import com.ensa.backEnd.DTO.ReservationRequestDTO;
import com.ensa.backEnd.DTO.RoomDTO;
import com.ensa.backEnd.DTO.SignInRequestDTO;
import com.ensa.backEnd.models.*;
import com.ensa.backEnd.repositories.ReservationRepository;
import com.ensa.backEnd.repositories.RoomRepository;
import com.ensa.backEnd.repositories.SlotRepository;
import com.ensa.backEnd.repositories.UserRepository;
import com.ensa.backEnd.service.RoomService;
import com.ensa.backEnd.service.SlotService;
import com.ensa.backEnd.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class TimeSlotController {
    @Autowired
    private SlotService slotService;
    @Autowired
    private UserService userService;
    @Autowired
    private RoomService roomService;
    @Autowired
    private JwtUtils jwtUtils;
    @Autowired
    private SlotRepository slotRepository;


    @PostMapping("/auth/login")
    public ResponseEntity<?> login (@RequestBody RequestUserLogin user) {
        String userName = user.getUserName();
        String password = user.getPassword();
        User loggedIn = userService.loginUser(userName, password);
        if(loggedIn == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Failed to log in"));
        }
        Integer id = loggedIn.getId();
        if(id != null){
            String email = loggedIn.getEmail();
            String token = jwtUtils.generateToken(loggedIn);
            return ResponseEntity.status(HttpStatus.OK).body(Map.of("message", "Logged in successfully", "userId", id, "email", email, "userName",userName, "token", token));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Failed to log in"));
    }

    @PostMapping("/users")
    public ResponseEntity<?> signUser (@RequestBody SignInRequestDTO userRequest) {
        if(userService == null){
            System.out.println("userService is null");
        }
        try{

            if(userService.signUser(userRequest)){
                System.out.println("user signed successfully");
                return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "User signed successfully"));
            }
            System.out.println("user signing failed");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "User signing failed"));
        }
        catch(Exception e){
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "User already exists"));
        }
    }

    // not used because we list all the rooms and the user choose,
    // rooms already exists in the database
    @PostMapping("/rooms")
    public ResponseEntity<?> signRoom (@RequestBody Room room) {
        if(roomService.addRoom(room)){
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "Room signed successfully"));
        }
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "Room UNsigned"));
    }

    // reserver des creneaux, data reçu en fromat : --->
    // ReservationRequestDTO startTime userId roomId /// et userId comme parametre
    @PostMapping("/slots/reserve")
    public ResponseEntity<?> reserveSlots (@RequestBody List<ReservationRequestDTO> rsreq, @RequestParam  String userName) {

        Reservation res = slotService.reserveSlotsWithNewReservation(userName, rsreq);
        if(res != null){
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "Reservation has been reserved"));
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Reservation has not been reserved"));
    }

    // get all rooms DATA from database in RoomDTO list format : id letter number
    @GetMapping("/rooms")
    public ResponseEntity<?> getAllRooms() {
        // backend sends for each roomDTO : id  letter number
        List<RoomDTO> rooms = roomService.getAllRooms();
        if(rooms.isEmpty()){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "No room is found"));
        }
        return ResponseEntity.status(HttpStatus.OK).body(Map.of("rooms", rooms));
    }

    // not used, je pense que je vais modifier les reservation à travers reservation Id
    // et je vais lui envoyer vers la page de reservationa nouveau et ajouter ces slots
    // avec cette fonction
    @PostMapping("/reservation/{id}/modify")
    public ResponseEntity<?> modifySlots (@RequestBody List<Slot> slots, @PathVariable int id) {
        if(slotService.modifyReservation(slots, id)){
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "Slots have been modified"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Slot not found"));
    }

    @GetMapping("rooms/{id}/slots")
    public ResponseEntity<?> getSlotsByRoom (@PathVariable int id) {
        List <Slot> slots = slotService.getSlotsByRoomId(id);
        if(slots.isEmpty()){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No slots found");
        }
        return ResponseEntity.status(HttpStatus.OK).body(Map.of("slots", slots));
    }

    @GetMapping("/users/slots/reservation/{id}")
    public ResponseEntity<?> getSlotsByReservation (@PathVariable int id, @RequestParam String userName) {
        List <Slot> slots = slotService.getSlotsByreservationIdAndUser(id, userName);
        if(slots.isEmpty()){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No slots found");
        }
        return ResponseEntity.status(HttpStatus.OK).body(Map.of("slots", slots));
    }

    @GetMapping("/slots/my")
    public ResponseEntity<?> getMySlots(@RequestParam String userName) {
        System.out.println(userName);
        List <Slot> slots = slotService.getMySlots(userName);
        if(slots != null && !slots.isEmpty()){ // Check for null before calling isEmpty()
            return ResponseEntity.status(HttpStatus.OK).body(Map.of("slots", slots));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No slots found");
    }

    @PostMapping ("/slots/cancel")
    public ResponseEntity<?> cancelSlot (@RequestBody Integer slotIDs) {
        System.out.println("cancel ");
        System.out.println(slotIDs);
        List<Integer> slotsIDs = new ArrayList<>();
        slotsIDs.add(slotIDs);
        slotService.freeSlots(slotsIDs);
        return ResponseEntity.status(HttpStatus.OK).body(Map.of("message", "slots freed successfully"));
    }
    @PostMapping ("/slots/free/")
    public ResponseEntity<?> freeSlots (@RequestBody List<Integer> slotsIDs) {
        slotService.freeSlots(slotsIDs);
        return ResponseEntity.status(HttpStatus.OK).body(Map.of("message", "slots freed successfully"));
    }
}

