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
  Share,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Property } from '../types/Property';

interface PropertyOverlayProps {
  property: Property;
  onLike: () => void;
  onSave: () => void;
  onContactAgent: () => void;
  onShare: () => void;
  isMuted: boolean;
  onMuteToggle: () => void;
}

export const PropertyOverlay: React.FC<PropertyOverlayProps> = ({
  property,
  onLike,
  onSave,
  onContactAgent,
  onShare,
  isMuted,
  onMuteToggle,
}) => {
  // Local state for UI interactions
  const [isLiked, setIsLiked] = useState(property.isLiked || false);
  const [isSaved, setIsSaved] = useState(property.isSaved || false);
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [propertyDetailsVisible, setPropertyDetailsVisible] = useState(false);
  const [showPropertyInfo, setShowPropertyInfo] = useState(true);

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
    Linking.openURL(`tel:${property.agent.phone}`).catch(() => {
      // Silently handle if phone app not available
    });
    setContactModalVisible(false);
  };

  const handleEmail = () => {
    Linking.openURL(`mailto:${property.agent.email}?subject=Inquiry about ${property.title}`).catch(() => {
      // Silently handle if email app not available
    });
    setContactModalVisible(false);
  };

  const handleNativeShare = async () => {
    try {
      await Share.share({
        message: `Check out this property: ${property.title} - ${formatPrice(property.price, property.listingType)} at ${property.address}, ${property.city}`,
        url: property.videoUrl,
      });
      // Handle result silently - don't show any alerts about success/failure
    } catch {
      // Silently handle any errors including "feature not implemented"
    }
    setShareModalVisible(false);
  };

  const handleCopyLink = () => {
    // Silently copy link (in real implementation, would copy to clipboard)
    setShareModalVisible(false);
  };

  const toggleDescription = () => {
    setShowDescription(!showDescription);
  };

  const handleShowPropertyDetails = () => {
    setPropertyDetailsVisible(true);
  };

  const togglePropertyInfo = () => {
    setShowPropertyInfo(!showPropertyInfo);
  };

  return (
    <>
      {/* Action buttons on the right */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={() => {
          console.log('Sound button pressed, current muted state:', isMuted);
          onMuteToggle();
        }}>
          <Ionicons
            name={isMuted ? 'volume-mute' : 'volume-high'}
            size={28}
            color="#fff"
          />
          <Text style={styles.actionButtonText}>
            {isMuted ? 'Muted' : 'Sound'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
          <Ionicons
            name={isLiked ? 'heart' : 'heart-outline'}
            size={28}
            color={isLiked ? '#ff4458' : '#fff'}
          />
          <Text style={styles.actionButtonText}>
            {isLiked ? 'Liked' : 'Like'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleSave}>
          <Ionicons
            name={isSaved ? 'bookmark' : 'bookmark-outline'}
            size={28}
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

        <TouchableOpacity style={styles.actionButton} onPress={handleShowPropertyDetails}>
          <Ionicons name="list-outline" size={32} color="#fff" />
          <Text style={styles.actionButtonText}>Details</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={togglePropertyInfo}>
          <Ionicons name={showPropertyInfo ? 'eye-off-outline' : 'eye-outline'} size={32} color="#fff" />
          <Text style={styles.actionButtonText}>{showPropertyInfo ? 'Hide' : 'Show'}</Text>
        </TouchableOpacity>
      </View>

      {/* Property information at the bottom */}
      {showPropertyInfo && (
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

          {/* Agent info - moved up for better visibility */}
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

          {/* Title section */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>{property.title}</Text>
          </View>
          
          {/* Toggleable description */}
          <TouchableOpacity style={styles.descriptionToggle} onPress={toggleDescription}>
            <Text style={styles.descriptionToggleText}>
              {showDescription ? 'Hide Description' : 'Show Description'}
            </Text>
            <Ionicons 
              name={showDescription ? 'chevron-up' : 'chevron-down'} 
              size={16} 
              color="#ccc" 
            />
          </TouchableOpacity>
          
          {showDescription && (
            <Text style={styles.description}>
              {property.description}
            </Text>
          )}

          {/* Features - simplified for smaller screens */}
          {property.features.length > 0 && (
            <View style={styles.featuresSection}>
              <Text style={styles.featuresTitle}>Features:</Text>
              <View style={styles.featuresList}>
                {property.features.slice(0, 2).map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Text style={styles.featureText}>• {feature}</Text>
                  </View>
                ))}
                {property.features.length > 2 && (
                  <Text style={styles.moreFeatures}>
                    +{property.features.length - 2} more
                  </Text>
                )}
              </View>
            </View>
          )}
        </ScrollView>
        </View>
      )}

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

      {/* Property Details Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={propertyDetailsVisible}
        onRequestClose={() => setPropertyDetailsVisible(false)}
      >
        <View style={styles.propertyDetailsContainer}>
          {/* Header */}
          <View style={styles.propertyDetailsHeader}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setPropertyDetailsVisible(false)}
            >
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.propertyDetailsTitle}>Property Details</Text>
            <View style={styles.headerSpacer} />
          </View>

          <ScrollView style={styles.propertyDetailsScroll} showsVerticalScrollIndicator={false}>
            {/* Property Images Placeholder */}
            <View style={styles.imageSection}>
              <Text style={styles.imageText}>Property Images</Text>
              <View style={styles.imagePlaceholder}>
                <Ionicons name="images" size={48} color="#ccc" />
                <Text style={styles.imagePlaceholderText}>
                  {property.images.length} Photos Available
                </Text>
              </View>
            </View>

            {/* Main Info */}
            <View style={styles.detailsSection}>
              <Text style={styles.detailsSectionTitle}>Property Information</Text>
              
              <View style={styles.priceDetailRow}>
                <Text style={styles.detailsPriceLabel}>Price:</Text>
                <Text style={styles.detailsPrice}>
                  {formatPrice(property.price, property.listingType)}
                </Text>
              </View>

              {property.pricePerSqft && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Price per sq ft:</Text>
                  <Text style={styles.detailValue}>${property.pricePerSqft}</Text>
                </View>
              )}

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Property Type:</Text>
                <Text style={styles.detailValue}>{property.propertyType}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Listing Type:</Text>
                <Text style={styles.detailValue}>{property.listingType}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Bedrooms:</Text>
                <Text style={styles.detailValue}>{property.bedrooms}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Bathrooms:</Text>
                <Text style={styles.detailValue}>{property.bathrooms}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Square Footage:</Text>
                <Text style={styles.detailValue}>{formatSquareFootage(property.squareFootage)}</Text>
              </View>

              {property.yearBuilt && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Year Built:</Text>
                  <Text style={styles.detailValue}>{property.yearBuilt}</Text>
                </View>
              )}

              {property.lotSize && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Lot Size:</Text>
                  <Text style={styles.detailValue}>{property.lotSize} sq ft</Text>
                </View>
              )}

              {property.parking && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Parking Spaces:</Text>
                  <Text style={styles.detailValue}>{property.parking}</Text>
                </View>
              )}
            </View>

            {/* Address */}
            <View style={styles.detailsSection}>
              <Text style={styles.detailsSectionTitle}>Address</Text>
              <Text style={styles.fullAddress}>
                {property.address}{'\n'}
                {property.city}, {property.state} {property.zipCode}
              </Text>
            </View>

            {/* Description */}
            <View style={styles.detailsSection}>
              <Text style={styles.detailsSectionTitle}>Description</Text>
              <Text style={styles.fullDescription}>{property.description}</Text>
            </View>

            {/* Features */}
            {property.features.length > 0 && (
              <View style={styles.detailsSection}>
                <Text style={styles.detailsSectionTitle}>Features</Text>
                <View style={styles.fullFeaturesList}>
                  {property.features.map((feature, index) => (
                    <View key={index} style={styles.fullFeatureItem}>
                      <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                      <Text style={styles.fullFeatureText}>{feature}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Amenities */}
            {property.amenities.length > 0 && (
              <View style={styles.detailsSection}>
                <Text style={styles.detailsSectionTitle}>Amenities</Text>
                <View style={styles.fullFeaturesList}>
                  {property.amenities.map((amenity, index) => (
                    <View key={index} style={styles.fullFeatureItem}>
                      <Ionicons name="star" size={16} color="#FFD700" />
                      <Text style={styles.fullFeatureText}>{amenity}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Agent Info */}
            <View style={styles.detailsSection}>
              <Text style={styles.detailsSectionTitle}>Listing Agent</Text>
              <View style={styles.agentDetailsSection}>
                <Image
                  source={{ uri: property.agent.photo }}
                  style={styles.agentDetailsPhoto}
                />
                <View style={styles.agentDetailsInfo}>
                  <Text style={styles.agentDetailsName}>{property.agent.name}</Text>
                  <Text style={styles.agentDetailsCompany}>{property.agent.company}</Text>
                  <Text style={styles.agentDetailsContact}>📞 {property.agent.phone}</Text>
                  <Text style={styles.agentDetailsContact}>✉️ {property.agent.email}</Text>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.detailsActionSection}>
              <TouchableOpacity style={styles.detailsActionButton} onPress={handleContactAgent}>
                <Ionicons name="call" size={20} color="#fff" />
                <Text style={styles.detailsActionText}>Contact Agent</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.detailsActionButton} onPress={handleShare}>
                <Ionicons name="share" size={20} color="#fff" />
                <Text style={styles.detailsActionText}>Share Property</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.bottomPadding} />
          </ScrollView>
        </View>
      </Modal>
    </>
  );
};

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const styles = StyleSheet.create({
  actionButtons: {
    position: 'absolute',
    right: 10, // Closer to right edge
    bottom: 95, // Lower in bottom right corner
    alignItems: 'center',
    zIndex: 10, // Higher than video controls to ensure buttons are clickable
  },
  actionButton: {
    alignItems: 'center',
    marginBottom: 8, // Tighter spacing between buttons
    padding: 6, // Smaller padding for more compact buttons
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 10,
    marginTop: 2,
    fontWeight: '500',
  },
  propertyInfo: {
    position: 'absolute',
    bottom: 90, // Add space for tab bar
    left: 0,
    right: 80,
    maxHeight: SCREEN_HEIGHT * 0.4, // 40% of screen height for better responsiveness
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 15, // Reduced padding for more content space
    paddingBottom: 15,
    zIndex: 6, // Higher than video controls to ensure buttons are clickable
    pointerEvents: 'auto', // Enable touch events for buttons
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Subtle background to make it stand out
    padding: 10,
    borderRadius: 8,
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
    fontSize: 15, // Slightly larger for better visibility
    fontWeight: '700', // Bolder weight
  },
  agentCompany: {
    color: '#ccc',
    fontSize: 12,
    marginTop: 2,
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
  // New styles for description toggle and property details
  titleSection: {
    marginBottom: 8,
  },
  descriptionToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginBottom: 4,
  },
  descriptionToggleText: {
    color: '#ccc',
    fontSize: 13,
    fontWeight: '500',
  },
  // Property Details Modal Styles
  propertyDetailsContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  propertyDetailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 5,
  },
  propertyDetailsTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSpacer: {
    width: 34, // Same width as back button for centering
  },
  propertyDetailsScroll: {
    flex: 1,
  },
  imageSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  imageText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  imagePlaceholder: {
    height: 150,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    marginTop: 8,
    color: '#666',
    fontSize: 14,
  },
  detailsSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  detailsSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  priceDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailsPriceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  detailsPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'right',
  },
  fullAddress: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  fullDescription: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
  },
  fullFeaturesList: {
    gap: 8,
  },
  fullFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fullFeatureText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  agentDetailsSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  agentDetailsPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  agentDetailsInfo: {
    flex: 1,
  },
  agentDetailsName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  agentDetailsCompany: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  agentDetailsContact: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  detailsActionSection: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
  },
  detailsActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 10,
  },
  detailsActionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  bottomPadding: {
    height: 50,
  },
});