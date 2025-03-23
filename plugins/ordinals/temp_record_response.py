import sys
import json
from agent_memory import record_response

user_id = "test_user_1742690565421"
response = "Bitcoin Ordinals are a way to assign unique identifiers to individual satoshis on the Bitcoin blockchain."
new_facts = [\"Bitcoin has 100 million satoshis per coin\"]
new_knowledge = [\"Ordinal inscriptions became popular in early 2023\"]

record_response(user_id, response, new_facts, new_knowledge)
print(json.dumps({"success": True}))
