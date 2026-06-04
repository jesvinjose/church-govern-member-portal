import prisma from "../config/prisma";
import { createAdmin } from "./createAdmin";
import { seedRelations } from "./seedRelations";
import { seedRoles } from "./seedRoles";
import { seedTenant } from "./seedTenant";

async function main() {

    const tenant = await seedTenant();

    await seedRoles();

    const admin = await createAdmin();

    await seedRelations();

    console.log("Bootstrap completed");

    if (tenant) {
        console.log("Tenant:", tenant.name);
    }

    if (admin) {
        console.log("Admin:", admin.email);
    }

}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });

