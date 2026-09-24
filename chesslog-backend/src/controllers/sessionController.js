import pool from "../config/db.js"

const sessionController = async (req, res) => {
    const id = req.user.id
    const text = req.body.log
    const tags = req.body.tags 
    let win = false
    if (req.body.win) win = true

    let client;

    try {
        client = await pool.connect();
        await client.query('BEGIN');
        // Inside getSessions controller:
        
        if (win) { 
            await client.query('UPDATE users SET wins = wins + 1, total = total + 1 WHERE id = $1', [id]) 
        } else {
            await client.query('UPDATE users SET total = total + 1 WHERE id = $1', [id]) 
        }

        const sessionResult = await client.query('INSERT INTO sessions (user_id, log_text) VALUES ($1, $2) RETURNING id', [id, text])
        const sessionID = sessionResult.rows[0].id;

        if(tags && tags.length>0) {
            for (const element of tags) {
                let tagResult = await client.query('INSERT INTO tags (user_id, name) VALUES ($1, $2) ON CONFLICT (name, user_id) DO UPDATE SET name = EXCLUDED.name RETURNING id', [id, element]) 
                let tagID = tagResult.rows[0].id;
                await client.query('INSERT INTO session_tags (session_id, tag_id) VALUES ($1, $2)', [sessionID, tagID])
            };
        }
        await client.query('COMMIT');
        res.status(201).json({ message: "Session saved!" })

    } catch (error) {
        console.error("SESSION ERROR:", error);
        if (client) await client.query('ROLLBACK')
        res.status(500).json({ message: error.message })
    } finally {
        if (client) client.release()
    }
}
 
export { sessionController };