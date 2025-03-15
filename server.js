require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Error:', err));

// Define Schemas & Models
const JudgeSchema = new mongoose.Schema({ name: { type: String, unique: true, required: true } });
const TeamSchema = new mongoose.Schema({ name: { type: String, unique: true, required: true } });

const ScoreSchema = new mongoose.Schema({
    judgeName: { type: String, required: true },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    scores: {
        design: { visuallyAttractive: Number, interactivity: Number, intuitivity: Number },
        factuality: { actuality: Number, credibility: Number, learningValue: Number },
        functionality: { mistakes: Number, reactionTime: Number, errorManagement: Number },
        codeQuality: { structure: Number, dryPrinciples: Number, bestPractices: Number }
    }
});

const Judge = mongoose.model('Judge', JudgeSchema);
const Team = mongoose.model('Team', TeamSchema);
const Score = mongoose.model('Score', ScoreSchema);

// API Routes

// Register Judge
app.post('/api/judges', async (req, res) => {
    try {
        const judge = await Judge.create({ name: req.body.name });
        res.json(judge);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get Judges
app.get('/api/judges', async (req, res) => {
    try {
        const judges = await Judge.aggregate([{ $sample: { size: 9 } }]);
        res.json(judges);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Post teams
app.post('/api/teams', async (req, res) => {
    try {
        const team = await Team.create({ name: req.body.name });
        res.json(team);
    } catch (err) {
        console.error('Error creating team:', err);
        res.status(400).json({ error: err.message });
    }
});

// Get All Teams (Random Order)
app.get('/api/teams', async (req, res) => {
    try {
        const teams = await Team.aggregate([{ $sample: { size: 9 } }]);
        res.json(teams);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



// Submit/Edit Scores
app.post('/api/scores', async (req, res) => {
    const { judgeName, teamId, scores } = req.body;
    
    try {
        const updatedScore = await Score.findOneAndUpdate(
            { judgeName, teamId },
            { scores },
            { upsert: true, new: true }
        );
        res.json(updatedScore);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get Final Scores
app.get('/api/results', async (req, res) => {
    try {
        const results = await Score.find().populate('teamId', 'name').sort({ teamId: 1, judgeName: 1 });
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));