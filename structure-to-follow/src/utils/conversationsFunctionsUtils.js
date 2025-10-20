import { v4 as uuidv4 } from 'uuid';


// generate a new ID for message JSON > content >  message_id
export function generateMessageId() {
    return uuidv4(); // Generates a new UUID
}

// Helper function to sort contacts by last message or last contact created(which is newer)
// Function to sort contacts based on updated_at in descending order
export const sortContactsByUpdatedAt = (contacts) => {
    return contacts.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
};