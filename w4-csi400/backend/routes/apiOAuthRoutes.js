const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../db');

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || 'Ov23liYxQuhFEEmhdBSU';
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || '896b5cc20aa74d10170cebafd6c4cfe6f6957d22';
const GITHUB_CALLBACK_URL = process.env.GITHUB_CALLBACK_URL || 'http://localhost:3000/auth/github/callback';
const SECRET_KEY = process.env.JWT_SECRET || 'secretKey';

// 1. GET /auth/github - เริ่มต้นกระบวนการ OAuth พาไปยัง GitHub Login
router.get('/github', (req, res) => {
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(GITHUB_CALLBACK_URL)}&scope=read:user,user:email`;
    res.redirect(githubAuthUrl);
});

// 2. GET /auth/github/callback - รับ Authorization Code จาก GitHub แล้วแลกเป็น Access Token
router.get('/github/callback', async (req, res) => {
    const { code, error } = req.query;

    if (error || !code) {
        return res.status(400).json({ message: 'GitHub Authorization failed or cancelled', error });
    }

    try {
        // แลกเปลี่ยน Authorization Code เป็น Access Token กับ GitHub
        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                client_id: GITHUB_CLIENT_ID,
                client_secret: GITHUB_CLIENT_SECRET,
                code: code,
                redirect_uri: GITHUB_CALLBACK_URL
            })
        });

        const tokenData = await tokenResponse.json();

        if (!tokenData.access_token) {
            return res.status(400).json({ message: 'Failed to retrieve GitHub Access Token', details: tokenData });
        }

        const githubAccessToken = tokenData.access_token;

        // ดึงข้อมูลโปรไฟล์ผู้ใช้จริงจาก GitHub API (Real API)
        const userProfileResponse = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `Bearer ${githubAccessToken}`,
                'User-Agent': 'Avengers-Web-Services-App'
            }
        });
        const profile = await userProfileResponse.json();

        // ตรวจสอบหรือบันทึกข้อมูลผู้ใช้ลงใน SQLite Database ของยาน Avengers
        const githubUsername = `gh_${profile.login}`;
        const heroName = profile.name || profile.login;

        db.get('SELECT * FROM users WHERE username = ?', [githubUsername], (err, existingUser) => {
            let userId;
            let role = 'user';

            const issueTokens = (uid, uRole) => {
                // ออกบัตรผ่าน JWT Token ของระบบยาน Avengers
                const jwtToken = jwt.sign(
                    { userId: uid, role: uRole },
                    SECRET_KEY,
                    { expiresIn: '1h' }
                );

                // ส่งผลลัพธ์เป็นหน้าจอสวยงาม แสดงผล OAuth Flow ตามโจทย์สไลด์หน้า 15
                res.send(`
                    <!DOCTYPE html>
                    <html lang="th">
                    <head>
                        <meta charset="UTF-8">
                        <title>Avengers OAuth 2.0 Success</title>
                        <style>
                            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0f172a; color: #f8fafc; padding: 40px 20px; display: flex; justify-content: center; }
                            .card { background: #1e293b; padding: 30px; border-radius: 12px; max-width: 680px; width: 100%; border: 1px solid #334155; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
                            h2 { color: #38bdf8; margin-top: 0; display: flex; align-items: center; gap: 10px; }
                            .badge { background: #10b981; color: white; padding: 4px 10px; border-radius: 9999px; font-size: 14px; }
                            .token-box { background: #0b0f19; padding: 12px; border-radius: 8px; word-break: break-all; font-family: monospace; font-size: 13px; color: #a5f3fc; margin-bottom: 15px; border: 1px solid #1e293b; }
                            .profile-img { width: 64px; height: 64px; border-radius: 50%; border: 2px solid #38bdf8; }
                            .btn { background: #38bdf8; color: #0f172a; padding: 10px 18px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block; margin-right: 10px; cursor: pointer; border: none; font-size: 14px; }
                            .btn:hover { background: #0ea5e9; }
                            .result-box { background: #050811; border: 1px solid #38bdf8; padding: 12px; border-radius: 8px; font-family: monospace; font-size: 13px; color: #38bdf8; margin-top: 15px; white-space: pre-wrap; display: none; }
                            .note { background: rgba(56, 189, 248, 0.1); border-left: 4px solid #38bdf8; padding: 10px; font-size: 13px; color: #94a3b8; margin: 15px 0; border-radius: 4px; }
                        </style>
                    </head>
                    <body>
                        <div class="card">
                            <h2>🛡️ Avengers OAuth 2.0 Success <span class="badge">เข้าสู่ระบบสำเร็จ</span></h2>
                            <div style="display:flex; align-items:center; gap: 15px; margin: 20px 0;">
                                <img src="${profile.avatar_url}" class="profile-img" alt="Avatar">
                                <div>
                                    <h3 style="margin:0;">Hero: ${heroName} (@${profile.login})</h3>
                                    <p style="margin:4px 0 0; color:#94a3b8;">เชื่อมต่อบัญชี GitHub เข้าสู่ฐานข้อมูลยาน Quinjet สำเร็จ!</p>
                                </div>
                            </div>

                            <div class="note">
                                💡 <b>ระบบได้บันทึก Token ลงใน Browser ของคุณให้อัตโนมัติแล้ว!</b> คุณสามารถกดปุ่ม "กลับหน้าหลัก" แล้วกดทดสอบยิง Protect API ได้ทันที หรือทดสอบยิงสดด้านล่างนี้:
                            </div>
                            
                            <h4>🔑 1. GitHub OAuth Access Token (สำหรับเรียก GitHub API):</h4>
                            <div class="token-box">${githubAccessToken}</div>

                            <h4>🎟️ 2. Avengers JWT Bearer Token (สำหรับเข้าถึง Protect/Private API):</h4>
                            <div class="token-box" id="jwtToken">${jwtToken}</div>

                            <div style="margin-top: 20px;">
                                <button class="btn" onclick="testProtectProfile()">⚡ ทดสอบยิง Protect Profile (แนบ Token สดๆ)</button>
                                <button class="btn" style="background:#64748b; color:white;" onclick="copyToken()">📋 คัดลอก JWT Token</button>
                                <a href="http://localhost:3000?token=${jwtToken}" class="btn" style="background:#e2e8f0; color:#0f172a;" id="homeLink">🏠 กลับหน้าหลัก Dashboard (localhost:3000)</a>
                            </div>

                            <div id="testResult" class="result-box"></div>
                        </div>

                        <script>
                            const token = '${jwtToken}';
                            // บันทึก Token ลง localStorage อัตโนมัติทันที!
                            localStorage.setItem('token', token);

                            function copyToken() {
                                navigator.clipboard.writeText(token);
                                alert('คัดลอก Avengers JWT Token เรียบร้อย! นำไปใส่ใน Postman (Header: Authorization) ได้เลย');
                            }

                            async function testProtectProfile() {
                                const btn = event.target;
                                const originalText = btn.innerText;
                                btn.innerText = '⏳ กำลังดึงข้อมูล...';
                                btn.disabled = true;

                                const box = document.getElementById('testResult');
                                box.style.display = 'block';
                                box.style.border = '2px solid #38bdf8';
                                box.style.padding = '15px';
                                box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                                box.innerText = '⚡ [SENDING]: GET /api/protect/profile\nAuthorization: Bearer ' + token.substring(0, 20) + '...\n\nรอการตอบกลับจากเซิร์ฟเวอร์...';

                                try {
                                    const res = await fetch('/api/protect/profile', {
                                        headers: { 'Authorization': 'Bearer ' + token }
                                    });
                                    const data = await res.json();
                                    box.innerText = '✅ HTTP ' + res.status + ' OK! ผลลัพธ์ที่ได้จากการส่ง Bearer Token:\n\n' + JSON.stringify(data, null, 2);
                                } catch(e) {
                                    box.innerText = '❌ Error: ' + e.message;
                                } finally {
                                    btn.innerText = originalText;
                                    btn.disabled = false;
                                }
                            }
                        </script>
                    </body>
                    </html>
                `);
            };

            if (!existingUser) {
                // ถ้ายังไม่มีในฐานข้อมูล ให้เพิ่มลงไปในฐานข้อมูลยาน
                const insertSql = 'INSERT INTO users (name, power, age, username, password, role) VALUES (?, ?, ?, ?, ?, ?)';
                db.run(insertSql, [heroName, 'GitHub Tech & Coding Sorcery', 25, githubUsername, 'OAUTH_USER_NO_PASSWORD', 'user'], function (insertErr) {
                    if (insertErr) {
                        return res.status(500).json({ message: 'DB Error creating OAuth user', error: insertErr.message });
                    }
                    issueTokens(this.lastID, 'user');
                });
            } else {
                issueTokens(existingUser.id, existingUser.role);
            }
        });

    } catch (err) {
        res.status(500).json({ message: 'OAuth Authentication server error', error: err.message });
    }
});

// 3. GET /auth/github/real-api - ตัวอย่างการยิงเรียก GitHub API ภายนอก (ตามสไลด์หน้า 15-16)
router.get('/github/real-api', async (req, res) => {
    try {
        const response = await fetch('https://api.github.com/users/octocat');
        const data = await response.json();
        res.json({
            message: 'Real GitHub Public API Response (ตามตัวอย่างในสไลด์หน้า 15-16)',
            data: data
        });
    } catch (err) {
        res.status(500).json({ message: 'Error calling GitHub API', error: err.message });
    }
});

module.exports = router;
