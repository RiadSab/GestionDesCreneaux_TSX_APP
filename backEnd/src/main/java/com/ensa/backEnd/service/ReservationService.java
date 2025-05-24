package com.ensa.backEnd.service;

import com.ensa.backEnd.models.Reservation;
import com.ensa.backEnd.repositories.*;
import org.springframework.stereotype.Service;

@Service
public class ReservationService extends Reservation {
    private ReservationRepository reservationRepository;

    public Reservation createReservationId(){
        Reservation reservation = new Reservation();
        return reservationRepository.save(reservation);
    }

}
