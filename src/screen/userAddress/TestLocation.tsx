import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import axios from 'axios';

const TestLocation = () => {
  useEffect(() => {
    console.log('mount');

    axios
      .get('https://jsonplaceholder.typicode.com/posts/1')
      .then(res => {
        console.log('AXIOS RESPONSE:', res.data);
      })
      .catch(err => {
        console.log('AXIOS ERROR:', err);
      });
  }, []);
  return (
    <View>
      <Text>TestLocation</Text>
    </View>
  );
};

export default TestLocation;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
