import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

type Request = {
	id: string;
	category: string;
	title: string;
	description: string;
	date: string;
	distance: string;
	duration: string;
	urgency: 'High' | 'Medium' | 'Low';
};

const requests: Request[] = [
	{ id: 'grocery-assistance', category: 'Grocery shopping', title: 'Grocery Assistance', description: 'Help with a weekly supermarket visit and carrying shopping home.', date: 'Today, 4:00 PM', distance: '2.1 km away', duration: 'Approx. 1 hour', urgency: 'High' },
	{ id: 'companionship-visit', category: 'Companionship', title: 'Companionship Visit', description: 'Share tea and conversation with an elderly person this week.', date: 'Tomorrow, 10:00 AM', distance: '1.5 km away', duration: 'Approx. 1.5 hours', urgency: 'Medium' },
	{ id: 'medicine-collection', category: 'Medicine collection', title: 'Medication Pickup', description: 'Collect prescriptions from the local pharmacy.', date: 'Wednesday, 2:30 PM', distance: '3.2 km away', duration: 'Approx. 45 mins', urgency: 'High' },
	{ id: 'technology-help', category: 'Technology assistance', title: 'Video Call Setup', description: 'Help set up a phone for a family video call.', date: 'Friday, 11:00 AM', distance: '4.0 km away', duration: 'Approx. 1 hour', urgency: 'Low' },
];

const categories = ['All', 'Companionship', 'Grocery shopping', 'Transportation', 'Household assistance', 'Technology assistance', 'Medicine collection'];

export default function BrowseRequestsScreen() {
	const router = useRouter();
	const [query, setQuery] = useState('');
	const [category, setCategory] = useState('All');
	const [urgency, setUrgency] = useState('All');
	const [state, setState] = useState<'ready' | 'loading' | 'empty'>('ready');

	const visibleRequests = useMemo(() => requests.filter((request) => {
		const matchesCategory = category === 'All' || request.category === category;
		const matchesUrgency = urgency === 'All' || request.urgency === urgency;
		const matchesQuery = `${request.title} ${request.description} ${request.category}`.toLowerCase().includes(query.toLowerCase());
		return matchesCategory && matchesUrgency && matchesQuery;
	}), [category, query, urgency]);

	const resetFilters = () => {
		setQuery('');
		setCategory('All');
		setUrgency('All');
		setState('ready');
	};

	return (
		<ThemedView style={styles.container}>
			<SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
				<ScrollView contentContainerStyle={[styles.content, { paddingBottom: BottomTabInset + Spacing.six }]} showsVerticalScrollIndicator={false}>
					<View style={styles.header}>
						<ThemedText type="title" style={styles.title}>Browse Requests</ThemedText>
						<ThemedText type="small" style={styles.subtitle}>Find practical ways to help nearby.</ThemedText>
					</View>

					<TextInput
						value={query}
						onChangeText={setQuery}
						placeholder="Search requests..."
						placeholderTextColor="#A9A9B0"
						style={styles.searchInput}
					/>

					<View style={styles.filterHeader}>
						<ThemedText type="smallBold" style={styles.filterLabel}>Category</ThemedText>
						<Pressable onPress={resetFilters}><ThemedText type="small" style={styles.resetText}>Reset</ThemedText></Pressable>
					</View>
					<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
						{categories.map((item) => <FilterChip key={item} label={item} selected={category === item} onPress={() => { setCategory(item); setState('ready'); }} />)}
					</ScrollView>

					<View style={styles.filterHeader}>
						<ThemedText type="smallBold" style={styles.filterLabel}>Urgency</ThemedText>
						<View style={styles.compactControls}>
							<Pressable onPress={() => setState('loading')}><ThemedText type="small" style={styles.controlText}>Loading</ThemedText></Pressable>
							<Pressable onPress={() => setState('empty')}><ThemedText type="small" style={styles.controlText}>Empty</ThemedText></Pressable>
						</View>
					</View>
					<View style={styles.urgencyRow}>
						{['All', 'High', 'Medium', 'Low'].map((item) => <FilterChip key={item} label={item} selected={urgency === item} onPress={() => { setUrgency(item); setState('ready'); }} />)}
					</View>

					<ThemedText type="smallBold" style={styles.resultsTitle}>Available requests</ThemedText>
					{state === 'loading' ? <LoadingState /> : state === 'empty' ? <EmptyState title="No requests available" message="New requests will appear here when members need a hand." action={resetFilters} /> : visibleRequests.length === 0 ? <EmptyState title="No matching requests" message="Try changing a filter or searching for something broader." action={resetFilters} /> : (
						<View style={styles.requestList}>
							{visibleRequests.map((request) => (
								<Pressable
									key={request.id}
									style={styles.requestCard}
									onPress={() => router.push({ pathname: '/volunteer/requests/[requestId]', params: { requestId: request.id } })}>
									<View style={styles.cardTopRow}>
										<View style={styles.requestIcon}><ThemedText style={styles.iconGlyph}>✦</ThemedText></View>
										<View style={styles.cardTitleWrap}>
											<ThemedText type="small" style={styles.categoryText}>{request.category}</ThemedText>
											<ThemedText type="default" style={styles.requestTitle}>{request.title}</ThemedText>
										</View>
										<UrgencyBadge urgency={request.urgency} />
									</View>
									<ThemedText type="small" style={styles.description}>{request.description}</ThemedText>
									<View style={styles.metaGroup}>
										<Meta label={request.date} />
										<Meta label={request.distance} />
										<Meta label={request.duration} />
									</View>
									<View style={styles.viewButton}><ThemedText type="smallBold" style={styles.viewButtonText}>View request</ThemedText></View>
								</Pressable>
							))}
						</View>
					)}
				</ScrollView>
			</SafeAreaView>
		</ThemedView>
	);
}

function FilterChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
	return <Pressable onPress={onPress} style={[styles.filterChip, selected && styles.filterChipSelected]}><ThemedText type="small" style={[styles.filterChipText, selected && styles.filterChipTextSelected]}>{label}</ThemedText></Pressable>;
}
function Meta({ label }: { label: string }) { return <ThemedText type="small" style={styles.metaText}>• {label}</ThemedText>; }
function UrgencyBadge({ urgency }: { urgency: Request['urgency'] }) { return <View style={[styles.urgencyBadge, urgency === 'High' && styles.highBadge]}><ThemedText type="smallBold" style={styles.urgencyText}>{urgency}</ThemedText></View>; }
function LoadingState() { return <View style={styles.stateCard}><ThemedText type="subtitle" style={styles.loadingMark}>•••</ThemedText><ThemedText type="default" style={styles.stateTitle}>Finding requests</ThemedText><ThemedText type="small" style={styles.stateMessage}>Looking for opportunities close to Kandy.</ThemedText></View>; }
function EmptyState({ title, message, action }: { title: string; message: string; action: () => void }) { return <View style={styles.stateCard}><ThemedText type="subtitle" style={styles.emptyMark}>○</ThemedText><ThemedText type="default" style={styles.stateTitle}>{title}</ThemedText><ThemedText type="small" style={styles.stateMessage}>{message}</ThemedText><Pressable style={styles.retryButton} onPress={action}><ThemedText type="smallBold" style={styles.retryText}>Show all requests</ThemedText></Pressable></View>; }

const styles = StyleSheet.create({
	container: { flex: 1, alignItems: 'center', backgroundColor: '#000' }, safeArea: { flex: 1, width: '100%', maxWidth: MaxContentWidth }, content: { paddingHorizontal: 24, paddingTop: 28 },
	header: { marginBottom: 28 }, title: { fontSize: 32, lineHeight: 40, color: '#F7F7F8' }, subtitle: { marginTop: 4, fontSize: 17, color: '#A9A9B0' },
	searchInput: { borderWidth: 1, borderColor: '#45454B', borderRadius: 12, color: '#F7F7F8', fontSize: 16, paddingHorizontal: 18, paddingVertical: 15, marginBottom: 24 },
	filterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }, filterLabel: { color: '#C3C3C9', textTransform: 'uppercase', letterSpacing: 0.8 }, resetText: { color: '#F7F7F8', textDecorationLine: 'underline' }, compactControls: { flexDirection: 'row', gap: 16 }, controlText: { color: '#A9A9B0', textDecorationLine: 'underline' },
	chipRow: { gap: 8, paddingBottom: 24 }, urgencyRow: { flexDirection: 'row', gap: 8, marginBottom: 30, flexWrap: 'wrap' }, filterChip: { borderWidth: 1, borderColor: '#45454B', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 }, filterChipSelected: { backgroundColor: '#F4F4F5', borderColor: '#F4F4F5' }, filterChipText: { color: '#F7F7F8' }, filterChipTextSelected: { color: '#111' },
	resultsTitle: { color: '#C3C3C9', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 14 }, requestList: { gap: 14 }, requestCard: { borderWidth: 1, borderColor: '#45454B', borderRadius: 14, padding: 18, backgroundColor: '#000' }, cardTopRow: { flexDirection: 'row', alignItems: 'center', gap: 12 }, requestIcon: { width: 44, height: 44, borderWidth: 1, borderColor: '#45454B', borderRadius: 10, alignItems: 'center', justifyContent: 'center' }, iconGlyph: { color: '#F7F7F8', fontSize: 18 }, cardTitleWrap: { flex: 1 }, categoryText: { color: '#A9A9B0', fontSize: 12 }, requestTitle: { color: '#F7F7F8', fontSize: 19, lineHeight: 24 }, urgencyBadge: { borderRadius: 999, backgroundColor: '#303036', paddingHorizontal: 9, paddingVertical: 5 }, highBadge: { backgroundColor: '#6D3131' }, urgencyText: { color: '#F7F7F8', fontSize: 11 }, description: { color: '#C3C3C9', fontSize: 15, lineHeight: 21, marginTop: 14 }, metaGroup: { marginTop: 14, gap: 5 }, metaText: { color: '#C3C3C9', fontSize: 14 }, viewButton: { marginTop: 18, backgroundColor: '#F4F4F5', borderRadius: 7, paddingVertical: 13, alignItems: 'center' }, viewButtonText: { color: '#111', fontSize: 15 },
	stateCard: { borderWidth: 1, borderColor: '#45454B', borderRadius: 14, alignItems: 'center', padding: 36, gap: 10 }, loadingMark: { color: '#F7F7F8', fontSize: 32 }, emptyMark: { color: '#F7F7F8', fontSize: 44 }, stateTitle: { color: '#F7F7F8', fontSize: 19 }, stateMessage: { color: '#A9A9B0', textAlign: 'center', lineHeight: 21 }, retryButton: { marginTop: 8, borderWidth: 1, borderColor: '#45454B', borderRadius: 7, paddingVertical: 11, paddingHorizontal: 18 }, retryText: { color: '#F7F7F8' },
});
