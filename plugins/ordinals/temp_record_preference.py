import sys
import json
from agent_memory import record_user_preference

user_id = "test_user_1742690565421"
preference_type = "preferred_network"
preference_value = "mainnet"

record_user_preference(user_id, preference_type, preference_value)
print(json.dumps({"success": True}))
