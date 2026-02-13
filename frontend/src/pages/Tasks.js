import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { taskAPI, contactAPI } from '../services/api';

function Tasks() {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [filterStatus, setFilterStatus] = useState('');
    const [formData, setFormData] = useState({
        contact_id: '',
        title: '',
        description: '',
        status: 'pending',
        due_date: ''
    });
    const [error, setError] = useState('');

    useEffect(() => {
        loadTasks();
        loadContacts();
    }, [filterStatus]);

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

    const loadContacts = async () => {
        try {
            const data = await contactAPI.getAll();
            setContacts(data);
        } catch (error) {
            console.error('Failed to load contacts');
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const openModal = (task = null) => {
        if (task) {
            setEditingTask(task);
            setFormData({
                contact_id: task.contact_id,
                title: task.title,
                description: task.description || '',
                status: task.status,
                due_date: task.due_date ? task.due_date.split('T')[0] : ''
            });
        } else {
            setEditingTask(null);
            setFormData({
                contact_id: '',
                title: '',
                description: '',
                status: 'pending',
                due_date: ''
            });
        }
        setShowModal(true);
        setError('');
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingTask(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            if (editingTask) {
                const result = await taskAPI.update(editingTask.id, formData);
                if (result.error) {
                    setError(result.error);
                    return;
                }
            } else {
                const result = await taskAPI.create(formData);
                if (result.error) {
                    setError(result.error);
                    return;
                }
            }
            closeModal();
            loadTasks();
        } catch (error) {
            setError('Operation failed. Please try again.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            try {
                await taskAPI.delete(id);
                loadTasks();
            } catch (error) {
                alert('Delete failed');
            }
        }
    };

    const updateStatus = async (taskId, newStatus) => {
        try {
            const task = tasks.find(t => t.id === taskId);
            await taskAPI.update(taskId, { ...task, status: newStatus });
            loadTasks();
        } catch (error) {
            alert('Status update failed');
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
                    <button className="nav-btn" onClick={() => navigate('/contacts')}>
                        Contacts
                    </button>
                    <button onClick={handleLogout}>Logout</button>
                </div>
            </div>

            <div className="container">
                <div className="dashboard-card">
                    <div className="page-header">
                        <h2>My Tasks</h2>
                        <div className="filter-section">
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                            <button className="btn btn-primary btn-small" onClick={() => openModal()}>
                                + Add Task
                            </button>
                        </div>
                    </div>

                    {tasks.length === 0 ? (
                        <div className="empty-state">
                            <h3>No tasks yet</h3>
                            <p>Click "Add Task" to create your first task</p>
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
                                                    <button className="btn btn-small btn-secondary" onClick={() => openModal(task)}>
                                                        Edit
                                                    </button>
                                                    <button className="btn btn-small btn-danger" onClick={() => handleDelete(task.id)}>
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
                        <h3>{editingTask ? 'Edit Task' : 'Add Task'}</h3>
                        {error && <div className="error-message">{error}</div>}
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Contact</label>
                                <select
                                    value={formData.contact_id}
                                    onChange={(e) => setFormData({ ...formData, contact_id: e.target.value })}
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
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows="3"
                                />
                            </div>
                            <div className="form-group">
                                <label>Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
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
                                    value={formData.due_date}
                                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                />
                            </div>
                            <div className="modal-buttons">
                                <button type="submit" className="btn btn-primary">
                                    {editingTask ? 'Update' : 'Create'}
                                </button>
                                <button type="button" className="btn btn-secondary" onClick={closeModal}>
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

export default Tasks;
