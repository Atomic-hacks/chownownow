import { router } from "expo-router";
import { Button, Text, View } from "react-native";

const SignIn = () => {
  return (
    <View>
      <Text>sign-in</Text>
      <Button title="Sign In" onPress={() => router.push("/")} />
    </View>
  );
};

export default SignIn;
