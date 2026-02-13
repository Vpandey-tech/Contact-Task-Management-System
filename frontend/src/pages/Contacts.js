import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { contactAPI, addressAPI } from '../services/api';

function Contacts() {
    const navigate = useNavigate();
    const [contacts, setContacts] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [editingContact, setEditingContact] = useState(null);
    const [selectedContact, setSelectedContact] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [formData, setFormData] = useState({
        contact_number: '',
        contact_email: '',
        note: ''
    });
    const [addressForm, setAddressForm] = useState({
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India'
    });
    const [error, setError] = useState('');

    useEffect(() => {
        loadContacts();
    }, []);

    const loadContacts = async () => {
        try {
            const data = await contactAPI.getAll();
            setContacts(data);
        } catch (error) {
            if (error.message === 'Unauthorized') {
                navigate('/login');
            }
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const openModal = (contact = null) => {
        if (contact) {
            setEditingContact(contact);
            setFormData({
                contact_number: contact.contact_number,
                contact_email: contact.contact_email || '',
                note: contact.note || ''
            });
        } else {
            setEditingContact(null);
            setFormData({ contact_number: '', contact_email: '', note: '' });
        }
        setShowModal(true);
        setError('');
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingContact(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            if (editingContact) {
                const result = await contactAPI.update(editingContact.id, formData);
                if (result.error) {
                    setError(result.error);
                    return;
                }
            } else {
                const result = await contactAPI.create(formData);
                if (result.error) {
                    setError(result.error);
                    return;
                }
            }
            closeModal();
            loadContacts();
        } catch (error) {
            setError('Operation failed. Please try again.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this contact?')) {
            try {
                await contactAPI.delete(id);
                loadContacts();
            } catch (error) {
                alert('Delete failed');
            }
        }
    };

    const viewAddresses = async (contact) => {
        setSelectedContact(contact);
        try {
            const data = await addressAPI.getByContact(contact.id);
            setAddresses(data);
            setShowAddressModal(true);
        } catch (error) {
            alert('Failed to load addresses');
        }
    };

    const addAddress = async (e) => {
        e.preventDefault();
        try {
            await addressAPI.create(selectedContact.id, addressForm);
            const data = await addressAPI.getByContact(selectedContact.id);
            setAddresses(data);
            setAddressForm({
                address_line1: '',
                address_line2: '',
                city: '',
                state: '',
                pincode: '',
                country: 'India'
            });
        } catch (error) {
            alert('Failed to add address');
        }
    };

    const deleteAddress = async (addressId) => {
        if (window.confirm('Are you sure you want to delete this address?')) {
            try {
                await addressAPI.delete(selectedContact.id, addressId);
                const data = await addressAPI.getByContact(selectedContact.id);
                setAddresses(data);
            } catch (error) {
                alert('Delete failed');
            }
        }
    };

    return (
        <div>
            <div className="navbar">
                <h1>Contact & Task Management</h1>
                <div className="navbar-right">
                    <button className="nav-btn" onClick={() => navigate('/dashboard')}>
                        Dashboard
                    </button>
                    <button className="nav-btn" onClick={() => navigate('/tasks')}>
                        Tasks
                    </button>
                    <button onClick={handleLogout}>Logout</button>
                </div>
            </div>

            <div className="container">
                <div className="dashboard-card">
                    <div className="page-header">
                        <h2>My Contacts</h2>
                        <button className="btn btn-primary btn-small" onClick={() => openModal()}>
                            + Add Contact
                        </button>
                    </div>

                    {contacts.length === 0 ? (
                        <div className="empty-state">
                            <h3>No contacts yet</h3>
                            <p>Click "Add Contact" to create your first contact</p>
                        </div>
                    ) : (
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Contact Number</th>
                                        <th>Email</th>
                                        <th>Note</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {contacts.map(contact => (
                                        <tr key={contact.id}>
                                            <td>{contact.contact_number}</td>
                                            <td>{contact.contact_email || '-'}</td>
                                            <td>{contact.note || '-'}</td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button className="btn btn-small btn-primary" onClick={() => viewAddresses(contact)}>
                                                        Addresses
                                                    </button>
                                                    <button className="btn btn-small btn-secondary" onClick={() => openModal(contact)}>
                                                        Edit
                                                    </button>
                                                    <button className="btn btn-small btn-danger" onClick={() => handleDelete(contact.id)}>
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>{editingContact ? 'Edit Contact' : 'Add Contact'}</h3>
                        {error && <div className="error-message">{error}</div>}
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Contact Number</label>
                                <input
                                    type="text"
                                    value={formData.contact_number}
                                    onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={formData.contact_email}
                                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Note</label>
                                <textarea
                                    value={formData.note}
                                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                    rows="3"
                                />
                            </div>
                            <div className="modal-buttons">
                                <button type="submit" className="btn btn-primary">
                                    {editingContact ? 'Update' : 'Create'}
                                </button>
                                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showAddressModal && (
                <div className="modal-overlay" onClick={() => setShowAddressModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Addresses for {selectedContact.contact_number}</h3>

                        <form onSubmit={addAddress} className="form-section">
                            <h4>+ Add New Address</h4>
                            <div className="form-group">
                                <label>Address Line 1</label>
                                <input
                                    type="text"
                                    value={addressForm.address_line1}
                                    onChange={(e) => setAddressForm({ ...addressForm, address_line1: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Address Line 2</label>
                                <input
                                    type="text"
                                    value={addressForm.address_line2}
                                    onChange={(e) => setAddressForm({ ...addressForm, address_line2: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>City</label>
                                <input
                                    type="text"
                                    value={addressForm.city}
                                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>State</label>
                                <input
                                    type="text"
                                    value={addressForm.state}
                                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Pincode</label>
                                <input
                                    type="text"
                                    value={addressForm.pincode}
                                    onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Country</label>
                                <input
                                    type="text"
                                    value={addressForm.country}
                                    onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                                />
                            </div>
                            <button type="submit" className="btn btn-primary btn-small">Add Address</button>
                        </form>

                        {addresses.length === 0 ? (
                            <p>No addresses found</p>
                        ) : (
                            <div>
                                {addresses.map(addr => (
                                    <div key={addr.id} className="address-card">
                                        <p><strong>{addr.address_line1}</strong></p>
                                        {addr.address_line2 && <p>{addr.address_line2}</p>}
                                        <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                                        <p>{addr.country}</p>
                                        <button className="btn btn-small btn-danger" onClick={() => deleteAddress(addr.id)}>
                                            Delete
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <button className="btn btn-secondary" onClick={() => setShowAddressModal(false)}>
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Contacts;
