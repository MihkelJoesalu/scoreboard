require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();

app.use(express.json());

// Define your CORS configuration
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? [
          "https://scoreboard-roan-five.vercel.app",
          "https://hinneteleht.netlify.app",
        ] // Add your Netlify URL here
      : "*", // Allow all origins for local development
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Error:", err));

// Define Schemas & Models
const JudgeSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true },
});
const TeamSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true },
});

const ScoreSchema = new mongoose.Schema({
  judgeName: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Judge",
    required: true,
  },
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
  scores: {
    design: {
      visuallyAttractive: Number,
      interactivity: Number,
      intuitivity: Number,
    },
    factuality: {
      actuality: Number,
      credibility: Number,
      learningValue: Number,
    },
    functionality: {
      mistakes: Number,
      reactionTime: Number,
      errorManagement: Number,
    },
    codeQuality: {
      structure: Number,
      dryPrinciples: Number,
      bestPractices: Number,
    },
  },
});

const Judge = mongoose.model("Judge", JudgeSchema);
const Team = mongoose.model("Team", TeamSchema);
const Score = mongoose.model("Score", ScoreSchema);

// API Routes

// Teams left to rate for judge
app.get("/api/unrated-teams/:judgeName", async (req, res) => {
  try {
    const judgeName = req.params.judgeName;

    // Find the judge by name
    const judge = await Judge.findOne({ name: judgeName });
    if (!judge) return res.status(404).json({ error: "Judge not found" });

    // Find all team IDs that this judge has rated
    const ratedTeams = await Score.find({ judgeName: judge._id }).distinct(
      "teamId"
    );

    // Find teams that have not been rated by this judge
    const teamsLeft = await Team.find({
      _id: { $nin: ratedTeams }, // Exclude teams that have been rated by the judge
    });

    res.json(teamsLeft);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch unrated teams" });
  }
});

// Register Judge
app.post("/api/judges", async (req, res) => {
  try {
    const judge = await Judge.create({ name: req.body.name });
    res.json(judge);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get Judges
app.get("/api/judges", async (req, res) => {
  try {
    const judges = await Judge.aggregate([{ $sample: { size: 9 } }]);
    res.json(judges);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Post teams
app.post("/api/teams", async (req, res) => {
  try {
    const team = await Team.create({ name: req.body.name });
    res.json(team);
  } catch (err) {
    console.error("Error creating team:", err);
    res.status(400).json({ error: err.message });
  }
});

// Get All Teams (Random Order)
app.get("/api/teams", async (req, res) => {
  try {
    const teams = await Team.aggregate([{ $sample: { size: 9 } }]);
    res.json(teams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Submit ratings
app.post("/api/rate", async (req, res) => {
  try {
    const { judgeId, teamId, scores } = req.body;

    // Validate judge
    const judge = await Judge.findById(judgeId);
    if (!judge) return res.status(404).json({ error: "Hindajat ei leitud" });

    // Validate team
    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ error: "Võistkonda ei leitud" });

    // Check if the judge already rated this team
    const existingScore = await Score.findOne({ judgeName: judge._id, teamId });
    if (existingScore) {
      return res
        .status(400)
        .json({ error: "Oled juba sellele meeskonnale hinde andnud" });
    }

    // Create and save new score
    const newScore = new Score({
      judgeName: judge._id,
      teamId,
      scores,
    });

    await newScore.save();
    res
      .status(201)
      .json({ message: "Hinded edukalt edastatud!", score: newScore });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Hinnete andmine ebaõnnestus!" });
  }
});

// Final Score table
app.get("/api/results", async (req, res) => {
  try {
    const teams = await Team.find(); // Get all teams
    const results = await Promise.all(
      teams.map(async (team) => {
        // Fetch all ratings for this team
        const scores = await Score.find({ teamId: team._id }).populate(
          "judgeName",
          "name"
        );

        // Initialize total scores
        const totalScores = {
          design: 0,
          factuality: 0,
          functionality: 0,
          codeQuality: 0,
        };

        // Sum up all judge scores
        scores.forEach(({ scores }) => {
          totalScores.design +=
            scores.design.visuallyAttractive +
            scores.design.interactivity +
            scores.design.intuitivity;
          totalScores.factuality +=
            scores.factuality.actuality +
            scores.factuality.credibility +
            scores.factuality.learningValue;
          totalScores.functionality +=
            scores.functionality.mistakes +
            scores.functionality.reactionTime +
            scores.functionality.errorManagement;
          totalScores.codeQuality +=
            scores.codeQuality.structure +
            scores.codeQuality.dryPrinciples +
            scores.codeQuality.bestPractices;
        });

        return {
          team: team.name,
          total:
            totalScores.design +
            totalScores.factuality +
            totalScores.functionality +
            totalScores.codeQuality,
          detailedScores: totalScores,
          judges: scores.map((s) => ({
            judgeId: s.judgeName._id,
            judgeName: s.judgeName.name,
            scores: s.scores,
          })),
        };
      })
    );

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch results" });
  }
});

// Submit/Edit Scores
app.post("/api/scores", async (req, res) => {
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
app.get("/api/justresults", async (req, res) => {
  try {
    const results = await Score.find()
      .populate("teamId", "name")
      .sort({ teamId: 1, judgeName: 1 });
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//preflight request
app.options("*", cors());

// Start Server
const PORT = process.env.PORT || 3005;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
