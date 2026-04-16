import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth.store';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PRIMARY = '#1F3A44';
const BG = '#F8F8F6';
const CARD = '#FFFFFF';
const MUTED = '#6B7280';
const BORDER = '#E7E5E4';
const TRACK_INACTIVE = '#D6D3D1';
const SUCCESS = '#0F766E';
const DANGER = '#B91C1C';

type Message = {
  id: string;
  conversation_id: string;
  sender_id: string | null;
  text: string | null;
  event: string | null;
  payload: Record<string, any> | null;
  created_at: string;
};

type Conversation = {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  order_id: string | null;
};

type Listing = {
  id: string;
  title: string | null;
  price_clp: number | null;
  cover_photo_url: string | null;
  seller_id?: string | null;
};

type Order = {
  id: string;
  status: string | null;
  tracking_number: string | null;
  label_url: string | null;
  shipment_id: string | null;
  selected_courier_name: string | null;
  courier: string | null;
};

type Profile = {
  display_name: string | null;
  first_name?: string | null;
  last_name?: string | null;
  avatar_url?: string | null;
};

type TimelineItem =
  | { kind: 'message'; data: Message }
  | { kind: 'event'; data: Message };

type OrderStep = {
  key: string;
  label: string;
};

type OfferRow = {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  price_clp: number;
  status: string;
  created_at?: string;
};

