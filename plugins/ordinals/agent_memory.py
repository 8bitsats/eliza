# Agent Memory integration for Ord GPT

import os
import json
from datetime import datetime
from agentmemory import (
    create_memory,
    create_unique_memory,
    get_memories,
    search_memory,
    get_memory,
    update_memory,
    delete_memory,
    count_memories,
    wipe_category,
    reset_epoch,
    increment_epoch,
    get_epoch,
    create_event
)

# Enable debugging
os.environ["DEBUG"] = "True"

# Categories for Ord GPT's memory
CATEGORY_CONVERSATIONS = "ord_conversations"
CATEGORY_BITCOIN_FACTS = "bitcoin_facts"
CATEGORY_ORDINALS_KNOWLEDGE = "ordinals_knowledge"
CATEGORY_USER_PREFERENCES = "user_preferences"

# Initialize memory system
def initialize_memory():
    """Initialize the memory system for Ord GPT"""
    print("Initializing Ord GPT memory system...")
    # Reset the epoch counter
    reset_epoch()
    print(f"Memory system initialized. Current epoch: {get_epoch()}")
    
    # Check if we have any existing memories
    conversation_count = count_memories(CATEGORY_CONVERSATIONS)
    facts_count = count_memories(CATEGORY_BITCOIN_FACTS)
    ordinals_count = count_memories(CATEGORY_ORDINALS_KNOWLEDGE)
    preferences_count = count_memories(CATEGORY_USER_PREFERENCES)
    
    print(f"Found {conversation_count} conversation memories")
    print(f"Found {facts_count} Bitcoin fact memories")
    print(f"Found {ordinals_count} Ordinals knowledge memories")
    print(f"Found {preferences_count} user preference memories")
    
    # If no memories exist, seed with some initial knowledge
    if ordinals_count == 0:
        seed_initial_knowledge()

# Seed the memory with initial Bitcoin and Ordinals knowledge
def seed_initial_knowledge():
    """Seed the memory with initial Bitcoin and Ordinals knowledge"""
    print("Seeding initial knowledge...")
    
    # Bitcoin facts
    bitcoin_facts = [
        "Bitcoin was created by Satoshi Nakamoto in 2009.",
        "Bitcoin has a maximum supply of 21 million coins.",
        "Bitcoin uses a proof-of-work consensus mechanism.",
        "Bitcoin blocks are mined approximately every 10 minutes.",
        "The smallest unit of Bitcoin is called a satoshi, equal to 0.00000001 BTC."
    ]
    
    # Ordinals knowledge
    ordinals_knowledge = [
        "Ordinals are a way to assign unique identifiers to individual satoshis in Bitcoin.",
        "Ordinals allow for the creation of digital artifacts on Bitcoin through inscriptions.",
        "Ordinal theory was developed by Casey Rodarmor.",
        "Ordinal inscriptions store data directly on the Bitcoin blockchain.",
        "Rare satoshis include those from the genesis block and block reward halving events."
    ]
    
    # Store Bitcoin facts
    for fact in bitcoin_facts:
        create_memory(CATEGORY_BITCOIN_FACTS, fact, metadata={
            "timestamp": datetime.now().isoformat(),
            "source": "initial_seeding"
        })
    
    # Store Ordinals knowledge
    for knowledge in ordinals_knowledge:
        create_memory(CATEGORY_ORDINALS_KNOWLEDGE, knowledge, metadata={
            "timestamp": datetime.now().isoformat(),
            "source": "initial_seeding"
        })
    
    print(f"Seeded {len(bitcoin_facts)} Bitcoin facts and {len(ordinals_knowledge)} Ordinals knowledge items")

# Record a user message
def record_user_message(user_id, message):
    """Record a message from a user"""
    create_memory(CATEGORY_CONVERSATIONS, message, metadata={
        "timestamp": datetime.now().isoformat(),
        "user_id": user_id,
        "speaker": "user",
        "epoch": get_epoch()
    })
    create_event(f"User {user_id} said: {message}", metadata={
        "user_id": user_id,
        "message_type": "user_message"
    })

# Record Ord GPT's response
def record_agent_response(user_id, message):
    """Record a response from Ord GPT"""
    create_memory(CATEGORY_CONVERSATIONS, message, metadata={
        "timestamp": datetime.now().isoformat(),
        "user_id": user_id,
        "speaker": "ord_gpt",
        "epoch": get_epoch()
    })
    create_event(f"Ord GPT responded to {user_id}: {message[:50]}...", metadata={
        "user_id": user_id,
        "message_type": "agent_response"
    })

# Record a new Bitcoin fact learned during conversation
def record_bitcoin_fact(fact, source="conversation"):
    """Record a new Bitcoin fact learned during conversation"""
    create_unique_memory(CATEGORY_BITCOIN_FACTS, fact, metadata={
        "timestamp": datetime.now().isoformat(),
        "source": source,
        "epoch": get_epoch()
    }, similarity=0.85)

