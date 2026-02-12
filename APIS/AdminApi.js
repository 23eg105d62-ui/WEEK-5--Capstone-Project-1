import exp from 'express'
import UserModel from '../Models/UserModel.js'
import { verifyToken } from '../Middlewares/verifyToken.js'
import bcrypt from 'bcryptjs'

export const adminRoute = exp.Router()

// Middleware to verify the requester is an ADMIN
const checkAdmin = async (req, res, next) => {

    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Access denied. Admin privileges required.' })
    }
    next()

}

// Block a user (set isActive = false)
adminRoute.put('/admin/block/:id', verifyToken, checkAdmin, async (req, res, next) => {

    const userId = req.params.id
    const updated = await UserModel.findByIdAndUpdate(userId,
        { $set: { isActive: false } },
        { new: true }
    )
    if (!updated) return res.status(404).json({ message: 'User not found' })
    res.status(200).json({ message: 'User blocked', payload: updated })

})

// Unblock a user (set isActive = true)
adminRoute.put('/admin/unblock/:id', verifyToken, checkAdmin, async (req, res, next) => {
    //get userId
    const userId = req.params.id
    //perform update operation
    const updated = await UserModel.findByIdAndUpdate(userId,
        { $set: { isActive: true } },
        { new: true }
    )
    if (!updated) return res.status(404).json({ message: 'User not found' })
    //send res
    res.status(200).json({ message: 'User unblocked', payload: updated })

})
//update Password
adminRoute.put('/admin/update-password/:id', verifyToken, checkAdmin, async (req, res, next) => {
    //gey userId
    const userId = req.params.id
    //get newPassword from body
    const { newPassword } = req.body

    if (!newPassword) {
        return res.status(400).json({ message: 'Password must not be empty' })
    }
    //find the user 
    const user = await UserModel.findById(userId)
    if (!user) {
        return res.status(404).json({ message: 'User not found' })
    }
    //hash the password
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    //replace password with hashed password
    const updated = await UserModel.findByIdAndUpdate(userId,
        { $set: { password: hashedPassword } },
        { new: true }
    )
    res.status(200).json({ message: 'Password updated successfully', payload: updated })
})

