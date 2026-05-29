import { router } from 'expo-router';
import { View, Text, StyleSheet, Pressable } from 'react-native';

export default function ServiceScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Service Screen</Text>
            <Pressable
                onPress={() => router.push("/service/ServiceDetail")}
                style={styles.button}
            >
                <Text style={{color:'white'}} >go to service details</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    button:{
        padding:30,
        backgroundColor:'green'
    },
    container: {
        flex: 1,                 // take full screen
        justifyContent: 'center', // vertical center
        alignItems: 'center',     // horizontal center
        borderWidth: 2,
    },
    text: {
        textAlign: 'center',
    },
});