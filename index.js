import { PrismaClient } from '@prisma/client';
import express from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';

const prisma = new PrismaClient();

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Too many requests, please try again later.' },
});

const app = express();
app.use(express.json())
const secretKey = 'mySecret';
app.use(limiter);

const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization').split(' ')[1]
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.Go to the /token to get ones' });
    }

    try {
        jwt.verify(token, secretKey);
        next();
    } catch (error) {
        console.error('error while token validtion', token)
        res.json({ error: 'error while validation' })
    }
}

app.get('/token', async(req, res) => {

    const token = jwt.sign({}, secretKey, { expiresIn: '1h' });
    res.json({ token: token });
})

app.get('/webtoons', async(req, res) => {
    try {
        const animes = await prisma.animeList.findMany();
        res.json({ animesList: animes });
    } catch (error) {
        console.error('Error fetching anime list:', error);
        res.status(500).json({ error: 'An error occurred while fetching the anime list.' });
    }
});

app.post('/webtoons', authenticateToken, async(req, res) => {
    const { title, description, Image } = req.body;
    try {
        const anime = await prisma.animeList.create({
            data: {
                title: title,
                description: description,
                Image: Image
            }

        })
        res.json({ 'sucess': anime })
    } catch (error) {
        console.error("Error adding new data", error)
        res.status(500).json({ error: 'An error occured while insterting new data' });
    }
})

app.get('/webtoons/:id', async(req, res) => {
    const webtoonId = req.params.id;
    try {
        const anime = await prisma.animeList.findFirst({
            where: {
                id: Number(webtoonId)
            }
        })
        res.status(200).json({
            webtoon: anime
        })
    } catch (error) {
        console.error('Error fetching the webtoon', error)
        res.status(500).json({ error: 'an error occured while fetching the webtoon' })
    }

})

app.delete('/webtoons/:id', authenticateToken, async(req, res) => {
    try {
        const webtoonId = req.params.id;
        const webtoon = await prisma.animeList.delete({
            where: {
                id: Number(webtoonId)
            }
        })
        res.json({
            webtoon: `deleted:webtoon- ${webtoon.title}`
        })
    } catch (error) {
        console.error('Error deleting the webtoon', error);
        res.status(500).json({ error: 'error occured while deleting the webtoon' })
    }
})
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});