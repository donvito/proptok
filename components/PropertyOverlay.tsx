import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  Linking,
  Alert,
  Share,
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
  // Local state for UI interactions
  const [isLiked, setIsLiked] = useState(property.isLiked || false);
  const [isSaved, setIsSaved] = useState(property.isSaved || false);
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);

  const formatPrice = (price: number, listingType: string) => {
    if (listingType === 'rent') {
      return `$${price.toLocaleString()}/mo`;
    }
    return `$${price.toLocaleString()}`;
  };

  const formatSquareFootage = (sqft: number) => {
    return `${sqft.toLocaleString()} sq ft`;
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike();
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    onSave();
  };

  const handleContactAgent = () => {
    setContactModalVisible(true);
    onContactAgent();
  };

  const handleShare = () => {
    setShareModalVisible(true);
    onShare();
  };

  const handleCall = () => {
    Linking.openURL(`tel:${property.agent.phone}`);
    setContactModalVisible(false);
  };

  const handleEmail = () => {
    Linking.openURL(`mailto:${property.agent.email}?subject=Inquiry about ${property.title}`);
    setContactModalVisible(false);
  };

  const handleNativeShare = async () => {
    try {
      await Share.share({
        message: `Check out this property: ${property.title} - ${formatPrice(property.price, property.listingType)} at ${property.address}, ${property.city}`,
        url: property.videoUrl,
      });
    } catch {
      Alert.alert('Error', 'Unable to share property');
    }
    setShareModalVisible(false);
  };

  const handleCopyLink = () => {
    Alert.alert('Link Copied', 'Property link copied to clipboard');
    setShareModalVisible(false);
  };

  return (
    <>
      {/* Action buttons on the right */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
          <Ionicons
            name={isLiked ? 'heart' : 'heart-outline'}
            size={32}
            color={isLiked ? '#ff4458' : '#fff'}
          />
          <Text style={styles.actionButtonText}>
            {isLiked ? 'Liked' : 'Like'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleSave}>
          <Ionicons
            name={isSaved ? 'bookmark' : 'bookmark-outline'}
            size={32}
            color={isSaved ? '#ffd700' : '#fff'}
          />
          <Text style={styles.actionButtonText}>
            {isSaved ? 'Saved' : 'Save'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleContactAgent}>
          <Ionicons name="call" size={32} color="#fff" />
          <Text style={styles.actionButtonText}>Contact</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
          <Ionicons name="share-outline" size={32} color="#fff" />
          <Text style={styles.actionButtonText}>Share</Text>
        </TouchableOpacity>
      </View>

      {/* Property information at the bottom */}
      <View style={styles.propertyInfo}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
        >
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

      {/* Contact Agent Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={contactModalVisible}
        onRequestClose={() => setContactModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Contact Agent</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setContactModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.agentModalSection}>
              <Image
                source={{ uri: property.agent.photo }}
                style={styles.agentModalPhoto}
              />
              <View style={styles.agentModalInfo}>
                <Text style={styles.agentModalName}>{property.agent.name}</Text>
                <Text style={styles.agentModalCompany}>{property.agent.company}</Text>
              </View>
            </View>

            <View style={styles.contactOptions}>
              <TouchableOpacity style={styles.contactOption} onPress={handleCall}>
                <Ionicons name="call" size={24} color="#007AFF" />
                <Text style={styles.contactOptionText}>Call {property.agent.phone}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.contactOption} onPress={handleEmail}>
                <Ionicons name="mail" size={24} color="#007AFF" />
                <Text style={styles.contactOptionText}>Email {property.agent.email}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.propertyModalInfo}>
              <Text style={styles.propertyModalTitle}>{property.title}</Text>
              <Text style={styles.propertyModalPrice}>
                {formatPrice(property.price, property.listingType)}
              </Text>
              <Text style={styles.propertyModalAddress}>
                {property.address}, {property.city}, {property.state}
              </Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* Share Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={shareModalVisible}
        onRequestClose={() => setShareModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Share Property</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShareModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.shareOptions}>
              <TouchableOpacity style={styles.shareOption} onPress={handleNativeShare}>
                <Ionicons name="share" size={24} color="#007AFF" />
                <Text style={styles.shareOptionText}>Share via...</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.shareOption} onPress={handleCopyLink}>
                <Ionicons name="link" size={24} color="#007AFF" />
                <Text style={styles.shareOptionText}>Copy Link</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.sharePreview}>
              <Text style={styles.sharePreviewTitle}>{property.title}</Text>
              <Text style={styles.sharePreviewPrice}>
                {formatPrice(property.price, property.listingType)}
              </Text>
              <Text style={styles.sharePreviewAddress}>
                {property.address}, {property.city}
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  actionButtons: {
    position: 'absolute',
    right: 20,
    bottom: 280, // Move up to avoid tab bar
    alignItems: 'center',
    zIndex: 10, // Higher than video controls to ensure buttons are clickable
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
    zIndex: 2, // Lower than video controls but visible
    pointerEvents: 'none', // Allow taps to pass through to video controls
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  // Agent modal styles
  agentModalSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
  },
  agentModalPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  agentModalInfo: {
    flex: 1,
  },
  agentModalName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  agentModalCompany: {
    fontSize: 14,
    color: '#666',
  },
  contactOptions: {
    marginBottom: 20,
  },
  contactOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    marginBottom: 10,
  },
  contactOptionText: {
    fontSize: 16,
    color: '#007AFF',
    marginLeft: 10,
    fontWeight: '500',
  },
  propertyModalInfo: {
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
  },
  propertyModalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  propertyModalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 5,
  },
  propertyModalAddress: {
    fontSize: 14,
    color: '#666',
  },
  // Share modal styles
  shareOptions: {
    marginBottom: 20,
  },
  shareOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    marginBottom: 10,
  },
  shareOptionText: {
    fontSize: 16,
    color: '#007AFF',
    marginLeft: 10,
    fontWeight: '500',
  },
  sharePreview: {
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
  },
  sharePreviewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  sharePreviewPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 5,
  },
  sharePreviewAddress: {
    fontSize: 14,
    color: '#666',
  },
  scrollView: {
    pointerEvents: 'auto', // Re-enable pointer events for scrollable content
  },
});