# Record a new piece of Ordinals knowledge
def record_ordinals_knowledge(knowledge, source="conversation"):
    """Record a new piece of Ordinals knowledge"""
    create_unique_memory(CATEGORY_ORDINALS_KNOWLEDGE, knowledge, metadata={
        "timestamp": datetime.now().isoformat(),
        "source": source,
        "epoch": get_epoch()
    }, similarity=0.85)

# Record user preferences
def record_user_preference(user_id, preference_type, preference_value):
    """Record a user preference"""
    # Check if preference already exists
    existing_prefs = search_memory(CATEGORY_USER_PREFERENCES, preference_type, 
                                 filter_metadata={"user_id": user_id})
    
    if existing_prefs:
        # Update existing preference
        update_memory(CATEGORY_USER_PREFERENCES, existing_prefs[0]["id"], 
                     metadata={"value": preference_value, 
                              "timestamp": datetime.now().isoformat()})
    else:
        # Create new preference
        create_memory(CATEGORY_USER_PREFERENCES, preference_type, metadata={
            "user_id": user_id,
            "value": preference_value,
            "timestamp": datetime.now().isoformat()
        })

# Get conversation history for a user
def get_conversation_history(user_id, limit=10):
    """Get conversation history for a user"""
    memories = get_memories(CATEGORY_CONVERSATIONS, 
                          filter_metadata={"user_id": user_id},
                          n_results=limit,
                          sort_order="desc")
    
    # Format into a readable conversation
    conversation = []
    for memory in reversed(memories):  # Reverse to get chronological order
        speaker = memory["metadata"].get("speaker", "unknown")
        text = memory["document"]
        conversation.append({"speaker": speaker, "text": text})
    
    return conversation

# Search for relevant Bitcoin facts
def search_bitcoin_facts(query, limit=5):
    """Search for relevant Bitcoin facts"""
    return search_memory(CATEGORY_BITCOIN_FACTS, query, n_results=limit)

# Search for relevant Ordinals knowledge
def search_ordinals_knowledge(query, limit=5):
    """Search for relevant Ordinals knowledge"""
    return search_memory(CATEGORY_ORDINALS_KNOWLEDGE, query, n_results=limit)

# Get user preferences
def get_user_preferences(user_id):
    """Get all preferences for a user"""
    memories = get_memories(CATEGORY_USER_PREFERENCES, 
                          filter_metadata={"user_id": user_id},
                          n_results=100)
    
    preferences = {}
    for memory in memories:
        pref_type = memory["document"]
        pref_value = memory["metadata"].get("value")
        preferences[pref_type] = pref_value
    
    return preferences

# Generate context for Ord GPT based on the current conversation
def generate_context(user_id, current_message):
    """Generate context for Ord GPT based on conversation and knowledge"""
    # Start a new conversation epoch if this is a new conversation
    increment_epoch()
    
    # Record the user message
    record_user_message(user_id, current_message)
    
    # Get conversation history
    conversation_history = get_conversation_history(user_id, limit=5)
    
    # Search for relevant knowledge based on the current message
    bitcoin_facts = search_bitcoin_facts(current_message, limit=3)
    ordinals_knowledge = search_ordinals_knowledge(current_message, limit=3)
    
    # Get user preferences
    user_prefs = get_user_preferences(user_id)
    
    # Compile all context
    context = {
        "conversation_history": conversation_history,
        "relevant_bitcoin_facts": [fact["document"] for fact in bitcoin_facts],
        "relevant_ordinals_knowledge": [knowledge["document"] for knowledge in ordinals_knowledge],
        "user_preferences": user_prefs,
        "current_epoch": get_epoch()
    }
    
    return context

# Main function to process a message and return a response with context
def process_message(user_id, message):
    """Process a message from a user and generate context for Ord GPT"""
    context = generate_context(user_id, message)
    return context

# Function to record Ord GPT's response after generation
def record_response(user_id, response, new_facts=None, new_knowledge=None):
    """Record Ord GPT's response and any new knowledge gained"""
    # Record the agent's response
    record_agent_response(user_id, response)
    
    # Record any new facts or knowledge
    if new_facts:
        for fact in new_facts:
            record_bitcoin_fact(fact)
    
    if new_knowledge:
        for knowledge in new_knowledge:
            record_ordinals_knowledge(knowledge)

# Initialize the memory system when this module is imported
initialize_memory()

# Example usage
if __name__ == "__main__":
    # Test the memory system
    user_id = "test_user_123"
    
    # Process a user message
    context = process_message(user_id, "Tell me about Bitcoin Ordinals")
    print("\nGenerated context:")
    print(json.dumps(context, indent=2))
    
    # Record a simulated response
    response = "Bitcoin Ordinals are a way to assign unique identifiers to individual satoshis."
    record_response(user_id, response)
    
    # Record a user preference
    record_user_preference(user_id, "favorite_topic", "rare_satoshis")
    
    # Get updated context
    context = process_message(user_id, "What are rare satoshis?")
    print("\nUpdated context:")
    print(json.dumps(context, indent=2))
