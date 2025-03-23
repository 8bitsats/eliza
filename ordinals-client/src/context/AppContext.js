import React, { createContext, useContext, useState, useEffect } from 'react';
import elizaService from '../services/ElizaService';
import ordinalsService from '../services/OrdinalsService';

// Create the context
const AppContext = createContext();

// Custom hook to use the app context
export const useAppContext = () => {
  return useContext(AppContext);
};

// Context provider component
export const AppProvider = ({ children }) => {
  // Connection state
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [apiStatus, setApiStatus] = useState(null);
  
  // Chat state
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Inscription data
  const [inscriptions, setInscriptions] = useState([]);
  const [currentInscription, setCurrentInscription] = useState(null);
  const [rareSatoshis, setRareSatoshis] = useState([]);
  
  // Pagination
  const [pagination, setPagination] = useState({
    limit: 20,
    offset: 0,
    total: 0
  });
  
  // Filters
  const [filters, setFilters] = useState({
    order_by: 'genesis_timestamp',
    order: 'desc'
  });

  // Initialize services and set up event listeners
  useEffect(() => {
    // Set up callbacks for Eliza service
    elizaService.setCallbacks({
      onMessage: (content) => {
        addMessage('agent', content);
      },
      onStatusChange: (status) => {
        setConnectionStatus(status);
      },
      onSystemMessage: (content) => {
        addMessage('system', content);
      },
      onActionResult: (result) => {
        console.log('Action result:', result);
      }
    });

    // Check Ordinals API status
    checkApiStatus();

    // Clean up on unmount
    return () => {
      elizaService.disconnect();
    };
  }, []);

  // Check Ordinals API status
  const checkApiStatus = async () => {
    try {
      const status = await ordinalsService.getApiStatus();
      setApiStatus(status);
      console.log('Ordinals API status:', status);
    } catch (error) {
      console.error('Error checking API status:', error);
      setApiStatus({ status: 'error', error: error.message });
    }
  };

  // Add a message to the chat
  const addMessage = (type, content) => {
    const newMessage = {
      id: Date.now(),
      type, // 'user', 'agent', or 'system'
      content,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, newMessage]);
  };

  // Connect to Eliza
  const connectToEliza = async (url = 'ws://localhost:3002/ws') => {
    setLoading(true);
    
    try {
      await elizaService.connect(url);
      setLoading(false);
    } catch (error) {
      console.error('Error connecting to Eliza:', error);
      addMessage('system', `Connection error: ${error.message}`);
      setLoading(false);
    }
  };

  // Disconnect from Eliza
  const disconnectFromEliza = () => {
    elizaService.disconnect();
  };

  // Send a message to Eliza
  const sendMessage = (text) => {
    if (!text.trim()) return;
    
    // Add user message to the chat
    addMessage('user', text);
    
    try {
      elizaService.sendMessage(text);
    } catch (error) {
      console.error('Error sending message:', error);
      addMessage('system', `Error sending message: ${error.message}`);
    }
  };

  // Send an action to Eliza
  const sendAction = (action, params = {}) => {
    try {
      elizaService.sendAction(action, params);
      addMessage('system', `Executing action: ${action}`);
    } catch (error) {
      console.error('Error sending action:', error);
      addMessage('system', `Error sending action: ${error.message}`);
    }
  };

  // Fetch recent inscriptions
  const fetchInscriptions = async (options = {}) => {
    setLoading(true);
    
    try {
      const fetchOptions = { ...filters, ...pagination, ...options };
      const result = await ordinalsService.getInscriptions(fetchOptions);
      
      setInscriptions(result.results);
      setPagination({
        limit: result.limit,
        offset: result.offset,
        total: result.total
      });
      
      setLoading(false);
      return result;
    } catch (error) {
      console.error('Error fetching inscriptions:', error);
      addMessage('system', `Error fetching inscriptions: ${error.message}`);
      setLoading(false);
      throw error;
    }
  };

  // Fetch a single inscription
  const fetchInscription = async (id) => {
    setLoading(true);
    
    try {
      const result = await ordinalsService.getInscription(id);
      setCurrentInscription(result);
      setLoading(false);
      return result;
    } catch (error) {
      console.error(`Error fetching inscription ${id}:`, error);
      addMessage('system', `Error fetching inscription: ${error.message}`);
      setLoading(false);
      throw error;
    }
  };

  // Fetch inscription content
  const fetchInscriptionContent = async (id) => {
    setLoading(true);
    
    try {
      const result = await ordinalsService.getInscriptionContent(id);
      setLoading(false);
      return result;
    } catch (error) {
      console.error(`Error fetching inscription content ${id}:`, error);
      addMessage('system', `Error fetching inscription content: ${error.message}`);
      setLoading(false);
      throw error;
    }
  };

  // Find rare satoshis
  const findRareSatoshis = async (rarity, limit = 10) => {
    setLoading(true);
    
    try {
      const result = await ordinalsService.findRareSatoshis(rarity, limit);
      setRareSatoshis(result.results);
      setLoading(false);
      return result;
    } catch (error) {
      console.error(`Error finding rare satoshis with rarity ${rarity}:`, error);
      addMessage('system', `Error finding rare satoshis: ${error.message}`);
      setLoading(false);
      throw error;
    }
  };

  // Handle pagination
  const handlePagination = (newOffset) => {
    setPagination(prev => ({
      ...prev,
      offset: newOffset
    }));
    
    fetchInscriptions({ offset: newOffset });
  };

  // Handle filtering
  const handleFilters = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
    
    // Reset pagination when filters change
    setPagination(prev => ({
      ...prev,
      offset: 0
    }));
    
    fetchInscriptions({ ...newFilters, offset: 0 });
  };

  // Format bytes helper
  const formatBytes = (bytes, decimals = 2) => {
    return ordinalsService.formatBytes(bytes, decimals);
  };

  // Value object to be provided by the context
  const value = {
    // State
    connectionStatus,
    apiStatus,
    messages,
    loading,
    inscriptions,
    currentInscription,
    rareSatoshis,
    pagination,
    filters,
    
    // Methods
    connectToEliza,
    disconnectFromEliza,
    sendMessage,
    sendAction,
    fetchInscriptions,
    fetchInscription,
    fetchInscriptionContent,
    findRareSatoshis,
    handlePagination,
    handleFilters,
    formatBytes
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
