import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { contactAPI, taskAPI, addressAPI } from '../services/api';

function Dashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({ contacts: 0, tasks: 0 });
    const [activeTab, setActiveTab] = useState('contacts');
    const [timeRemaining, setTimeRemaining] = useState(900);

    // Contacts state
    const [contacts, setContacts] = useState([]);
    const [showContactModal, setShowContactModal] = useState(false);
    const [editingContact, setEditingContact] = useState(null);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [selectedContact, setSelectedContact] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [contactForm, setContactForm] = useState({
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

    // Tasks state
    const [tasks, setTasks] = useState([]);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [filterStatus, setFilterStatus] = useState('');
    const [taskForm, setTaskForm] = useState({
        contact_id: '',
        title: '',
        description: '',
        status: 'pending',
        due_date: ''
    });

    const [error, setError] = useState('');

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (!userData) {
            navigate('/login');
            return;
        }
        setUser(userData);
        loadStats();
        loadContacts();
        loadTasks();

        const loginTime = parseInt(localStorage.getItem('loginTime'));
        const elapsed = Math.floor((Date.now() - loginTime) / 1000);
        const remaining = Math.max(0, 900 - elapsed);
        setTimeRemaining(remaining);

        const timer = setInterval(() => {
            const currentElapsed = Math.floor((Date.now() - loginTime) / 1000);
            const currentRemaining = Math.max(0, 900 - currentElapsed);
            setTimeRemaining(currentRemaining);

            if (currentRemaining <= 0) {
                handleLogout();
            }
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (activeTab === 'tasks') {
            loadTasks();
        }
    }, [filterStatus, activeTab]);

    const loadStats = async () => {
        try {
            const contactsData = await contactAPI.getAll();
            const tasksData = await taskAPI.getAll();
            setStats({
                contacts: contactsData.length,
                tasks: tasksData.length
            });
        } catch (error) {
            console.error('Failed to load stats');
        }
    };

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

    const loadTasks = async () => {
        try {
            const data = await taskAPI.getAll(filterStatus);
            setTasks(data);
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

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Contact functions
    const openContactModal = (contact = null) => {
        if (contact) {
            setEditingContact(contact);
            setContactForm({
                contact_number: contact.contact_number,
                contact_email: contact.contact_email || '',
                note: contact.note || ''
            });
        } else {
            setEditingContact(null);
            setContactForm({ contact_number: '', contact_email: '', note: '' });
        }
        setShowContactModal(true);
        setError('');
    };

    const handleContactSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (editingContact) {
                await contactAPI.update(editingContact.id, contactForm);
            } else {
                await contactAPI.create(contactForm);
            }
            setShowContactModal(false);
            loadContacts();
            loadStats();
        } catch (error) {
            setError('Operation failed. Please try again.');
        }
    };

    const handleContactDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this contact?')) {
            try {
                await contactAPI.delete(id);
                loadContacts();
                loadStats();
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

    // Task functions
    const openTaskModal = (task = null) => {
        if (task) {
            setEditingTask(task);
            setTaskForm({
                contact_id: task.contact_id,
                title: task.title,
                description: task.description || '',
                status: task.status,
                due_date: task.due_date ? task.due_date.split('T')[0] : ''
            });
        } else {
            setEditingTask(null);
            setTaskForm({
                contact_id: '',
                title: '',
                description: '',
                status: 'pending',
                due_date: ''
            });
        }
        setShowTaskModal(true);
        setError('');
    };

    const handleTaskSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (editingTask) {
                await taskAPI.update(editingTask.id, taskForm);
            } else {
                await taskAPI.create(taskForm);
            }
            setShowTaskModal(false);
            loadTasks();
            loadStats();
        } catch (error) {
            setError('Operation failed. Please try again.');
        }
    };

    const handleTaskDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            try {
                await taskAPI.delete(id);
                loadTasks();
                loadStats();
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
                    <span style={{
                        background: timeRemaining < 60 ? '#fee' : '#f0f9ff',
                        color: timeRemaining < 60 ? '#c53030' : '#0369a1',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontWeight: '700',
                        fontSize: '16px',
                        fontFamily: 'monospace'
                    }}>
                        ⏱ {formatTime(timeRemaining)}
                    </span>
                    <span>Welcome, {user?.first_name}!</span>
                    <button onClick={handleLogout}>Logout</button>
                </div>
            </div>

            <div className="container">
                <div className="dashboard-card">
                    <h2>Dashboard Overview</h2>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <h3>{stats.contacts}</h3>
                            <p>Total Contacts</p>
                        </div>
                        <div className="stat-card">
                            <h3>{stats.tasks}</h3>
                            <p>Total Tasks</p>
                        </div>
                    </div>

                    <div className="nav-tabs" style={{ marginTop: '40px' }}>
                        <button
                            className={`nav-tab ${activeTab === 'contacts' ? 'active' : ''}`}
                            onClick={() => setActiveTab('contacts')}
                        >
                            Manage Contacts
                        </button>
                        <button
                            className={`nav-tab ${activeTab === 'tasks' ? 'active' : ''}`}
                            onClick={() => setActiveTab('tasks')}
                        >
                            Manage Tasks
                        </button>
                    </div>



                    {activeTab === 'contacts' && (
                        <div>
                            <div className="page-header" style={{ marginTop: '25px' }}>
                                <h3>My Contacts</h3>
                                <button className="btn btn-primary btn-small" onClick={() => openContactModal()}>
                                    + Add Contact
                                </button>
                            </div>

                            {contacts.length === 0 ? (
                                <div className="empty-state">
                                    <h3>No contacts yet</h3>
                                    <p>Click "+ Add Contact" to create your first contact</p>
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
                                                            <button className="btn btn-small btn-secondary" onClick={() => openContactModal(contact)}>
                                                                Edit
                                                            </button>
                                                            <button className="btn btn-small btn-danger" onClick={() => handleContactDelete(contact.id)}>
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
                    )}

                    {activeTab === 'tasks' && (
                        <div>
                            <div className="page-header" style={{ marginTop: '25px' }}>
                                <h3>My Tasks</h3>
                                <div className="filter-section">
                                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                                        <option value="">All Status</option>
                                        <option value="pending">Pending</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                    <button className="btn btn-primary btn-small" onClick={() => openTaskModal()}>
                                        + Add Task
                                    </button>
                                </div>
                            </div>

                            {tasks.length === 0 ? (
                                <div className="empty-state">
                                    <h3>No tasks yet</h3>
                                    <p>Click "+ Add Task" to create your first task</p>
                                </div>
                            ) : (
                                <div className="table-container">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Title</th>
                                                <th>Contact</th>
                                                <th>Status</th>
                                                <th>Due Date</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tasks.map(task => (
                                                <tr key={task.id}>
                                                    <td>{task.title}</td>
                                                    <td>{task.contact_number}</td>
                                                    <td>
                                                        <span className={`status-badge status-${task.status}`}>
                                                            {task.status === 'in_progress' ? 'In Progress' :
                                                                task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                                                        </span>
                                                    </td>
                                                    <td>{task.due_date ? new Date(task.due_date).toLocaleDateString() : '-'}</td>
                                                    <td>
                                                        <div className="action-buttons">
                                                            <button className="btn btn-small btn-secondary" onClick={() => openTaskModal(task)}>
                                                                Edit
                                                            </button>
                                                            <button className="btn btn-small btn-danger" onClick={() => handleTaskDelete(task.id)}>
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
                    )}
                </div>
            </div>

            {/* Contact Modal */}
            {showContactModal && (
                <div className="modal-overlay" onClick={() => setShowContactModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>{editingContact ? 'Edit Contact' : 'Add Contact'}</h3>
                        {error && <div className="error-message">{error}</div>}
                        <form onSubmit={handleContactSubmit}>
                            <div className="form-group">
                                <label>Contact Number</label>
                                <input
                                    type="text"
                                    value={contactForm.contact_number}
                                    onChange={(e) => setContactForm({ ...contactForm, contact_number: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={contactForm.contact_email}
                                    onChange={(e) => setContactForm({ ...contactForm, contact_email: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Note</label>
                                <textarea
                                    value={contactForm.note}
                                    onChange={(e) => setContactForm({ ...contactForm, note: e.target.value })}
                                    rows="3"
                                />
                            </div>
                            <div className="modal-buttons">
                                <button type="submit" className="btn btn-primary">
                                    {editingContact ? 'Update' : 'Create'}
                                </button>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowContactModal(false)}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Address Modal */}
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

            {/* Task Modal */}
            {showTaskModal && (
                <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>{editingTask ? 'Edit Task' : 'Add Task'}</h3>
                        {error && <div className="error-message">{error}</div>}
                        <form onSubmit={handleTaskSubmit}>
                            <div className="form-group">
                                <label>Contact</label>
                                <select
                                    value={taskForm.contact_id}
                                    onChange={(e) => setTaskForm({ ...taskForm, contact_id: e.target.value })}
                                    required
                                >
                                    <option value="">Select a contact</option>
                                    {contacts.map(contact => (
                                        <option key={contact.id} value={contact.id}>
                                            {contact.contact_number}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Title</label>
                                <input
                                    type="text"
                                    value={taskForm.title}
                                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    value={taskForm.description}
                                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                                    rows="3"
                                />
                            </div>
                            <div className="form-group">
                                <label>Status</label>
                                <select
                                    value={taskForm.status}
                                    onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Due Date</label>
                                <input
                                    type="date"
                                    value={taskForm.due_date}
                                    onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                                />
                            </div>
                            <div className="modal-buttons">
                                <button type="submit" className="btn btn-primary">
                                    {editingTask ? 'Update' : 'Create'}
                                </button>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowTaskModal(false)}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;
