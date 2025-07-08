import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { PropertyFilters } from '@/components/PropertyFilters';
import { mockProperties } from '@/data/mockProperties';
import { Property, PropertyFilter } from '@/types/Property';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProperties, setFilteredProperties] = useState<Property[]>(mockProperties);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<PropertyFilter>({});

  const filterProperties = React.useCallback(() => {
    let filtered = mockProperties;

    if (searchQuery.trim()) {
      filtered = filtered.filter(property => 
        property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.state.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (activeFilters.priceMin !== undefined) {
      filtered = filtered.filter(property => property.price >= activeFilters.priceMin!);
    }
    if (activeFilters.priceMax !== undefined) {
      filtered = filtered.filter(property => property.price <= activeFilters.priceMax!);
    }
    if (activeFilters.bedrooms !== undefined) {
      filtered = filtered.filter(property => property.bedrooms >= activeFilters.bedrooms!);
    }
    if (activeFilters.bathrooms !== undefined) {
      filtered = filtered.filter(property => property.bathrooms >= activeFilters.bathrooms!);
    }
    if (activeFilters.propertyType) {
      filtered = filtered.filter(property => property.propertyType === activeFilters.propertyType);
    }
    if (activeFilters.listingType) {
      filtered = filtered.filter(property => property.listingType === activeFilters.listingType);
    }

    setFilteredProperties(filtered);
  }, [searchQuery, activeFilters]);

  useEffect(() => {
    filterProperties();
  }, [filterProperties]);


  const handleApplyFilters = (filters: PropertyFilter) => {
    setActiveFilters(filters);
  };

  const formatPrice = (price: number, listingType: string) => {
    if (listingType === 'rent') {
      return `$${price.toLocaleString()}/mo`;
    }
    return `$${price.toLocaleString()}`;
  };

  const renderPropertyItem = ({ item }: { item: Property }) => (
    <TouchableOpacity style={styles.propertyItem}>
      <Image source={{ uri: item.thumbnailUrl }} style={styles.propertyImage} />
      <View style={styles.propertyDetails}>
        <Text style={styles.propertyTitle}>{item.title}</Text>
        <Text style={styles.propertyPrice}>
          {formatPrice(item.price, item.listingType)}
        </Text>
        <View style={styles.propertySpecs}>
          <Text style={styles.specText}>
            {item.bedrooms} bed • {item.bathrooms} bath • {item.squareFootage.toLocaleString()} sq ft
          </Text>
        </View>
        <Text style={styles.propertyAddress}>
          {item.address}, {item.city}, {item.state}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const getActiveFiltersCount = () => {
    return Object.keys(activeFilters).filter(key => activeFilters[key as keyof PropertyFilter] !== undefined).length;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Search Header */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search properties..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity 
          style={[styles.filterButton, getActiveFiltersCount() > 0 && styles.filterButtonActive]}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="options-outline" size={20} color={getActiveFiltersCount() > 0 ? '#fff' : '#666'} />
          {getActiveFiltersCount() > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{getActiveFiltersCount()}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Results */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>
          {filteredProperties.length} properties found
        </Text>
      </View>

      {/* Properties List */}
      <FlatList
        data={filteredProperties}
        renderItem={renderPropertyItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Filters Modal */}
      <PropertyFilters
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        onApplyFilters={handleApplyFilters}
        currentFilters={activeFilters}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#000',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ff4458',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  resultsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f9f9f9',
  },
  resultsText: {
    fontSize: 14,
    color: '#666',
  },
  listContainer: {
    paddingBottom: 20,
  },
  propertyItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  propertyImage: {
    width: 100,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  propertyDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  propertyPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  propertySpecs: {
    marginBottom: 4,
  },
  specText: {
    fontSize: 14,
    color: '#666',
  },
  propertyAddress: {
    fontSize: 12,
    color: '#999',
  },
});
