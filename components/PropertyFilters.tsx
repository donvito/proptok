import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PropertyFilter } from '../types/Property';

interface PropertyFiltersProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: PropertyFilter) => void;
  currentFilters: PropertyFilter;
}

export const PropertyFilters: React.FC<PropertyFiltersProps> = ({
  visible,
  onClose,
  onApplyFilters,
  currentFilters,
}) => {
  const [filters, setFilters] = useState<PropertyFilter>(currentFilters);

  const propertyTypes = [
    { key: 'house', label: 'House' },
    { key: 'apartment', label: 'Apartment' },
    { key: 'condo', label: 'Condo' },
    { key: 'townhouse', label: 'Townhouse' },
    { key: 'land', label: 'Land' },
  ];

  const listingTypes = [
    { key: 'sale', label: 'For Sale' },
    { key: 'rent', label: 'For Rent' },
  ];

  const bedroomOptions = [0, 1, 2, 3, 4, 5];
  const bathroomOptions = [1, 2, 3, 4, 5];

  const handleApplyFilters = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleClearFilters = () => {
    const emptyFilters: PropertyFilter = {};
    setFilters(emptyFilters);
    onApplyFilters(emptyFilters);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>Filter Properties</Text>
          <TouchableOpacity onPress={handleClearFilters}>
            <Text style={styles.clearButton}>Clear</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Price Range</Text>
            <View style={styles.priceInputs}>
              <View style={styles.priceInput}>
                <Text style={styles.inputLabel}>Min Price</Text>
                <TextInput
                  style={styles.textInput}
                  value={filters.priceMin?.toString() || ''}
                  onChangeText={(text) => 
                    setFilters({ ...filters, priceMin: text ? parseInt(text) : undefined })
                  }
                  placeholder="$0"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.priceInput}>
                <Text style={styles.inputLabel}>Max Price</Text>
                <TextInput
                  style={styles.textInput}
                  value={filters.priceMax?.toString() || ''}
                  onChangeText={(text) => 
                    setFilters({ ...filters, priceMax: text ? parseInt(text) : undefined })
                  }
                  placeholder="No limit"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Listing Type</Text>
            <View style={styles.optionsGrid}>
              {listingTypes.map((type) => (
                <TouchableOpacity
                  key={type.key}
                  style={[
                    styles.optionButton,
                    filters.listingType === type.key && styles.optionButtonActive,
                  ]}
                  onPress={() => 
                    setFilters({ 
                      ...filters, 
                      listingType: filters.listingType === type.key ? undefined : type.key as any 
                    })
                  }
                >
                  <Text
                    style={[
                      styles.optionText,
                      filters.listingType === type.key && styles.optionTextActive,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Property Type</Text>
            <View style={styles.optionsGrid}>
              {propertyTypes.map((type) => (
                <TouchableOpacity
                  key={type.key}
                  style={[
                    styles.optionButton,
                    filters.propertyType === type.key && styles.optionButtonActive,
                  ]}
                  onPress={() => 
                    setFilters({ 
                      ...filters, 
                      propertyType: filters.propertyType === type.key ? undefined : type.key as any 
                    })
                  }
                >
                  <Text
                    style={[
                      styles.optionText,
                      filters.propertyType === type.key && styles.optionTextActive,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bedrooms</Text>
            <View style={styles.optionsGrid}>
              {bedroomOptions.map((count) => (
                <TouchableOpacity
                  key={count}
                  style={[
                    styles.optionButton,
                    filters.bedrooms === count && styles.optionButtonActive,
                  ]}
                  onPress={() => 
                    setFilters({ 
                      ...filters, 
                      bedrooms: filters.bedrooms === count ? undefined : count 
                    })
                  }
                >
                  <Text
                    style={[
                      styles.optionText,
                      filters.bedrooms === count && styles.optionTextActive,
                    ]}
                  >
                    {count === 0 ? 'Studio' : `${count}+`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bathrooms</Text>
            <View style={styles.optionsGrid}>
              {bathroomOptions.map((count) => (
                <TouchableOpacity
                  key={count}
                  style={[
                    styles.optionButton,
                    filters.bathrooms === count && styles.optionButtonActive,
                  ]}
                  onPress={() => 
                    setFilters({ 
                      ...filters, 
                      bathrooms: filters.bathrooms === count ? undefined : count 
                    })
                  }
                >
                  <Text
                    style={[
                      styles.optionText,
                      filters.bathrooms === count && styles.optionTextActive,
                    ]}
                  >
                    {count}+
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.applyButton} onPress={handleApplyFilters}>
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  clearButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#000',
  },
  priceInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  priceInput: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  optionButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  optionText: {
    fontSize: 14,
    color: '#666',
  },
  optionTextActive: {
    color: '#fff',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  applyButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});