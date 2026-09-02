const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

let userData = [
    {
        id: 1,
        name: 'Peter Parker',
        email: 'peterparker@gmail.com',
        age: 22
    },
    {
        id: 2,
        name: 'Jean Elaine Grey',
        email: 'jeanelainegrey@gmail.com',
        age: 21
    }
];

app.get('/', (req,res) => {
    res.send('Hallo ich bin mude');
});

app.get('/api/users',(req,res) => {
    res.json(userData);
});

app.post('/api/users', (req, res) => {
    const newUser = req.body;
    if(!newUser.name || !newUser.email || !newUser.age) {
        return res.status(400).json({ error: 'Name and email and age are required' });
    }

    const user = {
        id: userData.length + 1,
        name: newUser.name,
        email: newUser.email,
        age: newUser.age
    };

    userData.push(user);

    res.status(201).json({
        message: 'User created successfully',
        user: user
    });
});

app.put('/api/users/:id', (req, res) => {
    const userId = req.params.id;
    const userIndex = userData.findIndex( u => u.id.toString() === userId );

    if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
    };

    const { name, email, age } = req.body;

    if(!name || !email || !age) {
        return res.status(400).json({ error: 'Name and email and age are required' });
    };

    userData[userIndex] = {
        id: userData[userIndex].id,
        name: name,
        email: email,
        age: age
    }

    res.json({
        message: 'User updates successfully',
        user: userData[userIndex]
    })
});

app.delete('/api/users/:id',(req, res) => {
    const userId = parseInt(req.params.id);
    userData = userData.filter( user => user.id !== userId);
    res.status(204).send();
});

app.listen(port,() => {
    console.log(`Server running at http://localhost:${port}`);
});