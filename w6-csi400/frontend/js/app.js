/**
 * CSI400 Week 6 - Avengers API Hub & Testing Operations
 * Script logic for Frontend-to-Server.js Sync, Mocha Live Runner & Hero CRUD
 */

// Automatically determine API_BASE:
// If running directly on Express port 3000 -> use window.location.origin
// If running on VS Code Live Server (5500/5501) or file:// -> target http://localhost:3000
const API_BASE = (window.location.protocol === 'http:' && window.location.port === '3000')
    ? window.location.origin
    : 'http://localhost:3000';

// Application State
const state = {
    currentUser: {
        username: 'tonystark',
        password: 'ironman123',
        name: 'Tony Stark',
        role: 'admin'
    },
    token: null,
    heroes: [],
    filterStatus: 'ALL',
    searchQuery: '',
    selectedEndpoint: 'get_heroes'
};

// Seed presets for Agent quick-switch
const USER_PRESETS = {
    tonystark: { username: 'tonystark', password: 'ironman123', name: 'Tony Stark', role: 'admin' },
    captain: { username: 'captain', password: 'shield123', name: 'Steve Rogers', role: 'user' },
    spiderman: { username: 'spiderman', password: 'web123', name: 'Peter Parker', role: 'user' },
    thor: { username: 'thor', password: 'hammer123', name: 'Thor Odinson', role: 'user' }
};

// Endpoint Definitions for Manual API Explorer
const ENDPOINTS_DEF = {
    get_heroes: {
        method: 'GET',
        path: '/api/heroes',
        desc: 'ดึงรายการฮีโร่ทั้งหมด (GET /api/heroes)',
        requiresAuth: false,
        defaultBody: ''
    },
    get_hero_by_id: {
        method: 'GET',
        path: '/api/heroes/1',
        desc: 'ดึงข้อมูลฮีโร่รายคนตาม ID (GET /api/heroes/1 - Tony Stark)',
        requiresAuth: false,
        defaultBody: ''
    },
    post_hero: {
        method: 'POST',
        path: '/api/heroes',
        desc: 'สร้าง/ลงทะเบียนฮีโร่ใหม่ (POST /api/heroes - เฉพาะ Admin)',
        requiresAuth: true,
        defaultBody: JSON.stringify({
            name: "Carol Danvers",
            codename: "Captain Marvel",
            powerClass: "Cosmic / Mystic",
            powerLevel: 97,
            status: "Active Duty",
            affiliation: "Avengers Core",
            baseLocation: "Earth Command Base",
            clearanceLevel: "Level Alpha"
        }, null, 2)
    },
    put_hero: {
        method: 'PUT',
        path: '/api/heroes/1',
        desc: 'แก้ไขข้อมูลหรือสถานะฮีโร่ (PUT /api/heroes/1 - เฉพาะ Admin)',
        requiresAuth: true,
        defaultBody: JSON.stringify({
            status: "On Mission",
            powerLevel: 98,
            baseLocation: "Stark Tower Orbital Station"
        }, null, 2)
    },
    delete_hero: {
        method: 'DELETE',
        path: '/api/heroes/6',
        desc: 'ปลดประจำการฮีโร่ออกจากระบบ (DELETE /api/heroes/6 - เฉพาะ Admin)',
        requiresAuth: true,
        defaultBody: ''
    },
    auth_login: {
        method: 'POST',
        path: '/api/auth/login',
        desc: 'เข้าสู่ระบบเพื่อรับ JWT Token (POST /api/auth/login)',
        requiresAuth: false,
        defaultBody: JSON.stringify({
            username: "tonystark",
            password: "ironman123"
        }, null, 2)
    },
    auth_me: {
        method: 'GET',
        path: '/api/auth/me',
        desc: 'เรียกดูโปรไฟล์ส่วนตัว (Protected - ต้องแนบ Bearer Token)',
        requiresAuth: true,
        defaultBody: ''
    },
    stats_summary: {
        method: 'GET',
        path: '/api/heroes/stats/summary',
        desc: 'ดึงข้อมูลสถิติและ Telemetry ภาพรวม (GET /api/heroes/stats/summary)',
        requiresAuth: false,
        defaultBody: ''
    }
};

