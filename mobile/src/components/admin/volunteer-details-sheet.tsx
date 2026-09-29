import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Mail, Phone, Clock, FileText, Maximize2 } from 'lucide-react-native';
import { BottomSheetModal } from '@/components/ui/bottom-sheet-modal';
import { ImagePreviewModal } from '@/components/ui/image-preview-modal';
import { Avatar } from './avatar';
import { Button } from './button';
import { StatusBadge } from './status-badge';
import { AvailabilityChips } from './availability-chips';
import { Radius } from './tokens';
import { useAdminTheme } from '@/hooks/use-admin-theme';
import { formatDateTime } from '@/utils/admin-time';
import { resolveMediaUrl } from '@/services/api-config';
import type { VolunteerApplication } from '@/types/volunteer-application';

interface VolunteerDetailsSheetProps {
  /** Kept mounted through the closing animation, so this may lag `visible`. */
  application: VolunteerApplication | null;
  visible: boolean;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}

/**
 * Expanded view of a volunteer application: contact details, when they applied,
 * their full availability breakdown and the uploaded ID document.
 *
 * This is also where an application is approved or rejected — the summary card
 * only links here, so the decision is never made sight-unseen. The body scrolls
 * inside the sheet's 90% height cap while the approve/reject row stays pinned to
 * the bottom; already-decided applications get no footer and close via the X.
 */
