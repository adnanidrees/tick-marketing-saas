import { PrismaClient, GlobalRole, WorkspaceRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const MODULES = [
  "ads",
  "crm",
  "whatsapp",
  "retention",
  "profit",
  "ugc",
  "affiliate",
  "seo",
  "reputation",
  "connectors",
];

async function main() {
  // ✅ Seed admin now controlled by env
  const email = process.env.SEED_ADMIN_EMAIL || "admin@tick.com";
const password = process.env.SEED_ADMIN_PASSWORD || "Admin@12345";

if (process.env.NODE_ENV === "production" && password === "Admin@12345") {
  throw new Error("Refusing to seed with default password in production. Set SEED_ADMIN_PASSWORD.");
}

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      // password rotation possible (when you re-run seed with new password)
      passwordHash,
      globalRole: GlobalRole.SUPER_ADMIN,
      name: "Super Admin",
    },
    create: {
      email,
      name: "Super Admin",
      passwordHash,
      globalRole: GlobalRole.SUPER_ADMIN,
    },
  });

  // Default workspace
  const ws = await prisma.workspace.upsert({
    where: { slug: "demo" },
    update: { name: "Demo Workspace" },
    create: { name: "Demo Workspace", slug: "demo" },
  });

  await prisma.membership.upsert({
    where: { userId_workspaceId: { userId: admin.id, workspaceId: ws.id } },
    update: { role: WorkspaceRole.CLIENT_ADMIN },
    create: { userId: admin.id, workspaceId: ws.id, role: WorkspaceRole.CLIENT_ADMIN },
  });

  // Enable core modules for demo
  for (const key of MODULES) {
    await prisma.workspaceModule.upsert({
      where: { workspaceId_moduleKey: { workspaceId: ws.id, moduleKey: key } },
      update: { enabled: true },
      create: { workspaceId: ws.id, moduleKey: key, enabled: true },
    });
  }

  console.log("Seed complete:");
  console.log("Admin:", email, password);
  console.log("Workspace:", ws.slug);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
