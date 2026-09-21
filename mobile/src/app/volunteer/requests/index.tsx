import React, { useCallback, useMemo, useState } from 'react';
import {
	ActivityIndicator,
	Pressable,
	RefreshControl,
	ScrollView,
	StyleSheet,
	TextInput,
	View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAppointments } from '@/hooks/useAppointments';
import { AssistanceRequest } from '@/types/appointment';
import { useAuthContext } from '@/context/auth-context';

const CATEGORIES = [
	'All',
	'Grocery Shopping',
	'Medical Transport',
	'Companionship',
	'Housekeeping & Repairs',
	'Tech Support',
	'Meal Preparation',
	'Pet Care',
	'Gardening & Yard',
	'Bill Payment & Errands',
	'Mobility & Walking',
	'Other',
];

const URGENCIES = ['All', 'Urgent', 'Normal', 'Low'];

export default function BrowseRequestsScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const { user } = useAuthContext();
	const { requests, loading, refreshRequests } = useAppointments('pending');

	const [query, setQuery] = useState('');
	const [category, setCategory] = useState('All');
	const [urgency, setUrgency] = useState('All');
	const [refreshing, setRefreshing] = useState(false);

	useFocusEffect(
		useCallback(() => {
			refreshRequests();
		}, [refreshRequests])
	);

	const onRefresh = async () => {
		setRefreshing(true);
		await refreshRequests();
		setRefreshing(false);
	};

	const visibleRequests = useMemo(() => {
		return requests.filter((request) => {
			const matchesCategory =
				category === 'All' || request.taskType.toLowerCase() === category.toLowerCase();
			const matchesUrgency =
				urgency === 'All' || request.urgency?.toLowerCase() === urgency.toLowerCase();
			const queryLower = query.toLowerCase();
			const matchesQuery =
				!query.trim() ||
				request.title?.toLowerCase().includes(queryLower) ||
				request.description?.toLowerCase().includes(queryLower) ||
				request.taskType?.toLowerCase().includes(queryLower) ||
				request.location?.toLowerCase().includes(queryLower) ||
				request.requester?.name?.toLowerCase().includes(queryLower);

			return matchesCategory && matchesUrgency && matchesQuery;
		});
	}, [requests, category, urgency, query]);

	const resetFilters = () => {
		setQuery('');
		setCategory('All');
		setUrgency('All');
	};

	const isDirectlyAssigned = (request: AssistanceRequest) => {
		if (!request.provider || !user) return false;
		const providerId = typeof request.provider === 'string' ? request.provider : request.provider._id;
		const currentUserId = user._id || (user as { id?: string }).id;
		return providerId === currentUserId;
	};

	return (
		<ThemedView style={[styles.container, { paddingTop: insets.top }]}>
			<View style={styles.mainWrapper}>
				<ScrollView
					contentContainerStyle={[
						styles.content,
						{ paddingBottom: BottomTabInset + Spacing.six },
					]}
					showsVerticalScrollIndicator={false}
					refreshControl={
						<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFFFFF" />
					}
				>
					<View style={styles.header}>
						<ThemedText type="title" style={styles.title}>
							Browse Requests
						</ThemedText>
						<ThemedText type="small" style={styles.subtitle}>
							Find practical ways to help seniors in your community.
						</ThemedText>
					</View>

					<TextInput
						value={query}
						onChangeText={setQuery}
						placeholder="Search requests by task, location, elder..."
						placeholderTextColor="#A9A9B0"
						style={styles.searchInput}
					/>

					<View style={styles.filterHeader}>
						<ThemedText type="smallBold" style={styles.filterLabel}>
							Category
						</ThemedText>
						<Pressable onPress={resetFilters}>
							<ThemedText type="small" style={styles.resetText}>
								Reset
							</ThemedText>
						</Pressable>
					</View>
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						contentContainerStyle={styles.chipRow}
					>
						{CATEGORIES.map((item) => (
							<FilterChip
								key={item}
								label={item}
								selected={category === item}
								onPress={() => setCategory(item)}
							/>
						))}
					</ScrollView>

					<View style={styles.filterHeader}>
						<ThemedText type="smallBold" style={styles.filterLabel}>
							Urgency
						</ThemedText>
					</View>
					<View style={styles.urgencyRow}>
						{URGENCIES.map((item) => (
							<FilterChip
								key={item}
								label={item}
								selected={urgency === item}
								onPress={() => setUrgency(item)}
							/>
						))}
					</View>

					<ThemedText type="smallBold" style={styles.resultsTitle}>
						Available Requests ({visibleRequests.length})
					</ThemedText>

					{loading && !refreshing && requests.length === 0 ? (
						<LoadingState />
					) : visibleRequests.length === 0 ? (
						<EmptyState
							title={requests.length === 0 ? 'No requests available' : 'No matching requests'}
							message={
								requests.length === 0
									? 'New assistance requests from community elders will appear here.'
									: 'Try adjusting your search query or filters to find more opportunities.'
							}
							action={resetFilters}
						/>
					) : (
						<View style={styles.requestList}>
							{visibleRequests.map((request) => {
								const targeted = isDirectlyAssigned(request);
								return (
									<Pressable
										key={request._id}
										style={[styles.requestCard, targeted && styles.targetedCard]}
										onPress={() =>
											router.push({
												pathname: '/volunteer/requests/[requestId]',
												params: { requestId: request._id },
											})
										}
									>
										{targeted && (
											<View style={styles.targetedBanner}>
												<ThemedText style={styles.targetedBannerText}>
													★ Directly Requested For You
												</ThemedText>
											</View>
										)}

										<View style={styles.cardTopRow}>
											<View style={styles.requestIcon}>
												<ThemedText style={styles.iconGlyph}>✦</ThemedText>
											</View>
											<View style={styles.cardTitleWrap}>
												<ThemedText type="small" style={styles.categoryText}>
													{request.taskType}
												</ThemedText>
												<ThemedText type="default" style={styles.requestTitle}>
													{request.title}
												</ThemedText>
												{request.requester?.name && (
													<ThemedText type="small" style={styles.requesterName}>
														By: {request.requester.name}
													</ThemedText>
												)}
											</View>
											<UrgencyBadge urgency={request.urgency} />
										</View>

										{request.description ? (
											<ThemedText type="small" style={styles.description} numberOfLines={3}>
												{request.description}
											</ThemedText>
										) : null}

										<View style={styles.metaGroup}>
											<Meta label={`When: ${request.preferredTime}`} />
											<Meta label={`Where: ${request.location}`} />
											{request.contactNumber ? (
												<Meta label={`Contact: ${request.contactNumber}`} />
											) : null}
										</View>

										<View style={styles.viewButton}>
											<ThemedText type="smallBold" style={styles.viewButtonText}>
												View & Accept Request
											</ThemedText>
										</View>
									</Pressable>
								);
							})}
						</View>
					)}
				</ScrollView>
			</View>
		</ThemedView>
	);
}

