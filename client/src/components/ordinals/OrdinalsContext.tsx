import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import ordinalsService from '../../lib/ordinals-service';

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

type Message = {
  id: number;
  type: 'user' | 'agent' | 'system';
  content: string;
  timestamp: string;
};

type OrdinalsContextType = {
  connectionStatus: ConnectionStatus;
  apiStatus: any;
  messages: Message[];
  loading: boolean;
  inscriptions: any[];
  currentInscription: any;
  rareSatoshis: any[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
  filters: Record<string, any>;
  connectToOrdinals: (url?: string) => Promise<void>;
  disconnectFromOrdinals: () => void;
  sendMessage: (text: string) => void;
  sendAction: (action: string, params?: Record<string, any>) => void;
  fetchInscriptions: (options?: Record<string, any>) => Promise<any>;
  fetchInscription: (id: string) => Promise<any>;
  fetchInscriptionContent: (id: string) => Promise<any>;
  findRareSatoshis: (rarity: string | string[], limit?: number) => Promise<any>;
  setFilters: (newFilters: Record<string, any>) => void;
};

const OrdinalsContext = createContext<OrdinalsContextType | undefined>(undefined);

export const useOrdinalsContext = () => {
  const context = useContext(OrdinalsContext);
  if (context === undefined) {
    throw new Error('useOrdinalsContext must be used within an OrdinalsProvider');
  }
  return context;
};

export const OrdinalsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Connection state
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [apiStatus, setApiStatus] = useState<any>(null);
  
  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Inscription data
  const [inscriptions, setInscriptions] = useState<any[]>([]);
  const [currentInscription, setCurrentInscription] = useState<any>(null);
  const [rareSatoshis, setRareSatoshis] = useState<any[]>([]);
  
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
    // Set up callbacks for Ordinals service
    ordinalsService.setCallbacks({
      onMessage: (content) => {
        addMessage('agent', content);
      },
      onStatusChange: (status) => {
        setConnectionStatus(status as ConnectionStatus);
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
      ordinalsService.disconnect();
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
      setApiStatus({ status: 'error', error: (error as any).message });
    }
  };

  // Add a message to the chat
  const addMessage = (type: 'user' | 'agent' | 'system', content: string) => {
    const newMessage = {
      id: Date.now(),
      type,
      content,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, newMessage]);
  };

  // Connect to Ordinals
  const connectToOrdinals = async (url: string = 'ws://localhost:3002/ws') => {
    setLoading(true);
    
    try {
      await ordinalsService.connect(url);
      setLoading(false);
    } catch (error) {
      console.error('Error connecting to Ordinals:', error);
      addMessage('system', `Connection error: ${(error as any).message}`);
      setLoading(false);
    }
  };

  // Disconnect from Ordinals
  const disconnectFromOrdinals = () => {
    ordinalsService.disconnect();
  };

  // Send a message to Ordinals
  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    
    // Add user message to the chat
    addMessage('user', text);
    
    try {
      ordinalsService.sendMessage(text);
    } catch (error) {
      console.error('Error sending message:', error);
      addMessage('system', `Error sending message: ${(error as any).message}`);
    }
  };

  // Send an action to Ordinals
  const sendAction = (action: string, params: Record<string, any> = {}) => {
    try {
      ordinalsService.sendAction(action, params);
      addMessage('system', `Executing action: ${action}`);
    } catch (error) {
      console.error('Error sending action:', error);
      addMessage('system', `Error sending action: ${(error as any).message}`);
    }
  };

  // Fetch recent inscriptions
  const fetchInscriptions = async (options: Record<string, any> = {}) => {
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
      addMessage('system', `Error fetching inscriptions: ${(error as any).message}`);
      setLoading(false);
      throw error;
    }
  };

  // Fetch a single inscription
  const fetchInscription = async (id: string) => {
    setLoading(true);
    
    try {
      const result = await ordinalsService.getInscription(id);
      setCurrentInscription(result);
      setLoading(false);
      return result;
    } catch (error) {
      console.error(`Error fetching inscription ${id}:`, error);
      addMessage('system', `Error fetching inscription: ${(error as any).message}`);
      setLoading(false);
      throw error;
    }
  };

  // Fetch inscription content
  const fetchInscriptionContent = async (id: string) => {
    setLoading(true);
    
    try {
      const result = await ordinalsService.getInscriptionContent(id);
      setLoading(false);
      return result;
    } catch (error) {
      console.error(`Error fetching inscription content ${id}:`, error);
      addMessage('system', `Error fetching inscription content: ${(error as any).message}`);
      setLoading(false);
      throw error;
    }
  };

  // Find rare satoshis
  const findRareSatoshis = async (rarity: string | string[], limit: number = 10) => {
    setLoading(true);
    
    try {
      const result = await ordinalsService.findRareSatoshis(rarity, limit);
      setRareSatoshis(result.results);
      setLoading(false);
      return result;
    } catch (error) {
      console.error('Error finding rare satoshis:', error);
      addMessage('system', `Error finding rare satoshis: ${(error as any).message}`);
      setLoading(false);
      throw error;
    }
  };

  return (
    <OrdinalsContext.Provider value={{
      connectionStatus,
      apiStatus,
      messages,
      loading,
      inscriptions,
      currentInscription,
      rareSatoshis,
      pagination,
      filters,
      connectToOrdinals,
      disconnectFromOrdinals,
      sendMessage,
      sendAction,
      fetchInscriptions,
      fetchInscription,
      fetchInscriptionContent,
      findRareSatoshis,
      setFilters
    }}>
      {children}
    </OrdinalsContext.Provider>
  );
};
