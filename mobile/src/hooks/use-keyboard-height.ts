import { useEffect, useState } from 'react';
import { Dimensions, Keyboard, Platform } from 'react-native';

/**
 * How much of the bottom of the screen the on-screen keyboard covers, or 0
 * while it is hidden.
 *
 * Android runs edge-to-edge (forced since Expo SDK 54), so the window no longer
 * resizes for the keyboard. Screens whose content reaches the bottom of the
 * screen can pad themselves by this amount to keep inputs visible.
 */
export function useKeyboardHeight() {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    // iOS fires the "will" events in time to move with the keyboard animation;
    // Android only fires the "did" events.
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      // Measure down from the keyboard's top edge: on Android `height` leaves
      // out the navigation bar, which the keyboard also sits over.
      const covered = Dimensions.get('screen').height - e.endCoordinates.screenY;
      setHeight(Math.max(covered, e.endCoordinates.height));
    });
    const hideSub = Keyboard.addListener(hideEvent, () => setHeight(0));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return height;
}
