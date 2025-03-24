import os
import json
from openai import OpenAI
from graph.state import AgentState
from utils.progress import progress

client = OpenAI(api_key=os.getenv("XAI_API_KEY"), base_url="https://api.x.ai/v1")

def visual_generation_agent(state: AgentState):
    """Generates visuals based on analysis and decisions."""
    data = state["data"]
    tickers = data["tickers"]
    visuals = {}

    for ticker in tickers:
        progress.update_status("visual_generation_agent", ticker, "Generating visual")
        signal = data["analyst_signals"]["portfolio_management_agent"].get(ticker, {}).get("action", "hold")
        prompt = f"Visualize a {signal} market trend for {ticker} in a futuristic Web 3 style"
        
        try:
            response = client.images.generate(
                model="grok-2-image",
                prompt=prompt,
                n=1,
                response_format="url"
            )
            visuals[ticker] = response.data[0].url
        except Exception as e:
            visuals[ticker] = f"Error generating visual: {e}"
        progress.update_status("visual_generation_agent", ticker, "Done")

    state["data"]["visuals"] = visuals
    return {"data": state["data"]}
