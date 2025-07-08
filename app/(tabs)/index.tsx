import React, { useState } from 'react';
import { Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { VideoFeed } from '@/components/VideoFeed';
import { mockProperties } from '@/data/mockProperties';
import { Property } from '@/types/Property';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen() {
  const [properties, setProperties] = useState<Property[]>(mockProperties);

  const handlePropertyLike = async (propertyId: string) => {
    try {
      const updatedProperties = properties.map(property => {
        if (property.id === propertyId) {
          return { ...property, isLiked: !property.isLiked };
        }
        return property;
      });
      setProperties(updatedProperties);
      
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
      const updatedProperties = properties.map(property => {
        if (property.id === propertyId) {
          return { ...property, isSaved: !property.isSaved };
        }
        return property;
      });
      setProperties(updatedProperties);
      
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

  return (
    <>
      <StatusBar style="light" />
      <VideoFeed
        properties={properties}
        onPropertyLike={handlePropertyLike}
        onPropertySave={handlePropertySave}
        onContactAgent={handleContactAgent}
      />
    </>
  );
}

