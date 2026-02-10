// test_api.mjs
const BASE_URL = "http://localhost:8080/api";

// Helper function to simplify requests
async function post(endpoint, body) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });
    return await response.json();
}

async function get(endpoint) {
    const response = await fetch(`${BASE_URL}${endpoint}`);
    return await response.json();
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// --- THE TEST SCENARIO ---
async function runTest() {
    console.log("🤖 Starting API Test...");

    // 1. Create a User
    console.log("\n1️⃣ Creating User...");
    const user = await post("/users", { username: "Terminal_Bot" });
    if (!user.userId) {
        console.error("❌ Failed to create user:", user);
        return;
    }
    console.log("✅ User Created:", user.username, "(ID:", user.userId, ")");

    // 2. Create a Session (Room)
    console.log("\n2️⃣ Creating Session...");
    const room = await post("/sessions", { hostId: user.userId });
    if (!room.roomId) {
        console.error("❌ Failed to create room:", room);
        return;
    }
    console.log("✅ Room Created:", room.roomId);

    // 3. Check Initial Status
    console.log("\n3️⃣ Checking Status (Should be IDLE)...");
    let status = await get(`/sessions/${room.roomId}`);
    console.log(`   State: ${status.timer.state}`);
    console.log(`   Time:  ${status.timer.remaining / 60} mins`);

    // 4. Start the Timer
    console.log("\n4️⃣ Starting Timer...");
    await post(`/sessions/${room.roomId}/action`, { action: "start" });
    console.log("   Command sent.");

    // 5. Wait 3 seconds to let the timer tick
    console.log("\n⏳ Waiting 3 seconds...");
    await sleep(3000);

    // 6. Check Status Again (Time should have decreased)
    console.log("\n6️⃣ Checking Status Again...");
    status = await get(`/sessions/${room.roomId}`);
    
    const minutes = Math.floor(status.timer.remaining / 60);
    const seconds = status.timer.remaining % 60;
    
    console.log(`   State: ${status.timer.state}`); // Should be "work"
    console.log(`   Time:  ${minutes}:${seconds}`);   // Should be approx 24:57

    if (status.timer.state === "work" && status.timer.remaining < 25 * 60) {
        console.log("\n🎉 TEST PASSED: The backend is fully functional!");
    } else {
        console.log("\n⚠️ TEST FAILED: Timer did not start or decrease.");
    }
}

runTest();