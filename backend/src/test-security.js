import "./config/test-env.js";
import app from "./app.js";
import { connect } from "./config/database.js";
import User from "./models/user.model.js";
import Project from "./models/project.model.js";
import mongoose from "mongoose";

const runTests = async () => {
  let server;
  try {
    console.log("Connecting to database...");
    await connect();

    // Clean up any old test data
    await User.deleteMany({ email: /test-security/ });
    await Project.deleteMany({ title: /Security Test/ });

    // Seed test users
    const studentA = await User.create({
      auth0Sub: "auth0|test_student_a",
      name: "Student A (Security Test)",
      email: "student_a_test-security@test.com",
      role: "STUDENT",
      isActive: true,
    });

    const studentB = await User.create({
      auth0Sub: "auth0|test_student_b",
      name: "Student B (Security Test)",
      email: "student_b_test-security@test.com",
      role: "STUDENT",
      isActive: true,
    });

    const admin = await User.create({
      auth0Sub: "auth0|test_admin",
      name: "Admin (Security Test)",
      email: "admin_test-security@test.com",
      role: "ADMIN",
      isActive: true,
    });

    // Start server on an ephemeral port
    server = app.listen(0, async () => {
      const port = server.address().port;
      const baseUrl = `http://localhost:${port}/api`;
      console.log(`Test server running on port ${port}...`);

      let totalTests = 0;
      let passedTests = 0;

      const assert = (condition, message) => {
        totalTests++;
        if (condition) {
          passedTests++;
          console.log(`  ✅ [PASS] ${message}`);
        } else {
          console.error(`  ❌ [FAIL] ${message}`);
        }
      };

      console.log("\n=== RUNNING SECURITY TESTS ===\n");

      // ────────────────────────────────────────────────────────────────────────
      // Test 1: Authentication Failures (Missing Token)
      // ────────────────────────────────────────────────────────────────────────
      try {
        const res = await fetch(`${baseUrl}/auth/me`);
        assert(res.status === 401, `GET /auth/me without headers returns 401 (got ${res.status})`);
      } catch (err) {
        assert(false, `Test 1 failed: ${err.message}`);
      }

      // ────────────────────────────────────────────────────────────────────────
      // Test 2: Valid Authentication
      // ────────────────────────────────────────────────────────────────────────
      try {
        const res = await fetch(`${baseUrl}/auth/me`, {
          headers: { "x-test-user-sub": "auth0|test_student_a" }
        });
        const data = await res.json();
        assert(res.status === 200 && data.data.auth0Sub === "auth0|test_student_a", "GET /auth/me with mock header returns student profile");
      } catch (err) {
        assert(false, `Test 2 failed: ${err.message}`);
      }

      // ────────────────────────────────────────────────────────────────────────
      // Test 3: IDOR Prevention (Student B updating Student A's project)
      // ────────────────────────────────────────────────────────────────────────
      try {
        // Create project owned by Student A
        const project = await Project.create({
          owner: studentA._id,
          title: "Security Test Project A",
          description: "This is a secure project details test.",
          coverImage: "https://example.com/cover.jpg",
          category: "WEB DEVELOPMENT",
          techStack: ["React"],
          status: "APPROVED",
        });

        // Try updating as Student B
        const res = await fetch(`${baseUrl}/projects/${project._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-test-user-sub": "auth0|test_student_b",
          },
          body: JSON.stringify({
            title: "Hacked by Student B",
          }),
        });
        assert(res.status === 403, `IDOR: Student B modifying Student A's project returns 403 (got ${res.status})`);

        // Clean up project
        await Project.findByIdAndDelete(project._id);
      } catch (err) {
        assert(false, `Test 3 failed: ${err.message}`);
      }

      // ────────────────────────────────────────────────────────────────────────
      // Test 4: Mass Assignment Prevention
      // ────────────────────────────────────────────────────────────────────────
      try {
        const project = await Project.create({
          owner: studentA._id,
          title: "Security Test Project B",
          description: "Mass assignment test project description.",
          coverImage: "https://example.com/cover.jpg",
          category: "WEB DEVELOPMENT",
          techStack: ["Node"],
          status: "APPROVED",
        });

        // Try changing status and owner via PUT body
        const res = await fetch(`${baseUrl}/projects/${project._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-test-user-sub": "auth0|test_student_a",
          },
          body: JSON.stringify({
            title: "Security Test Project B Updated",
            status: "APPROVED",
            owner: studentB._id, // malicious assignment attempt
          }),
        });

        const updatedProject = await Project.findById(project._id);
        assert(
          res.status === 200 &&
          updatedProject.title === "Security Test Project B Updated" &&
          updatedProject.owner.toString() === studentA._id.toString(),
          "Mass Assignment: owner field cannot be modified by client PUT requests"
        );

        await Project.findByIdAndDelete(project._id);
      } catch (err) {
        assert(false, `Test 4 failed: ${err.message}`);
      }

      // ────────────────────────────────────────────────────────────────────────
      // Test 5: XSS Mitigation (Invalid Scheme Link Rejection)
      // ────────────────────────────────────────────────────────────────────────
      try {
        const project = await Project.create({
          owner: studentA._id,
          title: "Security Test Project C",
          description: "XSS Link test.",
          coverImage: "https://example.com/cover.jpg",
          category: "WEB DEVELOPMENT",
          status: "APPROVED",
        });

        // Try updating demoLink with javascript: protocol
        const res = await fetch(`${baseUrl}/projects/${project._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-test-user-sub": "auth0|test_student_a",
          },
          body: JSON.stringify({
            demoLink: "javascript:alert('XSS')",
          }),
        });

        assert(res.status === 400, `XSS: URL parameter using 'javascript:' protocol is rejected with 400 (got ${res.status})`);
        await Project.findByIdAndDelete(project._id);
      } catch (err) {
        assert(false, `Test 5 failed: ${err.message}`);
      }

      // ────────────────────────────────────────────────────────────────────────
      // Test 6: NoSQL Injection Block (Operator Rejection)
      // ────────────────────────────────────────────────────────────────────────
      try {
        const res = await fetch(`${baseUrl}/projects?category[$ne]=WEB DEVELOPMENT`);
        assert(res.status === 400, `NoSQL Injection: Operator query filter category[$ne] is rejected with 400 (got ${res.status})`);
      } catch (err) {
        assert(false, `Test 6 failed: ${err.message}`);
      }

      console.log(`\n=== TESTS COMPLETE: Passed ${passedTests}/${totalTests} ===\n`);

      // Clean up DB records
      await User.deleteMany({ email: /test-security/ });
      await Project.deleteMany({ title: /Security Test/ });

      // Close connections & exit
      server.close(async () => {
        await mongoose.connection.close();
        process.exit(passedTests === totalTests ? 0 : 1);
      });
    });
  } catch (err) {
    console.error("Test execution failed:", err);
    if (server) server.close();
    await mongoose.connection.close();
    process.exit(1);
  }
};

runTests();
