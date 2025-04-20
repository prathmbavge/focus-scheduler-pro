import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bot, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TypewriterComponent from 'typewriter-effect';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import { useAI } from '@/context/AIContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  isTyping?: boolean;
}

function formatAIResponse(content: string) {
  const sections = content.split('\n\n');
  return sections.map((section, i) => {
    if (section.includes('•') || section.includes('- ') || /^\d+\./.test(section)) {
      const lines = section.split('\n');
      return (
        <div key={i} className="space-y-2">
          {lines.map((line, j) => {
            // Handle code blocks
            if (line.includes('`')) {
              return (
                <div key={j} className="font-mono bg-muted p-2 rounded text-sm overflow-x-auto">
                  {line.replace(/`/g, '')}
                </div>
              );
            }
            // Handle bullet points and numbered lists
            const isListItem = line.startsWith('•') || line.startsWith('- ') || /^\d+\./.test(line);
            return (
              <div 
                key={j} 
                className={`${isListItem ? 'ml-4 flex gap-2' : ''}`}
              >
                {line.startsWith('•') && <span className="text-primary">•</span>}
                {line.replace(/^[•-]\s/, '')}
              </div>
            );
          })}
        </div>
      );
    }
    // Handle regular paragraphs
    return (
      <p key={i} className="text-foreground">
        {section}
      </p>
    );
  });
}

const LoadingDots = () => (
  <div className="flex space-x-1">
    {[1, 2, 3].map((dot) => (
      <motion.div
        key={dot}
        className="w-1.5 h-1.5 bg-primary/60 rounded-full"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [1, 0.5, 1],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          delay: (dot - 1) * 0.2,
        }}
      />
    ))}
  </div>
);

export function AITaskChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { isEnabled, getChatResponse } = useAI();
  const [typingMessage, setTypingMessage] = useState<Message | null>(null);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await getChatResponse(input);
      const aiMessage: Message = { 
        role: 'assistant', 
        content: response.replace(/^\n+|\n+$/g, '').trim(),
        isTyping: true
      };
      setTypingMessage(aiMessage);
      setTimeout(() => {
        setTypingMessage(null);
        setMessages(prev => [...prev, { ...aiMessage, isTyping: false }]);
      }, response.length * 30);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Add auto-scroll effect
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  React.useEffect(scrollToBottom, [messages]);

  const renderMessage = (message: Message, index: number) => {
    const isAI = message.role === 'assistant';
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        key={index}
        className={`flex items-start gap-3 ${isAI ? 'justify-start' : 'justify-end'}`}
      >
        {isAI && (
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot size={16} className="text-primary" />
          </div>
        )}
        
        <div
          className={`rounded-lg px-4 py-3 max-w-[80%] ${
            isAI 
              ? 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm space-y-2 font-normal' 
              : 'bg-primary text-primary-foreground font-medium'
          }`}
        >
          {message.isTyping ? (
            <div className="flex items-center gap-2">
              <LoadingDots />
            </div>
          ) : (
            <div className="prose prose-zinc dark:prose-invert prose-p:leading-relaxed prose-p:my-1 max-w-none">
              {formatAIResponse(message.content)}
            </div>
          )}
        </div>

        {!isAI && (
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <UserIcon size={16} className="text-primary-foreground" />
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2"
      >
        <Sparkles size={16} />
        <span>AI Assistant</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="sm:max-w-[500px] h-[600px] flex flex-col bg-zinc-50 dark:bg-zinc-900 font-sans"
          aria-describedby="ai-chat-description"
          role="dialog"
        >
          <DialogHeader className="border-b px-4 py-3">
            <DialogTitle className="text-xl font-semibold tracking-tight">AI Task Assistant</DialogTitle>
            <DialogDescription id="ai-chat-description" className="text-sm text-zinc-500 dark:text-zinc-400">
              Chat with the AI assistant to get help with task management and suggestions
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 p-4 space-y-4">
            <AnimatePresence>
              {messages.map((message, i) => renderMessage(message, i))}
              {typingMessage && renderMessage(typingMessage, messages.length)}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </ScrollArea>

          <div className="flex gap-2 p-4 border-t">
            <Input
              placeholder="Ask about your tasks..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              disabled={!isEnabled || isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={!isEnabled || isLoading}
            >
              <Send size={16} />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
