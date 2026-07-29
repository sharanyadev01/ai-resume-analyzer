alert("script.js loaded");
const button = document.getElementById("analyzeBtn");
const resume = document.getElementById("resumeFile");
const job = document.getElementById("jobDescription");
const result = document.getElementById("result");

button.addEventListener("click", () => {
console.log("NEW SCRIPT IS RUNNING");
    if (resume.files.length === 0) {
        alert("Please upload your resume.");
        return;
    }

    if (job.value.trim() === "") {
        alert("Please enter the job description.");
        return;
    }

    const formData = new FormData();

    formData.append("resume", resume.files[0]);
    formData.append("jobDescription", job.value);

    result.innerHTML = "<p>Analyzing resume...</p>";

    fetch("http://localhost:3000/analyze", {
    method: "POST",
    body: formData
})
.then(async (response) => {
    const data = await response.json();

    console.log("FULL DATA:", data);

    result.innerHTML = `
    <div class="result-card">
        <h2>✅ Resume Analysis Complete</h2>

        <div class="score-box">
            <h3>ATS Score</h3>
            <div class="score">${data.atsScore}%</div>
        </div>

        <div class="section">
            <h3>📌 Matched Skills</h3>
            <div class="skills">
                ${data.matchedSkills.map(skill => `<span class="skill matched">${skill}</span>`).join("")}
            </div>
        </div>

        <div class="section">
            <h3>❌ Missing Skills</h3>
            <div class="skills">
                ${data.missingSkills.map(skill => `<span class="skill missing">${skill}</span>`).join("")}
            </div>
        </div>

        <div class="section">
            <h3>📄 Resume Skills</h3>
            <div class="skills">
                ${data.resumeSkills.map(skill => `<span class="skill">${skill}</span>`).join("")}
            </div>
        </div>
    </div>
`;
})
.catch((error) => {
    console.error(error);
    result.innerHTML = error.message;
});

});