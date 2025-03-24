import base64
import os
import json
from openai import OpenAI
from langchain_core.messages import HumanMessage
from graph.state import AgentState
from utils.progress import progress

client = OpenAI(api_key=os.getenv("XAI_API_KEY"), base_url="https://api.x.ai/v1")

def image_analysis_agent(state: AgentState):
    """Analyzes chart images and generates trading signals."""
    data = state["data"]
    tickers = data["tickers"]
    image_analysis = {}

    for ticker in tickers:
        progress.update_status("image_analysis_agent", ticker, "Analyzing chart image")
        # Assume chart images are provided in state["data"]["images"][ticker]
        image_path = data.get("images", {}).get(ticker)
        if not image_path:
            continue

        with open(image_path, "rb") as image_file:
            base64_image = base64.b64encode(image_file.read()).decode("utf-8")

        messages = [
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/jpeg;base64,{base64_image}", "detail": "high"},
                    },
                    {
                        "type": "text",
                        "text": "Analyze this stock chart and provide a trading signal (bullish, bearish, or neutral) with a confidence level (0-100). Explain your reasoning."
                    },
                ],
            }
        ]

        completion = client.chat.completions.create(
            model="grok-2-vision-latest",
            messages=messages,
            temperature=0.01,
        )

        response = completion.choices[0].message.content
        # Parse response (assuming it contains signal, confidence, and reasoning)
        # Example response: "Signal: bullish, Confidence: 85%, Reasoning: Uptrend with high volume."
        try:
            signal_data = json.loads(response) if response.startswith("{") else {
                "signal": "neutral",
                "confidence": 50,
                "reasoning": response
            }
        except json.JSONDecodeError:
            signal_data = {
                "signal": "neutral",
                "confidence": 50,
                "reasoning": response
            }

        image_analysis[ticker] = signal_data
        progress.update_status("image_analysis_agent", ticker, "Done")

    message = HumanMessage(content=json.dumps(image_analysis), name="image_analysis_agent")
    state["data"]["analyst_signals"]["image_analysis_agent"] = image_analysis
    return {"messages": [message], "data": state["data"]}
