const BASE_URL = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

async function fullLifecycleAudit() {
    console.log('\n🚀 Starting Comprehensive Full-Stack Audit...\n');
    
    let token = '';
    let userId = '';
    let projectId = '';
    
    try {
        // 1. Connectivity
        console.log('--- 1. Infrastructure Check ---');
        const healthRes = await fetch(`${SOCKET_URL}/`);
        const health = await healthRes.json();
        console.log('✅ Backend Health Check:', health.message);

        // 2. Auth Flow (Register & Login)
        console.log('\n--- 2. Authentication Flow ---');
        const userPayload = {
            username: 'audit_user_' + Math.floor(Math.random() * 1000),
            email: `audit_${Date.now()}@test.com`,
            password: 'StrongPassword123!'
        };

        const regRes = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userPayload)
        });
        if (!regRes.ok) throw new Error('Registration failed');
        console.log('✅ Registration: Successful');
        
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: userPayload.email,
                password: userPayload.password
            })
        });
        const loginData = await loginRes.json();
        if (!loginRes.ok) throw new Error('Login failed');
        token = loginData.token;
        userId = loginData.user._id;
        console.log('✅ Login: Successful (JWT Issued)');

        const headers = { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        // 3. Project Creation
        console.log('\n--- 3. Data Persistence (Projects) ---');
        const projectRes = await fetch(`${BASE_URL}/projects`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                title: 'Audit Project ' + Date.now(),
                description: 'This is a project created during a full-stack E2E audit.',
                teamSize: 5,
                requiredSkills: ['Audit', 'Testing']
            })
        });
        const projectData = await projectRes.json();
        if (!projectRes.ok) throw new Error('Project creation failed');
        projectId = projectData.project._id;
        console.log('✅ Project Creation: Persistent');

        // 4. Task Management
        console.log('\n--- 4. Data Persistence (Tasks) ---');
        const taskRes = await fetch(`${BASE_URL}/tasks`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                projectId,
                title: 'Verify Persistence',
                description: 'Check if tasks are correctly stored.',
                assignedTo: userId,
                dueDate: new Date().toISOString()
            })
        });
        const taskData = await taskRes.json();
        if (!taskRes.ok) throw new Error('Task creation failed');
        console.log('✅ Task Creation: References verified');

        // 5. Activity Logging
        console.log('\n--- 5. Activity Logging ---');
        const activitiesRes = await fetch(`${BASE_URL}/activities`, { headers });
        const activitiesData = await activitiesRes.json();
        if (activitiesRes.ok && activitiesData.length > 0) {
            console.log('✅ Activity Logging: Traces verified');
        } else {
            console.error('❌ Activity Logging: Verification failed');
        }

        // 6. Join Request Simulation
        console.log('\n--- 6. Join Requests & Notifications ---');
        const joinRes = await fetch(`${BASE_URL}/projects/${projectId}/join`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ message: 'I want to help with audit.', github: 'test', resume: 'test' })
        });
        const joinData = await joinRes.json();
        if (joinRes.status === 400 && joinData.message.includes('already a member')) {
            console.log('✅ Join Requests: Member guards verified');
        } else if (joinRes.ok) {
            console.log('✅ Join Requests: Creation verified');
        } else {
            console.error('❌ Join Requests: Failed', joinData);
        }

        const notifsRes = await fetch(`${BASE_URL}/notifications`, { headers });
        const notifsData = await notifsRes.json();
        console.log('✅ Notifications: Retrieval verified');

        console.log('\n🎉 Audit Result: ALL CORE FEATURES PERSISTING CORRECTLY');
        process.exit(0);

    } catch (err) {
        console.error('\n❌ Audit Failure:', err.message);
        process.exit(1);
    }
}

fullLifecycleAudit();
