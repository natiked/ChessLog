import pool from "../config/db.js";

const pagination = async (req, res, next) => {
    // The data that's begin requested (in this case it's just the sessions)
    const user = req.user.id;


    const offset = (page - 1) * limit

    const queryString = "SELECT * FROM sessions WHERE user_id = $1 LIMIT $2 OFFSET $3"
    const requestedData = await pool.query(queryString, [user, offset, limit])

    if (offset + (2 * limit) <= maxi) {
        const hasNextPage = true 
    } 
    if (offset !== 0) {
        const hasPreviousPage = true
    }

    req.hasNextPage = hasNextPage;
    req.hasPreviousPage = hasPreviousPage;
    req.currentPage = requestedData.rows;
    next()
}
 
export default pagination;