// server.js - ENGSE203 Pre-Workshop Backend
// Dependencies: express, cors, helmet, joi, dotenv

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const Joi = require('joi');

const app = express();

const PORT = process.env.PORT || 3001;
const APP_NAME = process.env.APP_NAME || 'ENGSE203 Super App';

// ----- Global Middlewares -----
app.use(helmet());            // เพิ่มความปลอดภัยด้วย HTTP headers
app.use(cors());              // อนุญาต Cross-Origin (เช่น React localhost:5173)
app.use(express.json());      // อ่าน JSON body
// app.use(express.urlencoded({ extended: true })); // ถ้าต้องรองรับ form-urlencoded

// ----- Routes -----

// หน้าแรก (ทดสอบเซิร์ฟเวอร์)
app.get('/', (_req, res) => {
  res.send(`<h1>Hello from ${APP_NAME}!</h1>`);
});

// ตัวอย่าง API เปิดสาธารณะ (ใช้ทดสอบ CORS ได้)
app.get('/api/data', (_req, res) => {
  res.json({ message: 'This data is open for everyone!' });
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Schema สำหรับตรวจข้อมูลผู้ใช้ด้วย Joi
const userSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().pattern(/^[a-zA-Z0-9]{3,30}$/).required(),
  birth_year: Joi.number().integer().min(1900).max(new Date().getFullYear()).required()
});

// สร้างผู้ใช้ (ตัวอย่าง POST + validation)
app.post('/api/users', (req, res) => {
  const { error, value } = userSchema.validate(req.body, {
    abortEarly: false,   // รวม error ทุกอัน
    stripUnknown: true   // ตัด field ที่ schema ไม่รู้จักออก
  });

  if (error) {
    // ส่งรายละเอียด error กลับ (ให้ Postman เห็นชัด ๆ)
    return res.status(400).json({
      message: 'Invalid data',
      details: error.details.map(d => ({ message: d.message, path: d.path }))
    });
  }

  // ปกติแล้วจะบันทึก DB ที่นี่ แต่ใน Pre-Workshop เราส่งกลับเฉย ๆ
  return res.status(201).json({
    message: 'User created successfully!',
    data: value
  });
});

// ----- 404 Handler -----
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found', path: req.originalUrl });
});

// ----- Global Error Handler -----
app.use((err, _req, res, _next) => {
  console.error('Unexpected error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// ----- Start Server -----
app.listen(PORT, () => {
  console.log(`🚀 ${APP_NAME} running on http://localhost:${PORT}`);
});
