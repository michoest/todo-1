const express = require('express');
const router = express.Router();
const { generateToken } = require('../utils/jwtUtils');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const { populate } = require('../db/db');

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const Users = req.db.getCollection('users');
    let user = Users.findOne({ email });

    if (user && await bcrypt.compare(password, user.passwordHash)) {
        const Accounts = req.db.getCollection('accounts');
        const account = user.defaultAccount ? Accounts.findOne({ id: user.defaultAccount }) : null;
        const token = generateToken(user.id, account?.id);

        user = populate(Users, user, Accounts, 'accounts', 'accounts');
        user = _.pick(user, ['id', 'email', 'name', 'accounts', 'defaultAccount']);

        if (account) {
            const Tasks = req.db.getCollection('tasks');
            const tasks = Tasks.find({ accessAccounts: { '$contains': account.id } });
        
            return res.json({ user, account, token, tasks });
        }
        else {
            return res.json({ user, token });
        }
    } else {
        return res.status(401).json({ notification: { message: 'Invalid credentials' } });
    }
});

router.post('/login/account', async (req, res) => {
    if (req.user) {
        const { accountId, setAsDefaultAccount } = req.body;

        if (req.user.accounts.includes(accountId)) {
            const Accounts = req.db.getCollection('accounts');
            const account = Accounts.findOne({ id: accountId });

            if (account) {
                if (setAsDefaultAccount) {
                    req.user.defaultAccount = accountId;

                    const Users = req.db.getCollection('users');
                    Users.update(req.user);
                }

                const token = generateToken(req.user.id, account.id);
                
                const Tasks = req.db.getCollection('tasks');
                let tasks = Tasks.find({ accessAccounts: { '$contains': account.id } });
                tasks = populate(Tasks, tasks, Accounts, 'accessAccounts', 'accessAccounts');
                tasks = populate(Tasks, tasks, Accounts, 'owner', 'owner');

                const Users = req.db.getCollection('users');
                let user = req.user;
                user = populate(Users, user, Accounts, 'accounts', 'accounts');
                user = _.pick(user, ['id', 'email', 'name', 'accounts', 'defaultAccount']);
            
                return res.json({ user, account, token, tasks });
            }
            else {
                return res.status(404).json({ notification: { message: 'Account not found' } });
            }
        }
        else {
            return res.status(401).json({ notification: { message: 'Not authorized' } });
        }
    }
    else {
        return res.status(401).json({ notification: { message: 'Invalid credentials' } });
    }
});

router.post('/logout', (req, res) => {
    // JWT doesn't require server-side logout, but you can implement token invalidation if needed
    res.send('Logged out successfully');
});

module.exports = router;