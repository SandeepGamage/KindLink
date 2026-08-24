# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

# Styling
Always use NativeWind for styling.

# Safe Area Handling
Always use `useSafeAreaInsets()` from `react-native-safe-area-context` and apply `paddingTop: insets.top` to the root view for headers in mobile screens. Avoid using the built-in `<SafeAreaView>` component as it can cause layout and background color inconsistencies with custom headers.

# Components
Always reuse UI components if possible instead of duplicating code. When building similar elements (like modals, cards, buttons), abstract them into generic, reusable components (e.g. creating a generic `ActionModal` instead of separate identical modals).
