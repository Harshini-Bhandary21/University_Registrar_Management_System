import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download, Printer, User, BookOpen, Award, Calendar, FileText, TrendingUp, CheckCircle } from 'lucide-react';
import { reportService } from '../services/reportService';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import toast from 'react-hot-toast';

const StudentReport = () => {
    const [searchParams] = useSearchParams();
    const [studentId, setStudentId] = useState(searchParams.get('studentId') || '');
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (searchParams.get('studentId')) {
            generateReport();
        }
    }, []);

    const generateReport = async () => {
        if (!studentId) {
            toast.error('Please enter a Student ID');
            return;
        }

        setLoading(true);
        try {
            const response = await reportService.getStudentReport(studentId);
            setReport(response.data.data);
            toast.success('Report generated successfully!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Student not found or error generating report');
            setReport(null);
        } finally {
            setLoading(false);
        }
    };

    const downloadPDF = () => {
        if (!report) return;
        
        const doc = new jsPDF();
        
        // Header with gradient effect
        doc.setFillColor(59, 130, 246);
        doc.rect(0, 0, 210, 45, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.text('Student Academic Report', 105, 25, { align: 'center' });
        doc.setFontSize(10);
        doc.text('University Registrar System', 105, 35, { align: 'center' });
        
        // Student Information Section
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.setTextColor(59, 130, 246);
        doc.text('Student Information', 20, 60);
        
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(`Student ID: ${report.student.student_id}`, 20, 75);
        doc.text(`Name: ${report.student.first_name} ${report.student.last_name}`, 20, 85);
        doc.text(`Program: ${report.student.program_name}`, 20, 95);
        doc.text(`Date of Birth: ${new Date(report.student.dob).toLocaleDateString()}`, 20, 105);
        doc.text(`Age: ${report.student.age} years`, 20, 115);
        
        // Enrolled Courses Table
        doc.setTextColor(59, 130, 246);
        doc.setFontSize(14);
        doc.text('Enrolled Courses', 20, 135);
        
        doc.autoTable({
            startY: 140,
            head: [['Course Code', 'Course Title', 'Credits', 'Year', 'Semester']],
            body: report.enrolledCourses.map(course => [
                course.course_no,
                course.title,
                course.credits,
                course.year,
                course.semester_no
            ]),
            theme: 'striped',
            headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255] },
            styles: { fontSize: 9 },
            columnStyles: { 0: { cellWidth: 25 }, 1: { cellWidth: 60 } }
        });
        
        // Exam Results Table
        let finalY = doc.lastAutoTable.finalY + 10;
        doc.setTextColor(59, 130, 246);
        doc.text('Exam Results', 20, finalY);
        
        doc.autoTable({
            startY: finalY + 5,
            head: [['Course', 'Exam Type', 'Marks', 'Max Marks', 'Grade']],
            body: report.examResults.map(result => [
                result.course_title,
                result.exam_type,
                result.marks,
                result.max_marks,
                result.grade
            ]),
            theme: 'striped',
            headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255] },
            styles: { fontSize: 9 }
        });
        
        // Academic Summary
        const summaryY = doc.lastAutoTable.finalY + 15;
        doc.setTextColor(59, 130, 246);
        doc.setFontSize(14);
        doc.text('Academic Summary', 20, summaryY);
        
        doc.setFillColor(240, 249, 255);
        doc.rect(20, summaryY + 5, 170, 50, 'F');
        
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(`Total Marks Obtained: ${report.summary.totalMarks}`, 30, summaryY + 20);
        doc.text(`Total Maximum Marks: ${report.summary.totalMaxMarks}`, 30, summaryY + 30);
        doc.text(`Overall Percentage: ${report.summary.overallPercentage}%`, 30, summaryY + 40);
        doc.text(`Final Grade: ${report.summary.overallGrade}`, 30, summaryY + 50);
        
        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text('University Registrar System - Official Academic Report', 105, 290, { align: 'center' });
            doc.text(`Generated on: ${new Date().toLocaleDateString()} | Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
        }
        
        doc.save(`student_${report.student.student_id}_report.pdf`);
        toast.success('PDF downloaded successfully!');
    };

    const printReport = () => {
        window.print();
    };

    const getGradeColor = (grade) => {
        if (grade === 'A+' || grade === 'A') return 'badge-success';
        if (grade === 'B+' || grade === 'B') return 'badge-info';
        if (grade === 'C') return 'badge-warning';
        return 'badge-danger';
    };

    return (
        <div className="p-6 animate-fade-in">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Student Report Generator
                    </h1>
                    <p className="text-gray-500 mt-1">Generate comprehensive academic reports for students</p>
                </div>

                {/* Search Section */}
                <div className="card p-6 mb-8">
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1">
                            <label className="input-label">Enter Student ID</label>
                            <input
                                type="text"
                                value={studentId}
                                onChange={(e) => setStudentId(e.target.value)}
                                placeholder="e.g., 201"
                                className="input-field"
                                onKeyPress={(e) => e.key === 'Enter' && generateReport()}
                            />
                        </div>
                        <button
                            onClick={generateReport}
                            disabled={loading}
                            className="btn-primary"
                        >
                            {loading ? (
                                <div className="spinner-sm"></div>
                            ) : (
                                <>
                                    <FileText size={18} />
                                    <span>Generate Report</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Report Content */}
                {report && (
                    <div id="report-content" className="card p-8 animate-slide-up">
                        {/* Header */}
                        <div className="text-center mb-8 pb-8 border-b">
                            <h2 className="text-2xl font-bold text-gray-800">University Registrar System</h2>
                            <p className="text-gray-500">Official Academic Report</p>
                            <p className="text-xs text-gray-400 mt-2">Generated on: {new Date().toLocaleString()}</p>
                        </div>

                        {/* Student Info Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4">
                                <div className="flex items-center space-x-3">
                                    <User className="text-blue-600" size={24} />
                                    <div>
                                        <p className="text-xs text-blue-600 uppercase font-semibold">Student Name</p>
                                        <p className="text-xl font-bold text-gray-800">
                                            {report.student.first_name} {report.student.last_name}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4">
                                <div className="flex items-center space-x-3">
                                    <Award className="text-purple-600" size={24} />
                                    <div>
                                        <p className="text-xs text-purple-600 uppercase font-semibold">Student ID</p>
                                        <p className="text-xl font-bold text-gray-800">{report.student.student_id}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4">
                                <div className="flex items-center space-x-3">
                                    <BookOpen className="text-green-600" size={24} />
                                    <div>
                                        <p className="text-xs text-green-600 uppercase font-semibold">Program</p>
                                        <p className="text-lg font-semibold text-gray-800">{report.student.program_name}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-4">
                                <div className="flex items-center space-x-3">
                                    <Calendar className="text-orange-600" size={24} />
                                    <div>
                                        <p className="text-xs text-orange-600 uppercase font-semibold">Age / DOB</p>
                                        <p className="text-lg font-semibold text-gray-800">{report.student.age} years</p>
                                        <p className="text-xs text-gray-500">{new Date(report.student.dob).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Enrolled Courses */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <BookOpen size={20} className="text-blue-600" />
                                Enrolled Courses
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="table-header">Course Code</th>
                                            <th className="table-header">Course Title</th>
                                            <th className="table-header">Credits</th>
                                            <th className="table-header">Year</th>
                                            <th className="table-header">Semester</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {report.enrolledCourses.map((course, idx) => (
                                            <tr key={idx} className="table-row">
                                                <td className="table-cell font-medium">{course.course_no}</td>
                                                <td className="table-cell">{course.title}</td>
                                                <td className="table-cell">{course.credits}</td>
                                                <td className="table-cell">{course.year}</td>
                                                <td className="table-cell">{course.semester_no}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Exam Results */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <TrendingUp size={20} className="text-green-600" />
                                Exam Results
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="table-header">Course</th>
                                            <th className="table-header">Exam Type</th>
                                            <th className="table-header">Marks</th>
                                            <th className="table-header">Max Marks</th>
                                            <th className="table-header">Grade</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {report.examResults.map((result, idx) => (
                                            <tr key={idx} className="table-row">
                                                <td className="table-cell">{result.course_title}</td>
                                                <td className="table-cell">{result.exam_type}</td>
                                                <td className="table-cell font-semibold">{result.marks}</td>
                                                <td className="table-cell">{result.max_marks}</td>
                                                <td className="table-cell">
                                                    <span className={`badge ${getGradeColor(result.grade)}`}>
                                                        {result.grade}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Course-wise Summary */}
                        {report.summary.courseWiseSummary && (
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <CheckCircle size={20} className="text-purple-600" />
                                    Course-wise Performance
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {report.summary.courseWiseSummary.map((course, idx) => (
                                        <div key={idx} className="bg-gray-50 rounded-xl p-4">
                                            <p className="font-semibold text-gray-800">{course.course_title}</p>
                                            <p className="text-sm text-gray-500">{course.course_no}</p>
                                            <div className="mt-2 flex justify-between items-center">
                                                <span className="text-sm">Percentage: {course.percentage}%</span>
                                                <span className={`badge ${getGradeColor(course.grade)}`}>{course.grade}</span>
                                            </div>
                                            <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                                                <div 
                                                    className="bg-blue-600 rounded-full h-2 transition-all duration-500"
                                                    style={{ width: `${course.percentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Summary Card */}
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
                            <h3 className="text-lg font-semibold mb-4">Academic Summary</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center">
                                    <p className="text-3xl font-bold">{report.summary.totalMarks}</p>
                                    <p className="text-sm opacity-90">Total Marks</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-3xl font-bold">{report.summary.totalMaxMarks}</p>
                                    <p className="text-sm opacity-90">Max Marks</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-3xl font-bold">{report.summary.overallPercentage}%</p>
                                    <p className="text-sm opacity-90">Percentage</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-3xl font-bold">{report.summary.overallGrade}</p>
                                    <p className="text-sm opacity-90">Final Grade</p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-4 mt-8 pt-6 border-t no-print">
                            <button onClick={printReport} className="btn-secondary">
                                <Printer size={18} />
                                <span>Print Report</span>
                            </button>
                            <button onClick={downloadPDF} className="btn-primary">
                                <Download size={18} />
                                <span>Download PDF</span>
                            </button>
                        </div>
                    </div>
                )}

                {!report && !loading && studentId && (
                    <div className="text-center py-12">
                        <p className="text-gray-400">No report generated. Enter a valid Student ID.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentReport;