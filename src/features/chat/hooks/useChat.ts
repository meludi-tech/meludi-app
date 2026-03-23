import { useAuthStore } from '@/stores/auth.store';
import { useEffect, useState } from 'react';
import { getMessages } from '../api/getMessages';
import { getThreads } from '../api/getThreads';
import { sendMessage } from '../api/sendMessage';

export const useChat = (threadId?: string) => {
  const { user } = useAuthStore();

  const [threads, setThreads] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadThreads = async () => {
    if (!user) return;

    const data = await getThreads(user.id);
    setThreads(data || []);
    setLoading(false);
  };

  const loadMessages = async () => {
    if (!threadId) return;

    const data = await getMessages(threadId);
    setMessages(data || []);
  };

  const handleSend = async (text: string) => {
    if (!threadId || !user) return;

    await sendMessage(threadId, user.id, text);
    loadMessages();
  };

  useEffect(() => {
    loadThreads();
  }, [user]);

  useEffect(() => {
    loadMessages();
  }, [threadId]);

  return {
    threads,
    messages,
    loading,
    send: handleSend,
  };
};