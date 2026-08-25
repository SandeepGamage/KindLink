import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthContext } from '@/context/auth-context';
import { Palette, FunctionalColors, MaxContentWidth } from '@/constants/theme';
import { reviewService, Review } from '@/services/review.service';
import { StarRatingIcon } from '@/components/ui/rating-icons';

export default function ClientRequestsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const { user } = useAuthContext();
  const [activeFilter, setActiveFilter] = useState<'active' | 'completed'>('active');
  const [reviewsMap, setReviewsMap] = useState<Record<string, Review>>({});

  const isElderly =
    user?.role?.toLowerCase() === 'elderly' ||
    user?.role?.toLowerCase() === 'senior';

  const sampleRequests = [
    {
      id: 'req-1',
      title: 'Weekly Grocery Shopping Assistance',
      category: 'Groceries',
      status: 'In Progress',
      volunteerName: 'Alex Fernando',
      urgency: 'Medium',
      date: 'Today, 3:00 PM',
      address: 'Colombo 07, Cinnamon Gardens',
    },
    {
      id: 'req-2',
      title: 'Pharmacy Prescription Pickup',
      category: 'Medical',
      status: 'Pending Match',
      volunteerName: 'Finding volunteer...',
      urgency: 'High',
      date: 'Tomorrow, 10:00 AM',
      address: 'Union Place, Colombo 02',
    },
    {
      id: 'req-3',
      title: 'Help with Smartphone Settings & Video Calling',
      category: 'Tech Help',
      status: 'Completed',
      volunteerName: 'Sarah Jenkins',
      urgency: 'Normal',
      date: 'Aug 22, 2026',
      address: 'Bambalapitiya, Colombo 04',
    },
  ];

  // Fetch reviews for completed requests to reflect rating state
  const loadRatings = useCallback(async () => {
    try {
      const completedRequests = sampleRequests.filter((r) => r.status === 'Completed');
      const results = await Promise.all(
        completedRequests.map(async (r) => {
          const rev = await reviewService.getReviewByRequest(r.id);
          return { id: r.id, review: rev };
        })
      );

      const map: Record<string, Review> = {};
      results.forEach((item) => {
        if (item.review) {
          map[item.id] = item.review;
        }
      });
      setReviewsMap(map);
    } catch {
      // Keep empty map if network unavailable
    }
  }, []);

  useEffect(() => {
    loadRatings();
  }, [loadRatings]);

  const handleActionPress = (req: (typeof sampleRequests)[0]) => {
    if (req.status === 'Completed') {
      router.push({
        pathname: '/(client)/add-rating',
        params: {
          requestId: req.id,
          title: req.title,
          volunteerName: req.volunteerName,
          category: req.category,
          date: req.date,
          address: req.address,
        },
      });
    }
  };

  const filteredRequests = sampleRequests.filter((r) =>
    activeFilter === 'active' ? r.status !== 'Completed' : r.status === 'Completed'
  );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#0D151D' : Palette.surface,
          paddingTop: Math.max(insets.top, 16),
        },
      ]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Page Title & Action */}
        <View style={styles.titleRow}>
          <View>
            <Text
              style={[
                styles.pageTitle,
                { color: isDark ? Palette.primary : Palette.ink },
              ]}>
              Assistance Requests
            </Text>
            <Text
              style={[
                styles.pageSubtitle,
                { color: isDark ? '#94A7B8' : FunctionalColors.textSecondary },
              ]}>
              {isElderly
                ? 'Your requested support tasks and updates'
                : 'Community requests you are supporting'}
            </Text>
          </View>
        </View>

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          <Pressable
            onPress={() => setActiveFilter('active')}
            style={[
              styles.filterPill,
              activeFilter === 'active' && styles.filterPillActive,
              {
                backgroundColor:
                  activeFilter === 'active'
                    ? Palette.secondary
                    : isDark ? Palette.ink : Palette.primary,
                borderColor: isDark ? '#23384B' : Palette.border,
                borderWidth: 1,
              },
            ]}>
            <Text
              style={[
                styles.filterText,
                {
                  color:
                    activeFilter === 'active'
                      ? Palette.primary
                      : isDark ? '#94A7B8' : FunctionalColors.textSecondary,
                },
              ]}>
              Active & Pending ({sampleRequests.filter((r) => r.status !== 'Completed').length})
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveFilter('completed')}
            style={[
              styles.filterPill,
              activeFilter === 'completed' && styles.filterPillActive,
              {
                backgroundColor:
                  activeFilter === 'completed'
                    ? Palette.secondary
                    : isDark ? Palette.ink : Palette.primary,
                borderColor: isDark ? '#23384B' : Palette.border,
                borderWidth: 1,
              },
            ]}>
            <Text
              style={[
                styles.filterText,
                {
                  color:
                    activeFilter === 'completed'
                      ? Palette.primary
                      : isDark ? '#94A7B8' : FunctionalColors.textSecondary,
                },
              ]}>
              Completed ({sampleRequests.filter((r) => r.status === 'Completed').length})
            </Text>
          </Pressable>
        </View>

        {/* Requests List */}
        <View style={styles.listContainer}>
          {filteredRequests.map((req) => {
            const isCompleted = req.status === 'Completed';
            const existingReview = reviewsMap[req.id];

            return (
              <View
                key={req.id}
                style={[
                  styles.requestCard,
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
                        backgroundColor: isDark
                          ? 'rgba(31, 92, 150, 0.3)'
                          : Palette.blueTint,
                      },
                    ]}>
                    <Text style={[styles.categoryText, { color: isDark ? '#60A5FA' : Palette.secondary }]}>
                      {req.category}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          req.status === 'Completed'
                            ? FunctionalColors.successBg
                            : req.status === 'In Progress'
                            ? Palette.blueTint
                            : FunctionalColors.accentLight,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.statusText,
                        {
                          color:
                            req.status === 'Completed'
                              ? FunctionalColors.successText
                              : req.status === 'In Progress'
                              ? Palette.secondary
                              : Palette.accent,
                        },
                      ]}>
                      {req.status}
                    </Text>
                  </View>
                </View>

                <Text
                  style={[
                    styles.cardTitle,
                    { color: isDark ? Palette.primary : Palette.ink },
                  ]}>
                  {req.title}
                </Text>

                <View style={styles.metaRow}>
                  <Text
                    style={[
                      styles.metaText,
                      { color: isDark ? '#94A7B8' : FunctionalColors.textSecondary },
                    ]}>
                    📅 {req.date}
                  </Text>
                  <Text
                    style={[
                      styles.metaText,
                      { color: isDark ? '#94A7B8' : FunctionalColors.textSecondary },
                    ]}>
                    📍 {req.address}
                  </Text>
                </View>

                {/* Rating badge if already submitted */}
                {existingReview && (
                  <View
                    style={[
                      styles.ratedBadgeRow,
                      {
                        backgroundColor: isDark ? '#162330' : '#FEF3C7',
                        borderColor: isDark ? '#23384B' : '#FDE68A',
                      },
                    ]}>
                    <View style={styles.ratedBadgeLeft}>
                      <StarRatingIcon size={16} filled={true} color="#F59E0B" />
                      <Text style={[styles.ratedScoreText, { color: isDark ? '#FBBF24' : '#B45309' }]}>
                        Rated {existingReview.rating}.0 / 5.0
                      </Text>
                    </View>
                    {existingReview.comment ? (
                      <Text
                        numberOfLines={1}
                        style={[styles.ratedCommentPreview, { color: isDark ? '#94A7B8' : '#78350F' }]}>
                        "{existingReview.comment}"
                      </Text>
                    ) : null}
                  </View>
                )}

                <View
                  style={[
                    styles.cardFooter,
                    { borderTopColor: isDark ? '#23384B' : Palette.border },
                  ]}>
                  <Text
                    style={[
                      styles.footerHelperText,
                      { color: isDark ? '#CBD5E1' : FunctionalColors.textSecondary },
                    ]}>
                    👤 {req.volunteerName}
                  </Text>

                  {isCompleted ? (
                    <Pressable
                      onPress={() => handleActionPress(req)}
                      style={({ pressed }) => [
                        styles.addRatingBtn,
                        {
                          backgroundColor: existingReview ? (isDark ? '#1E3A5F' : Palette.blueTint) : Palette.secondary,
                          borderColor: existingReview ? Palette.secondary : 'transparent',
                          borderWidth: existingReview ? 1 : 0,
                          opacity: pressed ? 0.8 : 1,
                        },
                      ]}>
                      <StarRatingIcon
                        size={15}
                        filled={true}
                        color={existingReview ? (isDark ? '#60A5FA' : Palette.secondary) : '#F59E0B'}
                      />
                      <Text
                        style={[
                          styles.addRatingBtnText,
                          {
                            color: existingReview ? (isDark ? '#60A5FA' : Palette.secondary) : '#FFFFFF',
                          },
                        ]}>
                        {existingReview ? 'Edit Rating' : 'Add Rating'}
                      </Text>
                    </Pressable>
                  ) : (
                    <Pressable
                      style={[
                        styles.actionBtn,
                        { backgroundColor: Palette.secondary },
                      ]}>
                      <Text style={styles.actionBtnText}>View Details</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 110,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  titleRow: {
    marginTop: 8,
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  filterPillActive: {},
  filterText: {
    fontSize: 13,
    fontWeight: '700',
  },
  listContainer: {
    gap: 14,
  },
  requestCard: {
    padding: 18,
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
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 10,
  },
  metaRow: {
    gap: 6,
    marginBottom: 14,
  },
  metaText: {
    fontSize: 13,
    fontWeight: '500',
  },
  ratedBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  ratedBadgeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  ratedScoreText: {
    fontSize: 12,
    fontWeight: '700',
  },
  ratedCommentPreview: {
    fontSize: 12,
    fontStyle: 'italic',
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  footerHelperText: {
    fontSize: 13,
    fontWeight: '600',
  },
  actionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  addRatingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  addRatingBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
