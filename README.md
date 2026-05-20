# AI Study Platform

## Quick Start

### Prerequisites

- **Docker Desktop** - [Download here](https://www.docker.com/products/docker-desktop/)
  - Click Download Docker Desktop -> choose installer depending on your OS and processor
  - (Windows laptops most commonly have AMD or Intel processors -> choose the AMD64 installer)

### Setup

1. **Clone or download this repository**

   - Navigate to your preferred command prompt location
   - Find the repository url from this git repo, click green "code" button -> choose "https" -> copy the url 

   ```bash
   git clone <repository-url> 
   cd RMEP_studyProject_InteractiveAI
   ```
   - Alternatively download as zip and unzip the project

2. **Set up config and data files**
   - Run the following in your terminal:
   ```bash
   # Mac / Linux
   cp study.config.example.yml study.config.yml
   ```
   - OR create a file "study.config.yml" in the root of the repository and copy "study.config.example.yml" to it manually. Then:
   - Open `study.config.yml` in any text editor
   - Add your OpenAI API key 
   - Customize other settings as needed (see Configuration section below)

4. **Start the application**
   - Open Docker Desktop app on your computer
   - Navigate to this project's root in command prompt and run:
     
   ```bash
   docker-compose up
   ```

5. **Access the study**
   - After the app is up and running, open your browser to http://localhost:5173
   - The study interface will load automatically

6. **Stop the application**
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

Task files use a markdown-based format. See `customizations/tasks/ai_tasks.md` for a full working example.

```markdown
# Page Title

> Paragraph text shown to the participant.
> Use > for all displayed text.

> Pick one:

    $option; Choice A; Choice B; Choice C

> Rate on a scale:

    $slider; 0; 100; Low label; High label

> How much do you agree?

    $likert; 1; 7; Strongly disagree; Strongly agree

> How many?

    $number

> Describe your experience:

    $text

> Any additional comments?

    $textarea

# Next Page

> Content for the next page starts here.

%% RANDOMIZE

# Randomized Page 1

> This page and the ones below will appear in random order.

# Randomized Page 2

> Until the closing %% marker.

%%
```

**Key syntax:**
- `#` starts a new page (with optional title)
- `##` creates a section heading within a page
- `> text` displays paragraph text to the participant
- `$option; A; B; C` creates radio buttons (semicolon-separated choices)
- `$slider; min; max; lowLabel; highLabel` creates a slider
- `$likert; min; max; lowLabel; highLabel` creates a Likert scale
- `$number` creates a number input
- `$text` creates a single-line text input
- `$textarea` creates a multi-line text area
- `%% RANDOMIZE` ... `%%` randomizes the pages inside the block
- Question inputs must be indented with 4 spaces

## Configuration Reference

### study.config.yml

```yaml
# API Settings
openai_api_key: sk-YOUR_KEY_HERE  # Required: Your OpenAI API key
gpt_model: gpt-4-turbo            # Model to use
gpt_max_tokens: 1000               # Max response length

# Study Settings
condition: ai                      # 'ai' or 'no-ai'
system_prompt: You are a helpful logical reasoning assistant          # system prompt behavior instructions

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

### "Port 5173 (or 5001) is already in use"
- Another application or a previous Docker session is using this port
- Find and kill the process occupying the port:
  ```bash
  # Mac / Linux
  lsof -i :5001
  kill -9 <PID>

  # Windows (Command Prompt / PowerShell, run as Administrator)
  netstat -ano | findstr :5001
  taskkill /PID <PID> /F
  ```
- Or stop any running Docker containers first: `docker-compose down`

### "API key is not set"
- Open `study.config.yml` and set your OpenAI API key
- Make sure you've saved the file after editing

### Changes not appearing
- Most changes hot-reload automatically
- If not, restart with: `docker-compose down` then `docker-compose up`
- For changes to `study.config.yml`, restart is always required

### "Cannot connect to backend" or "Failed to save data"
- Check that both containers are running: `docker-compose ps`
- Backend should be at http://localhost:5001
- Frontend should be at http://localhost:5173
- If accessing from another device on the network, open port 5001 in Windows Firewall (run as Administrator):
  ```powershell
  netsh advfirewall firewall add rule name="AI Study Backend" dir=in action=allow protocol=TCP localport=5001
  ```

### OpenAI API errors
- Check your API key is correct in `study.config.yml`
- Check the model name is correct (e.g., 'gpt-4-turbo')

## Running Without Docker

If you prefer not to use Docker:

1. **Install dependencies**
   - Python 3.10 or higher
   - Node.js 18 or higher

2. **Copy task files to frontend**
   ```bash
   cp customizations/tasks/*.md interface-frontend/public/
   cp -r customizations/tasks/examples interface-frontend/public/
   ```

3. **Backend setup**
   ```bash
   cd interface-backend
   pip install -r requirements.txt
   flask run
   ```

4. **Frontend setup** (in a new terminal)
   - Create `interface-frontend/.env` with the values from `study.config.yml`:
     ```
     VITE_PROXY_URL=http://localhost:5001
     VITE_PCTP_CONDITION=ai
     VITE_CHAT_ENABLED_BEGIN=1
     VITE_CHAT_ENABLED_END=99
     VITE_ALLOW_IMAGES=false
     VITE_ATTN_CHECK_PAGE=1
     VITE_ATTN_CHECK_RES=Logical reasoning,The best choice
     VITE_DEV_MODE=true
     VITE_SYSTEM_PROMPT=You are a helpful logical reasoning assistant.
     ```
   - Then run:
     ```bash
     cd interface-frontend
     npm install
     npm run dev
     ```

5. **Access the study**
   - Open browser to http://localhost:5173

Note: You'll need **two terminals** running simultaneously (one for backend, one for frontend).

## Project Structure

```
AI_study/
├── study.config.example.yml      # Config template (copy to study.config.yml)
├── study.config.yml              # Your configuration (created during setup, gitignored)
├── study_data.json               # Collected participant data (created during setup, gitignored)
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
