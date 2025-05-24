package com.ensa.backEnd.service;

import com.ensa.backEnd.DTO.RoomDTO;
import com.ensa.backEnd.models.Room;
import com.ensa.backEnd.repositories.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class RoomService {
    @Autowired
    private RoomRepository repository;

    public Boolean addRoom(Room room) {
        if(repository.existsByRoomName(room.getRoomName())){
            return false;
        }
        repository.save(room);
        return true;
    }
    public List<RoomDTO> getAllRooms() {
        try{
            List<Room> rooms = repository.findAll();
            List<RoomDTO> responseRooms = new ArrayList<>();
            for(Room room : rooms){
                RoomDTO responseRoom = new RoomDTO(room.getId(), room.getRoomLetter(), room.getRoomNumber());
                responseRooms.add(responseRoom);
            }
            return responseRooms;
        }
        catch(Exception e){
            return new ArrayList<>();
        }
    }
}
