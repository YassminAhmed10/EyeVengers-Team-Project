import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, X, Send, Pill, User, FileText, 
  Package, Search, CheckCircle, XCircle, AlertTriangle,
  Bot, ChevronDown, ChevronUp
} from 'lucide-react';
import { medicineAlternatives } from '../data/mockData';

const PharmacyAssistant = ({ 
  isOpen, 
  onClose,
  onToggle,
  medicines = [], 
  customers = [], 
  prescriptions = [] 
}) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Hello! I\'m PharmaFlow Assistant. I can help you with:\n\n• Medicine availability check\n• Drug alternatives\n• Customer prescription lookup\n\nHow can I help you today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Process user query
  const processQuery = (query) => {
    const lowerQuery = query.toLowerCase();
    
    // Check if it's a prescription lookup
    if (lowerQuery.includes('prescription') || lowerQuery.includes('customer') || lowerQuery.includes('patient')) {
      return handlePrescriptionLookup(query);
    }
    
    // Check if it's a medicine availability query
    if (lowerQuery.includes('available') || lowerQuery.includes('stock') || lowerQuery.includes('price') || lowerQuery.includes('have')) {
      return handleMedicineLookup(query);
    }
    
    // Check if it's asking for alternatives
    if (lowerQuery.includes('alternative') || lowerQuery.includes('instead') || lowerQuery.includes('replace')) {
      return handleAlternativeLookup(query);
    }
    
    // Default: try to find medicine
    return handleMedicineLookup(query);
  };

  // Handle medicine availability lookup
  const handleMedicineLookup = (query) => {
    const lowerQuery = query.toLowerCase();
    
    // Find medicine in query
    const foundMedicine = medicines.find(med => 
      lowerQuery.includes(med.name.toLowerCase())
    );

    if (foundMedicine) {
      const isAvailable = foundMedicine.stock > 0;
      const status = foundMedicine.status || (isAvailable ? 'In Stock' : 'Out of Stock');
      
      return {
        content: `Medicine: ${foundMedicine.name}\nStatus: ${isAvailable ? 'Available' : 'Not Available'}\nStock: ${foundMedicine.stock} units\nPrice: EGP ${foundMedicine.price.toFixed(2)}\nCategory: ${foundMedicine.category}\nLocation: ${foundMedicine.location || 'N/A'}${!isAvailable ? '\n\nSuggested Alternatives:\n• ' + getAlternatives(foundMedicine.name).join('\n• ') : ''}`,
        type: 'medicine',
        data: foundMedicine
      };
    }

    // Search for similar medicines
    const similarMedicines = medicines.filter(med => 
      med.name.toLowerCase().includes(lowerQuery) ||
      med.category.toLowerCase().includes(lowerQuery)
    );

    if (similarMedicines.length > 0) {
      const medList = similarMedicines.map(med => 
        `• ${med.name} - EGP ${med.price.toFixed(2)} (${med.stock > 0 ? 'Available' : 'Out of Stock'})`
      ).join('\n');
      
      return {
        content: `I found these medicines:\n\n${medList}\n\nWould you like more details about any specific medicine?`,
        type: 'list'
      };
    }

    return {
      content: `I couldn't find any medicine matching "${query}".\n\nYou can search by:\n• Medicine name (e.g., "Amoxicillin")\n• Category (e.g., "antibiotics")\n• Or ask "What's available?"`,
      type: 'help'
    };
  };

  // Handle prescription lookup
  const handlePrescriptionLookup = (query) => {
    const lowerQuery = query.toLowerCase();
    
    // Extract customer name from query
    let customerName = null;
    
    // Check for specific customer names in the query
    for (const customer of customers) {
      if (lowerQuery.includes(customer.name.toLowerCase())) {
        customerName = customer.name;
        break;
      }
    }

    // If no customer name found, list available customers
    if (!customerName) {
      const customerList = customers.map(c => `• ${c.name}`).join('\n');
      return {
        content: `I found these customers in the system:\n\n${customerList}\n\nPlease specify which customer's prescription you'd like to check (e.g., "Show prescription for Doha")`,
        type: 'help'
      };
    }

    // Find customer's prescriptions - check all possible patient fields
    const customerPrescriptions = prescriptions.filter(rx => 
      rx.patient?.toLowerCase().includes(customerName.toLowerCase()) ||
      rx.patientName?.toLowerCase().includes(customerName.toLowerCase()) ||
      rx.customer?.toLowerCase().includes(customerName.toLowerCase())
    );

    if (customerPrescriptions.length === 0) {
      // Check if customer exists
      const customerExists = customers.find(c => 
        c.name.toLowerCase().includes(customerName.toLowerCase())
      );
      
      if (customerExists) {
        return {
          content: `Customer: ${customerName}\n\nNo prescriptions found for this customer.`,
          type: 'prescription'
        };
      }
      
      return {
        content: `I couldn't find a customer named "${customerName}" in the system.`,
        type: 'error'
      };
    }

    // Build prescription details with category info
    let prescriptionDetails = `Customer: ${customerName}\n\nPrescriptions Found: ${customerPrescriptions.length}\n\n`;
    
    const categoryNames = {
      'chronic': 'Chronic (أمراض مزمنة)',
      'antibiotics': 'Antibiotics (مضادات حيوية)',
      'pain': 'Pain Relief (تسكين الألم)',
      'supplements': 'Supplements (مكملات)',
      'allergies': 'Allergies (حساسية)',
      'digestive': 'Digestive (هضمي)'
    };
    
    customerPrescriptions.forEach((rx, index) => {
      const rxMedicines = rx.medicines || [];
      const medicineName = rxMedicines.length > 0 ? rxMedicines[0].name : (rx.medication || 'Unknown');
      const dosage = rxMedicines.length > 0 ? rxMedicines[0].dosage : '';
      
      const foundMedicine = medicines.find(m => 
        m.name.toLowerCase().includes(medicineName.toLowerCase())
      );
      
      const isAvailable = foundMedicine && foundMedicine.stock > 0;
      const price = rx.total ? `EGP ${rx.total.toFixed(2)}` : (foundMedicine ? `EGP ${foundMedicine.price.toFixed(2)}` : 'N/A');
      
      prescriptionDetails += `--- Prescription ${index + 1} ---\n`;
      prescriptionDetails += `RX ID: ${rx.id}\n`;
      prescriptionDetails += `Medicine: ${medicineName}\n`;
      prescriptionDetails += `Dosage: ${dosage || 'N/A'}\n`;
      prescriptionDetails += `Status: ${rx.status || 'Unknown'}\n`;
      prescriptionDetails += `Date: ${rx.date || 'N/A'}\n`;
      prescriptionDetails += `Total: ${price}\n`;
      
      if (rx.category && categoryNames[rx.category]) {
        prescriptionDetails += `Category: ${categoryNames[rx.category]}\n`;
      }
      
      if (rx.patientId) {
        prescriptionDetails += `Patient ID: ${rx.patientId}\n`;
      }
      
      prescriptionDetails += '\n';
    });

    return {
      content: prescriptionDetails,
      type: 'prescription'
    };
  };

  // Handle alternative medicine lookup
  const handleAlternativeLookup = (query) => {
    const lowerQuery = query.toLowerCase();
    
    // Find the medicine in query
    const foundMedicine = medicines.find(med => 
      lowerQuery.includes(med.name.toLowerCase())
    );

    if (foundMedicine) {
      const alternatives = getAlternatives(foundMedicine.name);
      
      if (alternatives.length > 0) {
        const altList = alternatives.map((alt, index) => {
          const altMedicine = medicines.find(m => m.name === alt);
          const available = altMedicine && altMedicine.stock > 0;
          return `${index + 1}. ${alt} ${altMedicine ? `(Available - EGP ${altMedicine.price.toFixed(2)})` : ''}`;
        }).join('\n');
        
        return {
          content: `Medicine: ${foundMedicine.name}\n\nSuggested Alternatives:\n${altList}\n\nNote: Please consult with the customer about switching medications.`,
          type: 'alternatives'
        };
      }
      
      return {
        content: `No alternatives found for ${foundMedicine.name} in our database.\n\nPlease consult with the pharmacist or doctor for alternative medications.`,
        type: 'help'
      };
    }

    return {
      content: `I couldn't find a medicine to suggest alternatives for. Please specify the medicine name.`,
      type: 'help'
    };
  };

  // Get alternatives from OpenFDA API
  const getAlternativesFromAPI = async (medicineName) => {
    try {
      // Search for drug information in OpenFDA
      const response = await fetch(
        `https://api.fda.gov/drug/label.json?search=active_ingredient:"${encodeURIComponent(medicineName)}"&limit=5`
      );
      
      if (!response.ok) {
        throw new Error('API request failed');
      }
      
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        // Extract brand names and indications from FDA data
        const result = data.results[0];
        const brandNames = result.openfda?.brand_name || [];
        const genericName = result.openfda?.generic_name?.[0] || medicineName;
        const purpose = result.purpose?.[0] || '';
        
        return {
          source: 'OpenFDA',
          genericName,
          brandNames,
          purpose,
          indications: result.indications_and_usage?.[0] || ''
        };
      }
      
      return null;
    } catch (error) {
      console.error('FDA API Error:', error);
      return null;
    }
  };

  // Get alternatives from imported data (fallback)
  const getAlternatives = (medicineName) => {
    // Try exact match first
    if (medicineAlternatives[medicineName]) {
      return medicineAlternatives[medicineName].map(alt => alt.name);
    }
    
    // Try partial match - check if any key is in the medicine name
    for (const [key, alts] of Object.entries(medicineAlternatives)) {
      if (medicineName.toLowerCase().includes(key.toLowerCase()) || 
          key.toLowerCase().includes(medicineName.toLowerCase())) {
        return alts.map(alt => alt.name);
      }
    }
    
    return [];
  };

  // Send message
  const sendMessage = () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI processing delay
    setTimeout(() => {
      const response = processQuery(input);
      const botMessage = {
        id: Date.now() + 1,
        ...response
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 800);
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Quick action buttons
  const quickActions = [
    { label: 'Check Availability', icon: Search, query: 'What medicines do you have?' },
    { label: 'Prescription Lookup', icon: FileText, query: 'Show prescription for' },
    { label: 'Alternatives', icon: Pill, query: 'Alternative for Paracetamol' }
  ];

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 flex items-center gap-2"
          style={{ boxShadow: '0 4px 20px rgba(59, 130, 246, 0.5)' }}
        >
          <Bot className="w-6 h-6" />
          <span className="font-semibold">AI Assistant</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-slate-700">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">PharmaFlow Assistant</h3>
                <p className="text-blue-100 text-xs">AI-Powered Pharmacy Helper</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-50 dark:bg-slate-700/50 p-3 flex gap-2 overflow-x-auto">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => setInput(action.query)}
                className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-slate-600 rounded-full text-xs font-medium text-gray-600 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 transition-colors whitespace-nowrap"
              >
                <action.icon className="w-3 h-3" />
                {action.label}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                      : message.type === 'error'
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
                      : message.type === 'medicine' || message.type === 'prescription' || message.type === 'alternatives'
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200'
                  }`}
                >
                  {message.type !== 'user' && message.type !== 'bot' && (
                    <div className="flex items-center gap-2 mb-2">
                      {message.type === 'medicine' && <Pill className="w-4 h-4" />}
                      {message.type === 'prescription' && <FileText className="w-4 h-4" />}
                      {message.type === 'alternatives' && <AlertTriangle className="w-4 h-4" />}
                      {message.type === 'error' && <XCircle className="w-4 h-4" />}
                      {message.type === 'list' && <Package className="w-4 h-4" />}
                      <span className="text-xs font-semibold uppercase">
                        {message.type === 'medicine' && 'Medicine Info'}
                        {message.type === 'prescription' && 'Prescription Details'}
                        {message.type === 'alternatives' && 'Alternatives'}
                        {message.type === 'error' && 'Error'}
                        {message.type === 'list' && 'Search Results'}
                        {message.type === 'help' && 'Help'}
                      </span>
                    </div>
                  )}
                  {message.type === 'bot' && (
                    <div className="flex items-center gap-2 mb-2">
                      <Bot className="w-4 h-4 text-blue-500" />
                      <span className="text-xs font-semibold text-blue-500">PharmaFlow</span>
                    </div>
                  )}
                  <pre className={`whitespace-pre-wrap text-sm ${message.type === 'user' ? 'text-white' : 'text-gray-700 dark:text-gray-200'}`}>
                    {message.content}
                  </pre>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-slate-700 rounded-2xl p-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200 dark:border-slate-700">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about medicines, prescriptions..."
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-slate-700 border-0 rounded-full focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-800 dark:text-white placeholder-gray-400"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isTyping}
                className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-full flex items-center justify-center transition-all disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PharmacyAssistant;

