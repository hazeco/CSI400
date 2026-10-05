const request = require('supertest');
const { expect } = require('chai');
const app = require('../backend/server');
const heroStore = require('../backend/data/heroStore');

describe('🦸‍♂️ Avengers Hero API Test Suite (Mocha + Chai + Supertest)', function () {
    this.timeout(10000);

    let createdHeroId;
    const testHeroPayload = {
        name: 'Carol Danvers',
        codename: 'Captain Marvel',
        powerClass: 'Cosmic / Energy',
        powerLevel: 97,
        status: 'Active Duty',
        affiliation: 'Avengers Core',
        baseLocation: 'Cosmic Patrol / Earth Base',
        clearanceLevel: 'Level Alpha',
        gear: ['Binary Star Generator', 'Kree Flight Suit'],
        missionsCompleted: 35
    };

    // Global setup hook: reset the hero store before tests run
    before(function () {
        heroStore.resetStore();
    });

    // Global teardown hook: clean up state after tests run
    after(function () {
        heroStore.resetStore();
    });

    // ==========================================
    // 1. GET /api/heroes (Read all & filters)
    // ==========================================
    describe('1. GET /api/heroes - Retrieve Heroes', function () {
        it('should return status 200 and a list of all heroes', async function () {
            const res = await request(app)
                .get('/api/heroes')
                .expect('Content-Type', /json/)
                .expect(200);

            expect(res.body).to.have.property('success', true);
            expect(res.body).to.have.property('count');
            expect(res.body.count).to.be.a('number').and.to.be.at.least(6);
            expect(res.body.heroes).to.be.an('array');

            // Schema assertion for first hero
            const firstHero = res.body.heroes[0];
            expect(firstHero).to.have.property('id');
            expect(firstHero).to.have.property('name');
            expect(firstHero).to.have.property('codename');
            expect(firstHero).to.have.property('powerClass');
            expect(firstHero).to.have.property('powerLevel').that.is.a('number');
        });

        it('should filter heroes by status query parameter', async function () {
            const res = await request(app)
                .get('/api/heroes?status=Active Duty')
                .expect(200);

            expect(res.body.success).to.be.true;
            expect(res.body.heroes).to.be.an('array');
            res.body.heroes.forEach(h => {
                expect(h.status.toLowerCase()).to.equal('active duty');
            });
        });

        it('should search heroes by keyword in name or codename', async function () {
            const res = await request(app)
                .get('/api/heroes?search=Stark')
                .expect(200);

            expect(res.body.success).to.be.true;
            expect(res.body.heroes).to.be.an('array').with.lengthOf.at.least(1);
            expect(res.body.heroes[0].name).to.include('Stark');
        });
    });

    // ==========================================
    // 2. GET /api/heroes/:id (Read Single Hero)
    // ==========================================
    describe('2. GET /api/heroes/:id - Hero Details', function () {
        it('should return status 200 and hero details for valid ID (Iron Man #1)', async function () {
            const res = await request(app)
                .get('/api/heroes/1')
                .expect(200);

            expect(res.body).to.have.property('success', true);
            expect(res.body).to.have.property('hero');
            expect(res.body.hero.id).to.equal(1);
            expect(res.body.hero.name).to.equal('Tony Stark');
            expect(res.body.hero.codename).to.equal('Iron Man');
        });

        it('should return status 404 for a non-existent hero ID (Negative Test)', async function () {
            const res = await request(app)
                .get('/api/heroes/99999')
                .expect(404);

            expect(res.body).to.have.property('success', false);
            expect(res.body).to.have.property('error', 'Not Found');
            expect(res.body.message).to.include('#99999');
        });

        it('should return status 400 for a non-numeric ID parameter', async function () {
            const res = await request(app)
                .get('/api/heroes/invalid-id-format')
                .expect(400);

            expect(res.body.success).to.be.false;
            expect(res.body.error).to.equal('Bad Request');
        });
    });

    // ==========================================
    // 3. POST /api/heroes (Create Hero)
    // ==========================================
    describe('3. POST /api/heroes - Register New Hero', function () {
        it('should create a new hero and return status 201 with generated ID', async function () {
            const res = await request(app)
                .post('/api/heroes')
                .send(testHeroPayload)
                .expect('Content-Type', /json/)
                .expect(201);

            expect(res.body).to.have.property('success', true);
            expect(res.body).to.have.property('hero');
            expect(res.body.hero).to.have.property('id').that.is.a('number');
            expect(res.body.hero.name).to.equal(testHeroPayload.name);
            expect(res.body.hero.codename).to.equal(testHeroPayload.codename);
            expect(res.body.hero.powerLevel).to.equal(testHeroPayload.powerLevel);

            createdHeroId = res.body.hero.id;
        });

        it('should return status 400 Bad Request when "name" is missing (Negative Test)', async function () {
            const res = await request(app)
                .post('/api/heroes')
                .send({ codename: 'Nameless Hero' })
                .expect(400);

            expect(res.body.success).to.be.false;
            expect(res.body.message).to.include('name');
        });

        it('should return status 400 Bad Request when "codename" is missing (Negative Test)', async function () {
            const res = await request(app)
                .post('/api/heroes')
                .send({ name: 'Clint Barton' })
                .expect(400);

            expect(res.body.success).to.be.false;
            expect(res.body.message).to.include('codename');
        });

        it('should return status 409 Conflict when registering duplicate codename', async function () {
            const res = await request(app)
                .post('/api/heroes')
                .send(testHeroPayload)
                .expect(409);

            expect(res.body.success).to.be.false;
            expect(res.body.error).to.equal('Conflict');
        });
    });

    // ==========================================
    // 4. PUT /api/heroes/:id (Update Hero)
    // ==========================================
    describe('4. PUT /api/heroes/:id - Update Hero Information', function () {
        it('should update existing hero and return status 200 with updated fields', async function () {
            const updates = {
                powerLevel: 99,
                status: 'On Mission',
                baseLocation: 'Alpha Flight Space Station'
            };

            const res = await request(app)
                .put(`/api/heroes/${createdHeroId}`)
                .send(updates)
                .expect(200);

            expect(res.body.success).to.be.true;
            expect(res.body.hero.id).to.equal(createdHeroId);
            expect(res.body.hero.powerLevel).to.equal(99);
            expect(res.body.hero.status).to.equal('On Mission');
            expect(res.body.hero.baseLocation).to.equal('Alpha Flight Space Station');
        });

        it('should return status 404 when updating non-existent hero (Negative Test)', async function () {
            const res = await request(app)
                .put('/api/heroes/88888')
                .send({ status: 'Inactive' })
                .expect(404);

            expect(res.body.success).to.be.false;
            expect(res.body.error).to.equal('Not Found');
        });
    });

    // ==========================================
    // 5. DELETE /api/heroes/:id (Delete Hero)
    // ==========================================
    describe('5. DELETE /api/heroes/:id - Decommission Hero', function () {
        it('should delete created hero and return status 200', async function () {
            const res = await request(app)
                .delete(`/api/heroes/${createdHeroId}`)
                .expect(200);

            expect(res.body.success).to.be.true;
            expect(res.body).to.have.property('decommissionedHero');
            expect(res.body.decommissionedHero.id).to.equal(createdHeroId);
        });

        it('should verify deleted hero no longer exists with GET 404 (Cleanup verification)', async function () {
            const res = await request(app)
                .get(`/api/heroes/${createdHeroId}`)
                .expect(404);

            expect(res.body.success).to.be.false;
        });

        it('should return status 404 when deleting already removed hero', async function () {
            const res = await request(app)
                .delete(`/api/heroes/${createdHeroId}`)
                .expect(404);

            expect(res.body.success).to.be.false;
        });
    });

    // ==========================================
    // 6. GET /api/heroes/stats/summary (Telemetry)
    // ==========================================
    describe('6. GET /api/heroes/stats/summary - Operational Telemetry', function () {
        it('should return status 200 and telemetry data summary', async function () {
            const res = await request(app)
                .get('/api/heroes/stats/summary')
                .expect(200);

            expect(res.body.success).to.be.true;
            expect(res.body).to.have.property('summary');
            expect(res.body.summary).to.have.property('totalHeroes').that.is.a('number');
            expect(res.body.summary).to.have.property('avgPowerLevel').that.is.a('number');
            expect(res.body.summary).to.have.property('statusBreakdown').that.is.an('object');
        });
    });
});
