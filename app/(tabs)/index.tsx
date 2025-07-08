import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { VideoFeed } from '@/components/VideoFeed';
import { PropertyFilters } from '@/components/PropertyFilters';
import { mockProperties } from '@/data/mockProperties';
import { Property, PropertyFilter } from '@/types/Property';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen() {
  const [allProperties] = useState<Property[]>(mockProperties);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>(mockProperties);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<PropertyFilter>({});

  // Filter properties based on search and filters
  useEffect(() => {
    let filtered = allProperties;

    // Apply search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(property => 
        property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.state.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply filters
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
  }, [searchQuery, activeFilters, allProperties]);

  const handlePropertyLike = async (propertyId: string) => {
    try {
      const updatedProperties = filteredProperties.map(property => {
        if (property.id === propertyId) {
          return { ...property, isLiked: !property.isLiked };
        }
        return property;
      });
      setFilteredProperties(updatedProperties);
      
      // Save to AsyncStorage
      const likedProperties = await AsyncStorage.getItem('likedProperties');
      const likedIds = likedProperties ? JSON.parse(likedProperties) : [];
      const property = updatedProperties.find(p => p.id === propertyId);
      
      if (property?.isLiked) {
        if (!likedIds.includes(propertyId)) {
          likedIds.push(propertyId);
        }
      } else {
        const index = likedIds.indexOf(propertyId);
        if (index > -1) {
          likedIds.splice(index, 1);
        }
      }
      
      await AsyncStorage.setItem('likedProperties', JSON.stringify(likedIds));
    } catch (error) {
      console.error('Error handling like:', error);
    }
  };

  const handlePropertySave = async (propertyId: string) => {
    try {
      const updatedProperties = filteredProperties.map(property => {
        if (property.id === propertyId) {
          return { ...property, isSaved: !property.isSaved };
        }
        return property;
      });
      setFilteredProperties(updatedProperties);
      
      // Save to AsyncStorage
      const savedProperties = await AsyncStorage.getItem('savedProperties');
      const savedIds = savedProperties ? JSON.parse(savedProperties) : [];
      const property = updatedProperties.find(p => p.id === propertyId);
      
      if (property?.isSaved) {
        if (!savedIds.includes(propertyId)) {
          savedIds.push(propertyId);
        }
      } else {
        const index = savedIds.indexOf(propertyId);
        if (index > -1) {
          savedIds.splice(index, 1);
        }
      }
      
      await AsyncStorage.setItem('savedProperties', JSON.stringify(savedIds));
    } catch (error) {
      console.error('Error handling save:', error);
    }
  };

  const handleContactAgent = (property: Property) => {
    Alert.alert(
      'Contact Agent',
      `Contact ${property.agent.name} at ${property.agent.company}?`,
      [
        { text: 'Call', onPress: () => Alert.alert('Calling', property.agent.phone) },
        { text: 'Email', onPress: () => Alert.alert('Email', property.agent.email) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterPress = () => {
    setShowFilters(true);
  };

  const handleApplyFilters = (filters: PropertyFilter) => {
    setActiveFilters(filters);
  };

  return (
    <>
      <StatusBar style="light" />
      <VideoFeed
        properties={filteredProperties}
        allProperties={allProperties}
        onPropertyLike={handlePropertyLike}
        onPropertySave={handlePropertySave}
        onContactAgent={handleContactAgent}
        onSearchChange={handleSearchChange}
        onFilterPress={handleFilterPress}
      />
      
      <PropertyFilters
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        onApplyFilters={handleApplyFilters}
        currentFilters={activeFilters}
      />
    </>
  );
}

