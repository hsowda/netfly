const companies = [
    { name: 'Apple', category: 'tech', videoId: 'TPe8revsg3k' },
    { name: 'Nike', category: 'retail', videoId: 'pwLergHG81c' },
    { name: 'Coca-Cola', category: 'food', videoId: 'VGa1imApfdg' },
    { name: 'McDonald\'s', category: 'food', videoId: '6mx0t0ex7y8' },
    { name: 'Samsung', category: 'tech', videoId: 'CYqOnILg8N4' }
];

const FeedbackManager = {
    storageKey: 'commercial_feedback',
    
    getAllFeedback() {
        const stored = localStorage.getItem(this.storageKey);
        return stored ? JSON.parse(stored) : [];
    },
    
    getFeedbackForVideo(videoId) {
        return this.getAllFeedback().filter(f => f.videoId === videoId);
    },
    
    saveFeedback(feedback) {
        const allFeedback = this.getAllFeedback();
        allFeedback.push({
            ...feedback,
            id: Date.now(),
            timestamp: new Date().toISOString()
        });
        localStorage.setItem(this.storageKey, JSON.stringify(allFeedback));
        return true;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('companiesGrid');
    const searchInput = document.getElementById('searchInput');
    const modal = document.getElementById('videoModal');
    const feedbackForm = document.querySelector('.feedback-section');
    const feedbackHistory = document.getElementById('feedbackHistory');
    let currentVideoId = null;
    let currentCompanyName = null;

    function formatDate(dateString) {
        const options = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }

    function updateFeedbackHistory() {
        if (!currentVideoId) return;
        
        const videoFeedback = FeedbackManager.getFeedbackForVideo(currentVideoId);
        feedbackHistory.innerHTML = videoFeedback.length ? 
            videoFeedback.map(feedback => `
                <div class="feedback-item">
                    <p class="feedback-text">${feedback.feedback}</p>
                    <div class="feedback-meta">
                        <span class="feedback-date">${formatDate(feedback.timestamp)}</span>
                        <span class="feedback-id">ID: ${feedback.videoId}</span>
                    </div>
                </div>
            `).join('') :
            '<p class="no-feedback">No feedback yet for this commercial.</p>';
    }

    function showFeedbackMessage(message, isError = false) {
        const existingMessage = feedbackForm.querySelector('.feedback-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageElement = document.createElement('div');
        messageElement.className = `feedback-message ${isError ? 'error' : 'success'}`;
        messageElement.textContent = message;

        const formContainer = feedbackForm.querySelector('.feedback-form');
        formContainer.insertBefore(messageElement, formContainer.firstChild);

        if (!isError) {
            setTimeout(() => {
                messageElement.remove();
                updateFeedbackHistory();
            }, 2000);
        }
    }

    function validateFeedback(feedback) {
        if (!feedback.trim()) {
            return 'Please enter your feedback before submitting.';
        }
        if (feedback.length < 10) {
            return 'Please provide more detailed feedback (minimum 10 characters).';
        }
        if (feedback.length > 1000) {
            return 'Feedback is too long (maximum 1000 characters).';
        }
        return null;
    }

    function handleFeedbackSubmission(feedback) {
        const validationError = validateFeedback(feedback);
        if (validationError) {
            showFeedbackMessage(validationError, true);
            return false;
        }

        try {
            FeedbackManager.saveFeedback({
                videoId: currentVideoId,
                companyName: currentCompanyName,
                feedback: feedback,
                fullName: 'John Doe',
                email: 'hdsowda@uark.edu',
                phone: '(555) 123-4567'
            });
            showFeedbackMessage(`Thank you for your feedback! Reference ID: ${currentVideoId}`);
            document.getElementById('feedbackInput').value = '';
            hideConfirmationButtons();
            return true;
        } catch (error) {
            console.error('Error saving feedback:', error);
            showFeedbackMessage('Unable to save feedback. Please try again.', true);
            return false;
        }
    }

    function showConfirmationButtons() {
        const buttonGroup = feedbackForm.querySelector('.button-group');
        const submitBtn = buttonGroup.querySelector('.submit-btn');
        const confirmBtn = buttonGroup.querySelector('.confirm-btn');
        const cancelBtn = buttonGroup.querySelector('.cancel-btn');
        
        submitBtn.style.display = 'none';
        confirmBtn.style.display = 'inline-flex';
        cancelBtn.style.display = 'inline-flex';
    }

    function hideConfirmationButtons() {
        const buttonGroup = feedbackForm.querySelector('.button-group');
        const submitBtn = buttonGroup.querySelector('.submit-btn');
        const confirmBtn = buttonGroup.querySelector('.confirm-btn');
        const cancelBtn = buttonGroup.querySelector('.cancel-btn');
        
        submitBtn.style.display = 'inline-flex';
        confirmBtn.style.display = 'none';
        cancelBtn.style.display = 'none';
    }

    function renderCompanies(searchTerm = '') {
        const filtered = companies.filter(company => 
            company.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        grid.innerHTML = filtered.map(company => `
            <div class="company-card">
                <h3>${company.name}</h3>
                <div class="company-thumbnail">
                    <img src="https://img.youtube.com/vi/${company.videoId}/maxresdefault.jpg" 
                         alt="${company.name} commercial thumbnail"
                         loading="lazy">
                </div>
                <button class="watch-btn" data-video="${company.videoId}" data-company="${company.name}">
                    Watch Commercial
                </button>
            </div>
        `).join('');
    }

    function openVideoModal(videoId, companyName) {
        currentVideoId = videoId;
        currentCompanyName = companyName;
        document.body.classList.add('modal-open');
        modal.style.display = 'flex';
        modal.offsetHeight;
        modal.classList.add('active');
        
        const feedbackInput = document.getElementById('feedbackInput');
        feedbackInput.value = '';
        feedbackInput.focus();
        
        document.getElementById('currentVideoId').textContent = videoId;
        
        updateFeedbackHistory();
        hideConfirmationButtons();
        
        const existingMessage = feedbackForm.querySelector('.feedback-message');
        if (existingMessage) {
            existingMessage.remove();
        }
    }

    function closeVideoModal() {
        modal.classList.remove('active');
        document.body.classList.remove('modal-open');
        setTimeout(() => {
            modal.style.display = 'none';
            currentVideoId = null;
            currentCompanyName = null;
            feedbackHistory.innerHTML = '';
            hideConfirmationButtons();
        }, 300);
    }

    // Event Listeners
    searchInput.addEventListener('input', (e) => {
        renderCompanies(e.target.value);
    });

    grid.addEventListener('click', (e) => {
        if (e.target.classList.contains('watch-btn')) {
            const videoId = e.target.dataset.video;
            const companyName = e.target.dataset.company;
            window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
            openVideoModal(videoId, companyName);
        }
    });

    document.querySelector('.close-btn').addEventListener('click', (e) => {
        e.preventDefault();
        closeVideoModal();
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeVideoModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeVideoModal();
        }
    });

    document.querySelector('.submit-btn').addEventListener('click', () => {
        const feedbackInput = document.getElementById('feedbackInput');
        const validationError = validateFeedback(feedbackInput.value);
        if (validationError) {
            showFeedbackMessage(validationError, true);
        } else {
            showConfirmationButtons();
        }
    });

    document.querySelector('.confirm-btn').addEventListener('click', () => {
        const feedbackInput = document.getElementById('feedbackInput');
        handleFeedbackSubmission(feedbackInput.value);
    });

    document.querySelector('.cancel-btn').addEventListener('click', () => {
        hideConfirmationButtons();
    });

    document.getElementById('feedbackInput').addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            document.querySelector('.submit-btn').click();
        }
    });

    // Initial render
    renderCompanies();
});