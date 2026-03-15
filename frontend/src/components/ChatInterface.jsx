import { useState, useEffect, useRef } from 'react';
import { Avatar, Spin, Typography, Input, Button } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, MessageSquare } from 'lucide-react';
import api from '../config/api';
import socket from '../config/socket';

const { Text } = Typography;

export default function ChatInterface({ projectId, onNewMessage }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (projectId) {
      const fetchMessages = async () => {
        try {
          const res = await api.get(`/messages/${projectId}`);
          setMessages(res.data);
        } catch (err) {
          console.error('Failed to fetch messages:', err);
        } finally {
          setLoading(false);
        }
      };
      
      fetchMessages();
      socket.emit('join_room', projectId);

      socket.on('receive_message', (message) => {
        setMessages((prev) => [...prev, message]);
        if (onNewMessage) onNewMessage(message);
      });

      return () => {
        socket.off('receive_message');
      };
    }
  }, [projectId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const messageData = {
      projectId,
      senderId: user._id,
      senderName: user.username,
      message: inputValue,
    };

    socket.emit('send_message', messageData);
    setInputValue('');
  };

  return (
    <div className="chat-interface-modern" style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-card)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
      <div className="chat-messages" style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Spin /></div>
        ) : messages.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-muted)' }}>
            <MessageSquare size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
            <Text type="secondary">No messages yet. Start the conversation!</Text>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg, index) => {
              const isOwn = (msg.senderId?._id || msg.senderId) === user._id;
              return (
                <motion.div
                  key={msg._id || index}
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ 
                    display: 'flex', 
                    flexDirection: isOwn ? 'row-reverse' : 'row',
                    gap: '12px',
                    alignSelf: isOwn ? 'flex-end' : 'flex-start',
                    maxWidth: '80%'
                  }}
                >
                  {!isOwn && <Avatar src={msg.senderId?.avatar} icon={<User size={16} />} style={{ flexShrink: 0, marginTop: '4px' }} />}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: isOwn ? 'flex-end' : 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                       {!isOwn && <Text strong style={{ fontSize: '12px' }}>{msg.senderName || msg.senderId?.username}</Text>}
                      <Text type="secondary" style={{ fontSize: '10px' }}>
                        {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </div>
                    <div 
                      style={{ 
                        padding: '10px 16px', 
                        borderRadius: isOwn ? '16px 16px 2px 16px' : '2px 16px 16px 16px',
                        background: isOwn ? 'var(--primary)' : 'var(--bg-app)',
                        color: isOwn ? '#fff' : 'var(--text-primary)',
                        border: isOwn ? 'none' : '1px solid var(--border-color)',
                        fontSize: '14px',
                        lineHeight: '1.5',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    >
                      {msg.message}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input-bar" style={{ padding: '20px', background: 'var(--bg-app)', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onPressEnter={handleSend}
          placeholder="Type a message..."
          variant="borderless"
          style={{ flex: 1, background: 'var(--bg-card)', borderRadius: '24px', padding: '10px 20px', border: '1px solid var(--border-color)' }}
        />
        <Button 
          type="primary" 
          shape="circle"
          icon={<Send size={18} />} 
          size="large" 
          onClick={handleSend}
          disabled={!inputValue.trim()}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        />
      </div>
    </div>
  );
}
