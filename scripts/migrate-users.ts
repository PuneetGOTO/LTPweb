import prisma from '../src/lib/prisma'

async function main() {
  console.log("Starting user migration script...")
  const users = await prisma.user.findMany({
    include: { profile: true }
  })

  // Basic regex for English, Numbers, and Underscores only
  const validIdRegex = /^[A-Za-z0-9_]+$/
  let migratedCount = 0

  console.log("\n=== MIGRATION REPORT ===")
  
  for (const user of users) {
    if (!validIdRegex.test(user.username)) {
      const oldUsername = user.username
      const newUsername = `user_${Math.random().toString(36).substring(2, 8)}`
      
      // 1. Update Profile displayName to hold the old Chinese name
      if (user.profile) {
        if (!user.profile.displayName) {
          await prisma.profile.update({
            where: { userId: user.id },
            data: { displayName: oldUsername }
          })
        }
      } else {
        // Create profile if missing
        await prisma.profile.create({
          data: {
            userId: user.id,
            displayName: oldUsername
          }
        })
      }

      // 2. Safely change the User username ID
      await prisma.user.update({
        where: { id: user.id },
        data: { username: newUsername }
      })

      console.log(`[UPDATED] Old Name: ${oldUsername}  --->  New ID: ${newUsername}`)
      migratedCount++
    }
  }

  console.log(`\nMigration completed. ${migratedCount} accounts updated.`)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
