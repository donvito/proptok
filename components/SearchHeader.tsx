import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
  SafeAreaView,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

interface SearchHeaderProps {
  onSearchChange?: (query: string) => void;
  onFilterPress?: () => void;
  placeholder?: string;
  showFilterButton?: boolean;
}

export const SearchHeader: React.FC<SearchHeaderProps> = ({
  onSearchChange,
  onFilterPress,
  placeholder = "Search properties...",
  showFilterButton = true,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    onSearchChange?.(text);
  };

  const clearSearch = () => {
    setSearchQuery('');
    onSearchChange?.('');
  };

  const BackgroundComponent = Platform.select({
    ios: () => (
      <BlurView
        intensity={95}
        tint="dark"
        style={StyleSheet.absoluteFillObject}
      />
    ),
    default: () => (
      <View
        style={[
          StyleSheet.absoluteFillObject,
          {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
          },
        ]}
      />
    ),
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <BackgroundComponent />
        
        <View style={styles.content}>
          <View style={[styles.searchContainer, isFocused && styles.searchContainerFocused]}>
            <Ionicons 
              name="search" 
              size={20} 
              color="rgba(255, 255, 255, 0.7)" 
              style={styles.searchIcon} 
            />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={handleSearchChange}
              placeholder={placeholder}
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && Platform.OS === 'android' && (
              <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                <Ionicons name="close-circle" size={20} color="rgba(255, 255, 255, 0.7)" />
              </TouchableOpacity>
            )}
          </View>
          
          {showFilterButton && (
            <TouchableOpacity style={styles.filterButton} onPress={onFilterPress}>
              <Ionicons name="options-outline" size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  container: {
    paddingTop: Platform.OS === 'ios' ? 0 : 10,
    paddingBottom: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchContainerFocused: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 0,
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
});