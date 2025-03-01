import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CSVLink } from 'react-csv';

const API_URL = 'http://localhost:5000/students';

function App() {
  const [formData, setFormData] = useState({ id: '', name: '', course: '', age: '', address: '', gender: '', nationality: '', religion: '' });
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

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
  
  
  useEffect(() => {
    fetchStudents();
  }, []);

  // Handle form change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
      await axios.post(API_URL, formData);
      toast.success('Student added successfully!');
      fetchStudents();
      setFormData({ id: '', name: '', course: '', age: '', address: '', gender: '', nationality: '', religion: '' });
    } catch (error) {
      toast.error('Error adding student!');
    }
  };


  
  // Update existing student
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/${formData.id}`, formData);
      toast.success('Student updated successfully!');
      fetchStudents();
      setFormData({ id: '', name: '', course: '', age: '', address: '', gender: '', nationality: '', religion: '' });
      setIsEditing(false);
    } catch (error) {
      toast.error('Error updating student!');
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
  const handleEdit = (student) => {
    setFormData(student);
    setIsEditing(true);
  };

  return (
    

    <div className="container" style={{ textAlign: 'center' }}>
      <h1>Student CRUD with Redis</h1>

      {/* Search Bar */}
      <input className="search"
        type="text"
        placeholder="Search by Name, Course, ID, etc."
        value={searchQuery}
        onChange={handleSearchChange}
        style={{ marginBottom: '20px', padding: '5px', width: '50%' }}
      />

    <CSVLink 
      data={students.map(({ id, name, course, age, address, gender, nationality, religion }) => 
        ({ id, name, course, age, address, gender, nationality, religion }))}
      headers={csvHeaders} 
      filename={"students_list.csv"} 
      className="export-button"
    >
      Export as CSV
    </CSVLink>

    <div>
      <input type="file" accept=".csv" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload CSV</button>
      {message && <p>{message}</p>}
    </div>

      {!isEditing ? (
        <form onSubmit={handleAddSubmit}>
          <input type="text" name="id" placeholder="ID" value={formData.id} onChange={handleChange} required />
          <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
          <input type="text" name="course" placeholder="Course" value={formData.course} onChange={handleChange} required />
          <input type="number" name="age" placeholder="Age" value={formData.age} onChange={handleChange} required />
          <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} required />
          <input type="text" name="gender" placeholder="Gender" value={formData.gender} onChange={handleChange} required />
          <input type="text" name="nationality" placeholder="Nationality" value={formData.nationality} onChange={handleChange} required />
          <input type="text" name="religion" placeholder="Religion" value={formData.religion} onChange={handleChange} required />
          <button type="submit">Add Student</button>
        </form>
      ) : (
        <form onSubmit={handleEditSubmit}>
          <input type="text" name="id" placeholder="ID" value={formData.id} onChange={handleChange} required disabled />
          <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
          <input type="text" name="course" placeholder="Course" value={formData.course} onChange={handleChange} required />
          <input type="number" name="age" placeholder="Age" value={formData.age} onChange={handleChange} required />
          <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} required />
          <input type="text" name="gender" placeholder="Gender" value={formData.gender} onChange={handleChange} required />
          <input type="text" name="nationality" placeholder="Nationality" value={formData.nationality} onChange={handleChange} required />
          <input type="text" name="religion" placeholder="Religion" value={formData.religion} onChange={handleChange} required />
          <button type="submit">Update Student</button>
        </form>
      )}

      <h2>Student List</h2>
      <table align="center" style={{ width: '80%' }}>
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
              <td>
                <button onClick={() => handleEdit(student)}>Edit</button>
                <button onClick={() => handleDelete(student.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ToastContainer />
    </div>
  );
}

export default App;