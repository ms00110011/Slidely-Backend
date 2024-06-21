import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';

const dbPath = path.resolve(__dirname, 'db.json');


const loadSubmissions = (): any[] => {
    try {
        const data = fs.readFileSync(dbPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading database file:', error);
        return [];
    }
};


const saveSubmissions = (submissions: any[]): void => {
    try {
        fs.writeFileSync(dbPath, JSON.stringify(submissions, null, 2), 'utf8');
    } catch (error) {
        console.error('Error writing to database file:', error);
    }
};

const app = express();
const port = 3000;

app.use(bodyParser.json());


app.get('/ping', (req: Request, res: Response) => {
    res.json(true);
});


app.post('/submit', (req: Request, res: Response) => {
    const { name, email, phone, github_link, stopwatch_time } = req.body;

    if (!name || !email || !phone || !github_link || !stopwatch_time) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const newSubmission = { name, email, phone, github_link, stopwatch_time };
    const submissions = loadSubmissions();
    submissions.push(newSubmission);
    saveSubmissions(submissions);

    res.status(201).json({ message: 'Submission saved successfully' });
});


app.get('/read', (req: Request, res: Response) => {
    const index = parseInt(req.query.index as string);

    if (isNaN(index) || index < 0) {
        return res.status(400).json({ error: 'Invalid index' });
    }

    const submissions = loadSubmissions();

    if (index >= submissions.length) {
        return res.status(404).json({ error: 'Submission not found' });
    }

    res.json(submissions[index]);
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
