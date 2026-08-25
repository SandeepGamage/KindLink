import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthContext } from '@/context/auth-context';
import { Palette, FunctionalColors, MaxContentWidth } from '@/constants/theme';
import { reviewService } from '@/services/review.service';
import {
  StarRatingIcon,
  BackArrowIcon,
  SparklesRatingIcon,
  MessageReviewIcon,
  SuccessBadgeIcon,
} from '@/components/ui/rating-icons';

const COMPLIMENT_TAGS = [
  '⏰ Punctual & On Time',
  '🤝 Patient & Gentle',
  '💡 Very Helpful & Skilled',
  '💬 Clear Communication',
  '💖 Caring & Respectful',
  '⭐ Went Above & Beyond',
  '🛡️ Made Me Feel Safe',
];

const RATING_DESCRIPTIONS: Record<number, { label: string; sub: string; color: string }> = {
  1: {
    label: 'Needs Improvement',
    sub: 'The service did not meet expectations',
    color: '#EF4444',
  },
  2: {
    label: 'Fair',
    sub: 'There is room for improvement',
    color: '#F59E0B',
  },
  3: {
    label: 'Good',
    sub: 'Satisfied with the support provided',
    color: '#10B981',
  },
  4: {
    label: 'Very Good',
    sub: 'Friendly, helpful, and attentive',
    color: Palette.secondary,
  },
  5: {
    label: 'Outstanding! 🌟',
    sub: 'Exceptional care, kindness, and support',
    color: '#E08A3C',
  },
};

