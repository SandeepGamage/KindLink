/**
 * keyboard-aware-scroll-view.tsx
 *
 * ScrollView that keeps the focused input clear of the on-screen keyboard.
 *
 * Edge-to-edge Android (always on since Expo SDK 54) and iOS both draw the keyboard
 * over the window without resizing it, so KeyboardAvoidingView alone leaves inputs
 * hidden. This component pads the content by the area the keyboard covers and
 * scrolls the focused input so its bottom edge sits `keyboardGap` above the keyboard.
 *
 * Any TextInput inside is picked up automatically (focus events bubble). Inputs whose
 * visible box is larger than the TextInput itself (e.g. a bordered wrapper) can report
 * that box with `useKeyboardAwareField` so the gap is measured from its bottom edge.
 */

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  Keyboard,
  Platform,
  StyleSheet,
  type ScrollViewProps,
  type KeyboardEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

/** Default space between the focused input's bottom edge and the top of the keyboard */
const DEFAULT_KEYBOARD_GAP = 36;

type Measurable = Pick<View, 'measureInWindow'>;

const KeyboardAwareFieldContext = createContext<(field: Measurable | null) => void>(() => {});

/**
 * Returns a callback for inputs to report their visible field box on focus.
 * No-op outside a KeyboardAwareScrollView.
 */
export function useKeyboardAwareField() {
  return useContext(KeyboardAwareFieldContext);
}

interface KeyboardAwareScrollViewProps extends ScrollViewProps {
  /** Space kept between the focused input's bottom edge and the keyboard. Defaults to 36. */
  keyboardGap?: number;
}

export function KeyboardAwareScrollView({
  keyboardGap = DEFAULT_KEYBOARD_GAP,
  style,
  contentContainerStyle,
  onScroll,
  onContentSizeChange,
  children,
  ...rest
}: KeyboardAwareScrollViewProps) {
  const scrollRef = useRef<ScrollView>(null);
  const scrollY = useRef(0);
  const focusedField = useRef<Measurable | null>(null);
  /** Keyboard top edge (window coordinates) and how much of the scroll view it covers */
  const [keyboard, setKeyboard] = useState<{ top: number; covered: number } | null>(null);

  // Uses screenY rather than height: Android reports a height that excludes the
  // navigation bar, even though the keyboard also covers it in edge-to-edge mode.
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const show = Keyboard.addListener(showEvent, (e: KeyboardEvent) => {
      const top = e.endCoordinates.screenY;
      const scroll = scrollRef.current as unknown as Measurable | null;
      if (!scroll) return;
      scroll.measureInWindow((_sx, sy, _sw, sh) =>
        setKeyboard({ top, covered: Math.max(0, sy + sh - top) })
      );
    });
    const hide = Keyboard.addListener(hideEvent, () => setKeyboard(null));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  /** Scrolls so the focused field's bottom edge sits keyboardGap above the keyboard */
  const revealFocusedField = useCallback(() => {
    const field = focusedField.current;
    const scroll = scrollRef.current;
    if (!field || !scroll || !keyboard) return;

    field.measureInWindow((_fx, fy, _fw, fh) => {
      const overlap = fy + fh + keyboardGap - keyboard.top;
      if (overlap > 0) {
        scroll.scrollTo({ y: scrollY.current + overlap, animated: true });
      }
    });
  }, [keyboard, keyboardGap]);

  // The extra bottom padding must be laid out before we can scroll into it, otherwise
  // the native scroll view clamps to the old content height. Reveal again once the
  // content grows (onContentSizeChange) and after the keyboard/scroll animations settle.
  useEffect(() => {
    if (!keyboard) return;
    const frame = requestAnimationFrame(revealFocusedField);
    const settle = setTimeout(revealFocusedField, 400);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(settle);
    };
  }, [keyboard, revealFocusedField]);

  // Capture phase runs before the input's own onFocus, so a field box reported via
  // useKeyboardAwareField overrides the bare TextInput picked up here.
  const handleFocusCapture = useCallback(() => {
    focusedField.current = TextInput.State.currentlyFocusedInput() as Measurable | null;
    requestAnimationFrame(revealFocusedField);
  }, [revealFocusedField]);

  const handleFieldReport = useCallback((field: Measurable | null) => {
    focusedField.current = field;
  }, []);

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      scrollY.current = e.nativeEvent.contentOffset.y;
      onScroll?.(e);
    },
    [onScroll]
  );

  const handleContentSizeChange = useCallback(
    (width: number, height: number) => {
      revealFocusedField();
      onContentSizeChange?.(width, height);
    },
    [revealFocusedField, onContentSizeChange]
  );

  const basePaddingBottom = StyleSheet.flatten(contentContainerStyle)?.paddingBottom;

  // onFocusCapture works on any host view but is missing from ViewProps' typings
  const focusCaptureProps = { onFocusCapture: handleFocusCapture } as object;

  return (
    <KeyboardAwareFieldContext.Provider value={handleFieldReport}>
      <View style={[styles.flex, style]} {...focusCaptureProps}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          {...rest}
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={[
            contentContainerStyle,
            keyboard && {
              paddingBottom: Math.max(
                typeof basePaddingBottom === 'number' ? basePaddingBottom : 0,
                keyboard.covered + keyboardGap
              ),
            },
          ]}
          onScroll={handleScroll}
          onContentSizeChange={handleContentSizeChange}
          scrollEventThrottle={rest.scrollEventThrottle ?? 16}>
          {children}
        </ScrollView>
      </View>
    </KeyboardAwareFieldContext.Provider>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});
