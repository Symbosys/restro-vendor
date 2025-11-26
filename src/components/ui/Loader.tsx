import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { COLORS } from '../../theme/color';
import { SafeAreaView } from 'react-native-safe-area-context';

const Loader = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    </SafeAreaView>
  );
};

export default Loader;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 20,
  },
});
