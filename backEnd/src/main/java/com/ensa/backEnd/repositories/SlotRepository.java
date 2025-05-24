package com.ensa.backEnd.repositories;

import com.ensa.backEnd.models.Slot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SlotRepository extends JpaRepository<Slot, Integer> {
    List<Slot> findByRoom_Id(int roomId);
    List<Slot> findByOwner_Id(int id);
    Slot findById(int id);
    List<Slot> findByReservation_IdAndOwner_Id(int reservation_id, int owner_id);
    List<Slot> findByReservation_Id(int reservation_id);
}

