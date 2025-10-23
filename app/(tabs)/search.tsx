import seed from "@/lib/seed";
import React from "react";
import { Button, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const search = () => {
  return (
    <SafeAreaView>
      <Text>search</Text>
      <Button
        title="seed"
        onPress={() =>
          seed().catch((error) => console.log("failed to seed", error))
        }
      />
    </SafeAreaView>
  );
};

export default search;
