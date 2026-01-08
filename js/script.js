// API (JSONPlaceholder for testing)
const API_URL = 'https://jsonplaceholder.typicode.com/users';

// State to hold our contacts list locally after fetching
let contacts = [];

// DOM Elements
const contactForm = document.getElementById('contactForm');
const nameInput = document.getElementById('name');
const phoneInput = document.getElementById('phone');
const contactIdInput = document.getElementById('contactId');
const contactList = document.getElementById('contactList');
const searchInput = document.getElementById('searchInput');
const loadingIndicator = document.getElementById('loading');
const clearBtn = document.getElementById('clearBtn');

// Event Listeners
document.addEventListener('DOMContentLoaded', fetchContacts); // Load contacts on start
contactForm.addEventListener('submit', handleFormSubmit); // Handle Add/Edit
searchInput.addEventListener('input', handleSearch); // Handle search typing
clearBtn.addEventListener('click', resetForm); // Clear form button

/**
 * Fetch contacts from the API
 * Uses Async/Await for asynchronous handling
 */
async function fetchContacts() {
    // Show loading state
    loadingIndicator.classList.remove('hidden');

    try {
        // Fetch data from the Mock API
        const response = await fetch(API_URL);

        // Check if request was successful
        if (!response.ok) {
            throw new Error('Failed to fetch contacts');
        }

        // Parse JSON data
        const data = await response.json();

        // Store in our local state variable
        contacts = data;

        // Render the contacts to the webpage
        renderContacts(contacts);

    } catch (error) {
        console.error('Error:', error);
        alert('Error loading contacts. Check console for details.');
    } finally {
        // Hide loading indicator regardless of success or failure
        loadingIndicator.classList.add('hidden');
    }
}

/**
 * Handle Form Submission (Add or Update)
 */
async function handleFormSubmit(e) {
    e.preventDefault(); // Prevent page reload

    const name = nameInput.value;
    const phone = phoneInput.value;
    const id = contactIdInput.value; // If ID exists, we are editing

    // Create contact object
    const contactData = {
        name: name,
        phone: phone
    };

    if (id) {
        // --- Update Existing Contact ---
        await updateContact(id, contactData);
    } else {
        // --- Add New Contact ---
        await addContact(contactData);
    }

    // Reset form after operation
    resetForm();
}

/**
 * Add a new Contact (POST request)
 */
async function addContact(contactData) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify(contactData),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
        });

        const newContact = await response.json();

        // NOTE: because JSONPlaceholder is a fake API, it always returns ID 11 for new items.
        // For a real app, the server would return a unique ID.
        // We will simulate adding it to our list visually.

        // Simulate a unique ID for our local view if needed (random number just for demo)
        newContact.id = Date.now();

        // Update local state
        contacts.push(newContact);

        // Refresh UI
        renderContacts(contacts);
        alert('Contact Added Successfully!');

    } catch (error) {
        console.error('Error adding contact:', error);
    }
}

/**
 * Update an existing Contact (PUT request)
 */
async function updateContact(id, contactData) {
    try {
        // We use template literal to append ID to URL
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            body: JSON.stringify(contactData),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
        });

        const updatedContact = await response.json();

        // Update local state
        contacts = contacts.map(contact => {
            if (contact.id == id) {
                return { ...contact, ...contactData }; // Update fields
            }
            return contact;
        });

        // Refresh UI
        renderContacts(contacts);
        alert('Contact Updated Successfully!');

    } catch (error) {
        console.error('Error updating contact:', error);
    }
}

/**
 * Delete a Contact (DELETE request)
 */
async function deleteContact(id) {
    if (!confirm('Are you sure you want to delete this contact?')) return;

    try {
        await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
        });

        // Remove from local state
        contacts = contacts.filter(contact => contact.id != id);

        // Refresh UI
        renderContacts(contacts);
        alert('Contact Deleted!');

    } catch (error) {
        console.error('Error deleting contact:', error);
    }
}

/**
 * Render list of contacts to the DOM
 */
function renderContacts(contactArray) {
    contactList.innerHTML = ''; // Clear current list

    if (contactArray.length === 0) {
        contactList.innerHTML = '<p style="color:white; text-align:center; grid-column: 1/-1;">No contacts found.</p>';
        return;
    }

    contactArray.forEach(contact => {
        // Create card element
        const card = document.createElement('div');
        card.className = 'contact-item';

        card.innerHTML = `
            <div class="contact-info">
                <h3>${contact.name}</h3>
                <p>📞 ${contact.phone}</p>
            </div>
            <div class="actions">
                <button class="edit-btn" onclick="populateForm(${contact.id})">Edit</button>
                <button class="delete-btn" onclick="deleteContact(${contact.id})">Delete</button>
            </div>
        `;

        contactList.appendChild(card);
    });
}

/**
 * Populate form for editing
 */
window.populateForm = function (id) {
    const contact = contacts.find(c => c.id == id);
    if (contact) {
        nameInput.value = contact.name;
        phoneInput.value = contact.phone;
        contactIdInput.value = contact.id;

        // Change button text
        document.getElementById('saveBtn').textContent = 'Update Contact';

        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

/**
 * Handle Search Filter
 */
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();

    const filteredContacts = contacts.filter(contact => {
        return contact.name.toLowerCase().includes(searchTerm) ||
            (contact.phone && contact.phone.includes(searchTerm));
    });

    renderContacts(filteredContacts);
}

/**
 * Reset Form
 */
function resetForm() {
    contactForm.reset();
    contactIdInput.value = '';
    document.getElementById('saveBtn').textContent = 'Save Contact';
}
