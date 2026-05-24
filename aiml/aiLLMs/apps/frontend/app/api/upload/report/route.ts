import { PrismaClient } from "@/app/generated/prisma";
//generated prisma bcz acceleration needs special config
import { withAccelerate } from "@prisma/extension-accelerate";
const db = new PrismaClient().$extends(withAccelerate());
import { processPatientContext } from "@/app/lib/processPatientContext";
//After a report is created, you run this.
//Likely used to generate AI Analysis or update patient’s health summary.
export async function POST(req: Request) {
  const { imageUrl, userId, doctorId, reportText, severity } = await req.json();//coming from front end
//userId is patient id which we would allow doctor to select when uploading report and doctorId for user
//This creates a row in the Report table.
  const report = await db.report.create({
    data: { imageUrl, userId, doctorId, reportText, severity },
  });
  processPatientContext(userId).catch(console.error);

  return Response.json({ success: true, report });
}