export default function AddRatingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const { user } = useAuthContext();
  const params = useLocalSearchParams<{
    requestId?: string;
    title?: string;
    volunteerName?: string;
    category?: string;
    date?: string;
    address?: string;
    revieweeId?: string;
  }>();

  const requestId = params.requestId || 'req-3';
  const requestTitle = params.title || 'Help with Smartphone Settings & Video Calling';
  const volunteerName = params.volunteerName || 'Sarah Jenkins';
  const category = params.category || 'Tech Help';
  const requestDate = params.date || 'Aug 22, 2026';
  const requestAddress = params.address || 'Bambalapitiya, Colombo 04';
  const revieweeId = params.revieweeId;

  // Form State
  const [rating, setRating] = useState<number>(5);
  const [selectedTags, setSelectedTags] = useState<string[]>([
    '⏰ Punctual & On Time',
    '🤝 Patient & Gentle',
    '💡 Very Helpful & Skilled',
  ]);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoadingExisting, setIsLoadingExisting] = useState<boolean>(true);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

  // Load existing rating if available
  useEffect(() => {
    let isMounted = true;
    async function loadReview() {
      if (!requestId) {
        setIsLoadingExisting(false);
        return;
      }
      try {
        const existing = await reviewService.getReviewByRequest(requestId);
        if (isMounted && existing) {
          setIsEditMode(true);
          setRating(existing.rating || 5);
          if (existing.comment) setComment(existing.comment);
          if (Array.isArray(existing.tags) && existing.tags.length > 0) {
            setSelectedTags(existing.tags);
          }
        }
      } catch {
        // Silently proceed with defaults
      } finally {
        if (isMounted) setIsLoadingExisting(false);
      }
    }
    loadReview();
    return () => {
      isMounted = false;
    };
  }, [requestId]);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async () => {
    if (rating < 1 || rating > 5) {
      Alert.alert('Rating Required', 'Please choose a star rating from 1 to 5.');
      return;
    }

    setIsSubmitting(true);
    try {
      await reviewService.submitReview({
        request: requestId,
        rating,
        comment: comment.trim(),
        tags: selectedTags,
        reviewee: revieweeId,
        reviewer: user?._id || user?.id,
      });

      setShowSuccessModal(true);
    } catch (err: any) {
      Alert.alert('Submission Error', err.message || 'Could not save rating. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentDesc = RATING_DESCRIPTIONS[rating] || RATING_DESCRIPTIONS[5];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#0D151D' : Palette.surface,
          paddingTop: Math.max(insets.top, 16),
        },
      ]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Pressable
          onPress={() => router.back()}
          accessibilityLabel="Go back"
          style={({ pressed }) => [
            styles.backBtn,
            {
              backgroundColor: isDark ? Palette.ink : Palette.primary,
              borderColor: isDark ? '#23384B' : Palette.border,
              opacity: pressed ? 0.7 : 1,
            },
          ]}>
          <BackArrowIcon size={22} color={isDark ? Palette.primary : Palette.secondary} />
        </Pressable>
        <View style={styles.headerTitleWrap}>
          <Text style={[styles.headerTitle, { color: isDark ? Palette.primary : Palette.ink }]}>
            {isEditMode ? 'Edit Rating & Review' : 'Add Rating & Review'}
          </Text>
          <Text style={[styles.headerSubtitle, { color: isDark ? '#94A7B8' : FunctionalColors.textSecondary }]}>
            Share feedback for your completed support
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {/* Request Summary Context Card */}
        <View
          style={[
            styles.summaryCard,
            {
              backgroundColor: isDark ? Palette.ink : Palette.primary,
              borderColor: isDark ? '#23384B' : Palette.border,
            },
          ]}>
          <View style={styles.cardHeader}>
            <View
              style={[
                styles.categoryBadge,
                {
                  backgroundColor: isDark ? 'rgba(31, 92, 150, 0.3)' : Palette.blueTint,
                },
              ]}>
              <Text style={[styles.categoryText, { color: isDark ? '#60A5FA' : Palette.secondary }]}>
                {category}
              </Text>
            </View>

            <View style={[styles.statusBadge, { backgroundColor: FunctionalColors.successBg }]}>
              <Text style={[styles.statusText, { color: FunctionalColors.successText }]}>
                Completed
              </Text>
            </View>
          </View>

          <Text
            style={[
              styles.requestTitle,
              { color: isDark ? Palette.primary : Palette.ink },
            ]}>
            {requestTitle}
          </Text>

          <View style={styles.volunteerRow}>
            <View style={[styles.volunteerAvatar, { backgroundColor: Palette.secondary }]}>
              <Text style={styles.volunteerAvatarText}>
                {volunteerName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.volunteerInfo}>
              <Text style={[styles.volunteerName, { color: isDark ? Palette.primary : Palette.ink }]}>
                {volunteerName}
              </Text>
              <Text style={[styles.volunteerRole, { color: isDark ? '#94A7B8' : FunctionalColors.textSecondary }]}>
                Assisting Volunteer Helper
              </Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <Text style={[styles.metaText, { color: isDark ? '#94A7B8' : FunctionalColors.textSecondary }]}>
              📅 {requestDate}
            </Text>
            <Text style={[styles.metaText, { color: isDark ? '#94A7B8' : FunctionalColors.textSecondary }]}>
              📍 {requestAddress}
            </Text>
          </View>
        </View>

        {/* 1-5 Star Interactive Rating Card */}
        <View
          style={[
            styles.ratingCard,
            {
              backgroundColor: isDark ? Palette.ink : Palette.primary,
              borderColor: isDark ? '#23384B' : Palette.border,
            },
          ]}>
          <View style={styles.sectionHeaderRow}>
            <SparklesRatingIcon size={22} color="#F59E0B" />
            <Text style={[styles.sectionTitle, { color: isDark ? Palette.primary : Palette.ink }]}>
              How was your experience?
            </Text>
          </View>
          <Text style={[styles.sectionSubtitle, { color: isDark ? '#94A7B8' : FunctionalColors.textSecondary }]}>
            Tap a star to rate {volunteerName}
          </Text>

          {/* Stars Row */}
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((starNum) => {
              const isFilled = starNum <= rating;
              return (
                <Pressable
                  key={starNum}
                  onPress={() => setRating(starNum)}
                  accessibilityLabel={`Rate ${starNum} out of 5 stars`}
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    styles.starTouchArea,
                    pressed && { transform: [{ scale: 1.15 }] },
                  ]}>
                  <StarRatingIcon
                    size={38}
                    filled={isFilled}
                    color="#F59E0B"
                    strokeWidth={1.8}
                  />
                  <Text
                    style={[
                      styles.starNumberText,
                      {
                        color: isFilled
                          ? '#F59E0B'
                          : isDark
                          ? '#64748B'
                          : '#94A3B8',
                        fontWeight: isFilled ? '800' : '500',
                      },
                    ]}>
                    {starNum}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Dynamic Sentiment Banner */}
          <View
            style={[
              styles.sentimentBanner,
              {
                backgroundColor: isDark ? '#162330' : Palette.surface,
                borderColor: isDark ? '#23384B' : Palette.border,
              },
            ]}>
            <Text style={[styles.sentimentLabel, { color: currentDesc.color }]}>
              {currentDesc.label}
            </Text>
            <Text style={[styles.sentimentSub, { color: isDark ? '#94A7B8' : FunctionalColors.textSecondary }]}>
              {currentDesc.sub}
            </Text>
          </View>
        </View>

        {/* Compliment Tags */}
        <View
          style={[
            styles.tagsCard,
            {
              backgroundColor: isDark ? Palette.ink : Palette.primary,
              borderColor: isDark ? '#23384B' : Palette.border,
            },
          ]}>
          <Text style={[styles.sectionTitle, { color: isDark ? Palette.primary : Palette.ink }]}>
            What stood out most?
          </Text>
          <Text style={[styles.sectionSubtitle, { color: isDark ? '#94A7B8' : FunctionalColors.textSecondary }]}>
            Select all positive traits that apply
          </Text>

          <View style={styles.tagsWrap}>
            {COMPLIMENT_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <Pressable
                  key={tag}
                  onPress={() => toggleTag(tag)}
                  style={[
                    styles.tagPill,
                    {
                      backgroundColor: isSelected
                        ? isDark
                          ? 'rgba(31, 92, 150, 0.45)'
                          : Palette.blueTint
                        : isDark
                        ? '#162330'
                        : Palette.surface,
                      borderColor: isSelected
                        ? Palette.secondary
                        : isDark
                        ? '#23384B'
                        : Palette.border,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.tagPillText,
                      {
                        color: isSelected
                          ? isDark
                            ? '#60A5FA'
                            : Palette.secondary
                          : isDark
                          ? '#94A7B8'
                          : FunctionalColors.textSecondary,
                        fontWeight: isSelected ? '700' : '500',
                      },
                    ]}>
                    {tag}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Written Review Comment Box */}
        <View
          style={[
            styles.commentCard,
            {
              backgroundColor: isDark ? Palette.ink : Palette.primary,
              borderColor: isDark ? '#23384B' : Palette.border,
            },
          ]}>
          <View style={styles.sectionHeaderRow}>
            <MessageReviewIcon size={20} color={Palette.secondary} />
            <Text style={[styles.sectionTitle, { color: isDark ? Palette.primary : Palette.ink }]}>
              Write a Review Comment
            </Text>
          </View>
          <Text style={[styles.sectionSubtitle, { color: isDark ? '#94A7B8' : FunctionalColors.textSecondary }]}>
            Leave a kind note or describe how {volunteerName} assisted you
          </Text>

          <TextInput
            style={[
              styles.commentInput,
              {
                backgroundColor: isDark ? '#111C26' : Palette.surface,
                color: isDark ? Palette.primary : Palette.ink,
                borderColor: isDark ? '#23384B' : Palette.border,
              },
            ]}
            multiline
            numberOfLines={4}
            maxLength={500}
            placeholder={`e.g. Sarah was extremely friendly and patient while explaining how to use WhatsApp and video calling. She made sure everything worked before leaving!`}
            placeholderTextColor={isDark ? '#5A6E7F' : FunctionalColors.textMuted}
            value={comment}
            onChangeText={setComment}
            textAlignVertical="top"
          />

          <View style={styles.charCountRow}>
            <Text style={[styles.charCountText, { color: isDark ? '#64748B' : FunctionalColors.textMuted }]}>
              {comment.length} / 500 characters
            </Text>
          </View>
        </View>

        {/* Trust & Safety Reassurance Box */}
        <View
          style={[
            styles.trustBanner,
            {
              backgroundColor: isDark ? 'rgba(31, 92, 150, 0.18)' : '#EFF6FF',
              borderColor: isDark ? '#1F4068' : '#BFDBFE',
            },
          ]}>
          <Text style={styles.trustBannerIcon}>🛡️</Text>
          <View style={styles.trustBannerContent}>
            <Text style={[styles.trustBannerTitle, { color: isDark ? '#93C5FD' : '#1E40AF' }]}>
              KindLink Community Trust
            </Text>
            <Text style={[styles.trustBannerText, { color: isDark ? '#CBD5E1' : '#3B82F6' }]}>
              Your rating helps recognize outstanding volunteers and maintain high safety and care standards for seniors.
            </Text>
          </View>
        </View>

        {/* Submit Button */}
        <Pressable
          onPress={handleSubmit}
          disabled={isSubmitting || rating === 0}
          style={({ pressed }) => [
            styles.submitButton,
            {
              backgroundColor: Palette.secondary,
              opacity: isSubmitting || rating === 0 ? 0.6 : pressed ? 0.88 : 1,
            },
          ]}>
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.submitButtonText}>
              {isEditMode ? 'Update Rating & Review' : 'Submit Rating & Review'}
            </Text>
          )}
        </Pressable>
      </ScrollView>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowSuccessModal(false);
          router.replace('/(client)/requests');
        }}>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: isDark ? Palette.ink : Palette.primary,
                borderColor: isDark ? '#23384B' : Palette.border,
              },
            ]}>
            <SuccessBadgeIcon size={64} color="#10B981" />
            <Text style={[styles.modalTitle, { color: isDark ? Palette.primary : Palette.ink }]}>
              Thank You for Your Feedback!
            </Text>
            <Text style={[styles.modalMessage, { color: isDark ? '#94A7B8' : FunctionalColors.textSecondary }]}>
              Your {rating}-star rating and review for {volunteerName} has been recorded successfully.
            </Text>

            <Pressable
              onPress={() => {
                setShowSuccessModal(false);
                router.replace('/(client)/requests');
              }}
              style={[styles.modalBtn, { backgroundColor: Palette.secondary }]}>
              <Text style={styles.modalBtnText}>Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
    gap: 16,
  },
  summaryCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 12,
  },
  volunteerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
    paddingVertical: 6,
  },
  volunteerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  volunteerAvatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  volunteerInfo: {
    flex: 1,
  },
  volunteerName: {
    fontSize: 15,
    fontWeight: '700',
  },
  volunteerRole: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 1,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.12)',
  },
  metaText: {
    fontSize: 12,
    fontWeight: '500',
  },
  ratingCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 16,
    textAlign: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginVertical: 10,
  },
  starTouchArea: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  starNumberText: {
    fontSize: 12,
    marginTop: 4,
  },
  sentimentBanner: {
    marginTop: 14,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    width: '100%',
  },
  sentimentLabel: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  sentimentSub: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  tagsCard: {
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  tagPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
  },
  tagPillText: {
    fontSize: 13,
  },
  commentCard: {
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  commentInput: {
    minHeight: 110,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  charCountRow: {
    alignItems: 'flex-end',
    marginTop: 6,
  },
  charCountText: {
    fontSize: 12,
    fontWeight: '500',
  },
  trustBanner: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    alignItems: 'flex-start',
  },
  trustBannerIcon: {
    fontSize: 22,
    marginTop: 2,
  },
  trustBannerContent: {
    flex: 1,
  },
  trustBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  trustBannerText: {
    fontSize: 12,
    lineHeight: 17,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    shadowColor: Palette.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 380,
    padding: 28,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  modalBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
