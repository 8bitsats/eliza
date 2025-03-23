// Ord GPT Memory Handler
// This module integrates with the Python AgentMemory system

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get the directory name for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class OrdMemoryHandler {
  constructor() {
    this.pythonPath = 'python3'; // Adjust if your Python executable is different
    this.scriptDir = path.join(__dirname);
    this.userId = 'default_user'; // Default user ID
  }

  /**
   * Set the current user ID
   * @param {string} userId - The user ID to set
   */
  setUserId(userId) {
    this.userId = userId || 'default_user';
  }

  /**
   * Run a Python script and return the result
   * @param {string} scriptName - The name of the Python script to run
   * @param {Array} args - Arguments to pass to the script
   * @returns {Promise<any>} - The result of the script execution
   */
  async runPythonScript(scriptName, args = []) {
    return new Promise((resolve, reject) => {
      const scriptPath = path.join(this.scriptDir, scriptName);
      const process = spawn(this.pythonPath, [scriptPath, ...args]);
      
      let stdout = '';
      let stderr = '';
      
      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      process.on('close', (code) => {
        if (code !== 0) {
          console.error(`Python script execution failed with code ${code}`);
          console.error(`Error: ${stderr}`);
          reject(new Error(`Script execution failed: ${stderr}`));
        } else {
          try {
            const result = JSON.parse(stdout);
            resolve(result);
          } catch (error) {
            console.warn('Could not parse Python output as JSON, returning raw output');
            resolve(stdout);
          }
        }
      });
    });
  }

  /**
   * Process a user message and get context for the agent
   * @param {string} message - The user's message
   * @returns {Promise<object>} - Context object with conversation history and relevant knowledge
   */
  async processMessage(message) {
    try {
      // Create a temporary script to call the Python function
      const tempScriptPath = path.join(this.scriptDir, 'temp_process_message.py');
      
      // Note: No indentation in the Python code
      const scriptContent = `import sys
import json
from agent_memory import process_message

user_id = "${this.userId}"
message = "${message.replace(/"/g, '\\"')}"

context = process_message(user_id, message)
print(json.dumps(context))
`;
      
      fs.writeFileSync(tempScriptPath, scriptContent);
      
      const result = await this.runPythonScript('temp_process_message.py');
      
      // Clean up the temporary script
      fs.unlinkSync(tempScriptPath);
      
      return result;
    } catch (error) {
      console.error('Error processing message:', error);
      // Return minimal context if there's an error
      return {
        conversation_history: [],
        relevant_bitcoin_facts: [],
        relevant_ordinals_knowledge: [],
        user_preferences: {},
        error: error.message
      };
    }
  }

  /**
   * Record the agent's response and any new knowledge
   * @param {string} response - The agent's response
   * @param {Array} newFacts - Optional array of new Bitcoin facts learned
   * @param {Array} newKnowledge - Optional array of new Ordinals knowledge learned
   * @returns {Promise<boolean>} - Success status
   */
  async recordResponse(response, newFacts = [], newKnowledge = []) {
    try {
      // Create a temporary script to call the Python function
      const tempScriptPath = path.join(this.scriptDir, 'temp_record_response.py');
      
      // Note: No indentation in the Python code
      const scriptContent = `import sys
import json
from agent_memory import record_response

user_id = "${this.userId}"
response = "${response.replace(/"/g, '\\"')}"
new_facts = ${JSON.stringify(newFacts).replace(/"/g, '\\"')}
new_knowledge = ${JSON.stringify(newKnowledge).replace(/"/g, '\\"')}

record_response(user_id, response, new_facts, new_knowledge)
print(json.dumps({"success": True}))
`;
      
      fs.writeFileSync(tempScriptPath, scriptContent);
      
      await this.runPythonScript('temp_record_response.py');
      
      // Clean up the temporary script
      fs.unlinkSync(tempScriptPath);
      
      return true;
    } catch (error) {
      console.error('Error recording response:', error);
      return false;
    }
  }

  /**
   * Record a user preference
   * @param {string} preferenceType - The type of preference
   * @param {any} preferenceValue - The value of the preference
   * @returns {Promise<boolean>} - Success status
   */
  async recordUserPreference(preferenceType, preferenceValue) {
    try {
      // Create a temporary script to call the Python function
      const tempScriptPath = path.join(this.scriptDir, 'temp_record_preference.py');
      
      // Note: No indentation in the Python code
      const scriptContent = `import sys
import json
from agent_memory import record_user_preference

user_id = "${this.userId}"
preference_type = "${preferenceType.replace(/"/g, '\\"')}"
preference_value = "${preferenceValue.toString().replace(/"/g, '\\"')}"

record_user_preference(user_id, preference_type, preference_value)
print(json.dumps({"success": True}))
`;
      
      fs.writeFileSync(tempScriptPath, scriptContent);
      
      await this.runPythonScript('temp_record_preference.py');
      
      // Clean up the temporary script
      fs.unlinkSync(tempScriptPath);
      
      return true;
    } catch (error) {
      console.error('Error recording user preference:', error);
      return false;
    }
  }

  /**
   * Get all user preferences
   * @returns {Promise<object>} - Object containing user preferences
   */
  async getUserPreferences() {
    try {
      // Create a temporary script to call the Python function
      const tempScriptPath = path.join(this.scriptDir, 'temp_get_preferences.py');
      
      // Note: No indentation in the Python code
      const scriptContent = `import sys
import json
from agent_memory import get_user_preferences

user_id = "${this.userId}"
preferences = get_user_preferences(user_id)
print(json.dumps(preferences))
`;
      
      fs.writeFileSync(tempScriptPath, scriptContent);
      
      const result = await this.runPythonScript('temp_get_preferences.py');
      
      // Clean up the temporary script
      fs.unlinkSync(tempScriptPath);
      
      return result;
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return {};
    }
  }
}

// Create a singleton instance
const ordMemoryHandler = new OrdMemoryHandler();

// Export as default for ES modules
export default ordMemoryHandler;