// ===================================================================
// INITIALIZATION
// ===================================================================
document.addEventListener('DOMContentLoaded', async () => {
    initTabs();
    initAgentAuth();
    await checkServerConnection();
    await fetchHeroes();
    await fetchStats();
    initApiExplorer();
    setupEventListeners();

    // Restore test results if previously executed
    const savedTestResult = sessionStorage.getItem('csi400_test_results');
    if (savedTestResult) {
        try {
            renderTestResults(JSON.parse(savedTestResult));
        } catch (e) {
            sessionStorage.removeItem('csi400_test_results');
        }
    }
});

// Live Server Connection Health Check
async function checkServerConnection() {
    const statusText = document.getElementById('serverStatusText');
    const statusDot = document.getElementById('serverStatusDot');

    try {
        const res = await fetch(`${API_BASE}/api/system/health`);
        if (res.ok) {
            if (statusText) statusText.textContent = `Server Connected (${API_BASE.replace('http://', '')})`;
            if (statusDot) statusDot.style.background = '#10b981';
        } else {
            throw new Error('Health check returned non-200');
        }
    } catch (e) {
        if (statusText) {
            statusText.textContent = 'Server Disconnected (กรุณารัน node server.js)';
            statusText.parentElement.style.color = '#ef4444';
            statusText.parentElement.style.borderColor = 'rgba(239, 68, 68, 0.4)';
            statusText.parentElement.style.background = 'rgba(239, 68, 68, 0.12)';
        }
        if (statusDot) statusDot.style.background = '#ef4444';
    }
}

// Tab Switching
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-nav-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-tab');
            tabBtns.forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            const targetPanel = document.getElementById(targetId);
            if (targetPanel) targetPanel.classList.add('active');
        });
    });
}

// User Preset Switcher & Token Setup
async function initAgentAuth() {
    const userSelect = document.getElementById('userPresetSelect');
    if (userSelect) {
        userSelect.addEventListener('change', async (e) => {
            const selectedKey = e.target.value;
            state.currentUser = USER_PRESETS[selectedKey];
            await loginAgent();
            renderHeroesTable(state.heroes); // Instantly update lock icons based on role
        });
    }
    await loginAgent();
}

async function loginAgent() {
    try {
        const res = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: state.currentUser.username,
                password: state.currentUser.password
            })
        });
        const data = await res.json();
        if (data.success && data.token) {
            state.token = data.token;
            const roleBadge = state.currentUser.role === 'admin' ? 'Alpha Admin' : 'Beta User';
            showToast(`ผู้ใช้งาน: ${state.currentUser.name} (${roleBadge})`, 'success');
        }
    } catch (err) {
        console.error('Login error:', err);
    }
}

// ===================================================================
// HERO REGISTRY MANAGEMENT
// ===================================================================
async function fetchHeroes() {
    try {
        let url = `${API_BASE}/api/heroes?`;
        if (state.filterStatus !== 'ALL') url += `status=${encodeURIComponent(state.filterStatus)}&`;
        if (state.searchQuery) url += `search=${encodeURIComponent(state.searchQuery)}&`;

        const res = await fetch(url);
        const data = await res.json();
        if (data.success) {
            state.heroes = data.heroes;
            renderHeroesTable(state.heroes);
            document.getElementById('statTotalHeroes').textContent = data.count || 0;
            document.getElementById('heroesCountBadge').textContent = data.count || 0;
        }
    } catch (err) {
        showToast('ไม่สามารถดึงข้อมูลฮีโร่จากเซิร์ฟเวอร์ได้ (โปรดตรวจสอบว่าเปิด server.js อยู่หรือไม่)', 'error');
    }
}

async function fetchStats() {
    try {
        const res = await fetch(`${API_BASE}/api/heroes/stats/summary`);
        const data = await res.json();
        if (data.success && data.summary) {
            document.getElementById('statAvgPower').textContent = `${data.summary.avgPowerLevel}%`;
            document.getElementById('statActiveDuty').textContent = data.summary.activeDeployments;
        }
    } catch (err) {
        console.error('Stats error:', err);
    }
}

