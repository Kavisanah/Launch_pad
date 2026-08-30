import User from "../models/user.model.js";
import Project from "../models/project.model.js";
import Notification from "../models/notification.model.js";
import logger from "../utils/logger.js";

const seedDatabase = async () => {
  try {
    // ── 1. Seed Users ─────────────────────────────────────────────────────────

    const adminEmail = "admin@test.com";
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = await User.create({
        auth0Sub: "auth0|seed_admin_id",
        name: "Administrator",
        email: adminEmail,
        role: "ADMIN",
        isActive: true,
      });
      logger.info(`[Seed] Admin account created: ${adminEmail}`);
    }

    const recruiterEmail = "recruiter@test.com";
    let recruiter = await User.findOne({ email: recruiterEmail });
    if (!recruiter) {
      recruiter = await User.create({
        auth0Sub: "auth0|seed_recruiter_id",
        name: "Sarah Mitchell",
        email: recruiterEmail,
        role: "RECRUITER",
        isActive: true,
        bio: "Senior Technical Recruiter at TechCorp with 8 years of experience in sourcing engineering talent.",
      });
      logger.info(`[Seed] Recruiter account created: ${recruiterEmail}`);
    }

    const students = [
      {
        auth0Sub: "auth0|seed_student_1_id",
        name: "Alex Chen",
        email: "alex.chen@student.edu",
        role: "STUDENT",
        isActive: true,
        bio: "Final year Computer Science student specialising in distributed systems and cloud-native architecture.",
        university: "University of Technology",
        department: "Computer Science",
        graduationYear: 2025,
      },
      {
        auth0Sub: "auth0|seed_student_2_id",
        name: "Priya Nair",
        email: "priya.nair@student.edu",
        role: "STUDENT",
        isActive: true,
        bio: "Machine Learning researcher with a focus on computer vision and medical imaging.",
        university: "Institute of Engineering",
        department: "Data Science",
        graduationYear: 2025,
      },
      {
        auth0Sub: "auth0|seed_student_3_id",
        name: "Marcus Oliveira",
        email: "marcus.oliveira@student.edu",
        role: "STUDENT",
        isActive: true,
        bio: "Full-stack developer and open-source contributor. Passionate about developer tooling.",
        university: "National University",
        department: "Software Engineering",
        graduationYear: 2026,
      },
      {
        auth0Sub: "auth0|seed_student_4_id",
        name: "Amara Osei",
        email: "amara.osei@student.edu",
        role: "STUDENT",
        isActive: true,
        bio: "Cybersecurity undergraduate with hands-on experience in penetration testing and secure application design.",
        university: "Technology Institute",
        department: "Cyber Security",
        graduationYear: 2026,
      },
    ];

    const createdStudents = [];
    for (const s of students) {
      let existing = await User.findOne({ email: s.email });
      if (!existing) {
        existing = await User.create(s);
        logger.info(`[Seed] Student created: ${s.email}`);
      }
      createdStudents.push(existing);
    }

    const [student1, student2, student3, student4] = createdStudents;

    // ── 2. Seed Projects ──────────────────────────────────────────────────────

    const existingProjectCount = await Project.countDocuments();
    if (existingProjectCount < 12) {
      const sampleProjects = [
        {
          owner: student1._id,
          title: "E-Commerce Microservices Platform",
          description: "A scalable cloud-native e-commerce application built using a microservices architecture. Leverages Node.js services, Docker containers, RabbitMQ for event-driven messaging, and MongoDB for decentralised data storage. Features include real-time cart synchronisation, structured order processing pipelines, and payment gateway integration.",
          coverImage: "https://images.unsplash.com/photo-1557821552-17105176677c?q=80&w=800",
          images: ["https://images.unsplash.com/photo-1557821552-17105176677c?q=80&w=800", "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800"],
          techStack: ["Node.js", "Docker", "MongoDB", "RabbitMQ", "React"],
          demoLink: "https://shop-demo.example.com",
          githubLink: "https://github.com/example/shop-microservices",
          category: "WEB DEVELOPMENT",
          status: "APPROVED",
          likeCount: 47,
          viewCount: 312,
        },
        {
          owner: student3._id,
          title: "Developer Portfolio CMS",
          description: "A headless content management system built for software developers to host and manage their personal portfolios. Built with Next.js and a GraphQL API layer, it supports markdown blog posts, project showcases, and custom theming via design tokens. Fully deployable on Vercel with one-click setup.",
          coverImage: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?q=80&w=800",
          images: ["https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?q=80&w=800"],
          techStack: ["Next.js", "GraphQL", "PostgreSQL", "Prisma", "TypeScript"],
          demoLink: "https://dev-cms.example.com",
          githubLink: "https://github.com/example/dev-portfolio-cms",
          category: "WEB DEVELOPMENT",
          status: "APPROVED",
          likeCount: 33,
          viewCount: 189,
        },
        {
          owner: student2._id,
          title: "Pneumonia Diagnostic AI Engine",
          description: "An advanced medical diagnosis engine powered by a Convolutional Neural Network (CNN) trained on 10,000+ chest X-ray images to identify bacterial and viral pneumonia with 94.3% validation accuracy. The web interface displays Grad-CAM heatmap activations to provide clinician-interpretable results alongside the probability score.",
          coverImage: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=800",
          images: ["https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=800"],
          techStack: ["Python", "PyTorch", "Flask", "React", "Docker"],
          demoLink: "https://pneumo-ai.example.com",
          githubLink: "https://github.com/example/pneumo-xray-cnn",
          category: "MACHINE LEARNING",
          status: "APPROVED",
          likeCount: 72,
          viewCount: 398,
        },
        {
          owner: student2._id,
          title: "Natural Language Resume Screener",
          description: "An automated recruitment pre-screening tool that uses transformer-based NLP models (fine-tuned BERT) to rank candidate CVs against a job description. The system outputs a structured compatibility score with per-section reasoning, reducing manual screening time by approximately 60% in tested environments.",
          coverImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800",
          images: ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800"],
          techStack: ["Python", "HuggingFace", "FastAPI", "React", "PostgreSQL"],
          demoLink: "https://nlp-screener.example.com",
          githubLink: "https://github.com/example/nlp-resume-screener",
          category: "ARTIFICIAL INTELLIGENCE",
          status: "APPROVED",
          likeCount: 58,
          viewCount: 271,
        },
        {
          owner: student2._id,
          title: "Real-Time Stock Market Analytics Dashboard",
          description: "An interactive data analytics dashboard that aggregates live stock price feeds via WebSocket APIs and renders real-time candlestick charts, moving averages, and RSI indicators. Includes a backtesting module where users can evaluate simple trading strategies against historical data using vectorised Pandas operations.",
          coverImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=800",
          images: ["https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=800"],
          techStack: ["Python", "Pandas", "Plotly Dash", "WebSocket", "PostgreSQL"],
          demoLink: "https://stock-dash.example.com",
          githubLink: "https://github.com/example/stock-analytics-dashboard",
          category: "DATA SCIENCE",
          status: "APPROVED",
          likeCount: 41,
          viewCount: 224,
        },
        {
          owner: student1._id,
          title: "Serverless CI/CD Pipeline Orchestrator",
          description: "A lightweight, self-hosted continuous integration and deployment orchestration tool built on AWS Lambda and Step Functions. It listens to GitHub webhook events, provisions ephemeral build environments, runs test suites, and deploys artefacts to S3 or ECR. Supports multi-stage pipelines defined in YAML.",
          coverImage: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?q=80&w=800",
          images: ["https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?q=80&w=800"],
          techStack: ["AWS Lambda", "Step Functions", "Terraform", "Node.js", "Docker"],
          demoLink: "https://cicd-demo.example.com",
          githubLink: "https://github.com/example/serverless-cicd",
          category: "CLOUD COMPUTING",
          status: "APPROVED",
          likeCount: 39,
          viewCount: 198,
        },
        {
          owner: student4._id,
          title: "Automated Vulnerability Scanner",
          description: "A web-based security assessment tool that performs automated reconnaissance and vulnerability analysis against target domains. Integrates Nmap, SQLMap, and a custom XSS probe engine, then generates a structured PDF report with CVSS-scored findings and recommended remediation steps. Built for educational and authorised testing use.",
          coverImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800",
          images: ["https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800"],
          techStack: ["Python", "Nmap", "SQLMap", "FastAPI", "React", "Docker"],
          demoLink: "https://vuln-scanner.example.com",
          githubLink: "https://github.com/example/vuln-scanner",
          category: "CYBER SECURITY",
          status: "APPROVED",
          likeCount: 55,
          viewCount: 301,
        },
        {
          owner: student4._id,
          title: "Zero-Trust Access Control Framework",
          description: "A proof-of-concept implementation of a zero-trust network access (ZTNA) framework for internal enterprise APIs. Uses JWT-based mutual authentication, per-request policy evaluation via Open Policy Agent (OPA), and structured audit logging. Demonstrates how organisations can replace legacy VPN perimeters with identity-centric access controls.",
          coverImage: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?q=80&w=800",
          images: ["https://images.unsplash.com/photo-1614064641938-3bbee52942c7?q=80&w=800"],
          techStack: ["Go", "OPA", "JWT", "Docker", "gRPC"],
          demoLink: "https://ztna.example.com",
          githubLink: "https://github.com/example/zero-trust-framework",
          category: "CYBER SECURITY",
          status: "APPROVED",
          likeCount: 48,
          viewCount: 253,
        },
        {
          owner: student3._id,
          title: "Campus Event & Society Hub",
          description: "A cross-platform mobile application that serves as a centralised hub for university events, student society announcements, and club membership management. Built with React Native and Expo, it features push notification delivery, a QR-code-based event check-in system, and an admin portal for society coordinators.",
          coverImage: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800",
          images: ["https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800"],
          techStack: ["React Native", "Expo", "Firebase", "Node.js", "MongoDB"],
          demoLink: "https://campus-hub.example.com",
          githubLink: "https://github.com/example/campus-event-hub",
          category: "MOBILE DEVELOPMENT",
          status: "APPROVED",
          likeCount: 36,
          viewCount: 176,
        },
        {
          owner: student3._id,
          title: "Smart Greenhouse Monitoring System",
          description: "An IoT-based precision agriculture solution that collects real-time sensor data from Raspberry Pi nodes distributed across a greenhouse environment. Data is published via MQTT to a cloud broker, processed by a Node.js stream handler, and visualised on a Grafana dashboard with automated irrigation alerts.",
          coverImage: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=800",
          images: ["https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=800"],
          techStack: ["Raspberry Pi", "Python", "MQTT", "Node.js", "Grafana", "InfluxDB"],
          demoLink: "https://greenhouse-iot.example.com",
          githubLink: "https://github.com/example/smart-greenhouse",
          category: "INTERNET OF THINGS",
          status: "APPROVED",
          likeCount: 29,
          viewCount: 143,
        },
        {
          owner: student1._id,
          title: "Procedural Dungeon Crawler",
          description: "A 2D dungeon crawler game with fully procedurally generated level layouts, enemy spawning, and loot tables. Built in Unity using a combination of BSP tree partitioning and cellular automata algorithms for natural-looking cave systems. Includes a behaviour-tree-driven AI for enemy pathfinding and tactical decision-making.",
          coverImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800",
          images: ["https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800"],
          techStack: ["Unity", "C#", "Blender", "Shader Graph"],
          demoLink: "https://dungeon-demo.example.com",
          githubLink: "https://github.com/example/procedural-dungeon",
          category: "GAME DEVELOPMENT",
          status: "APPROVED",
          likeCount: 61,
          viewCount: 340,
        },
        {
          owner: student4._id,
          title: "Decentralised Academic Credential Ledger",
          description: "A blockchain-based academic credential issuance and verification system built on Ethereum. Universities can issue tamper-proof degree certificates as NFTs directly to graduate wallets. Employers can independently verify authenticity on-chain without contacting the institution. Includes a React frontend and Hardhat testing suite.",
          coverImage: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=800",
          images: ["https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=800"],
          techStack: ["Solidity", "Hardhat", "Ethers.js", "React", "IPFS", "MetaMask"],
          demoLink: "https://credential-chain.example.com",
          githubLink: "https://github.com/example/academic-credential-ledger",
          category: "BLOCKCHAIN",
          status: "APPROVED",
          likeCount: 53,
          viewCount: 287,
        },
      ];

      await Project.insertMany(sampleProjects);
      logger.info(`[Seed] Successfully seeded ${sampleProjects.length} projects.`);
    } else {
      logger.info("[Seed] Projects already seeded — skipping.");
    }

    // ── 3. Seed Sample Notifications for student1 (Alex Chen) ────────────────
    const notifCount = await Notification.countDocuments({ recipient: student1._id });
    if (notifCount === 0) {
      const student1Projects = await Project.find({ owner: student1._id }).limit(3);
      const [proj1, proj2, proj3] = student1Projects;

      const sampleNotifications = [
        {
          recipient: student1._id,
          type: "PROJECT_CREATED",
          message: `Submission Received: Your project "${proj1?.title || 'E-Commerce Microservices Platform'}" has been submitted and is pending review by an administrator.`,
          referenceId: proj1?._id,
          isRead: false,
        },
        {
          recipient: student1._id,
          type: "PROJECT_APPROVED",
          message: `Project Approved: Your project "${proj1?.title || 'E-Commerce Microservices Platform'}" has been reviewed and approved. It is now publicly visible.`,
          referenceId: proj1?._id,
          isRead: false,
        },
        {
          recipient: student1._id,
          sender: student2._id,
          type: "PROJECT_LIKED",
          message: `Project Engagement: ${student2.name} has endorsed your project "${proj1?.title || 'E-Commerce Microservices Platform'}". Your work is gaining recognition on the platform.`,
          referenceId: proj1?._id,
          isRead: false,
        },
        {
          recipient: student1._id,
          sender: student2._id,
          type: "USER_FOLLOWED",
          message: `New Follower: ${student2.name} is now following your profile.`,
          referenceId: student2._id,
          isRead: true,
        },
        {
          recipient: student1._id,
          type: "PROJECT_APPROVED",
          message: `Project Approved: Your project "${proj2?.title || 'Serverless CI/CD Pipeline Orchestrator'}" has been reviewed and approved. It is now publicly visible.`,
          referenceId: proj2?._id,
          isRead: true,
        },
        {
          recipient: student1._id,
          sender: student3._id,
          type: "PROJECT_LIKED",
          message: `Project Engagement: ${student3.name} has endorsed your project "${proj2?.title || 'Serverless CI/CD Pipeline Orchestrator'}". Your work is gaining recognition on the platform.`,
          referenceId: proj2?._id,
          isRead: true,
        },
        {
          recipient: student1._id,
          type: "PROJECT_REJECTED",
          message: `Project Rejected: Your project "${proj3?.title || 'Procedural Dungeon Crawler'}" was not approved. Reason: Insufficient documentation provided. Please review the feedback and resubmit if applicable.`,
          referenceId: proj3?._id,
          isRead: false,
        },
      ];

      await Notification.insertMany(sampleNotifications);
      logger.info(`[Seed] Seeded ${sampleNotifications.length} notifications for ${student1.name}.`);
    } else {
      logger.info("[Seed] Notifications already seeded — skipping.");
    }

  } catch (error) {
    logger.error(`[Seed Error] Failed: ${error.message}`, { stack: error.stack });
  }
};

export default seedDatabase;
