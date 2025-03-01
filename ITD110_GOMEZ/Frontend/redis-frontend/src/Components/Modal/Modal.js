import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./Modal.css";

const API_URL = 'http://localhost:5000/students';

export default function Modal() {
  const [modal, setModal] = useState(false);
  const [formData, setFormData] = useState({ id: '', name: '', course: '', age: '', address: '', gender: '', nationality: '', religion: '' });
  const [students, setStudents] = useState([]);

  // Fetch all students once when component mounts
  useEffect(() => {
    fetchStudents();
  }, []); // Run only once

  const fetchStudents = async () => {
    try {
      const response = await axios.get(API_URL);
      if (Array.isArray(response.data)) {
        setStudents(response.data);
      }
    } catch (error) {
      toast.error('Failed to fetch students');
    }
  };

  // Handle form input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Add new student
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(API_URL, formData);
      toast.success('Student added successfully!');
      fetchStudents(); // Refresh student list
      setFormData({ id: '', name: '', course: '', age: '', address: '', gender: '', nationality: '', religion: '' });
      setModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error adding student!');
    }
  };

  const toggleModal = () => {
    setModal(!modal);
    if (!modal) {
      document.body.classList.add('active-modal');
    } else {
      document.body.classList.remove('active-modal');
    }
  };

  return (
    <>
      <button onClick={toggleModal} className="btn-modal">
        Add Student
      </button>

      {modal && (
        <div className="modal">
          <div onClick={toggleModal} className="overlay"></div>
          <div className="modal-content">
            <button className="close-modal" onClick={toggleModal}>
              CLOSE [X]
            </button>

            <div className="container1" style={{ textAlign: 'center' }}>
              <form onSubmit={handleAddSubmit}>
                <div className="input-field">
                  <input type="text" name="id" value={formData.id} onChange={handleChange} required />
                  <label htmlFor="id">ID</label>
                </div>
                <div className="input-field">
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                  <label htmlFor="name">Name</label>
                </div>
                <div className="input-field">
                  <input type="text" name="course" value={formData.course} onChange={handleChange} required />
                  <label htmlFor="course">Course</label>
                </div>
                <div className="input-field">
                  <input type="number" name="age" value={formData.age} onChange={handleChange} required />
                  <label htmlFor="age">Age</label>
                </div>
                <div className="input-field">
                  <input type="text" name="address" value={formData.address} onChange={handleChange} required />
                  <label htmlFor="address">Address</label>
                </div>
                <div className="input-field">
                  <input type="text" name="gender" value={formData.gender} onChange={handleChange} required />
                  <label htmlFor="gender">Gender</label>
                </div>
                <div className="input-field">
                  <input type="text" name="nationality" value={formData.nationality} onChange={handleChange} required />
                  <label htmlFor="nationality">Nationality</label>
                </div>
                <div className="input-field">
                  <input type="text" name="religion" value={formData.religion} onChange={handleChange} required />
                  <label htmlFor="religion">Religion</label>
                </div>
                <button className="addButton" type="submit">Add Student</button>
              </form>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </>
  );
}
