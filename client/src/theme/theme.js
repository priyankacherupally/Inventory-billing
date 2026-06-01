export const colors = {
  primary: '#6366F1',
  primaryDeep: '#4F46E5',
  accent: '#EC4899',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#0EA5E9',
  bgBase: '#0F172A',
  bgSoft: '#F8FAFC',
  textOnDark: '#F8FAFC',
  textOnLight: '#0F172A',
};

export const antdTheme = {
  token: {
    colorPrimary: colors.primary,
    colorSuccess: colors.success,
    colorWarning: colors.warning,
    colorError: colors.danger,
    colorInfo: colors.info,
    borderRadius: 12,
    fontFamily:
      "'Space Grotesk', 'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  },
  components: {
    Button: { controlHeight: 40, fontWeight: 600 },
    Card: { borderRadiusLG: 16 },
  },
};
