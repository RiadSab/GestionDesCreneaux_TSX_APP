package com.ensa.backEnd.models;

import jakarta.persistence.*;

import java.util.List;
@Entity
@Table(name = "rooms")
public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    @Column(name = "room_name")
    private String roomName;
    private String roomLetter;
    private int roomNumber;

    private int capacity;
    private String location;

    public Room() {}
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getRoomName() {
        return roomName;
    }

    public void setRoomName(String roomName) {
        this.roomName = roomLetter + roomNumber;
    }

    public void setRoomName() {
        this.roomName = this.roomLetter + this.roomNumber;
    }

    public String getRoomLetter() {
        return roomLetter;
    }

    public void setRoomLetter(String roomLetter) {
        this.roomLetter = roomLetter;
    }

    public int getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(int roomNumber) {
        this.roomNumber = roomNumber;
    }

    public int getCapacity() {
        return capacity;
    }

    public void setCapacity(int capacity) {
        this.capacity = capacity;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }
}