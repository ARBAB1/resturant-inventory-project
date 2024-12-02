const jwt = require('jsonwebtoken');
const dbConnection = require('../dbConnection');


exports.generateToken = async (data) => {
    try {
        var payload = { 
            Emp_name: data[0].name,
            Emp_email: data[0].email,
            Emp_User_ID: data[0].user_id,
            created_at: data[0].created_at,
            updated_at: data[0].updated_at
         }
        
        const access_token = jwt.sign(payload, 'access token jwt', { expiresIn: "100d" });
        const refresh_token = jwt.sign(payload, 'refresh token jwt', { expiresIn: "1000d" });

        const updateToken = `UPDATE users SET access_token = ?, refresh_token = ? WHERE email = ?;`;
        const [result] = await dbConnection.execute(updateToken, [access_token, refresh_token, data[0].email]);

        if (result.affectedRows === 1) {
            return {
                message: "success",
                data: "Successfully Login",
                access_token,
                refresh_token,
                user_data: data
            };
        } else {
            throw new Error("Failed to update tokens");
        }
    } catch (error) {
        console.error("Token generation error:", error);
        throw error;
    }
};

