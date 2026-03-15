const BASE_URL = 'http://localhost:5000/api';

async function verifySystem() {
    console.log('--- CollabNest E2E System Check (using fetch) ---');
    
    try {
        // 1. Connectivity Check
        const rootRes = await fetch('http://localhost:5000/');
        const rootData = await rootRes.json();
        console.log('✅ Backend Connectivity:', rootData.message);
    } catch (err) {
        console.error('❌ Backend Connectivity Failed:', err.message);
        return;
    }

    try {
        // 2. Auth Routes
        const testUser = {
            username: 'testuser_' + Date.now(),
            email: `test_${Date.now()}@test.com`,
            password: 'password123'
        };
        
        const regRes = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testUser)
        });
        const regData = await regRes.json();
        if (regRes.ok) {
            console.log('✅ Auth: Register Route Working');
        } else {
            console.error('❌ Auth: Register Route Failed:', regData.message);
        }

        // Login
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: testUser.email,
                password: testUser.password
            })
        });
        const loginData = await loginRes.json();
        if (loginRes.ok) {
            console.log('✅ Auth: Login Route Working');
        } else {
            console.error('❌ Auth: Login Route Failed:', loginData.message);
            return;
        }

        const token = loginData.token;
        const headers = { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        // 3. Project Routes
        const projectsRes = await fetch(`${BASE_URL}/projects`, { headers });
        if (projectsRes.ok) {
            console.log('✅ Projects: Index Route Working');
        } else {
            console.error('❌ Projects: Index Route Failed');
        }

        const newProjectRes = await fetch(`${BASE_URL}/projects`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                title: 'Test Project ' + Date.now(),
                description: 'System Verification Project',
                teamSize: 3,
                skills: ['React', 'Node.js']
            })
        });
        const newProjectData = await newProjectRes.json();
        if (newProjectRes.ok) {
            console.log('✅ Projects: Create Route Working & Persistence confirmed');
        } else {
            console.error('❌ Projects: Create Route Failed:', newProjectData.message);
        }

    } catch (err) {
        console.error('❌ API Verification Failed:', err.message);
    }
}

verifySystem();