export function VolunteerDetailsSheet({
  application,
  visible,
  onClose,
  onApprove,
  onReject,
}: VolunteerDetailsSheetProps) {
  const c = useAdminTheme();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // The caller clears its selection the moment the sheet is asked to close, so
  // hold the last application to render through the 250ms dismiss animation.
  const lastApplication = useRef<VolunteerApplication | null>(null);
  if (application) lastApplication.current = application;
  const data = application ?? lastApplication.current;

  // Never reopen the sheet with a stale preview on top of it.
  useEffect(() => {
    if (!visible) setIsPreviewOpen(false);
  }, [visible]);

  const isPending = data?.status === 'Pending';
  const documentUri = resolveMediaUrl(data?.idDocument.uri);

  return (
    <BottomSheetModal
      visible={visible}
      onClose={onClose}
      minHeight={0}
      backgroundColor={c.card}
      showCloseButton
      closeButtonColor={c.textSecondary}
      closeButtonBackgroundColor={c.surface}
      closeButtonBorderColor={c.border}
    >
      {data && (
        <>
          <View style={styles.body}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.bodyContent}
            >
              {/* Profile header */}
              <View style={styles.profileHeader}>
                <Avatar name={data.name} uri={data.profileImage} size={64} />
                <View style={styles.profileHeaderText}>
                  <Text style={[styles.name, { color: c.text }]}>{data.name}</Text>
                  <StatusBadge
                    label={data.status}
                    tone={
                      data.status === 'Approved'
                        ? 'success'
                        : data.status === 'Rejected'
                          ? 'danger'
                          : 'warning'
                    }
                    style={styles.headerBadge}
                  />
                </View>
              </View>

              {/* Contact details */}
              <Text style={[styles.sectionTitle, { color: c.text }]}>Contact Details</Text>
              <View style={[styles.panel, { backgroundColor: c.surface, borderColor: c.border }]}>
                <View style={styles.panelRow}>
                  <Mail size={18} color={c.primary} />
                  <Text style={[styles.panelText, { color: c.textSecondary }]} numberOfLines={1}>
                    {data.email || '—'}
                  </Text>
                </View>
                <View style={[styles.panelDivider, { backgroundColor: c.divider }]} />
                <View style={styles.panelRow}>
                  <Phone size={18} color={c.primary} />
                  <Text style={[styles.panelText, { color: c.textSecondary }]}>
                    {data.mobile || '—'}
                  </Text>
                </View>
              </View>

              {/* Application time */}
              <Text style={[styles.sectionTitle, { color: c.text }]}>Application Time</Text>
              <View style={[styles.panel, { backgroundColor: c.surface, borderColor: c.border }]}>
                <View style={styles.panelRow}>
                  <Clock size={18} color={c.primary} />
                  <Text style={[styles.panelText, { color: c.textSecondary }]}>
                    {formatDateTime(data.appliedAt) || '—'}
                  </Text>
                </View>
              </View>

              {/* Helper availability */}
              <Text style={[styles.sectionTitle, { color: c.text }]}>Helper Availability</Text>
              <AvailabilityChips
                slots={data.availability}
                variant="full"
                style={styles.availability}
              />

              {/* ID document */}
              <Text style={[styles.sectionTitle, { color: c.text }]}>ID Document</Text>
              {documentUri ? (
                <Pressable
                  onPress={() => setIsPreviewOpen(true)}
                  accessibilityRole="button"
                  accessibilityLabel={`View ID document for ${data.name}`}
                  style={({ pressed }) => [styles.documentCard, pressed && styles.pressed]}
                >
                  <View style={styles.thumbnailWrapper}>
                    <Image
                      source={{ uri: documentUri }}
                      style={[styles.thumbnail, { borderColor: c.border }]}
                      contentFit="cover"
                      transition={150}
                      accessibilityIgnoresInvertColors
                    />
                    <View style={styles.expandChip}>
                      <Maximize2 size={16} color="#FFFFFF" />
                    </View>
                  </View>
                  <Text style={[styles.documentName, { color: c.text }]} numberOfLines={1}>
                    {data.idDocument.fileName || 'ID document'}
                  </Text>
                  <Text style={[styles.documentHint, { color: c.textSecondary }]}>
                    Tap to view full size
                  </Text>
                </Pressable>
              ) : (
                <View
                  style={[
                    styles.panel,
                    styles.documentEmpty,
                    { backgroundColor: c.surface, borderColor: c.border },
                  ]}
                >
                  <FileText size={20} color={c.textMuted} />
                  <Text style={[styles.panelText, { color: c.textMuted }]}>
                    No ID document uploaded
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>

          {/* Sticky actions. Only pending applications have a decision left to
              make; the rest close via the X in the sheet header. */}
          {isPending && (
            <View style={[styles.footer, { borderTopColor: c.divider }]}>
              <View style={styles.footerRow}>
                <Button
                  label="Reject"
                  variant="danger"
                  onPress={onReject}
                  accessibilityLabel={`Reject ${data.name}`}
                  style={styles.footerButton}
                />
                <Button
                  label="Approve"
                  onPress={onApprove}
                  accessibilityLabel={`Approve ${data.name}`}
                  style={styles.footerButton}
                />
              </View>
            </View>
          )}

          <ImagePreviewModal
            visible={isPreviewOpen}
            uri={data.idDocument.uri}
            title={data.idDocument.fileName}
            onClose={() => setIsPreviewOpen(false)}
          />
        </>
      )}
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  // flexShrink lets the ScrollView bound itself against the sheet's maxHeight
  // instead of pushing the footer off-screen.
  body: {
    flexShrink: 1,
  },
  bodyContent: {
    paddingBottom: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    // Starts below the close button, which now hangs 12dp lower than the handle.
    marginTop: 12,
    marginBottom: 24,
  },
  profileHeaderText: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerBadge: {
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  panel: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 20,
  },
  panelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  panelDivider: {
    height: 1,
    width: '100%',
    opacity: 0.6,
  },
  panelText: {
    flex: 1,
    fontSize: 15,
  },
  availability: {
    marginBottom: 20,
  },
  documentCard: {
    marginBottom: 20,
  },
  pressed: {
    opacity: 0.85,
  },
  thumbnailWrapper: {
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    aspectRatio: 1.6,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  expandChip: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  documentName: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 10,
  },
  documentHint: {
    fontSize: 12,
    marginTop: 2,
  },
  documentEmpty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
  },
  footer: {
    borderTopWidth: 1,
    paddingTop: 12,
  },
  footerRow: {
    flexDirection: 'row',
    gap: 12,
  },
  footerButton: {
    flex: 1,
  },
});
