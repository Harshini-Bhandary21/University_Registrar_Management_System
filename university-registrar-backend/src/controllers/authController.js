const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/db');

// Mock user for demo - In production, use a users table
const USERS = [
    {
        id: 1,
        username: 'admin',
        password: '$2a$10$rPZqFZPqFZPqFZPqFZPqFZPqFZPqFZPqFZPqFZPqFZPqFZPqFZPq', // admin123
        role: 'admin',
        name: 'Admin User',
        email: 'admin@university.edu'
    },
    {
        id: 2,
        username: 'faculty',
        password: '$2a$10$rPZqFZPqFZPqFZPqFZPqFZPqFZPqFZPqFZPqFZPqFZPqFZPqFZPq', // faculty123
        role: 'faculty',
        name: 'Faculty User',
        email: 'faculty@university.edu'
    },
    {
        id: 3,
        username: 'student',
        password: '$2a$10$rPZqFZPqFZPqFZPqFZPqFZPqFZPqFZPqFZPqFZPqFZPqFZPqFZPq', // student123
        role: 'student',
        name: 'Student User',
        email: 'student@university.edu'
    }
];

// Generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        { 
            id: user.id, 
            username: user.username, 
            role: user.role,
            name: user.name 
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
    );
};

// Generate refresh token
const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRE }
    );
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide username and password'
            });
        }

        // Find user
        const user = USERS.find(u => u.username === username);
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // For demo, accept any password with the demo accounts
        // In production, use bcrypt.compare
        const isMatch = password === 'admin123' || password === 'faculty123' || password === 'student123';
        
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate tokens
        const token = generateToken(user);
        const refreshToken = generateRefreshToken(user);

        res.json({
            success: true,
            data: {
                token,
                refreshToken,
                user: {
                    id: user.id,
                    username: user.username,
                    role: user.role,
                    name: user.name,
                    email: user.email
                }
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
};

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Public
const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token required'
            });
        }

        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
        const user = USERS.find(u => u.id === decoded.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token'
            });
        }

        const newToken = generateToken(user);

        res.json({
            success: true,
            data: { token: newToken }
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid refresh token'
        });
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const user = USERS.find(u => u.id === req.user.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: {
                id: user.id,
                username: user.username,
                role: user.role,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Logout
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
};

module.exports = {
    login,
    refreshToken,
    getMe,
    logout
};