function FilterChip({
	label,
	selected,
	onPress,
}: {
	label: string;
	selected: boolean;
	onPress: () => void;
}) {
	return (
		<Pressable
			onPress={onPress}
			style={[styles.filterChip, selected && styles.filterChipSelected]}
		>
			<ThemedText
				type="small"
				style={[styles.filterChipText, selected && styles.filterChipTextSelected]}
			>
				{label}
			</ThemedText>
		</Pressable>
	);
}

function Meta({ label }: { label: string }) {
	return <ThemedText type="small" style={styles.metaText}>• {label}</ThemedText>;
}

function UrgencyBadge({ urgency }: { urgency?: string }) {
	const isHigh = urgency?.toLowerCase() === 'urgent' || urgency?.toLowerCase() === 'high';
	const isLow = urgency?.toLowerCase() === 'low';
	return (
		<View style={[styles.urgencyBadge, isHigh && styles.highBadge, isLow && styles.lowBadge]}>
			<ThemedText type="smallBold" style={styles.urgencyText}>
				{urgency || 'Normal'}
			</ThemedText>
		</View>
	);
}

function LoadingState() {
	return (
		<View style={styles.stateCard}>
			<ActivityIndicator size="large" color="#FFFFFF" />
			<ThemedText type="default" style={styles.stateTitle}>
				Finding available requests...
			</ThemedText>
			<ThemedText type="small" style={styles.stateMessage}>
				Fetching latest community requests from the server.
			</ThemedText>
		</View>
	);
}

