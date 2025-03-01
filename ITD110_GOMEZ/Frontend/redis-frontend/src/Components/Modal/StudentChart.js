import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import "./StudentChart.css";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#FF6666", "#AA00FF"];

function StudentCharts({ students }) {
    // 🔹 Group data by Gender
    const genderData = students.reduce((acc, student) => {
        const existing = acc.find(item => item.name === student.gender);
        if (existing) {
            existing.value += 1;
        } else {
            acc.push({ name: student.gender, value: 1 });
        }
        return acc;
    }, []);

    // 🔹 Group data by Course
    const courseData = students.reduce((acc, student) => {
        const existing = acc.find(item => item.name === student.course);
        if (existing) {
            existing.value += 1;
        } else {
            acc.push({ name: student.course, value: 1 });
        }
        return acc;
    }, []);

    // 🔹 Group data by Age
    const ageData = students.reduce((acc, student) => {
        const existing = acc.find(item => item.name === student.age.toString());
        if (existing) {
            existing.value += 1;
        } else {
            acc.push({ name: student.age.toString(), value: 1 });
        }
        return acc;
    }, []);

    // 🔹 Group data by Religion
    const religionData = students.reduce((acc, student) => {
        const existing = acc.find(item => item.name === student.religion);
        if (existing) {
            existing.value += 1;
        } else {
            acc.push({ name: student.religion, value: 1 });
        }
        return acc;
    }, []);

    // 🔹 Group data by Nationality
    const nationalityData = students.reduce((acc, student) => {
        const existing = acc.find(item => item.name === student.nationality);
        if (existing) {
            existing.value += 1;
        } else {
            acc.push({ name: student.nationality, value: 1 });
        }
        return acc;
    }, []);

    return (
        <div className="chart" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px", marginTop: "20px" }}>
            {/* ✅ Gender Distribution Pie Chart */}
            <div style={{ textAlign: "center" }}>
                <h3>Gender Distribution</h3>
                <PieChart width={350} height={300}>
                    <Pie data={genderData} cx="50%" cy="50%" outerRadius={100} fill="#8884d8" dataKey="value">
                        {genderData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </div>

            {/* ✅ Course Enrollment Bar Chart */}
            <div style={{ textAlign: "center" }}>
                <h3>Course Enrollment</h3>
                <BarChart width={400} height={300} data={courseData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#82ca9d" />
                </BarChart>
            </div>

            {/* ✅ Age Distribution Bar Chart */}
            <div style={{ textAlign: "center" }}>
                <h3>Age Distribution</h3>
                <BarChart width={400} height={300} data={ageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#FFBB28" />
                </BarChart>
            </div>

            {/* ✅ Religion Distribution Pie Chart */}
            <div style={{ textAlign: "center" }}>
                <h3>Religion Distribution</h3>
                <PieChart width={350} height={300}>
                    <Pie data={religionData} cx="50%" cy="50%" outerRadius={100} fill="#FF8042" dataKey="value">
                        {religionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </div>

            {/* ✅ Nationality Distribution Pie Chart */}
            <div style={{ textAlign: "center" }}>
                <h3>Nationality Distribution</h3>
                <PieChart width={350} height={300}>
                    <Pie data={nationalityData} cx="50%" cy="50%" outerRadius={100} fill="#AA00FF" dataKey="value">
                        {nationalityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </div>
        </div>
    );
}

export default StudentCharts;
