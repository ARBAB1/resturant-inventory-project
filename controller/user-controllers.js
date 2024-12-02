const dbConnection = require("../dbConnection");
const bcrypt = require("bcryptjs");
const uploadPosts = require("../middleware/profile-upload-middleware");
const emailValidator = require("../Globals/email-validator");
const { generateToken } = require("../Globals/token-validation");
const path = require("path");

exports.signUp = async (req, res) => {
  try {
    await uploadPosts(req, res);

    if (!emailValidator(req.body.email)) {
      return res.status(400).send({
        message: "Invalid Email Format",
      });
    }

    const [checkEmailUnique] = await dbConnection.execute(
      `SELECT * FROM users WHERE email = ?`,
      [req.body.email]
    );
    if (checkEmailUnique.length > 0) {
      return res.status(400).send({
        message: "Email already registered",
      });
    }

    // const {
    //   name,
    //   email,
    //   password,
    //   Sort_key,
    //   password_Change_flag,
    //   Wrong_Password_Count,
    //   Password_Change_Date,
    //   Role_Code,
    //   resturant_code,
    //   access_token,
    //   refresh_token,
    // } = req.body;

    const {
      name,
      email,
      password,
      Sort_key = null,           
      password_Change_flag = null, 
      Wrong_Password_Count = 0,   
      Password_Change_Date = null,
      Role_Code = null,           
      resturant_code = null,      
      access_token,
      refresh_token,
    } = req.body; 
    const hashPass = await bcrypt.hash(password, 12);

    const [lastEmpUser] = await dbConnection.execute(
      `SELECT Emp_User_ID FROM users ORDER BY Emp_User_ID DESC LIMIT 1`
    );
    let newEmpUserId = "0001";
    if (lastEmpUser.length > 0) {
      const lastEmpUserId = parseInt(lastEmpUser[0].Emp_User_ID, 10);
      newEmpUserId = (lastEmpUserId + 1).toString().padStart(4, "0");
    }

    let profilePictureUrl = "";
    if (req.file) {
      profilePictureUrl =
        "/resources/static/assets/uploads/profiles/" + req.file.filename;
    }

    
    const signupArray = [
      newEmpUserId,
      name,
      email,
      hashPass, 
      Sort_key,
      password_Change_flag,
      Wrong_Password_Count,
      Password_Change_Date,
      Role_Code,
      resturant_code,
    ];


    console.log(`INSERT INTO users (
          Emp_User_ID, name,email,password,Sort_key, password_Change_flag, Wrong_Password_Count, Password_Change_Date, 
           Role_Code, resturant_code
      ) VALUES (?,?,?,?,?,?,?,?,?,?)`,
      signupArray)
    
    const [signup] = await dbConnection.execute(
      `INSERT INTO users (
          Emp_User_ID, name,email,password,Sort_key, password_Change_flag, Wrong_Password_Count, Password_Change_Date, 
           Role_Code, resturant_code, access_token, refresh_token, profile_picture
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      signupArray
    );

    
    if (signup.affectedRows === 1) {
      return res.status(200).send({
        message: "User added successfully",
      });
    } else {
      return res.status(500).json({
        message: "Could not add user",
      });
    }
  } catch (err) {
    res.status(500).send({
      failed: "Failed to sign up",
      message: `${err}`,
    });
  }
};

exports.loginUser = async (req, res) => {
    var { email, password } = req.body;
    try {
        if (!emailValidator(req.body.email)) {
            return res.status(400).send({
                message: "Invalid Email Format"
            });
        }

        const [user] = await dbConnection.execute(`SELECT * FROM users WHERE email = ?`, [email]);
        if (user.length === 0) {
            return res.status(400).send({
                message: "Invalid email or password"
            });
        }

        const userData = user[0];

        const isPasswordValid = await bcrypt.compare(password, userData.password);
        if (!isPasswordValid) {
            return res.status(400).send({
                message: "Invalid email or password"
            });
        }


        const tokenResponse = await generateToken([userData]);

        return res.status(200).send({
            message: tokenResponse.data,
            
            access_token: tokenResponse.access_token,
            refresh_token: tokenResponse.refresh_token,
            user_data: tokenResponse.user_data
        });
    } catch (err) {
        return res.status(500).send({
            message: "Failed",
            error: err.message
        });
    }
};


exports.getAllUsers = async (req, res) => {
    try {
      const [getAllUsers] = await dbConnection.execute(`SELECT * FROM users`);
      return res.status(200).json({
        message: "Users retrieved successfully",
        data: getAllUsers
      });
    } catch (err) {
      res.status(500).send({
        message: err.message
      });
    }
  };
