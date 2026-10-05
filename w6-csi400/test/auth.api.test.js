const request = require('supertest');
const { expect } = require('chai');
const app = require('../backend/server');

describe('🔐 Security & Authentication Test Suite (Mocha + Chai)', function () {
    this.timeout(10000);

    let authToken;

    // ==========================================
    // 1. POST /api/auth/login (Happy Path)
    // ==========================================
    describe('1. POST /api/auth/login - User Authentication', function () {
        it('should login successfully as Tony Stark and return 200 with JWT token', async function () {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    username: 'tonystark',
                    password: 'ironman123'
                })
                .expect(200);

            expect(res.body).to.have.property('success', true);
            expect(res.body).to.have.property('token').that.is.a('string').and.not.empty;
            expect(res.body).to.have.property('user');
            expect(res.body.user).to.have.property('username', 'tonystark');
            expect(res.body.user).to.have.property('role', 'admin');

            // Save token for subsequent protected tests (as in lecture slide 3 & 7)
            authToken = res.body.token;
        });

        it('should login successfully as Steve Rogers (Captain America)', async function () {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    username: 'captain',
                    password: 'shield123'
                })
                .expect(200);

            expect(res.body.success).to.be.true;
            expect(res.body.user.name).to.equal('Steve Rogers');
        });
    });

    // ==========================================
    // 2. Authentication Negative Scenarios (Slide 9)
    // ==========================================
    describe('2. Negative Cases - Invalid Credentials & Bad Request', function () {
        it('should return 401 Unauthorized for incorrect password', async function () {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    username: 'tonystark',
                    password: 'wrong_password_999'
                })
                .expect(401);

            expect(res.body).to.have.property('success', false);
            expect(res.body).to.have.property('error', 'Unauthorized');
            expect(res.body.message).to.include('Invalid username or password');
        });

        it('should return 401 Unauthorized for non-existent username', async function () {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    username: 'loki_villain',
                    password: 'password123'
                })
                .expect(401);

            expect(res.body.success).to.be.false;
            expect(res.body.error).to.equal('Unauthorized');
        });

        it('should return 400 Bad Request when username or password is missing', async function () {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    username: 'tonystark'
                })
                .expect(400);

            expect(res.body.success).to.be.false;
            expect(res.body.error).to.equal('Bad Request');
        });
    });

    // ==========================================
    // 3. Protected Route Verification (/api/auth/me)
    // ==========================================
    describe('3. Protected Route Verification with Bearer Token', function () {
        it('should grant access to /api/auth/me when valid Bearer token is provided', async function () {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(res.body).to.have.property('success', true);
            expect(res.body).to.have.property('user');
            expect(res.body.user.username).to.equal('tonystark');
        });

        it('should return 401 Unauthorized when Authorization header is missing', async function () {
            const res = await request(app)
                .get('/api/auth/me')
                .expect(401);

            expect(res.body.success).to.be.false;
            expect(res.body.error).to.equal('Unauthorized');
            expect(res.body.message).to.include('Missing Authorization header');
        });

        it('should return 401 Unauthorized when an invalid or fake token is supplied (Slide 9)', async function () {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake.invalid')
                .expect(401);

            expect(res.body.success).to.be.false;
            expect(res.body.error).to.equal('Unauthorized');
            expect(res.body.message).to.include('Token verification failed');
        });
    });
});
