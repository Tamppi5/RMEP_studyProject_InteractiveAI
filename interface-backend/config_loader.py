import os
import yaml
import sys

def load_config():
    """
    Load and validate the study configuration from study.config.yml
    Returns a dictionary with all configuration values.
    Exits if the config file is missing or if the API key is not set.
    """
    config_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'study.config.yml')

    if not os.path.exists(config_path):
        print(f"ERROR: Configuration file not found at {config_path}")
        print("Please create study.config.yml in the project root directory.")
        sys.exit(1)

    try:
        with open(config_path, 'r', encoding='utf-8') as f:
            config = yaml.safe_load(f)
    except Exception as e:
        print(f"ERROR: Failed to parse study.config.yml: {e}")
        sys.exit(1)

    # Validate required fields
    if not config.get('openai_api_key') or config.get('openai_api_key') == 'sk-YOUR_API_KEY_HERE':
        print("ERROR: OpenAI API key not set in study.config.yml")
        print("Please edit study.config.yml and set your API key in the 'openai_api_key' field.")
        sys.exit(1)

    return config
