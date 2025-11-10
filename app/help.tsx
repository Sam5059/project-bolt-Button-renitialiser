import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useLanguage } from '@/contexts/LanguageContext';
import TopBar from '@/components/TopBar';
import Footer from '@/components/Footer';
import {
  HelpCircle,
  MessageCircle,
  Book,
  ShieldCheck,
  CreditCard,
  Users,
  Mail,
  Phone,
  ChevronRight,
} from 'lucide-react-native';

export default function HelpScreen() {
  const { t, isRTL } = useLanguage();

  const helpSections = [
    {
      id: 'getting-started',
      title: t('help.gettingStarted.title'),
      icon: Book,
      color: '#3B82F6',
      items: [
        { title: t('help.gettingStarted.createAccount'), link: '/(auth)/register' },
        { title: t('help.gettingStarted.publishListing'), link: '/(tabs)/publish' },
        { title: t('help.gettingStarted.searchListing'), link: '/(tabs)/searchnew' },
        { title: t('help.gettingStarted.manageListings'), link: '/my-listings' },
      ],
    },
    {
      id: 'account',
      title: t('help.account.title'),
      icon: Users,
      color: '#8B5CF6',
      items: [
        { title: t('help.account.editProfile'), info: t('help.account.editProfileInfo') },
        { title: t('help.account.changePassword'), info: t('help.account.changePasswordInfo') },
        { title: t('help.account.notifications'), info: t('help.account.notificationsInfo') },
        { title: t('help.account.privacy'), info: t('help.account.privacyInfo') },
      ],
    },
    {
      id: 'payments',
      title: t('help.payments.title'),
      icon: CreditCard,
      color: '#10B981',
      items: [
        { title: t('help.payments.methods'), info: t('help.payments.methodsInfo') },
        { title: t('help.payments.security'), info: t('help.payments.securityInfo') },
        { title: t('help.payments.refunds'), info: t('help.payments.refundsInfo') },
      ],
    },
    {
      id: 'safety',
      title: t('help.safety.title'),
      icon: ShieldCheck,
      color: '#F59E0B',
      items: [
        { title: t('help.safety.tips'), info: t('help.safety.tipsInfo') },
        { title: t('help.safety.scams'), info: t('help.safety.scamsInfo') },
        { title: t('help.safety.reporting'), info: t('help.safety.reportingInfo') },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <TopBar />
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <HelpCircle size={48} color="#2563EB" strokeWidth={2} />
          <Text style={[styles.headerTitle, isRTL && styles.textRTL]}>
            {t('help.title')}
          </Text>
          <Text style={[styles.headerSubtitle, isRTL && styles.textRTL]}>
            {t('help.subtitle')}
          </Text>
        </View>

        <View style={styles.content}>
          {helpSections.map((section) => {
            const Icon = section.icon;
            return (
              <View key={section.id} style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.iconContainer, { backgroundColor: `${section.color}15` }]}>
                    <Icon size={24} color={section.color} strokeWidth={2} />
                  </View>
                  <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
                    {section.title}
                  </Text>
                </View>

                <View style={styles.itemsList}>
                  {section.items.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.helpItem}
                      onPress={() => {
                        if (item.link) {
                          router.push(item.link as any);
                        }
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={styles.helpItemContent}>
                        <Text style={[styles.helpItemTitle, isRTL && styles.textRTL]}>
                          {item.title}
                        </Text>
                        {item.info && (
                          <Text style={[styles.helpItemInfo, isRTL && styles.textRTL]}>
                            {item.info}
                          </Text>
                        )}
                      </View>
                      {item.link && (
                        <ChevronRight size={20} color="#94A3B8" strokeWidth={2} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            );
          })}

          {/* Contact Section */}
          <View style={styles.contactSection}>
            <Text style={[styles.contactTitle, isRTL && styles.textRTL]}>
              {t('help.contact.title')}
            </Text>
            <Text style={[styles.contactSubtitle, isRTL && styles.textRTL]}>
              {t('help.contact.subtitle')}
            </Text>

            <View style={styles.contactMethods}>
              <TouchableOpacity style={styles.contactMethod}>
                <View style={[styles.contactIcon, { backgroundColor: '#EFF6FF' }]}>
                  <MessageCircle size={24} color="#3B82F6" strokeWidth={2} />
                </View>
                <Text style={[styles.contactMethodText, isRTL && styles.textRTL]}>
                  {t('help.contact.chat')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.contactMethod}>
                <View style={[styles.contactIcon, { backgroundColor: '#F0FDF4' }]}>
                  <Mail size={24} color="#10B981" strokeWidth={2} />
                </View>
                <Text style={[styles.contactMethodText, isRTL && styles.textRTL]}>
                  support@buygo.dz
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.contactMethod}>
                <View style={[styles.contactIcon, { backgroundColor: '#FEF3C7' }]}>
                  <Phone size={24} color="#F59E0B" strokeWidth={2} />
                </View>
                <Text style={[styles.contactMethodText, isRTL && styles.textRTL]}>
                  +213 XX XX XX XX
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Footer />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 600,
  },
  content: {
    padding: 24,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
  },
  itemsList: {
    gap: 12,
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'background-color 0.2s',
    }),
  },
  helpItemContent: {
    flex: 1,
  },
  helpItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  helpItemInfo: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  contactSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    marginTop: 8,
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  contactSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 32,
  },
  contactMethods: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
    width: '100%',
  },
  contactMethod: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    minWidth: 200,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  contactIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  contactMethodText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  textRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
