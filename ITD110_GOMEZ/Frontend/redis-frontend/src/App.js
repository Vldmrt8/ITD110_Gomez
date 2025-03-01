import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CSVLink } from 'react-csv';
import Modal from './Components/Modal/Modal';
import StudentChart from './Components/Modal/StudentChart';

const API_URL = 'http://localhost:5000/students';

function App() {
  const [formData, setFormData] = useState({ id: '', name: '', course: '', age: '', address: '', gender: '', nationality: '', religion: '' });
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [modal, setModal] = useState(false);

  // Fetch all students
  const fetchStudents = async () => {
    try {
      const response = await axios.get(API_URL);
      if (Array.isArray(response.data)) {
        setStudents([...response.data]); // Ensure state change triggers re-render
      } else {
        setStudents([]); 
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to fetch students');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEditing) {
      
      await handleEditSubmit(e);
    } else {
      try {
        const response = await axios.post(API_URL, formData);
        toast.success('Student added successfully!');
        setStudents([...students, response.data]); // Add new student to state
        toggleModal();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error saving student!');
      }
    }
  };
  

  const toggleModal = () => {
    if (!modal) {
      if (!isEditing) {
        setFormData({ id: '', name: '', course: '', age: '', address: '', gender: '', nationality: '', religion: '' });
      }
      document.body.classList.add('active-modal');
    } else {
      document.body.classList.remove('active-modal');
    }
    setModal(!modal);
  };
  
  
  
  useEffect(() => {
    fetchStudents();
  }, []);
  

  // Handle search change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle file selection
  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a CSV file first.');
      return;
    }
  
    const formData = new FormData();
    formData.append('file', file);
  
    try {
      const response = await axios.post('http://localhost:5000/students/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      toast.success('CSV uploaded and processed successfully!');
      fetchStudents(); // Refresh the student list
    } catch (error) {
      toast.error('Error uploading file. Please try again.');
      console.error(error);
    }
  };
  
  

  // Prepare data for CSV export
  const csvHeaders = [
    { label: 'ID', key: 'id' },
    { label: 'Name', key: 'name' },
    { label: 'Course', key: 'course' },
    { label: 'Age', key: 'age' },
    { label: 'Address', key: 'address' },
    { label: 'Gender', key: 'gender' },
    { label: 'Nationality', key: 'nationality' },
    { label: 'Religion', key: 'religion' }
  ];

  // Filter students based on search query
  const filteredStudents = students.filter((student) =>
    student.id.toString().includes(searchQuery) ||
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.age.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.gender.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.nationality.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.religion.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Add new student
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(API_URL, formData);
      toast.success('Student added successfully!');
      setStudents([...students, response.data]); // Update state immediately
      setFormData({ id: '', name: '', course: '', age: '', address: '', gender: '', nationality: '', religion: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error adding student!');
      console.error('Error details:', error.response);
    }
  };

  // Delete student
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      toast.success('Student deleted!');
      fetchStudents();
    } catch (error) {
      toast.error('Error deleting student!');
    }
  };

  // Populate form for updating student
  const editStudent = async (id) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      if (response.data) {
        setFormData(response.data);
        setIsEditing(true);
        setModal(true);
      } else {
        toast.error('Student not found.');
      }
    } catch (error) {
      console.error('Failed to fetch student details:', error);
      toast.error('Failed to fetch student details');
    }
  };
  
  


  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    // Hardcode a test ID to see if updating works
    const testData = { ...formData, id: "1" }; 
    
    try {
      const response = await axios.put(`${API_URL}/${testData.id}`, testData);
      if (response.status === 200) {
        toast.success('Student updated successfully!');
        fetchStudents();
        setIsEditing(false);
        toggleModal();
      } else {
        toast.error('Failed to update student.');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Error updating student.');
    }
  };
  
  

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  

  return (
    <>
    
    <header>
    <div className="container" style={{ textAlign: 'center' }}>
    
      <h1>Student CRUD with Redis</h1>
     {/* Search Bar */}
     <input className="search"
              type="text"
              placeholder="Search by Name, Course, ID, etc."
              value={searchQuery}
              onChange={handleSearchChange}
            />
      <nav class="navbar">
        <ul class="menu">
        <li>
      <div className='uploadCSV'>
        <input type="file" accept=".csv" onChange={handleFileChange} />
        <button class="buttonUpload" onClick={handleUpload}>Upload CSV</button>
        {message && <p>{message}</p>}
      </div>
      </li>
        <li>
      <CSVLink 
        data={students.map(({ id, name, course, age, address, gender, nationality, religion }) => 
          ({ id, name, course, age, address, gender, nationality, religion }))}
        headers={csvHeaders} 
        filename={"students_list.csv"} 
        className="export-button"
      >
        Export as CSV
      </CSVLink>
      </li>
      <li>
      <Modal />
      </li>
    </ul>
    </nav>
      <h2>Student List</h2>
      <table align="center" style={{ width: '80%' }} cellpadding="0" cellspacing="0">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Course</th>
            <th>Age</th>
            <th>Address</th>
            <th>Gender</th>
            <th>Nationality</th>
            <th>Religion</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.map((student) => (
            <tr key={student.id}>
              <td>{student.id}</td>
              <td>{student.name}</td>
              <td>{student.course}</td>
              <td>{student.age}</td>
              <td>{student.address}</td>
              <td>{student.gender}</td>
              <td>{student.nationality}</td>
              <td>{student.religion}</td>
              <td className='buttons'>
                <button onClick={() => editStudent(student.id)}>Edit</button>
                <button onClick={() => handleDelete(student.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {modal && (
        <div className="modal">
          <div onClick={toggleModal} className="overlay"></div>
          <div className="modal-content">
            <button className="close-modal" onClick={toggleModal}>CLOSE [X]</button>

            <div className="container1" style={{ textAlign: 'center' }}>
            <form onSubmit={handleSubmit}>
              <div className="input-field">
              <input type="text" name="id" value={formData.id} onChange={handleChange} readOnly />
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
              <button className="addButton" type="submit">
                {isEditing ? 'Update Student' : 'Add Student'}
              </button>
            </form>
            </div>
          </div>
        </div>
      )}

      
    </div>
    <div>
        <h2 align="center">Data Visualization</h2>
        <StudentChart students={students} />
    </div>
    <ToastContainer />
    </header>
    
    </>
  );
}

export default App;