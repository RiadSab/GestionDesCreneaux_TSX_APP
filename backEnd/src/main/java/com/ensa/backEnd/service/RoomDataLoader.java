package com.ensa.backEnd.service;

import com.ensa.backEnd.models.Room;
import com.ensa.backEnd.repositories.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class RoomDataLoader implements CommandLineRunner {

    @Autowired
    private RoomRepository roomRepository;
    @Override
    public void run(String... args) throws Exception {
        if(roomRepository.count() == 0) {
            populateRooms();
        }
    }
    private void populateRooms() {
        char[] letters = new char[]{'A', 'B', 'C'};
        for(char letter : letters) {
            for(int i = 1; i <= 12; i++){
                Room room = new Room();
                room.setRoomNumber(i);
                room.setRoomLetter(String.valueOf(letter));
                room.setRoomName();
                room.setCapacity(70);
                room.setLocation("Batiment " + letter);
                roomRepository.save(room);
            }
        }
        System.out.println("Rooms count : " + roomRepository.count());
    }
}
