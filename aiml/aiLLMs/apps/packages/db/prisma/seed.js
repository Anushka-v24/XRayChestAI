import pkg from "../../../frontend/app/generated/prisma/index.js";
import { v4 as uuidv4 } from "uuid";
const {PrismaClient} = pkg;
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");
  
  // =========================
  // DoctorSpecialization
  // =========================
  console.log("Creating DoctorSpecializations...");
  const dsp1 = uuidv4();
  const dsp2 = uuidv4();
  const dsp3 = uuidv4();

  await prisma.doctorSpecialization.createMany({
    data: [
      { id: dsp1, type: "Radiology", description: "General Radiology" },
      { id: dsp2, type: "CT Scan", description: "Computed Tomography" },
      { id: dsp3, type: "MRI", description: "Magnetic Resonance Imaging" },
    ],
  });
  console.log("✅ DoctorSpecializations created");

  // =========================
  // Doctors
  // =========================
  console.log("Creating Doctors...");
  const doc1 = uuidv4();
  const doc2 = uuidv4();
  const doc3 = uuidv4();

  const doc1Auth = uuidv4();
  const doc2Auth = uuidv4();
  const doc3Auth = uuidv4();

  await prisma.doctor.createMany({
    data: [
      {
        id: doc1,
        authUserId: doc1Auth,
        name: "Dr. Alice Smith",
        email: "alice@hospital.com",
        password: "hashedpw1",
        proofOfWork: "10 years experience",
        trackRecord: "2000+ reports",
        verified: true,
        specializationId: dsp1,
      },
      {
        id: doc2,
        authUserId: doc2Auth,
        name: "Dr. Bob Lee",
        email: "bob@hospital.com",
        password: "hashedpw2",
        proofOfWork: "8 years experience",
        trackRecord: "1500+ reports",
        verified: true,
        specializationId: dsp2,
      },
      {
        id: doc3,
        authUserId: doc3Auth,
        name: "Dr. Carol Tan",
        email: "carol@hospital.com",
        password: "hashedpw3",
        proofOfWork: "5 years experience",
        trackRecord: "800+ reports",
        verified: false,
        specializationId: dsp3,
      },
    ],
  });
  console.log("✅ Doctors created");

  // =========================
  // Users
  // =========================
  console.log("Creating Users...");
  const userIds = Array.from({ length: 4 }, () => uuidv4());
  const userAuthIds = Array.from({ length: 4 }, () => uuidv4());

  const usersData = [
    { id: userIds[0], authUserId: userAuthIds[0], name: "John Doe", email: "john@example.com", disease: "Pneumonia" },
    { id: userIds[1], authUserId: userAuthIds[1], name: "Jane Roe", email: "jane@example.com", disease: "Tuberculosis" },
    { id: userIds[2], authUserId: userAuthIds[2], name: "Sam Green", email: "sam@example.com", disease: "Atelectasis" },
    { id: userIds[3], authUserId: userAuthIds[3], name: "Lucy Blue", email: "lucy@example.com", disease: "COVID-19" },
  ];

  await prisma.user.createMany({ data: usersData });
  console.log("✅ Users created");

  // =========================
  // Reports
  // =========================
  console.log("Creating Reports...");
  const reportIds= [];
  for (let i = 0; i < 20; i++) reportIds.push(uuidv4());

  const reportsData = [
    // User 1
    { id: reportIds[0], imageUrl: "https://example.com/image1.jpg", reportText: "Mild inflammation in lower lobe", date: new Date("2025-10-01"), confirmed: true, severity: "MILD", userId: userIds[0], doctorId: doc1 },
    { id: reportIds[1], imageUrl: "https://example.com/image2.jpg", reportText: "Bilateral infiltrates", date: new Date("2025-10-02"), confirmed: true, severity: "MODERATE", userId: userIds[0], doctorId: doc2 },
    { id: reportIds[2], imageUrl: "https://example.com/image3.jpg", reportText: "Patchy consolidation", date: new Date("2025-10-03"), confirmed: false, severity: "SEVERE", userId: userIds[0], doctorId: null },
    { id: reportIds[3], imageUrl: "https://example.com/image4.jpg", reportText: "Right lower lobe opacity", date: new Date("2025-10-04"), confirmed: true, severity: "CRITICAL", userId: userIds[0], doctorId: doc1 },
    { id: reportIds[4], imageUrl: "https://example.com/image5.jpg", reportText: "Minimal pleural effusion", date: new Date("2025-10-05"), confirmed: false, severity: "MILD", userId: userIds[0], doctorId: null },
    //Users 2
    { id: reportIds[5], imageUrl: "https://example.com/image1.jpg", reportText: "Apical cavitation observed", date: new Date("2025-10-01"), confirmed: true, severity: "MILD", userId: userIds[1], doctorId: doc1 },
    { id: reportIds[6], imageUrl: "https://example.com/image2.jpg", reportText: "Upper lobe consolidation", date: new Date("2025-10-02"), confirmed: true, severity: "MODERATE", userId: userIds[1], doctorId: doc2 },
    { id: reportIds[7], imageUrl: "https://example.com/image3.jpg", reportText: "Fibrotic changes'", date: new Date("2025-10-03"), confirmed: false, severity: "SEVERE", userId: userIds[1], doctorId: null },
    { id: reportIds[8], imageUrl: "https://example.com/image4.jpg", reportText: "Mild lung opacities", date: new Date("2025-10-04"), confirmed: true, severity: "CRITICAL", userId: userIds[1], doctorId: doc3 },
    { id: reportIds[9], imageUrl: "https://example.com/image5.jpg", reportText: "Bilateral patchy infiltrates", date: new Date("2025-10-05"), confirmed: false, severity: "MILD", userId: userIds[1], doctorId: null },
    //Users 3
    { id: reportIds[10], imageUrl: "https://example.com/image1.jpg", reportText: "Collapse of right upper lobe", date: new Date("2025-10-01"), confirmed: true, severity: "MILD", userId: userIds[2], doctorId: doc1 },
    { id: reportIds[11], imageUrl: "https://example.com/image2.jpg", reportText: "Left lower lobe partial collapse", date: new Date("2025-10-02"), confirmed: true, severity: "MODERATE", userId: userIds[2], doctorId: doc2 },
    { id: reportIds[12], imageUrl: "https://example.com/image3.jpg", reportText: "Segmental atelectasis", date: new Date("2025-10-03"), confirmed: false, severity: "SEVERE", userId: userIds[2], doctorId: null },
    { id: reportIds[13], imageUrl: "https://example.com/image4.jpg", reportText: "Subsegmental collapse", date: new Date("2025-10-04"), confirmed: true, severity: "CRITICAL", userId: userIds[2], doctorId: doc3 },
    { id: reportIds[14], imageUrl: "https://example.com/image5.jpg", reportText: "Right middle lobe opacity", date: new Date("2025-10-05"), confirmed: false, severity: "MILD", userId: userIds[2], doctorId: null },
    //Users 4
    { id: reportIds[15], imageUrl: "https://example.com/image1.jpg", reportText: "Ground glass opacities bilaterally", date: new Date("2025-10-01"), confirmed: true, severity: "MILD", userId: userIds[3], doctorId: doc1 },
    { id: reportIds[16], imageUrl: "https://example.com/image2.jpg", reportText: "Consolidation in left lower lobe", date: new Date("2025-10-02"), confirmed: true, severity: "MODERATE", userId: userIds[3], doctorId: doc2 },
    { id: reportIds[17], imageUrl: "https://example.com/image3.jpg", reportText: "Patchy bilateral infiltrates", date: new Date("2025-10-03"), confirmed: false, severity: "SEVERE", userId: userIds[3], doctorId: null },
    { id: reportIds[18], imageUrl: "https://example.com/image4.jpg", reportText: "Right upper lobe opacity", date: new Date("2025-10-04"), confirmed: true, severity: "CRITICAL", userId: userIds[3], doctorId: doc3 },
    { id: reportIds[19], imageUrl: "https://example.com/image5.jpg", reportText: "Minimal pleural effusion", date: new Date("2025-10-05"), confirmed: false, severity: "MILD", userId: userIds[3], doctorId: null },
  ];

  await prisma.report.createMany({ data: reportsData });
  console.log("✅ Reports created");

  // =========================
  // AIAnalysis
  // =========================
  console.log("Creating AIAnalysis...");
  const aiData = reportIds.map((rId, idx) => ({
    id: uuidv4(),
    reportId: rId,
    findings: `AI findings for report ${idx + 1}`,
    confidence: 0.8 + (idx % 5) * 0.03,
  }));

  await prisma.aIAnalysis.createMany({ data: aiData });
  console.log("✅ AIAnalysis created");

  // =========================
  // Diagnosis
  // =========================
  console.log("Creating Diagnosis...");
  const diagData = [
    { id: uuidv4(), reportId: reportIds[0], title: "Pneumonia", notes: "Mild inflammation in lower lobe" },
    { id: uuidv4(), reportId: reportIds[1], title: "Pneumonia", notes: "Bilateral infiltrates observed" },
    { id: uuidv4(), reportId: reportIds[2], title: "Pneumonia", notes: "Apical cavitation noted" },
    { id: uuidv4(), reportId: reportIds[3], title: "Pneumonia", notes: "Severe bilateral patchy lesions" },
    { id: uuidv4(), reportId: reportIds[4], title: "Pneumonia", notes: "Right upper lobe collapse" },
    { id: uuidv4(), reportId: reportIds[5], title: "Pneumonia", notes: "Segmental atelectasis detected" },
    { id: uuidv4(), reportId: reportIds[6], title: "Pneumonia", notes: "Severe left lower lobe consolidation" },
    { id: uuidv4(), reportId: reportIds[7], title: "Pneumonia", notes: "Patchy bilateral infiltrates" },
  ];

  await prisma.diagnosis.createMany({ data: diagData });
  console.log("✅ Diagnosis created");

  // =========================
  // Admins
  // =========================
  console.log("Creating Admins...");
  await prisma.admin.createMany({
    data: [
      { id: uuidv4(), email: "admin1@example.com", password: "hashedpw-admin1" },
      { id: uuidv4(), email: "admin2@example.com", password: "hashedpw-admin2" },
    ],
  });
  console.log("✅ Admins created");

  console.log("🎉 Seed complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });