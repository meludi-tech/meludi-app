import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth.store';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PRIMARY = '#1F3A44';
const BG = '#F8F8F6';
const CARD = '#F6F6F4';
const MUTED = '#7B7B7B';
const BORDER = '#E7E5E4';

type InboxTab = 'buy' | 'sell';

type ConversationRow = {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  order_id: string | null;
  created_at: string;
};

type ListingRow = {
  id: string;
  title: string | null;
  price_clp: number | null;
  cover_photo_url: string | null;
};

type ProfileRow = {
  id: string;
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
};

type MessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string | null;
  text: string | null;
  event: string | null;
  payload: any;
  created_at: string;
};

type OrderRow = {
  id: string;
  status: string | null;
  updated_at: string | null;
};

type InboxItem = {
  conversationId: string;
  listingId: string;
  orderId: string | null;
  counterpartyId: string;
  counterpartyName: string;
  counterpartyAvatar: string | null;
  listingTitle: string;
  listingPrice: number | null;
  listingImage: string | null;
  previewText: string;
  statusLabel: string | null;
  timestamp: string;
  role: InboxTab;
};

export default function InboxScreen() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<InboxTab>('buy');
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<InboxItem[]>([]);

  const loadInbox = useCallback(async () => {
    if (!user?.id) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const { data: conversations, error: conversationsError } = await supabase
        .from('conversations')
        .select('id, listing_id, buyer_id, seller_id, order_id, created_at')
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (conversationsError) throw conversationsError;

      const conversationRows = (conversations || []) as ConversationRow[];

      if (!conversationRows.length) {
        setItems([]);
        return;
      }

      const listingIds = Array.from(
        new Set(conversationRows.map((c) => c.listing_id).filter(Boolean))
      );

      const profileIds = Array.from(
        new Set(
          conversationRows.flatMap((c) => [c.buyer_id, c.seller_id]).filter(Boolean)
        )
      );

      const orderIds = Array.from(
        new Set(conversationRows.map((c) => c.order_id).filter(Boolean))
      ) as string[];

      const conversationIds = conversationRows.map((c) => c.id);

      const [
        listingsRes,
        profilesRes,
        ordersRes,
        messagesRes,
      ] = await Promise.all([
        listingIds.length
          ? supabase
              .from('listings')
              .select('id, title, price_clp, cover_photo_url')
              .in('id', listingIds)
          : Promise.resolve({ data: [], error: null } as any),

        profileIds.length
          ? supabase
              .from('profiles')
              .select('id, display_name, first_name, last_name, avatar_url')
              .in('id', profileIds)
          : Promise.resolve({ data: [], error: null } as any),

        orderIds.length
          ? supabase
              .from('orders')
              .select('id, status, updated_at')
              .in('id', orderIds)
          : Promise.resolve({ data: [], error: null } as any),

        conversationIds.length
          ? supabase
              .from('messages')
              .select('id, conversation_id, sender_id, text, event, payload, created_at')
              .in('conversation_id', conversationIds)
              .order('created_at', { ascending: false })
          : Promise.resolve({ data: [], error: null } as any),
      ]);

      if (listingsRes.error) throw listingsRes.error;
      if (profilesRes.error) throw profilesRes.error;
      if (ordersRes.error) throw ordersRes.error;
      if (messagesRes.error) throw messagesRes.error;

      const listings = (listingsRes.data || []) as ListingRow[];
      const profiles = (profilesRes.data || []) as ProfileRow[];
      const orders = (ordersRes.data || []) as OrderRow[];
      const messages = (messagesRes.data || []) as MessageRow[];

      const listingMap = new Map(listings.map((l) => [l.id, l]));
      const profileMap = new Map(profiles.map((p) => [p.id, p]));
      const orderMap = new Map(orders.map((o) => [o.id, o]));

      const latestMessageByConversation = new Map<string, MessageRow>();
      for (const msg of messages) {
        if (!latestMessageByConversation.has(msg.conversation_id)) {
          latestMessageByConversation.set(msg.conversation_id, msg);
        }
      }

      const mapped: InboxItem[] = conversationRows.map((conversation) => {
        const isBuyer = conversation.buyer_id === user.id;
        const role: InboxTab = isBuyer ? 'buy' : 'sell';
        const counterpartyId = isBuyer ? conversation.seller_id : conversation.buyer_id;

        const profile = profileMap.get(counterpartyId);
        const listing = listingMap.get(conversation.listing_id);
        const order = conversation.order_id
          ? orderMap.get(conversation.order_id)
          : undefined;
        const latestMessage = latestMessageByConversation.get(conversation.id);

        return {
          conversationId: conversation.id,
          listingId: conversation.listing_id,
          orderId: conversation.order_id,
          counterpartyId,
          counterpartyName: getDisplayName(profile),
          counterpartyAvatar: profile?.avatar_url || listing?.cover_photo_url || null,
          listingTitle: listing?.title || 'Producto',
          listingPrice: listing?.price_clp || null,
          listingImage: listing?.cover_photo_url || null,
          previewText: buildPreviewText(latestMessage),
          statusLabel: mapStatusLabel(order?.status, latestMessage?.event),
          timestamp: formatTimestamp(
            latestMessage?.created_at || order?.updated_at || conversation.created_at
          ),
          role,
        };
      });

      setItems(mapped);
    } catch (error) {
      console.log('INBOX LOAD ERROR:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      loadInbox();
    }, [loadInbox])
  );

  const filteredItems = useMemo(
    () => items.filter((item) => item.role === activeTab),
    [items, activeTab]
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
      <View style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: 24, paddingTop: 12 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 18,
            }}
          >
            <Text style={{ fontSize: 28, fontWeight: '700', color: '#111' }}>
              Mensajes
            </Text>

            <View style={{ flexDirection: 'row', gap: 14 }}>
              <View style={styles.iconButton}>
                <Text style={styles.iconText}>⌕</Text>
              </View>
              <View style={styles.iconButton}>
                <Text style={styles.iconText}>⋯</Text>
              </View>
            </View>
          </View>

          <View style={styles.tabsWrap}>
            <Pressable
              onPress={() => setActiveTab('buy')}
              style={styles.tabButton}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'buy' && styles.tabTextActive,
                ]}
              >
                Compra
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setActiveTab('sell')}
              style={styles.tabButton}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'sell' && styles.tabTextActive,
                ]}
              >
                Venta
              </Text>
            </Pressable>
          </View>

          <View style={styles.tabUnderlineTrack}>
            <View
              style={[
                styles.tabUnderline,
                activeTab === 'buy'
                  ? { left: 0, width: '50%' }
                  : { left: '50%', width: '50%' },
              ]}
            />
          </View>
        </View>

        {loading ? (
          <View style={styles.centerState}>
            <ActivityIndicator size="small" color={PRIMARY} />
          </View>
        ) : filteredItems.length === 0 ? (
          <EmptyState activeTab={activeTab} />
        ) : (
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 18, paddingBottom: 140 }}
            showsVerticalScrollIndicator={false}
          >
            {filteredItems.map((item) => (
              <Pressable
                key={item.conversationId}
                onPress={() => router.push(`/chat/${item.conversationId}`)}
                style={styles.card}
              >
                <Image
                  source={{
                    uri:
                      item.listingImage ||
                      item.counterpartyAvatar ||
                      'https://placehold.co/100x100/png',
                  }}
                  style={styles.avatar}
                />

                <View style={{ flex: 1, marginLeft: 16 }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      marginBottom: 6,
                    }}
                  >
                    <Text style={styles.name} numberOfLines={1}>
                      {item.counterpartyName}
                    </Text>
                    <Text style={styles.time}>{item.timestamp}</Text>
                  </View>

                  {item.statusLabel ? (
                    <View style={styles.pill}>
                      <Text style={styles.pillText}>{item.statusLabel}</Text>
                    </View>
                  ) : (
                    <Text numberOfLines={1} style={styles.preview}>
                      {item.previewText}
                    </Text>
                  )}
                </View>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

function EmptyState({ activeTab }: { activeTab: InboxTab }) {
  return (
    <View style={styles.emptyWrap}>
      <View style={styles.emptyIllustration}>
        <View style={styles.clipCardBack} />
        <View style={styles.clipCardFront} />
      </View>

      <Text style={styles.emptyTitle}>Aún no tienes mensajes</Text>
      <Text style={styles.emptySubtitle}>
        {activeTab === 'buy'
          ? 'Cuando hables con un vendedor o comprador, aparecerán aquí.'
          : 'Cuando recibas mensajes por tus productos, aparecerán aquí.'}
      </Text>
    </View>
  );
}

function getDisplayName(profile?: ProfileRow) {
  if (!profile) return 'Usuario';

  if (profile.display_name?.trim()) return profile.display_name.trim();

  const fullName = [profile.first_name, profile.last_name]
    .filter(Boolean)
    .join(' ')
    .trim();

  if (fullName) return fullName;

  return 'Usuario';
}

function buildPreviewText(message?: MessageRow) {
  if (!message) return 'Sin mensajes todavía';

  if (message.event && message.event !== 'message') {
    switch (message.event) {
      case 'offer_pending':
        return 'Oferta enviada';
      case 'offer_accepted':
        return 'Oferta aceptada';
      case 'offer_rejected':
        return 'Oferta rechazada';
      case 'payment_received':
        return 'Pago recibido';
      case 'label_ready':
        return 'Etiqueta lista';
      case 'package_received_by_courier':
        return 'Paquete recibido por courier';
      case 'delivered':
        return 'Entregado';
      case 'waiting_buyer_confirmation':
        return 'Esperando confirmación';
      case 'payment_released':
        return 'Pago liberado';
      case 'return_requested':
        return 'Devolución solicitada';
      case 'return_under_review':
        return 'Devolución en revisión';
      case 'return_approved':
        return 'Devolución aprobada';
      case 'return_rejected':
        return 'Devolución rechazada';
      case 'return_label_ready':
        return 'Etiqueta de devolución lista';
      case 'return_in_transit':
        return 'Devolución en camino';
      case 'return_received_by_seller':
        return 'Producto recibido por vendedor';
      case 'refund_processed':
        return 'Reembolso procesado';
      default:
        return 'Actualización del pedido';
    }
  }

  return message.text?.trim() || 'Sin mensajes todavía';
}

function mapStatusLabel(orderStatus?: string | null, lastEvent?: string | null) {
  if (orderStatus) {
    switch (orderStatus) {
      case 'PAID_HELD':
        return 'Esperando envío';
      case 'LABEL_CREATED':
        return 'Etiqueta lista';
      case 'IN_TRANSIT':
        return 'Pedido en curso';
      case 'DELIVERED':
        return 'Entregado';
      case 'WAITING_48H':
        return 'Esperando confirmación';
      case 'RELEASED':
        return 'Completado · Pago liberado';
      case 'PARTIALLY_RELEASED':
        return 'Pago parcial liberado';
      case 'DISPUTE_OPENED':
        return 'Devolución en revisión';
      case 'REFUNDED':
        return 'Reembolso procesado';
      case 'CANCELLED':
        return 'Cancelado';
      default:
        break;
    }
  }

  if (lastEvent) {
    switch (lastEvent) {
      case 'offer_pending':
        return 'Oferta enviada';
      case 'offer_accepted':
        return 'Oferta aceptada';
      case 'offer_rejected':
        return 'Oferta rechazada';
      case 'payment_received':
        return 'Pago recibido';
      case 'label_ready':
        return 'Etiqueta lista';
      case 'return_requested':
        return 'Devolución solicitada';
      case 'return_under_review':
        return 'Devolución en revisión';
      case 'return_approved':
        return 'Devolución aprobada';
      case 'refund_processed':
        return 'Reembolso procesado';
      default:
        return null;
    }
  }

  return null;
}

function formatTimestamp(value?: string | null) {
  if (!value) return '';

  const date = new Date(value);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (minutes < 1) return 'Ahora';
  if (minutes < 60) return `Hace ${minutes} min`;
  if (hours < 24) return `Hace ${hours} h`;
  if (days < 7) return `Hace ${days} días`;

  return date.toLocaleDateString('es-CL', {
    day: 'numeric',
    month: 'short',
  });
}

const styles = {
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },

  iconText: {
    fontSize: 24,
    color: '#111',
  },

  tabsWrap: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },

  tabButton: {
    width: '50%' as const,
    alignItems: 'center' as const,
    paddingVertical: 10,
  },

  tabText: {
    fontSize: 18,
    color: '#A0A0A0',
    fontWeight: '500' as const,
  },

  tabTextActive: {
    color: PRIMARY,
    fontWeight: '700' as const,
  },

  tabUnderlineTrack: {
    height: 2,
    backgroundColor: '#DDDAD7',
    borderRadius: 999,
    position: 'relative' as const,
    marginTop: 2,
  },

  tabUnderline: {
    position: 'absolute' as const,
    top: 0,
    height: 4,
    backgroundColor: PRIMARY,
    borderRadius: 999,
  },

  centerState: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },

  emptyWrap: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingHorizontal: 32,
    paddingBottom: 80,
  },

  emptyIllustration: {
    width: 190,
    height: 180,
    marginBottom: 28,
    position: 'relative' as const,
  },

  clipCardBack: {
    position: 'absolute' as const,
    width: 95,
    height: 125,
    left: 34,
    top: 24,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#48434D',
    backgroundColor: '#FAFAF9',
    transform: [{ rotate: '-16deg' }],
  },

  clipCardFront: {
    position: 'absolute' as const,
    width: 105,
    height: 140,
    left: 78,
    top: 34,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#48434D',
    backgroundColor: '#FAFAF9',
  },

  emptyTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#111',
    marginBottom: 10,
    textAlign: 'center' as const,
  },

  emptySubtitle: {
    fontSize: 15,
    color: '#444',
    textAlign: 'center' as const,
    lineHeight: 24,
  },

  card: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: CARD,
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
  },

  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#EAE7E2',
  },

  name: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#111',
    flex: 1,
    paddingRight: 10,
  },

  time: {
    fontSize: 14,
    color: '#6D6D6D',
  },

  pill: {
    alignSelf: 'flex-start' as const,
    backgroundColor: '#E9E8E6',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },

  pillText: {
    fontSize: 14,
    color: '#3B3B3B',
    fontWeight: '500' as const,
  },

  preview: {
    fontSize: 16,
    color: '#555',
  },
};