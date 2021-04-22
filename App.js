import React, {useState, useEffect, useRef} from 'react';
import { Animated, Text, View, FlatList, Dimensions, Platform,  Image, StyleSheet, StatusBar, } from 'react-native';
import { getMovies } from './api';
import Svg, { Rect } from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';
const { width, height } = Dimensions.get('window');

const AnimatedSvg = Animated.createAnimatedComponent(Svg);
const SPACING = 10;
const ITEM_SIZE = Platform.OS === 'ios' ? width * 0.72 : width * 0.72;
const EMPTY_ITEM_SIZE = (width - ITEM_SIZE) / 2;
const BACKDROP_HEIGHT = height * 0.60;

const Backdrop = ({movies, scrollX}) =>{
  return(
    <View style={{ height: BACKDROP_HEIGHT, width, position: 'absolute'}}>
      <FlatList
        data={movies.reverse()}
        keyExtractor={(item) => item.key + '-backdrop'}
        removeClippedSubviews={false}
        contentContainerStyle={{width, height: BACKDROP_HEIGHT}}
        renderItem={({item, index})=>{
          if(!item.backdrop){
            return null;
          }
          const translateX = scrollX.interpolate({
            inputRange: [(index-2) * ITEM_SIZE, (index - 1) * ITEM_SIZE],
            outputRange: [-width, 0],
          });
          return(
           <Animated.View
              removeClippedSubviews={false}
              style={{
                position: 'absolute',
                width,
                height: BACKDROP_HEIGHT,
                overflow: 'hidden',
                transform: [{translateX}],
              }}
            >
              <Image
                source={{uri:item.backdrop}}
                style={{
                  width,
                  height: BACKDROP_HEIGHT,
                  position: 'absolute',
                }}
              />
             </Animated.View>
          );
        }}
      />
      <LinearGradient
        colors={['rgba(0, 0, 0, 0)', 'white']}
        style={{
          height: BACKDROP_HEIGHT,
          width,
          position: 'absolute',
          bottom: 0,
        }}
      />
    </View>
  );
};


const App = () =>{
  const [movies, setMovies] = useState([]);
  const scrollX = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    const fetchData = async () => {
      const movies = await getMovies();
      // Add empty items to create fake space
      // [empty_item, ...movies, empty_item]
      setMovies([{ key: 'empty-left' }, ...movies, { key: 'empty-right' }]);
    };

    if (movies.length === 0) {
      fetchData(movies);
    }
  }, [movies]);

  return(
    <View style={{flex: 1}}>
      <Backdrop movies={movies} scrollX={scrollX} />
      <StatusBar hidden />
      <Animated.FlatList
        showsHorizontalScrollIndicator={false}
        data={movies}
        keyExtractor={(item) => item.key}
        horizontal
        bounces={false}
        decelerationRate={Platform.OS === 'ios' ? 0 : 0.98}
        renderToHardwareTextureAndroid
        contentContainerStyle={{ alignItems: 'center' }}
        snapToInterval={ITEM_SIZE}
        snapToAlignment='start'
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        renderItem={({ item, index }) => {
          if (!item.poster) {
            return <View style={{ width: EMPTY_ITEM_SIZE }} />;
          }

          const inputRange = [
            (index - 2) * ITEM_SIZE,
            (index - 1) * ITEM_SIZE,
            index * ITEM_SIZE,
          ];

          const translateY = scrollX.interpolate({
            inputRange,
            outputRange: [100, 50, 100],
            extrapolate: 'clamp',
          });
          return (
            <View style={{ width: ITEM_SIZE }}>
              <Animated.View
                style={{
                  marginHorizontal: SPACING,
                  padding: SPACING * 2,
                  alignItems: 'center',
                  transform: [{ translateY }],
                  backgroundColor: 'white',
                  borderRadius: 34,
                }}
              >
                <Image
                  source={{ uri: item.poster }}
                  style={styles.posterImage}
                />
                <Text style={{ fontSize: 24 }} numberOfLines={1}>
                  {item.title}
                </Text>
                <View style={styles.rating}>
                  <Text style={styles.ratingNumber}>{item.rating / 2}</Text>
                </View>
                <Text style={{ fontSize: 12 }} numberOfLines={3}>
                  {item.description}
                </Text>
              </Animated.View>
            </View>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  posterImage: {
    width: '100%',
    height: ITEM_SIZE * 1.2,
    resizeMode: 'cover',
    borderRadius: 24,
    margin: 0,
    marginBottom: 10,
  },
  ratingNumber: { marginRight: 4, fontFamily: 'Menlo', fontSize: 14 },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4
  },
});


export default App;