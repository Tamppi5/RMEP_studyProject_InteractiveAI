from openai import OpenAI
from config_loader import load_config

config = load_config()
oai_key = config['openai_api_key']
gpt_model = config['gpt_model']
token_limit = int(config['gpt_max_tokens'])

gpt_client = OpenAI(api_key = oai_key)

def get_completion(messages):
    try:
        completion = gpt_client.chat.completions.create(
            model = str(gpt_model),
            messages = [
                {
                    'role': str(m['role']),
                    'content': [
                        { 'type': 'text', 'text': str(m['content']) },
                        { 'type': 'image_url', 'image_url': { 'url': str(m['image']), 'detail': 'low' }}
                    ]
                } 
                if 'image' in m.keys() else 
                {
                    'role': str(m['role']),
                    'content': str(m['content'])
                } 
                for m in messages
            ],
            max_tokens = token_limit
        )

        full_res = completion.model_dump()

        return full_res
    except Exception as e:
        raise RuntimeError('Error while fulfilling GPT request:', str(e))
