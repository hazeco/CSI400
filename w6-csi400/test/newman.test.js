const newman = require('newman');
const { expect } = require('chai');
const path = require('path');
const app = require('../backend/server');

describe('🚀 Postman Collection via Newman Runner (CI/CD Integration)', function () {
    this.timeout(60000);

    let server;
    const PORT = 3000;

    // Start server before running Postman collection
    before(function (done) {
        server = app.listen(PORT, () => {
            console.log(`[Newman Test] Local test server started on port ${PORT}`);
            done();
        });
    });

    // Stop server after Postman collection finishes
    after(function (done) {
        if (server) {
            server.close(done);
        } else {
            done();
        }
    });

    it('collection should execute all requests with zero assertion failures', function (done) {
        const collectionPath = path.join(__dirname, '..', 'postman', 'Avengers_Hero_API.postman_collection.json');
        const envPath = path.join(__dirname, '..', 'postman', 'Avengers_Hero_API.postman_environment.json');

        newman.run({
            collection: require(collectionPath),
            environment: require(envPath),
            reporters: ['cli']
        }, function (err, summary) {
            if (err) return done(err);

            const failures = summary.run.failures || [];
            try {
                expect(failures.length, `Expected 0 failures but got ${failures.length} failure(s)`).to.equal(0);
                done();
            } catch (e) {
                done(e);
            }
        });
    });
});
