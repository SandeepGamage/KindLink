import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
  useColorScheme,
  ScrollView,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Palette, FunctionalColors } from '@/constants/theme';
import { StarRatingIcon } from '@/components/ui/rating-icons';

interface ManageRatingModalProps {
  visible: boolean;
  onClose: () => void;
  requestTitle: string;
  volunteerName: string;
  rating: number;
  comment?: string;
  tags?: string[];
  date?: string;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
}

const RATING_SENTIMENTS: Record<number, { label: string; color: string }> = {
  1: { label: 'Needs Improvement', color: '#EF4444' },
  2: { label: 'Fair', color: '#F59E0B' },
  3: { label: 'Good', color: '#10B981' },
  4: { label: 'Very Good', color: Palette.secondary },
  5: { label: 'Outstanding! 🌟', color: '#E08A3C' },
};

export function ManageRatingModal({
  visible,
  onClose,
  requestTitle,
  volunteerName,
  rating,
  comment,
  tags = [],
  date,
  onEdit,
  onDelete,
  isDeleting = false,
}: ManageRatingModalProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const slideAnim = useRef(new Animated.Value(Dimensions.get('window').height)).current;
  const [modalVisible, setModalVisible] = React.useState(visible);

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      requestAnimationFrame(() => {
        slideAnim.setValue(Dimensions.get('window').height);
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          mass: 0.8,
          stiffness: 100,
        }).start();
      });
    } else if (modalVisible) {
      Animated.timing(slideAnim, {
        toValue: Dimensions.get('window').height,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        setModalVisible(false);
      });
    }
  }, [visible, slideAnim]);

  const roundedRating = Math.round(rating) || 5;
  const sentiment = RATING_SENTIMENTS[roundedRating] || RATING_SENTIMENTS[5];

  const bgColor = isDark ? '#111C26' : Palette.primary;
  const cardBg = isDark ? '#162330' : Palette.surface;
  const borderColor = isDark ? '#23384B' : Palette.border;
  const textColor = isDark ? Palette.primary : Palette.ink;
  const subtextColor = isDark ? '#94A7B8' : FunctionalColors.textSecondary;

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View
          style={[
            styles.sheetContainer,
            { backgroundColor: bgColor, borderColor },
            { transform: [{ translateY: slideAnim }] },
          ]}>
          {/* Top Drag Handle */}
          <View style={[styles.handle, { backgroundColor: borderColor }]} />

          {/* Close button (top right) */}
          <Pressable
            onPress={onClose}
            hitSlop={12}
            accessibilityLabel="Close"
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.closeBtn,
              {
                backgroundColor: isDark ? '#1C2C3C' : Palette.surface,
                borderColor,
                opacity: pressed ? 0.7 : 1,
              },
            ]}>
            <Ionicons name="close" size={18} color={textColor} />
          </Pressable>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}>
            {/* Header with Star Badge */}
            <View style={styles.headerRow}>
              <View
                style={[
                  styles.badgeContainer,
                  {
                    backgroundColor: isDark
                      ? 'rgba(224, 138, 60, 0.2)'
                      : 'rgba(224, 138, 60, 0.12)',
                  },
                ]}>
                <Ionicons name="star" size={24} color={Palette.accent} />
              </View>
              <View style={styles.headerInfo}>
                <Text style={[styles.headerTitle, { color: textColor }]}>
                  Your Rating & Review
                </Text>
                <Text style={[styles.headerSubtitle, { color: subtextColor }]} numberOfLines={1}>
                  {requestTitle}
                </Text>
                <Text style={[styles.volunteerName, { color: Palette.secondary }]} numberOfLines={1}>
                  Helper: {volunteerName}
                </Text>
              </View>
            </View>

            {/* Rating Highlight Card */}
            <View style={[styles.ratingCard, { backgroundColor: cardBg, borderColor }]}>
              {/* Star Rating & Score */}
              <View style={styles.scoreRow}>
                <View style={styles.starsWrapper}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarRatingIcon
                      key={star}
                      size={24}
                      filled={star <= rating}
                      color="#F59E0B"
                    />
                  ))}
                </View>
                <View style={styles.ratingNumberBadge}>
                  <Text style={styles.ratingNumberText}>{rating.toFixed(1)}</Text>
                  <Text style={[styles.ratingMaxText, { color: subtextColor }]}>/ 5.0</Text>
                </View>
              </View>

              {/* Sentiment Pill */}
              <View
                style={[
                  styles.sentimentPill,
                  {
                    backgroundColor: isDark
                      ? 'rgba(255, 255, 255, 0.06)'
                      : 'rgba(0, 0, 0, 0.04)',
                  },
                ]}>
                <View style={[styles.sentimentDot, { backgroundColor: sentiment.color }]} />
                <Text style={[styles.sentimentText, { color: sentiment.color }]}>
                  {sentiment.label}
                </Text>
              </View>

              {/* Compliment Tags */}
              {tags && tags.length > 0 && (
                <View style={styles.tagsContainer}>
                  <Text style={[styles.sectionLabel, { color: subtextColor }]}>
                    Compliments Given
                  </Text>
                  <View style={styles.tagsWrap}>
                    {tags.map((tag, idx) => (
                      <View
                        key={idx}
                        style={[
                          styles.tagChip,
                          {
                            backgroundColor: isDark
                              ? 'rgba(31, 92, 150, 0.35)'
                              : Palette.blueTint,
                            borderColor: isDark ? '#1F5C96' : 'rgba(31, 92, 150, 0.2)',
                          },
                        ]}>
                        <Text
                          style={[
                            styles.tagChipText,
                            { color: isDark ? '#93C5FD' : Palette.secondary },
                          ]}>
                          {tag}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Review Comment Note */}
              {comment && comment.trim().length > 0 && (
                <View style={styles.commentContainer}>
                  <Text style={[styles.sectionLabel, { color: subtextColor }]}>
                    Your Written Note
                  </Text>
                  <View
                    style={[
                      styles.commentBox,
                      {
                        backgroundColor: isDark ? '#111C26' : Palette.primary,
                        borderColor,
                      },
                    ]}>
                    <Ionicons
                      name="chatbubble-ellipses-outline"
                      size={16}
                      color={Palette.secondary}
                      style={{ marginRight: 6, marginTop: 1 }}
                    />
                    <Text style={[styles.commentText, { color: textColor }]}>
                      {comment.trim()}
                    </Text>
                  </View>
                </View>
              )}

              {date && (
                <Text style={[styles.dateText, { color: subtextColor }]}>
                  Submitted on {date}
                </Text>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
              <Pressable
                onPress={() => {
                  onClose();
                  onEdit();
                }}
                accessibilityRole="button"
                accessibilityLabel="Edit Rating and Review"
                style={({ pressed }) => [
                  styles.editButton,
                  {
                    backgroundColor: Palette.secondary,
                    opacity: pressed ? 0.88 : 1,
                  },
                ]}>
                <Ionicons name="create-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.editButtonText}>Edit Rating & Review</Text>
              </Pressable>

              <Pressable
                onPress={onDelete}
                disabled={isDeleting}
                accessibilityRole="button"
                accessibilityLabel="Delete Rating"
                style={({ pressed }) => [
                  styles.deleteButton,
                  {
                    backgroundColor: isDark ? 'rgba(239, 68, 68, 0.12)' : '#FEF2F2',
                    borderColor: isDark ? 'rgba(239, 68, 68, 0.35)' : '#FECACA',
                    opacity: isDeleting ? 0.6 : pressed ? 0.85 : 1,
                  },
                ]}>
                <Ionicons name="trash-outline" size={18} color={FunctionalColors.danger} style={{ marginRight: 8 }} />
                <Text style={styles.deleteButtonText}>Delete Rating</Text>
              </Pressable>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
    maxHeight: '90%',
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 16,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
    paddingRight: 40,
  },
  badgeContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  volunteerName: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 1,
  },
  ratingCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  starsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingNumberBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  ratingNumberText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F59E0B',
  },
  ratingMaxText: {
    fontSize: 13,
    fontWeight: '600',
  },
  sentimentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 6,
  },
  sentimentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sentimentText: {
    fontSize: 13,
    fontWeight: '700',
  },
  tagsContainer: {
    marginTop: 4,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  tagChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  commentContainer: {
    marginTop: 4,
  },
  commentBox: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'flex-start',
  },
  commentText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  dateText: {
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 2,
  },
  actionsContainer: {
    gap: 10,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 16,
    shadowColor: Palette.secondary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
  },
  deleteButtonText: {
    color: FunctionalColors.danger,
    fontSize: 15,
    fontWeight: '700',
  },
});
