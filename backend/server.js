const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/run', (req, res) => {
  const { code, input } = req.body;

  fs.writeFileSync('Main.java', code);

  exec('javac Main.java', (err) => {
    if (err) {
      return res.json({ error: err.message });
    }

    const run = exec('java Main', { timeout: 3000 });

    let output = '';
    let error = '';

    run.stdin.write(input || '');
    run.stdin.end();

    run.stdout.on('data', (data) => output += data);
    run.stderr.on('data', (data) => error += data);

    run.on('close', () => {
      res.json({ output, error });
    });
  });
});

app.listen(3001, () => console.log("Server running on port 3001"));