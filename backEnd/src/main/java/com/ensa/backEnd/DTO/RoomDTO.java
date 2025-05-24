package com.ensa.backEnd.DTO;

public class RoomDTO {
    private int id;
    private String roomLetter;
    private int roomNumber;
//    private String location;
//    private int capacity;


    public RoomDTO(int id, String roomLetter, int roomNumber) {
        this.id = id;
        this.roomLetter = roomLetter;
        this.roomNumber = roomNumber;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
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
}
