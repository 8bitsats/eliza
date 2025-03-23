import sys
import json
from agent_memory import process_message

user_id = "test_user_1742690565421"
message = "What are rare satoshis?"

context = process_message(user_id, message)
print(json.dumps(context))
