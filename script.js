// State management
let currentState = {
    resumeFile: null,
    atsFile: null,
    jobDescription: ''
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    initializeFileUploads();
    initializeJobDescription();
});

// Tab navigation
function initializeTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            
            // Update active tab button
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Show active tab content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tabId) {
                    content.classList.add('active');
                }
            });
        });
    });
}

// File upload handlers
function initializeFileUploads() {
    // Resume Analyzer file upload
    const resumeUploadArea = document.getElementById('resumeUploadArea');
    const resumeFileInput = document.getElementById('resumeFileInput');
    
    setupFileUpload(resumeUploadArea, resumeFileInput, 'resume');

    // ATS Check file upload
    const atsUploadArea = document.getElementById('atsUploadArea');
    const atsFileInput = document.getElementById('atsFileInput');
    
    setupFileUpload(atsUploadArea, atsFileInput, 'ats');
}

function setupFileUpload(uploadArea, fileInput, type) {
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', (e) => handleDrop(e, type));
    fileInput.addEventListener('change', (e) => handleFileSelect(e, type));
}

function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e, type) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0], type);
    }
}

function handleFileSelect(e, type) {
    const file = e.target.files[0];
    if (file) {
        handleFile(file, type);
    }
}

function handleFile(file, type) {
    // Validate file type
    const validTypes = ['application/pdf', 'application/msword', 
                       'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
                       'text/plain'];
    
    if (!validTypes.includes(file.type)) {
        showError('Please select a valid file type (PDF, DOC, DOCX, TXT)');
        return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
        showError('File size must be less than 5MB');
        return;
    }

    if (type === 'resume') {
        currentState.resumeFile = file;
        document.getElementById('resumeFileName').textContent = file.name;
        document.getElementById('resumeFileInfo').style.display = 'flex';
        document.getElementById('resumeAnalyzeBtn').disabled = false;
    } else {
        currentState.atsFile = file;
        document.getElementById('atsFileName').textContent = file.name;
        document.getElementById('atsFileInfo').style.display = 'flex';
        updateAtsAnalyzeButton();
    }
    
    hideError();
}

function removeResumeFile() {
    currentState.resumeFile = null;
    document.getElementById('resumeFileInput').value = '';
    document.getElementById('resumeFileInfo').style.display = 'none';
    document.getElementById('resumeAnalyzeBtn').disabled = true;
}

function removeAtsFile() {
    currentState.atsFile = null;
    document.getElementById('atsFileInput').value = '';
    document.getElementById('atsFileInfo').style.display = 'none';
    updateAtsAnalyzeButton();
}

function initializeJobDescription() {
    const jobDescriptionTextarea = document.getElementById('jobDescription');
    jobDescriptionTextarea.addEventListener('input', function() {
        currentState.jobDescription = this.value;
        updateAtsAnalyzeButton();
    });
}

function updateAtsAnalyzeButton() {
    const atsAnalyzeBtn = document.getElementById('atsAnalyzeBtn');
    atsAnalyzeBtn.disabled = !(currentState.atsFile && currentState.jobDescription.trim());
}

// API Calls
async function analyzeResume() {
    if (!currentState.resumeFile) return;

    showLoading('resume');
    hideError();

    const formData = new FormData();
    formData.append('file', currentState.resumeFile);

    try {
        const response = await fetch('https://resumeanalyzeratschecker.onrender.com/api/resume/analyzer', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }

        displayResumeResults(data);

    } catch (error) {
        console.error('Error analyzing resume:', error);
        showError(`Failed to analyze resume: ${error.message}`);
    } finally {
        hideLoading('resume');
    }
}

async function checkATS() {
    if (!currentState.atsFile || !currentState.jobDescription.trim()) return;

    showLoading('ats');
    hideError();

    const formData = new FormData();
    formData.append('file', currentState.atsFile);
    formData.append('jd', currentState.jobDescription);

    try {
        const response = await fetch('https://resumeanalyzeratschecker.onrender.com/api/resume/ats-check', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }

        displayATSResults(data);

    } catch (error) {
        console.error('Error checking ATS:', error);
        showError(`Failed to check ATS compatibility: ${error.message}`);
    } finally {
        hideLoading('ats');
    }
}

