const crypto = require('crypto');

async function runTest() {
    const baseUrl = 'http://localhost:3000/api';
    const TEST_SECRET = 'test_key_secret';

    let authCookie = null; // Store cookie here

    const log = (step, result) => console.log(`[${step}] ${result}`);
    const error = (step, err) => {
        console.error(`[${step}] FAILED`);
        if (err.response) {
            console.error(JSON.stringify(err.response.data, null, 2));
        } else {
            console.error(err.message);
        }
        process.exit(1);
    };

    // Helper for requests
    async function request(method, url, data = null, useAuth = false) {
        const headers = { 'Content-Type': 'application/json' };
        if (useAuth && authCookie) {
            headers['Cookie'] = authCookie;
        }

        const options = {
            method,
            headers,
        };
        if (data) options.body = JSON.stringify(data);

        const res = await fetch(`${baseUrl}${url}`, options);

        // Capture cookie
        const setCookie = res.headers.get('set-cookie');
        if (setCookie) {
            // Simple logic: just take the whole string or the access_token part
            // Node fetch might return multiple cookies comma separated or array? 
            // set-cookie header in fetch is usually a string.
            // We just need to start with access_token=...
            authCookie = setCookie.split(';')[0];
        }

        if (!res.ok) {
            const text = await res.text();
            let json;
            try { json = JSON.parse(text); } catch (e) { }
            throw { message: `Status ${res.status}: ${text}`, response: { data: json || text } };
        }
        return res.json();
    }

    try {
        // 1. Register Author
        const authorEmail = `author_${Date.now()}@test.com`;
        const author = await request('POST', '/auth/register', {
            email: authorEmail,
            password: 'Password123!',
            name: 'Test Author'
        });
        log('Register Author', 'OK');

        // 2. Login Author (Cookie is set automatically by helper)
        await request('POST', '/auth/login', {
            email: authorEmail,
            password: 'Password123!'
        });
        log('Login Author', `OK (Cookie: ${authCookie})`);

        // 3. Access Protected Route
        const me = await request('GET', '/auth/me', null, true);
        log('Protected Route', `OK (User: ${me.data.user.id})`);

        // 4. Create Exclusive Blog
        const blogRes = await request('POST', '/blogs', {
            title: 'My Exclusive Blog',
            content: 'This is premium content that is long enough to pass the validation check. It needs to be at least 100 characters long so I am typing some extra words here to make sure we hit the limit required by the DTO.',
            tags: ['crypto', 'investing'],
            isExclusive: true,
            price: 100
        }, true);
        const blog = blogRes.data; // Response wrapper? Check structure.
        // Blogs controller usually returns the blog directly or wrapped?
        // Let's assume standard response wrapper or direct. 
        // Based on AuthController, it uses { data: ... }.
        // If BlogsController differs, we might fail here.
        // Let's inspect log if fails. But usually standard is used.
        // Wait, standard CRUD usually returns entity.
        // I'll check log.
        const blogId = blog.id || blogRes.data.id;
        log('Create Blog', `OK (ID: ${blogId})`);

        // 4.5 Publish Blog
        await request('POST', `/blogs/${blogId}/publish`, {}, true);
        log('Publish Blog', 'OK');

        // 5. Like Blog
        await request('POST', `/blogs/${blogId}/like`, {}, true);
        log('Like Blog', 'OK');

        // 6. Bookmark Blog
        await request('POST', `/blogs/${blogId}/bookmark`, {}, true);
        log('Bookmark Blog', 'OK');

        // --- PURCHASE FLOW ---
        // Save Author Cookie for later checks?
        const authorCookie = authCookie;
        authCookie = null; // Reset for buyer

        // 7. Register Buyer
        const buyerEmail = `buyer_${Date.now()}@test.com`;
        await request('POST', '/auth/register', {
            email: buyerEmail,
            password: 'Password123!',
            name: 'Test Buyer'
        });

        // 8. Login Buyer
        await request('POST', '/auth/login', {
            email: buyerEmail,
            password: 'Password123!'
        });
        log('Register/Login Buyer', 'OK');

        // 9. Create Purchase Order
        const orderRes = await request('POST', '/payments/order', {
            blogId: blogId
        }, true);
        // PaymentsController.createOrder returns OrderResponseDto directly? Or wrapped?
        // Service returns OrderResponseDto. Controller ???
        // Let's see.
        const order = orderRes.id ? orderRes : orderRes.data;
        log('Create Order', `OK (Order ID: ${order.id})`);

        // 10. Verify Payment (Mock Signature)
        const razorpay_order_id = order.id;
        const razorpay_payment_id = `pay_${Date.now()}`;

        const hmac = crypto.createHmac('sha256', TEST_SECRET);
        hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
        const razorpay_signature = hmac.digest('hex');

        const verification = await request('POST', '/payments/verify', {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        }, true);

        log('Verify Payment', `OK (Success: ${verification.success})`);

        console.log('\n--- ALL TESTS PASSED ---');

    } catch (err) {
        error('Script Execution', err);
    }
}

runTest();
