package com.ensa.backEnd.repositories;

import com.ensa.backEnd.models.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReservationRepository extends JpaRepository<Reservation, Integer> {
}
