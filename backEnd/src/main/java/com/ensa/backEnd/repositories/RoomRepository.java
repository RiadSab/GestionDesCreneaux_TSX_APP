package com.ensa.backEnd.repositories;

import com.ensa.backEnd.models.Room;
import com.ensa.backEnd.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;

public interface RoomRepository extends JpaRepository<Room, Integer> {
    Optional<Room> findByRoomName(String roomName);
    Boolean existsByRoomName(String roomName);
    Optional<Room> findById(int roomId);
}
