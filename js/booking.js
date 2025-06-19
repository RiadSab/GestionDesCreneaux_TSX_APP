function createActionButtons(bookingId) {
    const editBtn = document.createElement('button');
    editBtn.className = 'btn-booking-action btn-edit-booking';
    editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit';
    editBtn.onclick = function() { editBooking(bookingId); };
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-booking-action btn-delete-booking';
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Delete';
    deleteBtn.onclick = function() { deleteBooking(bookingId); };
    
    const viewBtn = document.createElement('button');
    viewBtn.className = 'btn-booking-action btn-view-booking';
    viewBtn.innerHTML = '<i class="fas fa-eye"></i> View';
    viewBtn.onclick = function() { viewBookingDetails(bookingId); };
    
    const btnContainer = document.createElement('div');
    btnContainer.className = 'booking-action-buttons';
    btnContainer.appendChild(viewBtn);
    btnContainer.appendChild(editBtn);
    btnContainer.appendChild(deleteBtn);
    
    return btnContainer;
}