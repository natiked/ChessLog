import jwt from 'jsonwebtoken' 

function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.status(401).json({'auth' : 'Unauthorized'})
    
    jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
        if (err) return res.status(403).json({'auth' : 'Unauthorized'})
        req.user = user
        console.log(user)
        next()
    })
}

export default verifyToken;

