// Test script for Ord GPT Memory System

async function testMemorySystem() {
  console.log('Testing Ord GPT Memory System...');
  
  try {
    // Dynamically import the memory handler
    const ordMemoryModule = await import('./ord_memory_handler.js');
    const ordMemory = ordMemoryModule.default;
    
    // Set a test user ID
    const userId = 'test_user_' + Date.now();
    ordMemory.setUserId(userId);
    console.log(`Using test user ID: ${userId}`);
    
    // Test processing a message
    console.log('\nTesting message processing...');
    const message = 'Tell me about Bitcoin Ordinals';
    console.log(`User message: "${message}"`);
    
    const context = await ordMemory.processMessage(message);
    console.log('Generated context:');
    console.log(JSON.stringify(context, null, 2));
    
    // Test recording a response
    console.log('\nTesting response recording...');
    const response = 'Bitcoin Ordinals are a way to assign unique identifiers to individual satoshis on the Bitcoin blockchain.';
    console.log(`Agent response: "${response}"`);
    
    const newFacts = ['Bitcoin has 100 million satoshis per coin'];
    const newKnowledge = ['Ordinal inscriptions became popular in early 2023'];
    
    const recordSuccess = await ordMemory.recordResponse(response, newFacts, newKnowledge);
    console.log(`Response recorded successfully: ${recordSuccess}`);
    
    // Test user preferences
    console.log('\nTesting user preferences...');
    await ordMemory.recordUserPreference('favorite_topic', 'rare_satoshis');
    await ordMemory.recordUserPreference('preferred_network', 'mainnet');
    
    const preferences = await ordMemory.getUserPreferences();
    console.log('User preferences:');
    console.log(JSON.stringify(preferences, null, 2));
    
    // Test follow-up message
    console.log('\nTesting follow-up message...');
    const followUpMessage = 'What are rare satoshis?';
    console.log(`User follow-up: "${followUpMessage}"`);
    
    const updatedContext = await ordMemory.processMessage(followUpMessage);
    console.log('Updated context:');
    console.log(JSON.stringify(updatedContext, null, 2));
    
    console.log('\nMemory system test completed successfully!');
  } catch (error) {
    console.error('Error during memory system test:', error);
  }
}

// Run the test
testMemorySystem();
