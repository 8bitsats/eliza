from flask import Flask, request, jsonify, render_template
import os
from openai import OpenAI

app = Flask(__name__)

# Initialize xAI API client
XAI_API_KEY = os.getenv("XAI_API_KEY")
if not XAI_API_KEY:
    raise ValueError("XAI_API_KEY not found in environment variables")

client = OpenAI(
    api_key=XAI_API_KEY,
    base_url="https://api.x.ai/v1",
)

# Serve the front-end interface
@app.route('/')
def index():
    return render_template('index.html')

# Chat endpoint for hedge fund management
@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    messages = data.get('messages')

    if not messages:
        return jsonify({'error': 'No messages provided'}), 400

    try:
        completion = client.chat.completions.create(
            model="grok-2-latest",
            messages=messages,
        )
        response = completion.choices[0].message.content
        return jsonify({'response': response})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Image analysis endpoint for chart analysis
@app.route('/analyze_image', methods=['POST'])
def analyze_image():
    data = request.get_json()
    image_base64 = data.get('image_base64')
    text_prompt = data.get('text_prompt', 'Analyze this financial chart and provide insights.')

    if not image_base64:
        return jsonify({'error': 'Image is required'}), 400

    try:
        messages = [
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{image_base64}",
                            "detail": "high",
                        },
                    },
                    {
                        "type": "text",
                        "text": text_prompt,
                    },
                ],
            },
        ]
        completion = client.chat.completions.create(
            model="grok-2-vision-latest",
            messages=messages,
        )
        response = completion.choices[0].message.content
        return jsonify({'response': response})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Image generation endpoint for art or visualizations
@app.route('/generate_image', methods=['POST'])
def generate_image():
    data = request.get_json()
    prompt = data.get('prompt', 'Generate a chart representing hedge fund performance.')

    if not prompt:
        return jsonify({'error': 'Prompt is required'}), 400

    try:
        response = client.images.generate(
            model="grok-2-image",
            prompt=prompt,
            n=1,
            response_format="url"
        )
        image_url = response.data[0].url
        return jsonify({'image_url': image_url})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
