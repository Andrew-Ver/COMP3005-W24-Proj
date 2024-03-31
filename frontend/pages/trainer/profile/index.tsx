import React, { useState } from "react";
import { Box, Button, Group, TextInput, Text } from "@mantine/core";

type FormValues = {
    rateperhour: string;
};

export default function Profile() {
    return (
        <Text>Show the trainer's profile (rate per hour)</Text>
    );
}
