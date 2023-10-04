import userModel from "../dao/models/user.model.js";
import { PRIVATE_KEY, authToken, createHash, generateToken } from '../utils.js';
import UsersDTO from "../dtos/usersDTO.output.js";
import { UsersController } from "./usersController.js";

const usersController = new UsersController();

///////////////////////////////////////////////////REGISTER
export const register = async(req, res) => {
    res.status(200).send({ status: 'success', message: 'User successfully registered' });
}

///////////////////////////////////////////////////FAILED REGISTER
export const failedRegister = async(req, res) => {
    res.status(400).send({ status: "error", error: 'Fail to create user' });
};


////////////////////////////////////////////////////LOGIN
export const login = async(req, res) => {
    let user = req.user;
    if (!user) return res.status(400).send({ status: "error", error: "Check username or password" });
    
    req.session.user = {
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        age: user.age,
        role: user.role,
    }

    console.log('login controller');
    /* const accessToken = generateToken(user); */
    res.cookie('TomsCookie', user, { httpOnly: true }).status(200).send({ status: 1 }, 'Correct Cookie Setting', user, req.session.user);
};

////////////////////////////////////////////////////FAILEDLOGIN
export const failedLogin = async(req, res) => {
    res.status(400).send({ status: "error", error: "Fail to login. Please check your data" });
}


/////////////////////////////////////////////////////"CURRENT" ROUTE
export const currentRoute = async(req, res) => {
    if(!req.user) res.status(404).send('The user you look for cannot be reached');
    res.status(200).send(new UsersDTO(req.user.user));
};

////////////////////////////////////////////////////CHANGE PASSWORD
export const changePassword = async(req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).send({ status: 'error', error: 'Invalid values'})
    }

    const user = await userModel.findOne({ email });
    if (!user) {
        return res.status(404).send({ status: 'error', error: 'User not found or does not exist' });
    }

    const newHashedPswd = createHash(password);
    await userModel.updateOne({ _id: user._id }, { $set: { password: newHashedPswd }});
    res.send({ status: 'success', message: 'Password modified successfully'});
};

/////////////////////////////////////////////////////////RETRIVE PASS VIA EMAIL
export const sendingMailToRecover = async(req, res) => {
    let email = req.params.email;
    await usersController.sendEmail(email);
    res.send('Mail sent!. Please check your email inbox');
}

/////////////////////////////////////////////////LOGOUT
export const logout = (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).send({ status: "error", error: "Couldn't logout" });
        res.redirect('/login');
    })
};

//////////////////////////////////////////////////GITHUB LOGIN
export const githubCb = async (req, res) => {
    req.session.user = req.user;
    res.redirect('/products');
};

///////////////////////////////////////////////////////////ROLE CHANGING
export const changeUserRole = (req, res) => {
    

    try {

        const userId = req.params.uid;
        const user = userModel.findById(userId);
        const newRole = req.body;

        

        if ((user.role = 'premium') || (user.role = 'user')) {
            console.log('new role: ', newRole)
            const updatedUser = userModel.findByIdAndUpdate(
              userId,
              { role: newRole },
              { new: true }
            );
                
        }
           /* console.log(user.role) */
        /* if ((user.role = 'premium') || (user.role = 'user')) {
            console.log(newRole);
            await userModel.updateOne({ _id: user._id }, { $set: { role: newRole } });
           /*  await user.save(); 
            console.log(user.role);
        } 
            /* if (user.role = "user") {
                console.log('just user')
               await userModel.updateOne({ _id: user._id }, { $set: { role: "premium" }});
               await user.save();
            } else {
                console.log('userprem')
                await userModel.updateOne({ _id: user._id }, { $set: { role: "user" }});
                await user.save()
            } */
        res.status(200).send(`Role modified successfully. Your current role is ${user.role}`, { status: 1 }, user);

    } catch (error) {
        res.status(500).send('Server Error: ', error.message)
    };
};