// Results Display
function displayResumeResults(data) {
    console.log('Resume Analysis Data:', data);
    
    let analysisData;
    
    try {
        // Check if we have an analysis field in the response
        if (data.analysis && typeof data.analysis === 'string') {
            // Parse the cleaned JSON string
            analysisData = JSON.parse(data.analysis);
        } else if (data.analysis && typeof data.analysis === 'object') {
            // If it's already an object, use it directly
            analysisData = data.analysis;
        } else {
            // Use the data directly if no analysis field
            analysisData = data;
        }
    } catch (e) {
        console.error('Error parsing analysis data:', e);
        showError('Failed to parse analysis results: ' + e.message);
        return;
    }

    // Update overall score
    const overallScore = analysisData.overallScore || 0;
    document.getElementById('resumeOverallScore').textContent = overallScore;
    document.getElementById('resumeScoreFill').style.width = `${(overallScore / 5) * 100}%`;

    // Update candidate information
    document.getElementById('candidateName').textContent = analysisData.candidateName || 'Not specified';
    document.getElementById('expectedRole').textContent = analysisData.expectedRole || 'Not specified';

    // Update skills
    updateSkills(analysisData.skills);

    // Update section scores
    updateSectionScores(analysisData.sectionScores);

    // Update file naming check
    updateFileNamingCheck(analysisData.fileNamingCheck);

    // Update improvements
    updateImprovements(analysisData.improvements);

    // Show results
    document.getElementById('resumeResultsSection').style.display = 'block';
}

function displayATSResults(data) {
    console.log('ATS Analysis Data:', data);
    
    let analysisData;
    
    try {
        // Check if we have an analysis field in the response
        if (data.analysis && typeof data.analysis === 'string') {
            // Parse the cleaned JSON string
            analysisData = JSON.parse(data.analysis);
        } else if (data.analysis && typeof data.analysis === 'object') {
            // If it's already an object, use it directly
            analysisData = data.analysis;
        } else {
            // Use the data directly if no analysis field
            analysisData = data;
        }
    } catch (e) {
        console.error('Error parsing ATS data:', e);
        showError('Failed to parse ATS results: ' + e.message);
        return;
    }

    // Update ATS score
    const atsScore = analysisData.atsScore || 0;
    document.getElementById('atsScore').textContent = atsScore;
    document.getElementById('atsScoreFill').style.width = `${atsScore}%`;

    // Update candidate and role information
    document.getElementById('atsCandidateName').textContent = analysisData.candidateName || 'Not specified';
    document.getElementById('predictedRole').textContent = analysisData.predictedRoleFit || 'Not specified';
    document.getElementById('skillsMatchScore').textContent = (analysisData.skillsMatchScore || 0) + '%';

    // Update technical fit
    document.getElementById('technicalFitComment').textContent = analysisData.technicalFitComment || 'No technical fit assessment available.';

    // Update summary fit
    document.getElementById('summaryFitFeedback').textContent = analysisData.summaryFitFeedback || 'No summary fit feedback available.';

    // Update keywords
    updateKeywords(analysisData.matchedKeywords, analysisData.missingKeywords);

    // Update recommendations
    updateRecommendations(analysisData.recommendations);

    // Show results
    document.getElementById('atsResultsSection').style.display = 'block';
}

// Helper functions for updating UI
function updateSkills(skillsData) {
    const primarySkillsContainer = document.getElementById('primarySkills');
    const secondarySkillsContainer = document.getElementById('secondarySkills');

    primarySkillsContainer.innerHTML = '';
    secondarySkillsContainer.innerHTML = '';

    if (skillsData) {
        if (skillsData.primarySkills && Array.isArray(skillsData.primarySkills)) {
            skillsData.primarySkills.forEach(skill => {
                const skillElement = createSkillElement(skill);
                primarySkillsContainer.appendChild(skillElement);
            });
        }

        if (skillsData.secondarySkills && Array.isArray(skillsData.secondarySkills)) {
            skillsData.secondarySkills.forEach(skill => {
                const skillElement = createSkillElement(skill);
                secondarySkillsContainer.appendChild(skillElement);
            });
        }
    }

    if (primarySkillsContainer.children.length === 0) {
        primarySkillsContainer.innerHTML = '<p class="no-data">No primary skills identified</p>';
    }
    if (secondarySkillsContainer.children.length === 0) {
        secondarySkillsContainer.innerHTML = '<p class="no-data">No secondary skills identified</p>';
    }
}

function createSkillElement(skill) {
    const element = document.createElement('div');
    element.className = 'skill-tag';
    element.textContent = skill;
    return element;
}

function updateSectionScores(sectionScores) {
    const scoresContainer = document.getElementById('sectionScores');
    scoresContainer.innerHTML = '';

    if (sectionScores) {
        for (const [section, score] of Object.entries(sectionScores)) {
            const scoreElement = document.createElement('div');
            scoreElement.className = 'score-item';
            
            const formattedSection = section.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            
            scoreElement.innerHTML = `
                <label>${formattedSection}</label>
                <div class="score-value">${score}/5</div>
            `;
            
            scoresContainer.appendChild(scoreElement);
        }
    }

    if (scoresContainer.children.length === 0) {
        scoresContainer.innerHTML = '<p class="no-data">No section scores available</p>';
    }
}

