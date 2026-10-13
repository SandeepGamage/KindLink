import { useCallback, useEffect, useRef } from 'react';
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  TextInput,
} from 'react-native';
import { useKeyboardHeight } from './use-keyboard-height';

/** Space kept between the bottom of the focused input and the top of the keyboard. */
export const KEYBOARD_GAP = 36;

/**
 * Keeps the focused input of a ScrollView clear of the keyboard, leaving
 * `KEYBOARD_GAP` between the input's bottom edge and the keyboard's top edge.
 *
 * Spread `scrollProps` onto the ScrollView and pass `onInputFocus` to each
 * TextInput's `onFocus`, so switching fields while the keyboard is already open
 * scrolls too. The screen still has to leave room to scroll into — pad the
 * content by `keyboardHeight` while it is non-zero.
 */
export function useKeyboardAwareScroll() {
  const keyboardHeight = useKeyboardHeight();
  const scrollRef = useRef<ScrollView>(null);
  const scrollY = useRef(0);

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollY.current = e.nativeEvent.contentOffset.y;
  }, []);

  const onInputFocus = useCallback(() => {
    // Android focuses before the keyboard opens; the effect below runs again
    // once it has.
    if (keyboardHeight === 0) return;
    const input = TextInput.State.currentlyFocusedInput();
    if (!input) return;

    // Wait a frame so layout driven by the keyboard (padding, a lifted sheet)
    // has landed before measuring.
    requestAnimationFrame(() => {
      input.measureInWindow((_x, y, _width, height) => {
        const keyboardTop = Dimensions.get('screen').height - keyboardHeight;
        const overlap = y + height + KEYBOARD_GAP - keyboardTop;
        if (overlap > 0) {
          scrollRef.current?.scrollTo({ y: scrollY.current + overlap, animated: true });
        }
      });
    });
  }, [keyboardHeight]);

  useEffect(() => {
    onInputFocus();
  }, [onInputFocus]);

  return {
    keyboardHeight,
    onInputFocus,
    scrollProps: { ref: scrollRef, onScroll, scrollEventThrottle: 16 },
  };
}
