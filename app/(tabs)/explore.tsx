import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  SafeAreaView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import { PropertyFilters } from '@/components/PropertyFilters';
import { VideoFeed } from '@/components/VideoFeed';
import { mockProperties } from '@/data/mockProperties';
import { Property, PropertyFilter } from '@/types/Property';
import { isYouTubeUrl, getYouTubeVideoInfo } from '@/utils/youtube';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProperties, setFilteredProperties] = useState<Property[]>(mockProperties);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<PropertyFilter>({});
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);

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

  const getVideoThumbnail = (property: Property) => {
    // Prioritize YouTube video thumbnails first
    if (isYouTubeUrl(property.videoUrl)) {
      const videoInfo = getYouTubeVideoInfo(property.videoUrl);
      if (videoInfo) {
        return videoInfo.thumbnailUrl;
      }
    }
    
    // Fallback to property thumbnailUrl if available
    if (property.thumbnailUrl) {
      return property.thumbnailUrl;
    }
    
    // Default placeholder image
    return 'https://via.placeholder.com/400x200/f0f0f0/999999?text=Property+Video';
  };

  const handlePropertyPress = (property: Property) => {
    setSelectedProperty(property);
    setShowVideoModal(true);
  };

  const handleCloseVideo = () => {
    setShowVideoModal(false);
    setSelectedProperty(null);
  };

  // Handle tab focus/blur - close video modal when navigating away from search tab
  useFocusEffect(
    useCallback(() => {
      console.log('Search tab focused');
      
      return () => {
        console.log('Search tab blurred - closing video modal if open');
        if (showVideoModal) {
          setShowVideoModal(false);
          setSelectedProperty(null);
        }
      };
    }, [showVideoModal])
  );

  const renderPropertyItem = ({ item }: { item: Property }) => (
    <TouchableOpacity 
      style={styles.propertyItem} 
      activeOpacity={0.7}
      onPress={() => handlePropertyPress(item)}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: getVideoThumbnail(item) }} style={styles.propertyImage} />
        <View style={styles.playButtonOverlay}>
          <Ionicons name="play-circle" size={48} color="rgba(255, 255, 255, 0.9)" />
        </View>
        <View style={styles.priceTag}>
          <Text style={styles.priceTagText}>
            {formatPrice(item.price, item.listingType)}
          </Text>
        </View>
        <TouchableOpacity style={styles.favoriteButton}>
          <Ionicons name="heart-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      <View style={styles.propertyDetails}>
        <View style={styles.propertyHeader}>
          <Text style={styles.propertyTitle} numberOfLines={2}>{item.title}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.ratingText}>4.8</Text>
          </View>
        </View>
        
        <View style={styles.propertySpecs}>
          <View style={styles.specItem}>
            <Ionicons name="bed-outline" size={16} color="#666" />
            <Text style={styles.specText}>{item.bedrooms}</Text>
          </View>
          <View style={styles.specItem}>
            <Ionicons name="water-outline" size={16} color="#666" />
            <Text style={styles.specText}>{item.bathrooms}</Text>
          </View>
          <View style={styles.specItem}>
            <Ionicons name="resize-outline" size={16} color="#666" />
            <Text style={styles.specText}>{item.squareFootage.toLocaleString()} ft²</Text>
          </View>
        </View>
        
        <View style={styles.propertyFooter}>
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={14} color="#999" />
            <Text style={styles.propertyAddress} numberOfLines={1}>
              {item.address}, {item.city}
            </Text>
          </View>
          <Text style={styles.propertyType}>{item.propertyType}</Text>
        </View>
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
            placeholder="Search by location, price, or type..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity 
          style={[styles.filterButton, getActiveFiltersCount() > 0 && styles.filterButtonActive]}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="tune" size={20} color={getActiveFiltersCount() > 0 ? '#fff' : '#666'} />
          {getActiveFiltersCount() > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{getActiveFiltersCount()}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Results Header */}
      <View style={styles.resultsContainer}>
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsText}>
            {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'}
          </Text>
          <TouchableOpacity style={styles.sortButton}>
            <Text style={styles.sortText}>Sort</Text>
            <Ionicons name="chevron-down" size={16} color="#666" />
          </TouchableOpacity>
        </View>
        {(searchQuery || getActiveFiltersCount() > 0) && (
          <View style={styles.activeFiltersContainer}>
            {searchQuery && (
              <View style={styles.activeFilterChip}>
                <Text style={styles.activeFilterText}>"{searchQuery}"</Text>
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close" size={14} color="#666" />
                </TouchableOpacity>
              </View>
            )}
            {getActiveFiltersCount() > 0 && (
              <TouchableOpacity 
                style={styles.clearFiltersButton}
                onPress={() => setActiveFilters({})}
              >
                <Text style={styles.clearFiltersText}>Clear all filters</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Properties List */}
      {filteredProperties.length > 0 ? (
        <FlatList
          data={filteredProperties}
          renderItem={renderPropertyItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="home-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>No Properties Found</Text>
          <Text style={styles.emptySubtitle}>
            Try adjusting your search criteria or filters to find more properties
          </Text>
          <TouchableOpacity 
            style={styles.resetButton}
            onPress={() => {
              setSearchQuery('');
              setActiveFilters({});
            }}
          >
            <Text style={styles.resetButtonText}>Reset Search</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Filters Modal */}
      <PropertyFilters
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        onApplyFilters={handleApplyFilters}
        currentFilters={activeFilters}
      />

      {/* Video Modal */}
      <Modal
        visible={showVideoModal}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={handleCloseVideo}
      >
        {selectedProperty && (
          <View style={styles.videoModalContainer}>
            <View style={styles.videoModalHeader}>
              <TouchableOpacity onPress={handleCloseVideo} style={styles.closeButton}>
                <Ionicons name="close" size={28} color="#fff" />
              </TouchableOpacity>
            </View>
            <VideoFeed
              properties={[selectedProperty]}
              onPropertyLike={() => {}}
              onPropertySave={() => {}}
              onContactAgent={() => {}}
            />
          </View>
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e8eaed',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f3f4',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  clearButton: {
    marginLeft: 8,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f1f3f4',
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
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  resultsContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e8eaed',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#202124',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f1f3f4',
    borderRadius: 8,
    gap: 4,
  },
  sortText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeFiltersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  activeFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  activeFilterText: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '500',
  },
  clearFiltersButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearFiltersText: {
    fontSize: 12,
    color: '#ff4458',
    fontWeight: '500',
  },
  listContainer: {
    paddingBottom: 20,
  },
  separator: {
    height: 12,
  },
  propertyItem: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
  },
  propertyImage: {
    width: '100%',
    height: 200,
  },
  playButtonOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -24 }, { translateY: -24 }],
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 24,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  priceTag: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  priceTagText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  propertyDetails: {
    padding: 16,
  },
  propertyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  propertyTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#202124',
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  propertySpecs: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 16,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  specText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  propertyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 4,
  },
  propertyAddress: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  propertyType: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#202124',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  resetButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  videoModalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoModalHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    zIndex: 1000,
    paddingTop: 50,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