function updateFileNamingCheck(namingCheck) {
    const namingStatus = document.getElementById('namingStatus');
    
    if (namingCheck) {
        const isProper = namingCheck.isProperNameFormat;
        namingStatus.className = `naming-status ${isProper ? 'good' : 'poor'}`;
        
        namingStatus.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <strong>Status:</strong>
                <span style="color: ${isProper ? 'var(--success)' : 'var(--danger)'}">
                    ${isProper ? '✓ Proper Format' : '✗ Needs Improvement'}
                </span>
            </div>
            ${namingCheck.expectedFormatExample ? `
                <div>
                    <strong>Expected Format:</strong>
                    <p style="color: var(--text-secondary); margin-top: 5px;">${namingCheck.expectedFormatExample}</p>
                </div>
            ` : ''}
        `;
    } else {
        namingStatus.innerHTML = '<p class="no-data">No file naming check available</p>';
    }
}

function updateImprovements(improvements) {
    const improvementsContainer = document.getElementById('resumeImprovements');
    improvementsContainer.innerHTML = '';

    if (improvements && Array.isArray(improvements)) {
        improvements.forEach((improvement, index) => {
            const improvementElement = document.createElement('div');
            improvementElement.className = 'suggestion-item';
            
            const improvementText = typeof improvement === 'object' 
                ? (improvement.suggestion || improvement.text || improvement.improvement || 'No suggestion text')
                : improvement;
                
            improvementElement.innerHTML = `
                <p><strong>${index + 1}.</strong> ${improvementText}</p>
            `;
            improvementsContainer.appendChild(improvementElement);
        });
    }

    if (improvementsContainer.children.length === 0) {
        improvementsContainer.innerHTML = '<p class="no-data">No improvement suggestions available</p>';
    }
}

function updateKeywords(matchedKeywords, missingKeywords) {
    const matchedContainer = document.getElementById('matchedKeywords');
    const missingContainer = document.getElementById('missingKeywords');

    matchedContainer.innerHTML = '';
    missingContainer.innerHTML = '';

    if (matchedKeywords && Array.isArray(matchedKeywords)) {
        matchedKeywords.forEach(keyword => {
            const keywordElement = createKeywordElement(keyword, false);
            matchedContainer.appendChild(keywordElement);
        });
    }

    if (missingKeywords && Array.isArray(missingKeywords)) {
        missingKeywords.forEach(keyword => {
            const keywordElement = createKeywordElement(keyword, true);
            missingContainer.appendChild(keywordElement);
        });
    }

    if (matchedContainer.children.length === 0) {
        matchedContainer.innerHTML = '<p class="no-data">No matched keywords</p>';
    }
    if (missingContainer.children.length === 0) {
        missingContainer.innerHTML = '<p class="no-data">No missing keywords</p>';
    }
}

function createKeywordElement(keyword, isMissing) {
    const element = document.createElement('div');
    element.className = `keyword-tag ${isMissing ? 'missing' : ''}`;
    element.textContent = keyword;
    return element;
}

function updateRecommendations(recommendations) {
    const recommendationsContainer = document.getElementById('atsRecommendations');
    recommendationsContainer.innerHTML = '';

    if (recommendations && Array.isArray(recommendations)) {
        recommendations.forEach((recommendation, index) => {
            const recommendationElement = document.createElement('div');
            recommendationElement.className = 'suggestion-item';
            
            const recommendationText = typeof recommendation === 'object' 
                ? (recommendation.suggestion || recommendation.text || recommendation.recommendation || 'No recommendation text')
                : recommendation;
                
            recommendationElement.innerHTML = `
                <p><strong>${index + 1}.</strong> ${recommendationText}</p>
            `;
            recommendationsContainer.appendChild(recommendationElement);
        });
    }

    if (recommendationsContainer.children.length === 0) {
        recommendationsContainer.innerHTML = '<p class="no-data">No recommendations available</p>';
    }
}

// UI Utility Functions
function showLoading(type) {
    document.getElementById(`${type}Loading`).style.display = 'block';
    document.getElementById(`${type}AnalyzeBtn`).disabled = true;
}

function hideLoading(type) {
    document.getElementById(`${type}Loading`).style.display = 'none';
    document.getElementById(`${type}AnalyzeBtn`).disabled = false;
}

function showError(message) {
    const errorElement = document.getElementById('errorMessage');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    errorElement.scrollIntoView({ behavior: 'smooth' });
}

function hideError() {
    document.getElementById('errorMessage').style.display = 'none';
}

// Reset functions
function resetResumeAnalyzer() {
    removeResumeFile();
    document.getElementById('resumeResultsSection').style.display = 'none';
    hideError();
}

function resetATSCheck() {
    removeAtsFile();
    document.getElementById('jobDescription').value = '';
    currentState.jobDescription = '';
    document.getElementById('atsResultsSection').style.display = 'none';
    hideError();
    updateAtsAnalyzeButton();
}