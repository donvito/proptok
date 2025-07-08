import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Property } from '../types/Property';

interface PropertyOverlayProps {
  property: Property;
  onLike: () => void;
  onSave: () => void;
  onContactAgent: () => void;
  onShare: () => void;
}

export const PropertyOverlay: React.FC<PropertyOverlayProps> = ({
  property,
  onLike,
  onSave,
  onContactAgent,
  onShare,
}) => {
  const formatPrice = (price: number, listingType: string) => {
    if (listingType === 'rent') {
      return `$${price.toLocaleString()}/mo`;
    }
    return `$${price.toLocaleString()}`;
  };

  const formatSquareFootage = (sqft: number) => {
    return `${sqft.toLocaleString()} sq ft`;
  };

  return (
    <View style={styles.overlay}>
      {/* Action buttons on the right */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={onLike}>
          <Ionicons
            name={property.isLiked ? 'heart' : 'heart-outline'}
            size={32}
            color={property.isLiked ? '#ff4458' : '#fff'}
          />
          <Text style={styles.actionButtonText}>Like</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={onSave}>
          <Ionicons
            name={property.isSaved ? 'bookmark' : 'bookmark-outline'}
            size={32}
            color={property.isSaved ? '#ffd700' : '#fff'}
          />
          <Text style={styles.actionButtonText}>Save</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={onContactAgent}>
          <Ionicons name="call" size={32} color="#fff" />
          <Text style={styles.actionButtonText}>Contact</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={onShare}>
          <Ionicons name="share-outline" size={32} color="#fff" />
          <Text style={styles.actionButtonText}>Share</Text>
        </TouchableOpacity>
      </View>

      {/* Property information at the bottom */}
      <View style={styles.propertyInfo}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Price and basic info */}
          <View style={styles.priceSection}>
            <Text style={styles.price}>
              {formatPrice(property.price, property.listingType)}
            </Text>
            {property.pricePerSqft && (
              <Text style={styles.pricePerSqft}>
                ${property.pricePerSqft}/sq ft
              </Text>
            )}
          </View>

          {/* Property details */}
          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Ionicons name="bed-outline" size={16} color="#fff" />
              <Text style={styles.detailText}>
                {property.bedrooms} {property.bedrooms === 1 ? 'bed' : 'beds'}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="water-outline" size={16} color="#fff" />
              <Text style={styles.detailText}>
                {property.bathrooms} {property.bathrooms === 1 ? 'bath' : 'baths'}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="resize-outline" size={16} color="#fff" />
              <Text style={styles.detailText}>
                {formatSquareFootage(property.squareFootage)}
              </Text>
            </View>
          </View>

          {/* Address */}
          <View style={styles.addressSection}>
            <Ionicons name="location-outline" size={16} color="#fff" />
            <Text style={styles.address}>
              {property.address}, {property.city}, {property.state} {property.zipCode}
            </Text>
          </View>

          {/* Title and description */}
          <Text style={styles.title}>{property.title}</Text>
          <Text style={styles.description} numberOfLines={3}>
            {property.description}
          </Text>

          {/* Agent info */}
          <View style={styles.agentSection}>
            <Image
              source={{ uri: property.agent.photo }}
              style={styles.agentPhoto}
            />
            <View style={styles.agentInfo}>
              <Text style={styles.agentName}>{property.agent.name}</Text>
              <Text style={styles.agentCompany}>{property.agent.company}</Text>
            </View>
          </View>

          {/* Features */}
          {property.features.length > 0 && (
            <View style={styles.featuresSection}>
              <Text style={styles.featuresTitle}>Features:</Text>
              <View style={styles.featuresList}>
                {property.features.slice(0, 3).map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Text style={styles.featureText}>• {feature}</Text>
                  </View>
                ))}
                {property.features.length > 3 && (
                  <Text style={styles.moreFeatures}>
                    +{property.features.length - 3} more
                  </Text>
                )}
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  actionButtons: {
    position: 'absolute',
    right: 20,
    bottom: 280, // Move up to avoid tab bar
    alignItems: 'center',
  },
  actionButton: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 10,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  propertyInfo: {
    position: 'absolute',
    bottom: 90, // Add space for tab bar
    left: 0,
    right: 80,
    maxHeight: 250,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 20,
    paddingBottom: 20,
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  price: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginRight: 10,
  },
  pricePerSqft: {
    color: '#ccc',
    fontSize: 16,
  },
  detailsRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  detailText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 4,
  },
  addressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  address: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 4,
    flex: 1,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  description: {
    color: '#ccc',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  agentSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  agentPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  agentInfo: {
    flex: 1,
  },
  agentName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  agentCompany: {
    color: '#ccc',
    fontSize: 12,
  },
  featuresSection: {
    marginTop: 8,
  },
  featuresTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  featuresList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  featureItem: {
    marginRight: 15,
    marginBottom: 2,
  },
  featureText: {
    color: '#ccc',
    fontSize: 12,
  },
  moreFeatures: {
    color: '#666',
    fontSize: 12,
    fontStyle: 'italic',
  },
});