function renderHeroesTable(heroes) {
    const tbody = document.getElementById('heroesTableBody');
    if (!tbody) return;

    if (heroes.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 2rem; color: var(--text-muted);">
                    ไม่พบข้อมูลฮีโร่ตามเงื่อนไขที่ค้นหา
                </td>
            </tr>
        `;
        return;
    }

    const isAdmin = state.currentUser && state.currentUser.role === 'admin';

    tbody.innerHTML = heroes.map(hero => {
        let pillClass = 'pill-active';
        if (hero.status === 'On Mission') pillClass = 'pill-mission';
        if (hero.status === 'Standby') pillClass = 'pill-standby';
        if (hero.status === 'Recovering') pillClass = 'pill-recovering';

        const actionButtons = isAdmin
            ? `
                <button class="btn btn-outline btn-sm" onclick="openEditModal(${hero.id})">แก้ไข</button>
                <button class="btn btn-danger-outline btn-sm" onclick="deleteHeroAction(${hero.id}, '${hero.codename}')">ลบ</button>
              `
            : `
                <button class="btn btn-outline btn-sm" style="opacity: 0.5;" onclick="openEditModal(${hero.id})" title="เฉพาะ Tony Stark (Admin) เท่านั้นที่แก้ไขได้">🔒 แก้ไข</button>
                <button class="btn btn-danger-outline btn-sm" style="opacity: 0.5;" onclick="deleteHeroAction(${hero.id}, '${hero.codename}')" title="เฉพาะ Tony Stark (Admin) เท่านั้นที่ลบได้">🔒 ลบ</button>
              `;

        return `
            <tr>
                <td style="color: var(--text-muted); font-weight: 600;">#${hero.id}</td>
                <td>
                    <strong style="color: #fff;">${hero.codename}</strong>
                </td>
                <td style="color: var(--text-secondary);">${hero.name}</td>
                <td>
                    <span class="hero-tag">${hero.powerClass}</span>
                </td>
                <td>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span style="font-weight: 600;">${hero.powerLevel}</span>
                        <div style="flex: 1; height: 4px; background: #374151; border-radius: 2px;">
                            <div style="width: ${hero.powerLevel}%; height: 100%; background: #3b82f6; border-radius: 2px;"></div>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="pill-status ${pillClass}">${hero.status}</span>
                </td>
                <td style="color: var(--text-muted); font-size: 0.75rem;">${hero.baseLocation}</td>
                <td style="text-align: right;">
                    ${actionButtons}
                </td>
            </tr>
        `;
    }).join('');
}

// Modal Form handling
window.openCreateModal = function() {
    if (state.currentUser.role !== 'admin') {
        showToast(`⚠️ สิทธิ์ไม่เพียงพอ! ${state.currentUser.name} (User) ไม่มีสิทธิ์เพิ่มฮีโร่ — เฉพาะ Tony Stark (Admin) เท่านั้น`, 'error');
        return;
    }

    document.getElementById('modalTitle').textContent = 'ลงทะเบียนฮีโร่ใหม่เข้าสู่ระบบ (Admin Clearance)';
    document.getElementById('heroForm').reset();
    document.getElementById('heroIdInput').value = '';
    document.getElementById('heroModal').classList.add('show');
};

window.openEditModal = function(id) {
    if (state.currentUser.role !== 'admin') {
        showToast(`⚠️ สิทธิ์ไม่เพียงพอ! ${state.currentUser.name} (User) ไม่มีสิทธิ์แก้ไขข้อมูล — เฉพาะ Tony Stark (Admin) เท่านั้น`, 'error');
        return;
    }

    const hero = state.heroes.find(h => h.id === id);
    if (!hero) return;

    document.getElementById('modalTitle').textContent = `แก้ไขข้อมูลฮีโร่: ${hero.codename} (#${hero.id})`;
    document.getElementById('heroIdInput').value = hero.id;
    document.getElementById('heroRealName').value = hero.name;
    document.getElementById('heroCodename').value = hero.codename;
    document.getElementById('heroClass').value = hero.powerClass;
    document.getElementById('heroPowerLevel').value = hero.powerLevel;
    document.getElementById('heroStatus').value = hero.status;
    document.getElementById('heroAffiliation').value = hero.affiliation;
    document.getElementById('heroLocation').value = hero.baseLocation;

    document.getElementById('heroModal').classList.add('show');
};

window.closeHeroModal = function() {
    document.getElementById('heroModal').classList.remove('show');
};

window.deleteHeroAction = async function(id, codename) {
    if (state.currentUser.role !== 'admin') {
        showToast(`⚠️ สิทธิ์ไม่เพียงพอ! ${state.currentUser.name} (User) ไม่มีสิทธิ์ปลดประจำการฮีโร่ — เฉพาะ Tony Stark (Admin) เท่านั้น`, 'error');
        return;
    }

    if (!confirm(`คุณต้องการปลดประจำการฮีโร่ ${codename} (#${id}) ออกจากระบบใช่หรือไม่?`)) {
        return;
    }

    try {
        const headers = {};
        if (state.token) headers['Authorization'] = `Bearer ${state.token}`;

        const res = await fetch(`${API_BASE}/api/heroes/${id}`, { 
            method: 'DELETE',
            headers: headers
        });
        const data = await res.json();
        if (data.success) {
            showToast(`ลบฮีโร่ ${codename} เรียบร้อยแล้ว`, 'success');
            await fetchHeroes();
            await fetchStats();
        } else {
            showToast(data.message || 'ไม่สามารถลบข้อมูลได้', 'error');
        }
    } catch (err) {
        showToast('เกิดข้อผิดพลาดในการเชื่อมต่อ', 'error');
    }
};

window.resetHeroStore = async function() {
    try {
        const res = await fetch(`${API_BASE}/api/heroes/reset`, { method: 'POST' });
        const data = await res.json();
        if (data.success) {
            sessionStorage.removeItem('csi400_test_results');
            const tbody = document.getElementById('testResultsList');
            if (tbody) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="4" style="text-align: center; padding: 2.5rem 1rem; color: var(--text-muted);">
                            <div style="font-size: 1rem; margin-bottom: 0.4rem; color: var(--text-secondary); font-weight: 600;">
                                ยังไม่ได้รันการทดสอบ (Ready to Execute)
                            </div>
                            <div style="font-size: 0.8rem;">
                                กดปุ่ม <strong style="color: #60a5fa;">"▶ รัน Mocha Test ทั้งหมด"</strong> ด้านบน เพื่อสั่งให้ <code>server.js</code> เริ่มรัน Mocha &amp; Chai สดๆ ทั้ง 24 เคส
                            </div>
                        </td>
                    </tr>
                `;
            }
            showToast('รีเซ็ตฐานข้อมูลฮีโร่กลับสู่ค่าเริ่มต้นแล้ว', 'success');
            await fetchHeroes();
            await fetchStats();
        }
    } catch (err) {
        showToast('การรีเซ็ตข้อมูลล้มเหลว', 'error');
    }
};

// ===================================================================
// AUTOMATED TEST SUITE RUNNER (MOCHA + CHAI)
// ===================================================================
window.runAutomatedTestSuite = async function() {
    const runBtn = document.getElementById('btnRunTests');
    const originalText = runBtn.innerHTML;
    runBtn.disabled = true;
    runBtn.innerHTML = `⏳ กำลังรัน Mocha Test...`;

    // Clear placeholder table and show real loading indicator
    const tbody = document.getElementById('testResultsList');
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 2.5rem 1rem; color: #60a5fa;">
                    <div style="font-size: 1.05rem; font-weight: 600; margin-bottom: 0.35rem;">
                        ⏳ กำลังสั่งให้ Server.js รัน Mocha &amp; Chai สดๆ ทั้ง 24 เคส...
                    </div>
                    <div style="font-size: 0.8rem; color: var(--text-muted);">
                        กำลังดำเนินการตรวจสอบ CRUD, Validation, Token Authentication และ Negative Cases
                    </div>
                </td>
            </tr>
        `;
    }

    showToast('กำลังส่งคำสั่งรัน Mocha & Chai ไปยัง Server.js...', 'info');

    try {
        const res = await fetch(`${API_BASE}/api/tests/run`, { 
            method: 'POST',
            headers: { 'Accept': 'application/json' }
        });
        
        if (!res.ok) {
            const errText = await res.text();
            throw new Error(`Server returned HTTP ${res.status}: ${errText}`);
        }

        const data = await res.json();

        if (data.success) {
            sessionStorage.setItem('csi400_test_results', JSON.stringify(data));
            renderTestResults(data);
            showToast(`รันชุดทดสอบครบทั้ง ${data.summary.total} เคสสำเร็จ (${data.summary.durationMs}ms)`, 'success');
            await fetchHeroes();
            await fetchStats();
        } else {
            showToast('การรันเทสต์พบข้อผิดพลาด', 'error');
        }
    } catch (err) {
        console.error('Test Runner execution error:', err);
        showToast(`ไม่สามารถเชื่อมต่อกับ Test Runner ได้ (${err.message})`, 'error');
    } finally {
        runBtn.disabled = false;
        runBtn.innerHTML = originalText;
    }
};

function renderTestResults(data) {
    const tbody = document.getElementById('testResultsList');
    if (!tbody) return;

    const summary = data.summary;
    document.getElementById('statPassRate').textContent = summary.passRate;
    document.getElementById('passCountBadge').textContent = `${summary.passed} ผ่าน • ${summary.failed} ล้มเหลว`;
    document.getElementById('testDurationPill').textContent = `${summary.durationMs} ms`;

    const allTests = [...(data.passes || []), ...(data.failures || [])];

    tbody.innerHTML = allTests.map((test, index) => {
        const isPassed = test.status === 'passed';
        const badgeClass = isPassed ? 'badge-pass' : 'badge-fail';
        const badgeText = isPassed ? 'PASS' : 'FAIL';

        return `
            <tr>
                <td><span class="badge-status ${badgeClass}">${badgeText}</span></td>
                <td>
                    <div style="font-weight: 600; color: #fff;">#${index + 1} &bull; ${test.title}</div>
                    ${test.error ? `<div style="font-size: 0.72rem; color: #f87171; margin-top: 2px;">${test.error.message}</div>` : ''}
                </td>
                <td style="color: var(--text-secondary); font-size: 0.75rem;">${test.suite}</td>
                <td style="text-align: right; color: var(--text-muted); font-weight: 600;">${test.duration} ms</td>
            </tr>
        `;
    }).join('');
}

// ===================================================================
// INTERACTIVE API EXPLORER
// ===================================================================
function initApiExplorer() {
    const listWrap = document.getElementById('endpointListWrap');
    if (!listWrap) return;

    listWrap.innerHTML = Object.entries(ENDPOINTS_DEF).map(([key, def]) => {
        const methodClass = `m-${def.method.toLowerCase()}`;
        return `
            <div class="ep-item ${key === state.selectedEndpoint ? 'active' : ''}" onclick="selectEndpoint('${key}')">
                <span class="method-label ${methodClass}">${def.method}</span>
                <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${def.path}</span>
            </div>
        `;
    }).join('');

    loadSelectedEndpointIntoDeck(state.selectedEndpoint);
}

window.selectEndpoint = function(key) {
    state.selectedEndpoint = key;
    initApiExplorer();
    loadSelectedEndpointIntoDeck(key);
};

function loadSelectedEndpointIntoDeck(key) {
    const def = ENDPOINTS_DEF[key];
    if (!def) return;

    document.getElementById('explorerMethodBadge').textContent = def.method;
    document.getElementById('explorerMethodBadge').className = `method-label m-${def.method.toLowerCase()}`;
    document.getElementById('explorerUrlInput').value = `${API_BASE}${def.path}`;
    document.getElementById('explorerBodyTextarea').value = def.defaultBody;
    document.getElementById('explorerDescText').textContent = def.desc;

    const bodyBox = document.getElementById('bodyEditorContainer');
    if (def.method === 'GET' || def.method === 'DELETE') {
        bodyBox.style.display = 'none';
    } else {
        bodyBox.style.display = 'block';
    }
}

window.sendManualApiRequest = async function() {
    const def = ENDPOINTS_DEF[state.selectedEndpoint];
    const url = document.getElementById('explorerUrlInput').value;
    const bodyVal = document.getElementById('explorerBodyTextarea').value;
    const sendBtn = document.getElementById('btnSendManualRequest');

    sendBtn.disabled = true;
    sendBtn.textContent = 'กำลังส่ง...';

    const headers = { 'Content-Type': 'application/json' };
    if (def.requiresAuth && state.token) {
        headers['Authorization'] = `Bearer ${state.token}`;
    }

    const options = {
        method: def.method,
        headers: headers
    };

    if (def.method === 'POST' || def.method === 'PUT') {
        try {
            if (bodyVal.trim()) {
                JSON.parse(bodyVal); // Validate JSON format
                options.body = bodyVal;
            }
        } catch (e) {
            showToast('รูปแบบ JSON ไม่ถูกต้อง (Syntax Error)', 'error');
            sendBtn.disabled = false;
            sendBtn.textContent = '▶ ส่ง Request';
            return;
        }
    }

    const startTime = performance.now();
    try {
        const res = await fetch(url, options);
        const duration = Math.round(performance.now() - startTime);
        const json = await res.json();

        const statusBadge = document.getElementById('responseStatusBadge');
        statusBadge.textContent = `${res.status} ${res.statusText || ''}`;
        statusBadge.className = `badge-status ${res.ok ? 'badge-pass' : 'badge-fail'}`;

        document.getElementById('responseDurationBadge').textContent = `${duration} ms`;
        document.getElementById('responseJsonViewer').textContent = JSON.stringify(json, null, 2);

        showToast(`ได้รับ HTTP ${res.status} (${duration}ms)`, res.ok ? 'success' : 'error');

        if (['POST', 'PUT', 'DELETE'].includes(def.method)) {
            await fetchHeroes();
            await fetchStats();
        }
    } catch (err) {
        document.getElementById('responseJsonViewer').textContent = `ข้อผิดพลาด: ${err.message}`;
        showToast('การส่งคำขอล้มเหลว', 'error');
    } finally {
        sendBtn.disabled = false;
        sendBtn.textContent = '▶ ส่ง Request';
    }
};

// ===================================================================
// EVENT LISTENERS & TOAST
// ===================================================================
function setupEventListeners() {
    const searchInput = document.getElementById('heroSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            state.searchQuery = e.target.value.trim();
            fetchHeroes();
        });
    }

    const statusSelect = document.getElementById('heroStatusFilter');
    if (statusSelect) {
        statusSelect.addEventListener('change', (e) => {
            state.filterStatus = e.target.value;
            fetchHeroes();
        });
    }

    const heroForm = document.getElementById('heroForm');
    if (heroForm) {
        heroForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('heroIdInput').value;
            const payload = {
                name: document.getElementById('heroRealName').value,
                codename: document.getElementById('heroCodename').value,
                powerClass: document.getElementById('heroClass').value,
                powerLevel: Number(document.getElementById('heroPowerLevel').value),
                status: document.getElementById('heroStatus').value,
                affiliation: document.getElementById('heroAffiliation').value,
                baseLocation: document.getElementById('heroLocation').value
            };

            try {
                const method = id ? 'PUT' : 'POST';
                const endpoint = id ? `${API_BASE}/api/heroes/${id}` : `${API_BASE}/api/heroes`;

                const headers = { 'Content-Type': 'application/json' };
                if (state.token) headers['Authorization'] = `Bearer ${state.token}`;

                const res = await fetch(endpoint, {
                    method: method,
                    headers: headers,
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                if (data.success) {
                    showToast(data.message || 'บันทึกสำเร็จ', 'success');
                    closeHeroModal();
                    await fetchHeroes();
                    await fetchStats();
                } else {
                    showToast(data.message || 'ข้อมูลไม่ถูกต้อง', 'error');
                }
            } catch (err) {
                showToast('ไม่สามารถบันทึกข้อมูลได้', 'error');
            }
        });
    }
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast-msg ${type === 'success' ? 'toast-success' : (type === 'error' ? 'toast-error' : '')}`;
    toast.textContent = message;

    container.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 3500);
}
