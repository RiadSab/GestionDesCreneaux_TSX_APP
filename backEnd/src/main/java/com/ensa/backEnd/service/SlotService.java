package com.ensa.backEnd.service;

import com.ensa.backEnd.DTO.ReservationRequestDTO;
import com.ensa.backEnd.models.*;

import com.ensa.backEnd.repositories.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
@Service
public class SlotService {
    @Autowired
    private ReservationService reservationService;
    @Autowired
    private SlotRepository slotRepository;
    @Autowired
    private ReservationRepository reservationRepository;
    @Autowired
    private RoomRepository roomRepository;
    private static List<Slot> AllSlots = new ArrayList<>();
    @Autowired
    private UserRepository userRepository;

    public SlotService() {}
    public SlotService(List<Slot> slots) {
        AllSlots = slots;
    }
    public List<Slot> getAllSlots() {
        AllSlots = slotRepository.findAll();
        return AllSlots;
    }

    public List<Slot> getSlotsByRoomId(int id) {
        // ByRoom_Id  car on a relation manyToOne
        List<Slot> slots = slotRepository.findByRoom_Id(id);
        return slots;
    }

    @Transactional
    public boolean reserveSlots(List<Slot> slots, Reservation res, User user) {
        // verifier si les crénaux sont tous disponibles
        for (Slot slot : slots) {
            if(slot.getId() != null && slotRepository.existsById(slot.getId())){
                Slot slotFromRepo = slotRepository.findById(slot.getId()).orElseThrow(()->new RuntimeException("Slot not found, ID: " + slot.getId()));
                if(slotFromRepo.getReserved()){
                    return false;
                }
            }
        }
        for (Slot slot : slots) {
            if(slot.getId() != null && slotRepository.existsById(slot.getId())){
                Slot slotFromRepo = slotRepository.findById(slot.getId()).get();
                slotFromRepo.setReserved(true);
                slotFromRepo.setReservation(res);
                slotFromRepo.setStartTime(slot.getStartTime());
                slotFromRepo.setOwner(user);
                slotRepository.save(slotFromRepo);
            }
            else {
                slot.setId(null);
                slot.setReserved(true);
                slot.setStartTime(slot.getStartTime());
                slot.setReservation(res);
                slot.setOwner(user);
                slotRepository.save(slot);
            }
        }
        return true;
    }

    @Transactional
    public Reservation reserveSlotsWithNewReservation( String userName, List<ReservationRequestDTO> rsreq ) {
        List<Slot> slots = new ArrayList<>();
        for(ReservationRequestDTO r : rsreq){
            User user = userRepository.findById(r.getUserId()).get();
            Room room = roomRepository.findById(r.getRoomId()).get();
            Slot s = new Slot(r.getStartTime(), true, room, user );
            s.setStartTime(s.getStartTime());
            slots.add(s);
        }
        Reservation res = new Reservation();
        User user = userRepository.findByUserName(userName).get();
        if(reserveSlots(slots, res, user)) {
            reservationRepository.save(res);
            return res;
        }
        return null;
    }

    public List<Slot> getSlotsByreservationIdAndUser(int reservationId, String userName) {
        User user = userRepository.findByUserName(userName).get();
        if(user != null && user.getRole().equals("admin")) {
            return slotRepository.findByReservation_IdAndOwner_Id(reservationId, user.getId());
        }
        else if(user != null && user.getRole().equals("user")) {
            return slotRepository.findByReservation_Id(reservationId);
        }
        return null;
    }

    public List<Slot> getMySlots(String userName) {
        if(userRepository.findByUserName(userName).isPresent()){
            User user = userRepository.findByUserName(userName).get();
            int id = user.getId();
            return slotRepository.findByOwner_Id(id);
        }
        return null;
    }

    public void freeSlots(List<Integer> slotsIDs) {
        if(slotsIDs == null || slotsIDs.isEmpty()) {
            throw new IllegalStateException("Slots IDs ne doivent pas etre vides");
        }
        for (Integer slotId : slotsIDs) {
            Slot slotFromRepo = slotRepository.findById(slotId).get();
            slotFromRepo.setReserved(false);
            slotRepository.save(slotFromRepo);
        }
    }

    @Transactional
    public boolean modifyReservation(List<Slot> slotsAdded, int reservationId) {
        // id of reservation and list of new slots
        Reservation reservation = reservationRepository.findById(reservationId).get();
        User user = slotRepository.findByReservation_Id(reservationId).get(0).getOwner();
        if(user != null && reserveSlots(slotsAdded, reservation, user)) {
            return true;
        }
        return false;
    }
}