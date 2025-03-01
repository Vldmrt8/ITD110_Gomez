const express = require('express');
const redis = require('redis');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const { Parser } = require('json2csv');  // Convert JSON to CSV
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Connect to Redis
const client = redis.createClient({
  url: 'redis://@127.0.0.1:6379'  // Default Redis connection
});

client.connect()
  .then(() => console.log('Connected to Redis'))
  .catch(err => console.error('Redis connection error:', err));

// CRUD Operations

// Route to save student data
app.post('/students', async (req, res) => {
  const { id, name, course, age, address, gender, nationality, religion } = req.body;

  // Validate input fields
  if (!id || !name || !course || !age || !address || !gender || !nationality || !religion) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Ensure ID is a positive integer if provided manually
  if (id) {
    if (isNaN(id) || !Number.isInteger(Number(id)) || Number(id) <= 0) {
      console.log('Invalid ID detected!'); // Debugging
      return res.status(400).json({ message: 'ID must be a positive integer greater than 0' });
    }
  } 
  else {
    // Auto-generate ID if not provided
    id = await client.incr('student_id_counter');
  }

  try {
    // Set student data in Redis (using object syntax for Redis v4 and above)
    const studentData = { name, course, age, address, gender, nationality, religion };

    // Save student data in Redis hash
    await client.hSet(`student:${id}`, 'name', studentData.name);
    await client.hSet(`student:${id}`, 'course', studentData.course);
    await client.hSet(`student:${id}`, 'age', studentData.age);
    await client.hSet(`student:${id}`, 'address', studentData.address);
    await client.hSet(`student:${id}`, 'gender', studentData.gender);
    await client.hSet(`student:${id}`, 'nationality', studentData.nationality);
    await client.hSet(`student:${id}`, 'religion', studentData.religion);

    // Respond with success message
    res.status(201).json({ 
      message: 'Student saved successfully', 
      student: { id, ...studentData }  // Send back the new student details
    });    
  } catch (error) {
    toast.error('Error saving student:', error);
    res.status(500).json({ message: 'Failed to save student' });
  }
});

// Read (R)
app.get('/students/:id', async (req, res) => {
  const id = req.params.id;
  const student = await client.hGetAll(`student:${id}`);
  if (Object.keys(student).length === 0) {
    return res.status(404).json({ message: 'Student not found' });
  }
  res.json(student);
});

// Read all students in ascending order by ID
app.get('/students', async (req, res) => {
  try {
    const keys = await client.keys('student:*');
    if (!keys.length) {
      return res.json({ message: 'No students found' });
    }

    const students = await Promise.all(
      keys.map(async (key) => {
        const studentData = await client.hGetAll(key);
        return { id: key.split(':')[1], ...studentData };
      })
    );

    // Sort students by ID (ascending order)
    students.sort((a, b) => parseInt(a.id) - parseInt(b.id));

    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});



// Update (U)
app.put('/students/:id', async (req, res) => {
  const id = req.params.id;
  const { name, course, age, address, gender, nationality, religion } = req.body;

  if (!name && !course && !age && !address && !gender && !nationality && !religion) {
    return res.status(400).json({ message: 'At least one field is required to update' });
  }

  try {
    const existingStudent = await client.hGetAll(`student:${id}`);
    if (Object.keys(existingStudent).length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Update student data in Redis
    if (name) await client.hSet(`student:${id}`, 'name', name);
    if (course) await client.hSet(`student:${id}`, 'course', course);
    if (age) await client.hSet(`student:${id}`, 'age', age);
    if (address) await client.hSet(`student:${id}`, 'address', address);
    if (gender) await client.hSet(`student:${id}`, 'gender', gender);
    if (nationality) await client.hSet(`student:${id}`, 'nationality', nationality);
    if (religion) await client.hSet(`student:${id}`, 'religion', religion);

    res.status(200).json({ message: 'Student updated successfully' });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ message: 'Failed to update student' });
  }
});

