import sys
import json
from agent_memory import get_user_preferences

user_id = "test_user_1742690565421"
preferences = get_user_preferences(user_id)
print(json.dumps(preferences))