function EmptyState({
	title,
	message,
	action,
}: {
	title: string;
	message: string;
	action: () => void;
}) {
	return (
		<View style={styles.stateCard}>
			<ThemedText type="subtitle" style={styles.emptyMark}>
				○
			</ThemedText>
			<ThemedText type="default" style={styles.stateTitle}>
				{title}
			</ThemedText>
			<ThemedText type="small" style={styles.stateMessage}>
				{message}
			</ThemedText>
			<Pressable style={styles.retryButton} onPress={action}>
				<ThemedText type="smallBold" style={styles.retryText}>
					Show All Requests
				</ThemedText>
			</Pressable>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		backgroundColor: '#000000',
	},
	mainWrapper: {
		flex: 1,
		width: '100%',
		maxWidth: MaxContentWidth,
	},
	content: {
		paddingHorizontal: 20,
		paddingTop: 16,
	},
	header: {
		marginBottom: 20,
	},
	title: {
		fontSize: 30,
		lineHeight: 38,
		color: '#F7F7F8',
		fontWeight: '700',
	},
	subtitle: {
		marginTop: 4,
		fontSize: 15,
		color: '#A9A9B0',
	},
	searchInput: {
		borderWidth: 1,
		borderColor: '#45454B',
		borderRadius: 12,
		color: '#F7F7F8',
		fontSize: 15,
		paddingHorizontal: 16,
		paddingVertical: 12,
		marginBottom: 18,
		backgroundColor: '#111114',
	},
	filterHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 8,
	},
	filterLabel: {
		color: '#C3C3C9',
		textTransform: 'uppercase',
		letterSpacing: 0.8,
		fontSize: 12,
	},
	resetText: {
		color: '#F7F7F8',
		textDecorationLine: 'underline',
		fontSize: 13,
	},
	chipRow: {
		gap: 8,
		paddingBottom: 16,
	},
	urgencyRow: {
		flexDirection: 'row',
		gap: 8,
		marginBottom: 20,
		flexWrap: 'wrap',
	},
	filterChip: {
		borderWidth: 1,
		borderColor: '#45454B',
		borderRadius: 999,
		paddingHorizontal: 14,
		paddingVertical: 7,
		backgroundColor: '#111114',
	},
	filterChipSelected: {
		backgroundColor: '#F4F4F5',
		borderColor: '#F4F4F5',
	},
	filterChipText: {
		color: '#F7F7F8',
		fontSize: 13,
	},
	filterChipTextSelected: {
		color: '#111114',
		fontWeight: '600',
	},
	resultsTitle: {
		color: '#C3C3C9',
		textTransform: 'uppercase',
		letterSpacing: 0.8,
		marginBottom: 12,
		fontSize: 12,
	},
	requestList: {
		gap: 14,
	},
	requestCard: {
		borderWidth: 1,
		borderColor: '#38383E',
		borderRadius: 14,
		padding: 18,
		backgroundColor: '#111114',
	},
	targetedCard: {
		borderColor: '#D89E34',
		backgroundColor: '#19160E',
	},
	targetedBanner: {
		backgroundColor: '#D89E34',
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 6,
		alignSelf: 'flex-start',
		marginBottom: 12,
	},
	targetedBannerText: {
		color: '#111114',
		fontWeight: '700',
		fontSize: 11,
		textTransform: 'uppercase',
		letterSpacing: 0.5,
	},
	cardTopRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
	},
	requestIcon: {
		width: 44,
		height: 44,
		borderWidth: 1,
		borderColor: '#45454B',
		borderRadius: 10,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#1A1A1E',
	},
	iconGlyph: {
		color: '#F7F7F8',
		fontSize: 18,
	},
	cardTitleWrap: {
		flex: 1,
	},
	categoryText: {
		color: '#A9A9B0',
		fontSize: 12,
	},
	requestTitle: {
		color: '#F7F7F8',
		fontSize: 18,
		lineHeight: 23,
		fontWeight: '600',
	},
	requesterName: {
		color: '#8CAEC9',
		fontSize: 13,
		marginTop: 2,
	},
	urgencyBadge: {
		borderRadius: 999,
		backgroundColor: '#303036',
		paddingHorizontal: 9,
		paddingVertical: 5,
	},
	highBadge: {
		backgroundColor: '#7A2E2E',
	},
	lowBadge: {
		backgroundColor: '#2E5A44',
	},
	urgencyText: {
		color: '#F7F7F8',
		fontSize: 11,
		fontWeight: '600',
	},
	description: {
		color: '#C3C3C9',
		fontSize: 14,
		lineHeight: 20,
		marginTop: 12,
	},
	metaGroup: {
		marginTop: 12,
		gap: 4,
	},
	metaText: {
		color: '#A9A9B0',
		fontSize: 13,
	},
	viewButton: {
		marginTop: 16,
		backgroundColor: '#F4F4F5',
		borderRadius: 8,
		paddingVertical: 12,
		alignItems: 'center',
	},
	viewButtonText: {
		color: '#111114',
		fontSize: 14,
		fontWeight: '600',
	},
	stateCard: {
		borderWidth: 1,
		borderColor: '#38383E',
		borderRadius: 14,
		alignItems: 'center',
		padding: 36,
		gap: 10,
		backgroundColor: '#111114',
	},
	emptyMark: {
		color: '#F7F7F8',
		fontSize: 40,
	},
	stateTitle: {
		color: '#F7F7F8',
		fontSize: 18,
		fontWeight: '600',
	},
	stateMessage: {
		color: '#A9A9B0',
		textAlign: 'center',
		lineHeight: 20,
		fontSize: 14,
	},
	retryButton: {
		marginTop: 8,
		borderWidth: 1,
		borderColor: '#45454B',
		borderRadius: 7,
		paddingVertical: 10,
		paddingHorizontal: 16,
	},
	retryText: {
		color: '#F7F7F8',
		fontSize: 14,
	},
});
