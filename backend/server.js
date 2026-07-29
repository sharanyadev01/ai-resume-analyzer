 require("dotenv").config();
console.log("Groq Key:", process.env.GROQ_API_KEY);

const Groq = require("groq-sdk");
 const express = require("express");
const cors = require("cors");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const fs = require("fs");
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Store uploaded files temporarily
const upload = multer({
    dest: "uploads/"
});

// Test route
app.get("/", (req, res) => {
    res.send("Backend is running!");
});

// Analyze route
app.post("/analyze", upload.single("resume"), async (req, res) => {

    console.log("========== NEW REQUEST ==========");
    console.log("File:", req.file);
    console.log("Body:", req.body);

    if (!req.file) {
        return res.status(400).json({
            message: "No resume file received."
        });
    }

    try {

        const pdfBuffer = fs.readFileSync(req.file.path);

        const data = await pdfParse(pdfBuffer);
 const prompt = `
Extract only the technical skills from the following job description.

Job Description:
${req.body.jobDescription}

Return ONLY a comma-separated list of skills.
`;

const chatCompletion = await groq.chat.completions.create({
    messages: [
        {
            role: "user",
            content: prompt
        }
    ],
    model: "llama-3.3-70b-versatile"
});

const aiSkills =
    chatCompletion.choices[0].message.content;

console.log("AI Skills:", aiSkills);   

const skills = aiSkills
    .split(",")
    .map(skill => skill.trim())
    .filter(skill => skill.length > 0);    
const resumeSkills = skills.filter(skill =>
    data.text.toLowerCase().includes(skill.toLowerCase())
);
const jobSkills = skills;

console.log(jobSkills);
const matchedSkills = jobSkills.filter(skill =>
    resumeSkills.includes(skill)
);

console.log("Matched Skills:", matchedSkills);
const atsScore = Math.round(
    (matchedSkills.length / jobSkills.length) * 100
);

console.log("ATS Score:", atsScore);
const missingSkills = jobSkills.filter(skill =>
    !resumeSkills.includes(skill)
);

console.log("Missing Skills:", missingSkills);
console.log(resumeSkills);

        // Delete uploaded file after reading it
        fs.unlinkSync(req.file.path);

        res.json({
    message: "Resume analyzed successfully!",
    resumeSkills,
    jobSkills,
    matchedSkills,
    missingSkills,
    atsScore
});

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: error.message
        });

    }

});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});