// Delete (D)
app.delete('/students/:id', async (req, res) => {
  const id = req.params.id;
  await client.del(`student:${id}`);
  res.status(200).json({ message: 'Student deleted successfully' });
});

// Multer Configuration (File Upload)
const upload = multer({ dest: 'uploads/' });

app.get('/students/export', async (req, res) => {
  try {
    const keys = await client.keys('student:*');
    const students = await Promise.all(
      keys.map(async (key) => {
        const student = await client.hGetAll(key);
        return { id: key.split(':')[1], ...student };
      })
    );

    if (students.length === 0) {
      return res.status(404).json({ message: 'No students found to export' });
    }

    // Convert to CSV format
    const fields = ['id', 'name', 'course', 'age', 'address', 'gender', 'nationality', 'religion'];
    const json2csvParser = new Parser({ fields });
    const csvData = json2csvParser.parse(students);

    // Send CSV file for download
    res.header('Content-Type', 'text/csv');
    res.attachment('students.csv');
    res.send(csvData);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    res.status(500).json({ message: 'Error exporting CSV' });
  }
});


    // Upload CSV file and read
    app.post('/students/upload', upload.single('file'), async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ error: 'No file uploaded!' });
        }
    
        const filePath = path.join(__dirname, 'uploads', req.file.filename);
        const students = [];
        const promises = [];
    
        // Delete all existing students before overwriting
        const existingKeys = await client.keys('student:*');
        if (existingKeys.length > 0) {
          await Promise.all(existingKeys.map((key) => client.del(key)));
        }
    
        console.log('Existing students deleted. Now processing new CSV data...');
    
        // Read CSV and process it
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('headers', (headers) => {
            console.log('Original CSV Headers:', headers); 
          })
          .on('data', (row) => {
            // Normalize CSV headers (trim spaces, remove quotes, convert to lowercase)
            const cleanedRow = Object.fromEntries(
              Object.entries(row).map(([key, value]) => [key.replace(/["']/g, '').trim().toLowerCase(), value.trim()])
            );
    
            console.log('Processing cleaned row:', cleanedRow);
    
            const { id, name, course, age, address, gender, nationality, religion } = cleanedRow;
    
            if (!id || !name || !course || !age || !address || !gender || !nationality || !religion) {
              console.warn(`Skipping row with missing fields: ${JSON.stringify(cleanedRow)}`);
              return;
            }
    
            students.push(cleanedRow);
    
            console.log(`Saving student ${id} to Redis with data:`, cleanedRow);
    
            // FIX: Ensure Redis receives valid key-value pairs
            const savePromiseName = client.hSet(`student:${id}`,
              'name', name || 'N/A',
            ).then(() => console.log(` Saved student ${id} to Redis`));           
            promises.push(savePromiseName);
            const savePromiseCourse = client.hSet(`student:${id}`,
              'course', course || 'N/A',
            );           
            promises.push(savePromiseCourse)
            const savePromiseAge = client.hSet(`student:${id}`,
              'age', age || 'N/A',
            );           
            promises.push(savePromiseAge)
            const savePromiseAddress = client.hSet(`student:${id}`,
              'address', address || 'N/A',
            );
            promises.push(savePromiseAddress);
            const savePromiseGender = client.hSet(`student:${id}`,
              'gender', gender || 'N/A',
            );
            promises.push(savePromiseGender);
            const savePromiseNationality = client.hSet(`student:${id}`,
              'nationality', nationality || 'N/A',
            );
            promises.push(savePromiseNationality);
            const savePromiseReligion = client.hSet(`student:${id}`,
              'religion', religion || 'N/A',
            );           
            promises.push(savePromiseReligion)
          })
          .on('end', async () => {
            await Promise.all(promises);
            fs.unlinkSync(filePath);
            console.log('CSV processing complete. Students saved:', students.length);
            res.json({ message: 'CSV uploaded and processed successfully!', students });
          })
          .on('error', (error) => {
            console.error('Error processing CSV:', error);
            res.status(500).json({ error: 'Error processing CSV file' });
          });
    
      } catch (error) {
        console.error('Error uploading CSV:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });
    


// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});