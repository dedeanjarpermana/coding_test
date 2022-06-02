import express from "express";

const router = express.Router();

router.get('/', (req, res) => {
    res.send('welcome to home page');
});

router.get('/about', (re1, res) => {
    res.send('welcome to about page');
});

router.get('/contact', (req, res) => {
    res.send('welcome  to contact page');
});

export default router;