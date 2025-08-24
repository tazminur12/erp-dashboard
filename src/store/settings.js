import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useSettingsStore = create(
  persist(
    (set, get) => ({
      // Company settings
      company: {
        name: 'আমার কোম্পানি',
        address: 'ঢাকা, বাংলাদেশ',
        phone: '+880 1234-567890',
        email: 'info@mycompany.com',
        website: 'www.mycompany.com'
      },
      
      // System settings
      currency: {
        code: 'BDT',
        symbol: '৳',
        position: 'left' // left or right
      },
      
      timezone: 'Asia/Dhaka',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '12h', // 12h or 24h
      
      // Theme settings
      theme: 'light', // light, dark, auto
      
      // Update functions
      updateCompany: (companyData) => set((state) => ({
        company: { ...state.company, ...companyData }
      })),
      
      updateCurrency: (currencyData) => set((state) => ({
        currency: { ...state.currency, ...currencyData }
      })),
      
      setTimezone: (timezone) => set({ timezone }),
      setDateFormat: (dateFormat) => set({ dateFormat }),
      setTimeFormat: (timeFormat) => set({ timeFormat }),
      setTheme: (theme) => set({ theme }),
      
      // Reset to defaults
      resetToDefaults: () => set({
        company: {
          name: 'আমার কোম্পানি',
          address: 'ঢাকা, বাংলাদেশ',
          phone: '+880 1234-567890',
          email: 'info@mycompany.com',
          website: 'www.mycompany.com'
        },
        currency: {
          code: 'BDT',
          symbol: '৳',
          position: 'left'
        },
        timezone: 'Asia/Dhaka',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '12h',
        theme: 'light'
      })
    }),
    {
      name: 'erp-settings',
      partialize: (state) => ({
        company: state.company,
        currency: state.currency,
        timezone: state.timezone,
        dateFormat: state.dateFormat,
        timeFormat: state.timeFormat,
        theme: state.theme
      })
    }
  )
);
