import prisma from "../config/prisma"
async function main() {
    const members = await prisma.member.findMany({
        where: {
            relation_name: {
                not: null
            }
        }
    })
    for (const member of members) {
        const relation = await prisma.relation.findFirst({
            where: {
                name: member.relation_name!
            }
        })

        if (!relation) {
            console.log(`Relation not found: ${member.relation_name}`)
            continue
        }

        await prisma.member.update({
            where: { id: member.id },
            data: {
                relation_id: relation.id
            }
        })
    }
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect()
    })

