/**
 * Theme colors matching the wireframe design
 * Dark gray background, light green text, dark green buttons
 */

import { Platform } from 'react-native';

// Wireframe color scheme
export const Colors = {
  // Primary colors from wireframe
  background: '#2a2a2a', // Dark gray background
  text: '#90EE90', // Light green text
  button: '#006400', // Dark green buttons
  inputBorder: '#90EE90', // Light green input borders
  inputText: '#90EE90', // Light green input text
  
  // Status colors
  statusNotDone: '#FFFF00', // Yellow for not done
  statusDone: '#00FF00', // Green for done
  statusRemove: '#FF69B4', // Pink for remove
  
  // Additional UI colors
  cardBackground: '#333333', // Slightly lighter gray for cards
  border: '#90EE90', // Light green borders
  placeholder: '#90EE90AA', // Light green with opacity for placeholders
  error: '#FF6B6B', // Error red
  success: '#00FF00', // Success green
  action: '#FF6B6B', // Action color (red) for sign out
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
