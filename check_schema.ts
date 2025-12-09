import db from '@adonisjs/lucid/services/db'
import app from '@adonisjs/core/services/app'

async function run() {
    await app.boot()

    try {
        const result = await db.rawQuery("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'quizzes' AND column_name = 'user_id'")
        console.log('Schema check result:', result.rows)
    } catch (error) {
        console.error('Error checking schema:', error)
    }
}

run()
