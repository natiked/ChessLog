import pool from "../config/db.js";

const getSessions = async (req, res) => {
  const user = req.user.id;

  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    let hasNextPage = false;
    let hasPreviousPage = offset !== 0;

    const query = `
      SELECT 
        sessions.id, 
        sessions.log_text, 
        ARRAY_AGG(tags.name) AS tags,
        sessions.created_at
      FROM sessions
      LEFT JOIN session_tags ON sessions.id = session_tags.session_id
      LEFT JOIN tags ON tags.id = session_tags.tag_id
      WHERE sessions.user_id = $1
      GROUP BY sessions.id, sessions.created_at
      ORDER BY sessions.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const data = (await pool.query(query, [user, limit + 1, offset])).rows;
    if (data.length > limit) {
      hasNextPage = true;
    }

    // Query user career numbers from users table:
    const userStatsQuery = "SELECT wins, total FROM users WHERE id = $1";
    const userStats = (await pool.query(userStatsQuery, [user])).rows[0] || {
      wins: 0,
      total: 0,
    };

    const total = userStats.total || 0;
    const wins = userStats.wins || 0;
    const losses = Math.max(0, total - wins);
    const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;

    res.status(200).json({
      data: data.slice(0, limit),
      next: hasNextPage,
      previous: hasPreviousPage,
      careerStats: {
        total,
        wins,
        losses,
        winRate,
      },
    });
  } catch (error) {
    console.error("GET SESSIONS ERROR:", error);
    res.status(500).json({ message: "An error occurred fetching analytics" });
  }
};

export default getSessions;