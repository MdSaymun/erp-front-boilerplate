import { theme as antdTheme, type ThemeConfig } from 'antd';

import { APP_SHELL } from '@/constants/app';
import type { TenantBranding } from '@/types/tenant';

export type ResolvedThemeMode = 'light' | 'dark';

/** Brand and density tokens shared by both colour modes. */
const sharedTokens: ThemeConfig['token'] = {
  colorPrimary: '#1d5fb4',
  colorSuccess: '#2e8b57',
  colorWarning: '#d98b0c',
  colorError: '#c8323d',
  colorInfo: '#1d5fb4',
  borderRadius: 6,
  borderRadiusSM: 4,
  fontSize: 14,
  fontSizeHeading1: 28,
  fontSizeHeading2: 22,
  fontSizeHeading3: 18,
  controlHeight: 32,
  controlHeightSM: 24,
  lineHeight: 1.5,
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif",
  fontFamilyCode: "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace",
  motionDurationMid: '0.15s',
};

/**
 * Builds the Ant Design theme for a colour mode.
 *
 * Component overrides aim for an ERP feel: compact tables, moderate control
 * heights, and a restrained header/sider. Adjust here, never inline in pages.
 */
const HEX_COLOR = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

/** Accepts only a safe hex colour from tenant settings. */
export function resolveBrandColor(branding?: TenantBranding): string | undefined {
  const color = branding?.primaryColor?.trim();
  return color && HEX_COLOR.test(color) ? color : undefined;
}

export function buildTheme(mode: ResolvedThemeMode, branding?: TenantBranding): ThemeConfig {
  const isDark = mode === 'dark';
  const brandColor = resolveBrandColor(branding);

  return {
    hashed: false,
    algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: brandColor
      ? { ...sharedTokens, colorPrimary: brandColor, colorInfo: brandColor }
      : sharedTokens,
    components: {
      Layout: {
        headerHeight: APP_SHELL.headerHeight,
        headerPadding: '0 16px',
        headerBg: isDark ? '#141414' : '#ffffff',
        siderBg: isDark ? '#141414' : '#ffffff',
        bodyBg: isDark ? '#0f0f0f' : '#f3f5f8',
      },
      Menu: {
        itemHeight: 36,
        itemMarginBlock: 2,
        iconSize: 16,
        collapsedIconSize: 18,
      },
      Table: {
        cellPaddingBlock: 8,
        cellPaddingInline: 12,
        cellPaddingBlockSM: 4,
        cellPaddingInlineSM: 8,
        headerBg: isDark ? '#1f1f1f' : '#f7f8fa',
      },
      Card: {
        paddingLG: 16,
        headerHeight: 44,
      },
      Form: {
        itemMarginBottom: 16,
        verticalLabelPadding: '0 0 4px',
      },
      Descriptions: {
        itemPaddingBottom: 8,
      },
      Tabs: {
        horizontalMargin: '0 0 12px 0',
      },
      Statistic: {
        contentFontSize: 22,
      },
    },
  };
}
