import { supabase } from '../config/supabase.js';

class ChatService {
  constructor() {
    this.messages = [];
    this.userId = null;
    this.channel = null;
    this.unreadCount = 0;
    this.listeners = new Set();
  }

  setUserId(uid) {
    if (this.userId === uid) return;
    this.userId = uid;
    this.messages = [];
    this.unreadCount = 0;
    if (this.channel) {
      supabase.removeChannel(this.channel);
      this.channel = null;
    }
    if (uid) {
      this.fetchMessages();
      this.setupSubscription();
    }
  }

  async fetchMessages() {
    if (!this.userId) return [];
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', this.userId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      this.messages = data || [];
      this.updateUnreadCount();
      this.notify();
      return this.messages;
    } catch (e) {
      console.warn('Error fetching messages:', e);
      return [];
    }
  }

  setupSubscription() {
    if (!this.userId) return;
    this.channel = supabase.channel(`client-chat:${this.userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${this.userId}`
      }, (payload) => {
        this.messages.push(payload.new);
        if (payload.new.sender === 'admin' && !payload.new.is_read) {
          this.unreadCount++;
        }
        this.notify();
      })
      .subscribe();
  }

  async sendMessage(user, content, file = null) {
    if (!user || (!content.trim() && !file)) return;

    let fileUrl = null;
    if (file) {
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const path = `${user.id}/${Date.now()}_${cleanFileName}`;
      const { error: uploadError } = await supabase.storage
        .from('comprobantes')
        .upload(path, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('comprobantes').getPublicUrl(path);
      fileUrl = data.publicUrl;
    }

    // 1. Ensure chat row exists in 'chats' table
    await supabase.from('chats').upsert({
      id: user.id,
      user_name: user.user_metadata?.display_name || user.email,
      product: 'Consulta de Soporte',
      order_number: '#CHAT',
      updated_at: new Date().toISOString()
    });

    // 2. Insert into 'messages' table with EXACT database columns: (chat_id, sender, text, file_url, is_read)
    const newMsg = {
      chat_id: user.id,
      sender: 'user',
      text: content.trim() || 'Archivo adjunto',
      file_url: fileUrl,
      is_read: false
    };

    const { data, error } = await supabase.from('messages').insert([newMsg]).select().single();
    if (error) {
      console.error('Error inserting message:', error);
      throw error;
    }

    return data;
  }

  async markAsRead() {
    if (!this.userId) return;
    this.unreadCount = 0;
    this.notify();
    try {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('chat_id', this.userId)
        .eq('sender', 'admin');
    } catch (e) {
      console.warn('Error marking messages as read:', e);
    }
  }

  updateUnreadCount() {
    this.unreadCount = this.messages.filter(m => m.sender === 'admin' && !m.is_read).length;
  }

  getUnreadCount() {
    return this.unreadCount;
  }

  getMessages() {
    return this.messages;
  }

  subscribe(callback) {
    this.listeners.add(callback);
    callback(this.messages, this.unreadCount);
    return () => this.listeners.delete(callback);
  }

  notify() {
    this.listeners.forEach(cb => {
      try { cb(this.messages, this.unreadCount); } catch (e) { console.error(e); }
    });
  }
}

export const chatService = new ChatService();
