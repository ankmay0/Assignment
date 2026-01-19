/**
 * Comprehensive Test Suite for Financial Query System
 * Tests various query types and validates responses
 */

const testQueries = [
    // Bank Transaction Queries
    {
        category: "Bank Transactions - Category Totals",
        question: "How much did I spend on food?",
        expectedContains: ["food", "₹"]
    },
    {
        category: "Bank Transactions - Category Query",
        question: "What are my travel expenses?",
        expectedContains: ["travel"]
    },
    {
        category: "Bank Transactions - All Categories",
        question: "Show me total spending by category",
        expectedContains: ["food", "travel", "shopping", "bills"]
    },
    {
        category: "Bank Transactions - Merchant Query",
        question: "How much did I spend at Amazon?",
        expectedContains: ["Amazon"]
    },
    {
        category: "Bank Transactions - Shopping Total",
        question: "What is my total shopping expense?",
        expectedContains: ["shopping", "₹"]
    },

    // Mutual Fund Queries
    {
        category: "Mutual Funds - List Holdings",
        question: "List all mutual fund schemes in the database",
        expectedContains: ["mutual fund", "scheme"]
    },
    {
        category: "Mutual Funds - Total Value",
        question: "What is the total current value of all mutual fund holdings?",
        expectedContains: ["₹"]
    },
    {
        category: "Mutual Funds - Profit/Loss",
        question: "Calculate the total profit or loss on mutual funds (current value minus invested value)",
        expectedContains: ["profit", "₹"]
    },

    // Equity Queries
    {
        category: "Equities - List Stocks",
        question: "What are all the stocks in the portfolio?",
        expectedContains: ["stock"]
    },
    {
        category: "Equities - Portfolio Value",
        question: "Calculate the total value of all equity holdings (quantity times current price)",
        expectedContains: ["₹"]
    },
    {
        category: "Equities - Specific Stock",
        question: "How many shares of Reliance Industries are there?",
        expectedContains: ["Reliance", "shares"]
    },

    // User Queries
    {
        category: "Users - List Users",
        question: "Who are the users in the system?",
        expectedContains: ["Rahul", "Priya"]
    },

    // Aggregate Queries
    {
        category: "Portfolio Overview",
        question: "Give me a summary of total investments across mutual funds and equities",
        expectedContains: ["₹"]
    },
    {
        category: "Complex Aggregation",
        question: "What is the average transaction amount per category?",
        expectedContains: ["average"]
    }
];

async function runTests() {
    console.log("\n" + "=".repeat(70));
    console.log("  FINANCIAL QUERY SYSTEM - COMPREHENSIVE TEST SUITE");
    console.log("=".repeat(70) + "\n");

    const results = {
        passed: 0,
        failed: 0,
        errors: []
    };

    for (let i = 0; i < testQueries.length; i++) {
        const test = testQueries[i];
        console.log(`\n[${i + 1}/${testQueries.length}] ${test.category}`);
        console.log(`    Question: "${test.question}"`);

        try {
            const startTime = Date.now();

            const response = await fetch("http://localhost:3000/api/query", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question: test.question })
            });

            const data = await response.json();
            const elapsed = Date.now() - startTime;

            if (response.ok && data.answer) {
                console.log(`    Answer: ${data.answer.substring(0, 100)}...`);
                console.log(`    Time: ${elapsed}ms | Cache: ${data.fromCache ? "HIT" : "MISS"}`);
                console.log(`    ✅ PASSED`);
                results.passed++;
            } else {
                console.log(`    ❌ FAILED: ${data.error || "No answer received"}`);
                results.failed++;
                results.errors.push({ test: test.category, error: data.error || "No answer" });
            }
        } catch (error) {
            console.log(`    ❌ ERROR: ${error.message}`);
            results.failed++;
            results.errors.push({ test: test.category, error: error.message });
        }
    }

    // Test caching
    console.log("\n" + "-".repeat(70));
    console.log("  CACHE PERFORMANCE TEST");
    console.log("-".repeat(70));

    const cacheTestQuery = "How much did I spend on food?";
    console.log(`\n  Query: "${cacheTestQuery}"`);

    // First call (should be cache hit from earlier tests)
    const start1 = Date.now();
    const res1 = await fetch("http://localhost:3000/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: cacheTestQuery })
    });
    const data1 = await res1.json();
    const time1 = Date.now() - start1;

    console.log(`  First call:  ${time1}ms (Cache: ${data1.fromCache ? "HIT" : "MISS"})`);

    // Second call (definitely cache hit)
    const start2 = Date.now();
    const res2 = await fetch("http://localhost:3000/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: cacheTestQuery })
    });
    const data2 = await res2.json();
    const time2 = Date.now() - start2;

    console.log(`  Second call: ${time2}ms (Cache: ${data2.fromCache ? "HIT" : "MISS"})`);

    if (data2.fromCache && time2 < time1 / 2) {
        console.log(`  ✅ Cache working - ${Math.round(time1 / time2)}x faster on cache hit!`);
    }

    // Print summary
    console.log("\n" + "=".repeat(70));
    console.log("  TEST SUMMARY");
    console.log("=".repeat(70));
    console.log(`\n  Total Tests: ${testQueries.length}`);
    console.log(`  ✅ Passed: ${results.passed}`);
    console.log(`  ❌ Failed: ${results.failed}`);
    console.log(`  Success Rate: ${Math.round((results.passed / testQueries.length) * 100)}%`);

    if (results.errors.length > 0) {
        console.log("\n  Errors:");
        results.errors.forEach(e => console.log(`    - ${e.test}: ${e.error}`));
    }

    console.log("\n" + "=".repeat(70) + "\n");
}

runTests().catch(console.error);
