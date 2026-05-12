# AI Study Platform

A research platform for investigating how students use ChatGPT to solve logical reasoning problems. Developed at Aalto University, Department of Psychology.

## Quick Start

### Prerequisites

- **Docker Desktop** - [Download here](https://www.docker.com/products/docker-desktop/)
  - Windows users: Docker Desktop includes everything you need
  - Mac/Linux users: Install Docker Desktop for your platform

### Setup (5 minutes)

1. **Clone or download this repository**
   ```bash
   git clone <repository-url>
   cd AI_study
   ```

2. **Configure your study**
   - Open `study.config.yml` in any text editor
   - Add your OpenAI API key (get one at https://platform.openai.com/api-keys)
   - Customize other settings as needed (see Configuration section below)

3. **Start the application**
   ```bash
   docker-compose up
   ```

4. **Access the study**
   - Open your browser to http://localhost:5173
   - The study interface will load automatically

5. **Stop the application**
   - Press `Ctrl+C` in the terminal where docker-compose is running
   - Or run: `docker-compose down`

## Customizing Your Study

All customization is done by editing files on your computer. Changes take effect immediately (hot-reload) without rebuilding Docker containers.

| What to Change | File to Edit | Notes |
|----------------|--------------|-------|
| Survey questions & instructions | `customizations/tasks/ai_tasks.md` or `no-ai_tasks.md` | Uses taskParser markdown format (see below) |
| Study info / consent page | `customizations/tasks/*_studyinfo_example.md` | First page participants see |
| Correct answers for scoring | `customizations/correct_answers.py` | Python list of correct answers |
| GPT model (gpt-4o, etc.) | `study.config.yml` → `gpt_model` | Change which OpenAI model to use |
| ChatGPT system prompt | `study.config.yml` → `system_prompt` | Defines ChatGPT behavior |
| Experimental condition | `study.config.yml` → `condition` | Switch between 'ai' and 'no-ai' |
| Which pages show chat | `study.config.yml` → `chat_enabled_from/until_page` | Control chat availability |
| Attention check settings | `study.config.yml` → `attention_check_*` | Configure attention checks |
| Completion code/URL | `study.config.yml` → `completion_code/url` | For Prolific or other platforms |
| UI components (advanced) | `interface-frontend/src/components/` | React components with hot-reload |

### Task File Format

Task files use a simple markdown format with special syntax:

```markdown
# Page Title

This is the page content. Use markdown formatting.

---

# Next Page Title

Content for the next page.

## Question 1
type: radio

- Option A
- Option B
- Option C

## Question 2
type: text

[Participant types their answer here]

## Question 3
type: textarea

[Larger text box for longer responses]

## Question 4
type: checkbox

- [ ] Option 1
- [ ] Option 2
- [ ] Option 3
```

**Key syntax:**
- `---` creates a new page
- `## Question Title` + `type: <radio|text|textarea|checkbox>` creates a question
- List items (`-`) under `type: radio` become radio button options
- `type: text` creates a single-line text input
- `type: textarea` creates a multi-line text area
- `type: checkbox` with `- [ ]` items creates checkboxes

## Configuration Reference

### study.config.yml

```yaml
# API Settings
openai_api_key: sk-YOUR_KEY_HERE  # Required: Your OpenAI API key
gpt_model: gpt-4-turbo            # Model to use
gpt_max_tokens: 1000               # Max response length

# Study Settings
condition: ai                      # 'ai' or 'no-ai'
system_prompt: You are...          # ChatGPT behavior instructions

# Chat Availability
chat_enabled_from_page: 1          # First page with chat (0-indexed)
chat_enabled_until_page: 99        # Last page with chat
allow_image_attachments: false     # Enable image uploads

# Attention Check
attention_check_page: 1            # Page number (-1 to disable)
attention_check_answers: Answer1,Answer2  # Correct answers (comma-separated)

# Development
dev_mode: true                     # Skip participant ID validation

# Completion
completion_code: COMPLETE          # Code shown at end
completion_url: ""                 # Redirect URL (optional)
```

## Viewing Collected Data

Participant data is saved to `study_data.json` in the project root directory. Each entry includes:

- `participantId`: Unique participant identifier
- `condition`: Which condition they were in ('ai' or 'no-ai')
- `tasks`: All their survey responses
- `messages`: Chat conversation history (if applicable)
- `correctAnswers`: Number of correct answers
- `totalQuestions`: Total number of questions
- `answerResults`: Detailed results for each question
- `savedAt`: Timestamp of submission

### Analyzing Data

The JSON file can be:
- Opened in Excel/Google Sheets (import JSON)
- Analyzed with Python pandas: `pd.read_json('study_data.json')`
- Analyzed with R: `jsonlite::fromJSON('study_data.json')`

## Troubleshooting

### "Docker is not running"
- Open Docker Desktop and wait for it to start
- On Windows: Ensure WSL 2 is installed and enabled in Docker Desktop settings

### "Port 5173 is already in use"
- Another application is using this port
- Stop the other application or change the port in `docker-compose.yml`

### "API key is not set"
- Open `study.config.yml` and set your OpenAI API key
- Make sure you've saved the file after editing

### Changes not appearing
- Most changes hot-reload automatically
- If not, restart with: `docker-compose down` then `docker-compose up`
- For changes to `study.config.yml`, restart is always required

### "Cannot connect to backend"
- Check that both containers are running: `docker-compose ps`
- Backend should be at http://localhost:5000
- Frontend should be at http://localhost:5173

### OpenAI API errors
- Check your API key is correct in `study.config.yml`
- Verify you have credits in your OpenAI account
- Check the model name is correct (e.g., 'gpt-4-turbo', not 'gpt4')

## Running Without Docker (Advanced)

If you prefer not to use Docker:

1. **Install dependencies**
   - Python 3.10 or higher
   - Node.js 18 or higher

2. **Backend setup**
   ```bash
   cd interface-backend
   pip install -r requirements.txt
   flask run
   ```

3. **Frontend setup** (in a new terminal)
   ```bash
   cd interface-frontend
   npm install
   npm run dev
   ```

4. **Access the study**
   - Open browser to http://localhost:5173

Note: You'll need **two terminals** running simultaneously (one for backend, one for frontend).

## Project Structure

```
AI_study/
├── study.config.yml              # Main configuration file
├── study_data.json               # Collected participant data
├── docker-compose.yml            # Docker orchestration
├── customizations/               # Student workspace for editing
│   ├── tasks/
│   │   ├── ai_tasks.md          # AI condition task file
│   │   ├── no-ai_tasks.md       # Control condition task file
│   │   ├── ai_studyinfo_example.md
│   │   └── no-ai_studyinfo_example.md
│   └── correct_answers.py        # Answer key for scoring
├── interface-backend/            # Flask backend
│   ├── Dockerfile
│   ├── app.py
│   ├── chat_helpers.py
│   ├── config_loader.py
│   └── requirements.txt
└── interface-frontend/           # React + Vite frontend
    ├── Dockerfile
    ├── entrypoint.sh
    ├── package.json
    ├── vite.config.js
    └── src/
        └── components/
```

## Security Notes

- **Never commit `study.config.yml` to git** - it contains your API key
- The `.gitignore` file is configured to prevent accidental commits
- Keep your OpenAI API key secret
- For production deployment, use environment variables instead of the config file

## Support

For issues or questions:
1. Check the Troubleshooting section above
2. Review the configuration reference
3. Check Docker Desktop is running and up-to-date
4. Verify your OpenAI API key is valid and has credits

## Credits

Developed at Aalto University, Department of Psychology
