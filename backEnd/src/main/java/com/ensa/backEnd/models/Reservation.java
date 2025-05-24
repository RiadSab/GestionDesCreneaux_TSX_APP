package com.ensa.backEnd.models;

import jakarta.persistence.*;
import java.sql.Timestamp;
import java.util.List;

@Entity
@Table(name = "reservations")
public class Reservation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private Timestamp reservationDate;
//    @Transient
//    private List<Slot> slotsReserved;

    public Reservation(List<Slot> slotsReserved) {
//        this.slotsReserved = slotsReserved;
        this.reservationDate = new Timestamp(System.currentTimeMillis());
    }
    public Reservation() {
        this.reservationDate = new Timestamp(System.currentTimeMillis());
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public Timestamp getReservationDate() {
        return reservationDate;
    }

    public void setReservationDate(Timestamp reservationDate) {
        this.reservationDate = reservationDate;
    }

//    public List<Slot> getSlotsReserved() {
//        return slotsReserved;
//    }

//    public void setSlotsReserved(List<Slot> slotsReserved) {
//        this.slotsReserved = slotsReserved;
//    }
}
