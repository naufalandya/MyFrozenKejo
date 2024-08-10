const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY

const verifyToken = (req, res, next) => {
    const { authorization } = req.headers;

    if (!authorization || !authorization.split(' ')[1]) {
        return res.status(401).json({
            status: false,
            message: 'Token not provided!',
            data: null
        });
    }

    let token = authorization.split(' ')[1];

    ;
    
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            
            return res.status(401).json({ 
                status: false,
                message: 'Failed to authenticate token',
                data: null 
            });
        }


        req.token = token;
        req.user = decoded;
        next();
    });
};

module.exports = { verifyToken }