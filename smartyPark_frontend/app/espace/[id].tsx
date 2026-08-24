import React from 'react';
import { Redirect, useLocalSearchParams } from 'expo-router';

export default function DeprecatedEspaceRedirect() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <Redirect href={`/espaces/${id}`} />;
}