const ORDER_STEPS: OrderStep[] = [
  { key: 'PAID_HELD', label: 'Pagado' },
  { key: 'LABEL_CREATED', label: 'Etiqueta' },
  { key: 'IN_TRANSIT', label: 'En camino' },
  { key: 'DELIVERED', label: 'Entregado' },
  { key: 'RELEASED', label: 'Completado' },
];

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const conversationId = String(id || '');

  const { user } = useAuthStore();

  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [listing, setListing] = useState<Listing | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [counterparty, setCounterparty] = useState<Profile | null>(null);

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [input, setInput] = useState('');

  const [counteringOfferId, setCounteringOfferId] = useState<string | null>(null);
  const [counterPriceInput, setCounterPriceInput] = useState('');

  const flatListRef = useRef<FlatList<TimelineItem>>(null);

  useEffect(() => {
    if (!user) {
      router.replace('/(auth)/signup');
    }
  }, [user]);

  useEffect(() => {
    if (!conversationId || !user?.id) return;
    void loadScreen();
  }, [conversationId, user?.id]);

  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`chat-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => {
            const next = [...prev, payload.new as Message];
            return next.sort(
              (a, b) =>
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );
          });

          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  const loadScreen = async () => {
    try {
      setLoading(true);

      const { data: convo, error: convoError } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

      if (convoError || !convo) {
        throw convoError || new Error('Conversation not found');
      }

      const conversationRow = convo as Conversation;
      setConversation(conversationRow);

      const otherUserId =
        conversationRow.buyer_id === user?.id
          ? conversationRow.seller_id
          : conversationRow.buyer_id;

      const [messagesRes, listingRes, profileRes, orderRes] = await Promise.all([
        supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true }),

        supabase
          .from('listings')
          .select('id, title, price_clp, cover_photo_url, seller_id')
          .eq('id', conversationRow.listing_id)
          .single(),

        supabase
          .from('profiles')
          .select('display_name, first_name, last_name, avatar_url')
          .eq('id', otherUserId)
          .single(),

        conversationRow.order_id
          ? supabase
              .from('orders')
              .select(
                'id, status, tracking_number, label_url, shipment_id, selected_courier_name, courier'
              )
              .eq('id', conversationRow.order_id)
              .single()
          : Promise.resolve({ data: null, error: null } as const),
      ]);

      if (messagesRes.error) throw messagesRes.error;
      if (listingRes.error) throw listingRes.error;
      if (profileRes.error) throw profileRes.error;
      if (orderRes.error) throw orderRes.error;

      setMessages((messagesRes.data || []) as Message[]);
      setListing((listingRes.data || null) as Listing | null);
      setCounterparty((profileRes.data || null) as Profile | null);
      setOrder((orderRes.data || null) as Order | null);
    } catch (error) {
      console.log('CHAT LOAD ERROR:', error);
      Alert.alert('Error', 'No pudimos cargar este chat.');
    } finally {
      setLoading(false);
    }
  };

  const refreshOrder = async () => {
    if (!conversation?.order_id) return;

    const { data, error } = await supabase
      .from('orders')
      .select(
        'id, status, tracking_number, label_url, shipment_id, selected_courier_name, courier'
      )
      .eq('id', conversation.order_id)
      .single();

    if (!error) {
      setOrder((data || null) as Order | null);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !user?.id || sending) return;

    try {
      setSending(true);

      const { error } = await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: user.id,
        text: input.trim(),
        event: 'message',
        payload: {},
      });

      if (error) throw error;

      setInput('');
    } catch (error) {
      console.log('SEND MESSAGE ERROR:', error);
      Alert.alert('Error', 'No pudimos enviar el mensaje.');
    } finally {
      setSending(false);
    }
  };

  const handleCreateShipment = async () => {
    if (!order?.id || actionLoading) return;

    try {
      setActionLoading(true);

      const { error } = await supabase.functions.invoke('create-shipment', {
        body: { order_id: order.id },
      });

      if (error) throw error;

      await refreshOrder();
    } catch (error) {
      console.log('CREATE SHIPMENT ERROR:', error);
      Alert.alert('Error', 'No pudimos generar el envío.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadLabel = async () => {
    if (!order?.label_url) {
      Alert.alert('Etiqueta no disponible');
      return;
    }

    try {
      const Linking = await import('react-native').then((m) => m.Linking);
      await Linking.openURL(order.label_url);
    } catch (error) {
      console.log('OPEN LABEL ERROR:', error);
      Alert.alert('Error', 'No pudimos abrir la etiqueta.');
    }
  };

  const handleSyncShipmentStatus = async () => {
    if (actionLoading) return;

    try {
      setActionLoading(true);

      const { error } = await supabase.functions.invoke('sync-shipment-status', {
        body: {},
      });

      if (error) throw error;

      await refreshOrder();
    } catch (error) {
      console.log('SYNC SHIPMENT ERROR:', error);
      Alert.alert('Error', 'No pudimos actualizar el seguimiento.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmReception = async () => {
    if (!order?.id || actionLoading) return;

    try {
      setActionLoading(true);

      const { error } = await supabase
        .from('orders')
        .update({
          status: 'RELEASED',
          released_at: new Date().toISOString(),
        })
        .eq('id', order.id);

      if (error) throw error;

      await refreshOrder();
    } catch (error) {
      console.log('CONFIRM RECEPTION ERROR:', error);
      Alert.alert('Error', 'No pudimos confirmar la recepción.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestReturn = async () => {
    if (!order?.id || actionLoading) return;

    try {
      setActionLoading(true);

      const { error } = await supabase
        .from('orders')
        .update({
          status: 'DISPUTE_OPENED',
        })
        .eq('id', order.id);

      if (error) throw error;

      await refreshOrder();
    } catch (error) {
      console.log('RETURN REQUEST ERROR:', error);
      Alert.alert('Error', 'No pudimos iniciar la devolución.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOfferAction = async (
    action: 'accept' | 'reject',
    offer: OfferRow
  ) => {
    if (!user?.id || actionLoading) return;

    try {
      setActionLoading(true);

      if (action === 'accept') {
        const { error: acceptError } = await supabase
          .from('offers')
          .update({ status: 'accepted' })
          .eq('id', offer.id);

        if (acceptError) throw acceptError;

        const { error: rejectOthersError } = await supabase
          .from('offers')
          .update({ status: 'rejected' })
          .eq('listing_id', offer.listing_id)
          .eq('buyer_id', offer.buyer_id)
          .eq('seller_id', offer.seller_id)
          .eq('status', 'pending')
          .neq('id', offer.id);

        if (rejectOthersError) throw rejectOthersError;

        const { error: msgError } = await supabase.from('messages').insert({
          conversation_id: conversationId,
          sender_id: user.id,
          event: 'offer_accepted',
          payload: {
            offer_id: offer.id,
            price_clp: offer.price_clp,
          },
        });

        if (msgError) throw msgError;
      }

      if (action === 'reject') {
        const { error: rejectError } = await supabase
          .from('offers')
          .update({ status: 'rejected' })
          .eq('id', offer.id);

        if (rejectError) throw rejectError;

        const { error: msgError } = await supabase.from('messages').insert({
          conversation_id: conversationId,
          sender_id: user.id,
          event: 'offer_rejected',
          payload: {
            offer_id: offer.id,
            price_clp: offer.price_clp,
          },
        });

        if (msgError) throw msgError;
      }
    } catch (error) {
      console.log('OFFER ACTION ERROR:', error);
      Alert.alert('Error', 'No pudimos actualizar la oferta.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartCounterOffer = (offer: OfferRow) => {
    setCounteringOfferId(offer.id);
    setCounterPriceInput(String(offer.price_clp));
  };

  const handleSubmitCounterOffer = async (offer: OfferRow) => {
    if (!user?.id || !conversation || !listing || actionLoading) return;

    const price = Number(counterPriceInput);
    if (!price || price <= 0) {
      Alert.alert('Precio inválido');
      return;
    }

    try {
      setActionLoading(true);

      const buyerId =
        user.id === conversation.buyer_id
          ? user.id
          : conversation.buyer_id;

      const sellerId =
        user.id === conversation.seller_id
          ? user.id
          : conversation.seller_id;

      const { data: newOffer, error: offerError } = await supabase
        .from('offers')
        .insert({
          listing_id: listing.id,
          buyer_id: buyerId,
          seller_id: sellerId,
          price_clp: price,
          status: 'pending',
        })
        .select('id, listing_id, buyer_id, seller_id, price_clp, status')
        .single();

      if (offerError || !newOffer) throw offerError || new Error('Offer insert failed');

      const { error: msgError } = await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: user.id,
        event: 'offer_counter',
        payload: {
          offer_id: newOffer.id,
          price_clp: newOffer.price_clp,
        },
      });

      if (msgError) throw msgError;

      setCounteringOfferId(null);
      setCounterPriceInput('');
    } catch (error) {
      console.log('COUNTER OFFER ERROR:', error);
      Alert.alert('Error', 'No pudimos enviar la contraoferta.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleContinueToCheckoutWithOffer = (offer: OfferRow) => {
    if (!listing?.id) return;

    router.push({
      pathname: `/checkout/[id]`,
      params: {
       id: listing.id,
        acceptedOfferId: offer.id,
        acceptedOfferPrice: String(offer.price_clp),
      },
    });
  };

  const timelineData = useMemo<TimelineItem[]>(
    () =>
      messages.map((message) => ({
        kind:
          message.event && message.event !== 'message' ? 'event' : 'message',
        data: message,
      })),
    [messages]
  );

  const renderCTA = () => {
    if (!order) return null;

    switch (order.status) {
      case 'PAID_HELD':
        return (
          <CTAButton
            label={actionLoading ? 'Generando...' : 'Generar envío'}
            onPress={handleCreateShipment}
            disabled={actionLoading}
          />
        );

      case 'LABEL_CREATED':
        return (
          <CTAButton
            label="Descargar etiqueta"
            onPress={handleDownloadLabel}
            disabled={actionLoading}
          />
        );

      case 'IN_TRANSIT':
        return (
          <CTAButton
            label={actionLoading ? 'Actualizando...' : 'Actualizar seguimiento'}
            onPress={handleSyncShipmentStatus}
            disabled={actionLoading}
          />
        );

      case 'DELIVERED':
      case 'WAITING_48H':
        return (
          <View style={styles.ctaRow}>
            <CTAButton
              label="Confirmar recepción"
              onPress={handleConfirmReception}
              disabled={actionLoading}
              compact
            />
            <CTAButton
              label="Solicitar devolución"
              onPress={handleRequestReturn}
              disabled={actionLoading}
              compact
              secondary
            />
          </View>
        );

      default:
        return null;
    }
  };

  const renderItem = ({ item }: { item: TimelineItem }) => {
    if (item.kind === 'event') {
      const message = item.data;
      const isMine = message.sender_id === user?.id;

      if (isOfferEvent(message.event)) {
        return (
          <OfferBubble
            message={message}
            isMine={isMine}
            actionLoading={actionLoading}
            counteringOfferId={counteringOfferId}
            counterPriceInput={counterPriceInput}
            onCounterPriceInputChange={setCounterPriceInput}
            onAccept={handleOfferAction}
            onReject={handleOfferAction}
            onStartCounter={handleStartCounterOffer}
            onSubmitCounter={handleSubmitCounterOffer}
            onCancelCounter={() => {
              setCounteringOfferId(null);
              setCounterPriceInput('');
            }}
            onCheckout={handleContinueToCheckoutWithOffer}
          />
        );
      }

      return <EventCard message={message} />;
    }

    const message = item.data;
    const isMine = message.sender_id === user?.id;

    return (
      <View
        style={[
          styles.messageBubble,
          isMine ? styles.messageBubbleMine : styles.messageBubbleOther,
        ]}
      >
        <Text style={[styles.messageText, isMine && styles.messageTextMine]}>
          {message.text}
        </Text>
      </View>
    );
  };

  if (!user) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>‹</Text>
          </Pressable>

          {listing?.cover_photo_url ? (
            <Image source={{ uri: listing.cover_photo_url }} style={styles.headerImage} />
          ) : (
            <View style={styles.headerImagePlaceholder} />
          )}

          <View style={styles.headerTextWrap}>
            <Text style={styles.headerName} numberOfLines={1}>
              {getCounterpartyName(counterparty)}
            </Text>

            <Text style={styles.headerTitle} numberOfLines={1}>
              {listing?.title || 'Producto'}
            </Text>

            {listing?.price_clp ? (
              <Text style={styles.headerPrice}>
                ${listing.price_clp.toLocaleString('es-CL')}
              </Text>
            ) : null}
          </View>
        </View>

        {order ? (
          <>
            <View style={styles.orderBanner}>
              <Text style={styles.orderBannerTitle}>
                {getOrderTitle(order.status)}
              </Text>
              <Text style={styles.orderBannerSubtitle}>
                {getOrderSubtitle(order.status, order)}
              </Text>
            </View>

            <OrderProgress status={order.status} />
          </>
        ) : null}

        {renderCTA()}

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={PRIMARY} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={timelineData}
            keyExtractor={(item) => item.data.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
          />
        )}

        <View style={styles.inputWrap}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Escribe un mensaje..."
            placeholderTextColor="#9CA3AF"
            style={styles.input}
            editable={!sending}
          />

          <Pressable
            onPress={sendMessage}
            disabled={sending || !input.trim()}
            style={[
              styles.sendButton,
              (sending || !input.trim()) && styles.sendButtonDisabled,
            ]}
          >
            <Text style={styles.sendButtonText}>
              {sending ? '...' : 'Enviar'}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function CTAButton({
  label,
  onPress,
  disabled,
  compact = false,
  secondary = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  compact?: boolean;
  secondary?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.ctaButton,
        compact && styles.ctaButtonCompact,
        secondary && styles.ctaButtonSecondary,
        disabled && styles.ctaButtonDisabled,
      ]}
    >
      <Text
        style={[
          styles.ctaButtonText,
          secondary && styles.ctaButtonTextSecondary,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function OrderProgress({ status }: { status?: string | null }) {
  const currentIndex = getOrderStepIndex(status);

  return (
    <View style={styles.progressWrap}>
      {ORDER_STEPS.map((step, index) => {
        const active = currentIndex >= index;
        const isLast = index === ORDER_STEPS.length - 1;

        return (
          <View key={step.key} style={styles.progressStep}>
            <View style={styles.progressNodeRow}>
              <View
                style={[
                  styles.progressDot,
                  active && styles.progressDotActive,
                ]}
              />
              {!isLast ? (
                <View
                  style={[
                    styles.progressLine,
                    currentIndex > index && styles.progressLineActive,
                  ]}
                />
              ) : null}
            </View>

            <Text
              style={[
                styles.progressLabel,
                active && styles.progressLabelActive,
              ]}
            >
              {step.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function OfferBubble({
  message,
  isMine,
  actionLoading,
  counteringOfferId,
  counterPriceInput,
  onCounterPriceInputChange,
  onAccept,
  onReject,
  onStartCounter,
  onSubmitCounter,
  onCancelCounter,
  onCheckout,
}: {
  message: Message;
  isMine: boolean;
  actionLoading: boolean;
  counteringOfferId: string | null;
  counterPriceInput: string;
  onCounterPriceInputChange: (value: string) => void;
  onAccept: (action: 'accept' | 'reject', offer: OfferRow) => void;
  onReject: (action: 'accept' | 'reject', offer: OfferRow) => void;
  onStartCounter: (offer: OfferRow) => void;
  onSubmitCounter: (offer: OfferRow) => void;
  onCancelCounter: () => void;
  onCheckout: (offer: OfferRow) => void;
}) {
  const offer = getOfferFromMessage(message);
  const isAccepted = message.event === 'offer_accepted';
  const isRejected = message.event === 'offer_rejected';
  const canRespond =
    !isMine &&
    (message.event === 'offer_pending' || message.event === 'offer_counter');

  if (!offer) {
    return <EventCard message={message} />;
  }

  return (
    <View
      style={[
        styles.offerCard,
        isMine ? styles.offerCardMine : styles.offerCardOther,
      ]}
    >
      <View style={styles.offerTopRow}>
        <Text style={styles.offerPill}>
          {getOfferStatusText(message.event)}
        </Text>

        <Text style={styles.offerAmount}>
          ${offer.price_clp.toLocaleString('es-CL')}
        </Text>
      </View>

      <Text style={styles.offerTitle}>
        {getOfferTitleText(message.event, isMine)}
      </Text>

      <Text style={styles.offerSubtitle}>
        {getOfferSubtitleText(message.event, isMine)}
      </Text>

      {isAccepted ? (
        <Pressable style={styles.offerCheckoutButton} onPress={() => onCheckout(offer)}>
          <Text style={styles.offerCheckoutButtonText}>Continuar con esta oferta</Text>
        </Pressable>
      ) : null}

      {canRespond ? (
        <>
          <View style={styles.offerActionsRow}>
            <Pressable
              disabled={actionLoading}
              onPress={() => onAccept('accept', offer)}
              style={[styles.offerPrimaryAction, actionLoading && styles.offerActionDisabled]}
            >
              <Text style={styles.offerPrimaryActionText}>Aceptar</Text>
            </Pressable>

            <Pressable
              disabled={actionLoading}
              onPress={() => onReject('reject', offer)}
              style={[styles.offerSecondaryAction, actionLoading && styles.offerActionDisabled]}
            >
              <Text style={styles.offerSecondaryActionText}>Rechazar</Text>
            </Pressable>
          </View>

          {counteringOfferId === offer.id ? (
            <View style={styles.counterBox}>
              <Text style={styles.counterLabel}>Tu contraoferta</Text>

              <TextInput
                value={counterPriceInput}
                onChangeText={(v) => onCounterPriceInputChange(v.replace(/[^0-9]/g, ''))}
                keyboardType="numeric"
                placeholder="Ej: 42000"
                placeholderTextColor="#9CA3AF"
                style={styles.counterInput}
              />

              <View style={styles.counterActionsRow}>
                <Pressable
                  disabled={actionLoading}
                  onPress={() => onSubmitCounter(offer)}
                  style={[styles.counterPrimaryButton, actionLoading && styles.offerActionDisabled]}
                >
                  <Text style={styles.counterPrimaryButtonText}>Enviar contraoferta</Text>
                </Pressable>

                <Pressable
                  disabled={actionLoading}
                  onPress={onCancelCounter}
                  style={styles.counterSecondaryButton}
                >
                  <Text style={styles.counterSecondaryButtonText}>Cancelar</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable
              disabled={actionLoading}
              onPress={() => onStartCounter(offer)}
              style={styles.offerCounterLinkWrap}
            >
              <Text style={styles.offerCounterLink}>Hacer contraoferta</Text>
            </Pressable>
          )}
        </>
      ) : null}

      {isRejected ? (
        <Text style={styles.offerEndedText}>
          Esta oferta ya no está activa.
        </Text>
      ) : null}
    </View>
  );
}

function EventCard({ message }: { message: Message }) {
  const content = getEventCardContent(message.event || '', message.payload || {});

  return (
    <View style={styles.eventCard}>
      <View style={styles.eventIconWrap}>
        <Text style={styles.eventIcon}>{content.icon}</Text>
      </View>

      <View style={styles.eventTextWrap}>
        <Text style={styles.eventTitle}>{content.title}</Text>
        <Text style={styles.eventSubtitle}>{content.subtitle}</Text>
      </View>
    </View>
  );
}

function getCounterpartyName(profile: Profile | null) {
  if (!profile) return 'Usuario';
  if (profile.display_name?.trim()) return profile.display_name.trim();

  const fullName = [profile.first_name, profile.last_name]
    .filter(Boolean)
    .join(' ')
    .trim();

  return fullName || 'Usuario';
}

function getOrderStepIndex(status?: string | null) {
  switch (status) {
    case 'PAID_HELD':
      return 0;
    case 'LABEL_CREATED':
      return 1;
    case 'IN_TRANSIT':
      return 2;
    case 'DELIVERED':
    case 'WAITING_48H':
      return 3;
    case 'RELEASED':
      return 4;
    default:
      return -1;
  }
}

function isOfferEvent(event?: string | null) {
  return (
    event === 'offer_pending' ||
    event === 'offer_counter' ||
    event === 'offer_accepted' ||
    event === 'offer_rejected'
  );
}

function getOfferFromMessage(message: Message): OfferRow | null {
  if (!message.payload) return null;

  return {
    id: String(message.payload.offer_id || ''),
    listing_id: String(message.payload.listing_id || ''),
    buyer_id: String(message.payload.buyer_id || ''),
    seller_id: String(message.payload.seller_id || ''),
    price_clp: Number(message.payload.price_clp || 0),
    status:
      message.event === 'offer_accepted'
        ? 'accepted'
        : message.event === 'offer_rejected'
        ? 'rejected'
        : 'pending',
  };
}

function getOfferStatusText(event?: string | null) {
  switch (event) {
    case 'offer_pending':
      return 'Oferta';
    case 'offer_counter':
      return 'Contraoferta';
    case 'offer_accepted':
      return 'Aceptada';
    case 'offer_rejected':
      return 'Rechazada';
    default:
      return 'Oferta';
  }
}

function getOfferTitleText(event?: string | null, isMine?: boolean) {
  switch (event) {
    case 'offer_pending':
      return isMine ? 'Enviaste una oferta' : 'Recibiste una oferta';
    case 'offer_counter':
      return isMine ? 'Enviaste una contraoferta' : 'Recibiste una contraoferta';
    case 'offer_accepted':
      return 'Oferta aceptada';
    case 'offer_rejected':
      return 'Oferta rechazada';
    default:
      return 'Oferta';
  }
}

function getOfferSubtitleText(event?: string | null, isMine?: boolean) {
  switch (event) {
    case 'offer_pending':
      return isMine
        ? 'Queda esperar la respuesta de la contraparte.'
        : 'Puedes aceptarla, rechazarla o enviar una contraoferta.';
    case 'offer_counter':
      return isMine
        ? 'Queda esperar la respuesta de la contraparte.'
        : 'Puedes aceptarla, rechazarla o volver a negociar.';
    case 'offer_accepted':
      return 'Puedes continuar la compra con este precio.';
    case 'offer_rejected':
      return 'La negociación terminó para esta oferta.';
    default:
      return '';
  }
}

function getEventCardContent(event: string, payload: Record<string, any>) {
  switch (event) {
    case 'payment_received':
      return {
        icon: '💸',
        title: 'Pago recibido',
        subtitle: 'El pago fue procesado correctamente.',
      };
    case 'label_ready':
      return {
        icon: '🏷️',
        title: 'Etiqueta lista',
        subtitle: 'Ya puedes descargar la etiqueta y despachar el pedido.',
      };
    case 'package_received_by_courier':
      return {
        icon: '📦',
        title: 'Paquete en camino',
        subtitle: 'El courier ya recibió el paquete.',
      };
    case 'delivered':
      return {
        icon: '📬',
        title: 'Producto entregado',
        subtitle: 'El comprador tiene 48h para confirmar o pedir devolución.',
      };
    case 'waiting_buyer_confirmation':
      return {
        icon: '⏳',
        title: 'Esperando confirmación',
        subtitle: 'Queda esperar la confirmación del comprador.',
      };
    case 'payment_released':
      return {
        icon: '🎉',
        title: 'Pago liberado',
        subtitle: 'El pedido fue completado y el pago fue liberado.',
      };
    case 'return_requested':
      return {
        icon: '↩️',
        title: 'Devolución solicitada',
        subtitle: 'Se inició una solicitud de devolución para este pedido.',
      };
    case 'return_under_review':
      return {
        icon: '🧐',
        title: 'Devolución en revisión',
        subtitle: 'Estamos revisando el caso.',
      };
    case 'return_approved':
      return {
        icon: '✅',
        title: 'Devolución aprobada',
        subtitle: 'La devolución fue aprobada.',
      };
    case 'return_rejected':
      return {
        icon: '✋',
        title: 'Devolución rechazada',
        subtitle: 'La devolución fue rechazada.',
      };
    case 'return_in_transit':
      return {
        icon: '🚚',
        title: 'Devolución en camino',
        subtitle: 'El producto va de regreso al vendedor.',
      };
    case 'return_received_by_seller':
      return {
        icon: '📥',
        title: 'Producto recibido por vendedor',
        subtitle: 'El vendedor ya recibió el producto devuelto.',
      };
    case 'refund_processed':
      return {
        icon: '💳',
        title: 'Reembolso procesado',
        subtitle: 'El reembolso fue procesado correctamente.',
      };
    case 'order_cancelled':
      return {
        icon: '✖️',
        title: 'Pedido cancelado',
        subtitle: 'Este pedido fue cancelado.',
      };
    default:
      return {
        icon: 'ℹ️',
        title: 'Actualización',
        subtitle: payload?.text || 'Hubo una actualización en este pedido.',
      };
  }
}

function getOrderTitle(status?: string | null) {
  switch (status) {
    case 'PAID_HELD':
      return 'Pago realizado';
    case 'LABEL_CREATED':
      return 'Etiqueta lista';
    case 'IN_TRANSIT':
      return 'En camino';
    case 'DELIVERED':
      return 'Entregado';
    case 'WAITING_48H':
      return 'Esperando confirmación';
    case 'RELEASED':
      return 'Completado';
    case 'DISPUTE_OPENED':
      return 'Devolución en revisión';
    case 'REFUNDED':
      return 'Reembolso procesado';
    case 'CANCELLED':
      return 'Pedido cancelado';
    default:
      return 'Pedido en proceso';
  }
}

function getOrderSubtitle(status?: string | null, order?: Order | null) {
  switch (status) {
    case 'PAID_HELD':
      return 'El vendedor debe preparar el envío.';
    case 'LABEL_CREATED':
      return order?.label_url
        ? 'La etiqueta ya está disponible para descarga.'
        : 'El envío fue creado correctamente.';
    case 'IN_TRANSIT':
      return order?.tracking_number
        ? `Tracking: ${order.tracking_number}`
        : 'El paquete va en camino.';
    case 'DELIVERED':
      return 'El producto fue entregado.';
    case 'WAITING_48H':
      return 'Tienes 48h para confirmar o solicitar devolución.';
    case 'RELEASED':
      return 'El pago fue liberado correctamente.';
    case 'DISPUTE_OPENED':
      return 'Estamos revisando la solicitud de devolución.';
    case 'REFUNDED':
      return 'El dinero fue devuelto al comprador.';
    case 'CANCELLED':
      return 'Este pedido fue cancelado.';
    default:
      return 'Te avisaremos ante cualquier actualización.';
  }
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
  },
  keyboard: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    backgroundColor: BG,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 30,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 28,
    color: '#111',
    lineHeight: 28,
  },
  headerImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginRight: 10,
    backgroundColor: '#E5E7EB',
  },
  headerImagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginRight: 10,
    backgroundColor: '#E5E7EB',
  },
  headerTextWrap: {
    flex: 1,
  },
  headerName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111',
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 13,
    color: MUTED,
  },
  headerPrice: {
    fontSize: 13,
    color: '#111',
    fontWeight: '600',
    marginTop: 2,
  },
  orderBanner: {
    backgroundColor: '#111',
    marginHorizontal: 12,
    marginTop: 12,
    padding: 16,
    borderRadius: 18,
  },
  orderBannerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  orderBannerSubtitle: {
    color: '#D6D3D1',
    fontSize: 13,
    lineHeight: 18,
  },
  progressWrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginHorizontal: 12,
    marginTop: 10,
    marginBottom: 4,
    paddingHorizontal: 6,
  },
  progressStep: {
    flex: 1,
    alignItems: 'center',
  },
  progressNodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
    marginBottom: 8,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: TRACK_INACTIVE,
    zIndex: 2,
  },
  progressDotActive: {
    backgroundColor: PRIMARY,
  },
  progressLine: {
    position: 'absolute',
    left: '50%',
    right: '-50%',
    height: 2,
    backgroundColor: TRACK_INACTIVE,
  },
  progressLineActive: {
    backgroundColor: PRIMARY,
  },
  progressLabel: {
    fontSize: 11,
    color: MUTED,
    textAlign: 'center',
  },
  progressLabelActive: {
    color: '#111',
    fontWeight: '600',
  },
  ctaRow: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 12,
    marginTop: 10,
  },
  ctaButton: {
    backgroundColor: PRIMARY,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginHorizontal: 12,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButtonCompact: {
    flex: 1,
    marginHorizontal: 0,
  },
  ctaButtonSecondary: {
    backgroundColor: '#E7E5E4',
  },
  ctaButtonDisabled: {
    opacity: 0.6,
  },
  ctaButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  ctaButtonTextSecondary: {
    color: '#111',
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 16,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 18,
    marginBottom: 10,
    maxWidth: '78%',
  },
  messageBubbleMine: {
    alignSelf: 'flex-end',
    backgroundColor: PRIMARY,
    borderBottomRightRadius: 6,
  },
  messageBubbleOther: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E7EB',
    borderBottomLeftRadius: 6,
  },
  messageText: {
    color: '#111',
    fontSize: 15,
    lineHeight: 20,
  },
  messageTextMine: {
    color: '#fff',
  },
  eventCard: {
    backgroundColor: CARD,
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  eventIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  eventIcon: {
    fontSize: 16,
  },
  eventTextWrap: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
    marginBottom: 4,
  },
  eventSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: MUTED,
  },
  offerCard: {
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BORDER,
    maxWidth: '84%',
  },
  offerCardMine: {
    alignSelf: 'flex-end',
    backgroundColor: '#F2F7F5',
  },
  offerCardOther: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
  },
  offerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  offerPill: {
    fontSize: 12,
    color: PRIMARY,
    fontWeight: '700',
    backgroundColor: '#EAF2EF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  offerAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  offerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
    marginTop: 12,
    marginBottom: 4,
  },
  offerSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: MUTED,
  },
  offerActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  offerPrimaryAction: {
    flex: 1,
    backgroundColor: SUCCESS,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  offerPrimaryActionText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  offerSecondaryAction: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  offerSecondaryActionText: {
    color: '#111',
    fontWeight: '600',
    fontSize: 13,
  },
  offerCounterLinkWrap: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  offerCounterLink: {
    color: PRIMARY,
    fontSize: 13,
    fontWeight: '600',
  },
  offerCheckoutButton: {
    marginTop: 14,
    backgroundColor: PRIMARY,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  offerCheckoutButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  offerEndedText: {
    marginTop: 12,
    fontSize: 12,
    color: MUTED,
  },
  offerActionDisabled: {
    opacity: 0.6,
  },
  counterBox: {
    marginTop: 14,
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: BORDER,
  },
  counterLabel: {
    fontSize: 12,
    color: MUTED,
    marginBottom: 8,
  },
  counterInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111',
  },
  counterActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  counterPrimaryButton: {
    flex: 1,
    backgroundColor: PRIMARY,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterPrimaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  counterSecondaryButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterSecondaryButtonText: {
    color: '#111',
    fontWeight: '600',
    fontSize: 12,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 12 : 14,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    backgroundColor: BG,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111',
    borderWidth: 1,
    borderColor: BORDER,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: PRIMARY,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});