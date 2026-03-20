import { Dimensions, Image, ScrollView, View } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

interface ProductGalleryProps {
  images: string[];
}

export const ProductGallery = ({ images }: ProductGalleryProps) => {
  if (!images.length) {
    return (
      <View
        style={{
          width: '100%',
          height: 360,
          backgroundColor: '#F3F4F6',
        }}
      />
    );
  }

  return (
    <ScrollView
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      bounces={false}
      style={{ width: '100%', height: 360, backgroundColor: '#F8F8F8' }}
    >
      {images.map((uri, index) => (
        <View
          key={`${uri}-${index}`}
          style={{
            width: screenWidth,
            height: 360,
            backgroundColor: '#F8F8F8',
          }}
        >
          <Image
            source={{ uri }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        </View>
      ))}
    </ScrollView>
  );
};