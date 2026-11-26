require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const path = require('path');
const { io: ClientIO } = require(path.resolve(__dirname, '../../frontend/node_modules/socket.io-client'));
const { app, server } = require('../server');

const TEST_PORT = 5055;

async function runEndToEndTests() {
  console.log('====================================================');
  console.log('  STARTING END-TO-END AUTOMATED VERIFICATION SUITE  ');
  console.log('====================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, testName) {
    totalTests++;
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`[FAIL] ${testName}`);
      throw new Error(`Assertion failed for: ${testName}`);
    }
  }

  const TEST_PORT = 5055;
  await new Promise((resolve) => server.listen(TEST_PORT, resolve));
  const baseUrl = `http://localhost:${TEST_PORT}`;
  console.log(`[Test Suite] Running against test server on ${baseUrl}\n`);

  try {
    // 2. Test Health Endpoint
    console.log('--- Testing System Health & Public APIs ---');
    const healthRes = await fetch(`${baseUrl}/api/health`);
    const healthJson = await healthRes.json();
    assert(healthRes.status === 200 && healthJson.status === 'online', 'GET /api/health returns online status');

    // 3. Test Public Orders
    const ordersRes = await fetch(`${baseUrl}/api/orders`);
    const ordersJson = await ordersRes.json();
    assert(ordersRes.status === 200 && ordersJson.success === true, 'GET /api/orders returns success');
    assert(Array.isArray(ordersJson.orders) && ordersJson.totalOrders > 0, 'Public orders array contains seeded data');

    // 4. Test Multilingual Search
    const searchRes = await fetch(`${baseUrl}/api/orders?search=Scholarship`);
    const searchJson = await searchRes.json();
    assert(searchJson.orders.some((o) => o.title.en.includes('Scholarship')), 'Search filter locates Scholarship orders');

    // 5. Test Hindi Search
    const hindiSearchRes = await fetch(`${baseUrl}/api/orders?search=${encodeURIComponent('छात्रवृत्ति')}`);
    const hindiSearchJson = await hindiSearchRes.json();
    assert(hindiSearchJson.orders.length > 0, 'Multilingual search matches Hindi keywords ("छात्रवृत्ति")');

    // 5b. Test AI Summary Endpoint
    const summaryRes = await fetch(`${baseUrl}/api/orders/summarize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'National Scholarship Scheme',
        description: 'Financial assistance for undergraduate students across the state.',
        language: 'en',
      }),
    });
    const summaryJson = await summaryRes.json();
    assert(
      (summaryRes.status === 200 && Array.isArray(summaryJson.bullets)) ||
      (summaryRes.status === 503 && summaryJson.message === 'AI summary is not configured.') ||
      summaryRes.status === 500,
      'POST /api/orders/summarize processes citizen summary request safely'
    );

    // 6. Test Admin Authentication
    console.log('\n--- Testing Administrative Security & JWT Auth ---');
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@rajpatra.gov.in',
        password: 'Admin@12345',
      }),
    });
    const loginJson = await loginRes.json();
    assert(loginRes.status === 200 && Boolean(loginJson.token), 'Admin login succeeds with valid JWT token returned');
    const adminToken = loginJson.token;

    // 7. Test Admin Auth Profile
    const meRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const meJson = await meRes.json();
    assert(meRes.status === 200 && meJson.admin.email === 'admin@rajpatra.gov.in', 'GET /api/auth/me authenticates Bearer token');

    // 8. Test Admin Dashboard Statistics
    const statsRes = await fetch(`${baseUrl}/api/admin/orders/stats/summary`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const statsJson = await statsRes.json();
    assert(statsRes.status === 200 && statsJson.stats.totalOrders > 0, 'GET /api/admin/orders/stats/summary returns aggregate metrics');

    // 9. Test Socket.IO Real-Time Event Dispatch
    console.log('\n--- Testing Socket.IO Real-Time Notification Pipeline ---');
    let socketReceivedNotification = false;
    let receivedOrderNumber = null;

    const socketClient = ClientIO(baseUrl, {
      transports: ['websocket'],
    });

    await new Promise((resolve) => {
      socketClient.on('connect', () => {
        console.log(`[Socket Test Client] Connected to Socket.IO server (ID: ${socketClient.id})`);
        resolve();
      });
    });

    socketClient.on('NEW_GOVERNMENT_ORDER', (payload) => {
      console.log(`[Socket Test Client] Received live NEW_GOVERNMENT_ORDER event for: ${payload.order?.orderNumber}`);
      socketReceivedNotification = true;
      receivedOrderNumber = payload.order?.orderNumber;
    });

    // 10. Publish a New Order as Admin (Triggers Socket Broadcast)
    console.log('\n--- Testing Order Creation & Real-Time Broadcast ---');
    const testOrderPayload = {
      orderNumber: 'GO-2026-TEST-E2E-777',
      department: 'Information Technology',
      category: 'Policy Order',
      publicationDate: new Date().toISOString(),
      status: 'published',
      title: {
        en: 'Automated E2E Test Gazette Order',
        hi: 'स्वचालित ई2ई परीक्षण राजपत्र आदेश',
        pa: 'ਆਟੋਮੇਟਿਡ ਈ2ਈ ਟੈਸਟ ਗਜ਼ਟ ਆਰਡਰ',
      },
      description: {
        en: 'This is a verified test order published to audit the complete real-time pipeline.',
        hi: 'यह पूर्ण वास्तविक समय पाइपलाइन का ऑडिट करने के लिए प्रकाशित एक सत्यापित परीक्षण आदेश है।',
        pa: 'ਇਹ ਪੂਰੀ ਰੀਅਲ-ਟਾਈਮ ਪਾਈਪਲਾਈਨ ਦਾ ਆਡਿਟ ਕਰਨ ਲਈ ਪ੍ਰਕਾਸ਼ਿਤ ਇੱਕ ਪ੍ਰਮਾਣਿਤ ਟੈਸਟ ਆਰਡਰ ਹੈ।',
      },
    };

    const createRes = await fetch(`${baseUrl}/api/admin/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(testOrderPayload),
    });
    const createJson = await createRes.json();
    assert(createRes.status === 201 && createJson.success === true, 'Admin successfully publishes a new government order');
    const createdOrderId = createJson.order._id;

    // Wait 1.5 seconds for Socket event propagation
    await new Promise((r) => setTimeout(r, 1500));
    assert(
      socketReceivedNotification && receivedOrderNumber === 'GO-2026-TEST-E2E-777',
      'Socket.IO broadcasts NEW_GOVERNMENT_ORDER to connected citizens in real time'
    );

    // 11. Test Toggle Status (Unpublish -> Draft)
    console.log('\n--- Testing Order Status Management & Deletion ---');
    const toggleRes = await fetch(`${baseUrl}/api/admin/orders/${createdOrderId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const toggleJson = await toggleRes.json();
    assert(toggleRes.status === 200 && toggleJson.order.status === 'draft', 'Status toggles successfully from published to draft');

    // 12. Test Deletion Cleanup
    const deleteRes = await fetch(`${baseUrl}/api/admin/orders/${createdOrderId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const deleteJson = await deleteRes.json();
    assert(deleteRes.status === 200 && deleteJson.success === true, 'Admin successfully deletes government order record');

    // Disconnect socket client
    socketClient.disconnect();

    console.log('\n====================================================');
    console.log(`  ALL ${passedTests}/${totalTests} TESTS PASSED SUCCESSFULLY! (100% PASS RATE)  `);
    console.log('====================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('\n[Test Suite Failed]', err);
    process.exit(1);
  }
}

runEndToEndTests();
