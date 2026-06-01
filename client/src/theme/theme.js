// Theme: Peacock Teal & Marigold — modern ethnic palette for the saree shop.
export const colors = {
  primary: '#0E6E73', // peacock teal
  primaryDeep: '#094E52', // hover / active
  accent: '#F2A93B', // marigold / saffron — highlights, totals
  success: '#1F8A5B',
  warning: '#E0A526',
  danger: '#C0392B',
  info: '#1E88A8',
  bgBase: '#0C2E30', // deep teal-black (dark surfaces / login)
  bgSoft: '#FBF7EF', // warm cream (app background)
  textOnDark: '#FBF7EF',
  textOnLight: '#14302F', // deep teal-black
};

export const antdTheme = {
  token: {
    colorPrimary: colors.primary,
    colorSuccess: colors.success,
    colorWarning: colors.warning,
    colorError: colors.danger,
    colorInfo: colors.info,
    colorLink: colors.primary,
    colorBgLayout: colors.bgSoft,
    borderRadius: 12,
    fontFamily:
      "'Space Grotesk', 'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  },
  components: {
    Button: { controlHeight: 40, fontWeight: 600 },
    Card: { borderRadiusLG: 16 },
    Table: { headerBg: '#F3EBDD', headerColor: colors.textOnLight },
    Tag: { borderRadiusSM: 6 },
  },
};